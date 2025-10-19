# Deployment Orchestrator

Automated deployment pipeline for staging and production environments with smoke testing.

## Overview

The deployment orchestrator (`scripts/deploy-orchestrator.sh`) automates the complete deployment process:

1. **Precondition Checks** - Validates required secrets exist
2. **Staging Deployment** - Deploys to test environment via GitHub Actions
3. **Staging Smoke Tests** - Verifies staging deployment health
4. **Production Deployment** - Deploys to production via GitHub Actions
5. **Production Smoke Tests** - Verifies production deployment health
6. **Results Summary** - Posts deployment summary with links

## Prerequisites

### Required Tools

- **GitHub CLI (`gh`)** - Must be authenticated
  ```bash
  gh auth login
  ```

- **curl** - For smoke testing HTTP endpoints
- **jq** - For JSON parsing

### Required Repository Secrets

The orchestrator checks for these secrets before starting:

- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages deployment permissions
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `OPENAI_API_KEY` - OpenAI API key (if used by the application)

Additional secrets used by the workflow:
- `CLOUDFLARE_PROJECT_NAME` - Production project name
- `CLOUDFLARE_STAGING_PROJECT_NAME` - Staging project name (optional, defaults to production project)

### Workflow Configuration

The orchestrator requires `.github/workflows/deploy.yml` to support workflow dispatch with inputs:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment (staging or production)'
        required: true
        type: choice
        options:
          - staging
          - production
      branch:
        description: 'Branch to deploy'
        required: true
        type: string
```

## Usage

### Basic Usage

Run from the repository root:

```bash
./scripts/deploy-orchestrator.sh
```

### With PR/Issue Comment

To post the summary as a comment on a specific PR or issue:

```bash
./scripts/deploy-orchestrator.sh 123
```

Where `123` is the PR or issue number.

### From GitHub Actions

The script automatically detects PR context when run in GitHub Actions:

```yaml
- name: Run deployment orchestrator
  run: ./scripts/deploy-orchestrator.sh
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Deployment Flow

### 1. Preconditions

```
✓ GitHub CLI authenticated
✓ Workflow file exists: .github/workflows/deploy.yml
✓ Secret found: CLOUDFLARE_API_TOKEN
✓ Secret found: CLOUDFLARE_ACCOUNT_ID
✓ Secret found: OPENAI_API_KEY
✓ All required secrets are configured
```

### 2. Staging Deployment

```
Triggering workflow: Deploy to Cloudflare (Staging)
Repository: wdhunter645/next-starter-template
Branch: main
Environment: staging

✓ Workflow triggered successfully
Run ID: 12345678
Run URL: https://github.com/wdhunter645/next-starter-template/actions/runs/12345678
```

Waits for workflow completion (max 30 minutes).

### 3. Staging Smoke Tests

Tests these endpoints against `test.lougehrigfanclub.com`:

- **Homepage:** `https://test.lougehrigfanclub.com/`
- **API Status:** `https://test.lougehrigfanclub.com/api/supabase/status`
- **Health Check:** `https://test.lougehrigfanclub.com/_health` or `/api/healthz` (if exists)

Example output:
```
Testing https://test.lougehrigfanclub.com/... ✓ PASS (200)
Testing https://test.lougehrigfanclub.com/api/supabase/status... ✓ PASS (200)

✓ All smoke tests passed for staging
```

### 4. Production Deployment

Same process as staging, but targeting production environment.

### 5. Production Smoke Tests

Tests same endpoints against `www.lougehrigfanclub.com`:

- **Homepage:** `https://www.lougehrigfanclub.com/`
- **API Status:** `https://www.lougehrigfanclub.com/api/supabase/status`
- **Health Check:** `https://www.lougehrigfanclub.com/_health` or `/api/healthz` (if exists)

### 6. Results Summary

Posts a summary comment (if in PR/issue context):

```markdown
# 🚀 Deployment Summary

## Staging Deployment
✅ **Status:** Success
🔗 **Workflow Run:** [link]
🌐 **Site URL:** https://test.lougehrigfanclub.com
✅ **Smoke Tests:** Passed

## Production Deployment
✅ **Status:** Success
🔗 **Workflow Run:** [link]
🌐 **Site URL:** https://www.lougehrigfanclub.com
✅ **Smoke Tests:** Passed

---

**Deployment Status:** ✅ COMPLETE
```

## Error Handling

The script stops immediately if any step fails:

### Missing Secrets

```
✗ Error: Missing required secrets: OPENAI_API_KEY
Please add these secrets to the repository at:
https://github.com/wdhunter645/next-starter-template/settings/secrets/actions
```

### Workflow Failure

```
✗ Error: Workflow failed with conclusion: failure

Fetching error logs...
[Error logs from failed jobs]
```

### Smoke Test Failure

```
Testing https://test.lougehrigfanclub.com/... ✗ FAIL (500)
Error: https://test.lougehrigfanclub.com/ returned HTTP 500

✗ Some smoke tests failed for staging
Stopping deployment process.
```

## Configuration

### Domains

Edit these variables in the script to change target domains:

```bash
STAGING_DOMAIN="test.lougehrigfanclub.com"
PRODUCTION_DOMAIN="www.lougehrigfanclub.com"
```

### Timeouts

- **Workflow timeout:** 1800 seconds (30 minutes)
- **HTTP request timeout:** 30 seconds
- **HTTP connection timeout:** 10 seconds

### Check Interval

Workflow status is checked every 15 seconds.

## Troubleshooting

### GitHub CLI Not Authenticated

```bash
gh auth login
```

Follow the prompts to authenticate with GitHub.

### Workflow Not Found

Ensure `.github/workflows/deploy.yml` exists and is committed to the repository.

### Secrets Not Found

Check secrets in repository settings:
```
https://github.com/wdhunter645/next-starter-template/settings/secrets/actions
```

### Workflow Stuck

The script times out after 30 minutes. Check the workflow run URL for details.

### Smoke Tests Fail

1. Check if the site is actually deployed:
   ```bash
   curl -I https://test.lougehrigfanclub.com/
   ```

2. Check Cloudflare Pages deployment status in dashboard

3. Review workflow logs for deployment errors

## Integration with CI/CD

### Automated Deployments

Create a workflow that runs the orchestrator on schedule or trigger:

```yaml
name: Scheduled Deployment

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install GitHub CLI
        run: |
          type -p gh >/dev/null || {
            curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
            sudo apt update
            sudo apt install gh -y
          }
      
      - name: Authenticate GitHub CLI
        run: echo "${{ secrets.GITHUB_TOKEN }}" | gh auth login --with-token
      
      - name: Run deployment orchestrator
        run: ./scripts/deploy-orchestrator.sh
```

### Manual Trigger

From the GitHub UI:
1. Go to Actions tab
2. Select the workflow
3. Click "Run workflow"
4. Select branch and run

## See Also

- [Deploy Workflow](.github/workflows/deploy.yml) - Main deployment workflow
- [Staging Mirror](./docs/ops/STAGING-MIRROR.md) - Staging environment setup
- [Smoke Tests](./scripts/smoke.sh) - Detailed smoke test script

---

**Last Updated:** 2025-10-19
**Maintained By:** Development Team
