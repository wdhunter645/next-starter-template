---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO program issue registry, current program issue assignments, launch-state control, child-project mapping, and authoritative execution chain for LGFC orchestrated work
Does Not Own: PMO v3 top-level policy, implementation plan task definitions, workflow code, runtime behavior, product design, or unauthorized GitHub issue changes
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1411, #1379, #1255, #1259, #1500, #1678, #1685, #1696, #1700, #1713, #1719, #1720, #1721, #1722, #1723, #1724, #1725, #1726, #1727
Last Reviewed: 2026-06-19
---

# PMO Program Issue Registry

## Purpose

Record current PMO program issues and their status under PMO v3.

This registry is subordinate to `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`. If this registry conflicts with the PMO v3 operating model, the PMO v3 operating model controls.

## Scope

This registry records current program issue assignments, launch-state control, child-project mapping, and the PMO execution chain. It does not own PMO v3 top-level policy, task-level implementation detail, workflow code, runtime behavior, product design, or unauthorized GitHub issue changes.

## Current known truth

- Program #1255 is the active execution program. Cursor owns completion of its remaining work.
- Child project #1259 is open; Phase 4 Tasks 001–009 are complete on `main`; issue remains open pending Program #1255 terminal closeout authorization.
- Program #1255 closeout readiness packet published at `docs/ops/reports/program-1255-closeout-readiness.md`; operator hygiene for `#1123` and `#1258` **complete** (2026-06-17).
- Priority #1 Website Completion / Fan Club Product Buildout is parked as program issue #1685 with child issues #1686 through #1694; it remains blocked until Atlas/Bill explicitly launch or reprioritize it.
- Priority #2 Fundraiser / Charity Campaign Operations Buildout has program issue #1700 with child task issues #1701 through #1708. Task 001 assignment guidance is posted on #1701. The program remains queued behind Program #1255/#1259 and parked Priority #1 unless Bill/Atlas explicitly reprioritize.
- Priority #3 PMO Governance / Workflow Automation Completion has program issue #1719 with child task issues #1720 through #1727. Task 001 assignment guidance is posted on #1720. The program remains queued behind Program #1255/#1259, parked Priority #1, and Priority #2 unless Bill/Atlas explicitly reprioritize.
- issue #1500 (CI Post-Merge Closeout Reliability) is **closed complete** and remains reconciliation evidence for Priority #3. Task #1725 reconciliation report: `docs/ops/reports/program-1500-queue-wave-reconciliation.md`.
- issue #1411 is completed — a planning/control artifact, not an open blocked program.
- GitHub issue titles use `Program: <name>`. Documentation references use `Program #<issue-number> — <name>`.

## Intended final state

- One authoritative row per active, staged, blocked, completed, or historical program issue with non-contradictory status language.
- Child projects under each program are clearly subordinate to their umbrella program issue.
- Priority #1, Priority #2, and Priority #3 are ready for launch review only when Bill/Atlas explicitly authorize execution from their master program issue and first task issue.

Program issue numbers identify programs going forward. Future programs should use `Program #<issue-number> — <name>` in documentation. GitHub issue titles use `Program: <name>` when possible. No future Program 3 / Program 4 / Program 5 labels should be introduced as PMO operating identifiers.

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
| Website Completion / Fan Club Product Buildout | 1 | Launch-control ready; parked | Blocked until Atlas/Bill explicitly authorize Cursor to begin #1686 or reprioritize #1685 | `docs/ops/pmo/website-completion-fan-club-product-buildout-readiness.md` | `docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md` |
| Fundraiser / Charity Campaign Operations Buildout | 2 | Launch-control ready; queued | Blocked until Atlas/Bill explicitly authorize Cursor to begin #1701 | `docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md` | `docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md` |
| PMO Governance / Workflow Automation Completion | 3 | Launch-control ready; queued | Blocked until Atlas/Bill explicitly authorize Cursor to begin #1720 | `docs/ops/pmo/pmo-governance-workflow-automation-completion-readiness.md` | `docs/ops/implementation-plans/pmo-governance-workflow-automation-completion.md` |

### Priority #1 candidate child projects

| Child project | PMO decision | Implementation-plan coverage | issue |
| --- | --- | --- | --- |
| Fan Club page design | Included in Priority #1 | Tasks 001, 003, 007, 009 | #1686, #1688, #1692, #1694 |
| Website backend services | Included in Priority #1; reconcile before building | Tasks 001, 002, 005, 006 | #1686, #1687, #1690, #1691 |
| Content management strategy | Included in Priority #1 | Tasks 004, 005, 008, 009 | #1689, #1690, #1693, #1694 |
| Content collection strategy | Subordinated to content management as intake/source-credit workflow | Tasks 004, 005, 008 | #1689, #1690, #1693 |
| Website design review / as-built versus LGFC vision | First guardrail task | Tasks 001 and 009 | #1686, #1694 |

### Priority #2 candidate child projects

| Child project | PMO decision | Implementation-plan coverage | issue |
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

| Child project | PMO decision | Implementation-plan coverage | issue |
| --- | --- | --- | --- |
| PMO v3 authority and stale issue reconciliation | Included in Priority #3 | Task 001 | #1720 |
| Workflow automation design migration and gap inventory | Included in Priority #3 | Task 002 | #1721 |
| Cursor continuation and queue contract hardening | Included in Priority #3 | Task 003 | #1722 |
| PR readiness and merge authority control | Included in Priority #3 | Task 004 | #1723 |
| Issue mutation and closeout permission policy | Included in Priority #3 | Task 005 | #1724 |
| Queue/wave model and Program #1500 closeout reconciliation | Included in Priority #3; reconciliation report published | Task 006 | #1725 |
| Workflow/CI implementation candidate scoping | Included in Priority #3 | Task 007 | #1726 |
| Program closeout and launch-control package | Terminal closeout | Task 008 | #1727 |

