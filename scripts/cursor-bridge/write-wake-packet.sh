#!/usr/bin/env bash
# Write a wake packet for Cursor Local Bridge. Delivery only — does not launch Cursor.
set -euo pipefail

HOME_DIR="${LGFC_CURSOR_BRIDGE_HOME:-$HOME/lgfc-cursor-bridge}"
QUEUE="$HOME_DIR/queue"
mkdir -p "$QUEUE"
chmod 700 "$HOME_DIR" "$QUEUE" 2>/dev/null || true

ISSUE_NUMBER="${1:?issue number required}"
DELIVERY_ID="${2:-manual-$(date -u +%Y%m%dT%H%M%SZ)}"
EVENT_NAME="${3:-manual}"
ACTOR="${4:-unknown}"
RESUME_HINT="${5:-}"

PACKET="$QUEUE/${DELIVERY_ID}.json"
umask 077
cat >"$PACKET" <<EOF
{
  "schemaVersion": 1,
  "issueNumber": ${ISSUE_NUMBER},
  "deliveryId": $(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$DELIVERY_ID"),
  "eventName": $(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$EVENT_NAME"),
  "actor": $(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$ACTOR"),
  "resumeHint": $(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$RESUME_HINT"),
  "deliveredAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo "Wrote wake packet: $PACKET"
