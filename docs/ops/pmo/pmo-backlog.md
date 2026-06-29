---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO Backlog inventory for ideas, project drafts, implementation-ready projects, backlog review history, and promotion candidates
Does Not Own: Program launch approval, final prioritization, implementation scope, issue creation, merge authority, or Cursor execution authorization
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1379, #1411, #1255, #1500, #1501, #1678, #1685, #1696, #1700, #1701, #1702, #1703, #1704, #1705, #1706, #1707, #1708, #1713, #1719, #1720, #1721, #1722, #1723, #1724, #1725, #1726, #1727, #2039, #2040, #2041, #2042, #2043, #2044, #2045, #2046, #2047, #2048
Last Reviewed: 2026-06-29
---

# PMO Backlog

PMO Backlog = ideas, project drafts, governance/ops backlog items, implementation-ready projects, and launch-control-ready program groups.

This document is the durable, **prioritized working inventory** for PMO backlog review. It does not launch work, create issues, authorize Cursor or Codex execution, or establish final execution authorization by itself. Work becomes executable only through a **current open program or task/source issue** with explicit launch/assignment authorization.

## Scope

This document owns PMO Backlog inventory, promotion history, weekly project review integration, and duplicate/version-reference flags. It does not own program launch approval, merge authority, issue creation, or Cursor execution authorization.

## Current known truth

- **PMO Backlog is documentation-owned.** Backlog placement does not authorize Cursor or Codex implementation.
- **Legacy `#1379`** is historical source evidence only. It is superseded by this document.
- **issue `#1411` is closed** and served its planning/control purpose as a completed planning artifact (`status:complete`). It is not an open or automatically queued program.
- **Former `#1411` work areas** now belong to Priority #3 program #1719 and child issue chain #1720 through #1727.
- **Program `#1255`** remains the active website implementation program owned by Cursor for completion.
- **Program `#1500` is closed complete.** It remains reconciliation evidence for Priority #3 closeout and queue/wave work, but it does not launch additional governance work by itself.
- **Priority #1 Website Completion / Fan Club Product Buildout** has a parked program issue and task chain (#1685 through #1694). It remains blocked from implementation until Bill/Atlas explicitly launch or reprioritize it.
- **Website Public Launch / Relaunch Readiness** has program issue #2039 and child issue chain #2041 through #2048. It follows Program #1685 structural baseline closeout and remains blocked until explicit Bill/Atlas task assignment.
- **Website Automatic Content Publication Capability** has program issue #2040. It is publication authority for work that Program #2039 explicitly excludes, but implementation remains separate and must be authorized through #2040 or its child issues.
- **Priority #2 Fundraiser / Charity Campaign Operations Buildout** has program issue #1700 and child issue chain #1701 through #1708. Task 001 assignment guidance is posted on #1701. It remains queued behind Program #1255/#1259 and parked Priority #1 unless Bill/Atlas explicitly reprioritize.
- **Priority #3 PMO Governance / Workflow Automation Completion** has program issue #1719 and child issue chain #1720 through #1727. Task 001 assignment guidance is posted on #1720. It remains queued behind Program #1255/#1259, parked Priority #1, and Priority #2 unless Bill/Atlas explicitly reprioritize.
- **The backlog does not authorize implementation by itself.** Production-ready documentation and launch-control issues remain execution gates: projects move only when explicitly authorized.
- Filenames that still contain `program-5` (for example `docs/ops/pmo/program-5-admin-page-and-tools-design-readiness.md`) are **legacy source material** from the retired PMO v2 five-lane model. They are not active PMO v3 program authority and require PMO v3 conversion before promotion.

## Intended final state

