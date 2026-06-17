---
Doc Type: Implementation Plan
Audience: Bill, Atlas, Cursor, LGFC maintainers, implementation agents, and reviewers
Authority Level: Operational Plan
Owns: Cursor task sequence, child-project boundaries, validation model, file-area expectations, and closeout rules for Fundraiser / Charity Campaign Operations Buildout
Does Not Own: Runtime implementation before task issues, issue creation before launch authorization, merge authority, vendor configuration, donation processing, campaign compliance administration, fundraiser launch execution
Status: planning-ready
Project: fundraiser-charity-campaign-operations-buildout
Owner: Atlas
Execution Mode: cursor-after-launch-authorization
Source Issue: 1696
Related Program Issue: pending-program-issue-after-launch
Canonical Reference: /docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md
Related Issues: #1696, #1379, #1255, #1259, #1685, #1686, #1694
Last Reviewed: 2026-06-17
---

# Fundraiser / Charity Campaign Operations Buildout Implementation Plan

> This program is BLOCKED from execution until Atlas/Bill explicitly launch it. Planning, review, and documentation discussion may continue, but Cursor may not execute implementation work from this program until Bill/Atlas explicitly launch it.

## Purpose

Define the future Cursor implementation sequence for the PMO Priority #2 program candidate: **Fundraiser / Charity Campaign Operations Buildout**.

This plan packages the fundraiser/charity campaign project group into bounded implementation tasks so Cursor can execute after launch authorization without inferring requirements from chat history, historical ideas issues, Givebutter assumptions, or stale PMO v2 planning names.

## Scope

This plan covers:

- fundraiser operations playbook creation;
- Givebutter external/internal boundary documentation;
- leaderboard and winner rule definition;
- homepage campaign spotlight and public campaign surface behavior;
- sponsor/donor recognition privacy controls;
- implementation of accepted website-side campaign surfaces and data structures;
- pre-launch testing and closeout evidence;
- final operator handoff.

This plan does not authorize this documentation PR to change application code, workflows, migrations, route files, package files, issue labels, issue states, Givebutter account configuration, Cloudflare configuration, donation processing administration, campaign compliance administration, or implementation child issues.

## Current known truth

- PMO Backlog Priority #2 is a high-priority future program candidate.
- Program #1255 and child #1259 remain ahead of this program unless Bill/Atlas explicitly reprioritize.
- Priority #1 Website Completion / Fan Club Product Buildout is parked as #1685 with child issues #1686 through #1694.
- Givebutter is treated as the likely external campaign platform boundary, not as an internal donation system to rebuild.
- Donor/sponsor recognition must not expose public PII by default.
- Campaign spotlight behavior must fail closed when missing, disabled, invalid, stale, or unpublished.
- Cursor is the intended implementation agent after Bill/Atlas launch authorization.

## Intended final state

At the end of this program:

1. LGFC has a repeatable fundraiser operations playbook covering setup, preview, launch, closeout, winner publication, and archive.
2. Givebutter ownership boundaries are explicit: external campaign/donation/campaign operations remain outside LGFC runtime implementation.
3. Website campaign surfaces display only approved public campaign state and fail closed when data is unavailable or disabled.
4. Leaderboard and winner behavior is deterministic, snapshot-based, and privacy-safe.
5. Sponsor/donor recognition uses approved display fields only and exposes no public PII.
6. Pre-launch testing package validates campaign visibility, links, privacy, fail-closed behavior, and closeout state.
7. Cursor stops each task at GitHub `READY FOR REVIEW`; Atlas does not self-approve or self-merge.

## Source documents

| Source | Role |
| --- | --- |
| `docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md` | PMO readiness and child-project boundary authority |
| `docs/ops/pmo/pmo-backlog.md` | Priority #2 backlog source and child-project inventory |
| `docs/ops/pmo/program-registry.md` | Program queue and launch-state control authority |
| `docs/reference/design/LGFC-Production-Design-and-Standards.md` | Canonical homepage/campaign surface invariants and fail-closed display expectations |
| `#1696` | Source issue for this documentation package |
| `#1379` | Historical ideas source only |

