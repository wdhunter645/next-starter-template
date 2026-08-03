---
Doc Type: Operations Report
Audience: Bill, ChatGPT, Cursor, Day-2 Operations, LGFC maintainers
Authority Level: Operational Evidence
Owns: Project #2779 Task 002 (#2895) isolated D1 export/restore and B2/catalog recovery proof evidence
Does Not Own: Live Production restore, credentialed CF/D1/B2 mutation, integrated DR (#2896), Day-2 Production activation
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2779, #2895, #2894, #2778
Last Reviewed: 2026-08-03
---

# Platform recovery readiness — D1 and B2 isolation proof (#2895)

## Purpose

Task **#2779-002 / #2895** deliverable: prove D1 export → integrity → isolated
restore → application compatibility, and B2/catalog integrity sampling with D1
object-reference reconciliation, using **synthetic or redacted data only**.

## Scope

In scope:

- Synthetic D1 export fixture restore into disposable local SQLite
- Export integrity hash, schema table presence, application SELECT probes
- Synthetic B2 catalog integrity sample and D1 `media_assets.b2_key` reconcile
- Orphan detection, cleanup of isolated workdir, measured exercise durations
- Explicit limitations vs Production RTO/RPO targets

Out of scope:

- Destructive or credentialed live Production D1/B2 restore
- Secret values
- Source/config/deployment rollback (#2896)
- Production / `main` merge

## Current known truth

- Predecessor **#2894** closed after PR #3023 merged to
  `component/platform-recovery-readiness` @ `f25b85774a0ba04e00bee4d2dd1a65144e5cece7`.
- Credentialed live CF/D1/B2 checks remain deferred and **non-blocking** for #2779
  Development (parked from #2778 Development Go).
- This proof uses `node:sqlite` (experimental) as the isolated restore target to
  avoid any live Cloudflare D1 mutation.

## Intended final state

A reviewed component-child PR that records restore compatibility, integrity,
cleanup, measured recovery-exercise time, and limitations without mutating
Production, and that stops for independent review without self-merge.

## Method

| Step | Mechanism |
| --- | --- |
| D1 export sample | `scripts/ci/fixtures/platform-recovery-d1-export.sql` (synthetic) |
| Integrity | SHA-256 of export SQL bytes |
| Isolated restore | Temp SQLite under `.tmp/platform-recovery-isolation-*` |
| Application compat | COUNT probes on `media_assets`, `photos`, `members` + B2 key shape |
| B2 catalog | `scripts/ci/fixtures/platform-recovery-b2-catalog.json` |
| Reconcile | Every D1 `b2_key` present in catalog; etag match; orphan detection |
| Cleanup | Recursive remove of isolated workdir after exercise |

## Targets (from #2779 / #2894)

| Class | RPO target | RTO target |
| --- | --- | --- |
| D1 operational data | 24 hours | 8 hours |
| B2 media / catalog | 24 hours catalog/index | 24 hours |

Measured times below are **local exercise durations**, not Production RTO proofs.

## Tooling

| Item | Path |
| --- | --- |
| Validator | `scripts/ci/platform-recovery-d1-b2-isolation.mjs` |
| npm script | `npm run validate:platform-recovery-d1-b2-isolation` |
| Unit tests | `tests/platform-recovery-d1-b2-isolation.test.mjs` |
| D1 fixture | `scripts/ci/fixtures/platform-recovery-d1-export.sql` |
| B2 fixture | `scripts/ci/fixtures/platform-recovery-b2-catalog.json` |
| Disable env | `LGFC_PLATFORM_RECOVERY_D1_B2_ISOLATION_DISABLED=1` |

## Assessment identity

| Field | Value |
| --- | --- |
| Observed at (UTC) | 2026-08-03T17:47:03Z |
| Actor role | Implementation / Operations (Cursor Local) |
| Source issue | #2895 |
| Parent project | #2779 |
| Component branch | `component/platform-recovery-readiness` |
| Implementation SHA | _pending clean-head commit_ |

## Results (this run)

Commands:

```bash
npx vitest run tests/platform-recovery-d1-b2-isolation.test.mjs
npm run validate:platform-recovery-d1-b2-isolation
npm run validate:platform-recovery-d1-b2-isolation -- --json
LGFC_PLATFORM_RECOVERY_D1_B2_ISOLATION_DISABLED=1 npm run validate:platform-recovery-d1-b2-isolation -- --json
npm run validate:platform-recovery-inventory
```

| Check | Result | Notes |
| --- | --- | --- |
| D1 export fixture present | PASS | synthetic SQL |
| D1 export integrity hash | PASS | SHA-256 `79889edf9d31…` |
| Isolated restore schema tables | PASS | media_assets, photos, members |
| Application compatibility probes | PASS | media=3; photos=3; members=1 |
| B2 object integrity sample | PASS | 4/4 objects |
| D1 refs present in B2 catalog | PASS | all `b2_key` matched |
| Orphan detection | PASS | `photos/synthetic/orphan-unreferenced.jpg` |
| Etag reconcile | PASS | mismatches=0 |
| Workdir cleanup | PASS | no leftover synthetic DB |
| Disable path | PASS | `LGFC_PLATFORM_RECOVERY_D1_B2_ISOLATION_DISABLED=1` |
| Production mutation | NOT AUTHORIZED | |

### Measured recovery-exercise time

| Metric | Value |
| --- | --- |
| D1 restore | 10 ms |
| B2 reconcile | 0 ms |
| Total exercise | 12 ms |

Compared against RTO **upper bounds** only as a sanity gate (not Production RTO proof).

## Limitations (explicit)

1. Synthetic/redacted fixtures only — not a live Production D1 export or live B2 ListObjects.
2. Credentialed live CF/D1/B2 restore remains deferred and separately authorized.
3. Measured times are local exercise durations; Production RTO still uses launch-package targets until live drills.
4. `node:sqlite` is experimental; disposable local DB only.
5. Does not prove source/config/deployment rollback (#2896) or integrated DR.

## Rollback

Revert this component PR. Disable with
`LGFC_PLATFORM_RECOVERY_D1_B2_ISOLATION_DISABLED=1`. No Production configuration
or data was changed.
