# Homepage Drift Log

This document tracks instances of homepage structural drift from the v6 specification and their remediation.

---

## PRs 280–287: Social Wall and Homepage Drift (SUPERSEDED)

**Date Range:** Unknown (prior to November 2025)  
**Status:** ❌ **FULLY SUPERSEDED** — Do not reference or reimplement

### Problem Summary

PRs in the 280–287 series introduced:
- Ad-hoc Social Wall implementations that deviated from the v6 specification
- Homepage section reordering and structural changes
- Drift from the canonical homepage layout defined in `/docs/lgfc-homepage-legacy-v6.html`

This resulted in:
- **Audit #2** — Homepage drift from v6 spec (beyond immediate code fixes)
- **Audit #4** — Repository drift requiring manual audits
- **Audit #5** — Risk of misapplied PRs repeating the same mistakes

### Resolution Chain

These issues have been **fully resolved** through the following PRs:

1. **PR B** — Canonical Social Wall Implementation
   - Established the single, correct Social Wall component
   - Defined the standard Elfsight widget integration
   - Documented in `/docs/SOCIAL-WALL-TROUBLESHOOTING.md`

2. **PR C** — V6 Alignment Restoration
   - Restored homepage section order to match v6 specification
   - Fixed immediate functional issues from drift
   - Reestablished Hero → Weekly → Join → Social → Discussions → Friends → Calendar → FAQ/Milestones order

3. **PR E** — Drift Guard and Documentation (THIS PR)
   - Created automated test: `tests/homepage-structure.test.tsx`
   - Added package scripts: `npm run test:homepage-structure` and `npm run verify-homepage`
   - Documented v6 invariants in `/docs/Design-spec.md`
   - Created this drift log for historical reference

### Future Guidance

**For Social Wall Changes:**
- Modify the canonical `src/components/SocialWall.tsx` component
- Follow the Elfsight integration pattern documented in PR B
- Test with `npm run test:homepage-structure` before submitting
- Do NOT create parallel or alternative Social Wall implementations

**For Homepage Structure Changes:**
- Any section reordering or removal requires explicit governance approval
- Update all three: `/docs/Design-spec.md`, `/docs/HOMEPAGE_SPEC.md`, and `tests/homepage-structure.test.tsx`
- Reference the approval issue/decision in the PR description
- Ensure `npm run verify-homepage` passes before merge

**Do NOT:**
- Reintroduce ad-hoc Social Wall widgets or implementations
- Reorder homepage sections without updating the invariants documentation and tests
- Copy patterns from PRs 280–287 (they are superseded)
- Make "quick fixes" that bypass the drift guard test

---

## Drift Detection & Prevention

### Automated Safeguards

1. **CI Test Gate:** `npm run test:homepage-structure` runs in CI on every PR
2. **Local Verification:** Developers can run `npm run verify-homepage` before pushing
3. **Documentation Lock:** V6 invariants section in `/docs/Design-spec.md` defines the contract
4. **Code Review:** Any test modifications require explicit justification in PR description

### Manual Review Cadence

- **Weekly:** Compare snapshots to detect subtle drift
- **Pre-Deployment:** Reference snapshots before major releases
- **Post-Incident:** Review snapshots to identify when issues were introduced

See `/docs/website-PR-governance.md` for full snapshot review procedures.

---

## Adding New Entries

When a new drift incident is identified and resolved:

1. Add a new section below with format:
   ```
   ## [PR Range/Number]: [Brief Description] (STATUS)
   **Date Range:** YYYY-MM-DD
   **Status:** [🔴 ACTIVE / 🟡 IN PROGRESS / ❌ SUPERSEDED / ✅ RESOLVED]
   ```

2. Document the problem, impact, and resolution
3. Provide future guidance to prevent recurrence
4. Update the drift detection section if new safeguards are added

---

**Last Updated:** 2025-11-15  
**Maintained By:** Repository governance as defined in `/docs/website-PR-governance.md`
