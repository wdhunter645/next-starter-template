# 🔴 CRITICAL SECURITY NOTICE

## Exposed Secrets - Action Required

**Date**: October 16, 2025  
**Severity**: CRITICAL  
**Status**: RESOLVED in commit `525b5ad`

### What Happened

The `.env` file containing sensitive credentials was accidentally committed to the repository in commit `4f373a5`. This file has now been removed from the repository, but **the secrets were exposed in the git history**.

### Affected Secrets

The following credentials were exposed and **MUST BE REGENERATED**:

1. **Cloudflare Credentials**
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`

2. **Supabase Credentials**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_API_KEY`
   - `SUPABASE_ACCESS_TOKEN`
   - `SUPABASE_PROJECT_ID`
   - `SUPABASE_DB_PASSWORD`

3. **Backblaze B2 Credentials**
   - `B2_KEY_ID`
   - `B2_APP_KEY`
   - `B2_BUCKET`

4. **Other Sensitive Data**
   - Site URLs
   - Worker URLs
   - Admin emails

### Immediate Actions Required

If you are the repository owner or have access to these services, **take these steps immediately**:

#### 1. Rotate Cloudflare Credentials

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to "My Profile" → "API Tokens"
3. **Revoke** the exposed API token
4. **Create a new API token** with the same permissions
5. Update your local `.env` file with the new token
6. Update GitHub repository secrets:
   ```bash
   gh secret set CLOUDFLARE_API_TOKEN
   ```

#### 2. Rotate Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to your project settings
3. **Reset the database password**:
   - Settings → Database → Connection string → Reset database password
4. **Rotate the access token**:
   - Account → Access Tokens → Revoke old token → Create new token
5. Update your local `.env` file
6. Update GitHub repository secrets:
   ```bash
   gh secret set SUPABASE_ACCESS_TOKEN
   gh secret set SUPABASE_DB_PASSWORD
   ```

#### 3. Rotate Backblaze B2 Credentials

1. Go to [Backblaze B2 Dashboard](https://www.backblaze.com/b2/cloud-storage.html)
2. Navigate to "App Keys"
3. **Delete the exposed application key**
4. **Create a new application key** with the same permissions
5. Update your local `.env` file
6. Update GitHub repository secrets:
   ```bash
   gh secret set B2_KEY_ID
   gh secret set B2_APP_KEY
   ```

#### 4. Update All GitHub Secrets

After rotating all credentials, update GitHub repository secrets:

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your NEW credentials
nano .env

# Run the secrets setup script
./create-github-secrets.sh
```

Or update secrets manually via GitHub UI:
- Go to: https://github.com/wdhunter645/next-starter-template/settings/secrets/actions
- Update each secret with new values

#### 5. Update Codespaces Secrets (if using Codespaces)

If you use GitHub Codespaces, update your Codespaces secrets:

1. Go to: https://github.com/settings/codespaces
2. Update any environment variables that were exposed
3. Restart any active Codespaces to use new secrets

### What We've Done

✅ **Removed `.env` from repository** (commit `525b5ad`)  
✅ **Added `.env.example`** template for users  
✅ **Updated `.gitignore`** to ensure `.env` stays excluded  
✅ **Added security warnings** to SECRETS_SETUP.md  
✅ **Created this security notice**  
✅ **Updated documentation** with proper Codespaces setup

### What You Should Do

If you cloned this repository:

1. ⚠️ **DO NOT USE** the credentials from any commits before `525b5ad`
2. ✅ **REGENERATE** all credentials as described above
3. ✅ **CREATE** your own `.env` file from `.env.example`
4. ✅ **VERIFY** your `.env` is NOT tracked in git: `git ls-files | grep .env$` (should return nothing)
5. ✅ **NEVER COMMIT** the `.env` file

### Prevention

To prevent this from happening again:

1. **Always check before committing**:
   ```bash
   git status
   git diff --staged
   ```

2. **Verify .env is in .gitignore**:
   ```bash
   grep "^\.env$" .gitignore
   ```

3. **Use pre-commit hooks** to detect secrets:
   ```bash
   # Install git-secrets or similar tools
   brew install git-secrets
   git secrets --install
   git secrets --register-aws
   ```

4. **Review git history** before pushing:
   ```bash
   git log --stat -5
   ```

### How to Check If Your Secrets Are Exposed

To check if secrets are in your git history:

```bash
# Search for .env in git history
git log --all --full-history -- .env

# If you find commits, check their content
git show <commit-hash>:.env
```

### Questions or Concerns?

If you have any questions or concerns about this security incident:

1. Check if you're using any of the exposed credentials
2. Rotate them immediately if you are
3. Open an issue if you need assistance
4. Review our updated security documentation

### Related Documentation

- [SECRETS_SETUP.md](../SECRETS_SETUP.md) - How to set up secrets properly
- [docs/CODESPACES_TOKEN_SETUP.md](./CODESPACES_TOKEN_SETUP.md) - Codespaces configuration
- [.env.example](../.env.example) - Template for environment variables

---

**Remember**: The best practice is to **never commit secrets** to version control. Always use:
- Environment variables
- GitHub Secrets for CI/CD
- Codespaces Secrets for development
- Secret management tools for production

This incident has been resolved, but all exposed credentials must be rotated.