## Cursor execution rules

Cursor may execute only after a current source issue explicitly authorizes the specific task.

Each task issue must include parent program, predecessor, successor, exact scope, out-of-scope list, file-touch allowlist, source documents, acceptance criteria, validation requirements, stop condition `GitHub READY FOR REVIEW`, and no merge/issue-mutation authority unless explicitly granted.

Cursor must reconcile before building. Existing website campaign surfaces, CMS/config surfaces, admin/content behavior, route contracts, and tests must be inspected before creating deltas.

## Proposed task sequence

| Task | Title | Objective | Primary project | Allowed files / areas | Verification | Predecessor | Successor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 001 | Fundraiser operations playbook and launch-state model | Define repeatable setup, preview, launch, pause, closeout, winner publication, and archive operations. | Fundraiser operations playbook | `docs/how-to/website/**`, `docs/reference/website/**`, `docs/ops/reports/**` | Docs/how-to checks; operations checklist review | Launch authorization | 002 |
| 002 | Givebutter integration boundary and data ownership model | Document external campaign ownership versus LGFC website/config/display ownership. | Givebutter integration model | `docs/reference/website/**`, `docs/reference/platform/**`, `docs/ops/reports/**` | Docs check; boundary checklist | 001 | 003 |
| 003 | Leaderboard and winner rule specification | Define scoring, snapshot cadence, deterministic winner calculation, tiebreakers, and privacy-safe publication. | Leaderboard / winner system | `docs/reference/website/**`, `docs/how-to/website/**`, `docs/ops/reports/**` | Docs check; deterministic rule review | 001 and 002 | 004 |
| 004 | Homepage spotlight and campaign surface design reconciliation | Reconcile homepage campaign spotlight, campaign status, public link/embed behavior, preview/review gates, and fail-closed state. | Homepage spotlight / campaign surface | `docs/reference/design/**`, `docs/reference/website/**`, `docs/ops/reports/**`; read-only `src/**`, `tests/**` | Docs check; source-document cross-check; read-only implementation inventory | 001 and 002 | 005 |
| 005 | Sponsor and donor recognition privacy model | Define recognition display rules, consent boundaries, public fields, tier/logo handling, anonymous display, and prohibited PII. | Sponsor / donor recognition | `docs/reference/website/**`, `docs/how-to/website/**`, `docs/ops/reports/**` | Docs/how-to checks; privacy checklist | 001 through 004 | 006 |
| 006 | Website-side campaign configuration and display implementation | Implement only accepted website-side campaign config/display surfaces with fail-closed behavior. | Campaign website implementation | Scoped `src/**`, scoped `functions/api/**` only if required, `tests/**`, `docs/ops/reports/**` | Targeted tests; fail-closed tests; manual route checklist | 002 through 005 | 007 |
| 007 | Fundraiser pre-launch testing package | Build pre-launch verification covering campaign state, links, leaderboard, recognition privacy, fail-closed behavior, and archive readiness. | Testing package | `docs/how-to/website/**`, `docs/ops/reports/**`, `tests/**` if required by accepted implementation | Docs/how-to checks; targeted tests if test files change | 006 | 008 |
| 008 | Program closeout and operator handoff | Consolidate evidence, publish operator handoff, identify deferred work, and prepare Bill/Atlas acceptance packet. | Whole program | `docs/ops/reports/**`, scoped `docs/ops/pmo/**`, scoped `docs/ops/implementation-plans/**` | Docs check; closeout checklist | 001 through 007 | terminal |

## Dependency map

