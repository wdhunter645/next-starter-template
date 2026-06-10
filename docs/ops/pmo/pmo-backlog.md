---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO Backlog inventory for ideas, project drafts, implementation-ready projects, backlog review history, and promotion candidates
Does Not Own: Program launch approval, final prioritization, implementation scope, issue creation, merge authority, or Cursor execution authorization
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1379, #1411, #1255, #1501, #1500
Last Reviewed: 2026-06-10
---

# PMO Backlog

PMO Backlog = ideas, project drafts, and implementation-ready projects.

This document is the durable inventory for PMO Backlog review. It does not launch work, create issues, authorize Cursor execution, or establish final priority. Work becomes executable only through a program issue or task source issue with explicit authorization.

## Scope

This document owns PMO Backlog inventory tables, promotion history, and meeting
agenda integration. It does not own program launch approval, merge authority,
issue creation, or Cursor execution authorization.

## Current known truth

- PMO Backlog is documentation-owned. Legacy `#1379` is historical source evidence
  only.
- Filenames that still contain `program-5` (for example
  `docs/ops/pmo/program-5-admin-page-and-tools-design-readiness.md`) are **legacy
  source material** from the retired PMO v2 five-lane model. They are not active
  PMO v3 program authority and require PMO v3 conversion before promotion.
- Issue #1500 is the next prioritized program after Program #1255 completes. It is
  excluded from immediate execution.

## Intended final state

- Backlog items are classified as ideas, project drafts, or implementation-ready
  projects with explicit promotion history.
- No backlog link can be mistaken for an active PMO v3 program lane.

## Current backlog status

The PMO Backlog is documentation-owned. It is reviewed in every PMO meeting. Legacy `#1379` is historical ideas/future-projects source evidence only and is superseded by this document.

## Implementation-ready projects

No items are currently classified as implementation-ready. Items below marked as project drafts require readiness review before promotion.

## Project drafts

| Item | Suggested next action | Notes |
| --- | --- | --- |
| Admin Page and Tools Design Readiness | Complete inventory/readiness review before promotion | Existing access model exists, but complete admin product/tool design, token UX, active/diagnostic/retired tool status, and backend failure-state design need documentation. **Legacy source (PMO v2):** `docs/ops/pmo/program-5-admin-page-and-tools-design-readiness.md` — requires PMO v3 conversion before promotion; not an active Program 5 lane. |
| Fundraiser / charity campaign operations | Readiness review required | Includes repeatable campaign setup, Givebutter process, auction handling, leaderboard/winner rules, and annual timeline. Classify as project draft until readiness review confirms implementation-ready status. |
| Lou Gehrig content collection strategy | Confirm relationship to active Program #1255 and later content/growth program work | Continuous collection, source/credit tracking, review, and publication pipeline. |
| Annual Lou Gehrig Day operations package | Convert into repeatable operations checklist and website spotlight plan | Candidate for a future program when annual operations become a priority. |
| Media/archive acquisition workflow | Clarify relation to B2/D1 media assets, member submissions, and editorial review | Candidate if Program #1255 content system needs an acquisition layer. |
| Sponsor/donor recognition operations | Clarify donor privacy, display rules, and campaign integration | Must avoid exposing donor PII. |

## Ideas

| Item | Suggested next action | Notes |
| --- | --- | --- |
| Adam Wilson Award / recognition system | Clarify purpose, content model, route needs, and ownership | Could become part of recognition/honor project group. |
| Community engagement cadence | Define desired operating rhythm and website/community surfaces | Member prompts, discussion cadence, social/community operations. |
| Partner / Friends of the Fan Club operations | Define data ownership, public display rules, and outreach workflow | Could connect to existing Friends of the Fan Club homepage section. |
| AI-assisted content research pipeline | Define safety, sourcing, copyright, and review requirements before promotion | Should not bypass human editorial review. |
| Member communications / newsletter | Define tooling, consent, data privacy, cadence, and ownership | Requires careful email/opt-in handling. |
| Store / merchandise operations | Clarify external Bonfire boundaries and whether any website/admin work is needed | Current store is external; avoid unnecessary internal store build. |

## Recently promoted

| Item | Promotion target | Notes |
| --- | --- | --- |
| Workflow Automation | Program #1411 — PMO Automation and Agent Workflow Control | Promoted from backlog into staged/blocked Program #1411 through `#1411`. No longer an active backlog item unless a new follow-up is identified. |

## Backlog history

| Date | Event |
| --- | --- |
| 2026-06-09 | PMO v3 migration: former Program 5 replaced by PMO Backlog. Fixed Program 1–5 nomenclature retired for future PMO operation. Program issue numbers become program identifiers. Backlog remains documentation-owned and does not require a standing issue. Former Program 1 is now Program #1411. Program #1255 remains active and retains historical Program 2 continuity. |

## PMO meeting agenda integration

Every PMO meeting issue should include PMO Backlog review as a primary agenda item. The meeting issue should record:

- backlog items discussed;
- classification changes (idea → project draft → implementation-ready);
- promotion decisions;
- PMO Backlog sections updated;
- resulting program/project/task issues or documentation PRs.

## Promotion checklist

Before an item leaves the PMO Backlog:

1. Bill or owner approves promotion review during a PMO meeting or explicit Bill/Atlas review.
2. Atlas writes or identifies a repository design/readiness source.
3. The item is classified as project, task, or deferred idea.
4. Dependencies and non-interference risks are documented.
5. The item is prioritized against current program issues.
6. A program issue is created or updated if the work becomes a program.
7. Project/task issues are created if executable.
8. A source issue and implementation plan are created or authorized.
9. Cursor receives only bounded issue-level implementation instructions.
