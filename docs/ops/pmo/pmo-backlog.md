---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO Backlog inventory for ideas, project drafts, implementation-ready projects, backlog review history, and promotion candidates
Does Not Own: Program launch approval, final prioritization, implementation scope, issue creation, merge authority, or Cursor execution authorization
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1379, #1411, #1255, #1500, #1501
Last Reviewed: 2026-06-11
---

# PMO Backlog

PMO Backlog = ideas, project drafts, governance/ops backlog items, and implementation-ready projects.

This document is the durable, **prioritized working inventory** for PMO backlog review. It does not launch work, create issues, authorize Cursor or Codex execution, or establish final execution authorization by itself. Work becomes executable only through a **current open program issue or task/source issue** with explicit launch/assignment authorization.

## Scope

This document owns PMO Backlog inventory, promotion history, weekly project review integration, and duplicate/version-reference flags. It does not own program launch approval, merge authority, issue creation, or Cursor execution authorization.

## Current known truth

- **PMO Backlog is documentation-owned.** Backlog placement does not authorize Cursor or Codex implementation.
- **Legacy `#1379`** is historical source evidence only. It is superseded by this document.
- **issue `#1411` is closed** and served its planning/control purpose as a completed planning artifact (`status:complete`). It is not an open or automatically queued program.
- **Former `#1411` work areas** now belong in this backlog inventory as governance/ops backlog items unless later relaunched through a current open PMO v3 program or source issue.
- **Program `#1255`** remains the active website implementation program.
- **Program `#1500`** is the current operational stabilization candidate and preparation track for CI/orchestration closeout stabilization. It may be assigned to Codex for implementation. It is not authorized by this backlog document.
- **The backlog does not authorize implementation by itself.** Production-ready documentation remains the execution gate: projects with production-ready docs can move first once explicitly authorized.
- Filenames that still contain `program-5` (for example `docs/ops/pmo/program-5-admin-page-and-tools-design-readiness.md`) are **legacy source material** from the retired PMO v2 five-lane model. They are not active PMO v3 program authority and require PMO v3 conversion before promotion.

## Intended final state

- Backlog items are classified, prioritized top-down by current need, and tracked with production-documentation readiness.
- No backlog link can be mistaken for an active PMO v3 program lane or automatic execution queue.
- Weekly PMO project review keeps the backlog current rather than static.

## Prioritized working backlog inventory

Items are sorted **top-down by current priority need** as of the Bill/Atlas PMO v3 review (2026-06-11). Priority guides discussion and preparation order; **production-ready documentation remains the gate for execution.**