| Task | Predecessor | Successor | Stage-before-merge | Halt condition | Resume condition |
| --- | --- | --- | --- | --- | --- |
| 001 | launch authorization | 002 | yes | Launch not authorized | Bill/Atlas launch source issue exists |
| 002 | 001 | 003 | yes | Operations model missing | Task 001 merged |
| 003 | 001 and 002 | 004 | yes | External/internal data boundary unresolved | Task 002 merged |
| 004 | 001 and 002 | 005 | yes | Campaign surface ownership unresolved | Task 002 merged |
| 005 | 001 through 004 | 006 | yes | Donor/sponsor privacy model unresolved | Task 004 merged |
| 006 | 002 through 005 | 007 | yes | Accepted implementation deltas undefined | Tasks 002–005 merged and deltas accepted |
| 007 | 006 | 008 | yes | Website-side campaign behavior unverified | Task 006 merged |
| 008 | 001 through 007 | terminal | yes | Evidence package incomplete | Tasks 001–007 merged or explicitly deferred |

## Validation model

Each implementation PR must run checks relevant to its changed files and record exact outcomes in the PR body.

Expected validation categories:

- documentation header checks for docs changes;
- docs/how-to checks for operator playbooks and checklists;
- targeted Vitest/unit/API tests for React/component/API behavior;
- route/navigation tests when public campaign surfaces change;
- API/fail-closed tests when `functions/api/**` changes;
- manual campaign-surface checklist when homepage or campaign display changes;
- donor/sponsor privacy checklist when recognition surfaces change;
- no ZIP file in repo root;
- one source issue line in the PR body;
- exact file-touch allowlist alignment.

## Fundraiser pre-launch testing checklist

Before any public campaign launch, the responsible implementation task must produce a completed checklist that verifies:

| Check area | Required verification |
| --- | --- |
| Campaign state | Draft, preview, active, paused, ended, and archived states are represented or explicitly deferred. |
| Approved public links | Givebutter or other external campaign URLs are operator-approved and do not expose private admin URLs. |
| Fail-closed behavior | Campaign spotlight and campaign routes render disabled/empty-safe states when config is missing, invalid, stale, disabled, or unpublished. |
| Homepage spotlight | Homepage campaign module does not block core homepage navigation, header, footer, auth, or existing public content when no active campaign exists. |
| Leaderboard snapshot | Leaderboard display uses approved snapshot/import state and does not depend on raw live donor data. |
| Winner rule | Winner calculation, tiebreaker, publication timing, and operator approval are documented before display. |
| Recognition privacy | Sponsor/donor recognition uses approved public fields only and does not expose email, phone, address, payment details, raw transaction IDs, or private notes. |
| Accessibility and viewport | Campaign surfaces are checked for keyboard access, readable labels, mobile viewport behavior, and non-blocking fallbacks. |
| Archive behavior | Ended campaigns can be hidden, archived, or summarized without stale live-state claims. |
| Operator handoff | Human operator can identify what to configure externally, what to update in LGFC docs/admin surfaces, and what evidence is required before launch. |

Task 007 must convert this checklist into the final pre-launch verification artifact and Task 008 must cite that artifact during program closeout.

## Launch gate

This plan becomes executable only when Bill/Atlas create or update a program issue with explicit launch authorization.

Launch authorization must identify program issue number, first task source issue, Cursor as implementation agent, issue-creation authority, task sequencing mode, and Cursor stop condition.

Default stop condition: GitHub `READY FOR REVIEW`.

## Closeout rules

- Cursor does not approve PRs.
- Cursor does not merge PRs.
- Cursor does not close, reopen, or relabel GitHub issues unless a source issue explicitly grants that authority.
- Atlas does not self-approve Atlas-authored PRs.
- Source issue closeout occurs only after merge verification and post-merge validator state are clean.
- Program closeout requires Task 008 evidence and explicit Bill/Atlas acceptance.

## Readiness conclusion

This implementation plan is sufficient for future Cursor task issue creation after explicit launch authorization.

Status: `planning-ready`.

Execution: blocked until Bill/Atlas launch the program.
