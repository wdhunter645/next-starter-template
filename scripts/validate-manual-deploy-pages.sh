#!/bin/bash
# Validation script for manual-deploy-pages.sh
# This script tests the key features without actually running deployments

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/manual-deploy-pages.sh"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Validating manual-deploy-pages.sh"
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

# Test 3: Script validates credentials
echo -n "Test 3: Script validates credentials... "
if grep -q "test -n.*CF_API_TOKEN" "$SCRIPT_PATH" && grep -q "test -n.*CF_ACCOUNT_ID" "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected credential validation in script"
    exit 1
fi

# Test 4: Script exits on missing credentials
echo -n "Test 4: Script exits on missing credentials... "
OUTPUT=$(bash "$SCRIPT_PATH" 2>&1 || true)
if echo "$OUTPUT" | grep -q "CF_API_TOKEN missing"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected 'CF_API_TOKEN missing' in output"
    exit 1
fi

# Test 5: Script includes build steps
echo -n "Test 5: Script includes build steps... "
if grep -q "npm ci" "$SCRIPT_PATH" && grep -q "npm run build" "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected build commands in script"
    exit 1
fi

# Test 6: Script includes next-on-pages build
echo -n "Test 6: Script includes next-on-pages build... "
if grep -q "@cloudflare/next-on-pages" "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected '@cloudflare/next-on-pages' in script"
    exit 1
fi

# Test 7: Script verifies build output
echo -n "Test 7: Script verifies build output... "
if grep -q "\.vercel/output/static" "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected build output verification in script"
    exit 1
fi

# Test 8: Script creates Pages projects
echo -n "Test 8: Script creates Pages projects... "
if grep -q "wrangler pages project create lgfc-staging" "$SCRIPT_PATH" && \
   grep -q "wrangler pages project create lgfc-prod" "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected Pages project creation commands in script"
    exit 1
fi

# Test 9: Script deploys to both environments
echo -n "Test 9: Script deploys to both environments... "
if grep -q "wrangler pages deploy.*lgfc-staging" "$SCRIPT_PATH" && \
   grep -q "wrangler pages deploy.*lgfc-prod" "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected deployment commands for both environments"
    exit 1
fi

# Test 10: Script extracts deployment URLs
echo -n "Test 10: Script extracts deployment URLs... "
if grep -q "wrangler pages deployment list.*--format json" "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected URL extraction commands in script"
    exit 1
fi

# Test 11: Script includes smoke checks
echo -n "Test 11: Script includes smoke checks... "
if grep -q "/api/healthz" "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected health check endpoint in script"
    exit 1
fi

# Test 12: Script has proper exit codes
echo -n "Test 12: Script has proper exit codes... "
if grep -q "exit 11" "$SCRIPT_PATH" && grep -q "exit 23" "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected exit codes 11 and 23 in script"
    exit 1
fi

# Test 13: Script calls orchestrator
echo -n "Test 13: Script calls orchestrator... "
if grep -q "deploy-pages-orchestrator.sh" "$SCRIPT_PATH"; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected orchestrator call in script"
    exit 1
fi

# Test 14: Documentation exists
echo -n "Test 14: Documentation exists... "
DOC_PATH="$SCRIPT_DIR/README_MANUAL_DEPLOY.md"
if [ -f "$DOC_PATH" ]; then
    echo "✓ PASS"
else
    echo "✗ FAIL"
    echo "Expected documentation at $DOC_PATH"
    exit 1
fi

# Test 15: Script passes shellcheck (if available)
echo -n "Test 15: Script passes shellcheck... "
if command -v shellcheck >/dev/null 2>&1; then
    if shellcheck "$SCRIPT_PATH" >/dev/null 2>&1; then
        echo "✓ PASS"
    else
        echo "✗ FAIL"
        echo "Shellcheck found issues"
        exit 1
    fi
else
    echo "⊘ SKIP (shellcheck not installed)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All validation tests passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✓ Script exists and is executable"
echo "  ✓ Bash syntax is valid"
echo "  ✓ Credential validation present"
echo "  ✓ Exits on missing credentials"
echo "  ✓ Build steps included"
echo "  ✓ Cloudflare Pages build step included"
echo "  ✓ Build output verification present"
echo "  ✓ Pages project creation included"
echo "  ✓ Deployments to both environments"
echo "  ✓ URL extraction included"
echo "  ✓ Smoke checks included"
echo "  ✓ Proper exit codes"
echo "  ✓ Orchestrator call included"
echo "  ✓ Documentation exists"
echo "  ✓ Shellcheck passed (if available)"
echo ""