- Backlog items are classified, prioritized top-down by current need, and tracked with production-documentation readiness.
- No backlog link can be mistaken for an active PMO v3 program lane or automatic execution queue.
- Weekly PMO project review keeps the backlog current rather than static.
- Priority #1 remains parked until Bill/Atlas explicitly launch or reprioritize it.
- Website Public Launch / Relaunch Readiness is launch-control ready after #1685 closeout and task assignment.
- Website Automatic Content Publication Capability is registered as separate publication authority and does not execute from #2039.
- Priority #2 is launch-control ready as #1700 with child tasks #1701 through #1708, pending queue authorization.
- Priority #3 is launch-control ready as #1719 with child tasks #1720 through #1727, pending queue authorization.

## Prioritized working backlog inventory

Items are sorted **top-down by current priority need** as of the Bill/Atlas PMO v3 review and subsequent readiness updates. Priority guides discussion and preparation order; **production-ready documentation plus explicit launch authorization remain the gates for execution.**

| Rank | project / idea name | Classification | Brief description | Suggested next action | Related references | Duplicate / version note | Production doc readiness |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **Website Completion / Fan Club Product Buildout** | parked launch-control ready program | Complete authenticated Fan Club experience, backend services, content operations, content collection workflow, and design alignment. | Keep parked behind Program #1255/#1259 unless Bill/Atlas explicitly launch or reprioritize. | `#1678`; `#1685`; `#1686`–`#1694`; `docs/ops/pmo/website-completion-fan-club-product-buildout-readiness.md`; `docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md` | Priority #1 group is documented and has a parked issue chain; execution remains blocked until launch authorization. | launch-control ready; blocked until queue authorization |
| 1 successor | **Website Public Launch / Relaunch Readiness** | launch-control ready successor program | Prepare the structural website baseline for public relaunch after #1685 closeout, including public copy, admin club staging, social/media reliability, donation/fundraiser readiness, SEO/analytics, launch checklist, rollback, and evidence. | Keep blocked until #1685 closeout and explicit Bill/Atlas authorization to begin #2041. | `#2039`; `#2041`–`#2048`; `docs/ops/pmo/website-public-launch-relaunch-readiness.md`; `docs/ops/implementation-plans/website-public-launch-relaunch-readiness.md` | Successor lane to Priority #1; does not replace #1685 and does not authorize #2040 publication workflow. | launch-control ready; blocked until #1685 closeout and queue authorization |
| 1 publication | **Website Automatic Content Publication Capability** | registered publication authority | Future controlled content-publication support for approval states, admin review, staged promotion, scheduled publication, rotation, audit evidence, rollback, unpublish, and safety checks. | Keep separate from #2039; execute only through #2040 or its authorized child issues after manual workflow evidence exists. | `#2040`; `docs/ops/pmo/website-automatic-content-publication-capability.md`; `docs/ops/implementation-plans/website-automatic-content-publication-capability.md` | Publication authority for work explicitly excluded from #2039. | planning-ready; blocked until #2040 launch authorization |
| 2 | **Fundraiser / Charity Campaign Operations Buildout** | launch-control ready future program | Repeatable fundraiser operations, Givebutter integration boundary, leaderboard/winner rules, homepage promotion, donor recognition without PII exposure, and launch testing. | Keep queued behind Program #1255/#1259, parked Priority #1, and #2039 successor unless Bill/Atlas explicitly launch or reprioritize. | `#1696`; `#1700`; `#1701`–`#1708`; `#1379` (historical ideas source); `docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md`; `docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md` | Bill/Atlas identified this as the Priority #2 group. Prior backlog row "Fundraiser / charity campaign operations" merged here. | launch-control ready; blocked until queue authorization |
| 3 | **PMO Governance / Workflow Automation Completion** | launch-control ready future program | Consolidate PMO v3 authority, workflow automation design, Cursor continuation rules, PR readiness, merge/issue policy, queue/wave planning, closeout stabilization, and backlog promotion gates. | Keep queued behind Program #1255/#1259, parked Priority #1, #2039 successor, and Priority #2 unless Bill/Atlas explicitly launch or reprioritize. | `#1713`; `#1719`; `#1720`–`#1727`; `#1411`; `#1500`; `docs/ops/pmo/pmo-governance-workflow-automation-completion-readiness.md`; `docs/ops/implementation-plans/pmo-governance-workflow-automation-completion.md`; `docs/ops/reports/program-1500-queue-wave-reconciliation.md` | Groups former ranks 3–10 into one Priority #3 program candidate. #1411 historical; #1500 reconciled by #1725 (closed complete). | launch-control ready; blocked until queue authorization |
| 11 | Admin Page and Tools Design Readiness | project draft | Complete admin product/tool design, token UX, active/diagnostic/retired tool status, and backend failure-state design. | Complete inventory/readiness review before promotion. | `docs/ops/pmo/program-5-admin-page-and-tools-design-readiness.md` | **Legacy `program-5-*` filename** — PMO v2 artifact, not active Program 5 lane. | partial |
| 12 | Lou Gehrig content collection strategy | project draft | Continuous collection, source/credit tracking, review, and publication pipeline for Lou Gehrig content. | Retain as future expansion beyond Priority #1 if external monitoring, AI-assisted research, or large-scale ingestion is desired. | `#1255`, `#1256`, Priority #1 readiness package | **Partially absorbed into Priority #1 content management / content collection subordination (#1690)** for normal editorial intake/source-credit workflow. Large-scale external collection remains future scope. | partial |
| 13 | Annual Lou Gehrig Day operations package | project draft | Repeatable annual operations checklist and website spotlight plan for Lou Gehrig Day. | Convert into ops checklist when annual operations become a priority. | `#1379` (historical) | None identified. | none |
| 14 | Media/archive acquisition workflow | project draft | Clarify relation to B2/D1 media assets, member submissions, and editorial review. | Define acquisition layer if future content work needs it. | `#1255` | None identified. | none |
| 15 | Sponsor/donor recognition operations | project draft | Donor privacy, display rules, and campaign integration outside fundraiser-specific scope. | Clarify remaining non-fundraiser scope after Priority #2 sponsor/donor recognition merge (#1705). | — | **Duplicate/version candidate** with Priority #2 #1705 — fundraiser-specific recognition merged into Priority #2. | none |
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
- They may be implemented only through Priority #3 program #1719 and child issues #1720 through #1727, unless Bill/Atlas explicitly authorize another current source issue.
- **Program `#1500` is closed complete** and satisfied the post-merge closeout stabilization baseline for Priority #3 ranks 8–9. Task **#1725** recorded reconciliation evidence in `docs/ops/reports/program-1500-queue-wave-reconciliation.md`. Do not reopen #1500 or rebuild its workflow/closeout deliverables without a new CI source issue.

