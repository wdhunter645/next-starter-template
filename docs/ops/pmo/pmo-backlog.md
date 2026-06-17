---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO Backlog inventory for ideas, project drafts, implementation-ready projects, backlog review history, and promotion candidates
Does Not Own: Program launch approval, final prioritization, implementation scope, issue creation, merge authority, or Cursor execution authorization
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1379, #1411, #1255, #1500, #1501, #1678, #1685, #1696, #1700, #1701, #1702, #1703, #1704, #1705, #1706, #1707, #1708
Last Reviewed: 2026-06-17
---

# PMO Backlog

PMO Backlog = ideas, project drafts, governance/ops backlog items, and implementation-ready projects.

This document is the durable, **prioritized working inventory** for PMO backlog review. It does not launch work, create issues, authorize Cursor or Codex execution, or establish final execution authorization by itself. Work becomes executable only through a **current open program or task/source issue** with explicit launch/assignment authorization.

## Scope

This document owns PMO Backlog inventory, promotion history, weekly project review integration, and duplicate/version-reference flags. It does not own program launch approval, merge authority, issue creation, or Cursor execution authorization.

## Current known truth

- **PMO Backlog is documentation-owned.** Backlog placement does not authorize Cursor or Codex implementation.
- **Legacy `#1379`** is historical source evidence only. It is superseded by this document.
- **issue `#1411` is closed** and served its planning/control purpose as a completed planning artifact (`status:complete`). It is not an open or automatically queued program.
- **Former `#1411` work areas** now belong in this backlog inventory as governance/ops backlog items unless later relaunched through a current open PMO v3 program or source issue.
- **Program `#1255`** remains the active website implementation program owned by Cursor for completion.
- **Program `#1500` is closed complete.** It may supersede or partially satisfy post-merge closeout stabilization backlog items, but it does not launch additional governance work by itself.
- **Priority #1 Website Completion / Fan Club Product Buildout** has a parked program issue and task chain (#1685 through #1694). It remains blocked from implementation until Bill/Atlas explicitly launch or reprioritize it.
- **Priority #2 Fundraiser / Charity Campaign Operations Buildout** has program issue #1700 and child issue chain #1701 through #1708. Task 001 assignment guidance is posted on #1701. It remains queued behind Program #1255/#1259 and parked Priority #1 unless Bill/Atlas explicitly reprioritize.
- **The backlog does not authorize implementation by itself.** Production-ready documentation remains the execution gate: projects with production-ready docs can move first once explicitly authorized.
- Filenames that still contain `program-5` (for example `docs/ops/pmo/program-5-admin-page-and-tools-design-readiness.md`) are **legacy source material** from the retired PMO v2 five-lane model. They are not active PMO v3 program authority and require PMO v3 conversion before promotion.

## Intended final state

- Backlog items are classified, prioritized top-down by current need, and tracked with production-documentation readiness.
- No backlog link can be mistaken for an active PMO v3 program lane or automatic execution queue.
- Weekly PMO project review keeps the backlog current rather than static.
- Priority #1 remains parked until Bill/Atlas explicitly launch or reprioritize it.
- Priority #2 is launch-control ready as #1700 with child tasks #1701 through #1708, pending queue authorization.

## Prioritized working backlog inventory

Items are sorted **top-down by current priority need** as of the Bill/Atlas PMO v3 review and subsequent Priority #1 and Priority #2 readiness updates. Priority guides discussion and preparation order; **production-ready documentation plus explicit launch authorization remain the gates for execution.**

