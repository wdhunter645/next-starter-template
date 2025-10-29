# Cloudflare Build Log Review

This guide explains how to review Cloudflare Pages deployment logs and identify builds that should be rerun.

## Overview

The `review-cloudflare-builds.sh` script analyzes Cloudflare Pages deployments from the last 72 hours and provides:

- A summary of all deployments (successful, failed, canceled, in-progress)
- Detailed information about failed and canceled builds
- Recommendations on which builds should be rerun
- Instructions for rerunning builds

## Prerequisites

1. **jq** must be installed:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install jq
   
   # macOS
   brew install jq
   ```

2. **Cloudflare credentials** - You need:
   - Cloudflare API Token with Pages:Read permission
   - Cloudflare Account ID
   - Cloudflare Project Name

## Usage

### Method 1: Using Environment Variables (Recommended)

Set the required environment variables, then run the script:

```bash
export CLOUDFLARE_API_TOKEN="your_api_token"
export CLOUDFLARE_ACCOUNT_ID="your_account_id"
export CLOUDFLARE_PROJECT_NAME="your_project_name"

./scripts/review-cloudflare-builds.sh
```

### Method 2: Using Command Line Arguments

Pass credentials directly as arguments:

```bash
./scripts/review-cloudflare-builds.sh \
  --api-token="your_api_token" \
  --account-id="your_account_id" \
  --project-name="your_project_name"
```

### Method 3: Using GitHub Secrets (CI/CD)

For automated reviews in GitHub Actions, the credentials can be pulled from repository secrets:

```yaml
- name: Review Cloudflare Builds
  run: |
    ./scripts/review-cloudflare-builds.sh
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    CLOUDFLARE_PROJECT_NAME: ${{ secrets.CLOUDFLARE_PROJECT_NAME }}
```

## Output Example

```
========================================
Cloudflare Build Log Review
========================================
Project: next-starter-template
Time Range: Last 72 hours (since 2025-10-26T12:21:45Z)

Fetching deployment history...
Analyzing deployments from the last 72 hours...

Found 15 deployments in the last 72 hours

========================================
Deployment Status Summary
========================================
✓ SUCCESS | 2025-10-29T10:15:32Z | production | a1b2c3d4 | Update homepage layout
✗ FAILED  | 2025-10-29T08:45:12Z | production | e5f6g7h8 | Add new feature
✓ SUCCESS | 2025-10-28T22:30:45Z | production | i9j0k1l2 | Fix bug in API

Summary:
  ✓ Successful:   12
  ✗ Failed:       2
  ⊘ Canceled:     1
  ⟳ In Progress:  0

========================================
Recommendations
========================================
⚠️  Builds that should be reviewed and potentially rerun:

Failed Deployments (2):
  • Deployment ID: abc123...
    Time: 2025-10-29T08:45:12Z
    Environment: production
    Commit: e5f6g7h8
    Message: Add new feature
    Failed Stage: build

Canceled Deployments (1):
  • Deployment ID: def456...
    Time: 2025-10-28T16:20:30Z
    Environment: production
    Commit: m3n4o5p6
    Message: Update dependencies

How to rerun builds:
  1. For specific commits, use the GitHub Actions workflow:
     gh workflow run deploy.yml --ref main -f redeploy_count=1

  2. To rollback/promote a specific deployment:
     gh workflow run cloudflare-rollback.yml --ref main \
       -f target_sha=<COMMIT_HASH>

  3. To manually trigger a deployment:
     git commit --allow-empty -m 'Trigger deployment'
     git push origin main

