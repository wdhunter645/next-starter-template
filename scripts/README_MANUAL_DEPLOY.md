# Manual Cloudflare Pages Deployment

This directory contains the manual deployment script for Cloudflare Pages.

## Overview

`manual-deploy-pages.sh` is a comprehensive script that handles manual deployments to Cloudflare Pages when CI/CD is failing or when you need to deploy outside of the automated workflow.

## Prerequisites

Before running the script, ensure you have:

1. **Cloudflare API Token** with the following permissions:
   - Account > Cloudflare Pages > Edit (NOT just Read)
   - If using a user token: User > Memberships > Read

2. **Cloudflare Account ID**

3. **Node.js and npm** installed

4. **Wrangler CLI** (installed automatically by the script via npx)

5. **jq** installed (for JSON parsing)
   ```bash
   # On Ubuntu/Debian
   sudo apt-get install jq
   
   # On macOS
   brew install jq
   ```

## Usage

### Set Environment Variables

Export your Cloudflare credentials:

```bash
export CF_API_TOKEN="your-cloudflare-api-token"
export CF_ACCOUNT_ID="your-cloudflare-account-id"
```

### Run the Script

```bash
cd /path/to/next-starter-template
bash scripts/manual-deploy-pages.sh
```

## What the Script Does

The script performs the following steps:

1. **Credential Verification** - Validates that `CF_API_TOKEN` and `CF_ACCOUNT_ID` are set
2. **Build Project** - Runs `npm ci`, `npm run build`, and prepares the Cloudflare Pages artifact
3. **Create Projects** - Ensures both `lgfc-staging` and `lgfc-prod` projects exist (idempotent)
4. **Deploy** - Deploys to both staging and production environments
5. **Extract URLs** - Retrieves deployment URLs from Cloudflare
6. **Smoke Tests** - Tests both deployments using the `/api/healthz` endpoint
7. **Optional Monitoring** - Provides commands to seed uptime monitor secrets
8. **Run Orchestrator** - Executes the deployment orchestrator script if available

## Expected Output

On successful completion, you'll see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DEPLOYMENT COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STAGING:    https://lgfc-staging.pages.dev
PRODUCTION: https://lgfc-prod.pages.dev

✅ All deployments completed successfully
✅ All smoke checks passed
```

## Exit Codes

- `0` - Success
- `1` - Credential validation failed or smoke check failed
- `11` - Build output directory not found
- `23` - Deployment failed

## Troubleshooting

### Missing Credentials

If you see:
```
✗ CF_API_TOKEN missing
```

Ensure you've exported the environment variable:
```bash
export CF_API_TOKEN="your-token-here"
```

### Build Failures

If the build fails, check:
- All dependencies are installed (`npm ci` succeeded)
- No syntax errors in your code
- Sufficient disk space

### Deployment Failures

If deployment fails with exit code 23:
- Verify your API token has correct permissions
- Check that the account ID is correct
- Ensure the Cloudflare Pages projects exist

### Smoke Check Failures

If smoke checks fail:
- Wait a few moments for the deployment to propagate
- Check that the `/api/healthz` endpoint is implemented
- Verify network connectivity to Cloudflare Pages

## Integration with CI/CD

This script is designed to be used when CI/CD is failing. Once credentials are working:

1. Use this script to manually deploy
2. Fix the CI/CD pipeline
3. The orchestrator script will handle future automated deployments

## Related Scripts

- `deploy-pages-orchestrator.sh` - Automated deployment orchestrator
- `validate-deploy-pages-orchestrator.sh` - Validates orchestrator setup
- `validate-deployment-setup.sh` - Validates deployment configuration

## Security Notes

- **Never commit credentials** to version control
- Use environment variables or secure secret management
- The script exits immediately if credentials are not found
- Credentials are only used for Cloudflare API calls
