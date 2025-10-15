# Git Authentication Troubleshooting

This quick reference guide helps resolve Git authentication issues, particularly in GitHub Codespaces.

## Problem

When trying to push to the repository, you encounter one of these errors:

- `git push fails, isn't asking for username`
- `fatal: could not read Username for 'https://github.com'`
- `remote: Permission denied`
- `Authentication failed`

## Root Cause

In GitHub Codespaces, the implicit token provided by the environment doesn't have Git CLI permissions. This means you cannot use it to authenticate Git operations like `git push`.

## Solutions

### Solution 1: GitHub CLI (Recommended)

GitHub CLI is pre-installed in Codespaces and provides the easiest authentication:

```bash
# Authenticate with GitHub
gh auth login

# Follow the prompts:
# 1. Choose "GitHub.com"
# 2. Choose "HTTPS" as your preferred protocol
# 3. Authenticate with your browser or paste a token

# Test it works
git push
```

### Solution 2: Personal Access Token (PAT)

If you prefer using a Personal Access Token:

#### Step 1: Create a PAT

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it (e.g., "Codespaces Dev Token")
4. Select scopes: `repo`, `workflow`
5. Click "Generate token"
6. **Copy the token immediately!**

#### Step 2: Configure Git

```bash
# Option A: Let Git prompt for credentials
git config --global credential.helper store
git push
# Enter your GitHub username
# Paste your PAT as the password

# Option B: Update remote URL with credentials
git remote set-url origin https://YOUR_USERNAME:YOUR_PAT@github.com/wdhunter645/next-starter-template.git
git push
```

⚠️ **Warning**: Never commit tokens to your repository!

### Solution 3: SSH Keys

If you prefer SSH authentication:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Start ssh-agent
eval "$(ssh-agent -s)"

# Add your SSH key
ssh-add ~/.ssh/id_ed25519

# Copy your public key
cat ~/.ssh/id_ed25519.pub
# Add this to GitHub: https://github.com/settings/keys

# Update remote to use SSH
git remote set-url origin git@github.com:wdhunter645/next-starter-template.git

# Test
git push
```

## Clearing Cached Credentials

If you've entered incorrect credentials:

```bash
# Clear credential cache
git credential-cache exit

# Or remove stored credentials
rm ~/.git-credentials

# Reconfigure
git config --global credential.helper store
```

## Verification

To verify your Git configuration:

```bash
# Check remote URL
git remote -v

# Check credential helper
git config --global credential.helper

# Test authentication
git ls-remote
```

## Still Having Issues?

1. Ensure your PAT hasn't expired (check https://github.com/settings/tokens)
2. Verify the PAT has correct scopes (`repo` at minimum)
3. Check that you're using HTTPS URLs (not SSH) if using a PAT
4. Try `gh auth logout` then `gh auth login` again

**If Codespaces has crashed or extensions are restarting**: See [CODESPACES_CRASH_RECOVERY.md](./CODESPACES_CRASH_RECOVERY.md) for comprehensive troubleshooting.

## Additional Resources

- [GitHub: Creating a Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Git Credential Storage](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)

For more detailed information, see [CONTRIBUTING.md](../CONTRIBUTING.md).
