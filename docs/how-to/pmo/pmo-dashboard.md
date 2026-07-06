---
Doc Type: How-To
Audience: PMO operators and AI agents
Authority Level: Operational Guidance
Owns: PMO dashboard generation, refresh, validation, and GitHub Pages limitations
Does Not Own: PMO lifecycle definitions, GitHub issues source records, or Cloudflare production deployment
Canonical Reference: /docs/ops/pmo/workflow-automation.md
Related Issues: #2101, #2299, #2313
Last Reviewed: 2026-07-06
---

# PMO Dashboard

## Purpose

The PMO dashboard is a generated static GitHub Pages reporting surface for PMO-managed program and project work. GitHub issues remain the executable source of truth. The dashboard normalizes public-safe issue data into Active Programs, PMO Pipeline, and Completed Programs views.

## Scope

This how-to covers dashboard source fields, local generation, CI build validation, manual or automatic GitHub Pages deployment, and operational limits. It does not define the PMO lifecycle, replace GitHub issues as source records, or modify the Cloudflare production deployment.

## Current known truth

- GitHub issues are the live source for dashboard data.
- The generated dashboard is reporting-only.
- The build workflow generates, validates, and uploads dashboard artifacts.
- The deploy workflow publishes after a successful PMO dashboard CI build and can also be run manually during controlled rollout.
- Automatic deployment from successful builds is approved for the PMO dashboard closeout path.

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

Grouping is driven by concise PMO status/lifecycle rules:

```text
PMO + Status: Active -> Active Programs
PMO + future pipeline statuses -> PMO Pipeline
PMO + status:complete or closed issue -> Completed Programs
```

Pipeline means future PMO work. Active means active PMO work. `status:complete` means completed PMO work only when paired with the PMO label.

Standardized display statuses:

```text
Active
Implementation Ready
Planning
Strategy Defined
Strategy Development
Idea
Completed
```

Task-level execution states such as post-merge verification, reviewer response, or closeout are not top-level PMO dashboard statuses.

Sorting:

- Active Programs and PMO Pipeline top-level rows sort by numeric `Priority #` low to high.
- Completed Programs sort by `closed_at` newest to oldest, falling back to `updated_at` when `closed_at` is unavailable.

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
3. Run or wait for **PMO dashboard CI build**.
4. Confirm generation and validation of `site/pmo-dashboard/dashboard-data.json` and static assets.
5. Run `node scripts/pmo-dashboard/test-label-driven-fixture.mjs` when changing label-driven inclusion or nested child display logic.
6. Confirm **PMO dashboard CI deploy** publishes the validated dashboard and records the Pages URL.
7. Record the published GitHub Pages URL on the controlling PMO dashboard issue before closeout.
8. Treat the dashboard as a reporting aid, not an authoritative tracker.

## Refresh and validation

The build workflow runs every six hours and can also be started manually. It fails when dashboard JSON is missing, required views are absent, row fields are invalid, tracked inventory issues are missing or in the wrong lifecycle view, tracked inventory rows in active or pipeline views lack numeric `Priority #` values, excluded inventory issues appear in dashboard output, completed task counts exceed total task counts, static files are missing, or issue links are invalid.

Tracked PMO inventory expectations live in `scripts/pmo-dashboard/pmo-tracked-inventory.json`. Validation fails when a tracked issue disappears from dashboard output, lands in the wrong lifecycle view, or when an explicitly excluded issue appears as a dashboard row. Only tracked inventory rows in active or pipeline views are required to have numeric priorities; other title-prefix matches outside the inventory may retain `TBD` until excluded or metadata-tagged.

Reconciliation audit evidence: `docs/ops/pmo/pmo-dashboard-tracking-audit-2299.md`.

The deploy workflow publishes after a successful PMO dashboard CI build and can also be started manually during controlled rollout. Deploy regenerates and validates the dashboard before publishing so stale output is not intentionally deployed.

## GitHub Pages setup notes

GitHub Pages must be enabled for this repository with GitHub Actions as the Pages source. This dashboard is a separate GitHub Pages reporting target and does not replace or modify the Cloudflare Pages production deployment.

The published GitHub Pages URL must be recorded on the controlling PMO dashboard issue before final closeout.

## Display safety notes

The dashboard UI treats issue-derived fields as untrusted display text. Titles, descriptions, owners, statuses, dates, and links must be escaped or validated before display.

## Known limitations

- Anticipated completion dates are explicit issue-body values or `TBD`; the dashboard does not forecast completion dates.
- Rows with missing optional fields fall back to `TBD`, `Pending Assignment`, or blank descriptions.
- v1 does not add charts, per-program detail pages, or private/internal reporting.
- issue-event rebuilds are intentionally deferred to reduce automation noise.
