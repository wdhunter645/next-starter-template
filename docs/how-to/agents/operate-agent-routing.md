---
Doc Type: How-To
Audience: Bill, ChatGPT, Cursor Local, LGFC maintainers
Authority Level: Operational Authority
Owns: Project #2294 startup, observation, operation, watcher behavior, local poller handling, health checks, troubleshooting, disable, rollback, and recovery
Does Not Own: Project launch approval, production merge approval, product priority, repository settings, credentials, secrets, or external-service authorization
Canonical Reference: /docs/explanation/projects/agent-issue-polling-handoff-routing-design.md
Related Issues: #2294, #2546, #2550, #2554
Last Reviewed: 2026-07-17
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

## Roles

| Role | Normal responsibility |
| --- | --- |
| Bill | Product, cost, priority, credential, external-service, and production authority |
| ChatGPT / Atlas | Preparation, governance, review, routing decisions, protected changes, closeout, Tier 2 escalation |
| Cursor Local | Implementation, validation, remediation, branch push, routine operations |
| CI controller | Deterministic monitoring, evaluation, bounded action, alerts, reconciliation |
| GitHub | Durable Issues, PRs, checks, labels, comments, branches, and workflow evidence |

## Prerequisites

Before enabling any routing component, confirm:

- Project #2294 has an explicit Go decision.
- The current project manifest validates.
- The project branch is current with its approved upstream.
- The #2554 PMO materializer event-routing defect is resolved or explicitly safely dispositioned.
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

## Startup sequence

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
4. `integrate`.

Require evidence for each promotion. Do not combine initial rollout with a production/main promotion.

## Normal operating cycle

### CI controller

For every qualifying event:

1. normalize event and stable ID;
2. resolve live state;
3. verify manifest, dependency, lane, and authority;
4. produce one action plan;
5. revalidate expected state;
6. mutate only when current mode and permission allow it;
7. record summary, evidence, and action key;
8. update or resolve alerts;
9. leave ambiguous state untouched and fail closed.

### Scheduled reconciler

At each interval:

1. rebuild live lane inventory;
2. detect missed events;
3. evaluate configured time thresholds;
4. detect controller, poller, and watcher-health gaps;
5. identify independent eligible work;
6. emit/update alerts or perform deterministic action allowed by mode;
7. record idle reason where no action is possible.

### Cursor Local

For each wake:

1. open the source Issue;
2. confirm `agent:cursor + handoff:ready`;
3. confirm latest valid assignment/response;
4. confirm manifest eligibility and no lane collision;
5. post `CURSOR ACK`;
6. transition to `handoff:in-progress`;
7. execute bounded work;
8. post `CURSOR STATUS`, `CURSOR COMPLETE`, or genuine `CHATGPT HANDOFF`;
9. persist consumed event and claim state.

### ChatGPT watcher

For each run:

1. initialize connector and permissions;
2. load authority and live state;
3. inspect active Issues, PRs, checks, reviews, handoffs, dependencies, closeout, and workflow health;
4. rank authorized candidate actions;
5. claim one candidate;
6. re-read state and yield on earlier valid claim;
7. perform action;
8. record result/successor/halt;
9. stop after one bounded action unless the action itself requires a single atomic sequence.

## Work selection priority

Use this default order, modified by explicit repository priority and safety:

1. production/security/safety or authority boundary requiring immediate disposition;
2. genuine unresolved ChatGPT handoff blocking approved work;
3. failing required CI or review blocker preventing integration;
4. eligible non-main integration;
5. successor activation gap;
6. ready work without pickup;
7. post-merge closeout/remediation;
8. routing contradiction or stale state;
9. active PMO/governance work that can advance independently;
10. observability or documentation maintenance.

Do not select unapproved pipeline work merely because higher-priority work is blocked.

## Time-based alerts

Initial thresholds are defined in configuration. Operators should review:

- ready-to-ACK latency;
- green-to-integration latency;
- integration-to-successor latency;
- handoff-to-response latency;
- in-progress heartbeat age;
- required-CI-failure age;
- controller/reconciler heartbeat age;
- watcher claim age.

Threshold alerts do not prove failure. Re-read live evidence before action.

## Alert handling

For an `LGFC ROUTING ALERT`:

1. validate Alert ID and subject;
2. confirm the state revision is current;
3. inspect evidence and authority class;
4. determine whether CI, Cursor, ChatGPT, or Bill owns the next action;
5. update/supersede the alert rather than posting duplicates;
6. resolve the alert only after live state confirms resolution.

## Watcher claim handling

For `CHATGPT WATCH CLAIM`:

- action key must match subject, state revision, and action class;
- lease must include UTC issue time and expiry;
- earliest unexpired valid claim wins;
- later watchers yield;
- expired claims may be superseded only after live-state recheck;
- `CHATGPT WATCH RESULT` records the completed action or no-op reason;
- claims do not transfer routing ownership.

## Health checks

### Controller

Healthy when:

- latest event/reconcile run completed within threshold;
- state snapshot and action plan were produced;
- no unresolved dead-letter event exists without alert;
- mutation mode matches configuration;
- required permissions are no broader than expected.

### Cursor poller

Healthy when:

- loop process is running;
- heartbeat is current;
- state file is readable and valid;
- last consumed event is plausible;
- no duplicate active lane claim exists;
- ready work is picked up within threshold.

### ChatGPT watchers

Healthy when:

