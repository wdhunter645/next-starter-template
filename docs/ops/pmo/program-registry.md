---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO program registry, child-project mapping, and authoritative execution chain for LGFC orchestrated work
Does Not Own: Implementation plan task definitions, orchestrator workflow code, product design, or legacy issue disposition actions
Canonical Reference: /docs/reference/architecture/orchestration-model.md
Related Issues: #1335, #1339, #1345
Last Reviewed: 2026-06-06
---

# PMO Program Registry

## Purpose

Record the authoritative Program Management Office (PMO) structure for LGFC
orchestrated execution. This registry replaces ad-hoc issue trees with a single
program master, one active task, blocked downstream tasks, and deliberate closeout
before advancement.

## Scope

This document owns:

- The PMO execution chain and where each link is defined
- Program 1, Program 2, and Program 3 purpose, child projects, owners, and status
- Links to active implementation plans and umbrella issues

This document does not own:

- Closing or modifying legacy orchestrator issues (see disposition rules in
  `/docs/ops/pmo/critical-path.md` and Task 007 automation backlog)
- Runtime orchestrator behavior (see `/docs/reference/architecture/orchestration-model.md`)

## PMO Execution Chain

The authoritative chain for orchestrated work:

```text
Program → Child Project → Task → Issue → PR → Verification → Closeout
```

| Link | Definition | Primary source |
| --- | --- | --- |
| Program | Multi-task initiative with umbrella issue and launch gate | This registry |
| Child Project | Domain or workstream under a program (CI, Website, Docs, OPS) | Implementation plan + umbrella issue |
| Task | Single executable unit in a production-ready plan | `/docs/ops/implementation-plans/` |
| Issue | GitHub issue with `lgfc-task-id` marker and orchestrator labels | Issue factory |
| PR | One implementation pull request per task issue | Assigned agent |
| Verification | Required gates, reviewer disposition, post-merge validation | PR governance + CI gates |
| Closeout | Source issue closure, evidence recorded, queue advancement | Post-merge closeout + PMO rules |

Orchestration mechanics (labels, queue contract, agents): `/docs/reference/architecture/orchestration-model.md`

Parallel agent constraints: `/docs/ops/pmo/parallel-agent-rules.md`

Critical-path and serial queue rules: `/docs/ops/pmo/critical-path.md`

## Current Known Truth

- Program 1 umbrella issue `#1335` is open. Tasks `#1339`–`#1346` exist from
  `program-1-phase1-wrapup-rollout.md`; Task `#1345` now owns the automation
  backlog classification at `docs/ops/reports/program-1-automation-backlog.md`.
- Task `#1339` (PMO registry) was promoted under a **one-time bootstrap exception**
  to establish governance before legacy backlog disposition.
- Legacy orchestrator issues (website T-tasks, CI phase-2 blocked tasks `#1273`–`#1276`,
  failed `#1089`, and others) remain open for evidence preservation. Program 1
  Tasks 006–007 classify health findings and automation backlog disposition; they
  do not authorize bulk issue creation or closure.
- Program 2 implementation plans must not move to `issues-created` until Program 1
  Task 008 launch-gate sign-off.

## Intended Final State

- All active work maps to a program and child project in this registry.
- Legacy issues are closed or superseded only under documented PMO rules after
  Program 1 wrap-up tasks complete.
- Program 2 child projects launch with issue-per-task structure after launch-gate sign-off.

## Program 1 — Phase 1 Wrap-Up

| Field | Value |
| --- | --- |
| Status | **Active** |
| Owner | Atlas (governance), Cursor (implementation tasks) |
| Umbrella issue | `#1335` |
| Implementation plan | `docs/ops/implementation-plans/program-1-phase1-wrapup-rollout.md` |
| Project slug | `program-1-phase1-wrapup-rollout` |

### Purpose

