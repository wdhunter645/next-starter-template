---
Doc Type: How-To
Audience: PMO operators and AI agents
Authority Level: Operational Guidance
Owns: PMO dashboard generation, refresh, validation procedure, operator remediation flow, and GitHub Pages limitations
Does Not Own: PMO lifecycle definitions, PMO issue contract, dashboard JSON specification, GitHub issues source records, or Cloudflare production deployment
Canonical Reference: /docs/ops/pmo/PMO-JULY-2026-DASHBOARD-SPECIFICATION.md
Related Issues: #2101, #2299, #2313, #2471, #2516
Last Reviewed: 2026-07-14
---

# PMO Dashboard

## Purpose

The PMO dashboard is a generated static GitHub Pages reporting surface for PMO-managed program and project work. GitHub issues remain the executable source of truth. The dashboard normalizes public-safe issue data into Active Programs, PMO Pipeline, Completed Programs, and Incomplete views.

## Scope

This how-to covers operator procedure for dashboard source fields, local generation, deterministic feature-branch validation, live operational CI validation, GitHub Pages readiness preflight, manual or automatic deployment, and operational limits. It does not define the PMO lifecycle, PMO issue contract, dashboard JSON specification, or Cloudflare production deployment.

## Current known truth

- GitHub issues are the live source for dashboard data.
- The generated dashboard is reporting-only.
- PMO issue-contract authority lives in `/docs/ops/pmo/PMO-JULY-2026-OPERATING-MODEL.md`.
- PMO dashboard JSON/view/validation authority lives in `/docs/ops/pmo/PMO-JULY-2026-DASHBOARD-SPECIFICATION.md`.
- Matching feature-branch pushes run the deterministic label-driven fixture and do not query live GitHub issue inventory.
- Pushes to `main`, scheduled runs, and manual runs generate from live GitHub issues, validate tracked inventory, and upload dashboard artifacts.
- The deploy workflow regenerates and validates the dashboard before checking whether GitHub Pages is ready.
- When GitHub Pages is enabled with GitHub Actions as the source, the workflow configures Pages, uploads the artifact, and deploys automatically.
- When Pages is unavailable or uses a source other than GitHub Actions, deployment steps are skipped and the workflow reports the required operator action without misreporting dashboard generation or validation as failed.
- GitHub Pages enablement is a one-time repository setting and cannot be performed by the workflow's default `GITHUB_TOKEN`.

## Intended final state

The PMO dashboard uses deterministic feature-branch validation for proposed code and documentation changes, retains live issue-inventory validation for operational runs, deploys automatically when GitHub Pages is ready, surfaces missing or incompatible repository configuration as an explicit operator action, displays incomplete PMO metadata as remediation work, and verifies the public dashboard URLs before operational issue closeout.

## Public access URLs

The canonical public PMO dashboard HTML page is:

```text
https://wdhunter645.github.io/next-starter-template/pmo-dashboard/
```

The canonical public PMO dashboard JSON endpoint is:

```text
https://wdhunter645.github.io/next-starter-template/pmo-dashboard/dashboard-data.json
```

Atlas and ChatGPT should use the public `dashboard-data.json` endpoint as the preferred PMO meeting startup reporting input. At meeting startup, fetch the JSON first, parse it as JSON, validate the expected top-level reporting fields and views, and use `generatedAt` to disclose snapshot freshness before summarizing PMO workload state.

If the JSON fetch, parse, or validation step fails, fall back to GitHub Issues directly for startup reporting. GitHub Issues remain the authoritative current-state records for PMO execution and lifecycle state; dashboard JSON is a generated reporting snapshot and must not override live issue state.

The JSON field `source` is expected to equal the string `"github-issues"`. Treat any different `source` value as a validation concern and confirm current state from GitHub Issues before reporting.

## Source data

PMO dashboard tracking is label-driven:

```text
pmo label -> issue is PMO-tracked
no pmo label -> issue is not PMO-tracked and is excluded
```

The `pmo` label is the only PMO tracking flag. A valid standalone portfolio row also needs a supported portfolio title prefix. PMO-tracked issues with unsupported or contradictory classification appear in Incomplete instead of silently rendering as valid portfolio rows.

Recognized standalone portfolio title prefixes:

- `PROGRAM:`
- `PROJECT:`
- `PROGRAM CANDIDATE:`
- `STRATEGY:`
- `STRATEGY REVIEW:`

Child projects inside an active program use this title syntax:

```text
PROJECT: <parentProgramIssue>:<sequence> | <child project title>
```

