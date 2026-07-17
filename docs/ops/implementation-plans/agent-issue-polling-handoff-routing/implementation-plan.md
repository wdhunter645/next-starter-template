---
Doc Type: Operations
Audience: Human + AI
Authority Level: Project Implementation Plan
Owns: Project #2294 execution sequence, task boundaries, dependencies, branch model, validation, rollout, rollback, and operator handoff
Does Not Own: Project Go/No-Go authorization, product priority, production merge approval, secrets, credentials, external-service authorization, or automatic merge to main
Canonical Reference: /docs/ops/implementation-plans/agent-issue-polling-handoff-routing/implementation-plan.md
Related Issues: #2294, #2546, #2550, #2554
Last Reviewed: 2026-07-17
---

# Agent Issue Polling and Handoff Routing Implementation Plan

> **For agentic workers:** Execute this plan task-by-task from the validated project manifest. Each task is a separate Issue and PR/evidence unit. Do not begin implementation until one project-level Go is recorded on #2294.

**Goal:** Build a no-OpenAI-API continuous routing system that uses deterministic CI, local Cursor polling, and broad GitHub-connected ChatGPT watchers to keep approved repository work moving safely across serial and parallel lanes.

**Architecture:** A deterministic state resolver and action planner normalize live GitHub state, manifests, checks, reviews, and communication events. Event-driven and scheduled CI perform bounded actions and emit durable alerts; local Cursor consumes exact ready work; broad ChatGPT watchers initialize the GitHub connector, inspect the full repository, claim one high-priority authorized action, and execute it idempotently.

**Tech Stack:** GitHub Actions, Node.js 22, JavaScript ES modules, GitHub CLI/API adapters, Vitest, JSON configuration, existing LGFC PMO manifests and communication contracts.

## Global constraints

- Do not use the OpenAI API.
- Do not automatically merge any PR to `main`.
- Cursor cannot approve or merge its own work.
- CI must remain deterministic and must not write substantive ChatGPT decisions.
- ChatGPT watchers must not be narrowed to an alert-only queue.
- Every watcher run must initialize the GitHub app/connector and use live repository state.
- Repository alerts prioritize work but do not define the full ChatGPT review surface.
- Serial dependencies remain serial; approved non-colliding work may proceed in parallel.
- No approved executable work should remain idle while an eligible agent has capacity and a safe action exists.
- Labels remain current state; canonical comments remain durable events.
- New coordination/alert markers must not replace the #2550 communication state machine.
- Production, credentials, privacy, legal, cost, repository-setting, and destructive decisions remain human/ChatGPT authority boundaries.
- The #2554 PMO materializer event-routing defect must be resolved or explicitly safely dispositioned before #2294 launch.

---

## Project identity

| Field | Value |
| --- | --- |
| Project issue | #2294 |
| Parent program | #1719 |
| Alignment project | #2546 |
| Communication dependency | #2550 |
| Pre-launch validation dependency | #2554 |
| Project branch | `component/agent-issue-polling-handoff-routing` |
| Upstream branch | `component/pmo-project-autonomous-delivery` |
| Preparation branch | `chatgpt/2294-preparation-package` |
| PMO preparation owner | ChatGPT / Atlas |
| Execution agent after Go | Cursor Local |
| Operations owner | Bill + Cursor Local |
| Tier 2 escalation | ChatGPT / Atlas |
| Production boundary | reviewed promotion PR to `main`; no automatic merge |
| Current launch state | prepared / held pending package review and Go/No-Go |

## Completed-project deliverable

A validated operational routing system containing:

1. one canonical project-specific routing design aligned to #2550;
2. deterministic state resolution and action planning;
3. event-driven CI continuous control using the approved existing CI subset;
4. scheduled reconciliation, time-based alerting, and work-conserving lane selection;
5. a reconciled local Cursor poll-wake implementation;
6. a broad ChatGPT watcher operating contract with mandatory GitHub connector initialization;
7. stable alert, claim, result, and dead-letter evidence;
8. concurrency, idempotency, stale-event, and collision controls;
9. phased rollout with observe-only and kill-switch modes;
10. operator startup, shutdown, troubleshooting, rollback, and recovery procedures;
11. integrated proof that routine non-main work advances continuously and `main` never auto-merges.

## Design and contract sources

