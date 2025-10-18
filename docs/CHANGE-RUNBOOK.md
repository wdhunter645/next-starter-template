# Change Runbook

Quick reference for making changes to the codebase safely and efficiently.

## Overview

This runbook ensures consistent, reviewable, and reversible changes to the project. Follow the Acceptance Checklist (A→G) for every PR.

## Acceptance Checklist (A→G)

Use this checklist for EVERY pull request. Mark items N/A if not applicable, but explain why.

### A. Build & Test
- [ ] **Build passes**: `npm run build`
- [ ] **Lint passes**: `npm run lint`
- [ ] **Type check passes**: `npx tsc --noEmit`
- [ ] **Tests pass**: Run relevant test suites

**Why**: Catches errors early before code review.

### B. Code Quality
- [ ] **Style guidelines**: Follows project conventions
- [ ] **No console errors**: Clean console in development
- [ ] **Minimal changes**: Surgical edits, no unnecessary refactors
- [ ] **Dependencies**: No new deps unless absolutely necessary

**Why**: Maintains code quality and reduces technical debt.

### C. Functionality
- [ ] **Works in preview**: Feature tested in preview deployment
- [ ] **No regressions**: Existing features still work
- [ ] **Edge cases**: Handles errors, empty states, edge conditions

**Why**: Ensures changes work as intended without breaking existing functionality.

### D. Security
- [ ] **No secrets**: No credentials, keys, or tokens in code
- [ ] **Env vars**: `.env.example` updated with new variable names only
- [ ] **Auth gates**: Protected routes properly secured

**Why**: Prevents security vulnerabilities and data leaks.

### E. Documentation
- [ ] **README**: Updated for user-facing changes
- [ ] **Code comments**: Added where complex logic needs explanation
- [ ] **API docs**: Updated if API changes
- [ ] **Docs folder**: Relevant guides updated

**Why**: Helps team understand changes and maintainability.

### F. Deployment Readiness
- [ ] **Preview tested**: Preview deployment verified
- [ ] **Smoke tests**: `npm run smoke:preview` (if applicable)
- [ ] **Env vars configured**: New variables added to hosting platform
- [ ] **Backwards compatible**: Or migration plan documented

**Why**: Ensures smooth deployment to production.

### G. Rollback Plan
- [ ] **Documented**: Rollback steps in PR description
- [ ] **Reversible**: Changes can be undone safely
- [ ] **No destructive ops**: DB migrations have backup plan

**Why**: Enables quick recovery if issues arise.

## Workflow

### 1. Create Branch
```bash
# From main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

**Branch naming**:
- `feature/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance, refactoring
- `docs/` - Documentation updates

### 2. Make Changes
- Keep changes small and focused
- Commit frequently with clear messages
- Follow conventional commits format:
  - `feat(scope): description` - New feature
  - `fix(scope): description` - Bug fix
  - `docs(scope): description` - Documentation
  - `chore(scope): description` - Maintenance
  - `refactor(scope): description` - Code refactor

### 3. Test Locally
```bash
# Build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Run dev server
npm run dev
```

### 4. Open Pull Request
- Use PR template (automatically populated)
- Fill out Acceptance Checklist (A→G)
- Describe changes clearly
- Document rollback plan
- Link related issues

### 5. Preview Deployment
- Wait for Cloudflare Pages preview build
- Test preview URL thoroughly
- Run smoke tests: `./scripts/smoke.sh <preview-url>`

### 6. Code Review
- Address reviewer feedback
- Update PR as needed
- Ensure all checklist items are checked

### 7. Merge
- Ensure CI/CD passes
- Preview deployment verified
- Merge to main (or staging first)
- Monitor deployment

### 8. Post-Merge
- Verify production deployment
- Run smoke tests on production
- Monitor for errors
- Close related issues

## Smoke Testing

Before and after deployment:

```bash
# Test preview
./scripts/smoke.sh https://preview-abc123.pages.dev

# Test staging
./scripts/smoke.sh https://test.lougehrigfanclub.com

# Test production
./scripts/smoke.sh https://www.lougehrigfanclub.com
```

