---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2921 compliance-candidate qualification evidence for Project #2784 — requirement-to-evidence trace, route/control test matrix results, rollback/safe-disable notes, Product acceptance prep, and Production-verification hold list
Does Not Own: Runtime/schema/public-copy changes, Production/D1 mutation, legal conclusions, protected #2920 remainder completion claims, or Production promotion
Canonical Reference: /docs/ops/reports/compliance-product-decision-register-2919.md
Related Issues: #2784, #2918, #2919, #2920, #2921
Last Reviewed: 2026-08-05
---

# Compliance Candidate Qualification — #2784-004 (#2921)

## Purpose

Qualify the current `component/compliance-readiness` tip as the compliance candidate for Project #2784 by tracing #2918–#2920 requirements and Bill's accepted Product dispositions to repository evidence, recording what is resolved vs protected-deferred, running the applicable route/control test matrix, and documenting rollback/safe-disable behavior and recurring-review handoff.

This document makes **no runtime, schema, D1, or public-copy change**. It does **not** claim #2920's protected remainder complete.

## Scope

In scope: documentation qualification against component tip `176de63e7fb53af1dd5904ef942c7780244d7a4c`, focused control tests already present on that tip, and pointers to the recurring-review how-to.

Out of scope: Production merge to `main`, Cloudflare/Production credential use, new application code, migrations, provider configuration, and treating protected #2920 gates as finished.

## Current known truth

| Field | Value |
| --- | --- |
| Source issue | #2921 (`#2784-004`) |
| Parent project | #2784 |
| Component tip (qualification baseline) | `176de63e7fb53af1dd5904ef942c7780244d7a4c` |
| Working branch | `cursor/2784-004-compliance-qualification` |
| PR target | `component/compliance-readiness` |
| Executing agent | Cursor Local |
| Predecessor #2918 | CLOSED — inventory accepted (PR #3045) |
| Predecessor #2919 | CLOSED `status:complete` — register + rights/privacy controls + evidence reports |
| Predecessor #2920 | OPEN `status:blocked` — first increment (item 10) MERGED via PR #3089 and WORK-accepted; remainder held |
| Writable allowlist for this task | two docs files only (this report + recurring-review how-to) |

## Intended final state

- Every Product Decision Record item 1–10 is classified as **resolved on component**, **safely deferred/disabled pending gate**, **Product-held**, or **Production-verification required**, with evidence paths.
- Applicable control tests for implemented #2919/#2920 increments are recorded PASS on this tip.
- Rollback/safe-disable for shipped increments is explicit.
- Recurring review owner, cadence, evidence, and escalation are defined in `docs/how-to/website/compliance-recurring-review.md`.
- Independent WORK review and protected Production approval remain required before any Production claim.

## Requirement-to-evidence trace (Product Decision Record items 1–10)

