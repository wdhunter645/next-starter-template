---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO program issue registry, current program issue assignments, launch-state control, child-project mapping, and authoritative execution chain for LGFC orchestrated work
Does Not Own: PMO v3 top-level policy, implementation plan task definitions, workflow code, runtime behavior, product design, or unauthorized GitHub issue changes
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1411, #1379, #1255, #1259, #1500, #1678, #1685, #1696, #1700, #1713, #1719, #1736, #1738, #1739, #1740, #1741, #1742, #1743, #1744, #1745, #1746
Last Reviewed: 2026-06-17
---

# PMO Program Issue Registry

## Purpose

Record current PMO program issues and their status under PMO v3.

This registry is subordinate to `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`. If this registry conflicts with the PMO v3 operating model, the PMO v3 operating model controls.

## Scope

This registry records current program issue assignments, launch-state control,
child-project mapping, and the PMO execution chain. It does not own PMO v3
top-level policy, task-level implementation detail, workflow code, or
unauthorized GitHub issue changes.

## Current known truth

- Program #1255 is the active execution program. Cursor owns completion of its remaining work.
- Child project #1259 is open; Phase 4 Tasks 001–009 are complete on `main`; issue remains open pending Program #1255 terminal closeout.
- issue #1500 (CI Post-Merge Closeout Reliability) is **closed complete**.
- Priority #1 Website Completion / Fan Club Product Buildout is parked as program issue #1685 with child issues #1686 through #1694; it remains blocked until Atlas/Bill explicitly launch or reprioritize it.
- Priority #2 Fundraiser / Charity Campaign Operations Buildout has program issue #1700 with child task issues #1701 through #1708. Task 001 assignment guidance is posted on #1701. The program remains queued behind Program #1255/#1259 and parked Priority #1 unless Bill/Atlas explicitly reprioritize.
- Priority #3 PMO Governance / Workflow Automation Completion has program issue #1719 with child issues #1720 through #1727. PMO sync PR #1733 is currently draft/blocked and must not be treated as ready until review/CI are clean.
- Priority #4 Lou Gehrig Content Collection / Research Pipeline Expansion has program issue #1738 with child issues #1739 through #1746. It remains blocked from execution until explicit queue authorization.
- issue #1696 completed the Priority #2 documentation package and is historical source evidence after merge of #1697.
- issue #1713 completed the Priority #3 planning documentation.
- issue #1736 is the Priority #4 planning/source issue.
- issue #1411 is completed — a planning/control artifact, not an open blocked program.
- GitHub issue titles use `Program: <name>`. Documentation references use `Program #<issue-number> — <name>`.

## Intended final state

- One authoritative row per active, staged, blocked, completed, or historical program issue with non-contradictory status language.
- Child projects under each program are clearly subordinate to their umbrella program issue.
- Priority #1 can be launched as a PMO v3 program when Bill/Atlas explicitly authorize it and update the parked program issue state.
- Priority #2 is ready for launch review because the master program issue, child task issues, predecessor/successor chain, and Task 001 assignment guidance exist.
- Priority #3 can become launch-control ready after its planning package is merged and Bill/Atlas explicitly authorize master/child issue creation.
- Priority #4 can become launch-control ready after its planning package merges and Bill/Atlas explicitly authorize queue continuation.

Program issue numbers identify programs going forward. Future programs should use
`Program #<issue-number> — <name>` in documentation. GitHub issue titles use
`Program: <name>` when possible. No future Program 3 / Program 4 / Program 5
labels should be introduced as PMO operating identifiers.

## Required First Statement for Planning Programs

Every program planning package must begin with a launch-state control statement.

Required language:

> This program is BLOCKED from execution until Atlas/Bill explicitly launch it. Planning, review, and documentation discussion may continue, but Cursor may not execute implementation work from this program until Bill/Atlas explicitly launch it.

Required implications:

- A planning issue does not launch a program.
- A planning PR does not launch a program.
- A ready-for-review planning PR does not launch a program.
- A merged planning PR does not automatically launch a program.
- Launch requires an explicit Atlas/Bill launch comment or source issue update.
- Cursor must treat pre-launch program issues as planning/reference only.
- Child implementation issues must not be created or activated until launch approval.

## PMO Execution Chain

The authoritative chain under PMO v3 is:

```text
PMO meeting issue → PMO Backlog review/update → program issue → project / task issue → PR → verification → closeout
```

## Current active program issues

