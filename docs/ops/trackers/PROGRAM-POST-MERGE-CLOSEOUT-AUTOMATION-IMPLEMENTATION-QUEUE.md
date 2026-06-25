---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Program post-merge closeout automation hardening serial queue, child-task specifications, and agent assignment guidance
Does Not Own: Program #1923 backlog body content, website implementation, or merge authority
Canonical Reference: /docs/ops/pmo/program-registry.md
Related issues: #1963, #1964, #1965, #1966, #1967, #1968, #1969, #1970, #1971
Last Reviewed: 2026-06-23
---

# Program #1963 — CI Post-Merge Closeout Automation Hardening Implementation Queue

## Launch-state control

> **Launched 2026-06-23** by operator authorization. Cursor may execute child tasks serially, one PR per task, and hand off each PR at `READY FOR MERGE` for human merge authorization. Merge authority remains with Bill/the human operator per `Agent.md` and `docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`.

## Program metadata

| Field | Value |
| --- | --- |
| **Program title** | CI Post-Merge Closeout Automation Hardening |
| **Source issue** | `#1963` |
| **Program purpose** | Reduce closeout replay churn, API rate-limit failures, and generator/replay validator gaps observed during Program #1923 Wave 3b |
| **Execution mode** | Launched-program queue — **serial only** |
| **Predecessor programs** | #1500 (closeout stabilization), #1847 (self-healing), #1923 (ops-pr-escalation burn-down) |
| **PMO registry** | `docs/ops/pmo/program-registry.md` |

## Observed failure modes (2026-06-23 evidence)

| # | Failure mode | Evidence |
| --- | --- | --- |
| F1 | Push to one manifest replays entire `DEFAULT_MANIFESTS` stack | Wave 3b merge run `28035785514` |
| F2 | GitHub App installation rate limits abort tail of batch | PRs #1491–#1521 failed 403 in closeout run |
| F3 | Manifest prune skipped on `partial_failure` | `prune_closeout_manifest.mjs` requires full success |
| F4 | Completed wave manifests remain in default replay set | wave1/2/3a still in `DEFAULT_MANIFESTS` |
| F5 | Generator `--validate` passes but replay fails `late_reviewer_finding` | Wave 3a remediation loop |
| F6 | `partial_failure` fails workflow; manual re-dispatch required | closeout workflow exit 1 |
| F7 | Backlog metrics not emitted; operators misread `gh issue list` page size | 30 vs 69 vs 207 confusion |

## Dependency order

```text
Task 001 (path-scoped manifest replay on push)
  → Task 002 (GitHub API retry/backoff + rate-limit rerun queue)
    → Task 003 (per-target manifest prune on partial_failure)
      → Task 004 (active manifest registry + retire completed waves)
        → Task 005 (generator late-reviewer-finding alignment)
          → Task 006 (partial_failure workflow model + manifest job sharding)
            → Task 007 (backlog metrics + batch report taxonomy)
              → Task 008 (rollout checkpoint + runbook updates)
```

## Serial execution rule

- One child issue → one branch → one PR.
- Next task begins only after predecessor merges and post-merge closeout is verified for that task.
- Stay within each child issue file-touch allowlist.

## Child task index

| Task | Issue | Title |
| --- | --- | --- |
| 001 | #1964 | Path-scoped closeout manifest replay on push |
| 002 | #1965 | GitHub API resilience and rate-limit rerun queue |
| 003 | #1966 | Per-target manifest pruning on partial_failure |
| 004 | #1967 | Active manifest registry and completed-wave retirement |
| 005 | #1968 | Closeout body generator late-reviewer alignment |
| 006 | #1969 | Closeout workflow partial_failure and job sharding |
| 007 | #1970 | Backlog metrics and batch report taxonomy |
| 008 | #1971 | Program rollout checkpoint and runbook updates |

## Task status

| Task | Issue | Status | Merge evidence |
| --- | --- | --- | --- |
| 001 | #1964 | complete | PR #1972 @ `82517eb0280dbdaa337a2080dadf51e64d46d651` |
| 002 | #1965 | complete | PR #1976 @ `21abad7eb3b0682108e4c29c2f9372eb58160b62` |
| 003 | #1966 | complete | PR #1977 @ `30cbf066ebffef574207f194e91ab47d13697748` |
| 004 | #1967 | in progress | — |

## Archived closeout manifests (Task 004)

Completed Program #1923 wave manifests remain in-repo for manual `workflow_dispatch` replay but are excluded from `scripts/ci/post-merge-closeout/targets-active.json` automatic replay:

| Manifest | Status |
| --- | --- |
| `targets-ops-burn-down-wave1.json` | archived |
| `targets-ops-burn-down-wave2.json` | archived |
| `targets-ops-burn-down-wave3a.json` | archived |
| `targets-ops-burn-down-wave3a-remediation.json` | archived |

Active automatic replay is defined by `targets-active.json`.
