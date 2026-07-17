---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Project Design Authority
Owns: Project #2294 architecture, continuous-control boundaries, work-conserving dispatch, broad ChatGPT watcher behavior, local Cursor pickup, time-based alerting, concurrency, idempotency, and failure recovery
Does Not Own: Project launch authorization, production merge approval, product priority, secrets, credentials, ChatGPT product configuration outside the documented watcher contract, or automatic merge to main
Canonical Reference: /docs/explanation/projects/agent-issue-polling-handoff-routing-design.md
Related Issues: #2294, #2546, #2550, #2554
Last Reviewed: 2026-07-17
---

# Agent Issue Polling and Handoff Routing Design

## Purpose

Define the complete target architecture for Project #2294: a repository-centered continuous workflow in which deterministic CI, local Cursor, and ChatGPT watchers cooperate to keep approved Issues and pull requests moving toward their intended completion objectives without unnecessary idle time, repeated human copy/paste, or paid OpenAI API execution.

The design consumes the communication state machine established by #2550. It does not create a competing label/comment authority model.

## Approved outcome

The completed system provides:

- GitHub Issues as executable work authority;
- labels as current routing and execution state;
- comments as durable events, instructions, evidence, claims, and alert records;
- deterministic CI monitoring and bounded action across Issues, PRs, checks, reviews, integrations, successor activation, and closeout;
- a local Cursor poll-wake loop for exact executable Cursor tasks;
- five staggered ChatGPT watchers that each load the GitHub app/connector, review repository status broadly, and perform the highest-priority authorized ChatGPT action available;
- repository-native event and time-based alerts that accelerate attention without narrowing ChatGPT review to an alert-only queue;
- work-conserving lane scheduling so blocked serial work does not idle independent approved work;
- duplicate, stale-event, and collision suppression across CI, Cursor, and ChatGPT;
- fail-closed production and authority boundaries;
- no paid OpenAI API worker.

## Non-negotiable constraints

1. Do not use the OpenAI API.
2. No automation may merge automatically to `main`.
3. Cursor cannot approve or merge its own work.
4. CI performs deterministic work only. It must not imitate substantive ChatGPT judgment.
5. ChatGPT watchers are not limited to `agent:ChatGPT`, `CHATGPT HANDOFF`, or another narrow trigger field.
6. Every ChatGPT watcher run must initialize the connected GitHub app/connector before assessing or mutating repository state.
7. Repository authority and live GitHub state override memory, prior watcher summaries, and stale comments.
8. Approved executable work should not remain idle while an eligible agent has capacity and a safe non-colliding action exists.
9. Serial dependencies remain serial. Independent work may proceed in parallel only when the manifest, branch, file scope, and issue-mutation sets permit it.
10. Alerts are acceleration and observability signals. They are not a second authority model.

## Authority chain

Project #2294 consumes, in order:

1. `Agent.md` and repository governance authority;
2. Project #2546 project-delivery model;
3. Task #2550 canonical communication contract;
4. `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`;
5. `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`;
6. `docs/how-to/cursor/github-poll-wake-loop.md`;
7. this project design, implementation plan, manifest, and operator runbook;
8. linked task Issues and their bounded PRs.

If these sources conflict, execution stops at the conflict and routes to ChatGPT/Bill. The system must not infer authority from chat memory.

## Current-state dependency discovered during preparation

Creating `component/agent-issue-polling-handoff-routing` exposed a PMO Project Task Materializer event-routing defect:

- the workflow can run on creation of a new `component/**` branch because GitHub computes a new-branch diff for path filters;
- non-manual events currently fall back to the #2546 manifest instead of resolving the manifest that triggered the event;
- unrelated component branch creation can therefore validate or materialize the wrong project package.

Task #2554 owns integrated materializer validation and operator handoff. Resolution or explicit safe disposition of this defect is a #2294 launch prerequisite. The #2294 preparation branch may proceed, but the project is not Go/No-Go ready while manifest event routing is unproven.

## System architecture

```text
GitHub Issue / PR / review / check / merge / schedule event
                          |
                          v
             Deterministic event normalizer
                          |
                          v
          Repository state resolver + evidence adapters
                          |
                          v
       Eligibility, dependency, lane, and authority evaluator
                          |
            +-------------+--------------+
            |                            |
            v                            v
  Deterministic CI action          Attention/alert record
            |                            |
            v                            v
 label/comment/check/merge-       Next broad ChatGPT watcher
 successor/closeout action        repo review and action
            |
            v
 Local Cursor poller sees exact `agent:cursor + handoff:ready`
            |
            v
 Cursor ACK -> implementation -> STATUS/COMPLETE/HANDOFF
```