| Rank | project / idea name | Classification | Brief description | Suggested next action | Related references | Duplicate / version note | Production doc readiness |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **Website Completion / Fan Club Product Buildout** | parked next-program candidate | Complete authenticated Fan Club experience, backend services, content operations, content collection workflow, and design alignment. | Keep parked behind Program #1255/#1259 unless Bill/Atlas explicitly launch or reprioritize. | `#1678`; `#1685`; `#1686`–`#1694`; `docs/ops/pmo/website-completion-fan-club-product-buildout-readiness.md`; `docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md` | Priority #1 group is documented and has a parked issue chain; execution remains blocked until launch authorization. | implementation-ready after launch authorization |
| 1a | Fan Club page design | child project | Finalize authenticated Fan Club page design and member-facing flows. | Execute via Priority #1 Tasks 001, 003, 007, and 009 after launch authorization. | `docs/ops/pmo/program-3-club-home-page-design.md`; `docs/reference/design/fanclub-subpages.md`; `docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md` | Legacy `program-3-*` file is planning evidence now routed through the Priority #1 readiness package. | implementation-ready after launch authorization |
| 1b | Website backend services | child project | D1, B2, email, admin APIs/functions, media handling, join/member data, and operational failure states needed by the product buildout. | Execute gap-first via Priority #1 Tasks 002, 005, and 006. | `docs/ops/implementation-plans/website-operations-admin.md`; `docs/reference/design/LGFC-Production-Design-and-Standards.md`; `docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md` | Existing admin/content work must be reconciled first; no greenfield rebuild. | implementation-ready after launch authorization |
| 1c | Content management strategy | child project | Define how website content is posted, updated, reviewed, and managed without developer intervention. | Execute via Priority #1 Tasks 004, 005, 008, and 009. | `#1256`; `docs/ops/implementation-plans/website-content-strategy-editorial-inventory.md`; `docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md` | Includes upstream content collection handoff. | implementation-ready after launch authorization |
| 1d | Content collection strategy | child project merged into 1c | Define how Lou Gehrig content is discovered, retained, credited, reviewed, and converted into site-ready content. | Implement as upstream intake/source-credit layer within content management tasks, not as a standalone program peer. | `docs/ops/pmo/website-completion-fan-club-product-buildout-readiness.md`; `docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md` | Duplicate/version candidate with rank 12 resolved for Priority #1: subordinate to content management. | implementation-ready after launch authorization |
| 1e | Website design review / as-built versus LGFC vision | child project | Compare current implementation against approved LGFC design vision and identify gaps. | Execute as Priority #1 Task 001 and validate again in Task 009. | `docs/reference/design/LGFC-Production-Design-and-Standards.md`; `docs/reference/design/fanclub-subpages.md`; `docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md` | None identified. | implementation-ready after launch authorization |
| 2 | **Fundraiser / Charity Campaign Operations Buildout** | launch-control ready future program | Repeatable fundraiser operations, Givebutter integration boundary, leaderboard/winner rules, homepage promotion, donor recognition without PII exposure, and launch testing. | Keep queued behind Program #1255/#1259 and parked Priority #1 unless Bill/Atlas explicitly launch or reprioritize. | `#1696`; `#1700`; `#1701`–`#1708`; `#1379` (historical ideas source); `docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md`; `docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md` | Bill/Atlas identified this as the Priority #2 group. Prior backlog row "Fundraiser / charity campaign operations" merged here. | launch-control ready; blocked until queue authorization |
| 2a | Fundraiser operations playbook | child project | Repeatable annual setup, preview, launch, closeout, winner publication, and post-campaign archive. | Execute via #1701 after queue authorization. | `#1701`; `docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md`; `docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md` | None identified. | launch-control ready |
| 2b | Givebutter integration model | child project | Campaign, auction, live feed, external-link, and data-boundary rules. | Execute via #1702 after #1701. | `#1702`; `docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md`; `docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md` | External campaign/donation/campaign ownership remains outside LGFC runtime implementation. | launch-control ready |
| 2c | Leaderboard / winner system | child project | Scoring, snapshots, deterministic winner calculation, tiebreakers, and no-PII publication policy. | Execute via #1703 after #1701 and #1702. | `#1703`; `docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md`; `docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md` | Must not depend on raw public donor PII. | launch-control ready |
| 2d | Homepage spotlight / campaign surface | child project | Controlled fundraiser promotion, campaign status, approved links/embed behavior, and preview/review flows. | Execute via #1704 after #1701 and #1702. | `#1704`; `#1255`; `docs/reference/design/LGFC-Production-Design-and-Standards.md`; `docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md` | Campaign surfaces must fail closed when disabled, missing, invalid, stale, or unpublished. | launch-control ready |
| 2e | Sponsor / donor recognition | child project | Recognition rules that avoid exposing donor PII. | Execute via #1705 after #1701 through #1704. | `#1705`; `docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md`; `docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md` | Overlaps rank 15 Sponsor/donor recognition operations — merged for fundraiser context; non-fundraiser recognition may remain future scope. | launch-control ready |
| 2f | Testing package | child project | End-to-end fundraiser readiness checklist before public launch. | Execute via #1707 after #1706; close out through #1708. | `#1707`; `#1708`; `docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md`; `docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md` | None identified. | launch-control ready |
| 3 | PMO v3 authority (former `#1411` area) | governance/ops backlog | Durable PMO v3 language: program issue numbers identify programs; PMO Backlog holds ideas/project drafts. | Retain as reference; implement only if a current open source issue authorizes and scope does not conflict with active website work. | `#1411`, `docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`, `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md` | Former Program `#1411` project area — not automatically executable. | partial |
| 4 | Workflow Automation Design Migration (former `#1411` area) | governance/ops backlog | Migrate Workflow Automation design from backlog/Drive/chat into GitHub documentation authority. | Review `docs/ops/pmo/workflow-automation.md` for gaps; authorize implementation only through a current open source issue. | `#1411`, `docs/ops/pmo/workflow-automation.md` | Promoted from backlog into `#1411` planning; now inventory again. | partial |
| 5 | Cursor Continuation and Queue Contract (former `#1411` area) | governance/ops backlog | Rules for when Cursor continues, stops, reports validation, and waits at review handoff. | Align with `docs/reference/pmo/lgfc-cursor-execution-contract.md` during authorized governance work only. | `#1411`, `#1417`–`#1424` (stale task issues) | Task issues `#1417`–`#1424` contain stale PMO v2 terminology — flag for review, do not delete. | partial |
| 6 | PR Readiness and Batch Review Control (former `#1411` area) | governance/ops backlog | Ready-for-review rules that preserve Atlas/Bill review and merge authority. | Document gaps in PR governance during authorized review cycles only. | `#1411`, `docs/governance/PR_GOVERNANCE.md` | None identified. | partial |
| 7 | Merge and issue mutation policy (former `#1411` area) | governance/ops backlog | Explicit prohibition on Cursor merge, close, relabel, and issue-state changes without authorization. | Retain policy reference; no implementation from backlog placement alone. | `#1411`, `docs/reference/pmo/lgfc-cursor-execution-contract.md` | None identified. | partial |
| 8 | Queue/Wave Model and Label Planning (former `#1411` area) | governance/ops backlog | Wave labels and run identifiers as planning concepts before workflow code changes. | Review after Priority #1 readiness/launch planning only if a current source issue authorizes governance work. | `#1411`, `#1500` | `#1500` partially satisfies closeout reliability context but does not launch wave work. | partial |
| 9 | Post-Merge Closeout Evidence Stabilization (former `#1411` area) | governance/ops backlog | Closeout requires stable evidence and terminal completed-label reconciliation before mutation or queue advancement. | Treat Program `#1500` as the completed implementation cycle for closeout reliability; future work needs a new source issue. | `#1411`, `#1500` | **Partially satisfied / superseded by #1500**; retain only as future governance-maintenance inventory. | partial |
| 10 | PMO Backlog Promotion and Program `#1411` Launch Gate (former `#1411` area) | governance/ops backlog | Backlog items require owner promotion, repo authority, decomposition, and bounded handoff before becoming executable. | Use promotion checklist below in weekly PMO project review. | `#1411`, this document | `#1411` launch gate is historical; promotion rules live here and in PMO v3 operating model. | partial |
| 11 | Admin Page and Tools Design Readiness | project draft | Complete admin product/tool design, token UX, active/diagnostic/retired tool status, and backend failure-state design. | Complete inventory/readiness review before promotion. | `docs/ops/pmo/program-5-admin-page-and-tools-design-readiness.md` | **Legacy `program-5-*` filename** — PMO v2 artifact, not active Program 5 lane. | partial |
| 12 | Lou Gehrig content collection strategy | project draft | Continuous collection, source/credit tracking, review, and publication pipeline for Lou Gehrig content. | Retain as future expansion beyond Priority #1 if external monitoring, AI-assisted research, or large-scale ingestion is desired. | `#1255`, `#1256`, Priority #1 readiness package | **Partially absorbed into rank 1d** for normal editorial intake/source-credit workflow. Large-scale external collection remains future scope. | partial |
| 13 | Annual Lou Gehrig Day operations package | project draft | Repeatable annual operations checklist and website spotlight plan for Lou Gehrig Day. | Convert into ops checklist when annual operations become a priority. | `#1379` (historical) | None identified. | none |
| 14 | Media/archive acquisition workflow | project draft | Clarify relation to B2/D1 media assets, member submissions, and editorial review. | Define acquisition layer if future content work needs it. | `#1255` | None identified. | none |
| 15 | Sponsor/donor recognition operations | project draft | Donor privacy, display rules, and campaign integration outside fundraiser-specific scope. | Clarify remaining non-fundraiser scope after Priority #2 rank 2e merger. | — | **Duplicate/version candidate** with rank 2e — fundraiser-specific recognition merged into Priority #2. | none |
| 16 | Adam Wilson Award / recognition system | idea | Purpose, content model, route needs, and ownership for an Adam Wilson Award or similar recognition surface. | Clarify purpose and ownership in PMO review. | `#1379` (historical) | None identified. | none |
| 17 | Community engagement cadence | idea | Desired operating rhythm and website/community surfaces for member engagement. | Define cadence and surfaces in PMO review. | `#1379` (historical) | None identified. | none |
| 18 | Partner / Friends of the Fan Club operations | idea | Data ownership, public display rules, and outreach workflow for Friends of the Fan Club. | Define ops model; may connect to existing homepage section. | `#1255` | None identified. | none |
| 19 | AI-assisted content research pipeline | idea | Safety, sourcing, copyright, and review requirements for AI-assisted research. | Define guardrails before any promotion; must not bypass human editorial review. | `#1379` (historical) | None identified. | none |
| 20 | Member communications / newsletter | idea | Tooling, consent, data privacy, cadence, and ownership for member email communications. | Define requirements and privacy boundaries. | — | **Duplicate/version candidate** with rank 22 LGFC newsletter — review for merge. | none |
| 21 | Store / merchandise operations | idea | External Bonfire boundaries and whether any website/admin work is needed for the store. | Clarify external-store boundaries; avoid unnecessary internal store build. | — | **Duplicate/version candidate** with rank 24 LGFC store strategy — review for merge. | none |
| 22 | LGFC newsletter | idea | Newsletter product/strategy for LGFC audience beyond member-only communications. | Clarify relationship to rank 20; merge or differentiate in PMO review. | `#1379` (historical) | **Duplicate/version candidate** with rank 20 — likely PMO v2/v3 naming overlap. | none |
| 23 | Cost analysis and heat map for growth-related costs | idea | Analysis of growth-related infrastructure and operational costs. | Define scope and data sources when prioritized. | `#1379` (historical) | None identified. | none |
| 24 | LGFC monetization strategy | idea | Overall monetization approach for LGFC operations and growth. | Strategy discussion in PMO review when prioritized. | `#1379` (historical) | None identified. | none |
| 25 | LGFC store strategy | idea | Store/merchandise strategy beyond day-to-day Bonfire operations. | Clarify relationship to rank 21; merge if redundant. | `#1379` (historical) | **Duplicate/version candidate** with rank 21 — review for merge. | none |
| 26 | LGFC social media strategy | idea | Social media operating model, cadence, and website integration. | Define strategy and ownership in PMO review. | `#1379` (historical) | None identified. | none |

