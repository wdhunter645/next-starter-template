# GitHub App OAuth Flow Diagram

## Before Fix: App Only in Installed List

```
┌─────────────────────────────────────────┐
│  User Installs GitHub App               │
│  (request_oauth_on_install = false)     │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  GitHub: No OAuth needed                │
│  Install app directly                   │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  ✅ Appears in: Installed Apps          │
│  ❌ Missing from: OAuth Apps            │
└─────────────────────────────────────────┘
```

## After Fix: App in Both Lists

```
┌─────────────────────────────────────────┐
│  User Installs GitHub App               │
│  (request_oauth_on_install = true)      │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  GitHub: Redirect to OAuth              │
│  Authorization Screen                   │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  User Reviews Permissions               │
│  - Profile access                       │
│  - Email access                         │
│  - etc.                                 │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  User Clicks "Authorize"                │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  GitHub Redirects to Callback URL       │
│  /api/auth/callback?code=ABC123         │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  App Exchanges Code for Access Token    │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  ✅ Appears in: Installed Apps          │
│  ✅ Appears in: OAuth Apps              │
└─────────────────────────────────────────┘
```

## Key Configuration Differences

### Without OAuth (Before)

```yaml
# App only has installation permissions
default_permissions:
  contents: read
  issues: write

# Missing OAuth configuration
request_oauth_on_install: false  # or not set
# No callback_url
# No user_permissions
```

**Result:** App appears only in Installed Apps list

### With OAuth (After)

```yaml
# App has installation permissions
default_permissions:
  contents: read
  issues: write

# OAuth configuration enabled
request_oauth_on_install: true  # ✅ KEY SETTING
callback_url: "https://your-app.com/api/auth/callback"  # ✅ REQUIRED

# User-level permissions
user_permissions:
  email: read      # ✅ AT LEAST ONE REQUIRED
  profile: read
```

**Result:** App appears in BOTH Installed Apps and OAuth Apps lists

## OAuth Authorization Screen

When OAuth is properly configured, users see:

```
┌────────────────────────────────────────────────┐
│  Authorize OpenAI                              │
│                                                │
│  OpenAI by YOUR_ORGANIZATION wants to access   │
│  your GitHub account                           │
│                                                │
│  This application will be able to:             │
│                                                │
│  ✓ Read your email address                    │
│  ✓ Read your profile information              │
│                                                │
│  Repository permissions:                       │
│  ✓ Read repository contents                   │
│  ✓ Write to issues                            │
│                                                │
│  [ Authorize ]  [ Cancel ]                    │
└────────────────────────────────────────────────┘
```

Without OAuth, this screen never appears!

## Where Apps Appear

### GitHub Settings Pages

```
Settings → Applications

├─ Installed GitHub Apps
│  ├─ OpenAI ✅ (Always appears if installed)
│  ├─ Other App
│  └─ Another App
│
└─ Authorized OAuth Apps
   ├─ OpenAI ✅ (Only if OAuth enabled!)
   ├─ Copilot
   └─ Other OAuth App
```

## Implementation Flow

```
Repository Changes
    │
    ├─ .github/github-app-manifest.yml
    │  └─ Defines OAuth configuration
    │
    ├─ src/app/api/auth/callback/route.ts
    │  └─ Handles OAuth callback
    │
    ├─ src/app/auth/success/page.tsx
    │  └─ Success page after auth
    │
    └─ src/app/auth/error/page.tsx
       └─ Error page if auth fails

GitHub App Settings
    │
    ├─ Enable "Request user authorization (OAuth)"
    ├─ Set callback URL
    └─ Add user permissions

Environment Variables
    │
    ├─ GITHUB_APP_CLIENT_ID
    ├─ GITHUB_APP_CLIENT_SECRET
    ├─ GITHUB_APP_ID
    └─ GITHUB_APP_INSTALLATION_ID

User Action
    │
    └─ Reauthorize app (uninstall/reinstall)

Result
    │
    └─ App appears in OAuth list! ✅
```

## Common Mistakes

### ❌ Mistake 1: No OAuth Request
```yaml
# Missing or false
request_oauth_on_install: false
```
**Fix:** Set to `true`

### ❌ Mistake 2: No Callback URL
```yaml
# Missing callback URL
request_oauth_on_install: true
# callback_url: ???
```
**Fix:** Add valid HTTPS callback URL

### ❌ Mistake 3: No User Permissions
```yaml
request_oauth_on_install: true
callback_url: "https://example.com/callback"
# user_permissions: ???
```
**Fix:** Add at least one user permission

### ❌ Mistake 4: Not Reauthorizing
Changing settings but not reauthorizing the app
**Fix:** Users must reauthorize after OAuth is enabled

## Testing Checklist

- [ ] OAuth enabled in GitHub App settings
- [ ] Callback URL configured
- [ ] At least one user permission set
- [ ] Environment variables configured
- [ ] Callback endpoint deployed
- [ ] App reinstalled/reauthorized
- [ ] Check: App appears in Installed Apps
- [ ] Check: App appears in OAuth Apps ✅

---

**The Key Insight:**

Installation permissions ≠ OAuth permissions

- **Installation**: Repository/organization level
- **OAuth**: Individual user level

Both are needed for the app to appear in the OAuth list!
