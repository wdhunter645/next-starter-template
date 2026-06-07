---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO program registry, lane model, child-project mapping, and authoritative execution chain for LGFC orchestrated work
Does Not Own: Implementation plan task definitions, workflow code, runtime behavior, product design, or unauthorized GitHub issue mutation
Canonical Reference: /docs/reference/pmo/lgfc-program-portfolio-model.md
Related Issues: #1411, #1409, #1379, #1255, #1335
Last Reviewed: 2026-06-07
---

# PMO Program Registry

## Purpose

Record the authoritative Program Management Office (PMO) structure for LGFC
orchestrated execution. The registry defines the program lanes, active cycles,
portfolio intake, and execution chain used to convert approved planning into
bounded GitHub Issues, Pull Requests, verification, and closeout.

## Scope

This document owns:

- Program 1, Program 2, and Program 3 lane definitions;
- the current Program 1 and Program 2 cycle relationship;
- completed-cycle historical evidence rules;
- links to active implementation plans and PMO authority docs;
- non-interference rules for planning work that runs while another lane executes.

This document does not own:

- task-level implementation details inside implementation plans;
- workflow YAML, orchestrator code, runtime code, D1 migrations, or production
  configuration;
- GitHub issue closure, relabeling, queue advancement, or merge actions unless
  separately authorized by an active source issue.

## PMO Execution Chain

The authoritative chain for orchestrated work remains:

```text
Program → Child Project → Task → Issue → PR → Verification → Closeout
```

| Link | Definition | Primary source |
| --- | --- | --- |
| Program | Time-bounded execution or planning body with source issue and launch gate | This registry |
| Child Project | Bounded workstream under a program | Implementation plan + source issue |
| Task | Single executable unit in a production-ready plan | `/docs/ops/implementation-plans/` |
| Issue | GitHub execution contract with stable task marker when generated | Issue factory / source issue |
| PR | One scoped pull request per task issue | Assigned agent |
| Verification | Required checks, review evidence, gate status, and PR body accounting | PR governance + CI gates |
| Closeout | Source issue reconciliation, evidence, and authorized queue advancement | PMO closeout rules |

Related authority:

- Workflow Automation authority: `/docs/ops/pmo/workflow-automation.md`
- Cursor execution contract:
  `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
- Parallel agent constraints: `/docs/ops/pmo/parallel-agent-rules.md`
- Critical-path and queue rules: `/docs/ops/pmo/critical-path.md`

## Current Known Truth

- Program 1 and Program 2 are alternating execution lanes in a perpetual PMO
  cycle. They are not permanent subject domains.
- Program 3 is the ideas, project, and deferred-work portfolio used to feed
  future Program 1 and Program 2 cycles. It is not an implementation execution
  lane.
- The current Program 1 cycle is `#1411` — **PMO Automation and Agent Workflow
  Control**. It owns planning and documentation authority for workflow
  automation, Cursor queue control, PR readiness, batch review behavior, closeout
  evidence, and Program 3 promotion rules.
- The current Program 2 cycle is `#1255` — **Website Implementation and Content
  Operations**. Program 2 remains active and must not be blocked, closed,
  relabeled, or otherwise mutated by this Program 1 planning PR.
- The prior Program 1 cycle `#1335` — **Phase 1 Wrap-Up** — is completed
  historical evidence only. It is not a parent issue for the new Program 1 cycle.
- Workflow Automation has been promoted from Program 3 (`#1379`) and the Drive
  draft context into this new Program 1 planning cycle through `#1411`.
- Cursor may prepare scoped docs and PR evidence when authorized, but may not
  merge, close, relabel, advance queues, create implementation child issues, or
  mutate issue state unless the active source issue explicitly authorizes that
  action.

## Intended Final State

- Active work maps to a current Program 1 or Program 2 execution lane, or remains
  in Program 3 as portfolio intake.
- GitHub repository docs are the authority for promoted workflow-automation
  design before workflow implementation begins.
- Program 1 planning can proceed without interfering with active Program 2
  execution.
- Future transitions between Program 1 and Program 2 use explicit completion,
  review, launch-gate, and handoff rules.
- Completed programs remain linked as evidence without becoming implicit parents
  for later cycles.

## Perpetual Program Cycle

The PMO cycle is:

