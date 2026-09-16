#!/usr/bin/env bash
#
# Deploy blog.tomayac.com from GitHub, but only when there is something new.
#
# Safe to run every few minutes from cron: the common case is one `git fetch`,
# one request to the live site, and an early exit. Nothing touches the live site unless a fresh build has
# been produced and sanity-checked first, so a failure anywhere leaves the
# currently published site exactly as it was.
#
# Lives outside the repo on purpose. The deploy does `git reset --hard`, and
# bash reads a script incrementally while running it, so a script inside the
# repo could be rewritten underneath itself mid-run.
#
# Usage:  deploy-blog.sh [--force] [--dry-run]
#   --force    rebuild and republish even if the commit is already deployed
#   --dry-run  do everything except copying the new build into the web root

set -Eeuo pipefail

REPO="${REPO:-$HOME/Documents/blogccasion}"
WEBROOT="${WEBROOT:-/var/www/blog}" # must match `root` in Caddy's (blogccasion) snippet
SITE_URL="${SITE_URL:-https://blog.tomayac.com}"
VERSION_FILE="deploy-version.txt" # published with the commit hash, to check what is live
BRANCH="${BRANCH:-main}"
LOG="${LOG:-$HOME/Documents/deploy-blog.log}"
STATE="${STATE:-$HOME/.cache/deploy-blog.sha}"
LOCK="${LOCK:-$HOME/.cache/deploy-blog.lock}"
MIN_PAGES="${MIN_PAGES:-500}" # a healthy build is ~675 files; well under that means something broke
CADDY_DIR="${CADDY_DIR:-/etc/caddy}"          # where the generated map files belong
CADDY_STAGE="${CADDY_STAGE:-$HOME/caddy-staging}" # where this script leaves them for you
DRIFTMARK="${DRIFTMARK:-$HOME/.cache/deploy-blog.caddy-drift}"
NOTIFY="${NOTIFY:-steiner.thomas@gmail.com}" # empty string disables email
FAILMARK="${FAILMARK:-$HOME/.cache/deploy-blog.failing}"
FORCE=0
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --dry-run) DRY_RUN=1 ;;
    *) echo "unknown option: $arg" >&2; exit 64 ;;
  esac
done

mkdir -p "$(dirname "$LOG")" "$(dirname "$STATE")"

log() { printf '%s  %s\n' "$(date -u '+%Y-%m-%d %H:%M:%SZ')" "$*" >>"$LOG"; }
say() { log "$*"; [ -t 1 ] && printf '%s\n' "$*" || true; }
# Mail is sent on the transition into failure and again on recovery, never on
# every run: cron fires every five minutes and a stuck deploy would otherwise
# send 288 identical mails a day.
mail_out() {
  [ -n "$NOTIFY" ] || return 0
  command -v sendmail >/dev/null 2>&1 || { log "note: no sendmail; cannot email"; return 0; }
  {
    printf 'To: %s\n' "$NOTIFY"
    printf 'From: blog-deploy@%s\n' "$(hostname -f 2>/dev/null || hostname)"
    printf 'Subject: %s\n' "$1"
    printf 'Content-Type: text/plain; charset=utf-8\n\n'
    printf '%s\n' "$2"
  } | sendmail -t >>"$LOG" 2>&1 || log "note: sending mail failed"
}

# Failures also go to stderr so cron surfaces them (log has the detail).
die() {
  say "FAILED: $*"
  printf 'deploy-blog: FAILED: %s (see %s)\n' "$*" "$LOG" >&2
  if [ ! -f "$FAILMARK" ]; then
    printf '%s\n%s\n' "$(date -u '+%Y-%m-%d %H:%M:%SZ')" "$*" >"$FAILMARK"
    mail_out "blog deploy FAILED on $(hostname -s)" \
"The blog deploy failed. $([ "$published" -eq 1 ] && echo "The build was already copied to $WEBROOT." || echo "The live site was left untouched.")

  what:   $*
  when:   $(date -u '+%Y-%m-%d %H:%M:%SZ')
  host:   $(hostname -f 2>/dev/null || hostname)
  commit: ${remote_sha:-unknown}

Last 40 log lines:

$(tail -40 "$LOG" 2>/dev/null)

Retries every 5 minutes. You will get one more mail when it recovers."
  else
    log "still failing; mail already sent at $(head -1 "$FAILMARK")"
  fi
  exit 1
}

published=0 # so the abort message can tell you whether the site changed
trap 's=$?; [ $s -ne 0 ] && say "ABORTED at line $LINENO (exit $s); $([ "$published" -eq 1 ] && echo "site was already (partly) published" || echo "live site untouched")"; exit $s' ERR

