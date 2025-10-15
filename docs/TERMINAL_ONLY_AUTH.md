# Terminal-Only Git Authentication (No Browser Required)

**Frustrated with browser tabs opening? This guide shows you how to authenticate Git using only your terminal.**

## Problem

When you run `gh auth login`, it tries to open a browser tab for authentication. This is annoying and doesn't work well in some Codespaces environments.

## Solution: Use a Personal Access Token Directly

This method **never opens a browser** and works entirely in your terminal.

### Step 1: Clear All Existing Authentication

Run these commands to completely clear any cached credentials:

```bash
# Sign out of GitHub CLI (if logged in)
gh auth logout --hostname github.com 2>/dev/null || true

# Clear Git credential cache
git credential-cache exit 2>/dev/null || true

# Remove stored credentials file
rm -f ~/.git-credentials

# Clear any credential helpers
git config --global --unset credential.helper 2>/dev/null || true

# Verify everything is cleared
echo "Checking auth status..."
gh auth status 2>&1 || echo "✓ Successfully logged out"
```

### Step 2: Create a Personal Access Token (PAT)

1. Open this URL in your browser: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Codespaces Development Token`
4. Set expiration (recommend 90 days)
5. Select these scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Click **"Generate token"**
7. **Copy the token immediately** - you won't see it again!

### Step 3: Authenticate GitHub CLI with PAT (Terminal Only)

Instead of `gh auth login` which opens a browser, use this method:

```bash
# Authenticate using your PAT (paste it when prompted)
echo "YOUR_PAT_HERE" | gh auth login --with-token

# Verify it worked
gh auth status
```

Replace `YOUR_PAT_HERE` with your actual token.

**Alternative one-liner:**
```bash
# Read PAT from stdin (paste your token and press Ctrl+D)
gh auth login --with-token
# Paste your PAT here
# Press Ctrl+D
```

### Step 4: Configure Git to Use the Token

```bash
# Set up credential storage
git config --global credential.helper store

# Test authentication (this will prompt for credentials ONE TIME)
git ls-remote

# When prompted:
# Username: your-github-username
# Password: paste-your-PAT-here
```

### Step 5: Verify Everything Works

```bash
# Check GitHub CLI authentication
gh auth status

# Check Git remote
git remote -v

# Test Git push (should work without prompts now)
git push
```

## Quick Reference Card

If you ever need to re-authenticate:

```bash
# 1. Clear everything
gh auth logout --hostname github.com 2>/dev/null || true
rm -f ~/.git-credentials
git config --global --unset credential.helper 2>/dev/null || true

# 2. Authenticate with PAT (replace YOUR_PAT with your token)
echo "YOUR_PAT" | gh auth login --with-token

# 3. Configure Git
git config --global credential.helper store
git ls-remote
# Enter username and PAT when prompted
```

## Why This Works

- **No browser required**: Uses `--with-token` flag to authenticate via stdin
- **No Codespaces limitations**: Doesn't rely on implicit tokens
- **Full control**: You manage the authentication yourself
- **Works everywhere**: Terminal-only commands work in any environment

## Troubleshooting

### "gh: command not found"

GitHub CLI is pre-installed in Codespaces. If missing:
```bash
# Check if gh is available
which gh

# If not found, install it
type -p curl >/dev/null || sudo apt install curl -y
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
&& sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update \
&& sudo apt install gh -y
```

### "Token doesn't work"

Verify your token has the right scopes:
1. Go to https://github.com/settings/tokens
2. Find your token
3. Make sure `repo` is checked
4. If not, regenerate the token with correct scopes

### Still getting prompted for password

Your credentials aren't being saved. Run:
```bash
git config --global credential.helper store
```

## Security Notes

⚠️ **Important:**
- Never commit your PAT to a repository
- The credential store saves credentials in plain text at `~/.git-credentials`
- In Codespaces, this file is ephemeral and deleted when the container stops
- Rotate your tokens regularly (every 90 days)

## Related Documentation

- [GIT_AUTH_TROUBLESHOOTING.md](./GIT_AUTH_TROUBLESHOOTING.md) - Other authentication methods
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Full contributing guide
- [GitHub PAT Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
