# Quick Guide: Retry PR#135 Build Update

## Objective
Retry sending the build update for PR#135 using the new manual redeploy feature from PR#144.

## Background
- **PR#135**: Removed "Milestones" from the top navigation menu
- **PR#144**: Added manual redeploy capability to the workflow
- The merge commit from PR#135 is in the main branch history
- We can now trigger a redeploy without creating new commits

## Steps to Retry PR#135 Build

### Option 1: Using GitHub UI (Recommended)

1. **Go to GitHub Actions**
   - Navigate to: https://github.com/wdhunter645/next-starter-template/actions
   - Or click: Repository → Actions tab

2. **Select the Workflow**
   - Click on "Deploy to Cloudflare Pages" in the left sidebar

3. **Run Workflow Manually**
   - Click the "Run workflow" dropdown button (top right)
   - Ensure "Branch: main" is selected
   - Set `redeploy_count` to `1` (to redeploy just the PR#135 commit)
   - Click "Run workflow"

4. **Monitor Progress**
   - The workflow will appear in the runs list
   - Click on it to view real-time logs
   - Wait for the build and deployment to complete

### Option 2: Using GitHub CLI

If you have `gh` CLI installed:

```bash
gh workflow run deploy.yml \
  --ref main \
  --field redeploy_count=1
```

## What Happens

1. The workflow will:
   - ✅ Check out the current main branch
   - ✅ Build the application using OpenNext
   - ✅ Deploy the current version to Cloudflare Pages
   - ✅ Redeploy the last commit (PR#135) with its original metadata

2. Expected outcome:
   - PR#135 changes (removal of Milestones menu item) will be redeployed
   - Cloudflare Pages will show the updated deployment
   - Original commit hash and message will be preserved

## Verification

After the workflow completes:

1. **Check GitHub Actions**
   - Verify the workflow run shows all green checkmarks
   - Review the logs for "Redeploying last 1 commits"
   - Confirm no errors in the deployment step

2. **Check Cloudflare Pages**
   - Log into Cloudflare Dashboard
   - Navigate to Workers & Pages → Your project
   - Verify the deployment shows the correct commit
   - The deployment should reflect the PR#135 changes

3. **Check Live Site**
   - Visit your production URL
   - Verify the "Milestones" menu item is not present
   - Navigation should show: Weekly Matchup, Charities, News & Q&A, Calendar, Join

## Troubleshooting

### If the workflow fails:
- Check the job logs for specific error messages
- Verify secrets are configured: `CLOUDFLARE_API_TOKEN` (or `CF_API_TOKEN`), `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PROJECT_NAME`
- Ensure the Cloudflare API token has the correct permissions

### If deployment succeeds but changes aren't visible:
- Check Cloudflare Pages deployment status
- Verify the correct project is being deployed to
- Clear browser cache and hard refresh
- Check if there are any caching issues in Cloudflare

## Alternative: Redeploy Multiple Commits

If you want to redeploy more than just PR#135:

- Set `redeploy_count` to a higher number
- Examples:
  - `redeploy_count: 3` → Redeploys last 3 commits
  - `redeploy_count: 5` → Redeploys last 5 commits

The workflow will process them in order, ensuring each deployment is properly recorded.

## Notes

- ✅ This is a safe operation - it doesn't modify git history
- ✅ Each redeploy uses the build from the current workflow run
- ✅ Original commit hashes and messages are preserved
- ✅ You can run this as many times as needed
- ⚠️ Keep `redeploy_count` reasonable (<10) to avoid long-running workflows

---
*Created: 2025-10-28*
*Related PRs: #135, #144*
