---
Doc Type: Operations Report
Audience: Bill, ChatGPT, Cursor, Day-2 Operations, LGFC maintainers
Authority Level: Operational Evidence
Owns: Project #2779 Task 003 (#2896) source/config/deployment rollback and bounded synthetic DR proof evidence
Does Not Own: Live Cloudflare Pages rollback mutation, Production outage drills, Day-2 Production activation (#2897)
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2779, #2896, #2895, #2894, #2778
Last Reviewed: 2026-08-03
---

# Platform recovery readiness — rollback and synthetic DR proof (#2896)

## Purpose

Task **#2779-003 / #2896** deliverable: prove immutable candidate selection,
repository/configuration reconstruction, deployment rollback decision path, stop
conditions, communications checklist, and return-to-service verification via a
**bounded synthetic** disaster-recovery exercise — **without inducing a Production
outage**.

## Scope

In scope:

- Immutable candidate SHA selection on `component/platform-recovery-readiness`
- Read-only path reconstruction at that SHA
- Dry-run rollback procedure checks against canonical runbooks
- Synthetic DR decision-path walk (ordered)
- Stop-condition tabletop (Production mutation, secrets, paid products, public outage)
- Communications checklist + return-to-service path probes
- Cleanup of isolated workdir; measured exercise duration

Out of scope:

- Live Cloudflare Pages deployment rollback/redeploy
- Intentional public Production outage
- Credentialed live D1/B2 restore
- Day-2 Production recovery activation (#2897)
- Production / `main` merge
- Secret values

## Current known truth

- Predecessor **#2895** closed after PR #3024 merged tip
  `8b6e87662d16c099d07d93390547660ba241d9f6`.
- D1/B2 isolated synthetic proofs remain available as dependency tooling.
- Live CF/D1/B2 credentialed checks remain deferred and non-blocking for #2779 Development.

## Intended final state

A reviewed component-child PR that records exact candidate identity, recovery
decision path, stop-condition behavior, return-to-service verification, and
explicit limitations — without Production mutation or outage.

## Method

| Step | Mechanism |
| --- | --- |
| Candidate | `git rev-parse` of `origin/component/platform-recovery-readiness` (or HEAD) |
| Reconstruction | `git cat-file` / `git show` for required paths at candidate SHA |
| Rollback dry-run | Signal checks against website rollback + emergency recovery + delivery profiles docs |
| DR scenario | `scripts/ci/fixtures/platform-recovery-dr-scenario.json` |
| Data/media | Confirm #2895 isolation tooling present |
| Stop conditions | Tabletop simulate hazards → expect STOP dispositions |
| Cleanup | Remove `.tmp/platform-recovery-rollback-dr-*` |

## Targets (from #2779 / #2894)

| Class | RPO target | RTO target |
| --- | --- | --- |
| source / configuration | last accepted Git commit | 4 hours |
| deployment / runtime | last accepted immutable candidate | 2 hours |

Measured times below are **local exercise durations**, not Production RTO proofs.

## Tooling

| Item | Path |
| --- | --- |
| Validator | `scripts/ci/platform-recovery-rollback-dr.mjs` |
| npm script | `npm run validate:platform-recovery-rollback-dr` |
| Unit tests | `tests/platform-recovery-rollback-dr.test.mjs` |
| Scenario fixture | `scripts/ci/fixtures/platform-recovery-dr-scenario.json` |
| Disable env | `LGFC_PLATFORM_RECOVERY_ROLLBACK_DR_DISABLED=1` |

## Assessment identity

| Field | Value |
| --- | --- |
| Observed at (UTC) | 2026-08-03T18:15:04Z |
| Actor role | Implementation / Operations (Cursor Local) |
| Source issue | #2896 |
| Parent project | #2779 |
| Component branch | `component/platform-recovery-readiness` |
| Candidate SHA | `8b6e87662d16c099d07d93390547660ba241d9f6` |
| Implementation SHA | `e1ab8ac5cd34493e92c314d3ff62121d40985628` |

## Results (this run)

Commands:

```bash
git fetch origin component/platform-recovery-readiness
npx vitest run tests/platform-recovery-rollback-dr.test.mjs
npm run validate:platform-recovery-rollback-dr
LGFC_PLATFORM_RECOVERY_ROLLBACK_DR_DISABLED=1 npm run validate:platform-recovery-rollback-dr -- --json
npm run validate:platform-recovery-inventory
```

| Check | Result | Notes |
| --- | --- | --- |
| Scenario forbids Production outage/mutation | PASS | |
| Immutable candidate selected | PASS | tip `8b6e8766…` |
| Candidate path reconstruction | PASS | 9 paths |
| Rollback dry-run runbook signals | PASS | |
| Decision path ordered complete | PASS | 9/9 |
| Stop conditions honored | PASS | mutation/secrets/paid/outage |
| Return-to-service probes | PASS | |
| Workdir cleanup | PASS | |
| Disable path | PASS | |
| Production mutation / outage | NOT AUTHORIZED | |

### Measured recovery-exercise time

| Metric | Value |
| --- | --- |
| Candidate select | 11 ms |
| Path reconstruction | 85 ms |
| Total exercise | 98 ms |

## Limitations (explicit)

1. Tabletop/synthetic only — no live Cloudflare Pages deployment rollback executed.
2. No Production outage induced; no live D1/B2 mutation.
3. Credentialed live CF/D1/B2 restore remains deferred and separately authorized.
4. Measured times are local exercise durations; Production RTO still uses launch-package targets until live drills.
5. Day-2 Production recovery activation remains a separate protected decision. See #2897 handoff (`docs/ops/reports/platform-recovery-day2-handoff.md`).

## Rollback

Revert this component PR. Disable with
`LGFC_PLATFORM_RECOVERY_ROLLBACK_DR_DISABLED=1`. No Production configuration or
data was changed.