Expected: All tests pass (12/12)

## Rollback Procedure

If issues arise after deployment:

### Quick Rollback (Revert)
```bash
# Identify problematic commit
git log --oneline -10

# Revert the commit
git revert <commit-sha>

# Push to trigger re-deploy
git push origin main
```

### File-Level Rollback
```bash
# Revert specific files
git checkout <previous-commit> -- path/to/file.ts

# Commit and push
git commit -m "Rollback: revert file.ts to previous version"
git push origin main
```

### Full Rollback (Reset)
```bash
# CAUTION: Only if revert doesn't work
git checkout main
git reset --hard <good-commit-sha>
git push origin main --force-with-lease

# Force push requires branch protection override
# Coordinate with team before using
```

## Emergency Procedures

### Production Down
1. **Assess**: Check Cloudflare Pages deployment status
2. **Rollback**: Use quick rollback procedure above
3. **Verify**: Run smoke tests on production
4. **Communicate**: Update team/stakeholders
5. **Post-mortem**: Document what went wrong

### API Errors
1. **Check logs**: Cloudflare Pages → Deployments → Functions Logs
2. **Check env vars**: Verify all required variables set
3. **Test endpoints**: Use smoke script or curl
4. **Rollback if needed**: Revert problematic changes

### Build Failures
1. **Review build logs**: Cloudflare Pages deployment logs
2. **Test locally**: `npm run build`
3. **Fix or rollback**: Resolve issue or revert
4. **Re-deploy**: Push fix to trigger new build

## Best Practices

### Do's
✅ **Keep PRs small** - Easier to review and rollback
✅ **Test thoroughly** - Catch issues before production
✅ **Document changes** - Help future maintainers
✅ **Use preview deployments** - Verify before merging
✅ **Follow checklist** - Consistency across team
✅ **Communicate** - Keep team informed of significant changes

### Don'ts
❌ **Skip tests** - Always verify changes work
❌ **Commit secrets** - Use environment variables
❌ **Break main** - Ensure CI passes before merging
❌ **Large PRs** - Hard to review, risky to deploy
❌ **Undocumented changes** - Confuses team
❌ **Force push to main** - Only for emergencies

## Common Scenarios

### Adding New Feature
1. Create feature branch
2. Implement with minimal changes
3. Add tests if applicable
4. Update documentation
5. Open PR with A→G checklist
6. Test preview deployment
7. Merge after approval

### Fixing Bug
1. Reproduce bug locally
2. Identify root cause
3. Implement minimal fix
4. Verify fix works
5. Add test to prevent regression
6. Open PR with A→G checklist

### Updating Documentation
1. Make doc changes
2. Review for accuracy
3. Check links work
4. Run docs secret audit: `npm run audit:docs`
5. Open PR (lighter checklist OK for docs-only)

### Adding Environment Variable
1. Add to code with safe default or check
2. Update `.env.example` with name only
3. Document in relevant docs
4. Add to hosting platform (Cloudflare Pages)
5. Include in PR description
6. Verify in preview deployment

## Tools & Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build production
npm run lint             # Run ESLint
npm run audit:docs       # Check docs for secrets
npx tsc --noEmit         # Type check
```

### Testing
```bash
./scripts/smoke.sh <url> # Smoke test deployment
```

### Git
```bash
git status               # Check working tree
git diff                 # See changes
git log --oneline -10    # Recent commits
git revert <sha>         # Revert commit
```

## Related Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md)
- [Architecture](./ARCHITECTURE.md)
- [Smoke Testing](./ops/SMOKE.md)
- [Staging Mirror](./ops/STAGING-MIRROR.md)
- [Rollout Checklist](./ops/ROLLOUT.md)

## Questions?

- Check existing documentation in `docs/`
- Ask team in communication channel
- Review similar PRs for examples
- Consult this runbook for process guidance

---

**Remember**: The A→G checklist is your friend. It ensures quality, security, and reversibility for every change.