| Rank | project / idea name | Classification | Brief description | Suggested next action | Related references | Duplicate / version note | Production doc readiness |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **Website Completion / Fan Club Product Buildout** | project draft | High-priority future program candidate: complete authenticated Fan Club experience, backend services, content operations, and design alignment after Program `#1255` / `#1500`. Requires production-ready documentation before launch. | Draft program scope, child projects, and production-ready docs in weekly PMO project review; do not launch until authorized. | `#1255`, `#1258`, `#1259`; `docs/how-to/website/website-implementation-and-content-operations-plan.md` | Bill/Atlas agree this is likely the first major program after `#1255` / `#1500`. | partial |
| 1a | Fan Club page design | project draft (child) | Finalize authenticated Fan Club page design and member-facing flows. | Complete design/readiness review against LGFC production design standards. | `#1255`, `#1258`; `docs/ops/pmo/program-3-club-home-page-design.md` (legacy filename — PMO v2 artifact) | Legacy `program-3-*` filename is not PMO v3 program authority. | partial |
| 1b | Website backend services | project draft (child) | D1, B2, email, admin APIs/functions, media handling, join/member data, and operational failure states. | Document service boundaries, failure states, and dependencies against current `#1258` planning. | `#1255`, `#1258`; `docs/ops/implementation-plans/website-operations-admin.md` | Overlaps active `#1258` scope — coordinate, do not duplicate execution. | partial |
| 1c | Content management strategy | project draft (child) | Define how website content is posted, updated, reviewed, and managed without developer intervention. | Produce CMS/ops workflow documentation for PMO review. | `#1255`, `#1256` (closed complete) | Related to Lou Gehrig content collection strategy (rank 12) — review for merge vs. parent/child relationship. | partial |
| 1d | Content collection strategy | project draft (child) | Define how Lou Gehrig content is discovered, retained, credited, reviewed, and converted into site-ready content. | Clarify editorial pipeline, source/credit rules, and handoff to CMS strategy. | `#1255`, `#1256` | Duplicate/version candidate with rank 12 — see duplicate review note below. | partial |
| 1e | Website design review / as-built versus LGFC vision | project draft (child) | Compare current implementation against approved LGFC design vision and identify gaps. | Schedule design gap review after `#1258` / `#1259` milestones. | `docs/reference/design/LGFC-Production-Design-and-Standards.md` | None identified. | partial |
| 2 | **Fundraiser / Charity Campaign Operations Buildout** | project draft | High-priority future program candidate: repeatable fundraiser operations, Givebutter integration, leaderboard/winner rules, homepage promotion, donor recognition without PII exposure, and launch testing. Requires production-ready documentation before launch. | Draft program scope and production-ready ops documentation in weekly PMO project review; do not launch until authorized. | `#1379` (historical ideas source) | Bill/Atlas agree this is likely the second major program after `#1255` / `#1500`. Prior backlog row "Fundraiser / charity campaign operations" merged here. | partial |
| 2a | Fundraiser operations playbook | project draft (child) | Repeatable annual setup, launch, closeout, winner publication, and post-campaign archive. | Write annual operations checklist and ownership model. | `#1379` (historical) | None identified. | none |
| 2b | Givebutter integration model | project draft (child) | Campaign, auction, live feed, external-link, and data-boundary rules. | Document integration boundaries and external vs. internal data ownership. | — | None identified. | none |
| 2c | Leaderboard / winner system | project draft (child) | Scoring, snapshots, deterministic winner calculation, and no-PII policy. | Define scoring rules, snapshot cadence, and winner publication workflow. | — | None identified. | none |
| 2d | Homepage spotlight / campaign surface | project draft (child) | Controlled fundraiser promotion and review/preview flows. | Define homepage promotion rules and preview/review gates. | `#1255` | None identified. | none |
| 2e | Sponsor / donor recognition | project draft (child) | Recognition rules that avoid exposing donor PII. | Document display rules and privacy boundaries. | — | Overlaps rank 15 Sponsor/donor recognition operations — review for merge. | none |
| 2f | Testing package | project draft (child) | End-to-end fundraiser readiness checklist before public launch. | Draft pre-launch verification checklist aligned with LGFC closeout practice. | — | None identified. | none |
| 3 | PMO v3 authority (former `#1411` area) | governance/ops backlog | Durable PMO v3 language: program issue numbers identify programs; PMO Backlog holds ideas/project drafts. | Retain as reference; implement only if a current open source issue authorizes and scope does not conflict with `#1255` or `#1500`. | `#1411`, `docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`, `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md` | Former Program `#1411` project area — not automatically executable. | partial |
| 4 | Workflow Automation Design Migration (former `#1411` area) | governance/ops backlog | Migrate Workflow Automation design from backlog/Drive/chat into GitHub documentation authority. | Review `docs/ops/pmo/workflow-automation.md` for gaps; authorize implementation only through a current open source issue. | `#1411`, `docs/ops/pmo/workflow-automation.md` | Promoted from backlog into `#1411` planning; now inventory again. | partial |
| 5 | Cursor Continuation and Queue Contract (former `#1411` area) | governance/ops backlog | Rules for when Cursor continues, stops, reports validation, and waits at review handoff. | Align with `docs/reference/pmo/lgfc-cursor-execution-contract.md` during authorized governance work only. | `#1411`, `#1417`–`#1424` (stale task issues) | Task issues `#1417`–`#1424` contain stale PMO v2 terminology — flag for review, do not delete. | partial |
| 6 | PR Readiness and Batch Review Control (former `#1411` area) | governance/ops backlog | Ready-for-review rules that preserve Atlas/Bill review and merge authority. | Document gaps in PR governance during authorized review cycles only. | `#1411`, `docs/governance/PR_GOVERNANCE.md` | None identified. | partial |
| 7 | Merge and issue mutation policy (former `#1411` area) | governance/ops backlog | Explicit prohibition on Cursor merge, close, relabel, and issue-state changes without authorization. | Retain policy reference; no implementation from backlog placement alone. | `#1411`, `docs/reference/pmo/lgfc-cursor-execution-contract.md` | None identified. | partial |
| 8 | Queue/Wave Model and Label Planning (former `#1411` area) | governance/ops backlog | Wave labels and run identifiers as planning concepts before workflow code changes. | Review against `#1500` scope after `#1500` completes. | `#1411`, `#1500` | `#1500` may partially satisfy queue/orchestration planning — needs review after `#1500` completes. | partial |
| 9 | Post-Merge Closeout Evidence Stabilization (former `#1411` area) | governance/ops backlog | Closeout requires stable evidence and terminal completed-label reconciliation before mutation or queue advancement. | Review overlap with `#1500` CI/orchestration closeout stabilization after `#1500` completes. | `#1411`, `#1500` | **`#1500` may supersede or partially satisfy this item** — explicit review required after `#1500` completes. | partial |
| 10 | PMO Backlog Promotion and Program `#1411` Launch Gate (former `#1411` area) | governance/ops backlog | Backlog items require owner promotion, repo authority, decomposition, and bounded handoff before becoming executable. | Use promotion checklist below in weekly PMO project review. | `#1411`, this document | `#1411` launch gate is historical; promotion rules live here and in PMO v3 operating model. | partial |
| 11 | Admin Page and Tools Design Readiness | project draft | Complete admin product/tool design, token UX, active/diagnostic/retired tool status, and backend failure-state design. | Complete inventory/readiness review before promotion. | `docs/ops/pmo/program-5-admin-page-and-tools-design-readiness.md` | **Legacy `program-5-*` filename** — PMO v2 artifact, not active Program 5 lane. | partial |
| 12 | Lou Gehrig content collection strategy | project draft | Continuous collection, source/credit tracking, review, and publication pipeline for Lou Gehrig content. | Confirm relationship to rank 1d (Website Completion child) and active `#1255` work; merge or subordinate in review. | `#1255`, `#1256` | **Duplicate/version candidate** with rank 1d — PMO review should decide parent/child vs. standalone. | partial |
| 13 | Annual Lou Gehrig Day operations package | project draft | Repeatable annual operations checklist and website spotlight plan for Lou Gehrig Day. | Convert into ops checklist when annual operations become a priority. | `#1379` (historical) | None identified. | none |
| 14 | Media/archive acquisition workflow | project draft | Clarify relation to B2/D1 media assets, member submissions, and editorial review. | Define acquisition layer if `#1255` content system needs it. | `#1255` | None identified. | none |
| 15 | Sponsor/donor recognition operations | project draft | Donor privacy, display rules, and campaign integration outside fundraiser-specific scope. | Clarify scope vs. rank 2e; merge if redundant. | — | **Duplicate/version candidate** with rank 2e — review for merge. | none |
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
- They may be implemented while Website/Fundraiser projects are being prepared **only if** a current open source issue explicitly authorizes the work and the scope does **not** conflict with active Program `#1255` or Program `#1500`.
- **Program `#1500` may supersede or partially satisfy** the post-merge closeout stabilization item (rank 9) and may overlap queue/wave planning (rank 8). Review required after `#1500` completes.

