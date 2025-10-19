#!/bin/bash
# Validation script for deployment orchestrator setup
# Checks all prerequisites without triggering deployments

set -u  # Only error on undefined variables, not on command failures

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Deployment Setup Validator${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PASS=0
FAIL=0
WARN=0

check() {
    local message="$1"
    local command="$2"
    
    echo -n "Checking $message... "
    
    if eval "$command" &>/dev/null; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAIL++))
        return 0  # Don't exit on failure
    fi
}

check_warn() {
    local message="$1"
    local command="$2"
    
    echo -n "Checking $message... "
    
    if eval "$command" &>/dev/null; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${YELLOW}⚠ WARN${NC}"
        ((WARN++))
        return 0  # Don't exit on warning
    fi
}

# Check required tools
echo -e "${YELLOW}Required Tools:${NC}"
check "GitHub CLI (gh)" "command -v gh"
check "curl" "command -v curl"
check "jq" "command -v jq"
check "bash version 4+" "[ ${BASH_VERSINFO[0]} -ge 4 ]"
echo ""

# Check GitHub CLI authentication
echo -e "${YELLOW}GitHub Authentication:${NC}"
if check "GitHub CLI authenticated" "gh auth status"; then
    USER=$(gh api user --jq .login 2>/dev/null)
    echo "  Authenticated as: $USER"
else
    echo "  Run: gh auth login"
fi
echo ""

# Check repository structure
echo -e "${YELLOW}Repository Structure:${NC}"
check "deploy.yml workflow exists" "test -f .github/workflows/deploy.yml"
check "manual-deploy.yml workflow exists" "test -f .github/workflows/manual-deploy.yml"
check "deploy-orchestrator.sh exists" "test -f scripts/deploy-orchestrator.sh"
check "deploy-orchestrator.sh is executable" "test -x scripts/deploy-orchestrator.sh"
check "smoke.sh exists" "test -f scripts/smoke.sh"
echo ""

# Check workflow configuration
echo -e "${YELLOW}Workflow Configuration:${NC}"
if test -f .github/workflows/deploy.yml; then
    check "deploy.yml has workflow_dispatch" "grep -q 'workflow_dispatch:' .github/workflows/deploy.yml"
    check "deploy.yml has environment input" "grep -q 'environment:' .github/workflows/deploy.yml"
    check "deploy.yml has staging option" "grep -q 'staging' .github/workflows/deploy.yml"
    check "deploy.yml has production option" "grep -q 'production' .github/workflows/deploy.yml"
fi
echo ""

# Check for required secrets (if gh is authenticated)
if gh auth status &>/dev/null; then
    echo -e "${YELLOW}Repository Secrets:${NC}"
    REPO="wdhunter645/next-starter-template"
    
    if gh secret list -R "$REPO" &>/dev/null; then
        check "CLOUDFLARE_API_TOKEN exists" "gh secret list -R '$REPO' | grep -q '^CLOUDFLARE_API_TOKEN'"
        check "CLOUDFLARE_ACCOUNT_ID exists" "gh secret list -R '$REPO' | grep -q '^CLOUDFLARE_ACCOUNT_ID'"
        check "CLOUDFLARE_PROJECT_NAME exists" "gh secret list -R '$REPO' | grep -q '^CLOUDFLARE_PROJECT_NAME'"
        check_warn "CLOUDFLARE_STAGING_PROJECT_NAME exists" "gh secret list -R '$REPO' | grep -q '^CLOUDFLARE_STAGING_PROJECT_NAME'"
        check "OPENAI_API_KEY exists" "gh secret list -R '$REPO' | grep -q '^OPENAI_API_KEY'"
    else
        echo -e "${YELLOW}⚠ Cannot list secrets (requires proper permissions)${NC}"
        ((WARN++))
    fi
    echo ""
fi

# Check script syntax
echo -e "${YELLOW}Script Validation:${NC}"
check "deploy-orchestrator.sh syntax" "bash -n scripts/deploy-orchestrator.sh"
check "smoke.sh syntax" "bash -n scripts/smoke.sh"
echo ""

# Check documentation
echo -e "${YELLOW}Documentation:${NC}"
check "DEPLOYMENT_ORCHESTRATOR.md exists" "test -f docs/DEPLOYMENT_ORCHESTRATOR.md"
check "DEPLOYMENT_TEST_PLAN.md exists" "test -f docs/DEPLOYMENT_TEST_PLAN.md"
check "README mentions orchestrator" "grep -q 'deploy-orchestrator' README.md"
check "scripts/README mentions orchestrator" "grep -q 'deploy-orchestrator' scripts/README.md"
echo ""

# Test smoke test endpoints (non-blocking)
echo -e "${YELLOW}Smoke Test Endpoints (optional):${NC}"
echo "Testing staging endpoints..."
STAGING_HOME=$(curl -s -o /dev/null -w "%{http_code}" -L --connect-timeout 5 --max-time 10 "https://test.lougehrigfanclub.com/" 2>/dev/null || echo "000")
echo "  https://test.lougehrigfanclub.com/ → HTTP $STAGING_HOME"

STAGING_API=$(curl -s -o /dev/null -w "%{http_code}" -L --connect-timeout 5 --max-time 10 "https://test.lougehrigfanclub.com/api/supabase/status" 2>/dev/null || echo "000")
echo "  https://test.lougehrigfanclub.com/api/supabase/status → HTTP $STAGING_API"

echo "Testing production endpoints..."
PROD_HOME=$(curl -s -o /dev/null -w "%{http_code}" -L --connect-timeout 5 --max-time 10 "https://www.lougehrigfanclub.com/" 2>/dev/null || echo "000")
echo "  https://www.lougehrigfanclub.com/ → HTTP $PROD_HOME"

PROD_API=$(curl -s -o /dev/null -w "%{http_code}" -L --connect-timeout 5 --max-time 10 "https://www.lougehrigfanclub.com/api/supabase/status" 2>/dev/null || echo "000")
echo "  https://www.lougehrigfanclub.com/api/supabase/status → HTTP $PROD_API"
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Validation Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Passed: $PASS${NC}"
if [ $WARN -gt 0 ]; then
    echo -e "${YELLOW}Warnings: $WARN${NC}"
fi
if [ $FAIL -gt 0 ]; then
    echo -e "${RED}Failed: $FAIL${NC}"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}✗ Some validation checks failed${NC}"
    echo "Please fix the failed checks before running deployment orchestrator."
    exit 1
elif [ $WARN -gt 0 ]; then
    echo -e "${YELLOW}⚠ Some validation checks produced warnings${NC}"
    echo "These are optional but recommended. Deployment may still work."
    exit 0
else
    echo -e "${GREEN}✅ All validation checks passed!${NC}"
    echo ""
    echo "You're ready to run the deployment orchestrator:"
    echo "  ./scripts/deploy-orchestrator.sh"
    exit 0
fi