### Former `#1411` governance items — execution constraints

- **`#1411` remains closed.** These items are **not automatically executable.**
- They may be implemented while Website/Fundraiser projects are being prepared **only if** a current open source issue explicitly authorizes the work and the scope does **not** conflict with active website work.
- **Program `#1500` may supersede or partially satisfy** the post-merge closeout stabilization item (rank 9) and may overlap queue/wave planning (rank 8). Review required only when a later source issue authorizes governance maintenance.

### Planning-ready projects

Priority #1 is classified as **implementation-ready after launch authorization** because its readiness package, implementation plan, and parked issue chain exist in repository documentation.

Priority #2 is classified as **launch-control ready** because its readiness package, implementation plan, master program issue, child task issues, predecessor/successor chain, and Task 001 assignment guidance exist in repository documentation/GitHub issue authority.

No backlog item may execute from this classification alone. Cursor execution still requires a current program/task/source issue and explicit Bill/Atlas launch or assignment authorization.

## Weekly PMO project review

A **weekly PMO project review** is the mechanism to review backlog items, define missing details, and move items toward production-worthy documentation.

### Purpose

- Review backlog items **one by one**, starting from highest priority rank.
- Clarify intent, define missing details, and identify dependencies.
- Remove or reconcile duplicate/version artifacts identified in this document.
- Move items toward **production-worthy documentation** before any execution authorization.