- `docs/explanation/projects/agent-issue-polling-handoff-routing-design.md`
- `docs/ops/implementation-plans/agent-issue-polling-handoff-routing/project-manifest.json`
- `docs/how-to/agents/operate-agent-routing.md`
- `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- `docs/how-to/cursor/github-poll-wake-loop.md`
- `docs/reference/ci/pr-workflow-ci-inventory.md`
- Project #2294 and its approved design-decision comments

## File structure

### New implementation areas

| Path | Responsibility |
| --- | --- |
| `.github/workflows/ops-agent-routing-controller.yml` | Event-driven evaluation and bounded deterministic action |
| `.github/workflows/ops-agent-routing-reconcile.yml` | Scheduled reconciliation, time thresholds, health, and recovery |
| `scripts/agent-routing/state-resolver.mjs` | Normalize repository, Issue, PR, manifest, check, review, and event state |
| `scripts/agent-routing/action-planner.mjs` | Select one deterministic action/disposition from normalized state |
| `scripts/agent-routing/lane-eligibility.mjs` | Serial/parallel eligibility and mutation-collision checks |
| `scripts/agent-routing/time-policy.mjs` | Configurable idle/stall threshold evaluation |
| `scripts/agent-routing/alert-ledger.mjs` | Alert IDs, dedupe, supersession, and resolution |
| `scripts/agent-routing/claim-ledger.mjs` | Watcher action keys, claims, leases, and results |
| `scripts/agent-routing/github-actions.mjs` | Bounded GitHub mutation adapter with expected-state guards |
| `scripts/agent-routing/config.json` | Rollout mode, thresholds, enabled actions, protected boundaries |
| `scripts/agent-routing/schemas/*.json` | Deterministic alert, claim, snapshot, and action-plan schemas |
| `tests/agent-routing/**` | Unit, event, permissions, idempotency, race, and integration fixtures |
| `docs/reference/ci/agent-routing-controller-contract.md` | Stable controller inputs, outputs, action classes, and boundaries |
| `docs/how-to/agents/operate-agent-routing.md` | Operator procedures and troubleshooting |

### Existing areas to reconcile

- `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- `docs/how-to/cursor/github-poll-wake-loop.md`
- `docs/how-to/pmo/align-2294-to-communication-contract.md`
- `.github/workflows/component-child-integration.yml`
- `.github/workflows/post-merge-closeout.yml`
- `.github/workflows/post-merge-remediation.yml`
- `.github/workflows/ops-post-merge-self-healing.yml`
- existing CI evidence scripts only through bounded adapters where necessary

## Delivery and integration model

- Project delivery model: Model B.
- Every child PR targets `component/agent-issue-polling-handoff-routing`.
- No child PR targets `main`.
- Tasks 003–006 may run in parallel only after Task 002 integrates and only when their file and Issue mutation scopes remain non-colliding.
- Task 007 joins CI scheduling and watcher coordination.
- Task 008 performs integrated validation and security/failure testing.
- Task 009 performs observe-mode pilot, operator handoff, and final component completion review.
- Promotion to `main` is a separate Bill/ChatGPT-reviewed PR after the project is complete.

## Task graph

| Order | Task | Predecessors | Parallel group | Successors | Primary output |
| ---: | --- | --- | --- | --- | --- |
| 001 | Contract and configuration foundation | project Go | none | 002 | reconciled authority, schemas, config contract |
| 002 | State resolver and action planner core | 001 | none | 003, 004, 005, 006 | pure deterministic routing engine |
| 003 | Event-driven CI controller and evidence adapters | 002 | execution-surfaces | 007 | controller workflow and bounded mutations |
| 004 | Reconciliation, time policy, and work-conserving lanes | 002 | execution-surfaces | 007 | scheduled reconciler and idle/stall logic |
| 005 | Local Cursor poller and persistence reconciliation | 002 | execution-surfaces | 008 | exact pickup/claim/restart behavior |
| 006 | Broad ChatGPT watcher and connector contract | 002 | execution-surfaces | 007 | watcher bootstrap, scan, claim, result contract |
| 007 | Alerts, claim ledger, observability, and dead-letter handling | 003, 004, 006 | none | 008 | durable alerts and coordination evidence |
| 008 | Integrated safety, race, and failure validation | 005, 007 | none | 009 | complete acceptance evidence and defect remediation |
| 009 | Observe-mode pilot, rollout controls, and operator handoff | 008 | none | terminal | pilot evidence, runbook, rollback, completion package |

## Task 001 — Contract and configuration foundation

### Objective

Reconcile the canonical documentation and define machine-readable contracts before runtime implementation.

### Files

- Modify: `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- Modify: `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- Modify: `docs/how-to/cursor/github-poll-wake-loop.md` only where implementation-facing clarification is needed
- Modify: `docs/how-to/pmo/align-2294-to-communication-contract.md`
- Create: `docs/reference/ci/agent-routing-controller-contract.md`
- Create: `scripts/agent-routing/config.json`
- Create: `scripts/agent-routing/schemas/state-snapshot.schema.json`
- Create: `scripts/agent-routing/schemas/action-plan.schema.json`
- Create: `scripts/agent-routing/schemas/routing-alert.schema.json`
- Create: `scripts/agent-routing/schemas/watcher-claim.schema.json`
- Test: `tests/agent-routing/contract-validation.test.mjs`

### Required behavior

- preserve narrow Cursor pickup rules;
- replace narrow ChatGPT watcher consumption wording with broad repo review plus alert prioritization;
- define mandatory GitHub connector initialization;
- define action/alert/claim schemas without creating a second routing authority model;
- define rollout modes: `disabled`, `observe`, `normalize`, `advance`, `integrate`;
- define initial time thresholds as configurable values;
- define protected boundaries and no-main-auto-merge invariant;
- record #2554 materializer correction as a launch prerequisite.

### Steps

- [ ] Write failing contract tests for required watcher, CI, alert, and production-boundary fields.
- [ ] Run focused tests and confirm failure.
- [ ] Add schemas and default configuration.
- [ ] Reconcile canonical documentation top-down.
- [ ] Run schema/contract tests.
- [ ] Run documentation authority validation and `git diff --check`.
- [ ] Commit and open a child PR against the project branch.

### Acceptance criteria

- one coherent contract exists;
- Cursor pickup remains exact and deterministic;
- ChatGPT watchers are broad and connector-backed;
- alerts are explicitly non-exclusive and non-authoritative;
- configuration cannot enable automatic production merge;
- contract tests pass.

## Task 002 — State resolver and action planner core

### Objective

Build a pure deterministic engine that converts live repository evidence into one safe action or explicit halt disposition.

### Files

- Create: `scripts/agent-routing/state-resolver.mjs`
- Create: `scripts/agent-routing/action-planner.mjs`
- Create: `scripts/agent-routing/lane-eligibility.mjs`
- Create: `scripts/agent-routing/event-normalizer.mjs`
- Create: `scripts/agent-routing/lib/*.mjs` as narrowly required
- Test: `tests/agent-routing/state-resolver.test.mjs`
- Test: `tests/agent-routing/action-planner.test.mjs`
- Test: `tests/agent-routing/lane-eligibility.test.mjs`
- Test: `tests/agent-routing/event-normalizer.test.mjs`

### Interfaces

- `normalizeEvent(payload, context) -> NormalizedEvent`
- `resolveRepositoryState(input) -> StateSnapshot`
- `evaluateLaneEligibility(snapshot, allSnapshots) -> LaneDisposition`
- `planAction(snapshot, policy) -> ActionPlan`

### Required behavior

- resolve manifest/project/task identity;
- apply current-label and latest-valid-event precedence;
- detect stale, duplicate, conflicting, and already-consumed events;
- normalize PR/check/review/integration/closeout evidence;
- identify serial/parallel lane eligibility and collisions;
- return exactly one documented action class;
- include expected-state preconditions and deterministic action key;
- fail closed on ambiguity and production boundaries;
- perform no network mutation from pure modules.

### Steps

- [ ] Add fixtures for normal, stale, conflicting, parallel, protected, and production states.
- [ ] Write failing resolver and planner tests.
- [ ] Implement event normalization and stable revision fingerprints.
- [ ] Implement state resolution and precedence.
- [ ] Implement lane eligibility and collision detection.
- [ ] Implement one-action planning with expected-state guards.
- [ ] Run focused tests, typecheck, and lint.
- [ ] Commit and open child PR.

### Acceptance criteria

- repeated equivalent inputs produce byte-equivalent plans;
- ambiguous state fails closed;
- routine non-main progress does not route to ChatGPT;
- broad ChatGPT candidate generation is not limited to alert labels;
- no plan authorizes automatic merge to `main`.

## Task 003 — Event-driven CI controller and evidence adapters

### Objective

Connect repository events and existing CI evidence to the deterministic planner and execute only allowed bounded actions.

### Files

- Create: `.github/workflows/ops-agent-routing-controller.yml`
- Create: `scripts/agent-routing/controller.mjs`
- Create: `scripts/agent-routing/evidence-adapters/*.mjs`
- Create: `scripts/agent-routing/github-actions.mjs`
- Test: `tests/agent-routing/controller-event-matrix.test.mjs`
- Test: `tests/agent-routing/github-actions.test.mjs`
- Modify existing workflows only when a documented adapter cannot consume their artifacts/statuses safely.

### Required event coverage

- Issues and labels;
- issue comments;
- PR lifecycle;
- reviews and review comments;
- required/advisory workflow completion;
- manual scoped replay.

### Required behavior

- evaluation job is read-only;
- mutation jobs use least privilege per action;
- action key and expected-state revision are revalidated before mutation;
- adapters consume existing quality, gitleaks, hygiene, diff-scope, reviewer-response, component-integration, and closeout evidence;
- controller performs state normalization, non-main integration, exact successor activation, closeout, remediation, or alerting only when deterministically authorized;
- untrusted events cannot mutate;
- actions and artifacts expose complete evidence.

### Steps

- [ ] Write event/permission matrix tests.
- [ ] Add failing tests for unsafe/untrusted mutation paths.
- [ ] Implement evidence adapters.
- [ ] Implement controller dry-run summary.
- [ ] Add bounded mutation adapter and expected-state guards.
- [ ] Add workflow with observe mode as default.
- [ ] Run workflow fixture, unit, lint, and permission validation.
- [ ] Commit and open child PR.

### Acceptance criteria

- all supported events normalize correctly;
- unsupported/ambiguous events fail closed;
- no broad write token is used for evaluation;
- no workflow path can merge `main`;
- duplicate event delivery creates no duplicate mutation.

## Task 004 — Reconciliation, time policy, and work-conserving lanes

### Objective

Add scheduled live-state reconciliation, configurable time-based alerts, controller health checks, and selection of independent approved work when another lane is blocked.

### Files

- Create: `.github/workflows/ops-agent-routing-reconcile.yml`
- Create: `scripts/agent-routing/reconciler.mjs`
- Create: `scripts/agent-routing/time-policy.mjs`
- Extend: `scripts/agent-routing/lane-eligibility.mjs`
- Test: `tests/agent-routing/reconciler.test.mjs`
- Test: `tests/agent-routing/time-policy.test.mjs`
- Test: `tests/agent-routing/work-conserving-scheduler.test.mjs`

### Required behavior

- scheduled reconciliation reconstructs truth without relying on missed events;
- initial thresholds match project design and remain configurable;
- no alert repeats without state revision or configured escalation interval;
- blocked serial work does not block independent lanes;
- scheduler selects only existing approved tasks/actions;
- one local Cursor claim per lane unless manifest authority explicitly allows more;
- controller heartbeat and dead-letter health are observable;
- schedule frequency respects GitHub Actions capabilities and cost boundaries.

### Steps

- [ ] Write missed-event and threshold fixture tests.
- [ ] Implement time calculation with deterministic clock injection.
- [ ] Implement lane inventory and independent candidate selection.
- [ ] Implement scheduled reconcile dry-run.
- [ ] Add alert candidates and health disposition.
- [ ] Run repeated reconciliation and collision tests.
- [ ] Commit and open child PR.

### Acceptance criteria

- eligible work is found even when another lane is blocked;
- no new work is invented;
- thresholds do not transfer authority;
- repeated schedules are idempotent;
- controller outage is detected without unsafe mutation.

## Task 005 — Local Cursor poller and persistence reconciliation

### Objective

Reconcile the local Cursor poll-wake implementation with the #2550 contract and the new controller without widening pickup authority.

### Files

- Create or modify repository-owned reference/test fixtures under `scripts/agent-routing/local-cursor/**`
- Modify: `docs/how-to/cursor/github-poll-wake-loop.md`
- Modify: `docs/how-to/agents/operate-agent-routing.md`
- Test: `tests/agent-routing/local-cursor-poller.test.mjs`
- Local operator paths after installation:
  - `~/.cursor/github-poller/poll-github.mjs`
  - `~/.cursor/github-poller/poll-wake-loop.sh`
  - `~/.cursor/github-poller/state.json`

### Required behavior

- pickup only on `agent:cursor + handoff:ready` plus eligibility;
- verify latest valid assignment/response event;
- post `CURSOR ACK` before execution;
- persist consumed IDs and active lane claim;
- restart without duplicate pickup;
- reject stale comments and contradictory labels;
- prevent second colliding claim;
- report heartbeat/health evidence consumable by CI;
- support disable and state-safe recovery.

### Steps

- [ ] Capture current local implementation and exact environment assumptions.
- [ ] Write fixture-based tests for pickup, restart, stale event, and collision behavior.
- [ ] Implement or reconcile poller logic in repository-owned reference modules.
- [ ] Prepare bounded operator installation/update steps.
- [ ] Validate on the Chromebook Linux environment.
- [ ] Record no-op, claim, restart, and disable evidence.
- [ ] Commit repository changes and attach local evidence to task Issue.

### Acceptance criteria

- no assignee-only or PR-only pickup;
- no duplicate wake after restart;
- no second colliding task claim;
- local health is observable;
- shutdown preserves state and authority.

## Task 006 — Broad ChatGPT watcher and connector contract

### Objective

Define and validate the five watcher cycles so every run initializes the GitHub connector, scans repository status broadly, and performs one highest-priority authorized ChatGPT action.

### Files

- Create: `scripts/agent-routing/watcher-candidate-planner.mjs`
- Create: `scripts/agent-routing/claim-ledger.mjs`
- Modify: `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- Modify: `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- Modify: `docs/how-to/agents/operate-agent-routing.md`
- Test: `tests/agent-routing/watcher-candidate-planner.test.mjs`
- Test: `tests/agent-routing/watcher-claim-race.test.mjs`

### Required behavior

Every watcher must:

- load the GitHub app/connector;
- resolve the active repository and permissions;
- load current authority;
- inspect active Issues, PRs, checks, reviews, handoffs, dependencies, integration, closeout, and workflow health;
- use alerts as priority hints only;
- select one authorized ChatGPT action by objective impact, urgency, dependency unblock value, and safety;
- claim the action using a stable key and lease;
- re-read live state before mutation;
- perform the full connector-supported action;
- record result or exact halt reason;
- remain idempotent across overlapping watchers.

### Steps

- [ ] Write candidate-ranking fixtures with and without alerts.
- [ ] Write failing claim-race and lease-expiry tests.
- [ ] Implement candidate normalization and ranking.
- [ ] Implement claim/result ledger helpers.
- [ ] Document GitHub connector bootstrap and capability handling.
- [ ] Validate that a watcher finds broad actionable work without `agent:ChatGPT`.
- [ ] Validate that a dedicated handoff or production alert receives appropriate urgency.
- [ ] Commit and open child PR.

### Acceptance criteria

- no alert-only narrowing;
- GitHub connector initialization is mandatory;
- overlapping watchers do not duplicate action;
- connector capability failures are explicit;
- watcher actions remain inside ChatGPT responsibility and repository authority.

## Task 007 — Alerts, observability, and dead-letter handling

### Objective

Implement durable alert lifecycle, action/claim evidence, metrics, and unresolved-event recovery.

### Files

- Create: `scripts/agent-routing/alert-ledger.mjs`
- Create: `scripts/agent-routing/metrics.mjs`
- Create: `scripts/agent-routing/dead-letter.mjs`
- Extend: controller and reconciler workflows
- Create: `docs/reference/ci/agent-routing-controller-contract.md`
- Test: `tests/agent-routing/alert-ledger.test.mjs`
- Test: `tests/agent-routing/dead-letter.test.mjs`
- Test: `tests/agent-routing/metrics.test.mjs`

### Required behavior

- stable alert ID and state revision;
- create/update/supersede/resolve lifecycle;
- no repetitive comment spam;
- clear authority class: CI, Cursor, ChatGPT, or human;
- dead-letter record for permanent/ambiguous failures;
- metrics for ready-to-ACK, green-to-integration, integration-to-successor, handoff-to-response, duplicate suppression, and idle-with-reason;
- no sensitive data in logs/artifacts.

### Steps

- [ ] Write alert lifecycle and dedupe tests.
- [ ] Implement alert and dead-letter stores using bounded Issue comments/check summaries.
- [ ] Add metrics output and job summaries.
- [ ] Integrate controller/reconciler alert emission.
- [ ] Validate repeated events and escalation intervals.
- [ ] Commit and open child PR.

### Acceptance criteria

- alerts are durable, bounded, and deduplicated;
- alerts do not replace broad watcher review;
- permanent failures are visible and recoverable;
- metrics prove idle time and action latency.

## Task 008 — Integrated safety, race, and failure validation

### Objective

Prove the complete system under normal, duplicate, stale, concurrent, missed-event, permission, and failure conditions.

### Files

- Create: `tests/agent-routing/integration/**`
- Create: `tests/agent-routing/fixtures/**`
- Create: `scripts/agent-routing/acceptance.mjs`
- Create: `docs/ops/reports/agent-routing-acceptance.md`
- Modify runtime files only for defects found within project scope.

### Required scenarios

1. routine assignment, ACK, status, completion, non-main integration, successor activation;
2. genuine ChatGPT handoff and response;
3. broad watcher identifies actionable work without alert labels;
4. dedicated alert accelerates a genuine urgent item;
5. two watchers race for the same action;
6. parallel independent lanes proceed while one serial lane is blocked;
7. colliding lanes are prevented;
8. duplicate and out-of-order events;
9. edited/stale comments;
10. missed event recovered by reconciliation;
11. required CI failure and safe rerun disposition;
12. protected change requiring ChatGPT review;
13. local poller restart and stale watermark;
14. controller outage and mutation disable;
15. wrong-manifest/new-component-branch materializer regression from #2554;
16. attempted automatic merge to `main` rejected.

### Steps

- [ ] Build fixtures and failing integrated tests.
- [ ] Run all unit and integration suites.
- [ ] Remediate in-scope deterministic defects.
- [ ] Run lint, typecheck, required CI, and security checks.
- [ ] Produce acceptance report with exact evidence.
- [ ] Commit and open child PR.

### Acceptance criteria

- all required scenarios pass;
- no duplicate or colliding mutation occurs;
- no silent idle state remains without a reason/alert;
- no paid API dependency exists;
- no main auto-merge path exists.

## Task 009 — Observe-mode pilot, rollout controls, and operator handoff

### Objective

Run the complete system in observe mode, prove work-conserving behavior and safe alerts, then prepare the final component-level completion package.

### Files

- Modify: `scripts/agent-routing/config.json`
- Finalize: `docs/how-to/agents/operate-agent-routing.md`
- Create: `docs/ops/reports/agent-routing-pilot.md`
- Create: `docs/ops/reports/agent-routing-operator-handoff.md`
- Update project manifest/task evidence only as authorized.

### Pilot requirements

- controller and reconciler run read-only/observe first;
- five ChatGPT watchers are configured only after explicit operator action and remain disabled until pilot start;
- each watcher confirms GitHub connector initialization;
- record candidate discovery with and without repository alerts;
- record serial/parallel lane outcomes;
- measure initial time thresholds;
- prove no duplicate claims/actions;
- exercise kill switches, recovery, and dead-letter replay;
- enable mutation phases only after documented evidence and Bill/ChatGPT approval;
- do not enable automatic merge to `main`.

### Steps

- [ ] Run observe mode for the approved pilot window.
- [ ] Review false positives, missed candidates, latency, and duplicate suppression.
- [ ] Tune thresholds in configuration with evidence.
- [ ] Exercise disable, restart, and rollback.
- [ ] Complete operator runbook and handoff.
- [ ] Prepare final component review package.
- [ ] Stop at Bill/ChatGPT completed-product review before any promotion to `main`.

### Acceptance criteria

- approved work does not sit idle beyond threshold without a recorded reason;
- broad watchers perform authorized actions across the repository;
- alerts improve prioritization without narrowing review;
- local Cursor pickup remains exact;
- CI stays deterministic;
- rollback is proven;
- final promotion remains human-controlled.

## Validation profiles

### Documentation and manifest

- frontmatter/header validation;
- canonical-reference validation;
- JSON parse/schema validation;
- project DAG validation;
- no wake-eligible task while project is prepared/held;
- `git diff --check`;
- no tracked ZIP.

### Node and unit tests

- focused Vitest node suites under `tests/agent-routing/**`;
- deterministic clock and GitHub API fixtures;
- lint and typecheck;
- stable snapshot/action-plan serialization;
- repeated-run idempotency.

### Workflow and permissions

- event matrix;
- least-privilege job permissions;
- untrusted/fork mutation prevention;
- expected-state precondition failure;
- workflow concurrency and cancellation behavior;
- observe/disable mode;
- artifact and job-summary redaction.

### Integrated project

- complete acceptance script and report;
- existing required `quality` and `gitleaks` checks;
- protected-change review where applicable;
- local Cursor evidence;
- watcher claim/race evidence;
- no automatic `main` merge path;
- operator rollback and recovery evidence.

## Environment and permission assumptions

### GitHub

- Repository: `wdhunter645/next-starter-template`.
- GitHub app/connector is installed and watchers can initialize it each run.
- Exact read/write capabilities are discovered at runtime and must not be assumed beyond the connector response.
- GitHub Actions can use repository-scoped `GITHUB_TOKEN` with job-level least privilege.
- Public-repository Actions capacity is available, but workflow frequency remains bounded and configurable.
- Branch protection and repository settings are not changed by this project without separate authority.

### Local Cursor

- Chromebook Linux environment: Debian 12 bookworm.
- Cursor Local is the implementation runtime.
- `gh` authentication and repository access are available to the local poller/operator before launch.
- local state is stored outside the repository at `~/.cursor/github-poller/state.json` with restrictive permissions.
- local loop supports clean start, stop, restart, and disable.

### ChatGPT watchers

- Five staggered ChatGPT scheduled tasks are available but remain disabled until pilot authorization.
- Each run can load the GitHub app/connector and use granted repository capabilities.
- No watcher uses the OpenAI API or external paid worker.
- ChatGPT product scheduling cannot be treated as repository authority; Issues/docs remain authoritative.

## Rollback and disable procedure

1. set `scripts/agent-routing/config.json` mode to `disabled` through a reviewed non-main PR;
2. disable controller/reconciler workflows if necessary;
3. retain read-only dry-run reports when safe;
4. stop local poll-wake loop and preserve state;
5. disable all five ChatGPT watchers through ChatGPT task controls;
6. resolve/expire active watcher claims;
7. disable non-main integration actions while preserving PRs;
8. revert controller scripts/workflows/config in a bounded PR;
9. restore manual assignment, ACK, handoff, review, merge, and successor operations;
10. preserve all Issues, comments, manifests, alerts, and reports as audit evidence;
11. leave `main` protection and human approval unchanged.

## Troubleshooting order

1. confirm GitHub connector/app availability and permissions;
2. confirm live labels and latest valid canonical event;
3. confirm manifest lifecycle, dependency, and wake eligibility;
4. inspect action key, claim lease, and expected-state revision;
5. inspect required/advisory checks and unresolved reviews;
6. inspect controller/reconciler job summary and artifact;
7. inspect local poller heartbeat and state file;
8. inspect alert/dead-letter evidence;
9. rerun only transient failures when authorized;
10. disable mutation mode and escalate on ambiguity or unsafe behavior.

## Go/No-Go readiness checklist

The project may enter the Go/No-Go conversation only when:

- [x] design authority exists;
- [x] implementation plan exists;
- [x] project branch and upstream dependency are defined;
- [x] machine-readable manifest exists and validates;
- [ ] task Issues are materialized/linked without wake state;
- [ ] #2554 materializer event-routing defect is resolved or explicitly safely dispositioned;
- [x] environment and permission assumptions are documented;
- [x] validation strategy is documented;
- [x] rollback/disable procedure is documented;
- [x] troubleshooting procedure is documented;
- [x] operator handoff requirements are documented;
- [ ] Bill/ChatGPT reviews the complete package and records Go or No-Go.

## Stop conditions

Stop preparation or execution for:

- unresolved conflict in repository authority;
- unsafe or ambiguous GitHub mutation;
- missing required GitHub/Actions/local permissions;
- paid API or vendor cost requirement not approved by Bill;
- credential, privacy, legal, or repository-setting decision;
- destructive or irreversible action;
- production/main mutation outside approved promotion;
- inability to prove idempotency or collision safety;
- material technical failure outside project scope.

Do not stop for routine review findings, correctable test failures, ordinary task transitions, or blocked work in one lane when a separate approved lane can advance safely.
