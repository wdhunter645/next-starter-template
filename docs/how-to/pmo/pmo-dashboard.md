---
Doc Type: How-To
Audience: PMO operators and AI agents
Authority Level: Operational Guidance
Owns: PMO dashboard generation, refresh, validation, and GitHub Pages limitations
Does Not Own: PMO lifecycle definitions, GitHub issues source records, or Cloudflare production deployment
Canonical Reference: /docs/ops/pmo/workflow-automation.md
Related Issues: #2101, #2299, #2313, #2471
Last Reviewed: 2026-07-12
---

# PMO Dashboard

## Purpose

The PMO dashboard is a generated static GitHub Pages reporting surface for PMO-managed program and project work. GitHub issues remain the executable source of truth. The dashboard normalizes public-safe issue data into Active Programs, PMO Pipeline, and Completed Programs views.

## Scope

This how-to covers dashboard source fields, local generation, deterministic feature-branch validation, live operational CI validation, GitHub Pages readiness preflight, manual or automatic deployment, and operational limits. It does not define the PMO lifecycle, replace GitHub issues as source records, or modify the Cloudflare production deployment.

## Current known truth

- GitHub issues are the live source for dashboard data.
- The generated dashboard is reporting-only.
- Matching feature-branch pushes run the deterministic label-driven fixture and do not query live GitHub issue inventory.
- Pushes to `main`, scheduled runs, and manual runs generate from live GitHub issues, validate tracked inventory, and upload dashboard artifacts.
- The deploy workflow regenerates and validates the dashboard before checking whether GitHub Pages is ready.
- When GitHub Pages is enabled with GitHub Actions as the source, the workflow configures Pages, uploads the artifact, and deploys automatically.
- When Pages is unavailable or uses a source other than GitHub Actions, deployment steps are skipped and the workflow reports the required operator action without misreporting dashboard generation or validation as failed.
- GitHub Pages enablement is a one-time repository setting and cannot be performed by the workflow's default `GITHUB_TOKEN`.

## Intended final state

The PMO dashboard uses deterministic feature-branch validation for proposed code and documentation changes, retains live issue-inventory validation for operational runs, deploys automatically when GitHub Pages is ready, surfaces missing or incompatible repository configuration as an explicit operator action, and verifies the public dashboard URLs before operational issue closeout.

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

PMO dashboard inclusion is label-driven:

```text
label = PMO -> issue is PMO-tracked and eligible for dashboard rows
no PMO label -> issue is not PMO-tracked and is excluded
```

The `PMO` / `pmo` label is the only dashboard inclusion flag. Title prefixes identify row type for display but do not control inclusion.

Recognized title prefixes for row-type display:

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

Issues without the PMO label are excluded even when they use a recognized title prefix. Explicit exclusion rationale for non-PMO or historical rows lives in `scripts/pmo-dashboard/pmo-tracked-inventory.json`.

## Dashboard grouping

Grouping is driven by concise PMO status/lifecycle rules and a fixed precedence model:

```text
PMO label -> included on the dashboard
closed GitHub issue or status:complete label -> Completed Programs
open PMO issue with Status: Active -> Active Programs
open PMO issue with future-work status or Dashboard Lifecycle: pipeline -> PMO Pipeline
```

Precedence is intentional: the PMO label controls inclusion, then GitHub closed state and the `status:complete` label control completed lifecycle, then issue-body `Status:` and `Dashboard Lifecycle:` classify open work. If these sources conflict, a closed PMO issue still displays `Completed`, and an open PMO issue carrying `status:complete` also displays `Completed` with `closedAt = null`. Pipeline means future PMO work. Active means active PMO work. `status:complete` means completed PMO work only when paired with the PMO label.

Standardized display statuses:

```text
Active
Implementation Ready
Update Needed
Planning
Strategy Defined
Strategy Development
Idea
Completed
```

Task-level execution states such as post-merge verification, reviewer response, or closeout are not top-level PMO dashboard statuses. Completed rows display only `Completed`; future-work statuses such as `Implementation Ready`, `Update Needed`, `Planning`, `Strategy Development`, and `Idea` are valid only in the PMO Pipeline view. `Implementation Ready` must be explicit in `Status:` or `Dashboard Status:` metadata; missing or unrecognized pipeline status metadata displays as `Update Needed` so operators can see the metadata problem instead of a false readiness signal. Active rows display only `Active`.

