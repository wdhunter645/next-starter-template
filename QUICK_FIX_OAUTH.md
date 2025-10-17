# Quick Fix: OpenAI Not Appearing in OAuth List

## Problem
OpenAI (or any GitHub App) only appears in the "Installed Applications" list but not in the "OAuth Authorizations" list.

## Root Cause
The GitHub App is not configured with OAuth capabilities. Apps need explicit OAuth configuration to appear in the OAuth authorization list.

## Quick Solution (3 Steps)

### Step 1: Update GitHub App Settings

1. Go to your GitHub App settings:
   - **Personal:** https://github.com/settings/apps
   - **Organization:** https://github.com/organizations/YOUR_ORG/settings/apps

2. Select your app (e.g., "OpenAI")

3. Enable these settings:
   - ✅ **Check:** "Request user authorization (OAuth) during installation"
   - ✅ **Set:** "User authorization callback URL" to: `https://your-domain.com/api/auth/callback`
   - ✅ **Add:** At least one "User permission" (e.g., `email: read` or `profile: read`)
   - ✅ **Save changes**

### Step 2: Add Environment Variables

Add these to your `.env` file:

```bash
GITHUB_APP_CLIENT_ID=Iv1.your_client_id_here
GITHUB_APP_CLIENT_SECRET=your_client_secret_here
GITHUB_APP_ID=your_app_id_here
GITHUB_APP_INSTALLATION_ID=your_installation_id_here
```

### Step 3: Reauthorize the App

Existing installations won't automatically update:
- Users must **uninstall and reinstall** the app, OR
- Users must visit the app's reauthorization URL

## Verification

After completing these steps, verify the fix:

1. **Installed Apps:** https://github.com/settings/installations
   - ✅ Your app should be here

2. **OAuth Apps:** https://github.com/settings/apps/authorizations
   - ✅ Your app should NOW be here (this was missing before!)

## Files Created in This Fix

This repository now includes:

- **`.github/github-app-manifest.yml`** - Manifest for creating new apps with OAuth
- **`.github/README.md`** - Configuration guide for GitHub Apps
- **`docs/GITHUB_APP_OAUTH.md`** - Comprehensive OAuth documentation
- **`src/app/api/auth/callback/route.ts`** - OAuth callback handler
- **`src/app/auth/success/page.tsx`** - Success page
- **`src/app/auth/error/page.tsx`** - Error page
- **`.env.example`** - Updated with GitHub App variables

## Alternative: Create New App from Manifest

If you want to create a brand new GitHub App with OAuth pre-configured:

1. Go to: https://github.com/settings/apps/new?from_manifest=true
2. Paste the contents of `.github/github-app-manifest.yml`
3. Click "Create GitHub App from manifest"

The new app will automatically have OAuth capabilities enabled!

## Why This Matters

**Without OAuth:**
- App only has installation-level permissions
- Can't act on behalf of individual users
- Only appears in "Installed Apps"

**With OAuth:**
- App can request user-level permissions
- Can act on behalf of specific users
- Appears in BOTH "Installed Apps" AND "OAuth Apps" lists ✅

## Need More Help?

See the comprehensive documentation:
- **Full guide:** `docs/GITHUB_APP_OAUTH.md`
- **GitHub's docs:** https://docs.github.com/en/apps
- **OAuth flow:** https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/identifying-and-authorizing-users-for-github-apps

---

**Summary:** To make a GitHub App appear in the OAuth list, you must:
1. Enable "Request user authorization (OAuth) during installation"
2. Set a callback URL
3. Request at least one user permission
4. Have users reauthorize the app
