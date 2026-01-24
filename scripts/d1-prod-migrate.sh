#!/usr/bin/env bash
set -euo pipefail

#
# D1 Production Migration Script
#
# Usage:
#   ./scripts/d1-prod-migrate.sh
#
# Applies all pending migrations to the lgfc_lite database in production (remote).
# Generates a timestamped log file in reports/d1/ directory.
# Lists all tables after migration completes.
#

mkdir -p reports/d1
ts="$(date -u +%Y%m%dT%H%M%SZ)"
log="reports/d1/d1-prod-migrate-$ts.log"

{
  echo "== Applying migrations to lgfc_lite (REMOTE) =="
  npx wrangler d1 migrations apply lgfc_lite --remote

  echo
  echo "== Tables after migrate =="
  npx wrangler d1 execute lgfc_lite --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"

} | tee "$log"

echo "Saved log: $log"
