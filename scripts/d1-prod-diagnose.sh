#!/usr/bin/env bash
set -euo pipefail
mkdir -p reports/d1
ts="$(date -u +%Y%m%dT%H%M%SZ)"
log="reports/d1/d1-prod-diagnose-$ts.log"

{
  echo "== wrangler =="
  npx wrangler --version

  echo
  echo "== wrangler.toml (D1 binding) =="
  sed -n '1,120p' wrangler.toml

  echo
  echo "== D1 list =="
  npx wrangler d1 list

  echo
  echo "== Tables in lgfc_lite (REMOTE) =="
  npx wrangler d1 execute lgfc_lite --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"

  echo
  echo "== Row counts (REMOTE) =="
  for t in join_requests join_email_log members login_attempts; do
    echo "-- $t"
    npx wrangler d1 execute lgfc_lite --remote --command "SELECT COUNT(*) AS count FROM $t;"
  done

} | tee "$log"

echo
echo "Saved log: $log"
