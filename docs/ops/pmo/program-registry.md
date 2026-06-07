---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO program registry, launch-state control, five-program lane model, child-project mapping, and authoritative execution chain for LGFC orchestrated work
Does Not Own: Implementation plan task definitions, workflow code, runtime behavior, product design, or unauthorized GitHub issue mutation
Canonical Reference: /docs/ops/pmo/program-registry.md
Related Issues: #1411, #1409, #1379, #1255, #1335
Last Reviewed: 2026-06-07
---

# PMO Program Registry

## Purpose

Record the authoritative Program Management Office (PMO) structure for LGFC
orchestrated execution. The registry defines the program lanes, blocked launch
state, active cycles, portfolio intake, and execution chain used to convert
approved planning into bounded GitHub issues, Pull Requests, verification, and
closeout.

## Scope

This document owns:

- Program 1, Program 2, Program 3, Program 4, and Program 5 definitions;
- the current execution lane and blocked planning lane relationship;
- the required blocked-first control statement for future planning programs;
- completed-cycle historical evidence rules;
- links to active implementation plans and PMO authority docs;
- non-interference rules for planning work that runs while another lane executes.

This document does not own:

- task-level implementation details inside implementation plans;
- workflow YAML, orchestrator code, runtime code, D1 migrations, or production
  configuration;
- GitHub issue closure, relabeling, queue advancement, or merge actions unless
  separately authorized by an active source issue.

## Required First Statement for Planning Programs

Every program planning package must begin with a launch-state control statement.

Required language:

> This program is BLOCKED from execution until the currently active program is
> closed or reaches an Atlas/Bill-approved transition gate. Planning, review, and
> documentation discussion may continue, but Cursor may not execute implementation
> work from this program until Bill/Atlas explicitly launch it.

Required implications:

- A planning issue does not launch a program.
- A planning PR does not launch a program.
- A ready-for-review planning PR does not launch a program.
- A merged planning PR does not automatically launch a program.
- Launch requires an explicit Atlas/Bill launch comment or source issue update.
- Cursor must treat pre-launch program issues as planning/reference only.
- Child implementation issues must not be created or activated until launch
  approval.

## PMO Execution Chain

The authoritative chain for orchestrated work remains:

```text
Program → child project → task → issue → PR → verification → closeout
```

| Link | Definition | Primary source |
| --- | --- | --- |
| Program | Time-bounded execution or planning body with source issue and launch gate | This registry |
| child project | Bounded workstream under a program | Implementation plan + source issue |
| task | Single executable unit in a production-ready plan | `/docs/ops/implementation-plans/` |
| issue | GitHub execution contract with stable task marker when generated | issue factory / source issue |
| PR | One scoped pull request per task issue | Assigned agent |
| verification | Required checks, review evidence, gate status, and PR body accounting | PR governance + CI gates |
| closeout | Source issue reconciliation, evidence, and authorized queue advancement | PMO closeout rules |

Related authority:

- Workflow Automation authority: `/docs/ops/pmo/workflow-automation.md`
- Cursor execution contract:
  `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
- Parallel agent constraints: `/docs/ops/pmo/parallel-agent-rules.md`
- Critical-path and queue rules: `/docs/ops/pmo/critical-path.md`

## Current Known Truth

- Program 1, Program 2, Program 3, and Program 4 are reusable execution/planning
  lanes. They are not permanent subject domains.
- Program 5 is the future-project and ideas portfolio aggregator. It is not an
  implementation execution lane.
- At steady state, three program records may be active in PMO control:
  1. one execution lane actively being implemented;
  2. one blocked planning lane being prepared as the next implementation cycle;
  3. Program 5 as the always-available portfolio aggregator.
- Program 2 is the current active execution lane: `#1255` — **Website
  Implementation and Content Operations**.
- Program 1 is the current blocked planning lane: `#1411` — **PMO Automation and
  Agent Workflow Control**.
- Program 3 and Program 4 are available future execution/planning lanes and must
  not be activated unless Atlas/Bill explicitly open a source issue for them.
- Program 5 portfolio authority is currently represented by the legacy portfolio
  issue `#1379` until a dedicated Program 5 portfolio issue is created.
- The prior Program 1 cycle `#1335` — **Phase 1 Wrap-Up** — is completed
  historical evidence only. It is not a parent issue for the new Program 1 cycle.
- Workflow Automation has been promoted from the portfolio (`#1379`) and Drive
  draft context into the blocked Program 1 planning cycle through `#1411`.
- Cursor may prepare scoped docs and PR evidence when authorized, but may not
  merge, close, relabel, advance queues, create implementation child issues, or
  mutate issue state unless the active source issue explicitly authorizes that
  action.

## Intended Final State

- Active work maps to one current execution lane among Program 1 through Program
  4, or remains in Program 5 as portfolio intake.
- The next implementation cycle is planned in a different program number from the
  currently active execution lane and from the prior completed program number.
- GitHub repository docs are the authority for promoted workflow-automation design
  before workflow implementation begins.
- Blocked planning can proceed without interfering with the active execution
  program.
- Future transitions use explicit completion, review, launch-gate, and handoff
  rules.
- Completed programs remain linked as evidence without becoming implicit parents
  for later cycles.

## Five-Program Model

Program numbers identify PMO cycle slots, not permanent subject domains.