### Implementation-ready projects

No items are currently classified as **implementation-ready**. Nothing in this inventory authorizes execution without a current open program or source issue and explicit launch/assignment authorization.

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
- This backlog is reviewed and updated regularly — it is **not** a static archive.

### Meeting outputs

Each weekly review should record:

- backlog items discussed and rank adjustments;
- classification changes (idea → project draft → governance/ops backlog → implementation-ready);
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
| True duplicates to merge | Lou Gehrig content collection (rank 1d vs. 12); sponsor/donor recognition (rank 2e vs. 15); member newsletter (rank 20 vs. 22); store operations (rank 21 vs. 25) |
| Historical evidence to keep | `#1379`, `#1411` planning artifacts, `program-3-*` / `program-5-*` legacy filenames, task issues `#1417`–`#1424` |
| Obsolete references to archive | Stale PMO v2 Program 1–5 lane labels in child task issues (review only — do not mutate issues from backlog doc updates) |
| Items superseded by `#1500` | Post-merge closeout evidence stabilization (rank 9); queue/wave model (rank 8) — confirm after `#1500` completes |
| Items promoted into future programs | Website Completion (rank 1) and Fundraiser Buildout (rank 2) when authorized as program issues |

## PMO v3 execution rule (non-negotiable)

- **PMO Backlog is documentation-owned.**
- **Backlog placement does not authorize Cursor or Codex implementation.**
- Work becomes executable only through a **current open program/task/source issue** with explicit launch/assignment authorization.

## Backlog history

| Date | Event |
| --- | --- |
| 2026-06-09 | PMO v3 migration: former Program 5 replaced by PMO Backlog. Fixed Program 1–5 nomenclature retired for future PMO operation. Program issue numbers become program identifiers. Backlog remains documentation-owned and does not require a standing issue. Former Program 1 is now Program `#1411`. Program `#1255` remains active and retains historical Program 2 continuity. |
| 2026-06-11 | Bill/Atlas PMO v3 priority review: `#1411` closed — former project areas moved to governance/ops backlog inventory. Backlog converted to prioritized working list. Website Completion / Fan Club Product Buildout and Fundraiser / Charity Campaign Operations Buildout documented as high-priority future program draft candidates. Weekly PMO project review added. Program `#1500` noted as current stabilization preparation track. |

## Recently promoted (historical)

| Item | Promotion target | Notes |
| --- | --- | --- |
| Workflow Automation | Program `#1411` — PMO Automation and Agent Workflow Control | Promoted through `#1411` planning cycle. `#1411` is now closed; workflow automation areas return to backlog inventory (rank 4) unless relaunched through a current open source issue. |

## Promotion checklist

Before an item leaves the PMO Backlog for execution:

1. Bill or owner approves promotion review during a PMO meeting, weekly project review, or explicit Bill/Atlas review.
2. Atlas writes or identifies a repository design/readiness source with **production-ready documentation**.
3. The item is classified as project, task, or deferred idea.
4. Dependencies and non-interference risks are documented (especially vs. `#1255` and `#1500`).
5. The item is prioritized against current program issues.
6. A program issue is created or updated if the work becomes a program.
7. project/task issues are created if executable.
8. A source issue and implementation plan are created or authorized.
9. Cursor or Codex receives only bounded issue-level implementation instructions.