The architecture has four cooperating execution surfaces.

### 1. Deterministic CI continuous control

CI continuously converts repository events and scheduled reconciliation into bounded actions. It may:

- validate current issue, task, project, and manifest structure;
- collect required and advisory PR evidence;
- classify checks, reviews, mergeability, branch freshness, scope, and protected changes;
- enforce deterministic communication-state invariants;
- correct stale or contradictory workflow labels when the correct state is unambiguous;
- keep routine non-`main` progress Cursor-owned;
- integrate technically eligible non-`main` child PRs when repository authority permits;
- activate the exact eligible manifest successor after verified integration;
- run deterministic post-merge closeout and remediation;
- detect idle approved work and controller/poller health failures;
- create or update structured alerts and bounded remediation records.

CI must not:

- invent project scope, tasks, successors, dependencies, or priority;
- write a substantive `CHATGPT RESPONSE` or `CHATGPT CLOSEOUT` decision;
- resolve ambiguous product, design, governance, legal, privacy, credential, cost, security, repository-setting, or production questions;
- approve protected changes without the required independent authority;
- dismiss substantive review findings;
- represent itself as ChatGPT or Cursor;
- claim that a local agent picked up work without `CURSOR ACK` or equivalent evidence;
- launch a held or pipeline project;
- approve or merge to `main`.

### 2. Local Cursor poll-wake execution

Cursor pickup remains intentionally narrow and deterministic:

- issue is open;
- issue has `agent:cursor` and `handoff:ready`;
- latest valid event is `CURSOR ASSIGNMENT` or a `CHATGPT RESPONSE` restoring ready state;
- task belongs to a launched project or otherwise has explicit execution authority;
- manifest dependencies are satisfied;
- no colliding `handoff:in-progress` claim exists in the lane;
- local poller state has not already consumed the event.

Cursor then posts `CURSOR ACK`, replaces `handoff:ready` with `handoff:in-progress`, executes the bounded task, and reports `CURSOR STATUS`, `CURSOR COMPLETE`, or a genuine `CHATGPT HANDOFF`.

### 3. Broad ChatGPT watcher operation

Each watcher run is a repository agent cycle, not a narrow notification check.

Every run must:

1. initialize the GitHub app/connector and confirm repository access;
2. load current repository authority from live files and Issues;
3. inspect active projects, executable tasks, open PRs, checks, reviews, handoffs, integration state, closeout state, and workflow health;
4. consider repository alerts as priority signals but not exclusive inputs;
5. identify the highest-priority authorized ChatGPT action that can materially advance an approved objective;
6. claim the action using the idempotency protocol;
7. re-read live state immediately before mutation;
8. perform the action using the full GitHub connector capability actually granted;
9. record the result, successor, or exact halt reason;
10. stop without mutation when no safe authorized ChatGPT action exists.

Examples of authorized ChatGPT watcher work include:

- respond to a genuine `CHATGPT HANDOFF`;
- review protected or governance-sensitive changes;
- inspect and disposition failing CI or review blockers;
- rerun a failed workflow when evidence indicates a transient failure and rerun authority exists;
- merge an eligible non-`main` PR when the builder is not self-merging and authority permits;
- correct deterministic routing drift;
- activate an exact manifest successor;
- prepare or update bounded PMO/governance documentation;
- perform closeout verification and issue/PR finalization;
- create or update a bounded remediation record;
- route a production or `main` boundary to Bill/ChatGPT approval.

The watcher must not treat absence of `agent:ChatGPT` or an alert as proof that no ChatGPT work exists.

### 4. Repository alerts and observability

Alerts improve response time and context. They do not replace broad watcher review.

An alert is a durable, non-authoritative event with a stable key:

```text
LGFC ROUTING ALERT
Alert ID: <stable hash or deterministic key>
Class: pickup-stall | integration-stall | successor-gap | unresolved-handoff | ci-failure | review-block | state-conflict | controller-health | closeout-exception
Severity: info | warning | action-required | needs-human
Detected At: <ISO-8601 UTC>
Subject: issue:#... | pr:#... | project:#...
State Revision: <commit SHA, event ID, comment ID, or label fingerprint>
Evidence:
- <exact evidence>
Recommended bounded action:
- <one action>
Authority boundary:
- ci-actionable | chatgpt-actionable | cursor-actionable | human-required
Supersedes: <alert ID or none>
```

