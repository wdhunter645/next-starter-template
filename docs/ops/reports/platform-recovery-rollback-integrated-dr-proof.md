---
Doc Type: Operations Report
Audience: Bill, ChatGPT, Cursor, Day-2 Operations, LGFC maintainers
Authority Level: Operational Evidence
Owns: Project #2779 Task 003 (#2896) source/config/deployment rollback and integrated DR proof evidence
Does Not Own: Live Cloudflare Pages rollback, Production outage simulation, Day-2 Production activation (#2897)
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2779, #2896, #2895, #2894, #2778
Last Reviewed: 2026-08-03
---

# Platform recovery readiness — rollback and integrated DR proof (#2896)

## Purpose

Task **#2779-003 / #2896** deliverable: prove exact immutable candidate identity,
source/configuration reconstruction, synthetic deployment rollback decision path,
failure/stop conditions, and a bounded synthetic integrated disaster-recovery
scenario spanning data, media, deployment, communications, monitoring, and
return-to-service verification.

## Scope

In scope:

- Synthetic immutable candidate fixture (failed vs last-known-good identities)
- Offline repository/configuration reconstruction (`wrangler.toml`, workflows,
  functions, migrations, recovery procedures)
- Synthetic Cloudflare Pages rollback record (no API calls)
- Nested #2895 D1/B2 isolation proof as integrated data/media evidence
- Redacted communications + monitoring plan checks
- Return-to-service verification and workdir cleanup
- Protected-stop fail-closed for Production force flags

Out of scope:

- Live Cloudflare Pages rollback or DNS/traffic mutation
- Production outage induction
- Secret values
- Day-2 Production recovery activation (#2897)
- Production / `main` merge

## Current known truth

- Predecessor **#2895** closed after PR #3024 merged to
  `component/platform-recovery-readiness` @ `8b6e87662d16c099d07d93390547660ba241d9f6`.
- Credentialed live CF/D1/B2 checks remain deferred and **non-blocking** for #2779
  Development.
- This proof never calls Cloudflare or Backblaze APIs.

## Intended final state

A reviewed component-child PR that records exact candidate identity, rollback
decision path, integrated DR phase results, cleanup, measured exercise time, and
limitations without mutating Production, and that stops for independent review
without self-merge.

## Method

| Step | Mechanism |
| --- | --- |
| Candidate identity | `scripts/ci/fixtures/platform-recovery-immutable-candidate.json` |
| Rollback selection | Distinct last-known-good SHA + deployment ID vs failed candidate |
| Source/config reconstruct | Path presence + offline `wrangler.toml` parse + config fingerprint |
| DR scenario | `scripts/ci/fixtures/platform-recovery-dr-scenario.json` (8 phases) |
| Data/media | Nested `runPlatformRecoveryD1B2Isolation` (#2895 fixtures) |
| Communications | Synthetic redacted record; forbidden-token scan |
| Monitoring | Scenario success-criteria presence |
| Return-to-service | Checklist against reconstruct + rollback identity |
| Protected stops | `LGFC_FORCE_PRODUCTION_ROLLBACK` / `_OUTAGE` / `_DR` fail closed |
| Cleanup | Recursive remove of `.tmp/platform-recovery-rollback-dr-*` |

## Targets (from #2779 / #2894)

| Class | RPO target | RTO target |
| --- | --- | --- |
| source / configuration | last accepted Git commit | 4 hours |
| deployment / runtime | last accepted immutable candidate | 2 hours |

Measured times below are **local exercise durations**, not Production RTO proofs.

## Tooling

| Item | Path |
| --- | --- |
| Validator | `scripts/ci/platform-recovery-rollback-integrated-dr.mjs` |
| npm script | `npm run validate:platform-recovery-rollback-integrated-dr` |
| Unit tests | `tests/platform-recovery-rollback-integrated-dr.test.mjs` |
| Candidate fixture | `scripts/ci/fixtures/platform-recovery-immutable-candidate.json` |
| DR scenario fixture | `scripts/ci/fixtures/platform-recovery-dr-scenario.json` |
| Operator how-to | `docs/how-to/ops/run-platform-recovery-rollback-integrated-dr.md` |
| Disable env | `LGFC_PLATFORM_RECOVERY_ROLLBACK_DR_DISABLED=1` |

## Assessment identity

| Field | Value |
| --- | --- |
| Observed at (UTC) | 2026-08-03T18:16:57Z |
| Actor role | Implementation / Operations (Cursor Local) |
| Source issue | #2896 |
| Parent project | #2779 |
| Component branch | `component/platform-recovery-readiness` |
| Predecessor tip | `8b6e87662d16c099d07d93390547660ba241d9f6` |
| Implementation SHA | `a81c7ee88380a13c02649e78acf38bd2e264643e` |

## Results (this run)

Commands:

```bash
npx vitest run tests/platform-recovery-rollback-integrated-dr.test.mjs tests/platform-recovery-d1-b2-isolation.test.mjs tests/platform-recovery-inventory.test.mjs
npm run validate:platform-recovery-rollback-integrated-dr
npm run validate:platform-recovery-rollback-integrated-dr -- --json
LGFC_PLATFORM_RECOVERY_ROLLBACK_DR_DISABLED=1 npm run validate:platform-recovery-rollback-integrated-dr -- --json
LGFC_FORCE_PRODUCTION_ROLLBACK=1 npm run validate:platform-recovery-rollback-integrated-dr -- --json
npm run validate:platform-recovery-inventory
```

| Check | Result | Notes |
| --- | --- | --- |
| Immutable candidate identity | PASS | synthetic good SHA `bbbbbbbb…` / deploy `syn-pages-deploy-good-0001` |
| Rollback decision path | PASS | failed → last-known-good; distinct identities |
| Source/config reconstruction | PASS | paths + wrangler offline parse |
| Nested D1/B2 isolation | PASS | #2895 nested runner |
| Communications record | PASS | redacted; no forbidden tokens |
| Monitoring plan | PASS | synthetic-15m criteria present |
| Return-to-service | PASS | checklist complete |
| Protected-stop force flag | PASS | fail-closed when set |
| Disable path | PASS | `LGFC_PLATFORM_RECOVERY_ROLLBACK_DR_DISABLED=1` |
| Workdir cleanup | PASS | no leftover synthetic records |
| Production mutation | NOT AUTHORIZED | |
| Production outage induced | NO | |

### Measured recovery-exercise time

| Metric | Value |
| --- | --- |
| Source/config reconstruct | 2 ms |
| Nested D1/B2 isolation | 15 ms |
| Total exercise | 19 ms |

Compared against RTO **upper bounds** only as a sanity gate (not Production RTO proof).

## Limitations (explicit)

1. Synthetic candidate SHAs/deployment IDs only — not live Cloudflare Pages rollback.
2. No Production outage, DNS, or traffic mutation is authorized or performed.
3. Nested D1/B2 evidence reuses #2895 synthetic fixtures; live restore remains deferred.
4. Measured times are local exercise durations; Production RTO still uses launch-package targets until live drills.
5. Day-2 Production recovery activation remains separately authorized (#2897 / incident path).

## Rollback

Revert this component PR. Disable with
`LGFC_PLATFORM_RECOVERY_ROLLBACK_DR_DISABLED=1`. No Production configuration
or data was changed.
