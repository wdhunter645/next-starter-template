#!/usr/bin/env bash
# LGFC Slack Notification Script
# Posts workflow status to Slack via Incoming Webhook
# Usage: slack_notify.sh <status> <workflow> <details>
# Requires: SLACK_WEBHOOK_URL environment variable

set -euo pipefail

# Validate required arguments
if [[ $# -lt 3 ]]; then
  echo "Error: Missing required arguments" >&2
  echo "Usage: $0 <status> <workflow> <details>" >&2
  exit 1
fi

status="$1"
workflow="$2"
details="$3"

# Validate webhook URL is set
if [[ -z "${SLACK_WEBHOOK_URL:-}" ]]; then
  echo "Error: SLACK_WEBHOOK_URL environment variable not set" >&2
  exit 1
fi

# Map status to icon and color
case "${status,,}" in
  success)
    icon="✅"
    color="good"
    ;;
  failure)
    icon="❌"
    color="danger"
    ;;
  cancelled)
    icon="⚠️"
    color="warning"
    ;;
  *)
    icon="⚠️"
    color="warning"
    ;;
esac

# Build JSON payload using heredoc to avoid escaping issues
# Use printf to ensure no trailing newline issues
payload=$(cat <<EOF
{
  "attachments": [
    {
      "color": "$color",
      "text": "$icon *${workflow}* completed with status: *${status}*\nDetails: ${details}\nRepo: ${GITHUB_REPOSITORY:-unknown}\nRun: ${GITHUB_RUN_NUMBER:-unknown}"
    }
  ]
}
EOF
)

# Post to Slack webhook
# -s: silent (no progress bar)
# -w: write HTTP status code
# -o: output response to /dev/null
http_code=$(curl -s -w "%{http_code}" -o /dev/null \
  -X POST \
  -H 'Content-type: application/json' \
  --data "$payload" \
  "$SLACK_WEBHOOK_URL")

# Validate response
if [[ "$http_code" != "200" ]]; then
  echo "Error: Slack webhook returned HTTP $http_code" >&2
  exit 1
fi

echo "Slack notification sent successfully (HTTP $http_code)"
exit 0