Draw the hard line under Phase 1 across CI, Website, Docs/DIATAXIS, and OPS.
Preserve evidence, document as-built surfaces, classify automation backlog, and
authorize Program 2 only after launch-gate sign-off.

### Child projects (within Program 1)

| Child project | Task issues | Focus |
| --- | --- | --- |
| PMO governance | `#1339` | Registry, critical path, parallel-agent rules |
| CI as-built | `#1340` | Close `#1075`, stale redesign issues; evidence only |
| Website as-built | `#1341` | Reconciliation doc; tracker retirement guidance |
| Docs/DIATAXIS status | `#1342` | Transition status; not full migration |
| OPS monitoring | `#1343` | Monitoring snapshot and gap record |
| Operational health | `#1344` | Synthesized P0/P1/P2 findings |
| Automation classification | `#1345` | Program 2 vs Program 3 backlog report |
| Program 2 launch gate | `#1346` | Sign-off before Program 2 activation |

### Out of scope for Program 1

- Program 2 CI maintenance (phase-2 Tasks 002–005 under `#1058`)
- Website feature implementation under `#1255`
- Full `#1132` documentation remediation (Program 3 unless promoted)

## Program 2 — Phase 2 Launch

| Field | Value |
| --- | --- |
| Status | **Blocked** until Program 1 Task 008 sign-off |
| Owner | Program owner (human sign-off) + Atlas (planning) |
| Gate document | `docs/ops/reports/program-2-launch-gate.md` (created by Task 008) |

### Purpose

Execute Phase 2 build and hardening work across authorized child projects after
Phase 1 evidence and PMO rules are in place.

### Planned child projects (not yet authorized)

| Child project | Umbrella / plan | Preconditions |
| --- | --- | --- |
| CI maintenance | `#1058`, `issue-1075-ci-phase2-closeout-rollout.md` Tasks 002–005 | Program 1 Task 002 closeout complete; launch gate signed |
| Website completion | `#1255` | Program 1 Task 003 reconciliation complete; launch gate signed |
| Docs completion | Program 1 Task 004/007 outputs | Launch gate signed |
| OPS hardening | Program 1 Task 005/007 outputs | Launch gate signed |
| Automation / agent orchestration | Program 1 Task 007 backlog | Launch gate signed |

### Activation rule

No Program 2 implementation plan may move to `issues-created` until
`docs/ops/reports/program-2-launch-gate.md` records program owner approval.

## Program 3 — Deferred / Holding

| Field | Value |
| --- | --- |
| Status | **Deferred** |
| Owner | Program owner |
| Primary reference | `#1132` documentation remediation |

### Purpose

Hold scope explicitly deferred from Program 1 and Program 2 until promoted by
program owner decision or Program 1 Task 007 classification.

### Typical contents

- Full `#1132` legacy documentation migration execution
- External alerting integrations
- Tutorial expansion and non-critical doc curation
- Items marked Program 3 in `docs/ops/reports/program-1-automation-backlog.md`

## Legacy Backlog (Evidence Preservation)

The following open orchestrator-related issues are **not** current PMO authority.
Do not bulk-close them. Use Program 1 Task 006 health findings, Task 007 backlog
classification, and PMO closeout rules before any owner-approved disposition.

| Category | Examples | Disposition owner |
| --- | --- | --- |
| Website T-task orchestrator issues | `#1108`–`#1127`, `#1014`–`#1017` | Task 003 reconciliation + Task 007 classification |
| CI phase-2 blocked tasks | `#1273`–`#1276` | Remain blocked; Program 2 after launch gate |
| Failed orchestration | `#1089` | Task 006 health review |
| Stale CI redesign children | `#1195`, `#1199` | Task 002 closeout |

## Related References

- Implementation plans: `/docs/ops/implementation-plans/README.md`
- Orchestration model: `/docs/reference/architecture/orchestration-model.md`
- Program 1 plan: `/docs/ops/implementation-plans/program-1-phase1-wrapup-rollout.md`
