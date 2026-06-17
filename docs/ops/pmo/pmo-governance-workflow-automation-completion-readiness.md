---
Doc Type: Operations
Audience: Bill, Atlas, Cursor, LGFC maintainers, implementation agents, and reviewers
Authority Level: Operational Authority
Owns: Priority #3 PMO readiness decision, governance/workflow automation program candidate scope, child-project boundaries, design/readiness state, Cursor launch preconditions
Does Not Own: Runtime implementation, workflow code, CI script changes, issue creation, merge authority, production secrets, vendor configuration, unauthorized GitHub issue mutation
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1713, #1411, #1417, #1418, #1419, #1420, #1421, #1422, #1423, #1424, #1500, #1255, #1259, #1685, #1700
Last Reviewed: 2026-06-17
---

# PMO Governance / Workflow Automation Completion Readiness

> This program is BLOCKED from execution until Atlas/Bill explicitly launch it. Planning, review, and documentation discussion may continue, but Cursor may not execute implementation work from this program until Bill/Atlas explicitly launch it.

## Purpose

This document converts PMO Backlog ranks 3–10 into a PMO v3 future-program readiness package.

Priority #3 is the **PMO Governance / Workflow Automation Completion** group. The group consolidates the former #1411 PMO automation and agent workflow control areas into a bounded program candidate that can later reconcile PMO authority, workflow automation design, Cursor execution contracts, PR readiness, merge/issue mutation rules, queue/wave planning, post-merge closeout, and backlog promotion gates.

## Scope

This readiness package covers these Priority #3 workstreams:

1. PMO v3 authority
2. Workflow Automation Design Migration
3. Cursor Continuation and Queue Contract
4. PR Readiness and Batch Review Control
5. Merge and issue mutation policy
6. Queue/Wave Model and Label Planning
7. Post-Merge Closeout Evidence Stabilization
8. PMO Backlog Promotion and Program #1411 Launch Gate

This document owns the PMO readiness decision, project boundaries, source-of-truth map, missing-decision register, Program #1500 overlap reconciliation, stale issue review notes, implementation-readiness classification, and Cursor pre-launch requirements.

This document does not launch implementation, create child issues, authorize Cursor execution, change workflow YAML, change CI scripts, change runtime behavior, mutate #1411 or #1417–#1424, close issues, relabel issues, or supersede the PMO v3 operating model.

## Current known truth

- PMO Backlog ranks 3–10 are governance/ops backlog items, not executable tasks by themselves.
- #1411 is closed and completed as a planning/control artifact.
- #1417–#1424 exist as stale task issues with PMO v2 terminology and require review before reuse or closure.
- Program #1500 closed complete and may already satisfy parts of closeout reliability and queue/wave planning.
- Program #1255/#1259 remains active and ahead unless Bill/Atlas explicitly reprioritize.
- Priority #1 Website Completion / Fan Club Product Buildout is parked as #1685 with child issues #1686 through #1694.
- Priority #2 Fundraiser / Charity Campaign Operations Buildout is launch-control ready as #1700 with child issues #1701 through #1708.
- Cursor is the intended implementation agent after explicit Bill/Atlas launch authorization, but governance or script-sensitive work may require human/trusted-reviewer gates before merge.

## Intended final state

After this readiness package is approved, Priority #3 should be usable as a future program-of-work planning package for Cursor assignment once the active queue permits launch.

The intended final state before implementation launch is:

- one PMO v3 program candidate with a clear launch-state control statement;
- child-project boundaries for PMO authority, workflow automation, Cursor execution rules, PR readiness, merge/issue mutation policy, queue/wave model, post-merge closeout, and backlog promotion gates;
- a reconciliation map that prevents rebuilding work already completed by Program #1500;
- a stale issue review plan for #1417–#1424;
- an implementation plan that defines task order, file areas, validation, and closeout expectations;
- no requirement for Cursor to infer governance requirements from chat history, historical PMO v2 labels, or stale task issues.

## Priority #3 program candidate

| Field | Value |
| --- | --- |
| Candidate program name | PMO Governance / Workflow Automation Completion |
| PMO source | PMO Backlog ranks 3–10 |
| Source issue | #1719 |
| Execution agent after launch | Cursor, with human/trusted reviewer gates where protected governance/CI files are touched |
| Current readiness | Launch-control ready; queued behind Program #1255/#1259, parked Priority #1, and Priority #2 |
| Primary implementation plan | `docs/ops/implementation-plans/pmo-governance-workflow-automation-completion.md` |
| Primary governance authority | `docs/ops/pmo/PMO-V3-OPERATING-MODEL.md` |
| Product surface | PMO governance, workflow automation design, queue/closeout controls, PR readiness, and execution contracts |
| Explicit non-goal | Mutating live workflows, CI scripts, labels, issues, or queue state from this documentation package |

## Child-project readiness inventory