| Program issue | Name | Historical label | Status | Notes |
| --- | --- | --- | --- | --- |
| #1255 | Website Implementation and Content Operations | Program 2 | Active | Cursor owns completion of remaining work |

### Program #1255 child projects

| Child project | Status | Notes |
| --- | --- | --- |
| #1256 Content Strategy / Editorial Inventory | **Closed complete** | Tasks 001–009 merged and verified |
| #1258 Website Operations Admin | **Closed complete** | Phase 4 Tasks 001–013; terminal PR `#1652` |
| #1259 Website QA / Production Validation | **Active — Phase 4 complete** | Tasks 001–009 complete; keep issue open for `#1255` closeout |

## Proposed / future program issues

Future programs are created as GitHub program issues when Atlas/Bill approve a new body of work. Each receives a program issue number as its durable identifier. There is no fixed program count or lane cap.

| Candidate | Backlog rank | Status | Launch rule | Planning package | Implementation plan |
| --- | ---: | --- | --- | --- | --- |
| Website Completion / Fan Club Product Buildout | 1 | Parked; implementation-ready after launch authorization | Blocked until Atlas/Bill explicitly launch or reprioritize the parked program issue #1685 | `docs/ops/pmo/website-completion-fan-club-product-buildout-readiness.md` | `docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md` |
| Fundraiser / Charity Campaign Operations Buildout | 2 | Launch-control ready; queued behind active/parked higher-priority programs | Blocked until Atlas/Bill explicitly authorize Cursor to begin #1701 | `docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md` | `docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md` |
| PMO Governance / Workflow Automation Completion | 3 | Launch-control issues created; docs sync pending in draft #1733 | Blocked until docs sync is clean and Atlas/Bill authorize Cursor to begin #1720 | `docs/ops/pmo/pmo-governance-workflow-automation-completion-readiness.md` | `docs/ops/implementation-plans/pmo-governance-workflow-automation-completion.md` |
| Lou Gehrig Content Collection / Research Pipeline Expansion | 4 | Launch-control ready / queued after this package merges | Blocked until Atlas/Bill authorize Cursor to begin #1739 | `docs/ops/pmo/lou-gehrig-content-collection-expansion-readiness.md` | `docs/ops/implementation-plans/lou-gehrig-content-collection-expansion.md` |

### Priority #1 candidate child projects

| Child project | PMO decision | Implementation-plan coverage |
| --- | --- | --- |
| Fan Club page design | Included in Priority #1 | Tasks 001, 003, 007, 009 |
| Website backend services | Included in Priority #1; reconcile before building | Tasks 001, 002, 005, 006 |
| Content management strategy | Included in Priority #1 | Tasks 004, 005, 008, 009 |
| Content collection strategy | Subordinated to content management as intake/source-credit workflow | Tasks 004, 005, 008 |
| Website design review / as-built versus LGFC vision | First guardrail task | Tasks 001 and 009 |

### Priority #2 candidate child projects

| Child project | PMO decision | Implementation-plan coverage | Issue |
| --- | --- | --- | --- |
| Fundraiser operations playbook | Included in Priority #2 | Tasks 001, 007, 008 | #1701 |
| Givebutter integration model | Included in Priority #2; external/vendor configuration remains out of scope | Tasks 002, 004, 006, 007 | #1702 |
| Leaderboard / winner system | Included in Priority #2; deterministic and privacy-safe | Tasks 003, 006, 007 | #1703 |
| Homepage spotlight / campaign surface | Included in Priority #2; must fail closed | Tasks 004, 006, 007 | #1704 |
| Sponsor / donor recognition | Included in Priority #2; merges rank 15 duplicate/version scope for fundraiser context | Tasks 005, 006, 007 | #1705 |
| Website-side campaign configuration and display implementation | Included in Priority #2 after Tasks 002–005 | Task 006 | #1706 |
| Testing package | Required before launch | Tasks 007 and 008 | #1707 |
| Program closeout and operator handoff | Terminal closeout | Task 008 | #1708 |

### Priority #3 candidate child projects