### Launch-control ready projects

Priority #1 is classified as **launch-control ready / parked** because its readiness package, implementation plan, master program issue, child task issues, predecessor/successor chain, and Task 001 issue exist in repository documentation and GitHub issues.

Website Public Launch / Relaunch Readiness is classified as **launch-control ready / successor** because its readiness package, implementation plan, master program issue, child task issues, predecessor/successor chain, and Task 001 issue exist in repository documentation and GitHub issues.

Website Automatic Content Publication Capability is registered as **planning-ready publication authority** because Program #2040 owns publication support excluded from Program #2039, but implementation remains blocked until explicit #2040 authorization and manual workflow evidence.

Priority #2 is classified as **launch-control ready** because its readiness package, implementation plan, master program issue, child task issues, predecessor/successor chain, and Task 001 assignment guidance exist in repository documentation and GitHub issues.

Priority #3 is classified as **launch-control ready** because its readiness package, implementation plan, master program issue, child task issues, predecessor/successor chain, and Task 001 assignment guidance exist in repository documentation and GitHub issues.

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
- Items with `implementation-ready` or `launch-control ready` readiness may move first **only after** explicit Atlas/Bill authorization through a current open program or source issue.
- Items with `planning-ready` readiness may be reviewed for launch sequencing but may not execute until a current launch source issue authorizes them.
- This backlog is reviewed and updated regularly — it is **not** a static archive.

### Meeting outputs

Each weekly review should record:

- backlog items discussed and rank adjustments;
- classification changes (idea → project draft → governance/ops backlog → planning-ready → implementation-ready → launch-control ready);
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
| True duplicates to merge | sponsor/donor recognition (Priority #2 #1705 vs. rank 15); member newsletter (rank 20 vs. 22); store operations (rank 21 vs. 25) |
| Historical evidence to keep | `#1379`, `#1411` planning artifacts, `program-3-*` / `program-5-*` legacy filenames, task issues `#1417`–`#1424` |
| Obsolete references to archive | Stale PMO v2 Program 1–5 lane labels in child task issues (review only — do not mutate issues from backlog doc updates) |
| Items superseded by `#1500` | Post-merge closeout evidence stabilization; queue/wave model only where satisfied by Program #1500 closeout |

## PMO v3 execution rule (non-negotiable)

- **PMO Backlog is documentation-owned.**
- **Backlog placement does not authorize Cursor or Codex implementation.**
- Work becomes executable only through a **current open program/task/source issue** with explicit launch/assignment authorization.

## Backlog history

| Date | Event |
| --- | --- |
| 2026-06-09 | PMO v3 migration: former Program 5 replaced by PMO Backlog. Fixed Program 1–5 nomenclature retired for future PMO operation. Program issue numbers become program identifiers. Backlog remains documentation-owned and does not require a standing issue. Former Program 1 is now Program `#1411`. Program `#1255` remains active and retains historical Program 2 continuity. |
| 2026-06-11 | Bill/Atlas PMO v3 priority review: `#1411` closed — former project areas moved to governance/ops backlog inventory. Backlog converted to prioritized working list. Website Completion / Fan Club Product Buildout and Fundraiser / Charity Campaign Operations Buildout documented as high-priority future program draft candidates. Weekly PMO project review added. Program `#1500` noted as current stabilization preparation track. |
| 2026-06-16 | Priority #1 readiness package created under #1678. Website Completion / Fan Club Product Buildout is documented as the next-program candidate for Cursor assignment after explicit Bill/Atlas launch authorization. Priority #1 content collection is subordinated to content management strategy (#1690) for normal editorial intake/source-credit workflow. |
| 2026-06-17 | Priority #2 readiness package created under #1696 and launch-control chain created as #1700–#1708. Fundraiser / Charity Campaign Operations Buildout is documented as launch-control ready, pending queue authorization. Priority #3 readiness package was created under #1713 and launch-control chain was created as #1719–#1727. PMO Governance / Workflow Automation Completion is documented as launch-control ready, pending queue authorization. |
| 2026-06-29 | Website Public Launch / Relaunch Readiness registered as Program #2039 with child issues #2041–#2048. Website Automatic Content Publication Capability registered as separate Program #2040 publication authority and remains outside #2039 implementation scope. |

## Recently promoted (historical)

| Item | Promotion target | Notes |
| --- | --- | --- |
| Workflow Automation | Program `#1411` — PMO Automation and Agent Workflow Control | Promoted through `#1411` planning cycle. `#1411` is now closed; workflow automation areas are now routed through Priority #3 unless relaunched through another current source issue. |
| Website Completion / Fan Club Product Buildout | Priority #1 next-program candidate | Promoted from project draft to launch-control-ready parked program by #1678 and #1685–#1694. |
| Website Public Launch / Relaunch Readiness | Program `#2039` — launch-control-ready successor | Promoted as the public relaunch successor after #1685 closeout, with child issues #2041–#2048. |
| Website Automatic Content Publication Capability | Program `#2040` — publication authority | Registered as separate planning-ready publication authority excluded from #2039 implementation scope. |
| Fundraiser / Charity Campaign Operations Buildout | Priority #2 future-program candidate | Promoted from project draft to launch-control ready program #1700 by #1696/#1697 and #1709. |
| PMO Governance / Workflow Automation Completion | Priority #3 future-program candidate | Promoted from partial governance/ops backlog group to launch-control ready program #1719 by #1713/#1714 and #1719–#1727. |

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
