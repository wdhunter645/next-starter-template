# Cloudflare Configuration Checklist for Automated Deployment

## Status: ⚠️ Action Required by Repository Owner

This document provides a **complete checklist** of Cloudflare configuration requirements needed for automated deployments to work.

---

## 🎯 Quick Summary

**Current Status**: Deployments are failing due to insufficient API token permissions.

**What's Working**:
- ✅ GitHub Actions workflow builds successfully
- ✅ OpenNext build process completes
- ✅ Build artifacts are created in `.open-next/` directory

**What's Broken**:
- ❌ Cloudflare Pages deployment fails with authentication error
- ❌ Missing "User Details Read" permission on API token
- ❌ Production site is running old code (8+ days behind)

**Time to Fix**: ~5 minutes

---

## ✅ Configuration Checklist

### Step 1: Update Cloudflare API Token Permissions

The GitHub Actions workflow needs an API token with **two specific permissions**:

#### 1.1 Login to Cloudflare Dashboard
- [ ] Go to: https://dash.cloudflare.com/profile/api-tokens
- [ ] Click "View" or "Edit" on the token currently used for GitHub Actions
  - If you don't know which token, check the `CLOUDFLARE_API_TOKEN` secret value in GitHub

#### 1.2 Verify/Add Required Permissions

The token **MUST** have both of these permissions:

- [ ] **Account → Cloudflare Pages → Edit**
  - This allows deploying to Cloudflare Pages
  - Status: ✅ Usually already present

- [ ] **User → User Details → Read**
  - This allows Wrangler to verify authentication
  - Status: ⚠️ **MISSING** - This is causing deployment failures
  - **ACTION REQUIRED**: Add this permission now

#### 1.3 Save and Copy New Token

- [ ] Click "Continue to summary"
- [ ] Click "Update Token" (or "Create Token" if creating new)
- [ ] **IMPORTANT**: Copy the token value immediately
  - ⚠️ You won't be able to see it again after leaving this page
  - Save it temporarily in a secure location

---

### Step 2: Update GitHub Repository Secret

#### 2.1 Navigate to GitHub Secrets
- [ ] Go to: https://github.com/wdhunter645/next-starter-template/settings/secrets/actions
- [ ] Find the secret named `CLOUDFLARE_API_TOKEN`

#### 2.2 Update the Secret Value
- [ ] Click on `CLOUDFLARE_API_TOKEN`
- [ ] Click "Update secret"
- [ ] Paste your new token value (from Step 1.3)
- [ ] Click "Update secret"

---

### Step 3: Verify Other Required Secrets

Make sure these secrets are also configured:

#### 3.1 CLOUDFLARE_ACCOUNT_ID
- [ ] Check that `CLOUDFLARE_ACCOUNT_ID` secret exists
- [ ] If missing, get your Account ID from: https://dash.cloudflare.com
  - Look for "Account ID" in the sidebar or account overview

#### 3.2 CLOUDFLARE_PROJECT_NAME
- [ ] Check that `CLOUDFLARE_PROJECT_NAME` secret exists
- [ ] If missing, set it to your Cloudflare Pages project name
  - Usually: `next-starter-template`

---

### Step 4: Test the Fix

#### 4.1 Trigger a Deployment

Choose ONE of these methods:

**Option A: Manual Workflow Trigger** (Recommended)
- [ ] Go to: https://github.com/wdhunter645/next-starter-template/actions/workflows/deploy.yml
- [ ] Click "Run workflow"
- [ ] Select branch: `main`
- [ ] Leave "Number of previous commits to redeploy" as `0`
- [ ] Click "Run workflow"

**Option B: Push a New Commit**
- [ ] Make any small change to the repository
- [ ] Commit and push to `main` branch
- [ ] Workflow will trigger automatically

#### 4.2 Monitor the Workflow
- [ ] Go to: https://github.com/wdhunter645/next-starter-template/actions
- [ ] Click on the running workflow
- [ ] Watch the "Deploy to Cloudflare Pages" step
- [ ] Verify it completes successfully (✅ green checkmark)

#### 4.3 Verify Deployment in Cloudflare
- [ ] Go to Cloudflare Pages dashboard
- [ ] Find your `next-starter-template` project
- [ ] Check that a new deployment appears
- [ ] Verify the deployment is marked as "Active" or "Production"

#### 4.4 Verify Live Site
- [ ] Visit your Cloudflare Pages URL
- [ ] Verify the latest changes are visible
- [ ] Check that the site is functioning correctly

---

## 🔍 Troubleshooting

### Issue: Still Getting "Authentication error [code: 10000]"

**Solution**:
1. Double-check that you added **User → User Details → Read** permission
2. Make sure you **updated** the GitHub secret with the new token
3. Try regenerating a completely new token instead of editing the existing one

### Issue: "Project not found" Error

**Solution**:
1. Verify `CLOUDFLARE_PROJECT_NAME` matches your actual Cloudflare Pages project name
2. Check that the project exists in Cloudflare Pages dashboard
3. Ensure `CLOUDFLARE_ACCOUNT_ID` is correct

### Issue: "Invalid API token" Error

**Solution**:
1. Verify you copied the entire token without extra spaces
2. Check that the token hasn't expired
3. Regenerate the token if needed

---

## 📊 Expected Results After Configuration

Once configured correctly, every push to `main` will:

1. ✅ Trigger GitHub Actions workflow automatically
2. ✅ Build the Next.js application with OpenNext
3. ✅ Deploy to Cloudflare Pages
4. ✅ Make changes live on production URL within ~2 minutes

---

## 🔄 Alternative Deployment Options

If API token management is problematic, consider these alternatives:

### Option 1: Cloudflare Pages Git Integration

Instead of using GitHub Actions for deployment:

1. Go to Cloudflare Pages dashboard
2. Click "Create a project" or "Connect to Git"
3. Select your GitHub repository
4. Configure build settings:
   - **Build command**: `npx opennextjs-cloudflare build`
   - **Build output directory**: `.open-next`
5. Cloudflare will automatically deploy on every push to `main`

**Pros**:
- No API token needed in GitHub
- Simpler setup
- Managed entirely by Cloudflare

**Cons**:
- Deployment status not visible in GitHub Actions
- Can't use custom deployment scripts
- Less control over deployment process

### Option 2: Manual Deployments

For occasional manual deployments:

1. Install Wrangler CLI locally: `npm install -g wrangler`
2. Login: `wrangler login`
3. Build: `npx opennextjs-cloudflare build`
4. Deploy: `wrangler pages deploy .open-next --project-name=next-starter-template`

---

## 📝 Summary

**What You Need to Do**:
1. ✅ Add "User → User Details → Read" permission to Cloudflare API token
2. ✅ Update `CLOUDFLARE_API_TOKEN` secret in GitHub
3. ✅ Test by triggering a deployment
4. ✅ Verify it works

**Time Required**: ~5 minutes

**Difficulty**: Easy (just clicking through settings)

**Impact**: Fixes automated deployments, keeps production up-to-date

---

## 🆘 Need Help?

If you encounter issues:

1. Check the workflow logs in GitHub Actions for specific error messages
2. Review the existing documentation:
   - [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)
   - [DIAGNOSIS_SUMMARY.md](./DIAGNOSIS_SUMMARY.md)
3. Verify all secrets are correctly set in GitHub repository settings

---

**Last Updated**: October 28, 2025
**Status**: Waiting for repository owner to update API token permissions
