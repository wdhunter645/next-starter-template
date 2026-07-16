#!/usr/bin/env bash
# Smoke/structure test for b2_d1_deletion_reconcile.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RECONCILE_SCRIPT="$REPO_ROOT/scripts/b2_d1_deletion_reconcile.sh"

echo "============================================"
echo "B2 → D1 Deletion Reconciliation Script Test"
echo "============================================"

echo "Test 1: Script exists and is executable..."
if [[ ! -x "$RECONCILE_SCRIPT" ]]; then
  echo "  ✗ FAILED: Script not found or not executable: $RECONCILE_SCRIPT"
  exit 1
fi
echo "  ✓ PASSED"

echo "Test 2: Bash syntax validation..."
if ! bash -n "$RECONCILE_SCRIPT"; then
  echo "  ✗ FAILED: Syntax errors in script"
  exit 1
fi
echo "  ✓ PASSED"

echo "Test 3: Environment variable validation..."
EXPECTED_VARS=(
  "B2_ENDPOINT"
  "B2_BUCKET"
  "B2_KEY_ID"
  "B2_APP_KEY"
  "D1_DATABASE_NAME"
  "CLOUDFLARE_API_TOKEN"
  "CLOUDFLARE_ACCOUNT_ID"
)
for var in "${EXPECTED_VARS[@]}"; do
  if ! grep -q "\"$var\"" "$RECONCILE_SCRIPT"; then
    echo "  ✗ FAILED: Script should validate $var"
    exit 1
  fi
done
echo "  ✓ PASSED"

echo "Test 4: Soft-retire policy (#2519)..."
if ! grep -q "is_matchup_eligible = -1" "$RECONCILE_SCRIPT"; then
  echo "  ✗ FAILED: Script should soft-retire with is_matchup_eligible = -1"
  exit 1
fi
if ! grep -q "PURGE_ELIGIBLE" "$RECONCILE_SCRIPT"; then
  echo "  ✗ FAILED: Script should mark PURGE_ELIGIBLE"
  exit 1
fi
if grep -qE 'DELETE[[:space:]]+FROM[[:space:]]+photos' "$RECONCILE_SCRIPT"; then
  echo "  ✗ FAILED: Script must not hard-delete photos rows"
  exit 1
fi
echo "  ✓ PASSED"

echo "Test 5: Empty B2 inventory fail-closed..."
if ! grep -q "refusing deletion reconciliation" "$RECONCILE_SCRIPT"; then
  echo "  ✗ FAILED: Script should refuse reconcile when B2 inventory is empty"
  exit 1
fi
echo "  ✓ PASSED"

echo "Test 6: DRY_RUN + strict mode..."
grep -q "DRY_RUN" "$RECONCILE_SCRIPT"
grep -q "set -euo pipefail" "$RECONCILE_SCRIPT"
echo "  ✓ PASSED"

echo "Test 7: Idempotent WHERE guard..."
if ! grep -q "is_matchup_eligible >= 0" "$RECONCILE_SCRIPT"; then
  echo "  ✗ FAILED: Retire UPDATE should guard with is_matchup_eligible >= 0"
  exit 1
fi
echo "  ✓ PASSED"

echo "Test 8: Active matchup repair + vote clear..."
if ! grep -q "Scanning active weekly_matchups" "$RECONCILE_SCRIPT"; then
  echo "  ✗ FAILED: Script should scan active matchups for excluded photos"
  exit 1
fi
if ! grep -q "DELETE FROM weekly_votes" "$RECONCILE_SCRIPT"; then
  echo "  ✗ FAILED: Script should clear weekly_votes when pair changes"
  exit 1
fi
if ! grep -q "UPDATE weekly_matchups SET photo_a_id" "$RECONCILE_SCRIPT"; then
  echo "  ✗ FAILED: Script should update weekly_matchups pair on repair"
  exit 1
fi
echo "  ✓ PASSED"

echo "Test 9: Findings outputs for Actions..."
if ! grep -q "has_findings=" "$RECONCILE_SCRIPT"; then
  echo "  ✗ FAILED: Script should emit has_findings to GITHUB_OUTPUT"
  exit 1
fi
if ! grep -q "repaired_matchups=" "$RECONCILE_SCRIPT"; then
  echo "  ✗ FAILED: Script should emit repaired_matchups"
  exit 1
fi
echo "  ✓ PASSED"

echo ""
echo "============================================"
echo "All tests PASSED ✓"
echo "============================================"
