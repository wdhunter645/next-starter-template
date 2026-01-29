#!/usr/bin/env bash
set -euo pipefail

#
# D1 Row Count Report Script
#
# Usage:
#   ./scripts/d1-report.sh [local|production]
#
# Generates a row count report for all tables in D1 database
#

ENV="${1:-local}"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  D1 Row Count Report                                           ║"
echo "║  Environment: ${ENV}                                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Get list of tables
if [ "$ENV" = "local" ]; then
  TABLES=$(npx wrangler d1 execute lgfc_lite --local --json \
    --command "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'd1_migrations%' AND name NOT LIKE '_cf_%' ORDER BY name" \
    | jq -r '.[0].results[].name' 2>/dev/null || echo "")
else
  TABLES=$(npx wrangler d1 execute lgfc_lite --env "$ENV" --json \
    --command "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'd1_migrations%' AND name NOT LIKE '_cf_%' ORDER BY name" \
    | jq -r '.[0].results[].name' 2>/dev/null || echo "")
fi

if [ -z "$TABLES" ]; then
  echo "❌ No tables found or unable to query database"
  exit 1
fi

echo "📊 Table Row Counts:"
echo "────────────────────────────────────────────────────────────────"
printf "%-40s %10s\n" "Table" "Rows"
echo "────────────────────────────────────────────────────────────────"

TOTAL_ROWS=0
MIN_THRESHOLD=15
TABLES_BELOW_MIN=0

for TABLE in $TABLES; do
  if [ "$ENV" = "local" ]; then
    COUNT=$(npx wrangler d1 execute lgfc_lite --local --json \
      --command "SELECT COUNT(*) as count FROM $TABLE" \
      | jq -r '.[0].results[0].count' 2>/dev/null || echo "0")
  else
    COUNT=$(npx wrangler d1 execute lgfc_lite --env "$ENV" --json \
      --command "SELECT COUNT(*) as count FROM $TABLE" \
      | jq -r '.[0].results[0].count' 2>/dev/null || echo "0")
  fi
  
  TOTAL_ROWS=$((TOTAL_ROWS + COUNT))
  
  # Check if below minimum threshold
  STATUS=""
  if [ "$COUNT" -lt "$MIN_THRESHOLD" ]; then
    STATUS=" ⚠️"
    TABLES_BELOW_MIN=$((TABLES_BELOW_MIN + 1))
  else
    STATUS=" ✅"
  fi
  
  printf "%-40s %10s%s\n" "$TABLE" "$COUNT" "$STATUS"
done

echo "────────────────────────────────────────────────────────────────"
printf "%-40s %10s\n" "TOTAL" "$TOTAL_ROWS"
echo "════════════════════════════════════════════════════════════════"
echo ""

if [ "$TABLES_BELOW_MIN" -gt 0 ]; then
  echo "⚠️  Warning: $TABLES_BELOW_MIN table(s) have fewer than $MIN_THRESHOLD rows"
  echo ""
fi

# Sample keys for important FK target tables
echo "🔑 Sample Keys (for FK reference validation):"
echo "────────────────────────────────────────────────────────────────"

SAMPLE_TABLES=("photos" "members" "weekly_matchups" "events" "faq_entries")

for TABLE in "${SAMPLE_TABLES[@]}"; do
  # Check if table exists in the database
  if echo "$TABLES" | grep -qw "$TABLE"; then
    echo ""
    echo "  📋 $TABLE (first 5 IDs):"
    if [ "$ENV" = "local" ]; then
      npx wrangler d1 execute lgfc_lite --local --json \
        --command "SELECT id FROM $TABLE LIMIT 5" \
        | jq -r '.[0].results[] | "     ID: \(.id)"' 2>/dev/null || echo "     (no data)"
    else
      npx wrangler d1 execute lgfc_lite --env "$ENV" --json \
        --command "SELECT id FROM $TABLE LIMIT 5" \
        | jq -r '.[0].results[] | "     ID: \(.id)"' 2>/dev/null || echo "     (no data)"
    fi
  fi
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
