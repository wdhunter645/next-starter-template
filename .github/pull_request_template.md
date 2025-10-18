# Pull Request

## Description
<!-- Briefly describe what this PR changes and why -->

## Type of Change
<!-- Check all that apply -->
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Configuration change

## Related Issues
<!-- Link to related issues, e.g., "Fixes #123" or "Part of #456" -->

Fixes # (issue number)

## Acceptance Checklist (A→G)

### A. Build & Test
- [ ] Build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Type check passes (`npx tsc --noEmit`)
- [ ] Tests pass (if applicable)

### B. Code Quality
- [ ] Code follows project style guidelines
- [ ] No console errors or warnings introduced
- [ ] Minimal changes (surgical, focused edits)
- [ ] No unnecessary dependencies added

### C. Functionality
- [ ] Feature works as intended in preview deployment
- [ ] No regressions in existing functionality
- [ ] Edge cases handled appropriately

### D. Security
- [ ] No secrets or credentials in code
- [ ] Environment variables properly configured (`.env.example` updated if needed)
- [ ] Auth/authorization requirements met (if applicable)

### E. Documentation
- [ ] README updated (if user-facing changes)
- [ ] Inline code comments added (where necessary)
- [ ] API documentation updated (if API changes)
- [ ] Relevant docs in `docs/` updated

### F. Deployment Readiness
- [ ] Preview deployment tested and verified
- [ ] Smoke tests pass (if applicable): `npm run smoke:preview`
- [ ] Environment variables set in hosting platform (if new vars added)
- [ ] Backwards compatible OR migration plan documented

### G. Rollback Plan
- [ ] Rollback steps documented in PR description (below)
- [ ] Changes are reversible
- [ ] No destructive database migrations without backup plan

## Rollback Plan
<!-- Describe how to revert these changes if needed -->

```bash
# Example:
git revert <commit-sha>
# or
git checkout HEAD -- path/to/files
```

**Files to revert:**
- `path/to/file1.ts`
- `path/to/file2.tsx`

**Steps:**
1. Revert commit or files listed above
2. Push to trigger re-deploy
3. Verify rollback in preview/production

## Testing Performed
<!-- Describe the testing you've done -->

- [ ] Manual testing in local development
- [ ] Manual testing in preview deployment
- [ ] Automated tests written/updated
- [ ] Smoke tests executed

**Test Steps:**
1. <!-- Step 1 -->
2. <!-- Step 2 -->
3. <!-- Step 3 -->

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## Additional Notes
<!-- Any additional context or information -->

---

## Reviewer Checklist
<!-- For reviewers -->

- [ ] Code reviewed and approved
- [ ] Acceptance checklist (A→G) verified
- [ ] Preview deployment verified
- [ ] Rollback plan is clear and feasible
- [ ] Documentation is adequate

## References
- [Change Runbook](../docs/CHANGE-RUNBOOK.md) - Process guidelines
- [Deployment Guide](../docs/DEPLOYMENT_GUIDE.md)
- [Development Workflow](../docs/DEVELOPMENT_WORKFLOW.md)