Sorting:

- Active Programs and PMO Pipeline top-level rows sort by numeric `Priority #` low to high.
- Completed Programs sort by `closedAt` newest to oldest, falling back to `updatedAt` when `closedAt` is unavailable. The fallback is expected for open PMO issues intentionally marked with `status:complete`; operators should treat those rows as completed dashboard work that still needs separate GitHub issue hygiene or closeout.

Included issues should provide these explicit dashboard fields:

- `Dashboard Lifecycle: active | pipeline | completed`
- `Priority #: number or TBD`
- `Owner / Agent: approved owner or Pending Assignment`
- `Anticipated Completion Date: YYYY-MM-DD or TBD`
- `Program Description:` or `Project Description:`
- Task child issue references inside one or more explicit task-chain blocks with these headings (case-insensitive): `Task Chain`, `Child Task Chain`, `Child Tasks`, `Child Issue Chain`, `Child Issues`, `Expected Child Issue Chain`, `Expected Child Task Chain`, `Required Child Issue Chain`, `Required Child Task Chain`, `Implementation Tasks`, `Implementation Task Chain`, `Implementation Issue Chain`, `Task List`, or `Issue Chain`

Task-accounting rules:

- Task totals are derived only from declared child issue references inside explicit task-chain blocks.
- Loose issue references outside those sections are intentionally ignored.
- Each recognized task block ends at the next markdown heading.
- Docs-only registry tables, related-issue references, source links, and comments are not used as live task-count truth.
- `taskCount` equals the number of declared unique child issue references found in recognized task-chain sections, including declared refs that are missing from fetched issue data.
- `tasksCompleted` counts only declared child refs that resolve to issues that are closed or carry `status:complete`.
- Missing/unfetched declared child refs remain counted in `taskCount` but are not counted as completed tasks.

## Procedure

1. Update the controlling PMO issue body with dashboard fields when PMO wants a row to appear with normalized values.
2. Add child tasks only inside one or more recognized task-chain blocks (`Task Chain`, `Child Task Chain`, `Child Tasks`, `Child Issue Chain`, `Child Issues`, `Expected Child Issue Chain`, `Expected Child Task Chain`, `Required Child Issue Chain`, `Required Child Task Chain`, `Implementation Tasks`, `Implementation Task Chain`, `Implementation Issue Chain`, `Task List`, or `Issue Chain`).
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

The build workflow performs live issue-inventory generation and validation every six hours, on matching pushes to `main`, and when manually dispatched. Matching feature-branch pushes run only the deterministic label-driven fixture so unrelated live PMO metadata changes or transient GitHub API conditions do not block a proposed branch change. The live build fails when dashboard JSON is missing, required views are absent, row fields are invalid, tracked inventory issues are missing or in the wrong lifecycle view, tracked inventory rows in active or pipeline views lack numeric `Priority #` values, excluded inventory issues appear in dashboard output, completed task counts exceed total task counts, static files are missing, or issue links are invalid.

Tracked PMO inventory expectations live in `scripts/pmo-dashboard/pmo-tracked-inventory.json`. Live validation fails when a tracked issue disappears from dashboard output, lands in the wrong lifecycle view, or when an explicitly excluded issue appears as a dashboard row. Only tracked inventory rows in active or pipeline views are required to have numeric priorities; other title-prefix matches outside the inventory may retain `TBD` until excluded or metadata-tagged.

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
- Rows with missing optional fields fall back to `TBD`, `Pending Assignment`, or blank descriptions.
- Feature-branch fixture validation does not prove that live PMO issue inventory is current; live `main`, scheduled, or manual builds own that evidence.
- The public reporting surface is unavailable until GitHub Pages is enabled with GitHub Actions as the source.
- v1 does not add charts, per-program detail pages, or private/internal reporting.
- Issue-event rebuilds are intentionally deferred to reduce automation noise.
