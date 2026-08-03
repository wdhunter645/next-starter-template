---
Doc Type: How-To
Audience: Human + AI
Authority Level: Procedure
Owns: Operator steps to run the #2895 isolated D1/B2 recovery proof locally
Does Not Own: Production restore authority, secret handling, or Day-2 activation
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2779, #2895, #2894
Last Reviewed: 2026-08-03
---

# Run D1 and B2 isolated recovery proof

## Purpose

Execute the zero-cost, synthetic/redacted D1 export/restore and B2/catalog
integrity proof for project #2779 task #2895 without mutating Production.

## Preconditions

- Working tree is on `component/platform-recovery-readiness` or a task branch
  rooted from it.
- Source Issue #2895 authorizes the proof.
- No Production restore force flags are set.
- Secrets are not required and must not be pasted into evidence.

## Steps

1. Confirm the disable flag is unset (or intentionally set for a skip run).
2. Run unit tests:
   ```bash
   npx vitest run tests/platform-d1-b2-recovery-proof.test.mjs
   ```
3. Run the proof validator:
   ```bash
   npm run validate:platform-d1-b2-recovery-proof
   ```
4. Optionally emit JSON:
   ```bash
   npm run validate:platform-d1-b2-recovery-proof -- --json
   ```
5. Verify the report records `productionMutation=false`, cleanup PASS, and
   explicit limitations.
6. To exercise the disable/rollback path:
   ```bash
   LGFC_PLATFORM_D1_B2_RECOVERY_PROOF_DISABLED=1 npm run validate:platform-d1-b2-recovery-proof -- --json
   ```

## Procedure notes

- The validator writes a disposable workdir under the OS temp directory, restores
  into local SQLite via `node:sqlite`, reconciles a synthetic B2 catalog to
  restored `media_assets` rows, then deletes the workdir.
- Setting `LGFC_FORCE_PRODUCTION_D1_RESTORE` or
  `LGFC_FORCE_PRODUCTION_B2_RESTORE` must fail closed (protected stop).
- Live Cloudflare disposable D1 and credentialed B2 sampling are out of scope
  for this procedure unless a later Issue separately authorizes them.

## Validation

- Unit tests PASS.
- Validator `ok=true` with recommendation
  `D1_B2_ISOLATED_RECOVERY_PROOF_READY_FOR_REVIEW`.
- Evidence report
  `docs/ops/reports/platform-recovery-d1-b2-isolated-proof.md` matches the run.

## Stop conditions

Stop and do not continue if:

- Production mutation or destructive restore is requested;
- secret values would be required in evidence;
- a paid dependency is required;
- scope expands into #2896/#2897 work;
- authority conflict appears on the source Issue.