# Keep the log from growing without bound.
if [ -f "$LOG" ] && [ "$(wc -c <"$LOG")" -gt 2000000 ]; then
  tail -c 500000 "$LOG" >"$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi

# Only one deploy at a time. A second run just leaves quietly.
exec 9>"$LOCK"
if ! flock -n 9; then
  log "another deploy is already running; skipping"
  exit 0
fi

# nvm's node is not on cron's PATH. Pick the highest installed version.
NVM_BIN="$(ls -d "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -1 || true)"
[ -n "$NVM_BIN" ] && PATH="$NVM_BIN:$PATH"
export PATH
command -v node >/dev/null || die "node not found (looked in $HOME/.nvm/versions/node/*/bin)"
command -v rsync >/dev/null || die "rsync not found"
command -v curl >/dev/null || die "curl not found"
[ -d "$WEBROOT" ] && [ -w "$WEBROOT" ] || die "web root $WEBROOT is missing or not writable"

cd "$REPO" || die "repo not found at $REPO"

# --- Is there anything to do? -----------------------------------------------
git fetch --quiet --prune origin "$BRANCH" || die "git fetch failed"
remote_sha="$(git rev-parse "origin/$BRANCH")"
deployed_sha="$(cat "$STATE" 2>/dev/null || echo none)"

# What the site actually serves, as opposed to what this script last wrote.
# They differ when the web server's root has moved away from $WEBROOT.
live_sha() { curl -fsS --max-time 20 "$SITE_URL/$VERSION_FILE?t=$(date +%s)" 2>/dev/null | head -c 64 || true; }
live="$(live_sha)"

if [ "$FORCE" -eq 0 ] && [ "$deployed_sha" = "$remote_sha" ] && [ -f "$WEBROOT/index.html" ]; then
  if [ "$live" = "$remote_sha" ]; then
    log "up to date at ${remote_sha:0:9}; nothing to do"
    exit 0
  fi
  say "last published ${remote_sha:0:9}, but $SITE_URL serves '${live:0:9}'; publishing again"
fi

say "deploying ${remote_sha:0:9} (was ${deployed_sha:0:9})"

# --- Build ------------------------------------------------------------------
# `reset --hard` plus `clean -fd` discards the churn a build leaves behind.
# `clean` without -x keeps node_modules, which is gitignored.
git reset --quiet --hard "origin/$BRANCH" || die "git reset failed"
git clean -qfd || die "git clean failed"

npm ci --no-audit --no-fund >>"$LOG" 2>&1 || die "npm ci failed (see $LOG)"
npm run clean >>"$LOG" 2>&1 || die "npm run clean failed"
npm run build >>"$LOG" 2>&1 || die "npm run build failed (see $LOG)"

# --- Sanity-check the build before it is allowed near the web root ----------
[ -s "$REPO/_site/index.html" ] || die "build produced no index.html"
[ -d "$REPO/_site/pagefind" ] || die "build produced no pagefind index"
[ -s "$REPO/_site/feed/feed.xml" ] || die "build produced no feed"
pages="$(find "$REPO/_site" -name '*.html' | wc -l)"
[ "$pages" -ge "$MIN_PAGES" ] || die "only $pages HTML files built, expected >= $MIN_PAGES"
say "build ok: $pages HTML files"
printf '%s\n' "$remote_sha" >"$REPO/_site/$VERSION_FILE"

if [ "$DRY_RUN" -eq 1 ]; then
  say "dry run: not publishing"
  exit 0
fi

# --- Publish ----------------------------------------------------------------
# Copy straight into the web root. Swapping in a staged directory by rename
# would be atomic, but needs write access to the root-owned parent (/var/www).
# `--delay-updates` writes every changed file to a temporary name first and
# renames them all at the end, and `--delete-after` removes stale files only
# once the new ones are in place, so the half-updated window is a fraction of
# a second.
# `caddy/` holds generated server config, not site content: keep it out of the
# published tree so it is not downloadable.
# Content-hashed assets (`main.0123456789.css`, see _11ty/hashAssets.js) that
# this build no longer has are protected from the delete: a page loaded before
# the deploy still asks for them, for example when it lazily imports a module.
# They are pruned a week later, below.
hex='[0-9a-f]'
hashed_glob="*.$hex$hex$hex$hex$hex$hex$hex$hex$hex$hex.*"
published=1
rsync -a --delete-after --delay-updates --exclude '/caddy/' \
  --filter "P /js/**$hashed_glob" --filter "P /css/**$hashed_glob" \
  --filter "P /static/**$hashed_glob" --filter "P /fonts/**$hashed_glob" \
  "$REPO/_site/" "$WEBROOT/" \
  || die "rsync to $WEBROOT failed; the live site may be partially updated"