Example:

```text
PROJECT: 2286:1 | Implement D1 candidate metadata migrations
```

Parse rule:

```text
parentProgramIssue = issue number after `PROJECT:` and before the next colon
sequence = number after parentProgramIssue colon and before pipe
display title = text right of pipe
```

Child projects under an active parent program render nested beneath the parent in sequence order and do not duplicate as standalone Pipeline rows.

Issues without the `pmo` label are excluded even when they use a recognized title prefix. Explicit exclusion rationale for non-PMO or historical rows lives in `scripts/pmo-dashboard/pmo-tracked-inventory.json`.

Contract details for lifecycle labels, priority labels, pipeline-stage labels, task issues, parent references, and Incomplete handling are owned by the PMO July 2026 Operating Model and dashboard specification.

## Dashboard grouping

Grouping is driven by PMO July 2026 lifecycle labels and contract validation:

```text
pmo label -> tracked by PMO
invalid required metadata -> Incomplete
pmo:active -> Active Programs/Projects
pmo:pipeline + exactly one pmo:stage:* -> PMO Pipeline
pmo:closed -> Completed Programs
closed GitHub issue -> must reconcile to pmo:closed
```

Precedence is intentional: the `pmo` label controls tracking, contract validation identifies incomplete data, and valid PMO lifecycle labels control Active, Pipeline, and Completed placement. Pipeline means future PMO work. Active means active PMO work. Completed means terminal PMO work reconciled to `pmo:closed`.

Standardized display statuses:

```text
Active
Idea / topic intake
Discussion / discovery
Definition / design
Planning
Implementation preparation
Ready for launch
Completed
Incomplete
```

Task-level execution states such as post-merge verification, reviewer response, or closeout are not top-level PMO dashboard statuses. Completed rows display only `Completed`. Pipeline rows display the required stage label. Ready for launch means preparation is complete and only explicit Bill/Atlas Go/No-Go remains; it does not authorize implementation.

Sorting:

- Active Programs and PMO Pipeline top-level rows sort by numeric PMO priority label low to high.
- `pmo:priority:idea` Pipeline rows display as `Idea` and remain on the PMO agenda without a numbered execution priority.
- Completed Programs sort by `closedAt` newest to oldest, falling back to `updatedAt` when `closedAt` is unavailable.
- Incomplete rows sort by remediation severity and last updated date.

PMO-tracked issues must provide the labels and relationships required by the operating model:

- `pmo`
- exactly one lifecycle label: `pmo:pipeline`, `pmo:active`, or `pmo:closed`
- exactly one priority label: `pmo:priority:1`, `pmo:priority:2`, `pmo:priority:3`, and so on, or `pmo:priority:idea`
- exactly one pipeline-stage label for `pmo:pipeline` issues
- `pmo:task` and a valid parent reference for task issues

Task-accounting rules:

- Task totals derive from linked `pmo:task` issues with valid parent references.
- Pending task = `pmo:task` + `pmo:pipeline`.
- In-progress task = `pmo:task` + `pmo:active`.
- Done task = `pmo:task` + `pmo:closed`.
- `taskCount` equals linked `pmo:task` issues.
- `tasksCompleted` counts linked tasks with `pmo:closed`.
- `% Complete = round(tasksCompleted / taskCount * 100)` when `taskCount > 0`.
- Missing parent references or invalid task math appear in Incomplete.

## Incomplete remediation

Use the Incomplete section as the operator worklist for PMO data-quality defects. Each row must show issue number/link, current labels, data-quality errors, required remediation, and last updated date.

Remediation procedure:

1. Open the issue link from the Incomplete row.
2. Compare current labels and parent references with the PMO July 2026 issue contract.
3. Correct issue labels, parent references, or issue identity only when authorized.
4. Regenerate and validate dashboard output.
5. Confirm the issue moved to Active, Pipeline, or Completed only after the contract violation is gone.

## Procedure

