---
Doc Type: How-To
Audience: Bill, ChatGPT, Cursor Local, LGFC maintainers
Authority Level: Operational Authority
Owns: Project #2294 startup, observation, operation, watcher behavior, local poller handling, health checks, troubleshooting, disable, rollback, and recovery
Does Not Own: Project launch approval, production merge approval, product priority, repository settings, credentials, secrets, or external-service authorization
Canonical Reference: /docs/explanation/projects/agent-issue-polling-handoff-routing-design.md
Related Issues: #2294, #2546, #2550, #2554, #2601, #2634, #2635, #2636, #2637, #2638, #2639, #2640
Last Reviewed: 2026-07-19
---

# Operate Agent Issue Polling and Handoff Routing

## Purpose

Provide the operator procedure for the Project #2294 routing system. This runbook applies only after the project receives Go and the applicable implementation task is complete. Until then, use it as preparation and validation authority only.

## Operating principles

- GitHub Issues and current repository documents are authority.
- CI performs deterministic continuous control only.
- Cursor Local picks up exact eligible work.
- ChatGPT watchers broadly review the repository and perform authorized ChatGPT work.
- Alerts accelerate attention but do not limit watcher scope.
- Work may proceed in parallel only when authority and collision checks permit it.
- No automation merges to `main`.
- No OpenAI API is used.

## Four-lane runtime (config-gated)

`scripts/agent-routing/config.json` → `fourLaneRuntime.enabled` defaults to `false`.

- **Disabled:** conservative serialized planner; automatic operational holds off; existing claims/history retained.
- **Enabled:** resolve PMO / Engineering, Implementation / Operations (nested PR review), Day-2 Operations, and vertical Administration & Communications; support assessment hold, plan adjustment, and evidence-backed resume.
- Typed dispositions are fail-closed: generic `CHATGPT RESPONSE` / `CHATGPT HANDOFF` markers never authorize integration or review-request unless an explicit `disposition` field is present. Prefer canonical markers `APPROVED FOR INTEGRATION` and `PR REVIEW REQUEST`.
- Direct/stacked dependencies stay blocked until predecessor completion unless an explicit independent class (`none` / `administrative-only`) or `independentAuthority` is recorded.

`#2639` / PR `#2646` integrated the four-lane runtime on `component/agent-issue-polling-handoff-routing`. PR `#2655` added the deterministic promotion-profile transition matrix (`scripts/agent-routing/promotion-profile-matrix.mjs`) with fail-closed bypass and unknown-profile halts. Keep `fourLaneRuntime.enabled=false` for observe pilots until ChatGPT (`agent:ChatGPT`) records an explicit enablement Go. Validation evidence for the gated module and profile matrix lives in `docs/ops/reports/agent-routing-pilot.md`.

## Roles

| Role | Normal responsibility |
| --- | --- |
| Bill | Product, cost, priority, credential, external-service, and production authority |
| ChatGPT | Preparation, governance, review, routing decisions, protected changes, closeout, Tier 2 escalation |
| Cursor Local | Implementation, validation, remediation, branch push, routine operations |
| CI controller | Deterministic monitoring, evaluation, bounded action, alerts, reconciliation |
| GitHub | Durable Issues, PRs, checks, labels, comments, branches, and workflow evidence |

## Prerequisites

Before enabling any routing component, confirm:

- Project #2294 has an explicit Go decision.
- The current project manifest validates.
- The project branch is current with its approved upstream.
- The PMO materializer event-routing remediation from PR #2603 is integrated and validated.
- Required project tasks are integrated through the current rollout phase.
- `quality` and `gitleaks` are green where applicable.
- GitHub app/connector access is operational.
- Local Cursor has authenticated `gh` access.
- No active contradictory routing labels exist.
- No project task or watcher is already performing the same action.
- Rollback and kill-switch paths have been tested.

## Configuration modes

| Mode | Behavior |
| --- | --- |
| `disabled` | No controller mutation; workflows may be disabled entirely |
| `observe` | Resolve state, plan actions, emit reports/metrics; no repository mutation |
| `normalize` | Observe plus deterministic state corrections and bounded alerts |
| `advance` | Normalize plus exact successor activation, safe rerun, remediation, and closeout actions |
| `integrate` | Advance plus eligible non-main child integration |

