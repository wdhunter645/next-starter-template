# Codespaces GitHub Token Setup

## Overview

This guide explains how to configure GitHub Codespaces to use your personal GitHub token with full repository permissions instead of the default read-only ephemeral token.

## Why You Need This

By default, GitHub Codespaces provides an ephemeral token with limited permissions that:
- ✅ Can read repository contents
- ❌ **Cannot** push commits
- ❌ **Cannot** create pull requests
- ❌ **Cannot** access GitHub CLI with admin permissions

To work effectively in Codespaces, you need to configure your environment to use your personal access token (PAT).

## Solution: Configure Your Personal Access Token

### Step 1: Create a Personal Access Token (PAT)

1. Go to GitHub Settings → Developer settings → Personal access tokens
   - Direct link: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Configure your token:
   - **Name**: "Codespaces Development"
   - **Expiration**: 90 days (or custom)
   - **Scopes** - Check these boxes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `write:packages` (if you work with packages)
     - ✅ `read:org` (if working with organization repos)
4. Click "Generate token"
5. **IMPORTANT**: Copy the token immediately - you won't see it again!

### Step 2: Configure Codespaces Environment

#### Option A: Using GitHub Codespaces Secrets (Recommended)

This method automatically injects your token into all Codespaces:

1. Go to your GitHub Settings → Codespaces
   - Direct link: https://github.com/settings/codespaces
2. Scroll to "Codespaces secrets"
3. Click "New secret"
4. Configure:
   - **Name**: `GH_TOKEN`
   - **Value**: Paste your PAT
   - **Repository access**: Select this repository or all repositories
5. Click "Add secret"

Now, in any Codespace:
```bash
# Your token is available as an environment variable
echo $GH_TOKEN

# Authenticate GitHub CLI
echo $GH_TOKEN | gh auth login --with-token

# Configure Git to use it
git config --global credential.helper store
```

#### Option B: Manual Configuration in Each Codespace

If you prefer to configure each Codespace individually:

1. Open your Codespace terminal
2. Run the authentication setup:
   ```bash
   # Clear any existing credentials
   gh auth logout --hostname github.com 2>/dev/null || true
   rm -f ~/.git-credentials
   
   # Authenticate with your PAT (replace YOUR_PAT with your actual token)
   echo "YOUR_PAT" | gh auth login --with-token
   
   # Configure Git credential helper
   git config --global credential.helper store
   
   # Test it works
   git push
   ```

3. When prompted for credentials during `git push`:
   - **Username**: Your GitHub username
   - **Password**: Your PAT (not your GitHub password)

### Step 3: Verify Configuration

Test that your setup works:

```bash
# Check GitHub CLI authentication
gh auth status

# Check Git configuration
git config --global --list | grep credential

# Test pushing a change
git commit --allow-empty -m "Test commit"
git push
```

## Using the Helper Script

This repository includes a helper script that automates the setup:

```bash
./fix-git-auth.sh
```

The script will:
1. Log you out of any existing GitHub CLI sessions
2. Clear cached credentials
3. Guide you through authentication with your PAT
4. Configure Git credential storage

## Troubleshooting

### Issue: "Authentication failed" when pushing

**Solution**: Your token may have expired or lacks required scopes.
1. Go to https://github.com/settings/tokens
2. Verify your token hasn't expired
3. Check it has `repo` scope enabled
4. Regenerate if necessary and reconfigure

### Issue: "remote: Permission denied"

**Solution**: The token doesn't have write access to the repository.
1. Ensure the token has `repo` scope
2. Verify you have write access to the repository
3. If using an organization repo, check organization settings allow PAT access

### Issue: Codespaces uses wrong credentials

**Solution**: Clear cached credentials and re-authenticate.
```bash
# Clear everything
gh auth logout --hostname github.com 2>/dev/null || true
rm -f ~/.git-credentials
git credential-cache exit 2>/dev/null || true

# Reconfigure
echo "YOUR_PAT" | gh auth login --with-token
git config --global credential.helper store
```

### Issue: Token keeps getting reset

**Solution**: Use Codespaces Secrets (Option A above) to persist your token across Codespace rebuilds.

## Security Best Practices

1. **Never commit your PAT** to the repository
2. **Use Codespaces Secrets** instead of hardcoding tokens
3. **Set token expiration** to limit exposure if compromised
4. **Rotate tokens regularly** (every 90 days recommended)
5. **Use minimum required scopes** - only enable what you need
6. **Delete old tokens** you're no longer using

## Alternative: SSH Authentication

If you prefer SSH over HTTPS:

1. Generate an SSH key in your Codespace:
   ```bash
   ssh-keygen -t ed25519 -C "your.email@example.com"
   ```

2. Add the public key to GitHub:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # Copy the output and add it at: https://github.com/settings/keys
   ```

3. Update remote URL:
   ```bash
   git remote set-url origin git@github.com:wdhunter645/next-starter-template.git
   ```

## Related Documentation

- [START_HERE.md](../START_HERE.md) - Quick fix for Git authentication
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Full contribution guidelines
- [GIT_AUTH_TROUBLESHOOTING.md](./GIT_AUTH_TROUBLESHOOTING.md) - Comprehensive auth troubleshooting

## Summary

By configuring your personal GitHub token in Codespaces, you'll have:
- ✅ Full push/pull access to repositories
- ✅ Ability to create and manage pull requests
- ✅ GitHub CLI with full permissions
- ✅ Seamless development workflow without authentication prompts

Follow the steps above to get started, and refer to the troubleshooting section if you encounter any issues.
