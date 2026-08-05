---
Doc Type: How-To
Audience: Bill, Product Authority, WORK (ChatGPT), Cursor, Claude Code, LGFC operators and maintainers
Authority Level: Operational Procedure
Owns: Recurring compliance review ownership, cadence, evidence checklist, and escalation for Project #2784 / candidate tip on `component/compliance-readiness`
Does Not Own: Runtime implementation, Production mutation, legal conclusions, or replacing one-off task PRs (#2918–#2921)
Canonical Reference: /docs/ops/reports/compliance-candidate-qualification-2921.md
Related Issues: #2784, #2918, #2919, #2920, #2921
Last Reviewed: 2026-08-05
---

# Run Recurring Compliance Review

## Purpose

Establish who owns ongoing compliance review for the Lou Gehrig Fan Club public/member surfaces, how often review runs, what evidence to collect, and how to escalate protected gaps (especially Production/D1 and public-copy items still held under #2920).

## Scope

Covers recurring review against the compliance candidate on `component/compliance-readiness` and any later Production tip that inherits those controls. Does not authorize Production configuration changes, Cloudflare credential creation, or claiming #2920 protected remainder complete without a cleared gate.

## Current known truth

- Inventory and Product decisions: #2918 / #2919 register (accepted).
- Rights/privacy evidence controls and soft-delete/takedown procedures: shipped on component via #2919; operator how-to at `docs/how-to/website/takedown-soft-delete-and-recovery.md`.
- Charity labeling first increment: #2920 PR #3089 (neutral "Friend" defaults).
- Live Production D1 privacy/terms composition and live `NEXT_PUBLIC_GA_ID` remain **unverified** without authorized Cloudflare access.
- Accessibility statement exact wording remains **Product-held** before publication.

## Roles

| Role | Owner | Responsibility |
| --- | --- | --- |
| Product Authority | Bill | Accept or defer launch blockers; approve public accessibility wording; authorize Production-facing copy |
| WORK / independent review | ChatGPT (WORK) | Independent review of qualification and child PRs; do not self-approve Implementation work WORK implemented |
| Implementation / Operations | Cursor Local (default); Claude when labeled | Bounded code/docs packages only; no self-merge to Production |
| Production operator | Bill or designated operator with CF access | Live D1/Pages reads; Production env disable/enable when authorized |

## Cadence

| Review | Cadence | Trigger |
| --- | --- | --- |
| Control regression smoke | Before each compliance-related component PR merge and after merge to `component/compliance-readiness` | PR open / post-merge |
| Protected Production verification | When CF auth is available, and at least once before any Production promotion of #2784 | Gate clearance or promotion prep |
| Full recurring compliance review | **Quarterly**, or immediately after material public-copy / auth / analytics / rights changes | Calendar or change-driven |
| Emergency review | Within **2 business days** of a rights, privacy, or charitable-claim incident | Incident / external complaint |

## Evidence checklist (each full review)

1. Confirm tip SHA under review and whether it includes #2919 controls + #2920 item 10.
2. Re-run focused control tests (or CI equivalents):
   - `tests/api/library-submit-rights-capture.test.ts`
   - `tests/api/join-email-opt-in-gate.test.ts`
   - `tests/api/admin-member-soft-delete.test.ts`
   - `tests/friends-of-fanclub.test.tsx`
3. Spot-check public routes in the target environment (component preview and/or Production when authorized): `/privacy`, `/terms`, `/join`, `/contact`, and `/accessibility` if published.
4. Confirm takedown/soft-delete SLA procedure still matches ops practice (`docs/how-to/website/takedown-soft-delete-and-recovery.md`).
5. Record status of protected items:
   - Live D1 `/privacy`/`/terms` composition
   - Production `NEXT_PUBLIC_GA_ID` and consent/disclosure UI
   - Accessibility statement wording + publication
   - Remaining #2920 public-copy items
6. Update or cite the latest qualification report (`docs/ops/reports/compliance-candidate-qualification-2921.md` or successor).
7. File follow-up Issues for any new gap; do not expand an in-flight PR allowlist.

## Escalation

| Condition | Action |
| --- | --- |
| Missing accepted Product decision for a public claim | Stop; open/route to Product Authority — do not invent copy |
| Live D1 or GA state unknown and promotion requested | **HOLD** — Production-verification required; do not guess |
| Accessibility wording unpublished but launch claimed | Escalate to Bill; keep #2920 publication gate |
| Control test regression | Block merge; Implementation remediates under a new bounded Issue/PR |
| Suspected credential or private-data exposure | Stop; escalate to Bill/WORK; no further mutation |
| Authority conflict between agents | Stop; WORK/PMO reconciles — prompts do not override `Agent.md` chain |

## Safe-disable reminders

- GA: component renders analytics only when `NEXT_PUBLIC_GA_ID` is set; Production disable is an authorized env change, not a docs edit.
- Rights capture and opt-in gates: fail closed when required fields/gates are unmet — do not bypass in Production for convenience.
- Takedown/soft-delete: prefer suppress/soft-delete; hard delete remains unauthorized.
- Charity labeling: prefer documented relationship/consent before any non-neutral label.

## Related documents

- `docs/ops/reports/compliance-candidate-qualification-2921.md`
- `docs/ops/reports/compliance-product-decision-register-2919.md`
- `docs/ops/reports/compliance-readiness-inventory-2918.md`
- `docs/ops/reports/compliance-privacy-terms-live-state-2919.md`
- `docs/ops/reports/compliance-ga-production-state-2919.md`
- `docs/how-to/website/takedown-soft-delete-and-recovery.md`
- `docs/how-to/website/website-production-smoke-test.md`