| Child project | PMO decision | Implementation-plan coverage |
| --- | --- | --- |
| PMO v3 authority | Included in Priority #3 | Tasks 001 and 008 |
| Workflow Automation Design Migration | Included in Priority #3 | Tasks 002, 007, 008 |
| Cursor Continuation and Queue Contract | Included in Priority #3 | Tasks 003, 007, 008 |
| PR Readiness and Batch Review Control | Included in Priority #3 | Tasks 004, 007, 008 |
| Merge and issue change policy | Included in Priority #3 | Tasks 004, 005, 007, 008 |
| Queue/Wave Model and Label Planning | Included in Priority #3; reconcile against #1500 first | Tasks 006, 007, 008 |
| Post-Merge Closeout Evidence Stabilization | Included in Priority #3 only for remaining gaps after #1500 | Tasks 006, 007, 008 |
| PMO Backlog Promotion and Program #1411 Launch Gate | Included in Priority #3 | Tasks 001, 007, 008 |

### Priority #4 child issue chain

| Task | Issue | Title | Predecessor | Successor |
| ---: | ---: | --- | --- | --- |
| 001 | #1739 | Source discovery and intake inventory | #1738 launch authorization | #1740 |
| 002 | #1740 | Research queue and triage workflow | #1739 | #1741 |
| 003 | #1741 | Source credit and provenance model | #1739 and #1740 | #1742 |
| 004 | #1742 | Rights copyright privacy and publication review model | #1741 | #1743 |
| 005 | #1743 | Editorial conversion and website-ready content workflow | #1740 through #1742 | #1744 |
| 006 | #1744 | Admin and data-surface boundary review | #1739 through #1743 | #1745 |
| 007 | #1745 | AI-assisted research guardrails and automation candidate review | #1739 through #1744 | #1746 |
| 008 | #1746 | Program validation and operator handoff | #1739 through #1745 | terminal |

## Project 11 — Admin Page and Tools Design Readiness

Project 11 is an admin/tools review and design-readiness audit. It should inventory the existing admin page and tools, reconcile what Program #1255/#1258 already built, classify active/diagnostic/retired tools, identify token UX and failure-state gaps, and produce a PMO v3 readiness package before any admin implementation work.

Project 11 remains ahead of Priority #4 in backlog order, but Priority #4 may be launch-control ready while still blocked behind higher-priority queue decisions.

## Staged / blocked program issues

| Program issue | Name | Historical label | Status | Launch rule |
| --- | --- | --- | --- | --- |
| #1411 | PMO Automation and Agent Workflow Control | Program 1 | Completed planning artifact (issue closed, status:complete) | issue #1411 is not an open blocked program. New execution requires a current open source issue. PMO automation execution remains blocked until Atlas/Bill explicitly launch a new cycle. |
| #1685 | Website Completion / Fan Club Product Buildout | none | Parked future program issue | Remains blocked until Atlas/Bill explicitly authorize launch or reprioritization. |
| #1696 | Fundraiser / Charity Campaign Operations Buildout documentation package | none | Completed planning source issue | Planning documentation completed by #1697; does not itself launch implementation. |
| #1700 | Fundraiser / Charity Campaign Operations Buildout | none | Launch-control ready | Child issues #1701–#1708 exist; Task 001 assignment guidance is posted on #1701; execution waits for explicit queue authorization. |
| #1713 | PMO Governance / Workflow Automation Completion documentation package | none | Planning package source issue | Planning documentation only; does not launch implementation or create child issues. |
| #1719 | PMO Governance / Workflow Automation Completion | none | Launch-control issues created; docs sync pending | Child issues #1720–#1727 exist; execution waits for docs sync and explicit queue authorization. |
| #1738 | Lou Gehrig Content Collection / Research Pipeline Expansion | none | Launch-control ready / queued after this package merges | Child issues #1739–#1746 exist; execution waits for explicit queue authorization. |

## Historical program evidence

| Program issue | Name | Status | Notes |
| --- | --- | --- | --- |
| #1335 | Phase 1 Wrap-Up | Historical | Prior Program 1 cycle; closed historical evidence only. Not a parent issue for Program #1411. |
| #1379 | Ideas / future-projects source | Historical | Superseded by PMO Backlog documentation (`/docs/ops/pmo/pmo-backlog.md`). No standing PMO Backlog issue is required. |
| #1500 | CI Post-Merge Closeout Reliability | Closed complete | Completed implementation cycle. Future CI maintenance requires a new source issue. |

Completed program cycles remain audit evidence and may be cited for historical context. They do not automatically authorize new child issues, queue movement, or parent/child relationships for later cycles.

## PMO Backlog

