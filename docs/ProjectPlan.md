# LGFC — Project Plan (Living)

Purpose: the canonical “what’s next” plan. This is **not** a history log (use `/docs/ActionLog.md` for that).

## Operating rules
- Repo docs are authoritative.
- ZIP workflow is standard: upload ZIP → Agent PR unzips → ZIP deleted → only real files committed.
- Navigation rules are governed by `/docs/NAVIGATION-INVARIANTS.md`.
- Use `/docs/PR-DRAFT-TEMPLATE.md` for all Agent PR drafts.

## Plan (ordered)

### 1) Documentation + governance hardening (COMPLETED)
- [x] Add authoritative PR draft template (`/docs/PR-DRAFT-TEMPLATE.md`)
- [x] Add Copilot/Agent instructions (`/.github/copilot-instructions.md`)
- [x] Add navigation invariants (`/docs/NAVIGATION-INVARIANTS.md`)
- [x] Add action log (`/docs/ActionLog.md`)
- [x] Add this project plan (`/docs/ProjectPlan.md`)

### 2) ZIP 3: JOIN + LOGIN baseline (COMPLETED - PR #441)
- [x] Implement `/join` page and form
- [x] Implement `/login` page and form
- [x] Create `/api/join` endpoint for new member registration
- [x] Create `/api/login` endpoint for member authentication
- [x] Add JOIN and LOGIN buttons to visitor header
- [x] Update documentation (PR #442)

### 3) Navigation compliance pass (NEXT)
- [ ] Ensure `Header` matches navigation invariants on desktop/tablet/mobile
- [ ] Ensure `HamburgerMenu` matches invariants (no Join/Login, no footer links, Home mobile-only)
- [ ] Remove any conflicting doc statements

### 4) ZIP 4: Environment variable/binding validation + rate limiting
- [ ] Fail-fast environment variable validation for all sensitive API routes
- [ ] Cloudflare-native rate limiting on sensitive API routes (join, login, admin endpoints)
- [ ] Runtime binding verification (D1, KV, secrets) with graceful error responses
- [ ] Update documentation with rate limiting configuration and validation patterns

### 5) ZIP 5: Content Security Policy implementation
- [ ] Implement Content Security Policy headers (after external dependencies stabilize)
- [ ] Configure CSP for Elfsight widget and other approved third-party resources
- [ ] Test and validate CSP in staging environment before production rollout
- [ ] Document CSP policy decisions and override procedures

### 6) ZIP 6: Final production-ready declaration
- [ ] Final security audit and penetration testing review
- [ ] Performance optimization verification and baseline establishment
- [ ] Complete deployment checklist validation
- [ ] Production monitoring and alerting configuration
- [ ] Official production-ready declaration and handoff documentation

### 7) Page inventory + routing sanity
- [ ] Confirm required routes exist and match header targets
- [ ] Confirm footer routes exist and render correctly
- [ ] Confirm `/admin` route behavior matches governance docs

### 8) Security hardening (REQUIRED post-merge)
- [ ] Run `npm audit` locally and in CI; record full output
- [ ] Remediate the reported 3 low severity vulnerabilities:
  - Prefer `npm audit fix`
  - Only use `npm audit fix --force` if reviewed and accepted (breaking changes risk)
- [ ] Add a CI step that fails if vulnerabilities are detected (or explicitly allows low only with justification)
- [ ] Verify: `npm audit` returns 0 vulnerabilities

### 9) Day 2 / Day 3 future enhancements (DEFERRED until stability)
- [ ] Cloudflare Future Enhancements list (redirect rules, cache rules, headers, WAF/bots, analytics)
- [ ] Health status / monitoring summary view
- [ ] Ops automation (audits, drift detection, PR guardrails)

## Definition of “Ready” for a new phase
A phase is “ready” only if:
- Navigation invariants are enforced in UI
- Docs are internally consistent (no contradictions)
- Build passes
- ZIP workflow hygiene is maintained (ZIP never committed)
