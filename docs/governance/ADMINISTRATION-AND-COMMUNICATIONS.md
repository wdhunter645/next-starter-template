---
Doc Type: Governance
Audience: Human + AI
Authority Level: Domain Policy
Owns: Cross-lane and cross-queue communication transport, evidence routing, repository-state reconciliation, acknowledgment, escalation, hold/resume administration, collaboration routing, reporting, and closeout policy
Does Not Own: Product outcomes, priority decisions, queue ownership decisions, design decisions, implementation methods, PR approval decisions, incident recovery strategy, runner host maintenance, or Production authorization
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2640, #2641, #2639, #2648, #2695, #2699, #2709
Last Reviewed: 2026-07-21
---

# Administration and Communications

## Purpose

Administration & Communications is the vertical control lane supporting every durable role, promotion profile, and work queue.

It moves decisions, evidence, assignments, collaboration requests, acknowledgments, escalations, holds, resumes, reports, and closeout records reliably between authorized participants. It records and reconciles decisions; it does not create them.

Detailed queue, priority, Project Graduation, and collaboration semantics are owned by `docs/governance/WORK-QUEUES-AND-COLLABORATION.md`.

## Operating position

Administration & Communications follows:

- PMO / Engineering;
- Implementation / Operations;
- Day-2 Operations;
- Sandbox, Development, Promotion Candidate, and Production profiles;
- the Operations interrupt queue;
- the peer PMO Active and Engineering Pipeline queues.

Lanes define authority. Queues define work precedence. Administration & Communications supplies transport, reconciliation, and evidence continuity across both structures.

## Team communication principle

LGFC agents are operating team members. Direct agent-to-agent GitHub communication on the authoritative source Issue is the normal collaboration path.

Human relay through Bill is reserved for:

- unavailable or materially impaired GitHub communication;
- Product Authority, priority, cost, business, credential, legal, privacy, or protected Production intervention;
- an emergency where direct routing cannot be completed safely.

Bill is not expected to relay routine assignments, acknowledgments, findings, remediation requests, collaboration responses, status, resumes, or completion messages.

Any externally relayed decision must be written back to the authoritative GitHub surface before repository work depends on it.

## Communication preference hierarchy

1. Structured communication on the authoritative source Issue.
2. Repository automation or controller transport, retry, acknowledgment, and escalation.
3. Human relay as the bounded fallback described above.

PR comments, reviews, checks, and threads may provide technical evidence. They do not replace source-Issue routing, collaboration, ownership, or authority records.

## Owns

Administration & Communications owns:

- issue, project, program, PR, check, deployment, release, incident, queue, and closeout state reconciliation;
- team, priority, owner, profile, severity, hold, collaboration, and routing metadata reconciliation;
- source-Issue communication and acknowledgment tracking;
- decision, collaboration, review, and escalation routing;
- Operations interrupt administration;
- Monitoring and Hold interval-routing support;
- preservation and restoration of interrupted work state;
- traceability from requirement through task, acceptance, validation, and evidence;
- planned-versus-completed accounting and gap detection;
- stale, unanswered, duplicate, contradictory, or superseded event detection;
- runner/controller communication-health state;
- deterministic closeout and exception reconciliation.

## Does not own

Administration & Communications must not independently change:

- product outcome, cost, business intent, or priority;
- team queue ownership;
- architecture, design, scope, or acceptance criteria;
- implementation method or delivery model;
- promotion profile or candidate identity;
- PR approval disposition;
- incident classification or recovery strategy;
- Production authorization;
- repository settings, credentials, paid services, or infrastructure.

It executes a transition only from current recorded authority. Reconciliation must never be used to invent a decision or to create dual ownership.

## Communication surfaces

