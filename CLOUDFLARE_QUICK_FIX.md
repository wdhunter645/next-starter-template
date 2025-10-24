# Cloudflare Deployment - Quick Fix

## Problem
Cloudflare workflows failing with: `Error: Input required and not supplied: apiToken`

## Solution
Configure two GitHub secrets with your Cloudflare credentials.

## Quick Steps

### 1. Get Your Cloudflare Credentials

**Account ID**:
- Go to https://dash.cloudflare.com
- Look at the URL or right sidebar
- Copy the 32-character hex string

**API Token**:
- Go to https://dash.cloudflare.com/profile/api-tokens
- Click "Create Token"
- Use "Cloudflare Pages" template
- Click "Continue to summary" → "Create Token"
- **Copy the token immediately** (shown only once)

### 2. Add Secrets to GitHub

Choose ONE method:

#### Method A: Automated Script (Easiest)
```bash
# 1. Create .env file
cp .env.example .env

# 2. Edit .env and add your credentials
nano .env
# Add these lines:
# CLOUDFLARE_ACCOUNT_ID=your_account_id_here
# CLOUDFLARE_API_TOKEN=your_api_token_here

# 3. Run setup script
./create-github-secrets.sh
```

#### Method B: GitHub UI (Simple)
1. Go to https://github.com/wdhunter645/next-starter-template/settings/secrets/actions
2. Click "New repository secret"
3. Add secret `CF_API_TOKEN` with your API token
4. Click "New repository secret" again
5. Add secret `CF_ACCOUNT_ID` with your account ID

#### Method C: Command Line (Fast)
```bash
gh secret set CF_API_TOKEN --repo wdhunter645/next-starter-template
# (paste your API token when prompted)

gh secret set CF_ACCOUNT_ID --repo wdhunter645/next-starter-template
# (paste your account ID when prompted)
```

### 3. Verify Setup

```bash
# Check secrets are set
gh secret list --repo wdhunter645/next-starter-template

# Expected output:
# CF_ACCOUNT_ID    Updated YYYY-MM-DD
# CF_API_TOKEN     Updated YYYY-MM-DD
```

### 4. Test Deployment

```bash
# Trigger workflow manually
gh workflow run cf-pages.yml --repo wdhunter645/next-starter-template

# Or push a commit to main
git commit --allow-empty -m "test: trigger deployment"
git push origin main
```

## That's It!

Your Cloudflare deployments should now work. Site will be at:
https://next-starter-template.pages.dev

## Need More Help?

See the full guide: [docs/CLOUDFLARE_DEPLOYMENT_SETUP.md](./docs/CLOUDFLARE_DEPLOYMENT_SETUP.md)

## What This Fixes

- ✅ `cf-pages.yml` - Auto deployment on push to main
- ✅ `cf-one-shot.yml` - Manual deployments
- ✅ `cf-triage.yml` - Triage workflow
- ✅ `cf-killswitch-triage.yml` - Emergency control

All workflows use the same two secrets!
