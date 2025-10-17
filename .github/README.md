# GitHub App Configuration

This directory contains configuration for GitHub Apps integration.

## Files

### `github-app-manifest.yml`

This is a GitHub App manifest that defines a GitHub App with OAuth capabilities. This manifest can be used to create a new GitHub App that will properly appear in the OAuth authorization list (not just the installed apps list).

## Why This Is Needed

### The Problem
When a GitHub App is created without proper OAuth configuration, it only appears in the "Installed Applications" list but not in the "OAuth Authorizations" list. This means:
- The app can only act with installation permissions
- Users cannot authorize the app to act on their behalf
- The app cannot request user-level permissions

### The Solution
By configuring the GitHub App with:
1. `request_oauth_on_install: true` - Triggers OAuth flow during installation
2. A valid `callback_url` - Where GitHub redirects after authorization
3. `user_permissions` - Specific permissions requested from users

The app will now appear in both:
- **Installed Applications** (at https://github.com/settings/installations)
- **Authorized OAuth Apps** (at https://github.com/settings/apps/authorizations)

## How to Use the Manifest

### Creating a New GitHub App

1. **For Personal Account:**
   - Go to: https://github.com/settings/apps/new?from_manifest=true
   - Paste the contents of `github-app-manifest.yml`
   - Click "Create GitHub App from manifest"

2. **For Organization:**
   - Go to: https://github.com/organizations/YOUR_ORG/settings/apps/new?from_manifest=true
   - Paste the contents of `github-app-manifest.yml`
   - Click "Create GitHub App from manifest"

### Updating an Existing GitHub App (e.g., "OpenAI")

If you already have a GitHub App that isn't appearing in the OAuth list:

1. Go to your GitHub App settings:
   - Personal: https://github.com/settings/apps
   - Organization: https://github.com/organizations/YOUR_ORG/settings/apps

2. Select your app (e.g., "OpenAI")

3. Update these settings:
   - ✅ Check "Request user authorization (OAuth) during installation"
   - ✅ Set "User authorization callback URL": `https://your-domain.com/api/auth/callback`
   - ✅ Set at least one "User permission" (e.g., email: read)
   - ✅ Save changes

4. Users will need to reauthorize:
   - Existing installations won't automatically update
   - Users must uninstall and reinstall, or
   - Visit the reauthorization URL

## Required Environment Variables

After creating your GitHub App, you'll receive credentials. Add these to your `.env` file:

```bash
GITHUB_APP_CLIENT_ID=Iv1.abc123...
GITHUB_APP_CLIENT_SECRET=your_secret_here
GITHUB_APP_ID=123456
GITHUB_APP_INSTALLATION_ID=789012
```

See `.env.example` for a template.

## API Endpoints

The following API endpoints handle the OAuth flow:

- `/api/auth/callback` - OAuth callback endpoint (receives authorization codes)
- `/auth/success` - Success page after authorization
- `/auth/error` - Error page if authorization fails

## Verification

After configuration, verify the app appears correctly:

1. **Check Installations:**
   - Go to: https://github.com/settings/installations
   - Your app should be listed

2. **Check OAuth Authorizations:**
   - Go to: https://github.com/settings/apps/authorizations
   - Your app should also be listed here (this is what was missing!)

## Security Notes

- Always use HTTPS for callback URLs in production
- Never commit your `.env` file or secrets
- Use the `state` parameter to prevent CSRF attacks
- Request minimal permissions needed for your use case
- Regularly rotate your client secret

## Further Documentation

See `/docs/GITHUB_APP_OAUTH.md` for detailed documentation on:
- OAuth flow diagrams
- Step-by-step configuration guide
- Common issues and troubleshooting
- Code examples
- Security best practices

## References

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [Creating Apps from Manifest](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps-from-a-manifest)
- [OAuth for GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/identifying-and-authorizing-users-for-github-apps)
