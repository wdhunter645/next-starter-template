# Quick Reference: deploy-pages-orchestrator.sh

## TL;DR

```bash
# Test it first
./scripts/deploy-pages-orchestrator.sh --dry-run

# Run it for real (requires gh auth)
./scripts/deploy-pages-orchestrator.sh

# Run and post results to issue #42
./scripts/deploy-pages-orchestrator.sh 42
```

## Prerequisites Checklist

- [ ] GitHub CLI authenticated: `gh auth login`
- [ ] Repository secrets configured:
  - [ ] `CF_API_TOKEN`
  - [ ] `CF_ACCOUNT_ID`
- [ ] Cloudflare Pages projects exist:
  - [ ] `lgfc-staging`
  - [ ] `lgfc-prod`

## What Happens

```
┌─────────────────────────────────────┐
│ PRECHECK                            │
│ ✓ Check gh auth                     │
│ ✓ Verify secrets exist              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ STEP 1: Trigger Deployments         │
│ • Trigger staging (lgfc-staging)    │
│ • Wait 20 seconds                   │
│ • Trigger production (lgfc-prod)    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ STEP 2: Monitor Workflows           │
│ • Poll both runs every 15s          │
│ • Wait for completion (max 30 min)  │
│ • Stop on first failure              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ STEP 3: Extract URLs                │
│ • Parse from workflow logs           │
│ • Fallback to wrangler CLI           │
│ • Fallback to default .pages.dev     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ STEP 4: Smoke Checks                │
│ • Test staging: GET / → 200         │
│ • Test production: GET / → 200      │
│ • Optional: /api/healthz, /__health │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ STEP 5: Report Results              │
│ • Display summary                    │
│ • Save report to /tmp                │
│ • Post to issue/PR (optional)        │
└─────────────────────────────────────┘
```

## Expected Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Cloudflare Pages Deployment Orchestrator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRECHECK: Validating required secrets...
✓ GitHub CLI authenticated
✓ Secret found: CF_API_TOKEN
✓ Secret found: CF_ACCOUNT_ID
✓ All required secrets are configured

STEP 1: Triggering deployments in parallel
✓ Staging deployment triggered
✓ Production deployment triggered

STEP 2: Monitoring workflow runs
✓ STAGING deployment completed successfully
✓ PRODUCTION deployment completed successfully

STEP 3: Extracting deployment URLs
✓ Staging URL: https://abc123.lgfc-staging.pages.dev
✓ Production URL: https://def456.lgfc-prod.pages.dev

STEP 4: Running smoke checks
✓ All smoke checks passed

STEP 5: Final Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DEPLOYMENT COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STAGING ✅  https://abc123.lgfc-staging.pages.dev
  → Workflow: https://github.com/.../runs/12345

PRODUCTION ✅  https://def456.lgfc-prod.pages.dev
  → Workflow: https://github.com/.../runs/12346
```

## Common Use Cases

### 1. Deploy Both Environments

```bash
./scripts/deploy-pages-orchestrator.sh
```

### 2. Test Before Running

```bash
./scripts/deploy-pages-orchestrator.sh --dry-run
```

### 3. Deploy and Post to Issue

```bash
# For issue #100
./scripts/deploy-pages-orchestrator.sh 100

# For PR #200
./scripts/deploy-pages-orchestrator.sh 200
```

### 4. Deploy from CI/CD

```yaml
- name: Deploy to Cloudflare Pages
  run: ./scripts/deploy-pages-orchestrator.sh
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Troubleshooting

### "GitHub CLI is not authenticated"

```bash
gh auth login
```

### "Secret missing: CF_API_TOKEN"

Add secrets at: https://github.com/wdhunter645/next-starter-template/settings/secrets/actions

### Workflow fails to trigger

Ensure you have permissions to trigger workflows in the repository.

### Smoke checks fail

- Check if URLs are correct
- Verify deployments completed successfully
- Check Cloudflare Pages dashboard

### Can't extract URLs

The script will try three methods:
1. Parse from workflow logs (most reliable)
2. Query via `wrangler pages deployment list` (requires CF_API_TOKEN env var)
3. Use default URLs (https://lgfc-staging.pages.dev, https://lgfc-prod.pages.dev)

## Validation

Test the script without deploying:

```bash
./scripts/validate-deploy-pages-orchestrator.sh
```

This runs 10 validation tests to ensure the script is working correctly.

## Time Estimates

- Precheck: ~5 seconds
- Trigger deployments: ~30 seconds (20s delay between)
- Build + deploy: ~3-5 minutes per environment
- Monitoring: 3-10 minutes (parallel)
- URL extraction: ~5 seconds
- Smoke checks: ~5 seconds
- **Total: ~5-12 minutes**

## Exit Codes

- `0` - Success
- `1` - Error (authentication, missing secrets, deployment failure, smoke check failure)

## Comparison with deploy-orchestrator.sh

| Feature | deploy-orchestrator.sh | deploy-pages-orchestrator.sh |
|---------|------------------------|------------------------------|
| Workflow | deploy.yml | pages-deploy.yml |
| Projects | From secrets | lgfc-staging, lgfc-prod |
| Domains | Custom (test/www.lougehrigfanclub.com) | Cloudflare Pages (.pages.dev) |
| Build | OpenNext | Next.js + Cloudflare adapter |
| Parallel | Sequential | Parallel (20s delay) |

Choose `deploy-pages-orchestrator.sh` when:
- You want to use the `pages-deploy.yml` workflow
- You're deploying to lgfc-staging/lgfc-prod projects
- You want parallel deployments with faster completion

Choose `deploy-orchestrator.sh` when:
- You want to use the `deploy.yml` workflow
- You're deploying to custom domains
- You need the OpenNext build process
