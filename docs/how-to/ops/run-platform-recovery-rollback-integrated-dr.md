---
Doc Type: How-To
Audience: Human + AI
Authority Level: Procedure
Owns: Operator steps to run the #2896 rollback + integrated DR proof locally
Does Not Own: Production rollback authority, secret handling, or Day-2 activation
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2779, #2896, #2895, #2894
Last Reviewed: 2026-08-03
---

# Run platform recovery rollback and integrated DR proof

## Purpose

Execute the zero-cost, synthetic/redacted source/configuration/deployment
rollback and integrated disaster-recovery proof for project #2779 task #2896
without mutating Production or inducing an outage.

## Preconditions

- Working tree is on `component/platform-recovery-readiness` or a task branch
  rooted from it.
- Source Issue #2896 authorizes the proof.
- Predecessor #2895 isolation tooling is present on the branch.
- No Production restore/rollback/outage force flags are set.
- Secrets are not required and must not be pasted into evidence.

## Steps

1. Confirm protected force flags are unset (or intentionally set only to prove
   fail-closed behavior).
2. Run unit tests:
   ```bash
   npx vitest run tests/platform-recovery-rollback-integrated-dr.test.mjs
   ```
3. Run the proof validator:
   ```bash
   npm run validate:platform-recovery-rollback-integrated-dr
   ```
4. Optionally emit JSON:
   ```bash
   npm run validate:platform-recovery-rollback-integrated-dr -- --json
   ```
5. Verify the report records `productionMutation=false`, cleanup PASS, exact
   candidate identity, and explicit limitations.
6. Exercise disable and protected-stop paths:
   ```bash
   LGFC_PLATFORM_RECOVERY_ROLLBACK_DR_DISABLED=1 npm run validate:platform-recovery-rollback-integrated-dr -- --json
   LGFC_FORCE_PRODUCTION_ROLLBACK=1 npm run validate:platform-recovery-rollback-integrated-dr -- --json
   ```

## Procedure notes

- The validator writes disposable synthetic rollback/communications records under
  the OS/repo temp directory, nests the #2895 D1/B2 isolation runner, then deletes
  the workdir.
- Setting `LGFC_FORCE_PRODUCTION_ROLLBACK`, `LGFC_FORCE_PRODUCTION_OUTAGE`, or
  `LGFC_FORCE_PRODUCTION_DR` must fail closed (protected stop).
- Live Cloudflare Pages rollback, DNS changes, and credentialed restores are out
  of scope unless a later Issue separately authorizes them.

## Validation

- Unit tests PASS.
- Validator `ok=true` with recommendation
  `ROLLBACK_INTEGRATED_DR_PROOF_READY_FOR_REVIEW`.
- Evidence report
  `docs/ops/reports/platform-recovery-rollback-integrated-dr-proof.md` matches the run.
- Force-flag run returns
  `ROLLBACK_INTEGRATED_DR_BLOCKED_PROTECTED_STOP` with `productionMutation=false`.

## Stop conditions

Stop and do not continue if:

- Production mutation or outage simulation is requested;
- secret values would be required in evidence;
- a paid dependency is required;
- scope expands into #2897 work;
- authority conflict appears on the source Issue.