| Field | Value |
| --- | --- |
| Path | `docs/ops/pmo/pmo-backlog.md` |
| Role | Ideas, project drafts, and implementation-ready projects |
| Is a program issue | No |
| Executable by itself | No |
| Review cadence | Reviewed as a primary agenda item during PMO meetings |
| Current top candidate | Website Completion / Fan Club Product Buildout remains parked; Fundraiser / Charity Campaign Operations Buildout is launch-control ready as #1700–#1708; PMO Governance / Workflow Automation Completion is launch-control ready as #1719–#1727; Lou Gehrig Content Collection / Research Pipeline Expansion is launch-control ready as #1738–#1746 after this package merges |

## Program #1411 — PMO Automation and Agent Workflow Control

| Field | Value |
| --- | --- |
| Status | **Completed planning artifact** (issue closed, `status:complete`) — not executable until a current open source issue exists and Atlas/Bill explicitly launch the next cycle |
| Source issue | `#1411` |
| Implementation plan | `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md` |
| PMO v3 authority | `docs/ops/pmo/PMO-V3-OPERATING-MODEL.md` |
| Workflow Automation authority | `docs/ops/pmo/workflow-automation.md` |
| Project slug | `program-1-pmo-automation-agent-workflow-control` |

### Program #1411 project areas

**Inventory authority:** These areas are no longer an active or automatically queued program. They live as governance/ops backlog inventory in `/docs/ops/pmo/pmo-backlog.md` and are now grouped as the Priority #3 planning package under #1713. `#1411` remains closed; execution requires a current open source issue and explicit launch authorization.

| Area | Registry decision |
| --- | --- |
| PMO v3 authority | Included in Priority #3 |
| Workflow Automation design migration | Included in Priority #3 |
| Cursor continuation and queue contract | Included in Priority #3 |
| PR readiness and batch review control | Included in Priority #3 |
| Merge and issue change policy | Included in Priority #3 |
| Queue/wave model and labels | Included in Priority #3, subject to #1500 reconciliation |
| Post-merge closeout evidence stabilization | Included in Priority #3 only for remaining gaps after #1500 |
| PMO Backlog promotion and Program #1411 launch gate | Included in Priority #3 |

### Out of scope for Program #1411 planning

- Program #1255 website/runtime implementation
- Workflow YAML changes
- D1 migrations
- Production configuration or secrets
- Unauthorized issue state changes
- Creating implementation child issues before Atlas/Bill launch approval

## Program #1255 — Website Implementation and Content Operations

| Field | Value |
| --- | --- |
| Status | **Active execution program** — Cursor owns completion of remaining work |
| Historical label | Program 2 |
| Source issue | `#1255` |
| Primary plan | `docs/how-to/website/website-implementation-and-content-operations-plan.md` |
| Ops admin plan | `docs/ops/implementation-plans/website-operations-admin.md` |
| QA plan | `docs/ops/implementation-plans/website-qa-production-validation.md` |
| Priority | Program #1255 terminal closeout after `#1259` Phase 4 completion |
| Parallel program note | `#1500` closed complete — ran in parallel with `#1255`; not a `#1259` task dependency |

Program #1255 remains controlled by its own active source issues and Cursor execution path. Priority #1, Priority #2, Priority #3, and Priority #4 planning documentation must not change Program #1255 issue state, labels, or active assignment without explicit authorization.

## Related References

- PMO v3 operating model: `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`
- PMO Backlog: `/docs/ops/pmo/pmo-backlog.md`
- Priority #1 readiness: `/docs/ops/pmo/website-completion-fan-club-product-buildout-readiness.md`
- Priority #1 implementation plan: `/docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md`
- Priority #2 readiness: `/docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md`
- Priority #2 implementation plan: `/docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md`
- Priority #2 program: `#1700`
- Priority #2 task issues: `#1701` through `#1708`
- Priority #3 readiness: `/docs/ops/pmo/pmo-governance-workflow-automation-completion-readiness.md`
- Priority #3 implementation plan: `/docs/ops/implementation-plans/pmo-governance-workflow-automation-completion.md`
- Priority #3 program: `#1719`
- Priority #3 task issues: `#1720` through `#1727`
- Priority #4 readiness: `/docs/ops/pmo/lou-gehrig-content-collection-expansion-readiness.md`
- Priority #4 implementation plan: `/docs/ops/implementation-plans/lou-gehrig-content-collection-expansion.md`
- Priority #4 program: `#1738`
- Priority #4 task issues: `#1739` through `#1746`
- Cursor execution contract: `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
- PMO critical path: `/docs/ops/pmo/critical-path.md`
- Workflow Automation authority: `/docs/ops/pmo/workflow-automation.md`