Alerts must be deduplicated by `Alert ID`, updated rather than reposted when state changes, and closed/superseded when resolved.

## CI reuse strategy

Project #2294 should compose existing deterministic assets instead of recreating them.

### Reuse directly or through adapters

- `gate-quality.yml` / `quality` evidence;
- `gitleaks.yml` / `gitleaks` evidence;
- `gate-pr-hygiene.yml` advisory artifacts;
- `gate-diff-scope.yml` advisory artifacts;
- `reviewer-response-completion.yml` review-lifecycle evidence;
- `component-child-integration.yml` and `component_integration_eligibility.mjs` for non-main child eligibility;
- `post-merge-closeout.yml` for canonical automatic source-issue closeout;
- `post-merge-remediation.yml` for closeout failure support;
- `ops-post-merge-self-healing.yml` for scheduled exception hygiene;
- AI Execution Bridge validation and planning patterns, excluding any future AI execution hook.

### Do not use as the controller

- hardcoded program-specific attention pulses;
- `project-implementation-orchestrator.yml` in its current generic `@cursor` / main-targeting form;
- one-off bridge workflows tied to specific historical issues;
- manual-only placeholder workflows with no current deterministic implementation;
- any retired CI orchestration state engine.

## Proposed repository components

| Component | Responsibility |
| --- | --- |
| `.github/workflows/ops-agent-routing-controller.yml` | Event-driven deterministic controller |
| `.github/workflows/ops-agent-routing-reconcile.yml` | Scheduled time-based reconciliation and health checks |
| `scripts/agent-routing/state-resolver.mjs` | Normalize live Issue/PR/manifest/check/review state |
| `scripts/agent-routing/action-planner.mjs` | Produce deterministic safe action or attention disposition |
| `scripts/agent-routing/alert-ledger.mjs` | Stable alert IDs, dedupe, supersession, and resolution |
| `scripts/agent-routing/time-policy.mjs` | Configurable idle/stall threshold evaluation |
| `scripts/agent-routing/lane-eligibility.mjs` | Serial/parallel lane and mutation-collision evaluation |
| `scripts/agent-routing/github-actions.mjs` | Bounded GitHub mutation adapter |
| `scripts/agent-routing/config.json` | Thresholds, enabled actions, protected boundaries, rollout mode |
| `tests/agent-routing/**` | Unit, fixture, event-matrix, idempotency, and boundary tests |
| `docs/how-to/agents/operate-agent-routing.md` | Startup, shutdown, troubleshooting, rollback, and handoff |

Names may be adjusted during implementation only when repository conventions require it; responsibilities and boundaries are fixed by this design.

## Event model

The controller observes:

- `issues`: opened, reopened, closed, labeled, unlabeled, assigned, unassigned;
- `issue_comment`: created and edited;
- `pull_request`: opened, synchronize, reopened, ready_for_review, converted_to_draft, closed;
- `pull_request_review`: submitted, edited, dismissed;
- `pull_request_review_comment`: created, edited, deleted where useful;
- `workflow_run`: completed for required/advisory evidence workflows;
- `check_suite` or `check_run` only when existing evidence cannot be obtained from `workflow_run`;
- scheduled reconciliation;
- manual dispatch for dry-run, scoped replay, and recovery.

Every event is normalized to a stable event ID and subject revision. Repeated delivery must produce no duplicate mutation.

## State and action model

The resolver produces one normalized snapshot containing:

- repository and authority version;
- project and task identity;
- manifest lifecycle and launch state;
- current labels;
- latest valid communication event per marker class;
- predecessor/successor state;
- lane and parallel-group identity;
- PR base/head, draft state, mergeability, changed paths, protected-change classification;
- required/advisory check results;
- review state and unresolved threads;
- closeout state;
- last agent claim, progress, completion, response, integration, and alert timestamps;
- candidate deterministic actions;
- authority blockers.

The action planner returns exactly one of:

