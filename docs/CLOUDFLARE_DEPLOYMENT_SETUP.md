# Cloudflare Pages Deployment Setup Guide

## Current Status

✅ **Build Process**: Working correctly  
❌ **Deployment**: Failing due to missing GitHub secrets

## Problem

The Cloudflare Pages deployment workflow (`.github/workflows/cf-pages.yml`) is failing with:

```
Error: Input required and not supplied: apiToken
```

This happens because required GitHub repository secrets are not configured.

## Required Secrets

The workflow requires these secrets to be set in GitHub:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `CF_API_TOKEN` | Cloudflare API token with Pages edit permissions | ✅ Yes |
| `CF_ACCOUNT_ID` | Your Cloudflare account ID | ✅ Yes |
| `CF_PAGES_PROJECT` | Cloudflare Pages project name | ❌ No (defaults to 'next-starter-template') |

## How to Fix

### Option 1: Automated Setup (Recommended)

Use the provided setup script:

```bash
# 1. Create your .env file from the template
cp .env.example .env

# 2. Edit .env and add your Cloudflare credentials
#    (See "How to Get Credentials" section below)
nano .env  # or use your preferred editor

# 3. Ensure GitHub CLI is authenticated
gh auth status
# If not authenticated, run: gh auth login

# 4. Run the secrets setup script
./create-github-secrets.sh

# 5. Verify secrets were created
gh secret list --repo wdhunter645/next-starter-template
```

### Option 2: Manual Setup via GitHub UI

1. Navigate to: `https://github.com/wdhunter645/next-starter-template/settings/secrets/actions`
2. Click "New repository secret"
3. Add each secret:
   - Name: `CF_API_TOKEN`, Value: (your Cloudflare API token)
   - Name: `CF_ACCOUNT_ID`, Value: (your Cloudflare account ID)

### Option 3: Manual Setup via GitHub CLI

```bash
# Set the API token
gh secret set CF_API_TOKEN --repo wdhunter645/next-starter-template
# (paste your token when prompted)

# Set the account ID
gh secret set CF_ACCOUNT_ID --repo wdhunter645/next-starter-template
# (paste your account ID when prompted)
```

## How to Get Cloudflare Credentials

### Getting Your Account ID

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Your Account ID appears in:
   - The URL when viewing any page: `dash.cloudflare.com/{ACCOUNT_ID}/...`
   - The right sidebar of most pages under "Account ID"
   - Workers & Pages → Overview → Right sidebar

### Creating an API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on your profile icon → My Profile
3. Go to "API Tokens" tab
4. Click "Create Token"
5. Use the **"Cloudflare Pages"** template (recommended)
   - Or create a custom token with these permissions:
     - Account: `Cloudflare Pages:Edit`
6. Copy the token immediately (it's only shown once!)

**Security Note**: Store your API token securely. If you lose it, generate a new one.

## Verification

After setting up the secrets, test the deployment:

```bash
# Trigger the workflow manually
gh workflow run cf-pages.yml --repo wdhunter645/next-starter-template

# Or push a commit to main branch
git commit --allow-empty -m "test: trigger Cloudflare deployment"
git push origin main

# Watch the workflow run
gh run watch --repo wdhunter645/next-starter-template
```

The workflow should now:
1. ✅ Check out code
2. ✅ Set up Node.js with npm cache
3. ✅ Install dependencies
4. ✅ Build Next.js with OpenNext adapter
5. ✅ Deploy to Cloudflare Pages

## What the Workflow Does

The `.github/workflows/cf-pages.yml` workflow:

1. **Triggers on**:
   - Push to `main` branch
   - Manual workflow dispatch

2. **Build Steps**:
   - Checks out repository
   - Sets up Node.js 20.x with npm caching
   - Installs dependencies with `npm ci`
   - Builds the app with `npx opennextjs-cloudflare build`
   - Outputs to `.open-next/` directory

3. **Deploy Step**:
   - Uses `cloudflare/pages-action@v1`
   - Authenticates with `CF_API_TOKEN`
   - Deploys to project specified by `CF_PAGES_PROJECT` variable
   - Uses output directory `.open-next/`

## Troubleshooting

### "API token is invalid"

- Verify your token has the correct permissions
- Check that the token hasn't expired
- Generate a new token if needed

### "Account ID is invalid"

- Double-check you copied the entire Account ID
- Ensure there are no spaces or extra characters

### "Project not found"

Either:
- Create a Pages project in Cloudflare Dashboard first
- Or set the `CF_PAGES_PROJECT` variable to match an existing project

### Build succeeds but deployment fails

Check:
1. Secrets are set correctly (no typos in secret names)
2. API token has required permissions
3. Account ID matches the account owning the Pages project

### How to check if secrets are set

```bash
# List all secrets (doesn't show values for security)
gh secret list --repo wdhunter645/next-starter-template

# Expected output should show:
# CF_ACCOUNT_ID    Updated YYYY-MM-DD
# CF_API_TOKEN     Updated YYYY-MM-DD
```

## Expected Deployment URL

After successful deployment, your site will be available at:
- Production: `https://next-starter-template.pages.dev`
- Or your custom domain if configured

## Related Documentation

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
- [GitHub Secrets Setup](../SECRETS_SETUP.md)
- [Workflow Configuration](../.github/workflows/cf-pages.yml)

## Support

If you continue to experience issues after following this guide:

1. Check the [GitHub Actions logs](https://github.com/wdhunter645/next-starter-template/actions)
2. Review the full error message
3. Verify all prerequisites are met
4. Ensure your Cloudflare account has Pages enabled
