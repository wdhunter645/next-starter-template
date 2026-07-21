---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Administration & Communications event, mutation, routing, evidence, acknowledgment, escalation, hold/resume, blocking, closeout executor, and exception contract
Does Not Own: Product scope, design, delivery-model selection, implementation authority, PR approval, recovery strategy, Production authority, or workflow implementation
Canonical Reference: /docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md
Related Issues: #2640, #2641, #2639, #2700
Last Reviewed: 2026-07-21
---

# Administration and Communications Contract

## Purpose

Define the stable repository-wide contract for the vertical Administration & Communications lane, including the role-based decision and transaction boundaries for closeout.

The lane follows PMO / Engineering, Implementation / Operations, and Day-2 Operations from intake through public Production use and closeout. It keeps Issues, PRs, checks, deployments, runner events, portfolio state, holds, resumes, and evidence aligned with existing authority.

## Core rule

> Administration & Communications may record, route, reconcile, and execute authorized state transitions, but it must not create the underlying decision authority.

The lane is non-blocking unless an explicit authority, dependency, validation, approval, profile-transition, safety, Production, or closeout invariant is missing, contradictory, or failed.

## Topology

```text
                    Administration & Communications
                    evidence | routing | runner | state
                         |             |             |
                         v             v             v
PMO / Engineering -> Implementation / Operations -> Day-2 Operations
```

The vertical lane follows all profiles:

```text
Sandbox -> Development -> Promotion Candidate -> Production
```

It must detect and prevent skipped profile transitions.

## Durable roles

| Role | Administration & Communications relationship |
| --- | --- |
| Product Authority | Supplies product, priority, cost, business, and program-closeout decisions |
| PMO / Engineering | Supplies design, acceptance, plan, Sandbox, implementation-Go, and aggregate project-verification decisions |
| Implementation / Operations | Supplies Development, Promotion Candidate, deployment, remediation, evidence state, and eligible assigned task-closeout decisions |
| PR Approver / Engineering | Supplies independent review, approval, changes-required, promotion disposition, and project-audit evidence |
| Day-2 Operations | Supplies incident classification, recovery strategy, hold release, recovery verification, and incident-closeout decisions |
| Deterministic CI | Produces machine evidence and applies explicitly authorized idempotent actions |
| Administration & Communications | Routes, acknowledges, reconciles, records, escalates, restores, audits, and executes authorized closeout transactions |

Current people, agents, and systems are mapped to these roles in `docs/governance/AGENT-TEAM.md` or an approved project manifest. The mapping may change without changing this contract.

## Closeout executor matrix

| Closeout class | Closeout decision authority | Transaction executor |
| --- | --- | --- |
| Assigned project child task | Assigned Implementation / Operations role holder after required independent review and integration evidence exists | Deterministic CI first; assigned Implementation / Operations role holder as fallback under bounded delegated Administration & Communications authority |
| Assigned child remediation | Assigned Implementation / Operations role holder after required independent review and remediation verification exists | Deterministic CI first; assigned Implementation / Operations role holder as fallback under bounded delegated Administration & Communications authority |
| Project/master | PMO / Engineering with independent PR Approver / Engineering verification | Designated Administration & Communications role holder who did not solely implement the underlying child work |
| Program/umbrella | Product Authority and PMO / Engineering under explicitly recorded program-closeout authority | Administration & Communications role holder |
| Promotion Candidate | PMO / Engineering, PR Approver / Engineering, and additional roles required by the applicable approval profile | Administration & Communications role holder records the disposition |
| Production | Recorded Production authority with required Engineering approval | Administration & Communications role holder records the disposition |
| Incident | Day-2 Operations after recovery verification and hold disposition | Administration & Communications role holder records the disposition |

## Delegated assigned-task transaction contract

An assigned Implementation / Operations role holder may execute task-level closeout only when all of the following are true:

1. the source Issue explicitly identifies the role holder, Issue class, and parent/master;
2. required implementation and validation are complete;
3. required independent review or authorized integration is recorded;
4. post-integration verification passes;
5. terminal task state, parent reporting, and successor disposition are determinable;
6. no protected stop, incident hold, or unresolved closeout exception remains;
7. the closeout packet is complete; and
8. an equivalent successful deterministic transaction does not already exist.