- `NO_ACTION`;
- `NORMALIZE_STATE`;
- `ROUTE_CURSOR_READY`;
- `ROUTE_CURSOR_IN_PROGRESS`;
- `MERGE_NON_MAIN_CHILD`;
- `ACTIVATE_SUCCESSOR`;
- `RUN_CLOSEOUT`;
- `OPEN_OR_UPDATE_REMEDIATION`;
- `EMIT_OR_UPDATE_ALERT`;
- `REQUEST_CHATGPT_ACTION`;
- `REQUEST_HUMAN_ACTION`;
- `FAIL_CLOSED`.

The planner must include evidence, action key, expected preconditions, exact mutations, and rollback metadata.

## Work-conserving scheduling

The system evaluates all approved active lanes rather than stopping after the first blocked lane.

A lane is eligible when:

- its project is launched or the task has explicit standalone execution authority;
- dependencies are satisfied;
- the next action is within agent authority;
- required resources and permissions are available;
- no active claim or file/issue mutation collision exists.

Serial rules:

- predecessors must integrate before successors activate;
- one active local Cursor claim per lane unless the manifest explicitly permits internal parallelism;
- a production promotion remains serial behind integrated validation and approval.

Parallel rules:

- independent manifest tasks may run concurrently when `parallelGroup` or equivalent authority declares independence;
- allowed paths and issue-mutation sets must not collide;
- separate project branches normally define separate lanes;
- blocked or human-waiting work in one lane does not block another eligible lane;
- ChatGPT may act in one lane while Cursor executes a non-colliding task in another.

The scheduler must never create work solely to keep an agent busy.

## Time-based alerting policy

Time thresholds are configurable observability controls, not new execution authority. Initial defaults for pilot validation are:

| Condition | Initial threshold | Action |
| --- | ---: | --- |
| `handoff:ready` without `CURSOR ACK` | 5 minutes | pickup-stall alert; verify poller health |
| eligible green non-main PR not integrated | 5 minutes | integration-stall alert or deterministic integration |
| predecessor integrated but successor not activated | 3 minutes | successor-gap alert or deterministic activation |
| unresolved `CHATGPT HANDOFF` | immediate alert; stale at 10 minutes | prioritize next watcher; repeat only on state revision or escalation interval |
| `handoff:in-progress` without progress evidence | 30 minutes | heartbeat warning; do not assume failure |
| routing controller/reconciler heartbeat missing | 15 minutes | controller-health alert |
| failed required workflow with no disposition | 5 minutes | CI-failure alert; transient rerun only when safe |
| watcher action claim | 10-minute lease | expired claims may be superseded after live-state recheck |

Thresholds must be stored in configuration, observable in job summaries, and tunable after pilot evidence without changing the communication authority contract.

## ChatGPT watcher claim and duplicate suppression

Because five watchers can overlap, each action candidate uses a deterministic action key:

```text
<repository>:<subject>:<state-revision>:<action-class>
```

Before mutation, a watcher:

1. searches for a non-expired `CHATGPT WATCH CLAIM` with the same action key;
2. posts a claim containing watcher ID, action key, state revision, timestamp, and lease expiry;
3. re-reads claims and yields if an earlier valid claim exists;
4. re-reads the subject state and aborts if the revision changed;
5. performs the bounded action;
6. records `CHATGPT WATCH RESULT` referencing the claim and exact mutations;
7. allows the claim to expire or marks it complete.

Claim/result comments are coordination evidence only. They do not replace `CHATGPT HANDOFF`, `CHATGPT RESPONSE`, `CURSOR ASSIGNMENT`, or routing labels.

## GitHub connector initialization contract

A watcher is not operational until it has:

- loaded the connected GitHub app/connector;
- resolved `wdhunter645/next-starter-template`;
- confirmed at least read access and identified available write capabilities;
- loaded `Agent.md` and the current canonical communication/workflow documents;
- obtained live Issue, PR, review, and check state needed for the selected action;
- confirmed the intended mutation is supported by connector permissions.

“Without limitations” means the watcher uses the full capabilities actually granted to the GitHub app. It remains subject to repository governance, GitHub permission boundaries, human approval boundaries, and genuine connector limitations.

When a required operation is unsupported, the watcher must:

1. complete all other safe authorized actions;
2. record the exact missing capability;
3. produce a bounded operator action rather than pretending completion.

## Permissions model

Use least privilege per workflow job.

Read-only evaluation normally requires:

- `contents: read`;
- `issues: read`;
- `pull-requests: read`;
- `checks: read`;
- `actions: read`.

Bounded mutation jobs request only what the selected action needs, such as:

