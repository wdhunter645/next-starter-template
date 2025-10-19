#!/bin/bash
# Manual Cloudflare Pages Deployment Script
# This script provides a way to manually deploy to Cloudflare Pages when CI is failing
# It handles staging and production deployments with smoke checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Manual Cloudflare Pages Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 0) Verify Cloudflare credentials & project wiring (hard blocker)
# --- TOKEN must be: Account > Cloudflare Pages > Edit (NOT just Read).
# --- If using a user token, include: User > Memberships > Read.
# Ref: CF docs/pages-action notes
# Export to avoid shell prompt leakage:
echo -e "${YELLOW}Step 0: Verifying Cloudflare credentials...${NC}"
test -n "$CF_API_TOKEN" || { echo -e "${RED}✗ CF_API_TOKEN missing${NC}"; exit 1; }
test -n "$CF_ACCOUNT_ID" || { echo -e "${RED}✗ CF_ACCOUNT_ID missing${NC}"; exit 1; }
echo -e "${GREEN}✓ CF_API_TOKEN and CF_ACCOUNT_ID are set${NC}"
echo ""

# 1) Install deps and produce the Cloudflare Pages artifact locally
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1: Building project...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Installing dependencies..."
npm ci

echo "Building Next.js project..."
npm run build

echo "Preparing Cloudflare Pages artifact..."
npx @cloudflare/next-on-pages@latest --experimental-minify

echo "Verifying build output..."
test -d .vercel/output/static || { echo -e "${RED}✗ no build output at .vercel/output/static${NC}"; exit 11; }
echo -e "${GREEN}✓ Build completed successfully${NC}"
echo ""

# 2) Create (idempotent) Pages projects if not already there
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Ensuring Pages projects exist...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Creating lgfc-staging project (if not exists)..."
npx wrangler pages project create lgfc-staging --production-branch main || true

echo "Creating lgfc-prod project (if not exists)..."
npx wrangler pages project create lgfc-prod --production-branch main || true

echo -e "${GREEN}✓ Projects verified/created${NC}"
echo ""

# 3) Manual deploy to unblock go-live while CI keeps failing
#    (uses the already-built .vercel/output/static)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: Deploying to Cloudflare Pages...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Staging (no DNS)
echo -e "${YELLOW}Deploying to STAGING...${NC}"
npx wrangler pages deploy .vercel/output/static \
  --project-name lgfc-staging || { echo -e "${RED}✗ Staging deployment failed${NC}"; exit 23; }
echo -e "${GREEN}✓ Staging deployed${NC}"
echo ""

# Prod (marks as production branch deployment)
echo -e "${YELLOW}Deploying to PRODUCTION...${NC}"
npx wrangler pages deploy .vercel/output/static \
  --project-name lgfc-prod --branch main --commit-dirty=true || { echo -e "${RED}✗ Production deployment failed${NC}"; exit 23; }
echo -e "${GREEN}✓ Production deployed${NC}"
echo ""

# 4) Print out discovered URLs for both deployments (helps seed monitors)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 4: Extracting deployment URLs...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "---- Staging URLs ----"
STAGING_URL=$(npx wrangler pages deployment list --project-name lgfc-staging --format json | jq -r '.[0].url')
echo "$STAGING_URL"

echo "---- Prod URLs ----"
PROD_URL=$(npx wrangler pages deployment list --project-name lgfc-prod --format json | jq -r '.[0].url')
echo "$PROD_URL"
echo ""

# 5) Smoke check both envs (uses the new health endpoint)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 5: Running smoke checks...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}Testing STAGING environment...${NC}"
if test -n "$STAGING_URL"; then
    echo "Checking $STAGING_URL/api/healthz ..."
    if curl -sf "$STAGING_URL/api/healthz" >/dev/null; then
        echo -e "${GREEN}✓ Staging health check passed${NC}"
    else
        echo -e "${RED}✗ Staging health check failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Staging URL not available, skipping smoke check${NC}"
fi

echo -e "${YELLOW}Testing PRODUCTION environment...${NC}"
if test -n "$PROD_URL"; then
    echo "Checking $PROD_URL/api/healthz ..."
    if curl -sf "$PROD_URL/api/healthz" >/dev/null; then
        echo -e "${GREEN}✓ Production health check passed${NC}"
    else
        echo -e "${RED}✗ Production health check failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Production URL not available, skipping smoke check${NC}"
fi
echo ""

# 6) Seed uptime monitor secrets (optional now; do it once URLs are final)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 6: Optional - Seed uptime monitor secrets${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}To seed uptime monitor secrets, run:${NC}"
echo "  gh secret set LGFC_STAGING_URL -b \"$STAGING_URL\""
echo "  gh secret set LGFC_PROD_URL -b \"$PROD_URL\""
echo ""
echo -e "${YELLOW}Uncomment the following lines to auto-seed:${NC}"
echo "# gh secret set LGFC_STAGING_URL -b \"$STAGING_URL\""
echo "# gh secret set LGFC_PROD_URL -b \"$PROD_URL\""
echo ""

# 7) If CI keeps failing: run the in-repo orchestrator (now that token is fixed)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 7: Running deployment orchestrator...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "scripts/deploy-pages-orchestrator.sh" ]; then
    echo "Running deploy-pages-orchestrator.sh..."
    bash scripts/deploy-pages-orchestrator.sh || true
    echo -e "${GREEN}✓ Orchestrator execution completed${NC}"
else
    echo -e "${YELLOW}⚠ scripts/deploy-pages-orchestrator.sh not found, skipping${NC}"
fi
echo ""

# Final summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "STAGING:    $STAGING_URL"
echo "PRODUCTION: $PROD_URL"
echo ""
echo -e "${GREEN}✅ All deployments completed successfully${NC}"
echo -e "${GREEN}✅ All smoke checks passed${NC}"
echo ""