The fallback role holder may:

- post the `CLOSEOUT` event;
- reconcile permitted task labels and assignment state;
- record parent/master and successor disposition;
- close the assigned project-child or child-remediation Issue; and
- re-fetch and verify the terminal state.

The fallback role holder must not:

- approve or merge its own protected work;
- infer acceptance, review, integration, or Production authority;
- close a project/master, program/umbrella, Promotion Candidate, Production, release, incident, standalone `OPS:`, or Product Authority disposition Issue;
- overwrite newer evidence or an existing successful closeout; or
- proceed when evidence is missing, failed, contradictory, ambiguous, or outside the assigned task boundary.

## Project/master audit contract

Project/master closeout requires independent aggregate verification that:

- all planned child work is completed, removed, superseded, or explicitly deferred;
- child closeout packets and required approvals are sufficient;
- integrated scope satisfies the project acceptance criteria;
- unresolved gaps, defects, and Production risk are explicit;
- Promotion Candidate and Production dispositions are accurate when applicable;
- parent and program reporting are current; and
- no required promotion profile was skipped.

The designated Administration & Communications transaction executor must not be solely dependent on the same role holder that implemented the underlying child work. Implementation / Operations may supply evidence but may not act as the sole independent project/master auditor.

## Communication surfaces

| Surface | Contract |
| --- | --- |
| Issues | Durable task, project, program, escalation, incident, and decision authority |
| Labels | Current machine-readable lane, profile, owner, priority, severity, hold, and routing state |
| Structured comments | Durable events, evidence summaries, decisions, and supersession |
| PR reviews/threads | Engineering review and approval evidence |
| Check runs | Deterministic validation, eligibility, readiness, and health evidence |
| Deployments | Deployment state and live-release evidence |
| Artifacts/reports | Detailed evidence too large for comments |
| External notifications | Attention only; decisions require GitHub write-back |
| Runner/controller | Shared event transport and authorized deterministic execution |

## Minimum event vocabulary

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

Every event identifies:

- event type and stable ID when automated;
- subject Issue, PR, project, release, or incident;
- source and target role/lane;
- current profile;
- evidence;
- requested action;
- blocking scope;
- decision authority;
- transaction executor when applicable;
- acknowledgment requirement;
- superseded event when applicable; and
- resume condition when applicable.

## Lightweight problem adjustment

Default flow:

```text
PROBLEM FOUND
  -> route to the role that made the controlling decision
  -> GUIDANCE or ADJUSTMENT
  -> record and acknowledge
  -> RESUME
```

Only the affected task or incident pauses unless evidence supports broader impact.

Use `PLAN CHANGE REQUIRED` only for material changes to product outcome, architecture, acceptance criteria, dependency structure, delivery model, profile path, Production boundary, or recovery strategy.

## Allowed mutations

When the result is mechanically provable or directly authorized, the lane or delegated transaction executor may:

- reconcile lane, profile, status, routing, handoff, PMO, reporting, severity, and hold labels;
- reconcile assignees and current owner;
- correct parent, child, predecessor, successor, project, program, release, and incident references;
- record events, acknowledgments, escalation, decisions, evidence, and halt reasons;
- prepare Go/No-Go and Promotion Candidate evidence packets;
- activate or defer an already-authorized successor;
- apply, narrow, release, or restore an authorized hold;
- preserve and restore active task, branch, claim, and resume context;
- reconcile Development, Promotion Candidate, Production, and Day-2 state;
- create or update bounded remediation, communication-failure, and closeout-exception Issues;
- close or reopen work when existing authority deterministically requires it; and
- reconcile dashboards, reports, portfolio state, and closeout.

## Prohibited mutations

The lane and delegated transaction executors must not independently:

- change product outcome, priority, cost, or business intent;
- add, remove, or reinterpret acceptance criteria;
- change design, architecture, UX, scope, non-goals, or allowlist;
- select or change delivery model or promotion profile;
- authorize Sandbox adoption, Development Go, Promotion Candidate Go, or Production Go;
- weaken or bypass validation, review, approval, safety, rollback, or separation-of-duty requirements;
- make PR approval or recovery-strategy decisions;
- change credentials, repository settings, paid services, infrastructure, or Production state as an administrative action;
- treat ambiguity as permission; or
- permit Sandbox -> Promotion Candidate, Sandbox -> Production, or Development -> Production.