| Program | Role | Current state |
| --- | --- | --- |
| Program 1 | Execution/planning lane A | Blocked planning lane for PMO Automation and Agent Workflow Control (`#1411`) |
| Program 2 | Execution/planning lane B | Active execution lane for Website Implementation and Content Operations (`#1255`) |
| Program 3 | Execution/planning lane C | Available future lane; not active |
| Program 4 | Execution/planning lane D | Available future lane; not active |
| Program 5 | Future-project / ideas portfolio aggregator | Portfolio source currently represented by legacy `#1379` until dedicated Program 5 authority is created |

The purpose of four reusable execution/planning lane numbers is nomenclature
separation. While one program number is executing and another is blocked/planning,
a recently completed program number can remain historical without overlapping the
active or planning program numbers.

## Active / Blocked / Portfolio Operating Pattern

The steady-state PMO pattern is:

1. One Program 1–4 lane is active implementation.
2. One different Program 1–4 lane is blocked planning for the next implementation
   cycle.
3. Program 5 continuously aggregates future projects and ideas.
4. Planning work may proceed in the blocked lane, but Cursor may not execute from
   it until Atlas/Bill explicitly launch that program.
5. The prior completed program remains historical evidence and should not share
   the active or blocked/planning number when avoidable.
6. When the active execution lane closes or reaches an approved transition gate,
   Atlas/Bill may launch the blocked planning lane or choose a different Program
   1–4 lane from Program 5 portfolio material.

This model prevents drift from treating any program number as permanently
"governance," "implementation," or "portfolio," except Program 5, which is the
stable portfolio aggregator.

## Current Program 1 — PMO Automation and Agent Workflow Control

| Field | Value |
| --- | --- |
| Status | **Blocked planning lane** — not executable until Program 2 closes or reaches an Atlas/Bill-approved transition gate |
| Source issue | `#1411` |
| Implementation plan | `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md` |
| Workflow Automation authority | `docs/ops/pmo/workflow-automation.md` |
| Project slug | `program-1-pmo-automation-agent-workflow-control` |
| Non-interference context | Active Program 2 `#1255`; prior Program 1 `#1335` historical only |

### Program 1 project areas

| Area | Registry decision |
| --- | --- |
| PMO five-program authority | Program 1–4 are reusable execution/planning lanes; Program 5 is the portfolio aggregator |
| Workflow Automation design migration | Workflow Automation is promoted from portfolio / Drive context into GitHub authority |
| Cursor continuation and queue contract | Cursor can validate and report, then stops at review handoff |
| PR readiness and batch review control | Readiness preserves Atlas/Bill review and merge authority |
| Merge and issue mutation policy | Cursor may not merge, close, relabel, queue, or mutate issues without explicit authorization |
| Queue/wave model and labels | Wave labels and run identifiers are planning concepts before workflow code changes |
| Post-merge closeout evidence stabilization | Closeout requires stable evidence and terminal completed-label reconciliation before mutation or queue advancement |
| Program 5 promotion process | Portfolio items require owner promotion, repo authority, decomposition, and bounded handoff |

### Out of scope for current Program 1 planning PR

- Program 2 website/runtime implementation under `#1255`
- Workflow YAML changes
- D1 migrations
- Production configuration or secrets
- Closing, relabeling, or mutating Program 2 issues
- Creating implementation child issues before Atlas/Bill launch approval

## Current Program 2 — Website Implementation and Content Operations

| Field | Value |
| --- | --- |
| Status | **Active execution lane** |
| Source issue | `#1255` |
| Primary plan | `docs/how-to/website/website-implementation-and-content-operations-plan.md` |
| Priority | Content Strategy / Editorial Inventory first |

Program 2 remains active while Program 1 defines the next PMO automation body of
work. Program 1 planning must not modify Program 2 issue state, relabel Program 2
issues, close Program 2 issues, or reinterpret Program 2 child project priority.

## Program 3 and Program 4 — Available Future Lanes

Program 3 and Program 4 are available execution/planning lane numbers. They do
not currently own active LGFC implementation work.

They may be used when Atlas/Bill need a new planning or execution cycle that
should not reuse the prior completed number or conflict with the active execution
and blocked planning lanes.

## Program 5 — Future Projects and Ideas Portfolio

| Field | Value |
| --- | --- |
| Status | **Portfolio intake and prioritization** |
| Current source issue | legacy `#1379`, pending dedicated Program 5 portfolio authority if needed |
| Role | Ideas, deferred work, candidate projects, and future opportunities |

Program 5 is not an implementation queue. Items in Program 5 require:

1. owner approval for promotion;
2. finalized design or plan;
3. repository documentation authority;
4. placement into the appropriate portfolio or implementation plan;
5. scoped GitHub issue creation;
6. bounded Cursor/agent implementation scope;
7. explicit launch approval into one of Program 1–4.

Workflow Automation is the current promoted example: it moved from portfolio
candidate status into blocked Program 1 planning through `#1411`.

## Historical Program Evidence

| Cycle | Status | Current role |
| --- | --- | --- |
| Program 1 — Phase 1 Wrap-Up (`#1335`) | Closed / historical | Evidence for prior PMO setup, not a parent issue for later Program 1 cycles |

Completed program cycles remain audit evidence and may be cited for historical
context. They do not automatically authorize new child issues, queue movement, or
parent/child relationships for later cycles.

## Related References

- Program portfolio model:
  `/docs/reference/pmo/lgfc-program-portfolio-model.md`
- Cursor execution contract:
  `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
- PMO critical path: `/docs/ops/pmo/critical-path.md`
- PMO parallel agent rules: `/docs/ops/pmo/parallel-agent-rules.md`
- GitHub issue closeout protocol:
  `/docs/ops/pmo/github-issue-closeout-protocol.md`
