# Create Automated Test Infrastructure

**Labels:** `testing`, `ci-cd`, `infrastructure`  
**Parent Issue:** #{PARENT_ISSUE_NUMBER}

---

## Problem Statement

Repository has no automated tests. Quality relies entirely on manual verification and npm lint/build checks. This creates risk of regressions and slows development.

---

## Definition of Done

- [ ] Test framework installed (Vitest or Jest)
- [ ] Basic smoke tests for critical components
- [ ] CI integration (GitHub Actions workflow)
- [ ] Test coverage reporting
- [ ] Documentation on writing/running tests

---

## Proposed Solution

1. Install Vitest (aligns with Next.js 15)
2. Create test/ directory with sample tests
3. Add npm test script
4. Create .github/workflows/test.yml
5. Document in CONTRIBUTING.md

---

## A→G Acceptance Criteria

### A) Preconditions verified
- [ ] Choose test framework (Vitest recommended)
- [ ] Review Next.js testing docs
- [ ] No existing test infrastructure

### B) Implementation steps executed
- [ ] Install test dependencies
- [ ] Configure test framework
- [ ] Write 5-10 smoke tests
- [ ] Add npm scripts

### C) Repo health checks pass
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes

### D) Minimal e2e verification complete
- [ ] Tests run locally and pass
- [ ] CI workflow triggers on PR
- [ ] Coverage report generated

### E) Artifacts updated
- [ ] CONTRIBUTING.md testing section
- [ ] README.md updated with test badge

### F) Link PR(s) and reference parent
- [ ] PR with "Closes #{this_issue}"
- [ ] References parent #{PARENT_ISSUE_NUMBER}

### G) Close with post-implementation note
**What changed:** Added Vitest with smoke tests, CI integration  
**How to verify:** Run `npm run test`  
**Rollback:** Remove test files and dependencies

---

**Estimated Effort:** 4-6 hours  
**Priority:** Medium