Start every new deployment or major configuration change in `observe`.

## Procedure

### 1. Verify repository authority

Read current versions of:

- `Agent.md`;
- `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`;
- `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`;
- `docs/how-to/cursor/github-poll-wake-loop.md`;
- Project #2294;
- the project design, implementation plan, manifest, and current task Issue.

Stop if authority conflicts.

### 2. Verify GitHub state

Check:

- open active project masters;
- current executable tasks;
- `agent:cursor`, `agent:ChatGPT`, `handoff:ready`, `handoff:in-progress`, `status:blocked`, and `status:needs-human` state;
- open PRs and their bases;
- required/advisory checks;
- unresolved review threads;
- latest canonical communication event;
- active alerts, watcher claims, and dead-letter records;
- project branch drift.

### 3. Enable observe mode

- confirm config mode is `observe`;
- enable controller and scheduled reconciler;
- run one manual scoped reconcile;
- inspect state snapshots, action plans, alerts, and metrics;
- confirm no mutation occurred;
- confirm no plan authorizes merge to `main`.

### 4. Start local Cursor loop

On the Chromebook Linux environment:

1. confirm `gh auth status` succeeds for the repository;
2. inspect `~/.cursor/github-poller/state.json`;
3. confirm no stale active claim exists;
4. start `poll-wake-loop.sh` at the approved interval;
5. confirm heartbeat output;
6. verify the loop ignores non-ready and assignee-only Issues;
7. do not clear state merely to force a pickup.

### 5. Enable ChatGPT watchers

Enable the five staggered watchers only after observe-mode evidence is accepted.

Phase 1 (`#2601`) first completed a **read-only observe-pilot** for watchers at minutes 00, 12, 24, 36, and 48. After that cycle was accepted, `#2601` `BILL / ATLAS AUTHORIZATION — WATCHERS ENGAGE, NOT REPORT-ONLY` authorized a **bounded collaboration-dispatch** role: watchers may answer routine handoffs, inspect PR/issue evidence, request bounded remediation, rerun justified failed checks, integrate authorized non-`main` component PRs when the approval profile permits, reconcile stale routing labels, close verified non-production tasks when authority permits, and activate the next eligible serial successor while preserving one active Cursor claim per serial lane. Watchers must still not merge/promote to `main` without explicit Bill/Atlas approval, approve builder-owned work on the builder's behalf, change production configuration/secrets/credentials/paid services/external infrastructure, perform destructive deletes, invent scope, or bypass unresolved authority decisions.

Each watcher must be configured to:

1. initialize the GitHub app/connector;
2. resolve `wdhunter645/next-starter-template`;
3. load live repository authority;
4. review repository status broadly;
5. use alerts as priority hints only;
6. select one highest-priority authorized ChatGPT action;
7. claim the action using a stable action key and lease;
8. re-read live state;
9. perform the full connector-supported action;
10. record result or exact halt reason.

A watcher must not return “no action” solely because no `agent:ChatGPT` label or alert exists.

### 6. Promote rollout mode

Promote one mode at a time:

1. `observe`;
2. `normalize`;
3. `advance`;
4. `integrate`;
5. steady-state operation.

Before each promotion:

- review current alerts, false positives, and duplicate suppression;
- confirm rollback works;
- confirm no unauthorized mutation occurred;
- confirm `main` remains manual;
- record the decision and evidence.

### 7. Run a scoped CREATE_DRAFT_PR (#2621)

`CREATE_DRAFT_PR` opens a draft PR from a source Issue whose `lgfc-issue-pr-contract:v1` block already passed #2620's advisory validation. It is never triggered automatically — dispatch it explicitly per Issue:

