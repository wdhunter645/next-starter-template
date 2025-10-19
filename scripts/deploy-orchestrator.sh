#!/bin/bash
# Deployment Orchestrator
# Automates staging and production deployment with smoke tests
#
# This script:
# 1. Validates required secrets exist
# 2. Deploys to staging via GitHub Actions
# 3. Smoke-tests staging deployment
# 4. Deploys to production via GitHub Actions
# 5. Smoke-tests production deployment
# 6. Posts summary comment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO="wdhunter645/next-starter-template"
WORKFLOW_FILE="deploy.yml"
STAGING_DOMAIN="test.lougehrigfanclub.com"
PRODUCTION_DOMAIN="www.lougehrigfanclub.com"
BRANCH="main"

# Arrays to store workflow run URLs and results
STAGING_RUN_URL=""
PRODUCTION_RUN_URL=""
STAGING_SUCCESS=false
PRODUCTION_SUCCESS=false

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Deployment Orchestrator${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 0: Preconditions - Check for required secrets
echo -e "${YELLOW}Step 0: Checking preconditions...${NC}"
echo ""

# Check if gh CLI is authenticated
if ! gh auth status &>/dev/null; then
    echo -e "${RED}✗ Error: GitHub CLI (gh) is not authenticated${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✓ GitHub CLI authenticated${NC}"

# Check if deploy.yml exists
if ! gh api "repos/$REPO/contents/.github/workflows/$WORKFLOW_FILE" &>/dev/null; then
    echo -e "${RED}✗ Error: .github/workflows/$WORKFLOW_FILE not found in repository${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Workflow file exists: .github/workflows/$WORKFLOW_FILE${NC}"

# Check for required secrets
echo "Checking repository secrets..."
REQUIRED_SECRETS=("CLOUDFLARE_API_TOKEN" "CLOUDFLARE_ACCOUNT_ID" "OPENAI_API_KEY")
MISSING_SECRETS=()

for secret in "${REQUIRED_SECRETS[@]}"; do
    # Note: GitHub API doesn't allow reading secret values, only listing names
    if gh secret list -R "$REPO" | grep -q "^$secret"; then
        echo -e "${GREEN}✓ Secret found: $secret${NC}"
    else
        echo -e "${RED}✗ Secret missing: $secret${NC}"
        MISSING_SECRETS+=("$secret")
    fi
done

if [ ${#MISSING_SECRETS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}✗ Error: Missing required secrets: ${MISSING_SECRETS[*]}${NC}"
    echo "Please add these secrets to the repository at:"
    echo "https://github.com/$REPO/settings/secrets/actions"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ All required secrets are configured${NC}"
echo ""

# Function to trigger workflow and get run ID
trigger_workflow() {
    local environment=$1
    local workflow_name=$2
    
    echo -e "${BLUE}Triggering workflow: $workflow_name${NC}"
    echo "Repository: $REPO"
    echo "Branch: $BRANCH"
    echo "Environment: $environment"
    echo ""
    
    # Trigger the workflow
    gh workflow run "$WORKFLOW_FILE" \
        -R "$REPO" \
        --ref "$BRANCH" \
        -f environment="$environment" \
        -f branch="$BRANCH"
    
    # Wait a few seconds for the run to be created
    sleep 5
    
    # Get the most recent workflow run ID
    RUN_ID=$(gh run list \
        -R "$REPO" \
        --workflow="$WORKFLOW_FILE" \
        --branch="$BRANCH" \
        --limit 1 \
        --json databaseId \
        --jq '.[0].databaseId')
    
    if [ -z "$RUN_ID" ]; then
        echo -e "${RED}✗ Error: Could not find workflow run${NC}"
        return 1
    fi
    
    RUN_URL="https://github.com/$REPO/actions/runs/$RUN_ID"
    echo -e "${GREEN}✓ Workflow triggered successfully${NC}"
    echo "Run ID: $RUN_ID"
    echo "Run URL: $RUN_URL"
    echo ""
    
    echo "$RUN_ID"
}

# Function to wait for workflow completion
wait_for_workflow() {
    local run_id=$1
    local workflow_name=$2
    
    echo -e "${YELLOW}Waiting for workflow to complete: $workflow_name${NC}"
    echo "Run ID: $run_id"
    echo ""
    
    local status=""
    local conclusion=""
    local max_wait=1800  # 30 minutes
    local elapsed=0
    local check_interval=15
    
    while [ $elapsed -lt $max_wait ]; do
        # Get workflow run status
        local run_info=$(gh run view "$run_id" -R "$REPO" --json status,conclusion)
        status=$(echo "$run_info" | jq -r '.status')
        conclusion=$(echo "$run_info" | jq -r '.conclusion')
        
        echo -n "Status: $status"
        if [ "$status" = "completed" ]; then
            echo " | Conclusion: $conclusion"
            break
        fi
        echo " | Elapsed: ${elapsed}s"
        
        sleep $check_interval
        elapsed=$((elapsed + check_interval))
    done
    
    echo ""
    
    if [ $elapsed -ge $max_wait ]; then
        echo -e "${RED}✗ Error: Workflow timed out after ${max_wait}s${NC}"
        return 1
    fi
    
    if [ "$conclusion" != "success" ]; then
        echo -e "${RED}✗ Error: Workflow failed with conclusion: $conclusion${NC}"
        echo ""
        echo "Fetching error logs..."
        
        # Get the first error line from failed jobs
        local error_log=$(gh run view "$run_id" -R "$REPO" --log-failed 2>&1 | head -50)
        echo "$error_log"
        
        return 1
    fi
    
    echo -e "${GREEN}✓ Workflow completed successfully${NC}"
    echo ""
    return 0
}

# Function to smoke-test a deployment
smoke_test_deployment() {
    local domain=$1
    local environment_name=$2
    
    echo -e "${YELLOW}Step: Smoke-testing $environment_name deployment${NC}"
    echo "Domain: $domain"
    echo ""
    
    local urls=("/" "/api/supabase/status")
    local all_passed=true
    
    # First, check for healthz or _health endpoint
    local health_endpoint=""
    for endpoint in "/_health" "/api/healthz"; do
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" -L --connect-timeout 10 --max-time 30 "https://$domain$endpoint" 2>/dev/null || echo "000")
        if [ "$http_code" = "200" ]; then
            health_endpoint="$endpoint"
            break
        fi
    done
    
    if [ -n "$health_endpoint" ]; then
        urls+=("$health_endpoint")
    fi
    
    for url in "${urls[@]}"; do
        local full_url="https://$domain$url"
        echo -n "Testing $full_url... "
        
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" -L --connect-timeout 10 --max-time 30 "$full_url" 2>/dev/null || echo "000")
        
        if [ "$http_code" = "200" ]; then
            echo -e "${GREEN}✓ PASS${NC} ($http_code)"
        else
            echo -e "${RED}✗ FAIL${NC} ($http_code)"
            echo -e "${RED}Error: $full_url returned HTTP $http_code${NC}"
            all_passed=false
        fi
    done
    
    echo ""
    
    if [ "$all_passed" = true ]; then
        echo -e "${GREEN}✓ All smoke tests passed for $environment_name${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}✗ Some smoke tests failed for $environment_name${NC}"
        echo ""
        return 1
    fi
}

# Step 1: Deploy to staging
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1: Deploying to STAGING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

STAGING_RUN_ID=$(trigger_workflow "staging" "Deploy to Cloudflare (Staging)")
STAGING_RUN_URL="https://github.com/$REPO/actions/runs/$STAGING_RUN_ID"

if ! wait_for_workflow "$STAGING_RUN_ID" "staging"; then
    echo -e "${RED}✗ Staging deployment failed${NC}"
    echo "Stopping deployment process."
    exit 1
fi

STAGING_SUCCESS=true

# Step 2: Smoke-test staging
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Smoke-testing STAGING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ! smoke_test_deployment "$STAGING_DOMAIN" "staging"; then
    echo -e "${RED}✗ Staging smoke tests failed${NC}"
    echo "Stopping deployment process."
    exit 1
fi

# Step 3: Deploy to production
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: Deploying to PRODUCTION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PRODUCTION_RUN_ID=$(trigger_workflow "production" "Deploy to Cloudflare (Production)")
PRODUCTION_RUN_URL="https://github.com/$REPO/actions/runs/$PRODUCTION_RUN_ID"

if ! wait_for_workflow "$PRODUCTION_RUN_ID" "production"; then
    echo -e "${RED}✗ Production deployment failed${NC}"
    echo "Deployment process completed with errors."
    exit 1
fi

PRODUCTION_SUCCESS=true

# Step 4: Smoke-test production
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 4: Smoke-testing PRODUCTION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ! smoke_test_deployment "$PRODUCTION_DOMAIN" "production"; then
    echo -e "${RED}✗ Production smoke tests failed${NC}"
    echo "Deployment process completed with errors."
    exit 1
fi

# Step 5: Post results summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 5: Posting Results Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create summary comment
SUMMARY="# 🚀 Deployment Summary

## Staging Deployment
✅ **Status:** Success
🔗 **Workflow Run:** ${STAGING_RUN_URL}
🌐 **Site URL:** https://${STAGING_DOMAIN}
✅ **Smoke Tests:** Passed

## Production Deployment
✅ **Status:** Success
🔗 **Workflow Run:** ${PRODUCTION_RUN_URL}
🌐 **Site URL:** https://${PRODUCTION_DOMAIN}
✅ **Smoke Tests:** Passed

---

**Deployment Status:** ✅ COMPLETE

Both staging and production deployments completed successfully with all smoke tests passing."

# Try to find the most recent issue or PR to comment on
# If this script is run from a PR context, comment there
if [ -n "$GITHUB_REF" ] && [[ "$GITHUB_REF" == refs/pull/* ]]; then
    PR_NUMBER=$(echo "$GITHUB_REF" | sed 's|refs/pull/||' | sed 's|/merge||')
    echo "Posting comment to PR #$PR_NUMBER"
    echo "$SUMMARY" | gh pr comment "$PR_NUMBER" -R "$REPO" -F -
elif [ -n "$1" ]; then
    # If an issue/PR number is provided as argument
    echo "Posting comment to issue/PR #$1"
    echo "$SUMMARY" | gh issue comment "$1" -R "$REPO" -F -
else
    # Otherwise, just print the summary
    echo "No PR/issue context found. Summary:"
    echo ""
    echo "$SUMMARY"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment process completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Staging: https://${STAGING_DOMAIN}"
echo "Production: https://${PRODUCTION_DOMAIN}"
echo ""
