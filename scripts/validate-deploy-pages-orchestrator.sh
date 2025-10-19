#!/bin/bash
# Validation script for deploy-pages-orchestrator.sh
# This script tests the key features without actually running deployments

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/deploy-pages-orchestrator.sh"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Validating deploy-pages-orchestrator.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Script exists and is executable
echo -n "Test 1: Script exists and is executable... "
if [ -x "$SCRIPT_PATH" ]; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    exit 1
fi

# Test 2: Script has valid bash syntax
echo -n "Test 2: Script has valid bash syntax... "
if bash -n "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    exit 1
fi

# Test 3: Help flag works
echo -n "Test 3: Help flag works... "
OUTPUT=$(bash "$SCRIPT_PATH" --help 2>&1)
if echo "$OUTPUT" | grep -q "Usage:"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected 'Usage:' in output"
    exit 1
fi

# Test 4: Dry-run mode works
echo -n "Test 4: Dry-run mode works... "
OUTPUT=$(bash "$SCRIPT_PATH" --dry-run 2>&1)
if echo "$OUTPUT" | grep -q "DRY RUN"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected 'DRY RUN' in output"
    exit 1
fi

# Test 5: Dry-run shows expected workflow command
echo -n "Test 5: Dry-run shows workflow commands... "
OUTPUT=$(bash "$SCRIPT_PATH" --dry-run 2>&1)
if echo "$OUTPUT" | grep -q "gh workflow run pages-deploy.yml"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected 'gh workflow run pages-deploy.yml' in output"
    exit 1
fi

# Test 6: Dry-run mentions staging and production
echo -n "Test 6: Dry-run mentions staging and production... "
OUTPUT=$(bash "$SCRIPT_PATH" --dry-run 2>&1)
if echo "$OUTPUT" | grep -qi "staging" && echo "$OUTPUT" | grep -qi "production"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected both 'staging' and 'production' in output"
    exit 1
fi

# Test 7: Script contains required configuration
echo -n "Test 7: Script contains required configuration... "
if grep -q "lgfc-staging" "$SCRIPT_PATH" && grep -q "lgfc-prod" "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected 'lgfc-staging' and 'lgfc-prod' in script"
    exit 1
fi

# Test 8: Script checks for required secrets
echo -n "Test 8: Script checks for required secrets... "
if grep -q "CF_API_TOKEN" "$SCRIPT_PATH" && grep -q "CF_ACCOUNT_ID" "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected 'CF_API_TOKEN' and 'CF_ACCOUNT_ID' in script"
    exit 1
fi

# Test 9: Script has smoke check functionality
echo -n "Test 9: Script has smoke check functionality... "
if grep -q "smoke_check" "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected smoke check functionality in script"
    exit 1
fi

# Test 10: Documentation exists
echo -n "Test 10: Documentation exists... "
DOC_PATH="$SCRIPT_DIR/deploy-pages-orchestrator.md"
if [ -f "$DOC_PATH" ]; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected documentation at $DOC_PATH"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All validation tests passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✓ Script exists and is executable"
echo "  ✓ Bash syntax is valid"
echo "  ✓ Help flag works"
echo "  ✓ Dry-run mode works"
echo "  ✓ Workflow commands are correct"
echo "  ✓ Staging and production are configured"
echo "  ✓ Required configuration present"
echo "  ✓ Required secrets are checked"
echo "  ✓ Smoke check functionality present"
echo "  ✓ Documentation exists"
echo ""
