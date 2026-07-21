#!/usr/bin/env bash
# Install Cursor Local Bridge to ~/lgfc-cursor-bridge and enable systemd user service + watchdog timer.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HOME_DIR="${LGFC_CURSOR_BRIDGE_HOME:-$HOME/lgfc-cursor-bridge}"
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
WORKSPACE="${LGFC_CURSOR_BRIDGE_WORKSPACE:-$REPO_ROOT}"

mkdir -p "$HOME_DIR/queue" "$HOME_DIR/consumed" "$HOME_DIR/scripts" "$UNIT_DIR"
chmod 700 "$HOME_DIR" "$HOME_DIR/queue" "$HOME_DIR/consumed"

rsync -a --delete \
  --exclude 'install.sh' \
  "$REPO_ROOT/scripts/cursor-bridge/" "$HOME_DIR/scripts/" || {
  rm -rf "$HOME_DIR/scripts"
  mkdir -p "$HOME_DIR/scripts"
  cp -a "$REPO_ROOT/scripts/cursor-bridge/." "$HOME_DIR/scripts/"
}

cp "$REPO_ROOT/config/cursor-bridge/bridge.json" "$HOME_DIR/bridge.json"
if [[ -f "$REPO_ROOT/config/cursor-bridge/bridge.schema.json" ]]; then
  cp "$REPO_ROOT/config/cursor-bridge/bridge.schema.json" "$HOME_DIR/bridge.schema.json"
fi
chmod +x "$HOME_DIR/scripts/"*.sh "$HOME_DIR/scripts/"*.mjs 2>/dev/null || true

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
echo "Auth required before auto-start: cursor agent login (or CURSOR_API_KEY)"
echo "Status: node $HOME_DIR/scripts/bridge.mjs status"
echo "Disable reconciliation: set reconcileEnabled=false in $HOME_DIR/bridge.json"
echo "Disable watchdog: systemctl --user disable --now lgfc-cursor-bridge-watchdog.timer"
