# Pull Request

## Change Runbook Checklist
> Complete the [Change Runbook](../docs/CHANGE-RUNBOOK.md) for this PR. Copy the relevant sections below:

### Summary
- **Change title:** 
- **Scope (code/docs/config):** 
- **Risk level (Low/Med/High):** 
- **Why now:** 

### Preconditions (A)
- [ ] Repo clean
- [ ] Required env names exist in CF Pages (no values in git)
- [ ] Secrets NOT logged or committed
- [ ] Affected services/components listed

### Implementation (B)
- **What changed (files/paths):** 
- **Feature flags/toggles:** 
- **Data/schema impact:** 

### Health Checks (C)
- [ ] `npm ci` succeeds
- [ ] `npm run build` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] No console errors in browser (if UI change)

### Rollout & Verification (D)
- [ ] Preview deployed and tested
- [ ] Production deployment planned/completed
- **Preview URL:** 
- **Smoke test results:** 

### Monitoring & Rollback (E)
- [ ] Monitoring in place
- [ ] Rollback procedure documented
- **Metrics/logs to watch:** 
- **Rollback plan:** 

### Documentation (F)
- [ ] README updated (if needed)
- [ ] API docs updated (if needed)
- [ ] Config/env docs updated (if needed)
- [ ] Inline comments added for complex logic

### Sign-Off (G)
- [ ] Change tested in preview environment
- [ ] No secrets in code or logs
- [ ] Team notified (if high-risk)
- [ ] Runbook completed
- **Approved by:** 
- **Date:** 

---

## Additional Context
<!-- Add any additional context, screenshots, or notes here -->

---

**📖 See [CHANGE-RUNBOOK.md](../docs/CHANGE-RUNBOOK.md) for detailed guidance and examples.**
