---
Doc Type: Operations Report
Audience: Bill, ChatGPT, Cursor, Day-2 Operations, LGFC maintainers
Authority Level: Operational Evidence
Owns: Project #2779 Task 001 (#2894) recovery inventory, owners, RPO/RTO targets, and test-plan map
Does Not Own: Live restore proofs (#2895–#2897), Production recovery activation, secret values, paid backup products
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2779, #2894, #2778, #2890
Last Reviewed: 2026-08-03
---

# Platform recovery readiness — inventory, owners, and targets (#2894)

## Purpose

Task **#2779-001 / #2894** deliverable: consume the #2778 platform inventory and map
every launch-critical source, configuration, deployment, D1, B2, and evidence asset
to backup method, retention, RPO/RTO, credential boundary, owner, isolated test plan,
and tested/untested status.

## Scope

In scope:

- Structured recovery inventory (machine-checked)
- Owner and target confirmation from the #2779 launch package
- Zero-cost baseline and protected-decision register
- Operator ownership reference

Out of scope:

- Destructive Production restore or outage simulation
- D1/B2 isolated restore proof (later children)
- Secret values
- Paid backup products
- Production / `main` merge

## Current known truth

- Predecessor **#2778** Development accepted by Product Authority 2026-08-03; closed completed.
- Consumed inventory identity: `component/platform-production-validation` tip
  `72e0943661dfe4dc2e0dafdb286630f159e8f5cc` (children #2890–#2893).
- Credentialed live CF/D1/B2 verification remains deferred and **non-blocking** for
  #2779 Development; circle back for #2778 Production Go/No-Go prep later.
- This task branch is rooted on `component/platform-recovery-readiness` from `main`.

## Intended final state

A reviewed component-child PR that accounts for every launch-critical asset with
explicit untested restore status where proofs are reserved for later children, and
that stops for independent review without self-merge or Production mutation.

## Recovery class targets (from #2779 launch package)

| Class | RPO target | RTO target |
| --- | --- | --- |
| source / configuration | last accepted Git commit | 4 hours |
| D1 operational data | 24 hours (until measured) | 8 hours (until measured) |
| B2 media / catalog | 24 hours catalog/index; provider object durability | 24 hours (until measured) |
| deployment / runtime | last accepted immutable candidate | 2 hours |

## Zero-cost baseline

Baseline recovery uses existing GitHub, Cloudflare, and Backblaze capabilities already
in use. Any paid backup/retention product or paid provider tier change returns to
**Product Authority** before adoption.

## Asset inventory (summary)

Full structured records live in `scripts/ci/platform-recovery-inventory.mjs`
(`RECOVERY_ASSETS`). Summary:

| ID | Class | Owner | Tested status |
| --- | --- | --- | --- |
| `git_source` | source_configuration | Implementation / Operations | untested_restore |
| `github_workflows_config` | source_configuration | Implementation / Ops + CI | untested_restore |
| `wrangler_pages_config` | source_configuration | PMO/Eng + Implementation | untested_restore |
| `pages_functions` | source_configuration | Implementation / Operations | untested_restore |
| `d1_database` | d1_operational_data | Day-2 (activation) + Implementation | untested_restore |
| `d1_migrations` | source_configuration | Implementation / Operations | untested_restore |
| `b2_media_bucket` | b2_media | Day-2 + Product Authority (creds/cost) | untested_restore |
| `b2_d1_catalog_sync` | b2_media | Implementation / Operations | untested_restore |
| `deployment_runtime` | deployment_runtime | Day-2 + Implementation | untested_restore |
| `domains_dns` | source_configuration | Product Authority + Day-2 | untested_restore |
| `operational_evidence` | source_configuration | Administration & Communications | partial |
| `secrets_boundary` | source_configuration | Product Authority + Day-2 | untested_restore |

`operational_evidence` is **partial** because #2778 reports are verified present on the
sibling component ref; restore drills for other assets remain for #2895–#2897.

## Consumed #2778 evidence

| Artifact | Location |
| --- | --- |
| Repository/live inventory | `docs/ops/reports/platform-production-validation-repository-live-inventory.md` @ sibling component tip |
| CF/D1 checks | `docs/ops/reports/platform-production-validation-cf-d1-checks.md` |
| B2/runtime checks | `docs/ops/reports/platform-production-validation-b2-runtime-checks.md` |
| Candidate qualification | `docs/ops/reports/platform-production-validation-candidate-qualification.md` |

Also reconcile: `docs/governance/OPERATIONS-AND-RECOVERY.md`,
`docs/how-to/website/website-production-rollback.md`,
`docs/how-to/ops/run-emergency-recovery.md`.

## Protected decisions (explicit)

1. No destructive Production restore / outage simulation without Day-2 + Product Authority.
2. No secret values in inventory or evidence.
3. Zero-cost baseline unless Product Authority approves paid capability.
4. Credentialed live CF/D1/B2 checks deferred — non-blocking for #2779 Development.
5. Production recovery activation and #2778 Production Go remain separately authorized.

## Tooling

| Item | Path |
| --- | --- |
| Validator | `scripts/ci/platform-recovery-inventory.mjs` |
| npm script | `npm run validate:platform-recovery-inventory` |
| Unit tests | `tests/platform-recovery-inventory.test.mjs` |
| Ownership | `docs/reference/operations/platform-recovery-ownership.md` |
| Disable env | `LGFC_PLATFORM_RECOVERY_INVENTORY_DISABLED=1` |

## Assessment identity

| Field | Value |
| --- | --- |
| Observed at (UTC) | 2026-08-03T17:16:05Z |
| Actor role | Implementation / Operations (Cursor Local) |
| Source issue | #2894 |
| Parent project | #2779 |
| Component branch | `component/platform-recovery-readiness` |
| Consumed #2778 tip | `72e0943661dfe4dc2e0dafdb286630f159e8f5cc` |
| Implementation SHA (validator+docs+tests) | `4559e6dfcfd5e015b4cab8c40e1422dd5e8ec04d` |

## Results (this run)

Commands:

```bash
git fetch origin component/platform-production-validation
npx vitest run tests/platform-recovery-inventory.test.mjs
npm run validate:platform-recovery-inventory
LGFC_PLATFORM_RECOVERY_INVENTORY_DISABLED=1 npm run validate:platform-recovery-inventory -- --json
```

| Check | Result | Notes |
| --- | --- | --- |
| All launch-critical assets complete | PASS | machine-checked fields |
| Required recovery classes covered | PASS | source, D1, B2, deployment |
| Zero-cost baseline | PASS | all assets |
| Untested restore status explicit | PASS | expected for task 001 |
| #2778 evidence consumed on sibling ref | PASS | after fetch |
| Disable path | PASS | no Production mutation |
| Production mutation | NOT AUTHORIZED | |

## Rollback

Revert this component PR. Disable with `LGFC_PLATFORM_RECOVERY_INVENTORY_DISABLED=1`.
No Production configuration or data was changed.
