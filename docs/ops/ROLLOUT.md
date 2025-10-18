# Rollout Checklist (Staging → Production)

This document provides the exact checklist for rolling out changes from staging to production safely.

## Overview

Every deployment to production should follow this checklist to ensure quality, security, and reversibility.

## Pre-Merge Checklist

### 1. Open Pull Request
- [ ] PR created with descriptive title
- [ ] PR description includes:
  - What changed and why
  - Related issue links
  - Acceptance checklist (A→G) completed
  - Rollback plan documented
- [ ] Branch is up to date with target branch

### 2. Preview Deployment Green
- [ ] Cloudflare Pages preview build succeeds
- [ ] Preview URL accessible and functional
- [ ] No build errors or warnings in logs

### 3. Run Smoke Tests Against Preview
```bash
# Get preview URL from PR (Cloudflare Pages bot comment)
PREVIEW_URL="https://abc123.next-starter-template.pages.dev"

# Run smoke tests
./scripts/smoke.sh "$PREVIEW_URL"

# Expected: 12/12 tests pass
```

**Smoke Test Checklist:**
- [ ] `/api/env/check` - Returns 200 with variable status
- [ ] `/api/phase2/status` - Returns build info and health
- [ ] Public routes (/, /weekly, /milestones, /charities, /news, /calendar, /privacy, /terms) - All return 200
- [ ] Protected routes (/member, /admin) - Return 200 (show auth required messages)

### 4. Verify Environment Configuration
- [ ] All required environment variables present (check `/api/env/check` response)
- [ ] New environment variables (if any) documented in `.env.example`
- [ ] New environment variables added to hosting platform (Cloudflare Pages)
- [ ] No secrets in code or logs

### 5. Manual Testing
- [ ] Core functionality works in preview
- [ ] Navigation works (header, footer links)
- [ ] Forms submit correctly (if applicable)
- [ ] Auth gates work (if applicable):
  - Unauthenticated users blocked from protected routes
  - Admin users can access admin area
- [ ] No console errors in browser DevTools
- [ ] Responsive design works (mobile, tablet, desktop)

### 6. Code Review
- [ ] At least one approval from code owner
- [ ] All reviewer comments addressed
- [ ] Acceptance checklist (A→G) verified by reviewer
- [ ] Rollback plan reviewed and approved

## Merge to Main

### 7. Final Checks Before Merge
- [ ] CI/CD pipeline passes (build, lint, typecheck)
- [ ] No merge conflicts
- [ ] Branch up to date with target
- [ ] All required approvals obtained

### 8. Merge
- [ ] Use "Squash and merge" or "Merge commit" (team preference)
- [ ] Confirm merge in GitHub
- [ ] Delete feature branch after merge

## Post-Merge Verification

### 9. Monitor Deployment
- [ ] Cloudflare Pages production build starts automatically
- [ ] Build completes successfully
- [ ] Build time is reasonable (< 5 minutes typically)
- [ ] No build errors or warnings

### 10. Verify Production Deployment
```bash
# Wait for deployment to complete (check Cloudflare Pages dashboard)

# Run smoke tests on production
./scripts/smoke.sh https://www.lougehrigfanclub.com

# Expected: 12/12 tests pass
```

**Production Verification:**
- [ ] Home page loads correctly
- [ ] All navigation links work
- [ ] Auth gates function properly
- [ ] API endpoints respond correctly
- [ ] No JavaScript errors in console
- [ ] Performance is acceptable (check Core Web Vitals)

### 11. Spot-Check Core Features
- [ ] User can navigate to all public pages
- [ ] Protected routes show appropriate messages
- [ ] Admin area accessible to admins
- [ ] Forms and interactions work
- [ ] Any new features work as expected

### 12. Record Post-Implementation Note
Create a brief record of the deployment:

```markdown
## Deployment: [Feature Name] - [Date]

- **PR**: #123
- **Deployed By**: @username
- **Deploy Time**: YYYY-MM-DD HH:MM UTC
- **Smoke Tests**: ✅ 12/12 passed
- **Issues**: None (or list any issues encountered)
- **Rollback**: Not needed (or describe rollback if performed)
```

Save in `docs/archive/YYYY-MM-DD-deployment-[feature-name].md`

## Rollback Procedure

If issues arise after production deployment:

### When to Rollback
- Critical functionality broken
- Security vulnerability introduced
- Performance severely degraded
- Data loss or corruption risk

### Quick Rollback Steps
1. **Identify Issue**
   ```bash
   # Check deployment logs
   # Review error messages
   # Run smoke tests to pinpoint failure
   ```

2. **Revert Commit**
   ```bash
   git checkout main
   git revert <problematic-commit-sha>
   git push origin main
   ```

3. **Wait for Re-Deploy**
   - Cloudflare Pages automatically re-deploys
   - Monitor build progress in dashboard