| Surface | Use |
| --- | --- |
| GitHub Issues | Durable work authority, queue ownership, assignments, collaboration, decisions, holds, and closeout |
| Labels | Machine-readable lifecycle, team, priority, profile, owner, severity, hold, and routing state |
| Structured Issue comments | Durable events, requests, acknowledgments, responses, decisions, and completion conditions |
| PR reviews and threads | Formal Engineering review and line-specific technical evidence |
| Check runs | Deterministic validation, eligibility, readiness, and health evidence |
| Deployment status | Deployment progress, failure, success, rollback, and live verification |
| Workflow artifacts and committed reports | Detailed evidence packets |
| External notifications | Attention acceleration only; decisions require GitHub write-back |

## Source-Issue-first routing

The authoritative source Issue owns:

- assignment;
- current execution owner;
- team queue;
- priority namespace;
- collaboration state;
- blocking scope;
- controlling authority;
- next action.

The receiving agent responds on that Issue first.

Implementation delivery uses `IMPLEMENTATION HANDOFF`. Required formal PR inspection uses `PR REVIEW REQUEST`. Universal assistance uses the collaboration lifecycle below.

A routing transaction is incomplete until the target participant, bounded request, blocking scope, retained authority, acknowledgment requirement, and completion condition are durable and unambiguous.

## Universal collaboration lifecycle

One collaboration method applies to Operations, PMO, Engineering, and PR-related work.

Use these events:

- `COLLABORATION REQUEST`;
- `COLLABORATION ACKNOWLEDGED`;
- `COLLABORATION RESPONSE`;
- `COLLABORATION COMPLETE`.

### Request

The source-Issue owner records:

- source Issue and current team;
- current execution owner;
- requesting and target agents or roles;
- exact bounded contribution;
- evidence and references;
- blocking scope;
- authority retained by the source owner or controlling role;
- acknowledgment requirement;
- completion condition.

### Acknowledgment

The collaborator records accepted scope, evidence received, missing evidence, and the boundary of the response.

### Response

The collaborator records the exact evidence reviewed and provides bounded analysis, guidance, validation, or recommendation. Existing dispositions such as `GUIDANCE`, `ADJUSTMENT`, `PROBLEM FOUND`, `PLAN CHANGE REQUIRED`, `HOLD`, or `RESUME` may be used when applicable.

### Completion

The collaborator records the result, evidence identity, remaining conditions, and return of execution to the Issue owner.

Collaboration does not:

- create another Issue merely to communicate;
- change team ownership or priority namespace;
- replace the execution owner;
- authorize implementation, approval, Project Graduation, or Production action beyond the collaborator's existing role;
- require the collaborator to modify the implementation branch or PR.

A separate explicit handoff is required to transfer ownership.

## Pull-request collaboration boundary

For normal advisory collaboration involving a PR:

1. the request is posted on the source Issue;
2. the PR and relevant head SHA are identified as evidence;
3. the collaborator reads the diff, checks, or threads as needed;
4. the collaborator responds on the source Issue;
5. the Issue owner applies the response and resumes branch and PR work.

The collaborator does not need to comment on or modify the PR.

Formal PR review is separate. When required, an authorized independent reviewer uses GitHub-native reviews and threads. The controlling disposition is routed back to the source Issue, and formal review does not transfer Issue ownership.

A response tied to a PR, commit, deployment, or check is valid only for the identified evidence. Material evidence changes may require another collaboration request or re-review.

## Team and priority integrity

Administration & Communications must fail closed on:

- more than one `team:*` label on the same source Issue;
- priority or state labels from multiple team namespaces;
- `team:operations` without exactly one Operations priority or state when the target label model is active;
- `team:engineering` with a PMO priority;
- `team:pmo` with an Engineering priority;
- PMO or Engineering team priority on a project child task;
- an Engineering preparation Issue classified as `pmo:task` or linked through `Parent Project:`;
- Project Graduation that transfers Engineering priority directly into PMO priority.

Collaboration assignments do not create another team owner.

Live label creation and migration remain separately authorized implementation work under #2702.

## Minimum event vocabulary

