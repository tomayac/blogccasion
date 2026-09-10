#!/usr/bin/env bash
#
# Install the Caddy map files that the Eleventy build generates.
#
# The maps are produced by caddy-legacymap.njk, caddy-tagrenames.njk and
# caddy-categorymap.njk, so they follow the posts and tags automatically. They
# land in _site/caddy/ and the deploy copies them to ~/caddy-staging/. Putting
# them into /etc/caddy needs root, which the deploy deliberately does not have,
# so run this by hand when the deploy log says the config changed.
#
# Validates before reloading, and leaves Caddy on the old config if the new one
# does not validate.

set -Eeuo pipefail

SRC="${SRC:-$HOME/caddy-staging}"
CADDY_DIR="${CADDY_DIR:-/etc/caddy}"
MAPS=(blogccasion-legacymap.caddy blogccasion-tagrenames.caddy blogccasion-categorymap.caddy)

for m in "${MAPS[@]}"; do
  [ -s "$SRC/$m" ] || { echo "missing $SRC/$m -- run a deploy first" >&2; exit 1; }
done

changed=0
for m in "${MAPS[@]}"; do
  if cmp -s "$SRC/$m" "$CADDY_DIR/$m"; then
    echo "    $m unchanged"
  else
    echo "==> $m differs:"
    diff -u "$CADDY_DIR/$m" "$SRC/$m" | sed -n '3,15p' || true
    changed=1
  fi
done

if [ "$changed" -eq 0 ]; then
  echo "Nothing to do."
  exit 0
fi

echo "==> installing"
for m in "${MAPS[@]}"; do
  sudo install -m 644 -o root -g root "$SRC/$m" "$CADDY_DIR/$m"
done

echo "==> validating"
if ! sudo caddy validate --config "$CADDY_DIR/Caddyfile" --adapter caddyfile >/tmp/caddy-validate.out 2>&1; then
  echo "!!! invalid config; Caddy is still running the previous one" >&2
  tail -5 /tmp/caddy-validate.out >&2
  exit 1
fi
echo "    valid"

echo "==> reloading caddy"
sudo systemctl reload caddy
sleep 2
systemctl is-active caddy
echo "Done."