1. Program 1 defines a body of work.
2. Program 1 completes or launches that body of work through bounded issues and
   PRs.
3. Program 2 executes the next authorized body of work.
4. While Program 2 executes, Program 1 may be redefined for the next planning or
   governance body of work.
5. When the active execution lane completes its gate, the lanes alternate again.
6. Program 3 continuously collects ideas and candidate work that may feed later
   Program 1 or Program 2 cycles.

This model prevents drift from treating Program 1 as permanently "governance" or
Program 2 as permanently "implementation." The lane number identifies the active
cycle position, not a fixed subject domain.

## Active Program 1 — PMO Automation and Agent Workflow Control

| Field | Value |
| --- | --- |
| Status | **Planning PR authorized** — stop at `READY FOR REVIEW` for Atlas/Bill walkthrough |
| Source issue | `#1411` |
| Implementation plan | `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md` |
| Workflow Automation authority | `docs/ops/pmo/workflow-automation.md` |
| Project slug | `program-1-pmo-automation-agent-workflow-control` |
| Non-interference context | Active Program 2 `#1255`; prior Program 1 `#1335` historical only |

### Program 1 project areas

| Area | Registry decision |
| --- | --- |
| PMO perpetual cycle authority | Program 1/2 are alternating lanes; Program 3 feeds future cycles |
| Workflow Automation design migration | Workflow Automation is promoted from Program 3 / Drive context into GitHub authority |
| Cursor continuation and queue contract | Cursor can validate and report, then stops at review handoff |
| PR readiness and batch review control | Readiness preserves Atlas/Bill review and merge authority |
| Merge and issue mutation policy | Cursor may not merge, close, relabel, queue, or mutate issues without explicit authorization |
| Queue/wave model and labels | Wave labels and run identifiers are planning concepts before workflow code changes |
| Post-merge closeout evidence stabilization | Closeout requires stable evidence before mutation or queue advancement |
| Program 3 promotion process | Portfolio items require owner promotion, repo authority, decomposition, and bounded handoff |

### Out of scope for active Program 1 planning PR

- Program 2 website/runtime implementation under `#1255`
- Workflow YAML changes
- D1 migrations
- Production configuration or secrets
- Closing, relabeling, or mutating Program 2 issues
- Creating implementation child issues before Atlas/Bill walkthrough

## Active Program 2 — Website Implementation and Content Operations

| Field | Value |
| --- | --- |
| Status | **Active execution lane** |
| Source issue | `#1255` |
| Primary plan | `docs/how-to/website/website-implementation-and-content-operations-plan.md` |
| Priority | Content Strategy / Editorial Inventory first |

Program 2 remains active while Program 1 defines the next PMO automation body of
work. Program 1 planning must not modify Program 2 issue state, relabel Program 2
issues, close Program 2 issues, or reinterpret Program 2 child project priority.

## Program 3 — Ideas & Future Projects Portfolio

| Field | Value |
| --- | --- |
| Status | **Portfolio intake and prioritization** |
| Source issue | `#1379` |
| Role | Ideas, deferred work, candidate projects, and future opportunities |

Program 3 is not an implementation queue. Items in Program 3 require:

1. owner approval for promotion;
2. finalized design or plan;
3. repository documentation authority;
4. placement into the appropriate portfolio or implementation plan;
5. scoped GitHub issue creation;
6. bounded Cursor/agent implementation scope.

Workflow Automation is the current promoted example: it moved from Program 3
candidate status into Program 1 planning through `#1411`.

## Historical Program Evidence

| Cycle | Status | Current role |
| --- | --- | --- |
| Program 1 — Phase 1 Wrap-Up (`#1335`) | Closed / historical | Evidence for prior PMO setup, not a parent issue for later Program 1 cycles |

Completed Program 1 cycles remain audit evidence and may be cited for historical
context. They do not automatically authorize new child issues, queue movement, or
parent/child relationships for later Program 1 cycles.

## Related References

- Program portfolio model:
  `/docs/reference/pmo/lgfc-program-portfolio-model.md`
- Cursor execution contract:
  `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
- PMO critical path: `/docs/ops/pmo/critical-path.md`
- PMO parallel agent rules: `/docs/ops/pmo/parallel-agent-rules.md`
- GitHub issue closeout protocol:
  `/docs/ops/pmo/github-issue-closeout-protocol.md`
