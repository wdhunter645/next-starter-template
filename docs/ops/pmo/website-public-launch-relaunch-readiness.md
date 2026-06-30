---
Doc Type: Operations
Audience: Bill, Atlas, Cursor, LGFC maintainers, implementation agents, and reviewers
Authority Level: Operational Authority
Owns: Program #2039 readiness decision, public launch readiness scope, club staging placement, child-task boundaries, and launch preconditions
Does Not Own: Runtime implementation, merge authority, production secrets, vendor configuration, or Program #2040 publication scope
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1685, #2039, #2041, #2042, #2043, #2044, #2045, #2046, #2047, #2048
Last Reviewed: 2026-06-29
---

# Website Public Launch / Relaunch Readiness

> Program #2039 moves the structural website baseline into public-launch-ready condition after Program #1685 closeout. Cursor may execute only the assigned child task issue and must stop at `READY FOR REVIEW`.

## Purpose

This readiness package defines the PMO boundary for **Website Public Launch / Relaunch Readiness**.

The program prepares the LGFC website for public relaunch by reconciling public page content, donation/fundraiser route readiness, media/social reliability, SEO, analytics, production launch controls, and admin-only club content staging.

## Scope

This readiness package covers:

1. Public launch gap inventory.
2. Public content polish and launch copy reconciliation.
3. Admin-only Club Staging at `/admin/clubstaging`.
4. Media/social reliability and fallback behavior.
5. Donation/fundraiser route readiness and campaign boundary review.
6. SEO, analytics, sitemap, metadata, and social-card readiness.
7. Production launch checklist, smoke tests, rollback, and evidence capture.
8. Program validation and public-launch handoff.

This program does **not** build the controlled publication capability owned by Program #2040 or a live fundraiser campaign unless Bill/Atlas separately authorize those lanes.

## Current known truth

- Program #1685 owns the structural website baseline and Fan Club product buildout.
- Program #2039 follows #1685 closeout and should not delay #1685 CI stabilization or structural launch.
- The admin-only club staging route belongs in this program, not #1685.
- The approved route for club staging is `/admin/clubstaging`.
- `/admin/homestaging` is reserved as a possible future route but is not required for this program.
- Program #1738 owns Lou Gehrig content collection and research pipeline expansion.
- Program #2040 owns controlled content publication capability after manual workflow evidence exists.
- PMO backlog and program-registry entries are discovery surfaces only; they do not authorize Program #2039 implementation without explicit Bill/Atlas task assignment.

## Intended final state

At the end of Program #2039:

1. The public LGFC website is ready for relaunch review.
2. Public launch copy and route behavior are reconciled with the current LGFC positioning.
3. The media/social surface degrades cleanly when third-party widgets or platform embeds fail.
4. Any displayed social content links to its originating platform.
5. Donation/fundraiser routes are launch-safe and do not imply an unauthorized live campaign.
6. SEO, analytics, sitemap, metadata, and social-card behavior are ready or explicitly excepted.
7. `/admin/clubstaging` exists as an admin-only visual staging and rotation preview surface.
8. Production launch checklist, smoke-test checklist, rollback path, and release evidence expectations are documented.

## Readiness decision

| Field | Value |
| --- | --- |
| Program issue | #2039 |
| Program name | Website Public Launch / Relaunch Readiness |
| Predecessor | #1685 — Website Completion / Fan Club Product Buildout |
| Execution agent | Cursor |
| Current readiness | Ready for controlled launch after #1685 structural baseline closeout |
| Primary implementation plan | `docs/ops/implementation-plans/website-public-launch-relaunch-readiness.md` |
| Required staging route | `/admin/clubstaging` |
| Explicit non-goal | Controlled content publication capability |

## Child-task readiness inventory

| Task | issue | Readiness purpose | Decision |
| ---: | ---: | --- | --- |
| 001 | #2041 | Launch gap inventory and public page readiness review | Complete — `docs/ops/reports/website-public-launch-gap-inventory.md` |
| 002 | #2042 | Public content polish and launch copy reconciliation | Complete — `docs/ops/reports/website-public-launch-copy-reconciliation.md` |
| 003 | #2043 | Admin Club Staging page at `/admin/clubstaging` | Complete — PR #2099 |
| 004 | #2044 | Media/social reliability and fallback implementation | In progress — PR pending review |
| 005 | #2045 | Donation/fundraiser route readiness and campaign boundary review | Ready after Task 001 |
| 006 | #2046 | SEO analytics sitemap and social-card readiness | Ready after Task 002 |
| 007 | #2047 | Production launch checklist smoke tests rollback and evidence model | Ready after Tasks 001-006 |
| 008 | #2048 | Program validation and public-launch handoff report | Terminal validation task |

## Launch preconditions

Cursor implementation may begin only when:

1. Program #1685 structural baseline closeout evidence exists.
2. Bill/Atlas assign a specific Program #2039 child task issue.
3. The assigned task identifies its own file-touch boundary.
4. The PR body cites exactly one source issue.
5. The task stops at `READY FOR REVIEW`.

## Staging route rule

`/admin/clubstaging` is a protected admin-only visual preview surface.

It may display staged/sample club content, production-like visual cards, and rotation previews. It must not expose staged content on public routes and must not implement Program #2040 workflow.

## Closeout requirement

Program #2039 closeout requires terminal Task #2048 evidence and explicit Bill/Atlas acceptance.
