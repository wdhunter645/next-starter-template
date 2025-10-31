# Cloudflare Pages rollback & promote instructions

This document explains how to roll back Cloudflare Pages to a known repository commit and promote that deployment to production from GitHub Actions.

## Purpose
If Cloudflare Pages is serving a build that does not match the repository HEAD (or a known-good commit), use the workflow added in `.github/workflows/cloudflare-rollback.yml` to promote a previously-built deployment (or rebuild and deploy a specific commit) and restore production to a known-good state.

## Required GitHub secrets
- `CLOUDFLARE_API_TOKEN` — a Cloudflare API token with the Pages permissions required to list and restore deployments on this account/project (Pages:Read, Pages:Edit or equivalent).
- `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID (numeric/uuid) where the Pages project lives.
- `CLOUDFLARE_PROJECT_NAME` — the Pages project name/slug (as shown in the Pages dashboard and used in the API path).

Add these under repository Settings → Secrets → Actions.

## Using the workflow (UI)
1. Go to the repository Actions tab and select the workflow "Cloudflare Pages: rollback/promote by commit".
2. Click "Run workflow".
3. Enter:
   - `target_sha` — the exact commit SHA you want served by Cloudflare (optional). If not provided, `days_ago` will be used to compute the commit on `origin/main`.
   - `days_ago` — if `target_sha` is empty, this relative time (e.g. `2 weeks`) is used to pick a commit on `origin/main`.
4. Run the workflow. It will attempt to find an existing Pages deployment that was built from that commit and call the restore/promote API.

## Using the workflow (GH CLI)
```bash
gh workflow run "Cloudflare Pages: rollback/promote by commit" -f target_sha=abc123def456
```

Or, to roll back to a commit from 2 weeks ago:
```bash
gh workflow run "Cloudflare Pages: rollback/promote by commit" -f days_ago="2 weeks"
```

## Post-promotion checklist
After the workflow completes successfully:
- [ ] Verify the workflow run logs show "Promotion succeeded"
- [ ] Check the Cloudflare Pages dashboard to confirm the promoted deployment is now serving production
- [ ] Verify the production deployment SHA matches the commit you intended to promote
- [ ] Test critical site routes and functionality to ensure the rollback worked as expected
- [ ] Review build logs in Cloudflare Pages UI for any warnings or issues

## When to use this vs manual promotion
- **Use this workflow** when you need to automate rollbacks, integrate with CI/CD, or have a reproducible audit trail in GitHub Actions.
- **Use manual promotion in Cloudflare UI** for quick one-off rollbacks or when you need to visually inspect deployment history before promoting.

## Troubleshooting
- If the workflow reports "No deployment found for commit SHA", it means Cloudflare Pages has not built that commit yet. You may need to:
  1. Trigger a new deployment for that commit (push or re-run the deploy workflow)
  2. Wait for the build to complete
  3. Re-run this rollback workflow
- If the restore API fails with a 4xx error, verify that:
  - The `CLOUDFLARE_API_TOKEN` has the correct permissions (Pages:Edit)
  - The `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_PROJECT_NAME` are correct
  - The deployment ID exists and is eligible for promotion (some deployments may be in a failed state)
