---
Doc Type: How-To
Audience: PMO operators and AI agents
Authority Level: Operational Guidance
Owns: PMO dashboard generation, refresh, validation, and GitHub Pages limitations
Does Not Own: PMO lifecycle definitions, GitHub Issues source records, or Cloudflare production deployment
Canonical Reference: /docs/ops/pmo/workflow-automation.md
Related Issues: #2101
Last Reviewed: 2026-06-30
---

# PMO Dashboard

## Purpose

The PMO dashboard is a generated static GitHub Pages reporting surface for PMO-managed program and project work. GitHub Issues remain the executable source of truth; the dashboard only normalizes public-safe issue data into the requested Active Programs, PMO Pipeline, and Completed Programs views.

## Source data

The generator reads public repository GitHub Issues with titles beginning with `PROGRAM:` or `PROJECT:`. Program and project issues may provide these explicit dashboard fields in their issue bodies:

- `Dashboard Lifecycle: active | pipeline | completed`
- `Priority #: <number | TBD>`
- `Owner / Agent: <Bill | Atlas | Cursor | Operations | Pending Assignment | other approved owner>`
- `Anticipated Completion Date: <YYYY-MM-DD | TBD>`
- `Program Description:` or `Project Description:`

Task totals are derived from explicit child issue references in the source issue body task chain. The dashboard does not use docs-only registry tables or loose comment references as live task-count truth.

## Procedure

1. Update the controlling `PROGRAM:` or standalone `PROJECT:` issue body with the explicit dashboard fields when PMO wants a row to appear with normalized values.
2. Let the scheduled **PMO dashboard CI build** workflow refresh the static output, or run it manually with `workflow_dispatch`.
3. Confirm the build workflow generated and validated `site/pmo-dashboard/dashboard-data.json` plus the static UI under `site/pmo-dashboard/`.
4. Let **PMO dashboard CI deploy** publish only the successful validated build artifact to GitHub Pages.
5. Use the dashboard as a reporting aid, not as an authoritative tracker.


## Issue note field block

Use this issue-body note block on PMO-managed `PROGRAM:` and standalone `PROJECT:` issues that should appear in the dashboard. Keep these values in the GitHub Issue because Issues are the source of live workload truth.

```text
Dashboard Lifecycle: active | pipeline | completed
Priority #: <number | TBD>
Owner / Agent: <Bill | Atlas | Cursor | Operations | Pending Assignment | other approved owner>
Anticipated Completion Date: <YYYY-MM-DD | TBD>
Program Description: <one- or two-sentence public-safe summary>
Task Chain: #<child-task-issue> #<child-task-issue>
```

For Issue #2101, the implementation-ready notes are:

```text
Dashboard Lifecycle: active
Priority #: TBD
Owner / Agent: Cursor
Anticipated Completion Date: TBD
Program Description: Create the generated PMO dashboard GitHub Pages CI build/deploy system.
```

Only include public-safe text in these notes. Do not add private/internal data, forecasted completion dates, docs-only registry state, or loose comment references as dashboard source values.

## Refresh and validation

The build workflow runs every six hours and can also be started manually. It fails when dashboard data is missing, JSON does not parse, a required top-level view is absent, a row is missing Program / Project Name or Status, `% Complete` is `NaN`, completed task counts exceed total task counts, required static files are missing, or issue links are obviously invalid.

The deploy workflow is triggered by a successful **PMO dashboard CI build** run and validates the downloaded artifact before publishing. Manual deploy dispatch regenerates and validates the dashboard before publishing so stale, unvalidated output is not intentionally deployed.

## GitHub Pages setup notes

GitHub Pages must be enabled for this repository with GitHub Actions as the Pages source. This dashboard is a separate GitHub Pages reporting target and does not replace or modify the Cloudflare Pages production deployment.

## Known limitations

- Anticipated completion dates are explicit issue-body values or `TBD`; the dashboard does not forecast completion dates.
- Rows with missing optional fields fall back to `TBD`, `Pending Assignment`, or blank descriptions.
- v1 does not add charts, per-program detail pages, or private/internal reporting.
- Issue-event rebuilds are intentionally deferred to reduce automation noise; scheduled and manual refresh are the v1 refresh paths.
