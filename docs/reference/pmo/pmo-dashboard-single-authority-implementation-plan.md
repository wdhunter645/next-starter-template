---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled Implementation Plan
Owns: Runtime repair plan for PMO dashboard single-authority recovery under project #2610
Does Not Own: Live documentation authority (already reconciled by #2611), production merge authorization, Cloudflare migration, or unauthorized GitHub issue mutation
Canonical Reference: /docs/ops/pmo/PMO-JULY-2026-OPERATING-MODEL.md
Related Issues: #2610, #2611, #2612, #2471, #2514, #2516, #2533
Last Reviewed: 2026-07-18
---

# PMO Dashboard Single-Authority Implementation Plan

## Purpose

Define the runtime child work that removes frozen `expectedLifecycle` / `expectedPriority` enforcement from `scripts/pmo-dashboard/pmo-tracked-inventory.json` so live GitHub Issue metadata is the sole operational authority for PMO lifecycle and priority.

Documentation authority was reconciled by Task #2611. This plan gates subsequent runtime redesign under project #2610.

## Current failure mechanism

1. `scripts/pmo-dashboard/build-dashboard.mjs` derives lifecycle and priority from current GitHub Issue labels and open/closed state.
2. `scripts/pmo-dashboard/validate-dashboard.mjs` also loads `scripts/pmo-dashboard/pmo-tracked-inventory.json` and, for each `included` row, compares generated placement to frozen `expectedLifecycle` and optional `expectedPriority`.
3. When live Issue labels change legitimately, live builds can fail until the static inventory is hand-edited — treating frozen JSON as a second lifecycle/priority authority.
4. Active documentation previously described both label authority and static expected-state enforcement, which produced an authority conflict. Task #2611 removed that documentation conflict; runtime still needs repair.

Affected runtime and workflow surfaces (runtime child only — not modified by #2611):

| Path | Role today |
| --- | --- |
| `scripts/pmo-dashboard/validate-dashboard.mjs` | Enforces frozen `expectedLifecycle` / `expectedPriority` against live rows |
| `scripts/pmo-dashboard/pmo-tracked-inventory.json` | Stores frozen expected state plus exclusions |
| `scripts/pmo-dashboard/build-dashboard.mjs` | Uses inventory exclusions; derives live lifecycle/priority from Issues |
| `scripts/pmo-dashboard/test-label-driven-fixture.mjs` | Feature-branch deterministic fixture |
| `.github/workflows/pmo-dashboard-ci-build.yml` | Live build + validate on `main` / schedule / manual; fixture on feature branches |
| `.github/workflows/pmo-dashboard-ci-deploy.yml` | Regenerates, validates, deploys Pages artifact |

## Final data flow and authority hierarchy

```text
GitHub Issue state + current PMO labels
                ↓
PMO issue-contract validation
                ↓
Active / Pipeline / Completed / Incomplete
                ↓
Generated JSON and static dashboard
```

| Layer | Authority |
| --- | --- |
| GitHub Issues | Sole operational authority for tracking, lifecycle, priority, stage, tasks, closeout |
| Operating model + dashboard specification | Contract and reporting rules |
| Generated dashboard JSON/HTML | Reporting-only snapshot |
| Static inventory JSON | Residual: exclusions + offline fixtures only |

## Inventory JSON decision

**Restrict, do not fully delete in the first runtime child.**

1. Remove `expectedLifecycle` and `expectedPriority` as live-validation fields.
2. Retain `excluded` entries with rationale for explicit non-state exclusions.
3. Optionally retain a fixture-only inventory or inline fixture objects used solely by `test-label-driven-fixture.mjs`.
4. If an `included` presence list remains temporarily, it must not assert lifecycle or priority; prefer retiring presence assertions in favor of Incomplete quarantine for contract failures.
5. Full file retirement is allowed only after exclusions and fixtures have an approved replacement location and all workflow callers are updated.

## Generator and validator modifications

### Generator (`build-dashboard.mjs`)

- Continue deriving lifecycle/priority exclusively from Issue labels and GitHub state.
- Continue applying exclusion sets from inventory (or successor exclusion file).
- Do not read `expectedLifecycle` / `expectedPriority` for generation decisions.

### Validator (`validate-dashboard.mjs`)

- Keep contract validation against generated rows (identity, lifecycle/priority/stage consistency, task math, `pmo:priority:none`, Incomplete placement).
- Remove live comparisons to `expectedLifecycle` / `expectedPriority`.
- Keep failing when an explicitly excluded issue appears as a portfolio row.
- Keep feature-branch fixture mode via existing skip/fixture env patterns where present.

### Fixture tests (`test-label-driven-fixture.mjs`)

- Encode deterministic transition cases as fixtures, not as frozen production inventory expectations.
- Cover label transitions without requiring edits to production exclusion lists.

## Migration behavior for existing inventory data

1. Snapshot current `pmo-tracked-inventory.json` in the runtime PR description for auditability.
2. Strip or ignore `expectedLifecycle` / `expectedPriority` on `included` rows.
3. Preserve `excluded` entries unless an exclusion is proven obsolete against live Issues.
4. Do not mutate live GitHub Issue labels as part of the runtime child unless a separate authorized issue requires it.
5. After merge to `main`, run one live build and confirm failures are only real contract defects (Incomplete), not frozen-expectation mismatches.

## Exact runtime child file allowlist

The successor runtime issue under #2610 may touch only:

- `scripts/pmo-dashboard/validate-dashboard.mjs`
- `scripts/pmo-dashboard/build-dashboard.mjs`
- `scripts/pmo-dashboard/test-label-driven-fixture.mjs`
- `scripts/pmo-dashboard/pmo-tracked-inventory.json`
- `.github/workflows/pmo-dashboard-ci-build.yml` (only if path filters, env flags, or job steps must change to match the new validation contract)
- `.github/workflows/pmo-dashboard-ci-deploy.yml` (only if validation invocation flags must change)

Do not modify `site/**` by hand; regenerate via the approved build path if artifact refresh is required by CI. Do not expand into unrelated PMO sizing, Cloudflare migration, or issue-metadata backfill.

## Deterministic transition-test matrix

| Case | Starting labels / state | Expected view | Notes |
| --- | --- | --- | --- |
| T1 | `pmo` + `pmo:active` + `pmo:priority:1` | Active | Numeric priority display |
| T2 | `pmo` + `pmo:pipeline` + `pmo:priority:2` + `pmo:stage:prep` | Pipeline | Stage required |
| T3 | `pmo` + `pmo:pipeline` + `pmo:priority:idea` + `pmo:stage:intake` | Pipeline | Idea display |
| T4 | `pmo` + `pmo:closed` + priority; GitHub closed | Completed | Closed reconciliation |
| T5 | `pmo` only (no lifecycle) | Incomplete | Missing lifecycle |
| T6 | Conflicting lifecycle labels | Incomplete | Conflict |
| T7 | `pmo:priority:none` | Incomplete | Prohibited priority |
| T8 | Pipeline missing stage | Incomplete | Missing stage |
| T9 | Open issue with `pmo:closed` | Incomplete | State mismatch |
| T10 | Closed issue without `pmo:closed` | Incomplete | State mismatch |
| T11 | Excluded issue number with `pmo` labels | Absent from views | Exclusion honored |
| T12 | Priority label change on valid Active row | Active with new priority | Must not fail on frozen expectedPriority |
| T13 | Lifecycle change Active → Pipeline with valid stage | Pipeline | Must not fail on frozen expectedLifecycle |
| T14 | Valid parent with linked `pmo:task` closed/open mix | Parent task math correct | Accounting integrity |
| T15 | Task missing parent reference | Incomplete | Task contract |

All cases must pass in the label-driven fixture without editing production frozen expected-state fields.

## Live build, deploy, public URL, freshness, and scheduled-run verification

After runtime merge to `main`:

1. Confirm **Build PMO dashboard** succeeds on the merge commit or the next scheduled/manual run.
2. Confirm **PMO dashboard CI deploy** regenerates, validates, and deploys when Pages is configured.
3. Fetch public HTML and JSON:
   - `https://wdhunter645.github.io/next-starter-template/pmo-dashboard/`
   - `https://wdhunter645.github.io/next-starter-template/pmo-dashboard/dashboard-data.json`
4. Record `generatedAt`, workflow run IDs, and `source === "github-issues"`.
5. Spot-check that a recently changed Issue label is reflected after the live build without inventory edits.
6. Confirm the six-hour schedule remains enabled and the next scheduled run does not reintroduce frozen-expectation failures.

## Rollback procedure

1. Revert the runtime child PR (or restore prior `validate-dashboard.mjs` + inventory schema) on `main`.
2. Re-run live build/validate to restore the previous failing-closed behavior if needed for incident control.
3. Keep #2611 documentation in place: docs correctly describe the target authority even if runtime temporarily lags; disclose the lag on #2610.
4. Do not “fix” documentation by restoring frozen-expectation guidance.

## Closeout criteria

| Item | Done when |
| --- | --- |
| #2611 | Documentation PR merged; no active docs assert frozen lifecycle/priority override |
| Runtime child (#2612 or successor) | Allowlisted scripts/workflows updated; transition matrix green; live build green without expectedLifecycle/expectedPriority enforcement |
| #2471 / PMO findings under #2514 | Public URL + freshness evidence recorded; frozen-inventory false failures no longer block operational closeout |
| #2516 / #2533 historical evidence | Cited as history only; not reopened as live authority |
| #2610 | Runtime repair merged, production verification recorded, Bill/ChatGPT production boundary satisfied |

## Explicit non-goals

- Documentation edits outside the #2611 allowlist (already completed separately).
- Cloudflare migration of the dashboard.
- Redesign of PMO portfolio prioritization or work-sizing policy.
- Unauthorized GitHub Issue label mutation.
- Automatic merge to `main` by Cursor.

## Related references

- Operating model: `/docs/ops/pmo/PMO-JULY-2026-OPERATING-MODEL.md`
- Dashboard specification: `/docs/ops/pmo/PMO-JULY-2026-DASHBOARD-SPECIFICATION.md`
- Operator how-to: `/docs/how-to/pmo/pmo-dashboard.md`
- Historical audit: `/docs/ops/pmo/pmo-dashboard-tracking-audit-2299.md`
- Parent project: #2610
