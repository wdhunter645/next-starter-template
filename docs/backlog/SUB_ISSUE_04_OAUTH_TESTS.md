# Sub-Issue #4: Add Automated Tests for OAuth Flow

**Title:** Add automated tests for OAuth callback handler

**Labels:** `testing`, `enhancement`, `oauth`

**Parent Issue:** #[PARENT_ISSUE_NUMBER]

## Problem Statement

The OAuth callback handler (`src/app/api/auth/callback/route.ts`) has no automated test coverage. This creates risk for regressions and makes it difficult to validate error handling scenarios.

**Current state:**
- OAuth implementation complete and functional
- Zero unit or integration tests
- Manual testing only

**Reference:** OAUTH_IMPLEMENTATION_SUMMARY.md (line 256-260)

## Definition of Done

### Acceptance Criteria

1. Unit tests for callback handler created
2. Mock GitHub OAuth responses implemented
3. Error scenarios tested (invalid code, network failures, etc.)
4. Test coverage ≥80% for OAuth code
5. Tests integrated into CI pipeline
6. Tests pass in CI and locally

## Risks & Assumptions

**Risks:**
- Mocking GitHub OAuth may not catch all edge cases
- Test setup complexity
- False confidence from mocked tests

**Assumptions:**
- Jest/Vitest suitable for Next.js API routes
- GitHub OAuth behavior stable
- Network mocking acceptable (no real OAuth during tests)

**Mitigations:**
- Include integration tests for critical paths
- Document limitations of mocked tests
- Maintain manual test checklist for pre-release

## Deliverables Checklist

- [ ] Install testing dependencies (jest/vitest, testing-library)
- [ ] Create test file: `src/app/api/auth/callback/route.test.ts`
- [ ] Write tests for successful OAuth flow
- [ ] Write tests for error scenarios (5+ cases)
- [ ] Mock GitHub API responses
- [ ] Add test script to package.json
- [ ] Configure test coverage reporting
- [ ] Update CI workflow to run tests
- [ ] Document test patterns in CONTRIBUTING.md

## A→G Acceptance Loop

### A) Preconditions Verified
- [ ] OAuth callback handler exists and is functional
- [ ] Test framework decision made (jest vs vitest)
- [ ] CI/CD pipeline supports test execution
- [ ] Node environment supports test runner

### B) Implementation Steps Executed
- [ ] Installed test dependencies
- [ ] Created test file with 10+ test cases
- [ ] Implemented mock GitHub OAuth responses
- [ ] Configured code coverage
- [ ] Updated CI workflow
- [ ] All tests pass

### C) Repo Health Checks Pass
- [ ] `npm run test` - All tests pass
- [ ] `npm run test:coverage` - Coverage ≥80%
- [ ] `npm run lint` - No errors
- [ ] `npm run build` - Successful
- [ ] CI pipeline green

### D) Minimal E2E Verification
**Exact commands:**
```bash
# Run tests locally
npm run test

# Check coverage
npm run test:coverage

# Verify specific test cases
npm run test -- --verbose callback

# Run tests in CI mode
CI=true npm run test
```

**Expected:**
- All test cases pass
- Coverage report shows ≥80%
- No flaky tests
- Tests complete in <30 seconds

### E) Artifacts Updated
- [ ] src/app/api/auth/callback/route.test.ts (created)
- [ ] package.json (test scripts added)
- [ ] jest.config.js or vitest.config.ts (created)
- [ ] .github/workflows/ci.yml (test step added)
- [ ] CONTRIBUTING.md (testing guide added)
- [ ] CHANGELOG.md: "test: add OAuth callback tests"

### F) Link PR(s) and Reference Parent
- [ ] PR: "test: add automated tests for OAuth flow"
- [ ] Closes #[THIS_ISSUE], part of #[PARENT_ISSUE]
- [ ] Labels: `testing`, `enhancement`

### G) Close with Post-Implementation Note
```markdown
## ✅ Completed

**Test coverage added:**
- 12 test cases for OAuth callback handler
- Success flow, error handling, edge cases
- Coverage: 85% (exceeds 80% target)

**Rollback:** Remove test files and revert package.json/CI changes
```

---

**Estimated effort:** 3-4 hours  
**Complexity:** Medium