- `issues: write` for labels/comments/closeout metadata;
- `pull-requests: write` for non-main integration metadata or merge operations;
- `checks: write` or `statuses: write` for controller evidence;
- `actions: write` only for authorized rerun/recovery behavior.

No job receives repository administration, secrets, deployment, or production permissions solely for routing.

## Security and safety

- Treat issue comments and PR text as untrusted input.
- Never execute shell commands copied from comments.
- Validate all paths, issue numbers, PR numbers, labels, event IDs, and branch names.
- Use immutable action versions or repository-approved pinning policy.
- Prevent fork PRs and untrusted events from write mode.
- Separate evaluation from mutation jobs.
- Require expected-state preconditions for every mutation.
- Redact tokens and sensitive payload fields from logs and artifacts.
- Never change Cloudflare, D1, B2, credentials, repository settings, or production resources under this project unless a separate explicit task authorizes it.

## Failure, reconciliation, and dead-letter behavior

### Event failure

- record the event ID, subject, step, and error class;
- retry only transient network/API failures with bounded backoff;
- do not repeat non-idempotent mutations blindly;
- route unresolved events to a durable dead-letter alert.

### Missed event

Scheduled reconciliation rebuilds state from live Issues, PRs, manifests, checks, and comments. Correctness must not depend on receiving every webhook/event exactly once.

### Contradictory state

Fail closed when:

- both agent routing labels are active;
- `handoff:ready` and `handoff:in-progress` coexist;
- a current label conflicts with the latest valid event and deterministic precedence is unavailable;
- multiple colliding active Cursor claims exist;
- manifest/project/issue identity does not resolve uniquely;
- a proposed action would cross the production boundary.

### Controller outage

Disable mutation mode while retaining dry-run reconciliation and alert generation. GitHub Issues, manifests, branches, and comments remain authoritative and permit manual operation.

## Rollout model

1. **Observe:** read-only state resolution, action plans, metrics, and alerts.
2. **Normalize:** enable deterministic label/comment corrections with strict allowlists.
3. **Advance:** enable successor activation, safe transient reruns, and bounded remediation.
4. **Integrate:** enable eligible non-main child integration after evidence proves correctness.
5. **Operate:** enable time-based alerts and work-conserving scheduling across approved lanes.

Every phase has a configuration kill switch and rollback procedure. Production/main merge remains manual in every phase.

## Validation strategy

Required proof includes:

- unit tests for parsing, state precedence, action planning, threshold evaluation, and alert keys;
- event-matrix tests for every supported GitHub event;
- fixtures for stale, duplicate, edited, reordered, and conflicting comments;
- serial and parallel lane tests with collision detection;
- repeated-run idempotency tests;
- missed-event reconciliation tests;
- permissions and untrusted-event tests;
- transient and permanent failure tests;
- local poller restart and consumed-event tests;
- watcher claim race and lease-expiry tests;
- proof that broad watchers find actionable work without a dedicated alert;
- proof that alerts prioritize but do not constrain watcher review;
- proof that CI never writes substantive ChatGPT decisions;
- proof that no automation can merge to `main`;
- pilot evidence showing approved work does not remain idle beyond configured thresholds without a recorded reason.

## Rollback and disable

Rollback must preserve repository authority and evidence:

1. set controller mutation mode to `disabled`;
2. disable scheduled reconciliation if it is producing unsafe noise;
3. retain read-only dry-run state reports;
4. stop local Cursor wake loop while preserving its state file;
5. disable ChatGPT watchers through ChatGPT task controls;
6. remove or resolve active watcher claims;
7. stop non-main auto-integration while preserving PRs and branches;
8. revert workflow/script/config changes through a bounded PR;
9. return to manual `CURSOR ASSIGNMENT`, explicit pickup, and ChatGPT review;
10. leave the `main` human approval boundary unchanged.

## Success criteria

Project #2294 succeeds when:

- deterministic CI safely performs all suitable routine monitoring and action;
- each ChatGPT watcher loads the GitHub connector and performs broad repository review;
- Cursor wakes only for exact eligible tasks;
- alerts and time thresholds expose stalled approved work quickly;
- serial and parallel lanes advance without collision;
- repeated events and overlapping watchers do not duplicate actions;
- missed events reconcile from live state;
- failures create bounded remediation rather than silent stops;
- no paid OpenAI API is required;
- no automation can merge to `main`;
- the system can be disabled without losing repository authority or audit evidence.
