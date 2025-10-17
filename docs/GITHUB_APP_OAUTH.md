# GitHub App OAuth Configuration Guide

## Problem
OpenAI (or any GitHub App) doesn't appear in the OAuth authorization list, only in the installed apps list.

## Root Cause
A GitHub App needs to be explicitly configured with OAuth capabilities to appear in the OAuth authorization flow. By default, GitHub Apps only appear in the installed apps list unless they request user authorization via OAuth.

## Solution

### Understanding the Difference

**Installed Apps:**
- Apps that are installed on repositories or organizations
- Have permissions based on installation permissions
- Act on behalf of the installation, not individual users

**OAuth Apps:**
- Apps that request authorization from individual users
- Use OAuth flow to get user-level permissions
- Can act on behalf of specific users

### Configuring OAuth for GitHub Apps

#### Option 1: Using the GitHub App Manifest (Recommended)

1. **Create a GitHub App from Manifest:**
   - Navigate to: https://github.com/settings/apps/new?from_manifest=true
   - Or for organizations: https://github.com/organizations/YOUR_ORG/settings/apps/new?from_manifest=true

2. **Paste the manifest content** from `.github/github-app-manifest.yml`

3. **The manifest includes key OAuth settings:**
   ```yaml
   request_oauth_on_install: true  # This makes it appear in OAuth list
   callback_url: "your-callback-url"
   user_permissions:
     email: read
     profile: read
   ```

#### Option 2: Configuring an Existing GitHub App

If you already have a GitHub App (like "OpenAI"), you need to:

1. **Go to GitHub App Settings:**
   - Personal: https://github.com/settings/apps
   - Organization: https://github.com/organizations/YOUR_ORG/settings/apps

2. **Select your app** (e.g., "OpenAI")

3. **Enable OAuth:**
   - Scroll to "Identifying and authorizing users"
   - Check "Request user authorization (OAuth) during installation"
   - Set "User authorization callback URL": `https://your-app.com/api/auth/callback`
   - Set "Setup URL" (optional): `https://your-app.com/setup`

4. **Configure User Permissions:**
   - Scroll to "User permissions"
   - Add the permissions your app needs (e.g., email:read, profile:read)

5. **Save changes**

### Key OAuth Settings Explained

| Setting | Purpose | Required for OAuth List |
|---------|---------|------------------------|
| `request_oauth_on_install` | Triggers OAuth flow during installation | ✅ Yes |
| `callback_url` | Where GitHub redirects after authorization | ✅ Yes |
| `user_permissions` | Scopes requested from users | ✅ Yes (at least one) |
| `redirect_url` | Post-installation redirect | ❌ No |

### Verification Steps

After configuration:

1. **Check OAuth Authorization:**
   - Go to: https://github.com/settings/apps/authorizations
   - Your app should now appear in this list

2. **Test OAuth Flow:**
   - Uninstall and reinstall the app
   - You should see an OAuth authorization screen
   - After authorizing, the app appears in both:
     - Installed applications: https://github.com/settings/installations
     - Authorized OAuth apps: https://github.com/settings/apps/authorizations

### Common Issues

#### App Still Not in OAuth List
- **Cause:** OAuth not enabled or no user permissions set
- **Fix:** Ensure `request_oauth_on_install: true` and at least one user permission

#### "Invalid callback URL" Error
- **Cause:** Callback URL not set or invalid
- **Fix:** Set a valid HTTPS URL in callback settings

#### Users Not Prompted for Authorization
- **Cause:** App installed before OAuth was enabled
- **Fix:** Users must reauthorize or reinstall the app

### OAuth Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  User Installs GitHub App                               │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub Checks: request_oauth_on_install = true?        │
└─────────────────┬──────────────┬────────────────────────┘
                  │              │
        ┌─────────┘              └─────────┐
        │ YES                               │ NO
        ▼                                   ▼
┌───────────────────────┐      ┌──────────────────────────┐
│  Redirect to OAuth    │      │  Skip OAuth              │
│  Authorization Screen │      │  Install Only            │
└───────┬───────────────┘      └──────────┬───────────────┘
        │                                  │
        ▼                                  ▼
┌───────────────────────┐      ┌──────────────────────────┐
│  User Grants/Denies   │      │  Appears in Installed    │
│  Permissions          │      │  Apps List Only          │
└───────┬───────────────┘      └──────────────────────────┘
        │
        ▼
┌───────────────────────┐
│  Callback to App      │
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│  Appears in Both:     │
│  • Installed Apps     │
│  • OAuth Apps         │
└───────────────────────┘
```

### Example Code for OAuth Callback

```typescript
// pages/api/auth/callback.ts or app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_APP_CLIENT_ID,
        client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
        code,
        state,
      }),
    });

    const data = await tokenResponse.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    // Store access_token securely
    // Redirect to success page
    return NextResponse.redirect(new URL('/auth/success', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Security Best Practices

1. **Use HTTPS Only:** OAuth callbacks must use HTTPS in production
2. **Validate State Parameter:** Prevent CSRF attacks
3. **Store Secrets Securely:** Use environment variables
4. **Minimal Permissions:** Request only needed scopes
5. **Token Rotation:** Implement refresh token flow if needed

### Environment Variables

Add these to your `.env.local`:

```bash
# GitHub App OAuth Configuration
GITHUB_APP_CLIENT_ID=Iv1.your_client_id
GITHUB_APP_CLIENT_SECRET=your_client_secret
GITHUB_APP_ID=your_app_id
GITHUB_APP_INSTALLATION_ID=your_installation_id
```

### Further Reading

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [Creating GitHub Apps from Manifest](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps-from-a-manifest)
- [Identifying and authorizing users](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/identifying-and-authorizing-users-for-github-apps)
- [GitHub OAuth Flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)

## Summary

To make a GitHub App (like OpenAI) appear in the OAuth authorization list:

1. ✅ Set `request_oauth_on_install: true`
2. ✅ Configure a valid callback URL
3. ✅ Request at least one user permission
4. ✅ Have users reauthorize the app after changes

The app will then appear in both:
- **Installed applications** (installation permissions)
- **Authorized OAuth Apps** (user permissions)