- `COLLABORATION REQUEST`
- `COLLABORATION ACKNOWLEDGED`
- `COLLABORATION RESPONSE`
- `COLLABORATION COMPLETE`
- `PROBLEM FOUND`
- `GUIDANCE`
- `ADJUSTMENT`
- `HOLD`
- `PLAN CHANGE REQUIRED`
- `RESUME`
- `IMPLEMENTATION HANDOFF`
- `PR REVIEW REQUEST`
- `APPROVED FOR INTEGRATION`
- `PROMOTION CANDIDATE READY`
- `PRODUCTION GO`
- `OPERATIONAL INCIDENT`
- `RECOVERY VERIFIED`
- `CLOSEOUT`

Every event identifies the subject, source and target roles, evidence, requested action, blocking scope, retained authority, acknowledgment requirement, and completion or resume condition when applicable.

## Operations interrupt administration

Only a qualifying standalone Operations Issue with `ops:priority:1` through `ops:priority:4` is an actionable queue interrupt.

When a numbered Operations Issue is active, Administration & Communications must:

1. verify that it is an authoritative standalone Day-2 source Issue rather than a child, duplicate, tracker, advisory, or evidence-only record;
2. stop new PMO and Engineering dispatch;
3. direct active work to the nearest safe checkpoint;
4. preserve each interrupted Issue, branch, claim, check, review, deployment, blocker, and next action;
5. route the Operations Issue to the roles and collaborators it needs;
6. give it the next available capacity without duplicate claims;
7. restore preserved normal work when no numbered Operations Issue remains actionable.

`ops:monitoring` and `ops:hold` are non-blocking queue states. They require a current owner, next review time or update interval, expected evidence, and condition for reactivation or closeout.

When numbered remediation has progressed as far as possible, the Issue must move to Monitoring or Hold rather than remain falsely actionable.

An explicit incident or protected hold may continue to block covered work independently of the queue state.

## Non-blocking rule

Pending prose, dashboard lag, routine reports, cosmetic labels, or bookkeeping do not block authorized work.

Administration & Communications may block only the affected scope when a substantive invariant is missing, contradictory, or failed, including:

- source authority;
- dependency;
- acceptance criterion;
- validation;
- independent approval;
- safety or Production boundary;
- legal promotion transition;
- collision safety;
- closeout integrity;
- a numbered Operations interrupt.

## Runner and controller

The runner and routing controller are communication and control-plane infrastructure.

They may normalize events, route authorized work, publish evidence, retry transport, and perform deterministic authorized actions. They do not own the meaning of the event or the decision it carries.

Implementation / Operations owns workflow creation and onboarding. Day-2 Operations owns runner host availability, capacity, patching, security, stop/start, rollback, and recovery.

## Closeout

Closeout verifies:

- every planned item is complete, removed, superseded, or explicitly deferred;
- required evidence and approvals exist;
- promotion and Production decisions are recorded where applicable;
- unresolved defects and Production risks are explicit;
- Issue, project, program, queue, release, Operations, and incident state agree;
- no required promotion profile was skipped;
- interrupted work is restored or explicitly re-sequenced;
- collaboration completion does not falsely close the source work.

Successful deterministic post-merge automation may perform the primary closeout transaction. Administration & Communications owns missing, partial, contradictory, non-merge, and later-discovered exceptions.

## Canonical references

- Work queues and collaboration: `docs/governance/WORK-QUEUES-AND-COLLABORATION.md`
- Stable queue/collaboration contract: `docs/reference/operations/work-queue-and-collaboration-contract.md`
- Administration contract: `docs/reference/operations/administrative-control-lane-contract.md`
- Agent roles: `docs/governance/AGENT-TEAM.md`
- PR process: `docs/governance/PR_PROCESS.md`
- Operations and recovery: `docs/governance/OPERATIONS-AND-RECOVERY.md`
- Dispatch procedure: `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`

## Supersession

This policy supersedes lower-level instructions that require a second Issue for collaboration, treat PR comments as the primary collaboration record, permit dual team ownership, require team priority on child tasks, or keep PMO and Engineering blocked by Operations Monitoring or Hold without a separate explicit hold.