### Operating rules

- **Priority order guides discussion**, but **production-ready documentation remains the execution gate.**
- Items with `implementation-ready` readiness may move first **only after** explicit Atlas/Bill authorization through a current open program or source issue.
- Items with `launch-control ready` readiness may be reviewed for launch sequencing but may not execute until a current launch source issue authorizes them.
- This backlog is reviewed and updated regularly — it is **not** a static archive.

### Meeting outputs

Each weekly review should record:

- backlog items discussed and rank adjustments;
- classification changes (idea → project draft → governance/ops backlog → planning-ready → launch-control ready → implementation-ready);
- promotion decisions and deferrals;
- required documentation PRs;
- duplicate/version artifacts identified for merge, archive, or retention;
- any new current open program or source issues created (only when explicitly authorized — not by this documentation update).

Integrate with PMO meeting issues when a full PMO meeting occurs; the weekly project review may be a focused subset or standing agenda block.

## Duplicate / version-reference review note

Some backlog duplication appears caused by the **PMO v2 / PMO v3 transition** and older issue/document naming. **Do not delete historical references without a specific review.**

Future PMO review should identify:

| Review category | Examples in current inventory |
| --- | --- |
| True duplicates to merge | sponsor/donor recognition (rank 2e vs. 15); member newsletter (rank 20 vs. 22); store operations (rank 21 vs. 25) |
| Historical evidence to keep | `#1379`, `#1411` planning artifacts, `program-3-*` / `program-5-*` legacy filenames, task issues `#1417`–`#1424` |
| Obsolete references to archive | Stale PMO v2 Program 1–5 lane labels in child task issues (review only — do not mutate issues from backlog doc updates) |
| Items superseded by `#1500` | Post-merge closeout evidence stabilization (rank 9); queue/wave model (rank 8) only to the extent documented by Program #1500 closeout evidence |
| Items promoted into future programs | Website Completion (rank 1) is parked and implementation-ready-after-launch; Fundraiser Buildout (rank 2) is launch-control ready and queued behind active/higher-priority programs |

