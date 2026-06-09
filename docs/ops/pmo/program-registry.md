---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO program registry, five-program lane model, current program assignments, launch-state control, child-project mapping, and authoritative execution chain for LGFC orchestrated work
Does Not Own: PMO v2 top-level policy, implementation plan task definitions, workflow code, runtime behavior, product design, or unauthorized GitHub issue mutation
Canonical Reference: /docs/ops/pmo/PMO-V2-OPERATING-MODEL.md
Related Issues: #1411, #1417, #1418, #1419, #1420, #1421, #1422, #1423, #1424, #1379, #1255
Last Reviewed: 2026-06-09
---

# PMO Program Registry

## Purpose

Record the current PMO program lane assignments under the PMO v2 operating model.

This registry is subordinate to `/docs/ops/pmo/PMO-V2-OPERATING-MODEL.md`. It records which program lanes are active, staged, available, or used for ideas/project drafts. If this registry conflicts with the PMO v2 operating model, the PMO v2 operating model controls.

## PMO v2 summary

| Layer | Meaning |
| --- | --- |
| Portfolio | The prioritized execution portfolio represented by Programs 1-4. |
| Programs 1-4 | Rotating planning/execution lanes used to implement approved groups of prioritized portfolio projects. |
| Program 5 | Ideas and project drafts that are not yet portfolio-ready. |

Programs 1-4 are reusable lane numbers. They are not permanent subject domains. Program 5 is not an execution queue and is not the prioritized portfolio.

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

The authoritative chain for Programs 1-4 work is:

```text
Program 1-4 portfolio lane → child project → task → issue → PR → verification → closeout
```

Program 5 precedes that chain:

```text
Program 5 idea / project draft → documentation and readiness review → portfolio prioritization → promotion into Program 1-4
```

## Current Known Truth

- Program 1, Program 2, Program 3, and Program 4 are reusable planning/execution lanes that collectively represent the prioritized execution portfolio.
- Program 5 is the ideas and project-drafts lane. It holds candidate work not yet ready for portfolio admission or prioritization.
- Program 2 is the current active execution lane: `#1255` — **Website Implementation and Content Operations**.
- Program 1 is the current staged planning lane: `#1411` — **PMO Automation and Agent Workflow Control**.
- Program 3 and Program 4 are available future execution/planning lanes and must not be activated unless Atlas/Bill explicitly open or authorize a source issue for them.
- Legacy `#1379` currently represents Program 5 ideas/project-draft intake until a dedicated Program 5 authority issue is created.
- The prior Program 1 cycle `#1335` — **Phase 1 Wrap-Up** — is completed historical evidence only. It is not a parent issue for the current Program 1 cycle.
- Workflow Automation was promoted from ideas/project-draft material into the staged Program 1 planning cycle through `#1411`.
- Cursor may prepare scoped docs and PR evidence when authorized, but may not merge, close, relabel, advance queues, create implementation child issues, or mutate issue state unless the active source issue explicitly authorizes that action.

## Five-Program Model

| Program | Role | Current state |
| --- | --- | --- |
| Program 1 | Rotating portfolio planning/execution lane | Staged planning lane for PMO Automation and Agent Workflow Control (`#1411`) |
| Program 2 | Rotating portfolio planning/execution lane | Active execution lane for Website Implementation and Content Operations (`#1255`) |
| Program 3 | Rotating portfolio planning/execution lane | Available future lane; not active |
| Program 4 | Rotating portfolio planning/execution lane | Available future lane; not active |
| Program 5 | Ideas and project drafts | Legacy source currently `#1379`; dedicated Program 5 authority pending if needed |

## Current Program 1 — PMO Automation and Agent Workflow Control

