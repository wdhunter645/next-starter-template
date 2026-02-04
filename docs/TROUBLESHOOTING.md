# Troubleshooting Guide

**Backup/restore reference:** `docs/backup.md` (restore sources) and `docs/RECOVERY.md` (restore procedure).

## Git Authentication Issues

### GitHub Codespaces: Cannot Push Changes

**Symptoms:**
- `git push` fails with authentication errors
- "Permission denied" or "fatal: could not read Username"
- Codespaces token has read-only access

**Root Cause:** Codespaces provides an ephemeral token that cannot push to GitHub.

**Solution:**

1. Create a Personal Access Token (PAT):
   - Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Name: "Codespaces Development"
   - Scopes: Check `repo` (full repository access)
     - For more granular permissions, use fine-grained tokens with `contents:write` and `metadata:read`
   - Copy the generated token

2. Configure Git authentication (no browser required):
   ```bash
   # Clear existing credentials
   gh auth logout --hostname github.com 2>/dev/null || true
   rm -f ~/.git-credentials
   
   # Authenticate with your PAT
   echo "YOUR_PAT" | gh auth login --with-token
   
   # Configure Git credential helper
   git config --global credential.helper store
   
   # Test push
   git push
   ```

3. For persistent configuration, add PAT as Codespaces Secret:
   - Go to [Codespaces Settings](https://github.com/settings/codespaces)
   - Add secret: `GH_TOKEN` with your PAT value
   - Select repository access

**Quick Fix Script:**
```bash
./fix-git-auth.sh
```

### Local Development: Git Authentication

**For local development**, configure Git credentials:

```bash
# Set Git identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Configure credential storage
git config --global credential.helper store  # Linux
# OR
git config --global credential.helper osxkeychain  # macOS
# OR
git config --global credential.helper wincred  # Windows
```

When pushing, use your GitHub username and PAT (not password).

## Codespaces Issues

### Codespace Crashed or Frozen

**Symptoms:**
- Extensions keep restarting
- Terminal unresponsive
- IDE becomes sluggish

**Quick Recovery:**

```bash
# Save work immediately
git add . && git commit -m "checkpoint: save before recovery"

# Kill hung processes
pkill -9 node
pkill -9 git

# Restart Codespace from GitHub UI if needed
```

**Full Recovery:**
1. Export changes to branch (GitHub Codespaces UI)
2. Stop the Codespace
3. Create new Codespace
4. Cherry-pick saved commits if needed

### Codespaces Won't Let You Log Out

**Issue:** `gh auth logout` doesn't work or token persists

**Solution:**
```bash
# Force logout and clear all credentials
gh auth logout --hostname github.com 2>/dev/null || true
rm -f ~/.git-credentials
git config --global --unset credential.helper 2>/dev/null || true

# Re-authenticate with your PAT
echo "YOUR_PAT" | gh auth login --with-token
```

## Build and Development Issues

### npm install Fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Development Server Won't Start

**Check:**
- Port 3000 is not in use: `lsof -i :3000`
- Dependencies are installed: `npm install`
- Node version matches `.node-version`: `node --version`

**Solution:**
```bash
# Kill any process on port 3000
kill $(lsof -t -i:3000)

# Restart dev server
npm run dev
```

### Build Errors

**Common causes:**
- TypeScript errors: Run `npm run lint` to identify
- Missing dependencies: Run `npm install`
- Invalid configuration: Check `next.config.ts`

**Solution:**
```bash
# Clean build
rm -rf .next .open-next

# Rebuild
npm run build
```

## Merge Conflicts

### package.json Conflicts

**Quick fix:**
```bash
./scripts/fix-package-json-conflicts.sh
```

This script:
- Resolves merge markers automatically
- Validates JSON syntax
- Creates backup before changes
- Reinstalls dependencies

**Manual resolution:**
```bash
# Edit package.json to resolve conflicts
# Then:
npm install
git add package.json package-lock.json
git commit -m "fix: resolve package.json conflicts"
```

## Getting Help

Still stuck? Try these resources:

1. Check [GitHub Actions logs](../../actions) for deployment errors
2. Review [Deployment Guide](./DEPLOYMENT_GUIDE.md) for setup issues
3. Search [repository issues](../../issues) for similar problems
4. Consult [Next.js documentation](https://nextjs.org/docs)
5. Review [Cloudflare Pages docs](https://developers.cloudflare.com/pages/)

## External Resources

- [GitHub Codespaces Docs](https://docs.github.com/en/codespaces)
- [Git Credential Helpers](https://git-scm.com/docs/gitcredentials)
- [Next.js Troubleshooting](https://nextjs.org/docs/messages)
- [Cloudflare Workers Troubleshooting](https://developers.cloudflare.com/workers/platform/troubleshooting/)
