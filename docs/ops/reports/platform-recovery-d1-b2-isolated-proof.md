---
Doc Type: Operations Report
Audience: Bill, ChatGPT, Cursor, Day-2 Operations, LGFC maintainers
Authority Level: Operational Evidence
Owns: Project #2779 Task 002 (#2895) isolated D1 export/restore and B2/catalog recovery proof evidence
Does Not Own: Live Production restore, source/deployment rollback (#2896), Day-2 handoff (#2897), secret values
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2779, #2895, #2894, #2778
Last Reviewed: 2026-08-03
---

# Platform recovery readiness — D1 and B2 isolated recovery proofs (#2895)

## Purpose

Task **#2779-002 / #2895** deliverable: prove D1 and B2/catalog recovery in
isolation using safe export, integrity, isolated restore, application checks,
cleanup, and measured recovery time with **synthetic or redacted data only**.

## Scope

In scope:

- Synthetic D1 export → SHA-256 integrity → isolated local SQLite restore
- Application compatibility checks on restored tables
- Synthetic B2 catalog integrity sampling and D1 object-reference reconciliation
- Measured local recovery time vs #2779 RPO/RTO targets
- Explicit cleanup of disposable artifacts
- Protected-stop verification (no Production restore force path)

Out of scope:

- Production / `main` mutation or destructive Production restore
- Live Cloudflare disposable D1 provisioning (deferred; credentials/provisioning)
- Live credentialed B2 `ListObjectsV2` / object GET (deferred)
- Source/config/deployment rollback and integrated DR (#2896)
- Secret values or paid backup products

## Current known truth

- Predecessor **#2894** merged to `component/platform-recovery-readiness` via PR
  **#3023** @ `f25b85774a0ba04e00bee4d2dd1a65144e5cece7`.
- Credentialed live CF/D1/B2 verification remains deferred from #2778 and is
  **non-blocking** for #2779 Development.
- Isolated proof uses local `node:sqlite` as the disposable restore target
  (D1 is SQLite-compatible). This is the authorized zero-cost isolation method
  for this child; live provider restore remains separately authorized.

## Intended final state

A reviewed component-child PR that records restore compatibility, integrity,
cleanup, measured recovery time, and limitations without Production mutation,
and that stops for independent review without self-merge.

## Tooling

| Item | Path |
| --- | --- |
| Validator | `scripts/ci/platform-d1-b2-recovery-proof.mjs` |
| npm script | `npm run validate:platform-d1-b2-recovery-proof` |
| Unit tests | `tests/platform-d1-b2-recovery-proof.test.mjs` |
| Operator how-to | `docs/how-to/ops/run-d1-b2-isolated-recovery-proof.md` |
| Disable env | `LGFC_PLATFORM_D1_B2_RECOVERY_PROOF_DISABLED=1` |

Guarantees:

- `productionMutation: false` and `writeAttempts: 0` on every run.
- Synthetic/redacted fixtures only.
- Disposable workdir removed after the proof (`isolated_artifact_cleanup`).
- Production restore force flags (`LGFC_FORCE_PRODUCTION_D1_RESTORE` /
  `LGFC_FORCE_PRODUCTION_B2_RESTORE`) trigger a protected stop.

## Recovery targets (from #2779 / #2894)

| Class | RPO target | RTO target |
| --- | --- | --- |
| D1 operational data | 24 hours | 8 hours |
| B2 media / catalog | 24 hours (catalog/index) | 24 hours |

## Assessment identity

| Field | Value |
| --- | --- |
| Observed at (UTC) | 2026-08-03T17:48:46Z |
| Actor role | Implementation / Operations (Cursor Local) |
| Source issue | #2895 |
| Parent project | #2779 |
| Component branch | `component/platform-recovery-readiness` |
| Base tip | `f25b85774a0ba04e00bee4d2dd1a65144e5cece7` |
| D1 measured restore | 10 ms (target RTO 8 hours; within target) |
| B2 measured sample | <1 ms (target RTO 24 hours; within target) |
| D1 export digest | `7b07d42405661ca40dedd2a4ebce53247ac2db4e6639960c7dce22a467763a02` |

## Results (this run)

Commands:

```bash
npx vitest run tests/platform-d1-b2-recovery-proof.test.mjs
npm run validate:platform-d1-b2-recovery-proof
LGFC_PLATFORM_D1_B2_RECOVERY_PROOF_DISABLED=1 npm run validate:platform-d1-b2-recovery-proof -- --json
```

| Check | Result | Notes |
| --- | --- | --- |
| D1 synthetic export + integrity hash | PASS | SHA-256 of export SQL |
| Isolated SQLite restore | PASS | disposable local DB |
| Application tables + row counts | PASS | photos, media_assets, members |
| Application compat join | PASS | photos ↔ media_assets |
| D1 measured RTO vs 8h target | PASS | local ms ≪ target |
| B2 integrity sample | PASS | 3 synthetic objects |
| B2↔D1 catalog reconcile | PASS | 0 missing refs |
| Isolated artifact cleanup | PASS | workdir removed |
| Protected-stop force flags | PASS | refuses Production restore flags |
| Disable path | PASS | no Production mutation |
| Production mutation | NOT AUTHORIZED | |

Overall tooling recommendation:
`D1_B2_ISOLATED_RECOVERY_PROOF_READY_FOR_REVIEW`.

## Limitations (explicit)

1. Synthetic local SQLite stands in for isolated non-Production D1; live Cloudflare
   disposable D1 was not provisioned in this task.
2. B2 integrity sampling uses synthetic object payloads; live ListObjectsV2 /
   object GET remains deferred (credentials).
3. Measured RTO is local fixture time only; Production provider restore duration
   remains unmeasured until separately authorized.
4. No Production data, secrets, or provider resources were created or mutated.

## Inventory status update

`d1_database`, `b2_media_bucket`, and `b2_d1_catalog_sync` move from
`untested_restore` to **`partial`**: isolated synthetic proofs are complete;
live provider restore sampling remains deferred.

## Rollback

Revert this component PR. Disable with
`LGFC_PLATFORM_D1_B2_RECOVERY_PROOF_DISABLED=1`. No Production configuration or
data was changed.
