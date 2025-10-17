# Sub-Issue #3: Rotate Exposed Secrets

**Title:** Complete security remediation by rotating exposed secrets

**Labels:** `security`, `critical`, `ops`

**Parent Issue:** #[PARENT_ISSUE_NUMBER]

## Problem Statement

A `.env` file containing 18 secrets was accidentally committed to the repository and briefly exposed in the git history. While the file has been removed from tracking and SECURITY_NOTICE.md was created, **the actual credentials have not yet been rotated**.

**Security incident details:**
- **When:** Commit 525b5ad (PR #40)
- **Exposure duration:** ~24 hours before removal
- **Secrets exposed:** 18 credentials including Supabase keys, Cloudflare tokens, GitHub secrets
- **Current status:** File removed, but secrets still active

**Reference:** IMPLEMENTATION_COMPLETE.md (lines 11-23)

## Definition of Done

### Acceptance Criteria

1. All 18 exposed secrets rotated and replaced
2. GitHub repository secrets updated with new values
3. Local .env files updated (notify team)
4. Cloudflare and Supabase credentials regenerated
5. Security incident documented in security log
6. Verification that old credentials no longer work
7. SECURITY_NOTICE.md updated with "REMEDIATED" status

### Secrets to Rotate

**From IMPLEMENTATION_COMPLETE.md:**

1. **Supabase (8 secrets):**
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Database connection strings (if any)
   - JWT secret
   - API keys

2. **Cloudflare (4 secrets):**
   - `CF_PAGES_COMMIT_SHA`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - Workers/Pages deployment token

3. **GitHub (3 secrets):**
   - `GITHUB_APP_CLIENT_SECRET`
   - `GITHUB_APP_INSTALLATION_ID`
   - Personal Access Token (if stored)

4. **Other (3 secrets):**
   - `NEXTAUTH_SECRET`
   - `ELFSIGHT_WIDGET_ID`
   - Any API keys

## Risks & Assumptions

**Risks:**
- Service interruption during rotation
- Deployment failures if secrets not updated correctly
- Team members may have cached old secrets
- External integrations may break temporarily

**Assumptions:**
- Access to all service dashboards (Supabase, Cloudflare, GitHub)
- Ability to regenerate credentials without losing data
- Deployment pipeline supports hot secret updates
- Brief downtime is acceptable during rotation

**Mitigations:**
- Rotate during low-traffic window
- Test each service after rotation
- Keep old secrets active briefly during transition
- Document rollback procedure
- Notify team before rotation

## Deliverables Checklist

### Pre-rotation
- [ ] Audit .env.example to ensure all secret names listed
- [ ] Document current secrets (which services, what they control)
- [ ] Schedule rotation window (low-traffic time)
- [ ] Notify team of planned rotation
- [ ] Prepare rollback plan

### Supabase Rotation
- [ ] Generate new Supabase anon key
- [ ] Generate new service role key
- [ ] Update database JWT secret
- [ ] Test database connections
- [ ] Update GitHub repository secrets
- [ ] Verify old keys no longer work

### Cloudflare Rotation
- [ ] Generate new API token
- [ ] Update Wrangler configuration
- [ ] Test deployment with new token
- [ ] Update GitHub Actions secrets
- [ ] Verify old token revoked

### GitHub Rotation
- [ ] Regenerate GitHub App client secret
- [ ] Update OAuth configuration
- [ ] Test OAuth flow
- [ ] Update repository secrets
- [ ] Revoke old client secret

### Other Services
- [ ] Regenerate NextAuth secret
- [ ] Update any API keys
- [ ] Test all integrations

### Post-rotation
- [ ] Update SECURITY_NOTICE.md (mark as REMEDIATED)
- [ ] Create security log entry
- [ ] Verify all services operational
- [ ] Update team documentation
- [ ] Confirm old credentials invalid

## A→G Acceptance Loop

### A) Preconditions Verified
- [ ] Access to Supabase dashboard confirmed
- [ ] Access to Cloudflare dashboard confirmed
- [ ] Access to GitHub Apps settings confirmed
- [ ] Repository secrets write access confirmed
- [ ] .env.example file up to date
- [ ] Rotation window scheduled and team notified

### B) Implementation Steps Executed
- [ ] Rotated all Supabase secrets (8 items)
- [ ] Rotated all Cloudflare secrets (4 items)
- [ ] Rotated all GitHub secrets (3 items)
- [ ] Rotated remaining secrets (3 items)
- [ ] Updated GitHub repository secrets
- [ ] Revoked old credentials
- [ ] Updated SECURITY_NOTICE.md

### C) Repo Health Checks Pass
- [ ] `npm run lint` - No errors
- [ ] `npm run build` - Successful (with new secrets)
- [ ] Deployment succeeds with new secrets
- [ ] No credential warnings or errors

### D) Minimal E2E Verification
**Exact commands/URLs:**

```bash
# Test Supabase connection
curl -H "apikey: NEW_ANON_KEY" https://YOUR_PROJECT.supabase.co/rest/v1/

# Test Cloudflare API
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer NEW_TOKEN"

# Test GitHub App OAuth (visit in browser)
https://github.com/settings/applications/YOUR_CLIENT_ID

# Verify old credentials fail
curl -H "apikey: OLD_ANON_KEY" https://YOUR_PROJECT.supabase.co/rest/v1/
# Should return 401 Unauthorized

# Test deployment
npm run build
npx wrangler pages deploy .open-next/
```

**Manual verification:**
- [ ] Visit live site - loads correctly
- [ ] Test OAuth login flow - works
- [ ] Check Supabase dashboard - no errors
- [ ] Verify GitHub Actions - secrets work
- [ ] Confirm old secrets return 401/403 errors

### E) Artifacts Updated
- [ ] GitHub repository secrets (18 secrets updated)
- [ ] SECURITY_NOTICE.md (status: REMEDIATED)
- [ ] docs/security/ROTATION_LOG.md (new file documenting rotation)
- [ ] .env.example (verify still accurate)
- [ ] CHANGELOG.md entry: "security: rotate exposed credentials"

### F) Link PR(s) and Reference Parent
- [ ] PR created: "security: complete credential rotation"
- [ ] PR description: "Closes #[THIS_ISSUE], part of #[PARENT_ISSUE]"
- [ ] PR body includes rotation summary (no actual secrets)
- [ ] Labels: `security`, `critical`
- [ ] Ensure PR does not contain any secrets

### G) Close with Post-Implementation Note

**Template:**
```markdown
## ✅ SECURITY REMEDIATION COMPLETE

**Incident:** .env file exposure (commit 525b5ad)

**Actions taken:**
- ✅ Rotated all 18 exposed credentials
  - 8 Supabase secrets
  - 4 Cloudflare secrets
  - 3 GitHub secrets
  - 3 other secrets
- ✅ Updated GitHub repository secrets
- ✅ Revoked old credentials (verified non-functional)
- ✅ Tested all services with new credentials
- ✅ Updated SECURITY_NOTICE.md status → REMEDIATED

**Verification:**
- Old credentials return 401/403 (confirmed revoked)
- All services operational with new credentials
- Deployment successful
- No console errors

**Security log:** docs/security/ROTATION_LOG.md

**Rollback:**
NOT RECOMMENDED - old credentials revoked for security.
If critical service failure:
1. Check docs/security/ROTATION_LOG.md for details
2. Verify new credentials configured correctly
3. Contact service provider if needed

**Post-rotation checklist:**
- [ ] Team notified of completion
- [ ] Old credentials confirmed revoked
- [ ] Documentation updated
- [ ] Security incident closed
```

---

**Estimated effort:** 2-3 hours (including testing)  
**Complexity:** Medium (requires access to multiple services)  
**Priority:** CRITICAL (security)