Review complete!
```

## Understanding the Output

### Deployment Statuses

- **✓ SUCCESS** - Deployment completed successfully
- **✗ FAILED** - Deployment failed at some stage
- **⊘ CANCELED** - Deployment was canceled
- **⟳ IN PROGRESS** - Deployment is currently running
- **? UNKNOWN** - Status cannot be determined

### When to Rerun a Build

You should consider rerunning a build if:

1. **Failed builds with transient errors:**
   - Network timeouts
   - Temporary service unavailability
   - Rate limiting issues
   - Resource constraints

2. **Canceled builds that need completion:**
   - Manually canceled during testing
   - Canceled due to newer commits
   - Canceled by CI/CD pipeline configuration changes

3. **Failed builds after fixes:**
   - Dependencies have been updated
   - Infrastructure issues have been resolved
   - Configuration has been corrected

### When NOT to Rerun a Build

Do NOT rerun builds if the failure was caused by:

- Code errors (fix the code first)
- Invalid configuration (fix the configuration first)
- Missing secrets or credentials (add them first)
- Intentionally canceled deployments

## Rerunning Builds

### Option 1: Redeploy Using GitHub Actions

The `deploy.yml` workflow supports redeploying previous commits:

```bash
# Redeploy the last commit
gh workflow run deploy.yml --ref main -f redeploy_count=1

# Redeploy the last 3 commits
gh workflow run deploy.yml --ref main -f redeploy_count=3
```

### Option 2: Rollback to a Specific Commit

Use the rollback workflow to promote a specific deployment:

```bash
# By commit SHA
gh workflow run cloudflare-rollback.yml --ref main -f target_sha=abc123def456

# By relative time
gh workflow run cloudflare-rollback.yml --ref main -f days_ago="2 days"
```

### Option 3: Manual Deployment Trigger

Push an empty commit to trigger a new deployment:

```bash
git commit --allow-empty -m "Retrigger deployment for commit abc123"
git push origin main
```

## Automating Build Reviews

### Using the Included Workflow

This repository includes a GitHub Actions workflow (`.github/workflows/review-builds.yml`) for automated build reviews.

To run a manual review:

```bash
# Using GitHub CLI
gh workflow run review-builds.yml --ref main

# Or trigger from the GitHub UI:
# Actions → Review Cloudflare Build Logs → Run workflow
```

To enable automatic scheduled reviews, edit `.github/workflows/review-builds.yml` and uncomment the schedule section:

```yaml
on:
  workflow_dispatch:
  schedule:
    # Run every Monday at 9 AM UTC
    - cron: '0 9 * * 1'
```

### Creating a Custom Workflow

You can also create a custom workflow for your specific needs:

```yaml
name: Weekly Build Review

on:
  schedule:
    # Run every Monday at 9 AM UTC
    - cron: '0 9 * * 1'
  workflow_dispatch:

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install jq
        run: sudo apt-get update && sudo apt-get install -y jq

      - name: Review Cloudflare Builds
        run: |
          ./scripts/review-cloudflare-builds.sh
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_PROJECT_NAME: ${{ secrets.CLOUDFLARE_PROJECT_NAME }}
```

## Troubleshooting

### "jq is required but not installed"

Install jq using your package manager:
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

### "CLOUDFLARE_API_TOKEN is not set"

Ensure you've set the environment variable or passed it as a command line argument:
```bash
export CLOUDFLARE_API_TOKEN="your_token_here"
```

### "Cloudflare API returned failure"

Check that:
1. Your API token has the correct permissions (Pages:Read minimum)
2. Your account ID is correct
3. Your project name matches exactly (case-sensitive)
4. Your API token hasn't expired

### "No deployments found in the last 72 hours"

This is normal if:
- No deployments have occurred in the time window
- The project is new
- Deployments are triggered manually/infrequently

## Security Notes

- **Never commit API tokens to version control**
- Store tokens in `.env` file (which is gitignored)
- Use GitHub Secrets for CI/CD workflows
- Rotate API tokens regularly
- Use tokens with minimum required permissions

## Additional Resources

- [Cloudflare Pages API Documentation](https://developers.cloudflare.com/api/operations/pages-project-get-projects)
- [GitHub Actions Workflow Dispatch](https://docs.github.com/en/actions/using-workflows/manually-running-a-workflow)
- [Cloudflare Pages Deployment](https://developers.cloudflare.com/pages/platform/deployments/)
