---
Doc Type: How-To
Audience: PMO operators and AI agents
Authority Level: Operational Guidance
Owns: PMO dashboard generation, refresh, validation, and GitHub Pages limitations
Does Not Own: PMO lifecycle definitions, GitHub issues source records, or Cloudflare production deployment
Canonical Reference: /docs/ops/pmo/workflow-automation.md
Related Issues: #2101
Last Reviewed: 2026-07-01
---

# PMO Dashboard

## Purpose

The PMO dashboard is a generated static GitHub Pages reporting surface for PMO-managed program and project work. GitHub issues remain the executable source of truth. The dashboard normalizes public-safe issue data into Active Programs, PMO Pipeline, and Completed Programs views.

## Scope

This how-to covers dashboard source fields, local generation, CI build validation, manual GitHub Pages deployment, and operational limits. It does not define the PMO lifecycle, replace GitHub issues as source records, or modify the Cloudflare production deployment.

## Current known truth

- GitHub issues are the live source for dashboard data.
- The generated dashboard is reporting-only.
- The build workflow generates, validates, and uploads dashboard artifacts.
- The deploy workflow is manual-only during initial rollout.
- Automatic deployment from successful builds requires later Bill and Atlas approval.

## Source data

The generator reads public repository GitHub issues with titles beginning with `PROGRAM:` or `PROJECT:`. Program and project issues may provide these explicit dashboard fields:

- `Dashboard Lifecycle: active | pipeline | completed`
- `Priority #: number or TBD`
- `Owner / Agent: approved owner or Pending Assignment`
- `Anticipated Completion Date: YYYY-MM-DD or TBD`
- `Program Description:` or `Project Description:`
- `Task Chain:` followed by child issue references

Task totals are derived from explicit child issue references in the source issue body task chain. The dashboard does not use docs-only registry tables or loose comment references as live task-count truth.

## Procedure

1. Update the controlling `PROGRAM:` or standalone `PROJECT:` issue body with dashboard fields when PMO wants a row to appear with normalized values.
2. Run or wait for **PMO dashboard CI build**.
3. Confirm generation and validation of `site/pmo-dashboard/dashboard-data.json` and static assets.
4. Use **PMO dashboard CI deploy** only by manual dispatch during initial rollout.
5. Treat the dashboard as a reporting aid, not an authoritative tracker.

## Refresh and validation

The build workflow runs every six hours and can also be started manually. It fails when dashboard JSON is missing, required views are absent, row fields are invalid, completed task counts exceed total task counts, static files are missing, or issue links are invalid.

The deploy workflow is manual-only for initial rollout. Manual dispatch regenerates and validates the dashboard before publishing so stale output is not intentionally deployed.

## GitHub Pages setup notes

GitHub Pages must be enabled for this repository with GitHub Actions as the Pages source. This dashboard is a separate GitHub Pages reporting target and does not replace or modify the Cloudflare Pages production deployment.

## Display safety notes

The dashboard UI treats issue-derived fields as untrusted display text. Titles, descriptions, owners, statuses, dates, and links must be escaped or validated before display.

## Known limitations

- Anticipated completion dates are explicit issue-body values or `TBD`; the dashboard does not forecast completion dates.
- Rows with missing optional fields fall back to `TBD`, `Pending Assignment`, or blank descriptions.
- v1 does not add charts, per-program detail pages, or private/internal reporting.
- issue-event rebuilds are intentionally deferred to reduce automation noise.