[ -s "$WEBROOT/index.html" ] || die "web root is missing index.html after rsync"
say "published ${remote_sha:0:9} to $WEBROOT ($pages pages)"

# Make sure the site now serves this commit. Catches the web server's root
# pointing somewhere other than $WEBROOT, which would otherwise look like a
# successful deploy.
live="$(live_sha)"
[ "$live" = "$remote_sha" ] \
  || die "$SITE_URL/$VERSION_FILE serves '${live:-nothing}', expected $remote_sha; does Caddy's root still point at $WEBROOT?"
echo "$remote_sha" >"$STATE"
say "verified $SITE_URL serves ${remote_sha:0:9}"

# Hashed assets that left the build over a week ago. rsync gives files that
# are still in the build a fresh mtime on every deploy, so age alone would
# work, but checking the build too means a long pause between deploys can
# never remove anything the site still uses.
pruned=0
while IFS= read -r -d '' old; do
  [ -e "$REPO/_site/${old#"$WEBROOT"/}" ] && continue
  rm -f "$old" && pruned=$((pruned + 1))
done < <(find "$WEBROOT/js" "$WEBROOT/css" "$WEBROOT/static" "$WEBROOT/fonts" \
  -type f -mtime +7 -regextype posix-extended \
  -regex '.*\.[0-9a-f]{10}\.[^./]+' -print0 2>/dev/null || true)
[ "$pruned" -eq 0 ] || say "pruned $pruned hashed assets no longer in the build"

# The build regenerates Caddy's map files. Installing them needs root, which
# this script does not have, so leave them ready and say so. Mailed once per
# distinct change, keyed on a fingerprint of the generated files: re-running
# while the same change is still uninstalled stays quiet, a further change
# mails again, and installing clears the state.
if [ -d "$REPO/_site/caddy" ]; then
  mkdir -p "$CADDY_STAGE"
  cp -f "$REPO"/_site/caddy/*.caddy "$CADDY_STAGE/" 2>/dev/null || true

  drifted=""
  for f in "$REPO"/_site/caddy/*.caddy; do
    name="$(basename "$f")"
    cmp -s "$f" "$CADDY_DIR/$name" || drifted="$drifted $name"
  done

  if [ -z "$drifted" ]; then
    rm -f "$DRIFTMARK"
  else
    say "Caddy config changed:$drifted -- run deploy/install-caddy-maps.sh to apply"
    fingerprint="$(cat "$REPO"/_site/caddy/*.caddy | sha256sum | cut -d" " -f1)"
    if [ "$(cat "$DRIFTMARK" 2>/dev/null || true)" = "$fingerprint" ]; then
      log "same Caddy change as before; mail already sent"
    else
      changes=""
      for name in $drifted; do
        changes="$changes
--- $name
$(diff -u "$CADDY_DIR/$name" "$CADDY_STAGE/$name" 2>/dev/null | tail -n +3 | grep -E '^[+-]' | head -30 || true)"
      done
      mail_out "blog: Caddy redirects need installing on $(hostname -s)" \
"The build generated new Caddy redirect maps. The site itself is published
and fine; only the redirects are waiting.

Until you install them, requests to the changed old URLs keep hitting the
previous rules.

  changed: $drifted
  commit:  ${remote_sha:0:9}
  when:    $(date -u '+%Y-%m-%d %H:%M:%SZ')

To apply, on the server:

  ~/Documents/blogccasion/deploy/install-caddy-maps.sh

It shows a diff, installs, validates, and reloads Caddy, and leaves the
previous config in place if validation fails. It asks for your sudo
password.
$changes

(Truncated to 30 lines per file. Full files: $CADDY_STAGE)"
      printf '%s\n' "$fingerprint" >"$DRIFTMARK"
      say "mailed the Caddy change to $NOTIFY"
    fi
  fi
fi

# Sending webmentions is a courtesy to other sites, not part of publishing.
# Never let it fail the deploy.
if ! npm run webmentions >>"$LOG" 2>&1; then
  say "note: webmentions step failed (site is published regardless)"
fi

if [ -f "$FAILMARK" ]; then
  mail_out "blog deploy recovered on $(hostname -s)" \
"The blog deploy is working again.

  published: ${remote_sha:0:9} ($pages pages)
  when:      $(date -u '+%Y-%m-%d %H:%M:%SZ')

It had been failing since $(head -1 "$FAILMARK") with:
  $(tail -1 "$FAILMARK")"
  rm -f "$FAILMARK"
  say "recovered; recovery mail sent"
fi

say "done"