## Trigger classes

| Trigger | Action |
| --- | --- |
| Intake or project preparation | Validate and route required context; prepare evidence without inventing decisions |
| Sandbox authorized | Record profile, isolation, question, owner, and result disposition |
| Sandbox adopted | Route a normal Development work package; block direct Promotion Candidate transition |
| Development assignment or handoff | Reconcile owner, profile, PR, check, closeout delegation, and successor state |
| PR/check/review changes | Reflect evidence and route action without replacing Engineering judgment |
| Assigned child integrated and verified | Deterministic CI closes when eligible; assigned Implementation / Operations role holder completes the transaction or routes one exception |
| Promotion Candidate selected | Record exact candidate identity and qualification requirements |
| Promotion Go/No-Go | Record decision and route remediation or Production preparation |
| Production deployment | Reconcile deployment and live-verification state |
| Operational incident | Create or elevate incident, apply authorized assessment hold, preserve work state |
| Incident bounded | Narrow holds and restore unrelated work after Day-2 Operations authorization |
| Recovery verified | Release remaining holds and restore exact eligible work state |
| Project/master completion | Perform independent aggregate audit and execute closeout under the matrix |
| Contradictory state | Correct when deterministic; otherwise route clarification to the owning role |
| Stale acknowledgment | Retry or escalate without duplicating the underlying action |
| Runner/control-plane failure | Record communications fault and route host recovery to Day-2 Operations |

## Runner and controller

The runner/controller is part of this vertical control plane.

It may normalize events, resolve state, route authorized work, publish evidence, retry bounded transport, and execute deterministic authorized actions.

It may not invent authority, make subjective decisions, impersonate human review, skip promotion profiles, or merge to `main` without Production authority.

Runner host/service maintenance belongs to Day-2 Operations. Workflow creation and onboarding belong to Implementation / Operations.

## Blocking rules

Administration & Communications blocks only the affected scope when:

- no valid source authority exists;
- a required dependency is unresolved;
- required validation or independent approval is missing or failed;
- lane, profile, branch, candidate, Issue class, parent/master, or assigned role identity is contradictory;
- a mandatory promotion transition is being skipped;
- a safety, Production, credential, destructive, or protected boundary is unresolved;
- a collision makes work unsafe;
- closeout cannot determine decision authority, transaction executor, source disposition, or successor disposition; or
- an active operational hold covers the work.

Reporting lag, dashboard lag, pending prose, optional comments, cosmetic labels, and non-critical housekeeping do not block authorized work.

## Evidence requirements

Every mutation or routed decision uses one or more of:

- canonical policy or reference contract;
- source Issue or recorded role authority;
- current Issue, PR, label, assignment, check, review, deployment, or incident state;
- exact candidate, commit, merge, integration, or deployment identity;
- project manifest and dependencies;
- closeout packet; or
- clarification recorded on GitHub.

State must be re-read before mutation and verified afterward.

## Idempotency and collision

- Repeated equivalent inputs do not create duplicate comments, Issues, holds, resumes, or transitions.
- Stable event/action keys should be used for automation.
- Stale actions do not overwrite newer decisions or evidence.
- One action revision may have one active mutation claim.
- Communication retries do not duplicate the work request.
- Independent lanes and projects are not locked by shared reporting surfaces.

## Exception lifecycle

```text
DETECTED -> RECORDED -> ROUTED -> GUIDANCE OR REMEDIATION -> VERIFIED -> RESOLVED
```

An exception identifies the affected subject, invariant, profile, evidence, blocking scope, owning role, required action, resume condition, and resolution evidence.

## Required references

- Constitution: `docs/governance/REPOSITORY-AUTHORITY.md`
- Domain policy: `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md`
- Agent roles and current mapping: `docs/governance/AGENT-TEAM.md`
- Lane/profile contract: `docs/reference/operations/operating-lanes-and-promotion-profiles.md`
- Delivery policy: `docs/governance/DELIVERY-AND-RELEASE.md`
- Day-2 policy: `docs/governance/OPERATIONS-AND-RECOVERY.md`
- Queue/dispatch procedure: `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- Closeout procedure: `docs/ops/pmo/github-issue-closeout-protocol.md`
