---
Doc Type: Operations
Audience: Human + AI
Authority Level: Advisory Review Artifact
Owns: 2026-03-27 design-flow review findings, remediation ordering, review snapshot context
Does Not Own: Canonical design authority; implementation specs; final architecture decisions
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-27
---

# LGFC — Design Flow Review (2026-03-27)

## 1. Purpose
Capture the top-down repository review that validates whether design authority flows cleanly into subordinate specs, as-built documentation, and downstream operational docs.

This file is advisory only. It preserves the review artifact that PR #781 stated would land in-repo.

## 2. Snapshot Rule
This document records the review state and remediation order identified on 2026-03-27.

Some findings may later be partially or fully addressed by follow-up PRs. That does not change the purpose of this file as the review artifact for the original scan.

## 3. Review Objective
- Validate that canonical design authority flows downward without contradiction.
- Identify stale references, broken document chains, and locked-spec collisions.
- Produce one repository-native remediation order that can be executed sequentially.

## 4. Top-Down Review Outcome
Overall result: **PARTIAL / UNSTABLE**

Observed problem classes:
- Admin/auth contradictions across authority and child docs.
- Broken references that make document chains unreliable.
- Locked spec collisions that keep implementation reviews noisy.
- Active authority docs carrying incomplete, draft, or stale wording.
- Canonical hash/update work being performed before content stability is reached.

## 5. Findings Summary

### A. Admin auth contradiction
Admin/session/auth language was not consistently aligned across the document chain, with contradictions flowing through auth authority and admin-oriented docs.

Primary concern area:
- `docs/reference/design/auth-model.md`
- `docs/reference/design/dashboard.md`
- `docs/reference/architecture/access-model.md`

Impact:
- Highest churn source.
- Causes downstream documentation drift.
- Re-breaks later cleanup when auth wording diverges again.

### B. Broken references
Dead or stale paths were present in the document chain.

Impact:
- Creates noisy scans.
- Prevents trustworthy top-down validation.
- Breaks confidence in “source of truth” traversal.

### C. Locked spec collisions
Locked docs were still contradicting each other in at least one critical area.

Named review example:
- Floating logo conflict between locked documents.

Impact:
- Guarantees repeated regression in implementation review.
- Prevents exact lock compliance.

### D. Stale or incomplete authority docs
Some active authority-facing docs still carried incomplete, planned, awaiting-copy, or stale auth wording.

Impact:
- Active authority docs cannot safely remain half-draft.
- Review outcomes remain unstable while those docs stay authoritative.

### E. Canonical coverage timing problem
Canonical hash refresh and related coverage updates were being attempted before authority/content cleanup was complete.

Impact:
- Hashes unstable state.
- Creates avoidable rework.
- Makes later remediation harder to verify.

### F. Review-date and minor-gap cleanup
Review dates and small coverage gaps remained, but these were not the main blockers.

Examples:
- Review date refresh.
- Small Store behavior coverage decision.
- Root data model section expansion or explicit delegation.

Impact:
- Cleanup-only.
- Not a blocker compared with auth and broken-reference work.

## 6. Recommended Fix Order

1. **Admin auth model first**  
   Pick one admin model and purge the others everywhere. This is the biggest contradiction source and keeps poisoning downstream docs (`auth-model.md`, `dashboard.md`, `access-model.md`). Until this is settled, other cleanup keeps getting re-broken.

2. **Broken references second**  
   Fix every dead path immediately after auth. Dead links keep scans noisy and make it impossible to trust document chains. This is fast cleanup with high impact.

3. **Locked spec collisions third**  
   Reconcile the floating logo conflict next. Root authority should win, then lock files should match it exactly.

4. **Purge stale/incomplete authority docs**  
   Anything marked incomplete, planned, awaiting copy, or carrying stale auth wording should either be completed, downgraded, or clearly marked non-authoritative. Active authority docs cannot stay half-draft.

5. **Normalize canonical coverage last among content fixes**  
   After content is stable, update `.canonical-hashes.sha256` and add any missing design docs. Do this after authority/content cleanup, not before.

6. **Review dates and minor coverage last**  
   Refresh `Last Reviewed` dates, then handle minor spec gaps only after the major contradictions are closed.

## 7. Best Single-Path Execution
- **PR 1:** Admin auth unification + stale auth wording purge
- **PR 2:** Broken references + floating logo lock reconciliation
- **PR 3:** Incomplete/draft authority cleanup
- **PR 4:** Canonical hash expansion + review date refresh + minor spec gaps

## 8. Interpretation Rule
This review artifact is not itself the canonical design authority.

If any statement here conflicts with `docs/reference/design/LGFC-Production-Design-and-Standards.md` or later locked remediation docs, the canonical/locked design files win.

## 9. Bottom Line
The repository review found that auth contradiction was the main churn source, dead references were the next fastest trust-restoration fix, and hash/date cleanup belonged at the end rather than the beginning.

That execution order is the key output of this review.
