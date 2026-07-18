#!/usr/bin/env bash
set -u

interval_minutes="${1:-5}"
case "$interval_minutes" in
  2|3|4|5|6|7|8|9|10|11|12) ;;
  *) echo "interval must be an integer from 2 through 12" >&2; exit 2 ;;
esac

while true; do
  output="$(node "$(dirname "$0")/poll-github.mjs" 2>&1)"
  status=$?
  printf 'AGENT_LOOP_TICK_github_poll %s\n' "$output"
  if [ "$status" -ne 0 ]; then
    printf 'AGENT_LOOP_ERROR_github_poll status=%s\n' "$status" >&2
  fi
  sleep "$((interval_minutes * 60))"
done
