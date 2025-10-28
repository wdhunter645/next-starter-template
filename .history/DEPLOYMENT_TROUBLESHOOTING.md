# Deployment Troubleshooting Guide

## Current Issue: Builds Not Deploying to Production

### Problem Summary
PR #142 and subsequent builds successfully complete but fail to deploy to Cloudflare Pages. The builds are created but never promoted to production, leaving the live site running an 8-day-old deployment.

### Root Cause
The GitHub Actions workflow fails during the deployment step with:
```
Authentication error [code: 10000]
Unable to retrieve email for this user. Are you missing the `User->User Details->Read` permission?
```

This occurs because the `CLOUDFLARE_API_TOKEN` GitHub secret has insufficient permissions.

## Required Fix

### Step 1: Update Cloudflare API Token Permissions

The Cloudflare API token stored in the `CLOUDFLARE_API_TOKEN` GitHub secret needs the following permissions:

**Currently has:**
- ✅ Cloudflare Pages:Edit

**Missing (required):**
- ❌ User:User Details:Read

### Step 2: How to Update the API Token

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com/profile/api-tokens

2. **Edit the Existing Token**
   - Find the API token currently used for GitHub Actions
   - Click "Edit" on that token

3. **Add the Missing Permission**
   - Under "Permissions", add:
     - User → User Details → Read
   - Keep the existing permission:
     - Account → Cloudflare Pages → Edit

4. **Save and Copy the Token**
   - Click "Continue to summary"
   - Click "Update Token" (or "Create Token" if creating new)
   - **Important:** Copy the token immediately (it won't be shown again)

5. **Update GitHub Secret**
   - Go to https://github.com/wdhunter645/next-starter-template/settings/secrets/actions
   - Click on `CLOUDFLARE_API_TOKEN`
   - Click "Update secret"
   - Paste the new token value
   - Click "Update secret"

### Step 3: Verify the Fix

After updating the secret:

1. **Trigger a new deployment:**
   - You can manually trigger the workflow:
     - Go to: https://github.com/wdhunter645/next-starter-template/actions/workflows/deploy.yml
     - Click "Run workflow"
     - Select branch: `main`
     - Click "Run workflow"

2. **Monitor the workflow:**
   - Watch the workflow run to ensure it completes successfully
   - Check that the "Deploy to Cloudflare Pages" step succeeds
   - Verify the deployment appears in Cloudflare Pages dashboard

3. **Confirm production deployment:**
   - Visit your Cloudflare Pages project
   - Verify the latest deployment is marked as "Active"

## Technical Details

### What Changed

**PR #139** removed the deployment step because of this authentication error, changing the workflow to only build (not deploy). This allowed builds to succeed but left deployments manual.

**PR #142** re-added the deployment step to automate deployments again, but the underlying authentication issue was not resolved, causing deployments to fail.

### Workflow Behavior

- ✅ **Checkout code** - Working
- ✅ **Install dependencies** - Working  
- ✅ **Build with OpenNext** - Working
- ❌ **Deploy to Cloudflare Pages** - Failing due to auth

### Why This Permission Is Required

Wrangler (the Cloudflare CLI tool) requires the "User Details Read" permission to:
1. Verify the API token is valid
2. Display the user's email and account information
3. List available accounts for deployment
4. Properly authenticate Pages deployment requests

Without this permission, the API call to Cloudflare fails before deployment can occur.

## Alternative: Direct Deploy Without Wrangler

If you prefer not to use API tokens, you can configure Cloudflare Pages to automatically build and deploy from GitHub:

1. Go to Cloudflare Pages dashboard
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npx opennextjs-cloudflare build`
   - Build output directory: `.open-next`
4. Cloudflare will automatically deploy on every push to main

This approach:
- ✅ No API token needed
- ✅ Automatic deployments
- ❌ No deployment step in GitHub Actions (build only)
- ❌ Less control over deployment process

## Summary

**To fix deployments:**
1. Update the Cloudflare API token to include "User:User Details:Read" permission
2. Update the `CLOUDFLARE_API_TOKEN` secret in GitHub
3. Run the deploy workflow to verify the fix

**Once fixed:**
- Every push to `main` will automatically build and deploy
- Deployments will appear in both GitHub Actions and Cloudflare Pages
- The production site will stay up to date with the latest code
