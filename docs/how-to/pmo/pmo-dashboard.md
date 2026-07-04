---
Doc Type: How-To
Audience: PMO operators and AI agents
Authority Level: Operational Guidance
Owns: PMO dashboard generation, refresh, validation, and GitHub Pages limitations
Does Not Own: PMO lifecycle definitions, GitHub issues source records, or Cloudflare production deployment
Canonical Reference: /docs/ops/pmo/workflow-automation.md
Related Issues: #2101, #2240
Last Reviewed: 2026-07-04
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
- The dashboard is live on GitHub Pages and the JSON endpoint is publicly readable without authentication.

## Published URLs

Use these canonical public URLs:

| Surface | URL |
|---|---|
| Dashboard page | https://wdhunter645.github.io/next-starter-template/pmo-dashboard/ |
| Dashboard JSON | https://wdhunter645.github.io/next-starter-template/pmo-dashboard/dashboard-data.json |

The JSON URL is the canonical machine-readable input for Atlas/ChatGPT PMO meeting startup and status review. The HTML page is the human-readable reporting surface for the same normalized data.

## PMO meeting startup for Atlas/ChatGPT

At PMO meeting startup, Atlas/ChatGPT should fetch the dashboard JSON URL first.

Recommended startup sequence:

1. Fetch `https://wdhunter645.github.io/next-starter-template/pmo-dashboard/dashboard-data.json`.
2. Confirm the response is HTTP 200 JSON with:
   - `generatedAt`
   - `source: "github-issues"`
   - `views.activePrograms`
   - `views.pmoPipeline`
   - `views.completedPrograms`
3. Use the three views as the normalized PMO workload snapshot for meeting status review.
4. Use each row's `issueNumber` and `issueUrl` to drill into controlling `PROGRAM:` or `PROJECT:` issues when deeper issue-body detail is required.
5. Treat GitHub Issues as executable work truth when a row field conflicts with issue-body detail or when child-task detail is needed beyond aggregate counts.

Atlas/ChatGPT should use the dashboard JSON URL as the default PMO meeting startup input. Do not scrape the HTML page when JSON fetch succeeds.

## JSON schema summary

Top-level fields:

- `generatedAt` — ISO timestamp when the dashboard was generated
- `source` — must be `github-issues`
- `repository` — source repository (`owner/repo`)
- `views.activePrograms` — launched or actively executing program/project rows
- `views.pmoPipeline` — queued, planned, or not-yet-launched rows
- `views.completedPrograms` — completed or terminal-closeout rows

Each row includes:

- `type` — `program` or `project`
- `name` — normalized program/project name
- `issueNumber` — master controlling issue number
- `issueUrl` — master controlling issue URL
- `priority`, `status`, `percentComplete`, `taskCount`, `tasksCompleted`, `ownerAgent`, `description`, `anticipatedCompletionDate`

## Fallback rule

If the dashboard JSON cannot be fetched, is not valid JSON, is missing required top-level fields, or appears stale relative to the meeting context:

1. Fall back to GitHub Issues directly.
2. Query open and recently closed issues titled `PROGRAM:` or `PROJECT:`.
3. Read explicit dashboard fields and task-chain blocks from issue bodies.
4. Record in the meeting issue that dashboard JSON was unavailable and issue-level inspection was used instead.

Do not treat a failed JSON fetch as proof that PMO workload is empty.

## External access verification

The JSON endpoint is suitable for external agent read access when these checks pass:

```bash
curl -I https://wdhunter645.github.io/next-starter-template/pmo-dashboard/dashboard-data.json
curl -sL https://wdhunter645.github.io/next-starter-template/pmo-dashboard/dashboard-data.json
```

Expected results:

- HTTP 200
- `content-type: application/json`
- `access-control-allow-origin: *`
- no authentication required
- no redirect required for the canonical URL
- body includes `generatedAt`, `source`, and all three `views.*` arrays

The dashboard page should also return HTTP 200 at:

```bash
curl -I https://wdhunter645.github.io/next-starter-template/pmo-dashboard/
```

## Source data

The generator reads public repository GitHub issues with titles beginning with `PROGRAM:` or `PROJECT:`. Program and project issues may provide these explicit dashboard fields:

- `Dashboard Lifecycle: active | pipeline | completed`
- `Priority #: number or TBD`
- `Owner / Agent: approved owner or Pending Assignment`
- `Anticipated Completion Date: YYYY-MM-DD or TBD`
- `Program Description:` or `Project Description:`
- Task child issue references inside one or more explicit `Task Chain`, `Child Tasks`, `Implementation Tasks`, or `Task List` blocks

Task totals are derived only from explicit child issue references inside `Task Chain`, `Child Tasks`, `Implementation Tasks`, or `Task List` blocks. The parser returns zero tasks when no explicit task block exists. The parser stops each task block at the next markdown heading and does not use docs-only registry tables, related-issue references, source links, comments, or loose issue references as live task-count truth.

## Procedure

1. Update the controlling `PROGRAM:` or standalone `PROJECT:` issue body with dashboard fields when PMO wants a row to appear with normalized values.
2. Add child tasks only inside one or more explicit `Task Chain`, `Child Tasks`, `Implementation Tasks`, or `Task List` blocks.
3. Run or wait for **PMO dashboard CI build**.
4. Confirm generation and validation of `site/pmo-dashboard/dashboard-data.json` and static assets.
5. Confirm **PMO dashboard CI deploy** publishes the validated dashboard and records the Pages URL.
6. Record the published GitHub Pages URL on the controlling PMO dashboard issue before closeout.
7. Treat the dashboard as a reporting aid, not an authoritative tracker.

## Refresh and validation

The build workflow runs every six hours and can also be started manually. It fails when dashboard JSON is missing, required views are absent, row fields are invalid, completed task counts exceed total task counts, static files are missing, or issue links are invalid.

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
