---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Serial vs parallel critical-path rules for PMO-orchestrated work across CI, Website, Docs, and OPS tracks
Does Not Own: Orchestrator queue implementation code, individual task acceptance criteria, or legacy issue closure actions
Canonical Reference: /docs/ops/pmo/program-registry.md
Related Issues: #1335, #1385
Last Reviewed: 2026-06-06
---

# PMO Critical Path

## Purpose

Define how work advances through Program 1 and subsequent programs so that one
implementation task is active at a time, evidence is preserved, and parallel effort
does not create competing issue trees.

## Scope

This document owns:

- Default serial queue behavior for orchestrator-labeled implementation tasks
- Track interaction rules across CI, Website, Docs, and OPS during Program 1
- Bootstrap and launch-gate exceptions

This document does not own:

- Modifying GitHub issue labels or closing legacy issues (requires explicit task
  authorization and PMO disposition rules)
- Program 2 execution order after launch gate (defined in launch-gate report)

## Current Known Truth

- Orchestrator issue factory creates the first new task as `status:queued` only when
  no open `orchestrator`-labeled issue exists; otherwise new tasks start
  `status:blocked`.
- A one-time **PMO bootstrap exception** promoted `#1339` to `status:queued` while
  legacy orchestrator issues remain open for evidence preservation.
- Program 1 Tasks `#1339`–`#1345` are **complete** on `main`.
- Task 008 launch gate is active under `#1385`; PR `#1382` was hygiene only and did
  not complete Task 008. Program 1 is not fully closed until the launch gate merges
  and **Bill** records approval.
- Program 2 plans and tasks (including `#1273`–`#1276`) remain blocked until the
  launch gate is approved. Adopted P0 findings H-001–H-003 must be remediated in the
  sequencing order defined in `program-2-launch-gate.md` before dependent Program 2
  implementation proceeds.

## Intended Final State

- All agents and maintainers use this document to decide what may run in parallel
  vs what must wait.
- Legacy backlog disposition follows Task 006–007 outputs and registry rules, not
  ad-hoc bulk closure.
- Program 2 critical path is recorded in `docs/ops/reports/program-2-launch-gate.md`.

## Default Rule — One Active Implementation Task

```text
Program master issue → one active task issue → one implementation PR → verify → closeout → next task
```

| State | Meaning | Who may implement |
| --- | --- | --- |
| `status:queued` / `status:pr-draft` / `status:implementation` / `status:review` | Active pipeline slot | One primary agent on the active task only |
| `status:blocked` | Waiting for upstream task or queue slot | Read-only exploration only (see parallel-agent rules) |
| `status:post-merge-verify` / `status:complete` | Terminal or verifying | No new implementation until queue advances |

**Invariant:** At most one orchestrator implementation task may hold an active
pipeline state (`queued` through `review`) per program unless the program owner
documents an explicit PMO exception.

## Program 1 Task Sequence

Mandatory serial order for **implementation** (merge) work:

```text
Task 001 (#1339) → Task 002 (#1340) → Task 003 (#1341) → Task 004 (#1342)
  → Task 005 (#1343) → Task 006 (#1344) → Task 007 (#1345) → Task 008 (#1346)
```

| Task | Track | Depends on | Implementation gate |
| --- | --- | --- | --- |
| 001 PMO registry | Governance | none | Must merge before Tasks 002–005 implementation |
| 002 CI as-built | CI | 001 | Docs/closeout only; no workflow changes |
| 003 Website as-built | Website | 001 | Docs only; no application code |
| 004 DIATAXIS status | Docs | 001 | Status report only |
| 005 OPS snapshot | OPS | 001 | Docs only |
| 006 Health review | Cross-cutting | 002–005 | Synthesis report only |
| 007 Automation backlog | Governance | 006 | Classification only; no implementation PRs |
| 008 Launch gate | Governance | 007 | Sign-off record; authorizes Program 2 |

### Read-only parallel window (Tasks 002–005)

After Task 001 merges, agents may perform **read-only** audit and research for
Tasks 002–005 in parallel. Rules:

- No implementation PRs for `#1340`–`#1345` until the queue advances to that task.
- No file changes under another task's allowlist.
- Findings feed the active or next task issue as comments, not new orchestrator issues.

## Track Rules (CI, Website, Docs, OPS)

During Program 1 wrap-up, tracks are **documentation and closeout surfaces**, not
parallel implementation lanes.

| Track | Program 1 task | Parallel with other tracks? |
| --- | --- | --- |
| CI | 002 | Read-only research only after 001 merges |
| Website | 003 | Read-only research only after 001 merges |
| Docs | 004 | Read-only research only after 001 merges |
| OPS | 005 | Read-only research only after 001 merges |

Cross-track synthesis happens in Task 006. Disposition and Program 2/3 routing
happens in Task 007. Authorization happens in Task 008.

## Queue Advancement

After a task PR merges and post-merge verification completes:

1. Close or reconcile the task source issue with evidence.
2. Run queue advancement (automation or maintainer) to promote the next
   `status:blocked` Program 1 task to `status:queued`.
3. Do not skip tasks or open implementation PRs for later task issues.

Queue contract details: `/docs/reference/architecture/orchestration-model.md`

## Legacy Backlog — Do Not Bulk-Close

Open legacy orchestrator issues are **out of the active critical path** but remain
evidence until deliberate disposition.

| Action | Allowed now? | When allowed |
| --- | --- | --- |
| Bulk-close website T-task issues | **No** | After Task 003 reconciliation + PMO disposition rules |
| Close CI phase-2 tasks `#1273`–`#1276` | **No** | Program 2 after launch gate |
| Close failed `#1089` without review | **No** | Task 006 health review recommendation |
| Promote `#1339` under bootstrap exception | **Done** | Documented one-time exception |

## Exceptions

| Exception | Authority | Notes |
| --- | --- | --- |
| PMO bootstrap (`#1339` queued while legacy issues open) | Program owner + documented comment on `#1335`, `#1339` | One-time; establishes this registry |
| Program owner parallel authorization | Human program owner | Must be recorded on the program umbrella issue |
| Program 2 activation | Task 008 sign-off | Unblocks Program 2 plans and `#1273`–`#1276` |

## Related References

- Program registry: `/docs/ops/pmo/program-registry.md`
- Parallel agent rules: `/docs/ops/pmo/parallel-agent-rules.md`
- Program 1 plan: `/docs/ops/implementation-plans/program-1-phase1-wrapup-rollout.md`
