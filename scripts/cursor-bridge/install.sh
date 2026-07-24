#!/usr/bin/env bash
# Install Cursor Local Bridge to ~/lgfc-cursor-bridge and enable systemd user service + watchdog timer.
# Preserves queue/, consumed/, claim, in-flight, heartbeat, runtime-meta, and log evidence.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HOME_DIR="${LGFC_CURSOR_BRIDGE_HOME:-$HOME/lgfc-cursor-bridge}"
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
WORKSPACE="${LGFC_CURSOR_BRIDGE_WORKSPACE:-$REPO_ROOT}"

mkdir -p "$HOME_DIR/queue" "$HOME_DIR/consumed" "$HOME_DIR/scripts" "$UNIT_DIR"
chmod 700 "$HOME_DIR" "$HOME_DIR/queue" "$HOME_DIR/consumed"

# Package scripts only — never delete runtime evidence directories.
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete \
    --exclude 'install.sh' \
    "$REPO_ROOT/scripts/cursor-bridge/" "$HOME_DIR/scripts/"
else
  rm -rf "$HOME_DIR/scripts"
  mkdir -p "$HOME_DIR/scripts"
  cp -a "$REPO_ROOT/scripts/cursor-bridge/." "$HOME_DIR/scripts/"
fi

cp "$REPO_ROOT/config/cursor-bridge/bridge.json" "$HOME_DIR/bridge.json"
for schema in "$REPO_ROOT"/config/cursor-bridge/*.schema.json; do
  cp "$schema" "$HOME_DIR/$(basename "$schema")"
done
chmod +x "$HOME_DIR/scripts/"*.sh "$HOME_DIR/scripts/"*.mjs 2>/dev/null || true
chmod +x "$HOME_DIR/scripts/lib/"*.mjs 2>/dev/null || true

SOURCE_COMMIT="$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo unknown)"
export LGFC_CURSOR_BRIDGE_HOME="$HOME_DIR"
export LGFC_BRIDGE_SOURCE_COMMIT="$SOURCE_COMMIT"
node --input-type=module <<EOF
import fs from 'node:fs';
import {
  computeInstalledManifest,
  writeInstalledIdentity,
} from 'file://$HOME_DIR/scripts/lib/package-identity.mjs';

const home = process.env.LGFC_CURSOR_BRIDGE_HOME;
const sourceCommit = process.env.LGFC_BRIDGE_SOURCE_COMMIT || null;
const config = JSON.parse(fs.readFileSync(home + '/bridge.json', 'utf8'));
const manifest = computeInstalledManifest(home, sourceCommit);
if (manifest.ok) {
  writeInstalledIdentity(config, {
    sourceCommit,
    packageHash: manifest.packageHash,
    files: manifest.files,
  });
  console.log('package-identity recorded', String(manifest.packageHash).slice(0, 12));
} else {
  console.warn('package-identity deferred:', manifest.reason, (manifest.missing || []).join(','));
}
EOF

cat >"$UNIT_DIR/lgfc-cursor-bridge.service" <<EOF
[Unit]
Description=LGFC Cursor Local Bridge (wake packet consumer)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
Environment=LGFC_CURSOR_BRIDGE_HOME=%h/lgfc-cursor-bridge
Environment=LGFC_CURSOR_BRIDGE_WORKSPACE=${WORKSPACE}
Environment=PATH=%h/.local/bin:/usr/local/bin:/usr/bin:/bin
WorkingDirectory=%h/lgfc-cursor-bridge
ExecStart=/usr/bin/node %h/lgfc-cursor-bridge/scripts/bridge.mjs watch
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
EOF

cat >"$UNIT_DIR/lgfc-cursor-bridge-watchdog.service" <<EOF
[Unit]
Description=LGFC Cursor Local Bridge watchdog (local health check)
After=lgfc-cursor-bridge.service

[Service]
Type=oneshot
Environment=LGFC_CURSOR_BRIDGE_HOME=%h/lgfc-cursor-bridge
Environment=LGFC_CURSOR_BRIDGE_WORKSPACE=${WORKSPACE}
Environment=PATH=%h/.local/bin:/usr/local/bin:/usr/bin:/bin
WorkingDirectory=%h/lgfc-cursor-bridge
ExecStart=/usr/bin/node %h/lgfc-cursor-bridge/scripts/watchdog.mjs check
EOF

cat >"$UNIT_DIR/lgfc-cursor-bridge-watchdog.timer" <<EOF
[Unit]
Description=Run LGFC Cursor Local Bridge watchdog every minute

[Timer]
OnBootSec=1min
OnUnitActiveSec=1min
AccuracySec=15s
Unit=lgfc-cursor-bridge-watchdog.service

[Install]
WantedBy=timers.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now lgfc-cursor-bridge.service
systemctl --user enable --now lgfc-cursor-bridge-watchdog.timer
systemctl --user --no-pager status lgfc-cursor-bridge.service || true
systemctl --user --no-pager status lgfc-cursor-bridge-watchdog.timer || true

echo "Installed bridge at $HOME_DIR"
echo "Service: lgfc-cursor-bridge.service"
echo "Watchdog timer: lgfc-cursor-bridge-watchdog.timer"
echo "Source commit: $SOURCE_COMMIT"
echo "Auth required before auto-start: cursor agent login (or CURSOR_API_KEY)"
echo "Status: node $HOME_DIR/scripts/bridge.mjs status"
echo "Watch: node $HOME_DIR/scripts/bridge-watch.mjs check"
echo "Build: node $HOME_DIR/scripts/bridge-build.mjs <immutable-main-sha>"
echo "Disable reconciliation: set reconcileEnabled=false in $HOME_DIR/bridge.json"
echo "Disable watchdog: systemctl --user disable --now lgfc-cursor-bridge-watchdog.timer"