| Field | Value |
| --- | --- |
| Status | **Staged planning lane** — not executable until Atlas/Bill explicitly launch it |
| Source issue | `#1411` |
| Implementation plan | `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md` |
| PMO v2 authority | `docs/ops/pmo/PMO-V2-OPERATING-MODEL.md` |
| Workflow Automation authority | `docs/ops/pmo/workflow-automation.md` |
| Project slug | `program-1-pmo-automation-agent-workflow-control` |

### Program 1 project areas

| Area | Registry decision |
| --- | --- |
| PMO v2 authority | Programs 1-4 are the prioritized execution portfolio; Program 5 is ideas/project drafts |
| Workflow Automation design migration | Workflow Automation is promoted from Program 5 idea/draft material into GitHub authority |
| Cursor continuation and queue contract | Cursor can validate and report, then stops at review handoff |
| PR readiness and batch review control | Readiness preserves Atlas/Bill review and merge authority |
| Merge and issue mutation policy | Cursor may not merge, close, relabel, queue, or mutate issues without explicit authorization |
| Queue/wave model and labels | Wave labels and run identifiers are planning concepts before workflow code changes |
| Post-merge closeout evidence stabilization | Closeout requires stable evidence and terminal completed-label reconciliation before mutation or queue advancement |
| Program 5 promotion and Program 1 launch gate | Ideas/project drafts require owner promotion, repo authority, decomposition, and bounded handoff before entering Programs 1-4 |

### Out of scope for current Program 1 planning

- Program 2 website/runtime implementation under `#1255`
- Workflow YAML changes
- D1 migrations
- Production configuration or secrets
- Unauthorized issue closure, relabeling, or mutation
- Creating implementation child issues before Atlas/Bill launch approval

## Current Program 2 — Website Implementation and Content Operations

| Field | Value |
| --- | --- |
| Status | **Active execution lane** |
| Source issue | `#1255` |
| Primary plan | `docs/how-to/website/website-implementation-and-content-operations-plan.md` |
| Priority | Content Strategy / Editorial Inventory first |

Program 2 remains active while Program 1 is staged. Program 1 planning must not modify Program 2 issue state, relabel Program 2 issues, close Program 2 issues, or reinterpret Program 2 child project priority.

## Program 3 and Program 4 — Available Future Portfolio Lanes

Program 3 and Program 4 are available rotating portfolio planning/execution lane numbers. They do not currently own active LGFC implementation work.

They may be used when Atlas/Bill select the next prioritized portfolio project group that should not reuse the current active or staged program number.

Program 3 and Program 4 are not ideas buckets. Ideas and project drafts belong in Program 5 until promoted.

## Program 5 — Ideas and Project Drafts

| Field | Value |
| --- | --- |
| Status | **Ideas and project-draft intake** |
| Current source issue | legacy `#1379`, pending dedicated Program 5 authority issue if needed |
| Role | Ideas, future project drafts, deferred concepts, readiness work before portfolio admission |

Program 5 is not an implementation queue. Items in Program 5 require:

1. owner approval for promotion review;
2. project-candidate documentation;
3. readiness review;
4. prioritization decision;
5. placement into Programs 1-4 when promoted;
6. scoped GitHub issue creation;
7. bounded Cursor/agent implementation scope;
8. explicit launch approval.

Workflow Automation is the current promoted example: it moved from Program 5 idea/draft material into staged Program 1 planning through `#1411`.

## Historical Program Evidence

| Cycle | Status | Current role |
| --- | --- | --- |
| Program 1 — Phase 1 Wrap-Up (`#1335`) | Closed / historical | Evidence for prior PMO setup, not a parent issue for later Program 1 cycles |

Completed program cycles remain audit evidence and may be cited for historical context. They do not automatically authorize new child issues, queue movement, or parent/child relationships for later cycles.

## Related References

- PMO v2 operating model: `/docs/ops/pmo/PMO-V2-OPERATING-MODEL.md`
- Cursor execution contract: `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
- PMO critical path: `/docs/ops/pmo/critical-path.md`
- Workflow Automation authority: `/docs/ops/pmo/workflow-automation.md`