4. **Verify Rollback**
   ```bash
   ./scripts/smoke.sh https://www.lougehrigfanclub.com
   ```

5. **Communicate**
   - Update team on rollback
   - Create issue to track fix
   - Document what went wrong

### Full Rollback (Emergency)
```bash
# ONLY if revert doesn't work
git checkout main
git reset --hard <last-good-commit>
git push origin main --force-with-lease

# Requires branch protection override
# Coordinate with team first
```

## Environment-Specific Rollout

### Staging First (Recommended)
1. Merge PR to `staging` branch first
2. Run full checklist against staging environment
3. Test thoroughly in staging
4. If green, merge to `main` (production)

### Direct to Production
For urgent fixes or minor changes:
1. Complete all pre-merge checks
2. Get explicit approval for direct-to-prod
3. Have rollback ready
4. Monitor closely after deployment

## NPM Scripts

Add to `package.json` for convenience:

```json
{
  "scripts": {
    "smoke:preview": "bash scripts/smoke.sh",
    "smoke:staging": "bash scripts/smoke.sh https://test.lougehrigfanclub.com",
    "smoke:prod": "bash scripts/smoke.sh https://www.lougehrigfanclub.com"
  }
}
```

Usage:
```bash
# Test preview (pass URL as argument)
npm run smoke:preview https://abc123.pages.dev

# Test staging
npm run smoke:staging

# Test production
npm run smoke:prod
```

## Common Issues & Solutions

### Issue: Preview Build Fails
**Solution:**
1. Check build logs in Cloudflare Pages
2. Test build locally: `npm run build`
3. Fix build errors
4. Push fix to PR branch

### Issue: Smoke Tests Fail
**Solution:**
1. Review which specific tests failed
2. Check endpoint responses manually
3. Verify environment variables
4. Fix issues before merging

### Issue: Production Works Differently Than Preview
**Solution:**
1. Check environment variables differ between preview and production
2. Verify production has all required secrets
3. Check for environment-specific code paths
4. Update code to handle both environments

### Issue: Performance Degradation
**Solution:**
1. Check Cloudflare Analytics for slow requests
2. Review cache hit ratio
3. Check for N+1 queries or inefficient code
4. Consider rollback if severe

## Maintenance Windows

For significant changes:

### Scheduled Maintenance
1. **Announce**: Notify users in advance (if user-facing)
2. **Schedule**: Choose low-traffic time (early morning UTC)
3. **Prepare**: Have rollback plan ready
4. **Execute**: Follow rollout checklist
5. **Monitor**: Watch metrics closely
6. **Communicate**: Update users when complete

### Zero-Downtime Deployment
Most deployments are zero-downtime:
- Cloudflare Pages builds new version
- Switches traffic atomically
- Old version remains briefly accessible
- No service interruption

## Metrics to Monitor

After deployment, watch:

- **Cloudflare Analytics**:
  - Request rate
  - Error rate (4xx, 5xx)
  - Cache hit ratio
  - Response time

- **Application Metrics**:
  - API endpoint success rate
  - Page load times
  - User actions (if tracked)

- **Error Tracking** (if configured):
  - New error types
  - Error frequency
  - Stack traces

## Best Practices

### Do's
✅ **Always run smoke tests** before and after deployment
✅ **Test in preview** thoroughly
✅ **Monitor after deployment** for at least 15 minutes
✅ **Document deployments** in archive
✅ **Have rollback ready** for every change
✅ **Communicate** significant deployments to team

### Don'ts
❌ **Skip smoke tests** - Always verify
❌ **Deploy on Friday afternoon** - Hard to rollback over weekend
❌ **Merge without approval** - Get code review
❌ **Ignore preview failures** - Fix before merging
❌ **Deploy without rollback plan** - Always have exit strategy

## Related Documentation

- [Smoke Testing](./SMOKE.md) - How to run smoke tests
- [Staging Mirror](./STAGING-MIRROR.md) - Staging environment setup
- [Change Runbook](../CHANGE-RUNBOOK.md) - Overall change process
- [Deployment Guide](../DEPLOYMENT_GUIDE.md) - Technical deployment details
- [Cache Rules](./CACHE-RULES.md) - Caching configuration

## Quick Reference

### Pre-Merge
1. PR open with A→G checklist
2. Preview green
3. Smoke tests pass
4. Manual testing complete
5. Code reviewed

### Merge
1. Final CI checks pass
2. Merge to main
3. Monitor deployment

### Post-Merge
1. Production deploys
2. Smoke tests on prod
3. Spot-check features
4. Record deployment

### If Issues
1. Identify problem
2. Quick rollback (revert)
3. Verify rollback works
4. Document and fix

---

**Remember**: This checklist ensures safe, reversible deployments. Don't skip steps to save time - they're all important!
