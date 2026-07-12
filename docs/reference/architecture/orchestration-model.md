---
Doc Type: Architecture Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Generic implementation-plan issue generation, routing, queue state, PR handoff, and post-merge queue advancement
Does Not Own: Dedicated CI redesign phase generation, PR-process policy, branch protection settings, or product design
Canonical Reference: /docs/governance/DOCUMENT-ARCHITECTURE.md
Related Issues: #2469
Last Reviewed: 2026-07-12
---

# LGFC Orchestration Model

## Purpose

Define the active generic orchestration architecture after retirement of the dedicated #1075 CI phase engine.

## Scope

This reference covers approved implementation-plan issue generation, task routing, serial queue state, draft PR handoff, PR-state synchronization, and queue advancement. It excludes CI redesign phase generation, branch protection, reviewer policy, and production monitoring.

## Current known truth

The generic orchestration model remains active for explicitly approved production-ready implementation plans. The dedicated #1075 scheduled phase engine, fixed JSON state, and `lgfc-ci-phase:*` generation are retired by #2469.

## Intended final state

Generic orchestration remains bounded to approved plans and stable task markers. Historical #1075 state cannot authorize work, create blockers, or influence queue decisions.

## Current scope

The active generic orchestration model converts explicitly approved implementation plans into issue-scoped work. It may create stable task issues, route them by task type, manage serial queue labels, synchronize linked PR state, and advance a blocked queue after post-merge verification.

The dedicated CI redesign phase engine created under #1075 is retired by #2469. Generic orchestration must not infer or generate CI redesign phases from historical #1075 state.

## Active sources

| Area | Source |
| --- | --- |
| Plan storage | `/docs/ops/implementation-plans/` |
| Routing contract | `/.github/orchestrator-routing.json` |
| Status labels | `/.github/orchestrator-labels.json` |
| Issue factory | `/scripts/orchestrator/create-issues.mjs` |
| Draft PR handoff | `/scripts/orchestrator/create-draft-pr.mjs` |
| Agent trigger | `/scripts/orchestrator/trigger-agent.mjs` |
| PR state sync | `/scripts/orchestrator/sync-pr-state.mjs` |
| Queue advancement | `/scripts/orchestrator/advance-queue.mjs` |
| Queue tests | `/tests/orchestrator-queue.test.mjs` |

## Plan eligibility

Only implementation-plan files under `/docs/ops/implementation-plans/` with `Status: production-ready` are eligible for issue creation. Retired and historical plans must never use that status.

Each generated issue includes a stable marker:

```text
<!-- lgfc-task-id:<project-slug>:Task-000 -->
```

The marker prevents duplicate task creation when a plan is updated.

## Queue contract

The generic issue factory may label the first generated task `status:queued` and later tasks `status:blocked`. Queue advancement remains serial unless a separately approved program defines another execution model.

Queue advancement must halt while:

- an active orchestrator issue exists;
- an orchestrator issue is labeled `status:failed`;
- post-merge verification has not completed;
- authority or dependency state is ambiguous.

## PR and closeout boundary

Generic orchestration may update issue lifecycle labels associated with a linked PR. Automatic post-merge source-issue reconciliation is owned by `.github/workflows/post-merge-closeout.yml` and must remain single-owner and idempotent.

The generic orchestrator does not own:

- required PR checks;
- reviewer lifecycle policy;
- current CI redesign;
- branch protection configuration;
- production runtime monitoring.

## Workflow inventory

| Workflow | Event | Script |
| --- | --- | --- |
| `orchestrator-issue-factory.yml` | Approved implementation-plan change | `create-issues.mjs` |
| `orchestrator-draft-pr.yml` | Issue opened or queued | `create-draft-pr.mjs` |
| `orchestrator-agent-trigger.yml` | Issue handoff label | `trigger-agent.mjs` |
| `orchestrator-pr-state-sync.yml` | PR ready/merged lifecycle event | `sync-pr-state.mjs` |
| `orchestrator-queue-advance.yml` | Terminal issue label | `advance-queue.mjs` |

## Retired architecture

The following #1075-only model is historical and non-executable:

- scheduled CI phase selection;
- `.github/ci-orchestration-state.json`;
- `lgfc-ci-phase:*` issue generation;
- automatic #1089-style CI orchestration remediation;
- fixed #1075 decomposition inventory.

Historical records remain evidence only and must not be treated as operational authority.
