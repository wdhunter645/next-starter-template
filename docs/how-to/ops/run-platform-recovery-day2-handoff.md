---
Doc Type: How-To
Audience: Human + AI
Authority Level: Procedure
Owns: Operator steps to re-qualify the #2779 recovery package and complete Day-2 handoff checks (#2897)
Does Not Own: Production Go, live recovery activation, secret handling, or destructive drills
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2779, #2897, #2896, #2895, #2894
Last Reviewed: 2026-08-03
---

# Run platform recovery Day-2 handoff qualification

## Purpose

Re-run the Development recovery package validators and the #2897 Day-2
qualification check without mutating Production or activating live recovery.

## Preconditions

- Working tree is on `component/platform-recovery-readiness` or a task branch
  rooted from it.
- Source Issue #2897 authorizes the qualification.
- Predecessor proofs #2894–#2896 are present on the branch.
- No Production force flags are set (unless proving fail-closed).
- Secrets are not required and must not be pasted into evidence.

## Steps

1. Confirm force flags are unset (or set only to prove fail-closed):
   `LGFC_FORCE_PRODUCTION_ROLLBACK`, `LGFC_FORCE_PRODUCTION_OUTAGE`,
   `LGFC_FORCE_PRODUCTION_DR`, `LGFC_FORCE_PRODUCTION_RECOVERY_ACTIVATION`.
2. Run predecessor validators (optional full package, recommended after material changes):
   ```bash
   npm run validate:platform-recovery-inventory
   npm run validate:platform-recovery-d1-b2-isolation
   npm run validate:platform-recovery-rollback-dr
   npm run validate:platform-recovery-rollback-integrated-dr
   ```
3. Run Day-2 unit tests and qualifier:
   ```bash
   npx vitest run tests/platform-recovery-day2-qualify.test.mjs
   npm run validate:platform-recovery-day2-qualify
   ```
4. Confirm disable path:
   ```bash
   LGFC_PLATFORM_RECOVERY_DAY2_QUALIFY_DISABLED=1 npm run validate:platform-recovery-day2-qualify -- --json
   ```
5. Read `docs/ops/reports/platform-recovery-day2-handoff.md` and complete the
   operator handoff checklist there.
6. Stop for independent review. Do not merge to `main` or claim Production Go
   from this procedure.

## Procedure notes

- Qualification is Development evidence only.
- Live drills require separate Product Authority + Day-2 authorization.
- Record exact commands, SHA, and results on the source Issue / PR.

## Execution

Primary command:

```bash
npm run validate:platform-recovery-day2-qualify
```