## PMO v3 execution rule (non-negotiable)

- **PMO Backlog is documentation-owned.**
- **Backlog placement does not authorize Cursor or Codex implementation.**
- Work becomes executable only through a **current open program/task/source issue** with explicit launch/assignment authorization.

## Backlog history

| Date | Event |
| --- | --- |
| 2026-06-09 | PMO v3 migration: former Program 5 replaced by PMO Backlog. Fixed Program 1–5 nomenclature retired for future PMO operation. Program issue numbers become program identifiers. Backlog remains documentation-owned and does not require a standing issue. Former Program 1 is now Program `#1411`. Program `#1255` remains active and retains historical Program 2 continuity. |
| 2026-06-11 | Bill/Atlas PMO v3 priority review: `#1411` closed — former project areas moved to governance/ops backlog inventory. Backlog converted to prioritized working list. Website Completion / Fan Club Product Buildout and Fundraiser / Charity Campaign Operations Buildout documented as high-priority future program draft candidates. Weekly PMO project review added. Program `#1500` noted as current stabilization preparation track. |
| 2026-06-16 | Priority #1 readiness package created under #1678. Website Completion / Fan Club Product Buildout is documented as the next-program candidate for Cursor assignment after explicit Bill/Atlas launch authorization. Content collection rank 1d is subordinated to content management strategy for normal editorial intake/source-credit workflow. |
| 2026-06-17 | Priority #2 readiness package created under #1696. Fundraiser / Charity Campaign Operations Buildout is documented as planning-ready for later launch review, with Givebutter boundary rules, donor privacy controls, campaign-surface fail-closed expectations, and pre-launch testing requirements. |
| 2026-06-17 | Priority #2 launch-control layer created as #1700 with child task issues #1701 through #1708 and Task 001 assignment guidance on #1701. |

## Recently promoted (historical)

| Item | Promotion target | Notes |
| --- | --- | --- |
| Workflow Automation | Program `#1411` — PMO Automation and Agent Workflow Control | Promoted through `#1411` planning cycle. `#1411` is now closed; workflow automation areas return to backlog inventory (rank 4) unless relaunched through a current open source issue. |
| Website Completion / Fan Club Product Buildout | Priority #1 next-program candidate | Promoted from project draft to implementation-ready-after-launch documentation package by #1678; parked as #1685/#1686–#1694 pending launch authorization. |
| Fundraiser / Charity Campaign Operations Buildout | Priority #2 future-program candidate | Promoted from project draft to planning-ready documentation package by #1696; launch-control layer created as #1700/#1701–#1708; remains queued until Bill/Atlas launch authorization. |

## Promotion checklist

Before an item leaves the PMO Backlog for execution:

1. Bill or owner approves promotion review during a PMO meeting, weekly project review, or explicit Bill/Atlas review.
2. Atlas writes or identifies a repository design/readiness source with **production-ready documentation**.
3. The item is classified as project, task, or deferred idea.
4. Dependencies and non-interference risks are documented.
5. The item is prioritized against current program issues.
6. A program issue is created or updated if the work becomes a program.
7. project/task issues are created if executable.
8. A source issue and implementation plan are created or authorized.
9. Cursor or Codex receives only bounded issue-level implementation instructions.
