---
Doc Type: Architecture Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Orchestrator state model, routing contract, queue contract, and workflow inventory
Does Not Own: Implementation plan writing procedure; orchestration rationale; product design
Canonical Reference: /docs/governance/DOCUMENT-ARCHITECTURE.md
Last Reviewed: 2026-05-05
---

# LGFC Orchestration Model

## Definition

The LGFC orchestration model is a GitHub-native execution system for converting approved implementation plans into serially executed Issues, draft Pull Requests, agent handoffs, review states, and post-merge verification states.

## Sources

| Area | Source |
| --- | --- |
| Plan storage | `/docs/ops/implementation-plans/` |
| Routing contract | `/.github/orchestrator-routing.json` |
| Status labels | `/.github/orchestrator-labels.json` |
| Issue factory | `/scripts/orchestrator/create-issues.mjs` |
| Draft PR creation | `/scripts/orchestrator/create-draft-pr.mjs` |
| Agent trigger | `/scripts/orchestrator/trigger-agent.mjs` |
| PR state sync | `/scripts/orchestrator/sync-pr-state.mjs` |
| Queue advancement | `/scripts/orchestrator/advance-queue.mjs` |
| Queue tests | `/tests/orchestrator-queue.test.mjs` |
| CI orchestration state | `/.github/ci-orchestration-state.json` |
| CI orchestration engine | `/scripts/orchestrator/ci-orchestration-engine.mjs` |

## Plan Eligibility

Only implementation plan files under `/docs/ops/implementation-plans/` with `Status: production-ready` are eligible for issue creation.

After issue creation, the issue factory changes the plan status to `issues-created`.

`README.md` in that directory is not an executable implementation plan.

## Stable Task Identity

Each generated issue includes a stable marker:

```text
<!-- lgfc-task-id:<project-slug>:Task-000 -->
```

The marker prevents duplicate issue creation when a production-ready plan is updated after a previous factory run.

## Task Types and Agents

| Task type | Default agent | Allowed agents | PR intent labels |
| --- | --- | --- | --- |
| `repository` | `codex` | `codex` | `infra`, `platform`, `change-ops`, `codex` |
| `website` | `cursor` | `cursor` | `feature` |
| `governance` | `copilot` | `copilot`, `atlas` | `infra`, `change-ops` |
| `docs` | `atlas` | `atlas`, `copilot` | `docs-only` |
| `recovery` | `atlas` | `atlas`, `copilot`, `codex`, `cursor` | `recovery` |
| `ci` | `cursor` | `cursor`, `codex`, `copilot`, `atlas` | `infra`, `change-ops` |

## Labels

Base label:

- `orchestrator`

Status labels:

- `status:queued`
- `status:blocked`
- `status:assigned`
- `status:pr-draft`
- `status:implementation`
- `status:review`
- `status:merged`
- `status:post-merge-verify`
- `status:complete`
- `status:failed`

Type labels:

- `type:repository`
- `type:website`
- `type:governance`
- `type:docs`
- `type:recovery`
- `type:ci`

Agent labels:

- `agent:codex`
- `agent:cursor`
- `agent:copilot`
- `agent:atlas`

## Serial Queue Contract

The routing configuration sets `defaultConcurrency` to `serial`.

Issue creation applies:

- `status:queued` to the first generated task.
- `status:blocked` to every later generated task.

Queue advancement applies:

- No advancement while any orchestrator issue is in an active state.
- No advancement while any orchestrator issue is in `status:failed`.
- The oldest `status:blocked` issue advances to `status:queued` after the active pipeline completes.

Active states:

- `status:queued`
- `status:assigned`
- `status:pr-draft`
- `status:implementation`
- `status:review`
- `status:post-merge-verify`

## State Transition Model

| Transition | Trigger | Result |
| --- | --- | --- |
| Plan to issues | Push to `main` under `/docs/ops/implementation-plans/**` | Issues are created with routing and status labels |
| Queued issue to draft PR | Issue opened or labeled with `status:queued` | Draft PR branch and draft PR are created |
| Draft PR to implementation | Issue labeled `status:pr-draft` | Agent trigger comment is posted and issue enters `status:implementation` |
| Implementation to review | PR marked ready for review | Linked issue enters `status:review` |
| Review to post-merge verify | PR merged | Linked issue enters `status:post-merge-verify` |
| Post-merge pass | Sync action reports `post_merge_success` | Linked issue enters `status:complete` and closes |
| Post-merge failure | Sync action reports `post_merge_failure` | Linked issue enters `status:failed` |
| Queue advance | Issue labeled `status:complete` or `status:failed` | Queue either advances next blocked task or halts |

## Workflow Inventory

| Workflow | Event | Script |
| --- | --- | --- |
| `orchestrator-issue-factory.yml` | Push to `main` for implementation plans | `create-issues.mjs` |
| `orchestrator-draft-pr.yml` | Issue opened or labeled | `create-draft-pr.mjs` |
| `orchestrator-agent-trigger.yml` | Issue labeled | `trigger-agent.mjs` |
| `orchestrator-pr-state-sync.yml` | PR ready for review or closed | `sync-pr-state.mjs` |
| `orchestrator-queue-advance.yml` | Issue labeled complete or failed | `advance-queue.mjs` |
| `ci-orchestration-engine.yml` | Schedule or manual dispatch | `ci-orchestration-engine.mjs` |

## Draft PR Contract

The current as-built handoff does not create placeholder PRs. `create-draft-pr.mjs` moves queued issues to `status:pr-draft`, comments with handoff instructions, and lets the assigned implementation agent create a PR only after real file changes exist.

## Failure Contract

An orchestrator issue in `status:failed` halts queue advancement.

The failure state remains until recovery work changes the status through a deliberate follow-up.

## CI Orchestration Contract

The CI orchestration engine creates one active CI implementation issue at a time using the state in `/.github/ci-orchestration-state.json`.

It advances through the CI redesign phases only when the prior phase is complete, post-merge verification has succeeded, and recent CI health does not show blocking instability. Failed or stale CI implementation issues pause the rollout and create or update a remediation issue with evidence.
