# Acceptance Checklist Template (A→G)

Use this checklist in PR descriptions to ensure all requirements are met before merging.

## Standard Acceptance Criteria (A→G)

### A) Code Quality & Types ✅
- [ ] TypeScript compilation succeeds (`npm run typecheck`)
- [ ] No type errors or `any` types without justification
- [ ] All interfaces and types properly defined

### B) Linting & Formatting ✅
- [ ] ESLint passes with no errors (`npm run lint`)
- [ ] Code follows project style guidelines
- [ ] No console.log statements in production code

### C) Build Success ✅
- [ ] Next.js build completes successfully (`npm run build`)
- [ ] No build warnings or errors
- [ ] All pages and API routes compile
- [ ] Static generation works for applicable routes

### D) Testing & Verification ✅
- [ ] Smoke tests pass (`./scripts/smoke.sh`)
- [ ] Manual testing completed for changed functionality
- [ ] All endpoints return expected status codes
- [ ] Error states handled gracefully

### E) Documentation & Security 🔒
- [ ] Docs-secret-audit passes (`npm run audit:docs`)
- [ ] No secrets committed to repository
- [ ] `.env.example` updated with new environment variable NAMES (no values)
- [ ] Sensitive data uses placeholders (e.g., `REDACTED`, `EXAMPLE`)
- [ ] All new features documented

### F) Deployment Configuration 🚀
- [ ] `.nvmrc` specifies Node 20
- [ ] Cloudflare Pages settings documented in `docs/ops/STAGING-MIRROR.md`
- [ ] Build command: `npm run build` (or `npm run build:cf`)
- [ ] Output directory correctly configured
- [ ] Preview deployment succeeds
- [ ] Production deployment plan validated

### G) Environment & Configuration ⚙️
- [ ] All referenced env var NAMES in `.env.example`
- [ ] Code handles missing env vars gracefully
- [ ] Admin APIs return 401/403 when unauthorized
- [ ] Missing service configs return 503 (not 500)
- [ ] No hardcoded URLs or credentials

## Additional Checks

### Accessibility & UX
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Error messages user-friendly
- [ ] Loading states implemented where needed

### Performance
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Static assets cached appropriately
- [ ] API responses reasonably fast

### Integration
- [ ] Works with/without optional integrations (Supabase, B2, etc.)
- [ ] Feature flags respected
- [ ] Graceful degradation when services unavailable

## PR Metadata Checklist

- [ ] Title follows conventional commits format
- [ ] Description includes context and rationale
- [ ] Linked to parent issue/tracker (if applicable)
- [ ] Labels applied: `stabilization`, `ops`, `feature`, `fix`, etc.
- [ ] Verification section with URLs/commands tested
- [ ] Breaking changes clearly documented
- [ ] Migration steps provided (if needed)

## Pre-Merge Checklist

- [ ] All CI checks green
- [ ] Code reviewed and approved
- [ ] Conflicts resolved
- [ ] Squash and merge (or appropriate merge strategy)
- [ ] Deployment plan communicated to team

---

## Example Usage in PR Description

```markdown
## Acceptance Criteria

- [x] A) Types: TypeScript compilation succeeds
- [x] B) Lint: ESLint passes with no errors
- [x] C) Build: Next.js build completes successfully
- [x] D) Tests: Smoke tests pass (12/12)
- [x] E) Docs: No secrets in code, .env.example updated
- [x] F) CF: .nvmrc = 20, build command documented
- [x] G) Env: All env names in .env.example, graceful degradation

## Verification

**Local Testing:**
```bash
npm ci
npm run typecheck  # ✅ Pass
npm run lint       # ✅ Pass
npm run build      # ✅ Pass
npm run audit:docs # ✅ Pass
./scripts/smoke.sh # ✅ 12/12 pass
```

**Preview Deployment:**
- URL: https://pr-123-project.pages.dev
- Smoke tests: ✅ All endpoints return expected status codes
- Admin gates: ✅ Return 503 when services not configured

**Parent Tracker:**
Linked to #456 (Website Buildout Plan)
```
