# Codespaces Logout and Re-authentication Guide

This guide specifically addresses the issue: **"Codespaces isn't letting me log out to sign back in using an account-level token"**

## The Problem

When working in GitHub Codespaces, you may encounter a situation where:
- You need to switch from the implicit Codespaces token to your account-level Personal Access Token (PAT)
- Codespaces appears to be "stuck" using cached authentication
- Standard logout commands don't seem to work or Codespaces keeps re-authenticating automatically
- You can't clear the authentication cache to use your own token

## Quick Solution

Run these commands in your Codespace terminal to force a complete logout and re-authentication:

```bash
# Step 1: Log out of GitHub CLI completely
gh auth logout

# Step 2: Clear all Git credential caches
git credential-cache exit
rm -f ~/.git-credentials

# Step 3: Unset any credential helpers
git config --global --unset credential.helper

# Step 4: Clear any environment-based GitHub tokens
unset GITHUB_TOKEN
unset GH_TOKEN

# Step 5: Log back in with your account-level token
gh auth login
```

Follow the prompts to authenticate with your account-level token.

## Detailed Step-by-Step Process

### 1. Force Logout from GitHub CLI

The GitHub CLI (`gh`) may be using the Codespaces implicit token. Force a complete logout:

```bash
# Log out (this may show "not logged in" - that's okay)
gh auth logout

# Verify you're logged out
gh auth status
# Should show: You are not logged into any GitHub hosts
```

### 2. Clear All Git Credentials

Remove all cached Git credentials from multiple locations:

```bash
# Clear credential cache daemon
git credential-cache exit

# Remove stored credentials file
rm -f ~/.git-credentials

# Remove any Git credential manager credentials
rm -f ~/.config/git/credentials

# Clear any credential helper configuration
git config --global --unset credential.helper
git config --system --unset credential.helper 2>/dev/null || true
git config --local --unset credential.helper 2>/dev/null || true
```

### 3. Clear Environment Variables

Codespaces sets environment variables that may contain tokens. Clear them:

```bash
# Clear GitHub-related environment variables
unset GITHUB_TOKEN
unset GH_TOKEN
unset GITHUB_API_TOKEN

# Verify they're cleared
echo "GITHUB_TOKEN: $GITHUB_TOKEN"  # Should be empty
echo "GH_TOKEN: $GH_TOKEN"          # Should be empty
```

**Note**: These environment variables will be reset when you restart your Codespace, but clearing them now prevents conflicts.

### 4. Re-authenticate with Account-Level Token

Now log in with your account-level token:

```bash
# Start the login process
gh auth login

# Choose the following options:
# 1. "GitHub.com"
# 2. "HTTPS" as the protocol
# 3. "Paste an authentication token"
```

### 5. Create Your Account-Level Token (if needed)

If you don't have a Personal Access Token yet:

1. Visit: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: "Codespaces Development - [Current Date]"
4. Set expiration: 90 days (recommended) or custom
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `admin:org` → `read:org` (Read org and team membership)
6. Click "Generate token"
7. **Copy the token immediately** - you won't see it again!

### 6. Paste Your Token

When prompted by `gh auth login`:
- Paste your account-level token
- Press Enter

### 7. Verify Authentication

Confirm everything is working:

```bash
# Check GitHub CLI authentication
gh auth status

# Test Git operations
git ls-remote

# Try a push (if you have changes)
git push
```

## Alternative: Direct Git Configuration

If you prefer to configure Git directly without using GitHub CLI:

```bash
# Configure credential helper
git config --global credential.helper store

# Try to push (this will prompt for credentials)
git push

# When prompted:
# Username: your-github-username
# Password: paste-your-account-level-PAT
```

## If Codespaces Keeps Re-authenticating

If Codespaces keeps automatically re-authenticating with the implicit token:

### Option 1: Restart Codespace

```bash
# In the Codespace terminal
exit
```

Then in your browser:
1. Go to https://github.com/codespaces
2. Find your Codespace
3. Click the three dots (⋯)
4. Select "Stop codespace"
5. Wait a few seconds
6. Click "Start codespace"
7. Once restarted, run the logout commands again

### Option 2: Delete and Recreate Codespace

If the issue persists:

1. Go to https://github.com/codespaces
2. Find your Codespace
3. Click the three dots (⋯)
4. Select "Delete"
5. Create a new Codespace for the repository
6. Immediately run the authentication commands before making any Git operations

### Option 3: Use Environment Variables Override

If you need to work immediately while troubleshooting:

```bash
# Create an alias that uses your token explicitly
alias git-push='git -c credential.helper= push'

# Use it like this
git-push
# You'll be prompted for username and PAT
```

## Troubleshooting

### "gh: command not found"

If GitHub CLI isn't installed:

```bash
# Install GitHub CLI in Codespaces
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh -y
```

### "Permission denied" after following all steps

1. Verify your PAT hasn't expired: https://github.com/settings/tokens
2. Check that your PAT has the `repo` scope
3. Ensure you're using HTTPS remote URL: `git remote -v`
4. Try regenerating your PAT with the correct scopes

### "Authentication failed" still appearing

```bash
# Nuclear option - clear everything and start fresh
gh auth logout
rm -rf ~/.config/gh
rm -f ~/.git-credentials ~/.gitconfig
git config --global credential.helper store
gh auth login
```

### Environment variables keep resetting

This is expected behavior in Codespaces. The implicit token environment variables will return after a restart. The key is ensuring your Git/GitHub CLI configuration takes precedence.

## Why This Happens

GitHub Codespaces provides an implicit authentication token through environment variables (`GITHUB_TOKEN`). This token:
- Has limited permissions (doesn't include Git CLI access)
- Is automatically available in the environment
- May be used by default by some tools
- Can conflict with your account-level authentication

By following this guide, you're explicitly overriding the implicit token with your account-level token that has full permissions.

## Summary of Commands

Here's a complete script you can run to reset authentication:

```bash
#!/bin/bash
# Codespaces Authentication Reset Script

echo "🔓 Logging out of GitHub CLI..."
gh auth logout 2>/dev/null || echo "Already logged out"

echo "🧹 Clearing Git credentials..."
git credential-cache exit 2>/dev/null
rm -f ~/.git-credentials
rm -f ~/.config/git/credentials

echo "⚙️  Clearing Git credential helper config..."
git config --global --unset credential.helper 2>/dev/null || true
git config --system --unset credential.helper 2>/dev/null || true
git config --local --unset credential.helper 2>/dev/null || true

echo "🔐 Clearing environment tokens..."
unset GITHUB_TOKEN
unset GH_TOKEN
unset GITHUB_API_TOKEN

echo "✅ Ready for re-authentication!"
echo ""
echo "Now run: gh auth login"
echo "Choose: GitHub.com → HTTPS → Paste token"
```

Save this as `/tmp/reset-auth.sh`, make it executable with `chmod +x /tmp/reset-auth.sh`, and run it with `./tmp/reset-auth.sh`.

## Additional Resources

- [GitHub CLI Authentication](https://cli.github.com/manual/gh_auth_login)
- [Creating Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Git Credential Storage](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)
- [Main Git Authentication Guide](./GIT_AUTH_TROUBLESHOOTING.md)
- [Quick Fix Guide](./QUICK_FIX.md)
