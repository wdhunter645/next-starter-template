---
Doc Type: Operations Report
Audience: Bill, ChatGPT, Cursor, Day-2 Operations, LGFC maintainers
Authority Level: Operational Evidence
Owns: Project #2778 Task 004 (#2893) Promotion Candidate qualification evidence and handoff bundle
Does Not Own: Production Go, merge to main, credentialed live inventory clearance, or secret values
Canonical Reference: /docs/governance/PLATFORM-AND-ENVIRONMENT.md
Related Issues: #2778, #2893, #2892, #2891, #2890
Last Reviewed: 2026-08-03
---

# Platform production validation — Promotion Candidate qualification (#2893)

## Purpose

Task **#2778-004 / #2893** deliverable: qualify the integrated platform validation
package on `component/platform-production-validation`, attach a repeatable operator
runbook and ownership map, list unresolved protected items explicitly, and prove
validation tooling can be disabled/rolled back without Production mutation.

## Scope

In scope:

- Evidence bundle aggregating #2890–#2892
- Qualification validator `scripts/ci/platform-candidate-qualification.mjs`
- Operator how-to and Day-2 ownership reference
- Disable/rollback proof via `LGFC_PLATFORM_VALIDATION_DISABLED`
- Component-branch Development / Promotion Candidate readiness recommendation

Out of scope:

- Production / `main` merge
- Production configuration mutation
- Secret values
- Clearing credentialed live follow-ups without operator credentials

## Current known truth

- Integrated implementation tip after #2890–#2892 lands is
  `component/platform-production-validation` @ `feda96efcd628c9f5f3609d150a05a1b35b3b643`
  (post PR #3020).
- Child validators remain read-only by default (`productionMutation: false`).
- Several protected follow-ups remain open and are recorded below; they do **not**
  authorize Production mutation and do **not** block recording a component
  Promotion Candidate identity for independent review.
- #2892 may still be open for PMO post-merge closeout; Cursor implementation for
  #2892 is complete and merged to the component branch.

## Intended final state

One reviewed component-child PR that:

1. Records exact candidate identity for the integrated validation package
2. Re-runs #2891/#2892 validators in skip-http mode without mutation
3. Documents operator runbook, ownership, disable, and rollback
4. Leaves Production Go to a separate authorized decision
5. Stops for independent OpenAI Work review without self-approval or self-merge

## Candidate identity

| Field | Value |
| --- | --- |
| Component branch | `component/platform-production-validation` |
| Integrated baseline SHA (post-#2892) | `feda96efcd628c9f5f3609d150a05a1b35b3b643` |
| Baseline contents | #2890 inventory; #2891 CF/D1 validators+evidence; #2892 B2/runtime validators+evidence |
| This qualification PR | Additive qualification tooling, runbook, ownership, and evidence only |
| Production promotion | **Not authorized** by this report |

## Evidence bundle

| Task | Issue | Artifact |
| --- | --- | --- |
| 001 Inventory | #2890 | `docs/ops/reports/platform-production-validation-repository-live-inventory.md` |
| 002 CF/D1 | #2891 | `docs/ops/reports/platform-production-validation-cf-d1-checks.md` + `scripts/ci/platform-cf-d1-validation.mjs` |
| 003 B2/runtime | #2892 | `docs/ops/reports/platform-production-validation-b2-runtime-checks.md` + `scripts/ci/platform-b2-runtime-validation.mjs` |
| 004 Qualify | #2893 | this report + how-to + ownership + `scripts/ci/platform-candidate-qualification.mjs` |

## Tooling

| Item | Path |
| --- | --- |
| Qualifier | `scripts/ci/platform-candidate-qualification.mjs` |
| npm script | `npm run validate:platform-candidate` |
| Unit tests | `tests/platform-candidate-qualification.test.mjs` |
| Operator runbook | `docs/how-to/operations/run-platform-production-validation.md` |
| Ownership | `docs/reference/operations/platform-production-validation-ownership.md` |
| Disable env | `LGFC_PLATFORM_VALIDATION_DISABLED=1` |

Guarantees:

- `productionMutation: false` and `writeAttempts: 0` on every enabled run.
- Disable path returns `ok: true`, `disabled: true`, and does not invoke child validators or live probes.
- Dirty worktrees refuse clean candidate evidence unless explicitly allowed.
- Production promotion remains `not_authorized`.

## Assessment identity

| Field | Value |
| --- | --- |
| Observed at (UTC) | 2026-08-03T16:48:35Z |
| Actor role | Implementation / Operations (Cursor Local) |
| Source issue | #2893 |
| Parent project | #2778 |
| Component branch | `component/platform-production-validation` |
| Integrated baseline SHA (post-#2892) | `feda96efcd628c9f5f3609d150a05a1b35b3b643` |
| Qualification implementation SHA (validator+docs+tests) | `8fdd6721c35a95c9fac84f975649949badbdbd76` |

## Results (this run)

Commands:

```bash
npx vitest run tests/platform-candidate-qualification.test.mjs
npm run validate:platform-candidate
LGFC_PLATFORM_VALIDATION_DISABLED=1 npm run validate:platform-candidate -- --json
```

| Check | Result | Notes |
| --- | --- | --- |
| Prior evidence reports present | PASS | #2890/#2891/#2892 reports |
| Child tooling present | PASS | CF/D1 + B2 validators and tests |
| Handoff docs present | PASS | qualification report, how-to, ownership |
| Child CF/D1 skip-http | PASS | no mutation |
| Child B2 runtime skip-http | PASS | no mutation |
| Tooling disable env | PASS | `LGFC_PLATFORM_VALIDATION_DISABLED=1` |
| Production promotion | NOT AUTHORIZED | separate Go required |

## Unresolved protected items (explicit)

| ID | Source | Status | Note |
| --- | --- | --- | --- |
| `live_cloudflare_api_inventory` | #2890/#2891 | open | Credentialed CF API + live D1 schema read |
| `migration_prefix_collisions` | #2890/#2891 | open | prefixes `0020` / `0028` / `0044` |
| `pages_name_drift` | #2890/#2891 | open | `lgfc-lite` vs `next-starter-template` |
| `live_b2_list_read` | #2892 | open | Credentialed ListObjectsV2 |
| `b2_cors_console_finalization` | #2892 | open | CORS preflight incomplete |
| `production_go` | #2778 | blocked_until_authorized | No Production/`main` merge from this task |

## Recommendation

**PROMOTION CANDIDATE READY for independent Engineering / OpenAI Work review** of the
component tip after this qualification PR merges. Production / `main` promotion
remains a separate authorized decision. Day-2 owners are recorded in
`docs/reference/operations/platform-production-validation-ownership.md`.

## Rollback

1. Set `LGFC_PLATFORM_VALIDATION_DISABLED=1` or stop invoking `validate:platform-*` scripts.
2. Revert this component-branch PR (and prior #2778 child PRs if a fuller rollback is required).
3. Do not delete Issue/PR evidence history.
4. Existing Production configuration is unchanged by this project unless separately authorized.