1. Confirm the Issue's `lgfc-issue-pr-contract-status:v1` comment shows `valid` at the current contract revision (re-apply `status:pr-ready` and wait for #2620's validator first if not).
2. Run `.github/workflows/ops-agent-routing-controller.yml` via `workflow_dispatch` with `mode: advance` (or `integrate`), `authorize_mutation: true`, and `issue_number` set to the source Issue.
3. The `create-draft-pr` job re-runs #2620's validator, plans the action, re-reads live state immediately before mutating, and either opens the draft PR (recording its URL on the existing status comment) or reports a specific fail-closed reason (`contract_invalid`, `contract_actor_unauthorized`, `contract_diff_empty`, `stale_head_sha`/`stale_base_sha`/`stale_contract_revision`, `existing_pr_found`, …) — nothing else fires.
4. Known limitation: a PR opened this way uses the default `GITHUB_TOKEN`, so GitHub will not automatically run other `pull_request`-triggered gates (`pr-hygiene`, `diff-scope`, required checks) against it — push an empty commit or close/reopen the PR to trigger them until a GitHub App installation token is adopted (`docs/reference/ci/issue-pr-contract.md` §7).

## Routine watcher cycle

For every watcher activation:

1. initialize connector;
2. load authority;
3. inventory broad current state;
4. identify candidate actions;
5. rank by safety, priority, dependency-unblock value, objective impact, and ownership;
6. generate the action key;
7. check active claims;
8. claim one action;
9. re-read state;
10. execute or yield;
11. record result and successor;
12. stop.

## Routine reconciler cycle

For every scheduled reconciliation:

1. rebuild live state rather than trusting prior event delivery;
2. compare current state with expected manifest and communication state;
3. evaluate all approved lanes;
4. perform safe deterministic correction when enabled;
5. update alerts and metrics;
6. record every idle lane with a precise reason;
7. do not create work merely because capacity is available.

## Time-based response checks

Use configured thresholds from `scripts/agent-routing/config.json`.

Initial pilot expectations:

- ready without ACK: 5 minutes;
- green eligible non-main PR not integrated: 5 minutes;
- integrated predecessor without successor activation: 3 minutes;
- unresolved handoff: immediate alert, stale at 10 minutes;
- in-progress heartbeat warning: 30 minutes;
- controller/reconciler heartbeat: 15 minutes;
- required workflow failure without disposition: 5 minutes;
- watcher claim lease: 10 minutes.

Do not infer failure solely from elapsed time. Re-read live evidence before any action.

## Failure handling

### Transient event or API failure

- retry only if the operation is read-only or has an idempotency key;
- use bounded backoff;
- record retry count;
- stop before repeating an ambiguous mutation.

### Permanent or ambiguous event failure

- create/update one dead-letter alert;
- record event ID, subject, state revision, failing step, and error class;
- do not relabel or repost repeatedly;
- route to ChatGPT if authority or design judgment is required.

### Controller failure

- set mutation mode to `disabled`;
- retain read-only reconciliation if safe;
- stop automatic integration and successor activation;
- preserve alerts and evidence;
- continue manual Issue/PR operation.

### Local Cursor poller failure

- stop the loop;
- preserve `state.json`;
- verify current labels and latest event;
- do not post ACK or clear wake state unless Cursor actually resumes;
- restart only after credential and state checks pass.

### Watcher overlap

- compare action keys and claim timestamps;
- earlier valid claim proceeds;
- later watcher yields;
- expired claim may be superseded only after live-state recheck;
- never delete historical claim/result evidence merely to win a race.

## Disable sequence

1. disable ChatGPT watchers;
2. set controller mutation mode to `disabled`;
3. disable scheduled reconciliation if necessary;
4. stop local Cursor loop and preserve state;
5. disable non-main automatic integration;
6. leave open Issues, PRs, manifests, and comments intact;
7. record the stop reason and last known state;
8. keep `main` manual.

## Rollback

If Project #2294 must be rolled back:

1. execute the disable sequence;
2. revert workflow/script/config changes through a bounded PR;
3. preserve manifests, Issues, alerts, claims, and dead-letter evidence;
4. restore manual `CURSOR ASSIGNMENT`, `CURSOR ACK`, explicit review, and closeout;
5. confirm no stale `handoff:ready` or `handoff:in-progress` state remains;
6. confirm no automatic `main` merge path exists.

## Operator handoff evidence

Before steady-state handoff, provide:

- final configuration and enabled mode;
- controller and reconciler workflow references;
- local poller version and state path;
- ChatGPT watcher schedules and prompts;
- permissions matrix;
- alert and claim formats;
- time thresholds;
- validation results;
- known exceptions;
- disable and rollback proof;
- Operations owner and Tier 2 escalation contact.