1. Update the controlling PMO issue labels and parent/task references when PMO wants the issue to appear with valid normalized values.
2. Confirm every PMO-tracked issue carries the required lifecycle, priority, and pipeline-stage/task labels from the operating model.
3. On a feature branch, confirm **Validate PMO dashboard branch changes** runs `node scripts/pmo-dashboard/test-label-driven-fixture.mjs` successfully.
4. On `main`, scheduled, or manual operational runs, confirm **Build PMO dashboard** generates and validates `site/pmo-dashboard/dashboard-data.json` and uploads the dashboard artifact.
5. Treat feature-branch fixture success as code-path evidence only; use a live `main`, scheduled, or manual build as current inventory evidence.
6. Confirm the **PMO dashboard CI deploy** Pages preflight reports `enabled: true` before expecting publication.
7. When preflight reports Pages unavailable or a non-workflow source, complete the one-time operator procedure under **GitHub Pages setup notes**.
8. Manually dispatch **PMO dashboard CI deploy** after Pages enablement.
9. Verify the published HTML and JSON URLs and record the evidence on the controlling operational issue.
10. Treat the dashboard as a reporting aid, not an authoritative tracker.

## Refresh and validation

The checked-in `site/pmo-dashboard/dashboard-data.json` is a generated snapshot, not live truth. It may be stale between operational builds; use its `generatedAt` timestamp to judge freshness. GitHub issues remain authoritative for current state, and a current-state live build is required before treating dashboard data as up to date.

The build workflow performs live issue-inventory generation and validation every six hours, on matching pushes to `main`, and when manually dispatched. Matching feature-branch pushes run only the deterministic label-driven fixture so unrelated live PMO metadata changes or transient GitHub API conditions do not block a proposed branch change. The live build fails when dashboard JSON is missing, required views are absent, row fields are invalid, tracked inventory issues are missing or in the wrong lifecycle view, tracked inventory rows lack required priority data, `pmo:priority:none` appears, excluded inventory issues appear in dashboard output, completed task counts exceed total task counts, static files are missing, or issue links are invalid.

Tracked PMO inventory expectations live in `scripts/pmo-dashboard/pmo-tracked-inventory.json`. Live validation fails when a tracked issue disappears from dashboard output, lands in the wrong lifecycle view, or when an explicitly excluded issue appears as a dashboard row. PMO-tracked issues with invalid labels, task accounting, identity, or parent references must appear in Incomplete until remediated.

Reconciliation audit evidence: `docs/ops/pmo/pmo-dashboard-tracking-audit-2299.md`.

The deploy workflow runs after a successful live PMO dashboard CI build and can also be started manually. Deploy regenerates and validates the dashboard before evaluating Pages readiness so stale checked-in output is not intentionally deployed. A missing Pages site or a Pages source other than GitHub Actions produces an operator-action summary and skips deployment; it does not convert a successful dashboard build and validation into a false-red CI incident. Unexpected API, generation, validation, artifact, or deployment errors still fail the workflow.

## GitHub Pages setup notes

GitHub Pages must be enabled for this repository with GitHub Actions as the Pages source. This dashboard is a separate GitHub Pages reporting target and does not replace or modify the Cloudflare Pages production deployment.

One-time operator procedure:

1. Open repository **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Manually dispatch **PMO dashboard CI deploy**.
5. Confirm the workflow executes Configure Pages, Upload Pages artifact, and Deploy to GitHub Pages.
6. Verify:
   - `https://wdhunter645.github.io/next-starter-template/pmo-dashboard/`
   - `https://wdhunter645.github.io/next-starter-template/pmo-dashboard/dashboard-data.json`
7. Record the successful workflow run and public URL evidence on the controlling operational issue before closeout. For the current remediation, that issue is #2471.

Do not add a PAT or privileged secret merely to let `actions/configure-pages` enable the site. Repository configuration remains a human operator responsibility.

## Display safety notes

The dashboard UI treats issue-derived fields as untrusted display text. Titles, descriptions, owners, statuses, dates, and links must be escaped or validated before display.

## Known limitations

- Anticipated completion dates are explicit issue-body values or `TBD`; the dashboard does not forecast completion dates.
- Required lifecycle, priority, pipeline-stage, issue identity, and task-accounting fields do not fall back to silent defaults; invalid required metadata appears in Incomplete.
- Optional fields may still fall back to documented display placeholders.
- Feature-branch fixture validation does not prove that live PMO issue inventory is current; live `main`, scheduled, or manual builds own that evidence.
- The public reporting surface is unavailable until GitHub Pages is enabled with GitHub Actions as the source.
- v1 does not add charts, per-program detail pages, or private/internal reporting.
- Issue-event rebuilds are intentionally deferred to reduce automation noise.

## Related references

- PMO July 2026 Operating Model: `/docs/ops/pmo/PMO-JULY-2026-OPERATING-MODEL.md`
- PMO July 2026 Dashboard Specification: `/docs/ops/pmo/PMO-JULY-2026-DASHBOARD-SPECIFICATION.md`