| ID | Disposition (Bill APPROVED 2026-08-04) | Component evidence | Classification for #2921 |
| --- | --- | --- | --- |
| 1 | Verify live D1 `/privacy`/`/terms`; soften unsupported proceeds claims | Repo composition + seed documented in `docs/ops/reports/compliance-privacy-terms-live-state-2919.md`. Live Production D1 query **not** performed (no authorized CF auth). Public copy remediation owned by #2920. | **Production-verification required** (live D1); copy change **deferred to #2920** |
| 2 | Verify Production `NEXT_PUBLIC_GA_ID`; disable if active until disclosure/consent | Repo gate (`GoogleAnalytics` no-op when unset) documented in `docs/ops/reports/compliance-ga-production-state-2919.md`. Live Pages env **not** confirmed. Consent UI owned by #2920. | **Production-verification required**; disclosure UI **deferred to #2920** |
| 3 | Full rights/consent capture + fail-closed | Migration `0045_rights_privacy_evidence_controls.sql`; `tests/api/library-submit-rights-capture.test.ts` | **Resolved on component** (#2919) |
| 4 | Auditable internal takedown via `/contact` intake | Admin suppress API + `docs/how-to/website/takedown-soft-delete-and-recovery.md` | **Resolved on component** (#2919) |
| 5 | Admin soft delete + SLA; no hard delete | `tests/api/admin-member-soft-delete.test.ts`; takedown/soft-delete how-to (SLA 5 business days ack / 30 days action) | **Resolved on component** (#2919) |
| 6 | Dedicated accessibility statement (draft → Bill wording → publish) | Direction approved; **exact wording not Bill-approved**; live route not published | **Product-held** (wording) + **deferred to #2920** (publication) |
| 7 | Enumerate auth/member fields on `/privacy` | Approved direction; public copy not yet applied on component beyond existing privacy page baseline | **Deferred to #2920** (after item 1 live-state) |
| 8 | Enforce `email_opt_in` promotional gate | `tests/api/join-email-opt-in-gate.test.ts` | **Resolved on component** (#2919) |
| 9 | No unauthenticated public gallery until credit-preference + publish-time credit enforcement | Per #2919 package — gallery launch remains fail-closed / not promoted without those controls (launch blocker remains unless Product accepts alternate) | **Safely deferred / launch-blocked** until gallery promotion package proves credit controls (not claimed complete here) |
| 10 | Neutral unconfirmed charity "Partner" labeling with neutral wording | `src/components/FriendsOfFanClub.tsx` defaults use `kind: 'Friend'`; PR #3089 MERGED; WORK accepted first increment | **Resolved on component** (#2920 increment 1) |

### Launch-blocker summary

| Blocker | Status |
| --- | --- |
| Rights/consent capture fail-closed | Resolved on component |
| Takedown + soft-delete + SLA docs | Resolved on component |
| Email opt-in send gate | Resolved on component |
| Unconfirmed Partner labeling | Resolved on component (defaults) |
| Live `/privacy`/`/terms` D1 composition | Unresolved — Production D1 read required |
| Live GA Production env + consent UI | Unresolved — Production read + #2920 UI |
| Accessibility statement publication | Unresolved — Bill wording + #2920 publish |
| Auth field enumeration on `/privacy` | Unresolved — #2920 |
| Public gallery without credit controls | Remains launch-blocked / not promoted |

**Product Authority must still explicitly accept** any launch that proceeds while Production-verification and #2920 remainder items stay open.

## Route / control test matrix

Recorded on working tree at qualification baseline tip `176de63e` (2026-08-05, Cursor Local):

| Control | Command / surface | Result |
| --- | --- | --- |
| Rights capture fail-closed | `npx vitest run tests/api/library-submit-rights-capture.test.ts` | **PASS** (6 tests) |
| Email opt-in send gate | `npx vitest run tests/api/join-email-opt-in-gate.test.ts` | **PASS** (3 tests) |
| Member soft-delete | `npx vitest run tests/api/admin-member-soft-delete.test.ts` | **PASS** (5 tests) |
| Friends labeling / render | `npx vitest run tests/friends-of-fanclub.test.tsx` | **PASS** (2 tests) |
| Focused matrix aggregate | four files above | **16/16 PASS** |

Full-suite commands required by the issue package (`npx vitest run`, `npm run typecheck`, `npm run verify:invariants`, docs header/diataxis checks) are re-run before PR open and recorded in the PR Verification section. They do not mutate Production.

Public route smoke (`/privacy`, `/terms`, `/join`, `/contact`, `/accessibility`) against live Production is **not** claimed here — that remains operator/Production-verification work.

## Rollback and safe-disable

| Shipped increment | Rollback | Safe-disable / fail-closed note |
| --- | --- | --- |
| #2919 rights/privacy controls (PR #3070 family) | Revert the component-branch PR(s) that introduced migration `0045` + related API/UI; restore prior component tip | Without the controls, submissions that required new fields fail closed or lose the new admin paths; manual email intake remains for takedown/deletion |
| #2919 evidence reports (privacy/GA live-state docs) | Remove/revise docs only — no runtime impact | N/A |
| #2920 item 10 Partner→Friend (PR #3089) | Revert PR #3089 on `component/compliance-readiness` | Defaults revert to prior labeling; D1-backed friend rows may still carry their own `kind` values |
| This #2921 docs package | Revert the single #2921 component PR | No runtime impact |

No Production state is changed by #2921. Rollback profile for the task PR: **multi-step** (component PR revert).

## Product acceptance and promotion prep

Ready for independent WORK review of this qualification package when:

1. Diff contains only the two allowlisted docs files.
2. Focused control matrix above is PASS (and full package validation disclosed on the PR).
3. Protected #2920 remainder is listed as unresolved (this section).

**Not** ready for Production promotion until: live D1 privacy/terms verification, live GA verification (and disable if required), Bill-approved accessibility wording + publication, remaining #2920 public-copy items, and explicit Product/Production authority for promotion.

Successor after WORK accept of #2921: parent #2784 closeout and Product acceptance — not automatic Production merge.

## Recurring review

Canonical procedure: [`docs/how-to/website/compliance-recurring-review.md`](../../how-to/website/compliance-recurring-review.md).

## Explicit non-claims

- #2921 does **not** complete #2920.
- #2921 does **not** assert live Production D1 or Cloudflare Pages configuration state.
- #2921 does **not** authorize Production merge, credential creation, or paid commitments.

## Rollback of this document

Remove or revise this report without other repository impact — docs-only.