- all enabled watcher schedules exist;
- runs initialize the GitHub connector;
- repository scans are broad;
- claims/results are idempotent;
- connector capability failures are explicit;
- no watcher repeatedly performs the same action.

## Troubleshooting

### PMO materializer fires on unrelated new component branch

Symptoms:

- PMO Project Task Materializer runs when a new `component/**` branch is created;
- job validates the #2546 manifest rather than the changed/new project manifest;
- no intentional materializer dispatch occurred.

Actions:

1. inspect event type and branch;
2. inspect resolved `manifest_path` in job summary;
3. confirm whether the event contained an actual changed manifest;
4. disable or hold mutation; this workflow should be dry-run on non-manual events;
5. verify #2554 correction for event-to-manifest resolution;
6. do not treat the run as #2294 launch evidence;
7. rerun only after the workflow fix or explicit safe scoped dispatch.

### Ready task not picked up

1. confirm Issue is open;
2. confirm both `agent:cursor` and `handoff:ready`;
3. confirm latest valid assignment/response;
4. confirm project is launched and dependencies satisfied;
5. confirm no colliding in-progress claim;
6. inspect poller heartbeat and state watermark;
7. restart loop without deleting state;
8. escalate only if the defect remains.

### Cursor wakes on wrong task

1. stop local loop;
2. preserve state file;
3. remove no labels until authority is verified;
4. compare event ID, labels, manifest task, and lane;
5. correct deterministic state or post a genuine handoff;
6. run stale/duplicate fixture before restart.

### Watchers report no work despite active repository work

1. confirm watcher initialized GitHub connector;
2. confirm watcher did not use an alert-only query;
3. confirm active Issues, PRs, checks, reviews, and closeout were inspected;
4. inspect candidate-ranking evidence;
5. verify connector permissions;
6. correct watcher prompt/contract and rerun at next authorized cycle.

### Duplicate ChatGPT actions

1. stop/disable affected watchers if mutations continue;
2. compare action keys and state revisions;
3. inspect claim timestamps and comment IDs;
4. identify earliest valid claim;
5. revert only duplicated unsafe mutations;
6. repair claim/race logic;
7. validate with race fixtures before re-enable.

### CI action repeats

1. inspect event ID and action key;
2. confirm existing result/alert ledger entry;
3. confirm expected-state precondition was checked;
4. disable mutation mode if repeat is unsafe;
5. repair dedupe or state revision logic;
6. replay in observe mode.

### Required check fails

1. inspect exact job/step/log;
2. classify transient versus deterministic defect;
3. rerun only transient failure when authorized;
4. remediate deterministic defects in the active task scope;
5. create/update bounded remediation when outside scope;
6. do not waive security, scope, or production-safety defects.

### Contradictory labels

Fail closed when:

- both agent labels are active;
- ready and in-progress coexist;
- labels conflict with latest valid canonical event;
- multiple colliding active claims exist.

Resolve only when deterministic authority identifies the correct state. Otherwise route to ChatGPT.

### Missing GitHub connector capability

1. complete read-only analysis;
2. identify the exact unsupported write operation;
3. complete any other safe supported actions;
4. record bounded operator steps;
5. do not claim completion.

### Dead-letter event

1. inspect original event and retry history;
2. confirm no mutation partially succeeded;
3. reconcile subject from live state;
4. supersede event if stale;
5. replay only with a stable action key and expected-state guard;
6. escalate permanent authority or data ambiguity.

## Disable procedure

Use this order unless an immediate unsafe mutation requires faster shutdown:

1. set routing config to `disabled` or disable workflows;
2. disable five ChatGPT watchers;
3. stop local Cursor poll-wake loop;
4. preserve state, claims, alerts, and logs;
5. prevent non-main integration actions;
6. inspect any in-flight workflow before cancellation;
7. return to manual repository operation.

## Rollback procedure

1. create a bounded rollback Issue/PR if runtime files must be reverted;
2. revert controller/reconciler workflows and scripts;
3. restore prior canonical docs only when the newer contract itself is defective;
4. preserve project manifests and task Issues;
5. remove or resolve stale coordination claims;
6. normalize labels to live authority;
7. verify manual assignment/handoff/closeout works;
8. verify `main` remains human-controlled.

## Recovery procedure

1. resolve root defect;
2. run all focused tests;
3. run observe-mode reconciliation;
4. compare planned actions against live state;
5. clear/supersede dead-letter alerts deterministically;
6. restart local poller and verify heartbeat;
7. enable one ChatGPT watcher as a canary;
8. validate claim/result behavior;
9. restore remaining watchers;
10. promote rollout mode one phase at a time.

## Operator handoff package

Final handoff must contain:

- current design, plan, manifest, and branch;
- task/PR integration map;
- configuration and threshold values;
- GitHub permissions matrix;
- local Cursor installation/state paths;
- ChatGPT watcher schedule and prompt contract;
- controller/reconciler workflow names;
- acceptance and pilot reports;
- known exceptions and dead-letter records;
- disable, rollback, and recovery evidence;
- proof that no automatic `main` merge path exists;
- exact Operations owners and Tier 2 escalation.

## Closeout

At component completion:

1. record integrated validation evidence;
2. confirm no unresolved material defects;
3. confirm watchers and controller are in the approved rollout state;
4. confirm operator handoff is complete;
5. route completed-product review to Bill/ChatGPT;
6. do not merge to `main` automatically;
7. prepare a separate production promotion PR only after approval.