| Priority item | Project name | Current state | Design authority | Implementation plan state | Readiness decision |
| --- | --- | --- | --- | --- | --- |
| 3 | PMO v3 authority | Partial governance authority exists | `PMO-V3-OPERATING-MODEL.md`, `program-registry.md`, `pmo-backlog.md` | Covered by Tasks 001, 008 | Needs consolidation and conflict review |
| 4 | Workflow Automation Design Migration | Partial docs exist | `workflow-automation.md`, #1411 planning evidence | Covered by Tasks 002, 007, 008 | Needs source migration and gap review |
| 5 | Cursor Continuation and Queue Contract | Partial contract exists | `lgfc-cursor-execution-contract.md`, current PR process | Covered by Tasks 003, 007, 008 | Needs authoritative continuation/stop matrix |
| 6 | PR Readiness and Batch Review Control | Partial process exists | `PR_PROCESS.md`, `PR_GOVERNANCE.md` | Covered by Tasks 004, 007, 008 | Needs batch/readiness alignment |
| 7 | Merge and issue mutation policy | Partial policy exists | `PR_GOVERNANCE.md`, closeout protocol, Cursor contract | Covered by Tasks 004, 005, 007, 008 | Needs mutation-permission matrix |
| 8 | Queue/Wave Model and Label Planning | Partial planning exists | PMO backlog, queue/dependency docs, Program #1500 evidence | Covered by Tasks 006, 007, 008 | Needs Program #1500 reconciliation before build |
| 9 | Post-Merge Closeout Evidence Stabilization | Partially satisfied by #1500 and #1699/#1712 follow-up context | closeout protocol, Program #1500 evidence | Covered by Tasks 006, 007, 008 | Avoid rebuilding completed work; document remaining gaps only |
| 10 | PMO Backlog Promotion and Program #1411 Launch Gate | Partial backlog/promotion rules exist | PMO backlog, PMO v3 operating model, registry | Covered by Tasks 001, 007, 008 | Needs promotion gate checklist and issue-chain standardization |

## Program #1500 overlap reconciliation

| Area | Program #1500 effect | Priority #3 handling |
| --- | --- | --- |
| Post-merge closeout reliability | Closed complete; may satisfy stabilization baseline | Task 006 must inventory evidence before proposing changes |
| Queue/wave model | May partially satisfy closeout sequencing and run-state expectations | Task 006 documents remaining gaps only |
| Issue mutation guardrails | Related but not necessarily complete across all PMO program types | Task 005 verifies policy coverage before implementation |
| PR readiness gates | Related to closeout, but batch review/readiness may remain distinct | Task 004 reconciles with current PR process |
| Workflow YAML / CI scripts | Protected/sensitive surface | This readiness package does not authorize workflow/script changes |

## Stale issue review note

Issues #1417 through #1424 are stale task issues from the prior #1411 planning cycle. They may contain useful scope evidence, but they are not automatically executable and must not be closed, reopened, relabeled, reassigned, or treated as current source issues from this documentation package.

A later launched Priority #3 program may:

- cite #1417–#1424 as historical evidence;
- map their useful content into new current child task issues;
- leave them unchanged if they are superseded;
- propose a separate operator-approved hygiene action if mutation is required.

## Missing-decision register

| Decision | Needed before | Current default |
| --- | --- | --- |
| Whether Priority #3 uses docs-only tasks first or includes workflow/script tasks | Launch issue creation | Docs-first; protected files require explicit later authorization |
| Whether #1417–#1424 are reused, superseded, or left historical | Task 001 / Task 008 | Treat as historical evidence only |
| Whether Program #1500 fully satisfies rank 9 | Task 006 | Inventory before implementation; avoid rebuilding completed work |
| Whether queue/wave labels become real labels or planning concepts only | Task 006 | Planning concepts only until authorized |
| Whether Cursor may mutate issues during closeout | Task 005 | No mutation unless current source issue explicitly grants it |
| Whether workflow automation changes touch `.github/workflows/**` or `scripts/ci/**` | Task 007 | Out of scope until explicit implementation authorization and trusted review |

## Launch preconditions

Before Cursor receives implementation assignment for this program:

1. Program #1255/#1259 status must be resolved, or Bill/Atlas must explicitly reprioritize.
2. Parked Priority #1 status (#1685–#1694) must be resolved, deferred, or explicitly superseded.
3. Queued Priority #2 status (#1700–#1708) must be resolved, deferred, or explicitly superseded.
4. A current program issue must explicitly launch Priority #3.
5. Child task issues must be created from the implementation plan only after launch approval.
6. Cursor must receive one task issue at a time unless Bill/Atlas explicitly approve parallel execution.
7. Protected workflow/script changes must require explicit trusted-reviewer expectations before implementation.
8. Issue mutation permissions must be explicit per task.

## Readiness conclusion

Priority #3 is documented as a launch-control-ready PMO v3 program candidate with master issue #1719 and child task issues #1720 through #1727.

It is **launch-control ready**, not executable. Cursor may begin only after Bill/Atlas explicitly authorize Task 001 on #1720.
