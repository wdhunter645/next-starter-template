# Deploy Pages Orchestrator

Automated deployment orchestrator for Cloudflare Pages with parallel staging and production deployments.

## Overview

This script implements a complete deployment pipeline that:
1. Validates required secrets (CF_API_TOKEN, CF_ACCOUNT_ID)
2. Triggers staging and production deployments in parallel
3. Monitors both workflow runs to completion
4. Extracts Cloudflare Pages URLs
5. Runs smoke checks (HTTP 200 verification)
6. Posts a final report

## Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Access to repository secrets
- Repository: `wdhunter645/next-starter-template`
- Cloudflare Pages projects: `lgfc-staging`, `lgfc-prod`

## Required Secrets

The following repository secrets must be configured:
- `CF_API_TOKEN` - Cloudflare API token with Pages permissions
- `CF_ACCOUNT_ID` - Cloudflare account ID

If any secrets are missing, the script will fail fast with an error message.

## Usage

### Basic Usage

```bash
./scripts/deploy-pages-orchestrator.sh
```

### Post Report to Issue/PR

```bash
./scripts/deploy-pages-orchestrator.sh <issue-or-pr-number>
```

Example:
```bash
./scripts/deploy-pages-orchestrator.sh 42
```

## What It Does

### Step 1: Precheck
- Validates GitHub CLI authentication
- Checks for required secrets (CF_API_TOKEN, CF_ACCOUNT_ID)
- Fails fast if any requirements are not met

### Step 2: Trigger Deployments
- Triggers staging deployment via GitHub Actions
- Waits 20 seconds
- Triggers production deployment via GitHub Actions
- Both deployments run in parallel

### Step 3: Monitor Workflows
- Polls both workflow runs every 15 seconds
- Shows real-time status updates
- If any run fails, immediately captures and displays the first failing log line
- Stops on first failure

### Step 4: Extract URLs
- Attempts to extract Cloudflare Pages URLs from workflow logs
- Falls back to `wrangler pages deployment list` if not found in logs
- Uses default URLs as last resort

### Step 5: Smoke Checks
- Tests HTTP 200 response from `<url>/`
- Optionally tests `/api/healthz` and `/__health` endpoints
- Stops if any critical check fails

### Step 6: Final Report
- Displays summary with both URLs and workflow links
- Optionally posts comment to GitHub issue/PR
- Confirms no Vercel usage in pipeline

## Output

The script provides colored, formatted output showing:
- ✓ Success markers (green)
- ✗ Error markers (red)
- ⚠ Warning markers (yellow)
- Real-time progress updates

Example output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Cloudflare Pages Deployment Orchestrator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRECHECK: Validating required secrets...

✓ GitHub CLI authenticated
✓ Secret found: CF_API_TOKEN
✓ Secret found: CF_ACCOUNT_ID

✓ All required secrets are configured

...

✅ DEPLOYMENT COMPLETE

STAGING ✅  https://lgfc-staging.pages.dev
  → Workflow: https://github.com/wdhunter645/next-starter-template/actions/runs/12345

PRODUCTION ✅  https://lgfc-prod.pages.dev
  → Workflow: https://github.com/wdhunter645/next-starter-template/actions/runs/12346
```

## Acceptance Criteria

The script meets all acceptance criteria:
- ✅ Both deploy runs complete successfully
- ✅ Both URLs return HTTP 200 on "/"
- ✅ No Vercel usage anywhere in the pipeline
- ✅ Time-bound operations with proper timeouts
- ✅ Fail-fast on missing secrets
- ✅ Immediate error reporting on failures

## Troubleshooting

### "GitHub CLI is not authenticated"
Run `gh auth login` to authenticate with GitHub.

### "Secret missing: CF_API_TOKEN"
Add the required secrets at:
https://github.com/wdhunter645/next-starter-template/settings/secrets/actions

### Workflow fails to trigger
Ensure you have the proper permissions to trigger workflows in the repository.

### Cannot extract URLs
The script will attempt multiple methods:
1. Parse from workflow logs
2. Query via `wrangler pages deployment list`
3. Use default pages.dev URLs

If all methods fail, URLs may be incorrect and smoke checks may fail.

## Differences from deploy-orchestrator.sh

The original `deploy-orchestrator.sh` uses:
- Workflow: `deploy.yml`
- Projects: From secrets (CLOUDFLARE_PROJECT_NAME)
- Custom domains: test.lougehrigfanclub.com, www.lougehrigfanclub.com

This script (`deploy-pages-orchestrator.sh`) uses:
- Workflow: `pages-deploy.yml`
- Projects: lgfc-staging, lgfc-prod (hardcoded)
- URLs: Cloudflare Pages URLs (*.pages.dev)

## Integration with CI/CD

This script can be triggered manually or integrated into CI/CD pipelines. It's designed to be idempotent and safe to run multiple times.