## Staged / blocked program issues

| Program issue | Name | Historical label | Status | Launch rule |
| --- | --- | --- | --- | --- |
| #1411 | PMO Automation and Agent Workflow Control | Program 1 | Completed planning artifact (issue closed, status:complete) | issue #1411 is not an open blocked program. New execution requires a current open source issue. PMO automation execution remains blocked until Atlas/Bill explicitly launch a new cycle. |
| #1685 | Website Completion / Fan Club Product Buildout | none | Launch-control ready / parked | Child issues #1686–#1694 exist; execution waits for explicit queue authorization. |
| #1700 | Fundraiser / Charity Campaign Operations Buildout | none | Launch-control ready / queued | Child issues #1701–#1708 exist; Task 001 assignment guidance is posted on #1701; execution waits for explicit queue authorization. |
| #1719 | PMO Governance / Workflow Automation Completion | none | Launch-control ready / queued | Child issues #1720–#1727 exist; Task 001 assignment guidance is posted on #1720; execution waits for explicit queue authorization. |

## Historical program evidence

| Program issue | Name | Status | Notes |
| --- | --- | --- | --- |
| #1335 | Phase 1 Wrap-Up | Historical | Prior Program 1 cycle; closed historical evidence only. Not a parent issue for Program #1411. |
| #1379 | Ideas / future-projects source | Historical | Superseded by PMO Backlog documentation (`/docs/ops/pmo/pmo-backlog.md`). No standing PMO Backlog issue is required. |
| #1500 | CI Post-Merge Closeout Reliability | Closed complete | Completed implementation cycle. Future CI maintenance requires a new source issue. |
| #1696 | Fundraiser / Charity Campaign Operations Buildout documentation package | Closed complete | Planning documentation source issue completed by #1697. |
| #1713 | PMO Governance / Workflow Automation Completion documentation package | Closed complete | Planning documentation source issue completed by #1714. |

Completed program cycles remain audit evidence and may be cited for historical context. They do not automatically authorize new child issues, queue movement, or parent/child relationships for later cycles.

## PMO Backlog

| Field | Value |
| --- | --- |
| Path | `docs/ops/pmo/pmo-backlog.md` |
| Role | Ideas, project drafts, implementation-ready projects, and launch-control-ready program groups |
| Is a program issue | No |
| Executable by itself | No |
| Review cadence | Reviewed as a primary agenda item during PMO meetings |
| Current top candidate | Website Completion / Fan Club Product Buildout remains parked; Fundraiser / Charity Campaign Operations Buildout and PMO Governance / Workflow Automation Completion are launch-control ready and queued behind active work |

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

**Inventory authority:** These areas are no longer an active or automatically queued program. They live as governance/ops backlog inventory in `/docs/ops/pmo/pmo-backlog.md` and are now grouped under Priority #3 program #1719. `#1411` remains closed; execution requires explicit Atlas/Bill launch authorization through #1719 and its child task issues.

| Area | Registry decision |
| --- | --- |
| PMO v3 authority | Included in Priority #3 #1720 |
| Workflow Automation design migration | Included in Priority #3 #1721 |
| Cursor continuation and queue contract | Included in Priority #3 #1722 |
| PR readiness and batch review control | Included in Priority #3 #1723 |
| Merge and issue change policy | Included in Priority #3 #1724 |
| Queue/wave model and labels | Included in Priority #3 #1725 — reconciled; see `docs/ops/reports/program-1500-queue-wave-reconciliation.md` |
| Post-merge closeout evidence stabilization | Included in Priority #3 #1725 — baseline satisfied by closed #1500; gaps for #1726+ only |
| PMO Backlog promotion and Program #1411 launch gate | Included in Priority #3 #1720 and #1727 |

### Out of scope for Program #1411 planning

- Program #1255 website/runtime implementation
- Workflow YAML changes not authorized by a current Priority #3 task issue
- D1 migrations
- Production configuration or secrets
- Unauthorized issue state changes
- Creating additional implementation child issues before Atlas/Bill launch approval

## Program #1255 — Website Implementation and Content Operations

| Field | Value |
| --- | --- |
| Status | **Closeout inspection pending** — Phase 4 complete; awaits Atlas/Bill terminal authorization |
| Historical label | Program 2 |
| Source issue | `#1255` |
| Primary plan | `docs/how-to/website/website-implementation-and-content-operations-plan.md` |
| Ops admin plan | `docs/ops/implementation-plans/website-operations-admin.md` |
| QA plan | `docs/ops/implementation-plans/website-qa-production-validation.md` |
| Closeout readiness | `docs/ops/reports/program-1255-closeout-readiness.md` |
| Priority | Atlas/Bill final inspection → terminal closeout authorization → close `#1259` then `#1255` |
| Parallel program note | `#1500` closed complete — ran in parallel with `#1255`; not a `#1259` task dependency |

Program #1255 remains controlled by its own active source issues and Cursor execution path. Priority #1, Priority #2, and Priority #3 planning documentation must not change Program #1255 issue state, labels, or active assignment without explicit authorization.

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
- Cursor execution contract: `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
- PMO critical path: `/docs/ops/pmo/critical-path.md`
- Workflow Automation authority: `/docs/ops/pmo/workflow-automation.md`
