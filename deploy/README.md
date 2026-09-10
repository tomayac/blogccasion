# Deploying blog.tomayac.com

The blog is built and published on the server that hosts it
(`tomayac@85.215.189.135`, Ubuntu 24.04, Caddy). Nothing here runs in CI.

## How a deploy happens

`deploy-blog.sh` runs from cron every 30 minutes:

```cron
*/30 * * * * /home/tomayac/bin/deploy-blog.sh >/dev/null
```

It fetches `origin/main`, compares it against the last commit it actually
published, and exits in about half a second when there is nothing new — which is
almost always. When something has changed it resets the checkout, runs `npm ci`
and `npm run build`, checks that the build looks sane, and only then swaps it
into `/var/www/html/blogccasion`.

If anything fails, the live site is left exactly as it was.

Run it by hand with `~/bin/deploy-blog.sh --force`, or `--dry-run` to build
without publishing.

## Why the script lives outside the repo

The deploy does `git reset --hard`, and bash reads a script incrementally while
running it, so a script inside the repo could be rewritten underneath itself
mid-run. The copy in `~/bin/` is what cron executes; the copy here is the
version-controlled original. After editing this one:

```sh
ssh tomayac 'cat > ~/bin/deploy-blog.sh && chmod +x ~/bin/deploy-blog.sh' < deploy/deploy-blog.sh
```

## Email on failure

The script mails `steiner.thomas@gmail.com` when a deploy starts failing and
again when it recovers, never on every run. It sends through `msmtp` using
`~/.msmtprc` on the server, which is a copy of the root `/etc/msmtprc` owned by
the `tomayac` user. That file holds an SMTP password and is deliberately **not**
in this repo.

Set `NOTIFY=""` in the script to turn email off and rely on the log at
`~/Documents/deploy-blog.log`.

## Git access

The server fetches over **HTTPS**, not SSH:

```
https://github.com/tomayac/blogccasion.git
```

The repo is public and a deploy only ever reads, so no credential is needed. The
server's SSH key has a passphrase, which is what used to make every deploy
prompt for it. It also means the server cannot push, which is the right
capability for a deploy target.

## Caddy

`caddy/` holds the blog's part of the server config, for reference and history.
The live files are root-owned:

| here                                  | on the server                                             |
| ------------------------------------- | --------------------------------------------------------- |
| `caddy/blogccasion.caddy`             | the `(blogccasion)` snippet inside `/etc/caddy/Caddyfile` |
| `caddy/blogccasion-tagrenames.caddy`  | `/etc/caddy/blogccasion-tagrenames.caddy`                 |
| `caddy/blogccasion-categorymap.caddy` | `/etc/caddy/blogccasion-categorymap.caddy`                |

The full `Caddyfile` is not here: it also configures unrelated sites.

Editing them means `sudo`, so validate before reloading — Caddy will happily
keep running the old config if you forget:

```sh
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile \
  && sudo systemctl reload caddy
```

`blogccasion-legacymap.caddy` (also on the server, not here) is generated from
the built `.htaccess_rewritemap.txt`, which `htaccess_rewritemap.njk` still
produces. Regenerate it if post permalinks ever change.

`blogccasion-tagrenames.caddy` and `blogccasion-categorymap.caddy` were
generated from the tag list on 2026-09-10. They are static: if tags get renamed
again, they need regenerating too. Teaching Eleventy to emit them the way it
emits `.htaccess_rewritemap.txt` would remove that footgun.

## Removed

`update_blog.sh` was the old manual deploy. It has no error handling — a failed
build still published — it deleted the live directory before the replacement
existed, and `npm i pagefind @pagefind/linux-x64` dirtied `package.json` on
every run, which is what the `git stash` line existed to work around. `npm ci`
resolves the Linux binary from the lockfile on its own.

`htaccess.njk` and `feed/htaccess.njk` were Apache config. The server has run
Caddy for a while, so they did nothing except get published as
`https://blog.tomayac.com/.htaccess` — Apache refuses to serve `.ht*` files,
Caddy has no such rule. They had also drifted out of sync with the Caddy config
they were supposed to mirror.
