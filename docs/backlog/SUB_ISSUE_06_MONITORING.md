# Sub-Issue #6: Enhance Monitoring and Logging

**Title:** Add security event logging and OAuth metrics

**Labels:** `observability`, `security`, `enhancement`

**Parent Issue:** #[PARENT_ISSUE_NUMBER]

## Problem Statement

Current application has minimal observability:
- No security event logging (auth failures, suspicious activity)
- No OAuth flow metrics (success/failure rates)
- No deployment verification tracking
- No performance baselines

**Impact:**
- Security incidents hard to detect
- OAuth issues not visible until user reports
- No data to optimize flows
- Troubleshooting requires guesswork

**Reference:** OAUTH_IMPLEMENTATION_SUMMARY.md (line 414)

## Definition of Done

### Acceptance Criteria

1. Security event logging implemented
2. OAuth metrics collected
3. Deployment verification results logged
4. Performance monitoring baseline established
5. Log aggregation configured (optional)
6. Dashboard or query interface available
7. Retention policy defined

## Risks & Assumptions

**Risks:**
- Logging overhead impacts performance
- Sensitive data logged accidentally
- Log storage costs
- Privacy concerns (GDPR, etc.)

**Assumptions:**
- Cloudflare Workers support logging
- Console logs sufficient (or integrate service)
- Structured logging preferred
- No PII in logs

**Mitigations:**
- Sample high-volume events
- Scrub sensitive data before logging
- Document what gets logged
- Set retention limits

## Deliverables Checklist

- [ ] Design logging schema (structured JSON)
- [ ] Implement security event logger
- [ ] Add OAuth flow metrics
- [ ] Add deployment tracking
- [ ] Configure log sampling/filtering
- [ ] Set up log aggregation (Cloudflare Logs or external)
- [ ] Create example queries
- [ ] Document logging patterns
- [ ] Define retention policy

## A→G Acceptance Loop

### A) Preconditions Verified
- [ ] Logging requirements defined
- [ ] Privacy/compliance reviewed
- [ ] Log storage solution selected
- [ ] Performance impact acceptable

### B) Implementation Steps Executed
- [ ] Created logging utility module
- [ ] Instrumented OAuth callback
- [ ] Added security event logging
- [ ] Configured log aggregation
- [ ] Tested log output
- [ ] Verified no PII logged

### C) Repo Health Checks Pass
- [ ] `npm run lint` - No errors
- [ ] `npm run build` - Successful
- [ ] `npm run test` - All tests pass
- [ ] No performance regression

### D) Minimal E2E Verification
**Exact commands:**
```bash
# Trigger OAuth flow and check logs
npm run dev
# Visit http://localhost:3000/auth/...
# Check terminal for structured logs

# Check Cloudflare logs (production)
npx wrangler tail

# Query for security events
# (depends on log aggregation service)
```

**Expected:**
- OAuth events logged with timestamps
- Security events include relevant context
- No sensitive data in logs
- Logs queryable/searchable

### E) Artifacts Updated
- [ ] src/lib/logger.ts (created)
- [ ] src/app/api/auth/callback/route.ts (instrumented)
- [ ] docs/LOGGING.md (logging guide created)
- [ ] docs/SECURITY.md (updated with monitoring info)
- [ ] CHANGELOG.md: "feat: add security and OAuth logging"

### F) Link PR(s) and Reference Parent
- [ ] PR: "feat: enhance monitoring and logging"
- [ ] Closes #[THIS_ISSUE], part of #[PARENT_ISSUE]
- [ ] Labels: `observability`, `security`

### G) Close with Post-Implementation Note
```markdown
## ✅ Completed

**Logging implemented:**
- Security event logging (auth failures, errors)
- OAuth flow metrics (success/failure/latency)
- Structured JSON format
- No PII logged

**Access logs:**
- Local: Check console output
- Production: `npx wrangler tail`
- Aggregation: [service name if applicable]

**Rollback:** Remove logging calls, revert src/lib/logger.ts
```

---

**Estimated effort:** 3-4 hours  
**Complexity:** Medium
