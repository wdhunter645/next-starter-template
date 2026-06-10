---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO program issue registry, current program issue assignments, launch-state control, child-project mapping, and authoritative execution chain for LGFC orchestrated work
Does Not Own: PMO v3 top-level policy, implementation plan task definitions, workflow code, runtime behavior, product design, or unauthorized GitHub issue mutation
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1411, #1417, #1418, #1419, #1420, #1421, #1422, #1423, #1424, #1379, #1255, #1256, #1407, #1526, #1501, #1500
Last Reviewed: 2026-06-10
---

# PMO Program Issue Registry

## Purpose

Record current PMO program issues and their status under PMO v3.

This registry is subordinate to `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`. If this registry conflicts with the PMO v3 operating model, the PMO v3 operating model controls.

## Scope

This registry records current program issue assignments, launch-state control,
child-project mapping, and the PMO execution chain. It does not own PMO v3
top-level policy, task-level implementation detail, workflow code, or
unauthorized GitHub issue mutation.

## Current known truth

- Program #1255 is the active execution program. Child project #1256 is at
  terminal Task 009 closeout (`#1407` open; `#1526` remediation open).
- Issue #1411 is closed complete — a completed planning/control artifact, not
  an open blocked program.
- Issue #1500 is the next prioritized program after Program #1255 completes. It
  is excluded from immediate execution.
- GitHub issue titles use `Program: <name>`. Documentation references use
  `Program #<issue-number> — <name>`.

## Intended final state

- One authoritative row per active, staged, blocked, completed, or historical
  program issue with non-contradictory status language.
- Child projects under Program #1255 are clearly subordinate to the umbrella
  program issue.

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
| #1255 | Website Implementation and Content Operations | Program 2 | Active — terminal child closeout | Current active execution program. Child project #1256 at Task 009 closeout (`#1407` / `#1526`). |

### Program #1255 child projects

| Child project | Status | Notes |
| --- | --- | --- |
| #1256 Content Strategy / Editorial Inventory | Terminal closeout | Tasks 001–009 merged; `#1407` / `#1526` block project completion |
| #1258 Website Operations Admin | Queued | Next after #1256 completes — not started |
| #1259 Website QA / Production Validation | Queued | Follows #1258 — not started |

## Staged / blocked program issues

| Program issue | Name | Historical label | Status | Launch rule |
| --- | --- | --- | --- | --- |
| #1411 | PMO Automation and Agent Workflow Control | Program 1 | Completed planning artifact (issue closed, `status:complete`) | Issue #1411 is not an open blocked program. New execution requires a current open source issue. PMO automation execution remains blocked until Program #1255 completes and Atlas/Bill explicitly launch the next cycle. |

## Historical program evidence

| Program issue | Name | Status | Notes |
| --- | --- | --- | --- |
| #1335 | Phase 1 Wrap-Up | Historical | Prior Program 1 cycle; closed historical evidence only. Not a parent issue for Program #1411. |
| #1379 | Ideas / future-projects source | Historical | Superseded by PMO Backlog documentation (`/docs/ops/pmo/pmo-backlog.md`). No standing PMO Backlog issue is required. |

Completed program cycles remain audit evidence and may be cited for historical context. They do not automatically authorize new child issues, queue movement, or parent/child relationships for later cycles.

## Proposed / future program issues

Future programs are created as GitHub program issues when Atlas/Bill approve a new body of work. Each receives a program issue number as its durable identifier. There is no fixed program count or lane cap.

## PMO Backlog

| Field | Value |
| --- | --- |
| Path | `docs/ops/pmo/pmo-backlog.md` |
| Role | Ideas, project drafts, and implementation-ready projects |
| Is a program issue | No |
| Executable by itself | No |
| Review cadence | Reviewed as a primary agenda item during PMO meetings |

## Program #1411 — PMO Automation and Agent Workflow Control

| Field | Value |
| --- | --- |
| Status | **Completed planning artifact** (issue closed, `status:complete`) — not executable until Program #1255 is completed and signed off, a current open source issue exists, and Atlas/Bill explicitly launch the next cycle |
| Source issue | `#1411` |
| Implementation plan | `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md` |
| PMO v3 authority | `docs/ops/pmo/PMO-V3-OPERATING-MODEL.md` |
| Workflow Automation authority | `docs/ops/pmo/workflow-automation.md` |
| Project slug | `program-1-pmo-automation-agent-workflow-control` |

### Program #1411 project areas

| Area | Registry decision |
| --- | --- |
| PMO v3 authority | Program issue numbers identify programs; PMO Backlog holds ideas/project drafts |
| Workflow Automation design migration | Workflow Automation promoted from PMO Backlog into Program #1411 |
| Cursor continuation and queue contract | Cursor can validate and report, then stops at review handoff |
| PR readiness and batch review control | Readiness preserves Atlas/Bill review and merge authority |
| Merge and issue mutation policy | Cursor may not merge, close, relabel, queue, or mutate issues without explicit authorization |
| Queue/wave model and labels | Wave labels and run identifiers are planning concepts before workflow code changes |
| Post-merge closeout evidence stabilization | Closeout requires stable evidence and terminal completed-label reconciliation before mutation or queue advancement |
| PMO Backlog promotion and Program #1411 launch gate | Backlog items require owner promotion, repo authority, decomposition, and bounded handoff before becoming executable |

### Out of scope for Program #1411 planning

- Program #1255 website/runtime implementation
- Workflow YAML changes
- D1 migrations
- Production configuration or secrets
- Unauthorized issue closure, relabeling, or mutation
- Creating implementation child issues before Atlas/Bill launch approval

## Program #1255 — Website Implementation and Content Operations

| Field | Value |
| --- | --- |
| Status | **Active execution program** — child project #1256 at terminal Task 009 closeout |
| Historical label | Program 2 |
| Source issue | `#1255` |
| Active child project | `#1256` — Content Strategy / Editorial Inventory |
| Primary plan | `docs/how-to/website/website-implementation-and-content-operations-plan.md` |
| Priority | Complete #1256 closeout (`#1407` / `#1526`); then #1258, then #1259 |
| Next prioritized program (not active) | Issue `#1500` — excluded from immediate execution |

Program #1255 remains active while #1256 completes terminal closeout. Program #1411 planning artifacts must not modify Program #1255 issue state, relabel Program #1255 issues, close Program #1255 issues, or reinterpret Program #1255 child project priority without explicit authorization.

## Related References

- PMO v3 operating model: `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`
- PMO Backlog: `/docs/ops/pmo/pmo-backlog.md`
- Cursor execution contract: `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
- PMO critical path: `/docs/ops/pmo/critical-path.md`
- Workflow Automation authority: `/docs/ops/pmo/workflow-automation.md`
