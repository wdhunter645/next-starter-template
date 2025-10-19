# Quick Start: Automated Deployment

Get started with the automated deployment orchestrator in under 5 minutes.

## Prerequisites Check

Run the validation script to check your setup:

```bash
./scripts/validate-deployment-setup.sh
```

Expected output:
```
✓ GitHub CLI (gh)
✓ curl
✓ jq
✓ bash version 4+
✓ All workflow files exist
✓ All scripts exist and executable
✓ Documentation complete
```

If any checks fail, follow the recommendations in the output.

## Required Secrets

Ensure these secrets are configured in your repository:

1. Go to: https://github.com/wdhunter645/next-starter-template/settings/secrets/actions

2. Add/verify these secrets:
   - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
   - `CLOUDFLARE_PROJECT_NAME` - Your production project name
   - `OPENAI_API_KEY` - Your OpenAI API key (if used)

Optional:
   - `CLOUDFLARE_STAGING_PROJECT_NAME` - Staging project (uses production if not set)

## Run Deployment

### Option 1: Command Line (Recommended)

```bash
# From repository root
./scripts/deploy-orchestrator.sh
```

This will:
1. ✓ Validate all prerequisites
2. 🚀 Deploy to staging (test.lougehrigfanclub.com)
3. 🧪 Test staging deployment
4. 🚀 Deploy to production (www.lougehrigfanclub.com)
5. 🧪 Test production deployment
6. 📊 Show summary with results

Total time: ~12-20 minutes

### Option 2: GitHub Actions UI

1. Go to repository Actions tab
2. Click "Manual Deployment Orchestrator"
3. Click "Run workflow"
4. (Optional) Enter PR/issue number for comment
5. Click "Run workflow" button

## Post to PR/Issue

To post deployment results as a comment:

```bash
./scripts/deploy-orchestrator.sh 123
```

Where `123` is your PR or issue number.

## Expected Output

### Successful Deployment

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Deployment Orchestrator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 0: Checking preconditions...

✓ GitHub CLI authenticated
✓ Workflow file exists
✓ Secret found: CLOUDFLARE_API_TOKEN
✓ Secret found: CLOUDFLARE_ACCOUNT_ID
✓ Secret found: OPENAI_API_KEY
✓ All required secrets are configured

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1: Deploying to STAGING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Workflow triggered successfully
Run ID: 12345678
Run URL: https://github.com/.../actions/runs/12345678

Waiting for workflow to complete...
Status: completed | Conclusion: success
✓ Workflow completed successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 2: Smoke-testing STAGING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Testing https://test.lougehrigfanclub.com/... ✓ PASS (200)
Testing https://test.lougehrigfanclub.com/api/supabase/status... ✓ PASS (200)

✓ All smoke tests passed for staging

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 3: Deploying to PRODUCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Workflow triggered successfully
Run ID: 12345679
Run URL: https://github.com/.../actions/runs/12345679

Waiting for workflow to complete...
Status: completed | Conclusion: success
✓ Workflow completed successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 4: Smoke-testing PRODUCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Testing https://www.lougehrigfanclub.com/... ✓ PASS (200)
Testing https://www.lougehrigfanclub.com/api/supabase/status... ✓ PASS (200)

✓ All smoke tests passed for production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Deployment process completed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Staging: https://test.lougehrigfanclub.com
Production: https://www.lougehrigfanclub.com
```

## Troubleshooting

### "gh: command not found"

Install GitHub CLI:
```bash
# macOS
brew install gh

# Linux
sudo apt install gh

# Windows
winget install GitHub.cli
```

Then authenticate:
```bash
gh auth login
```

### "GitHub CLI is not authenticated"

```bash
gh auth login
```

Follow the prompts to authenticate with GitHub.

### "Missing required secrets"

The script will tell you which secrets are missing. Add them in repository settings:
```
https://github.com/wdhunter645/next-starter-template/settings/secrets/actions
```

### "Workflow failed"

The script will print the first error line from the failed workflow. Check the workflow run URL for full details.

### "Smoke tests failed"

Check if the deployment actually succeeded:
```bash
# Test manually
curl -I https://test.lougehrigfanclub.com/
curl -I https://www.lougehrigfanclub.com/
```

If the site is down or returning errors, check Cloudflare Pages dashboard.

## What Gets Deployed

### Staging Environment
- **Domain:** test.lougehrigfanclub.com
- **Branch:** main (or specified)
- **Purpose:** Safe testing before production
- **Tests:** Homepage, API endpoints, health checks

### Production Environment
- **Domain:** www.lougehrigfanclub.com
- **Branch:** main (or specified)
- **Purpose:** Live production site
- **Tests:** Homepage, API endpoints, health checks

## Safety Features

1. **Fail-Fast Validation** - Stops immediately if prerequisites aren't met
2. **Staging First** - Always deploys and tests staging before production
3. **Comprehensive Testing** - Tests all critical endpoints
4. **Error Reporting** - Clear messages when something fails
5. **Rollback Ready** - Can easily identify what was deployed if rollback needed

## Next Steps

After successful deployment:

1. **Verify staging:** https://test.lougehrigfanclub.com
2. **Verify production:** https://www.lougehrigfanclub.com
3. **Check workflow runs:** 
   - Staging: [workflow run URL from output]
   - Production: [workflow run URL from output]
4. **Review logs:** Check for any warnings or issues
5. **Test manually:** Try key user flows on both environments

## Additional Resources

- **Full Documentation:** [docs/DEPLOYMENT_ORCHESTRATOR.md](./DEPLOYMENT_ORCHESTRATOR.md)
- **Test Plan:** [docs/DEPLOYMENT_TEST_PLAN.md](./DEPLOYMENT_TEST_PLAN.md)
- **Implementation Summary:** [DEPLOYMENT_ORCHESTRATION_SUMMARY.md](../DEPLOYMENT_ORCHESTRATION_SUMMARY.md)
- **Script Reference:** [scripts/README.md](../scripts/README.md)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run validation script: `./scripts/validate-deployment-setup.sh`
3. Review full documentation in `docs/DEPLOYMENT_ORCHESTRATOR.md`
4. Check workflow logs in GitHub Actions
5. Open an issue if you find a bug

---

**Quick Reference:**

```bash
# Validate setup
./scripts/validate-deployment-setup.sh

# Run deployment
./scripts/deploy-orchestrator.sh

# Run and post to PR #123
./scripts/deploy-orchestrator.sh 123
```

---

**Last Updated:** 2025-10-19  
**Maintained By:** Development Team
