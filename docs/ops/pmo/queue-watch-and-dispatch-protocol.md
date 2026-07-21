---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Repository queue watch, cross-lane dispatch, local Cursor wake routing, acknowledgment, stale-communication recovery, profile-aware continuation, and bounded administrative reconciliation
Does Not Own: Product or Engineering decisions, PR approval, Production authorization, recovery strategy, workflow implementation, credentials, or project objectives
Canonical Reference: /docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md
Related Issues: #2396, #2492, #2640, #2641, #2639, #2695
Last Reviewed: 2026-07-21
---

# Queue Watch and Dispatch Protocol

## Purpose

Keep authorized LGFC work moving by translating current GitHub state into one safe next communication or action without serializing independent project work except when a qualifying standalone `OPS:` Issue activates the standing Operations interrupt rule.

Administration & Communications is the vertical control lane. It follows:

- PMO / Engineering;
- Implementation / Operations;
- Day-2 Operations;
- Sandbox, Development, Promotion Candidate, and Production profiles.

`OPS:` is a cross-lane queue interrupt classification. It is not a fifth lane.

## Current truths

- GitHub Issues are executable task authority.
- Labels and comments make work detectable; they do not prove agent pickup.
- The runner/controller is transport and deterministic execution infrastructure, not decision authority.
- Normal repository activity is authorized project-task execution.
- Development may continue on an independent project task while prior project tasks are review- or administration-pending, unless an Operations interrupt hold is active.
- A qualifying standalone `OPS:` source Issue automatically interrupts project execution under the standing Product Authority rule.
- Promotion Candidate is a mandatory barrier before Production.
- Sandbox cannot route directly to Promotion Candidate or Production.
- Development cannot route directly to Production.
- Administration & Communications is non-blocking unless a substantive invariant fails or an Operations interrupt hold is active.
- Day-2 Operations may authorize an additional broad assessment hold while Production impact is unknown and narrow that incident-specific hold after scope, containment, and ownership are understood.

## Dispatcher inputs

Every cycle inspects, as applicable:

- standalone `OPS:` source Issues and Operations interrupt state;
- source Issues and project/program parents;
- lane and profile state;
- assignments and labels;
- latest structured communication events;
- PRs, branches, candidate SHAs, checks, reviews, and deployments;
- dependencies and collisions;
- operational incidents and holds;
- acknowledgments and stale events;
- closeout and successor state;
- runner/controller communication health.

Alerts are hints. They do not narrow repository review or create authority.

## Event classes

The dispatcher recognizes:

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

Legacy ChatGPT/Cursor markers remain supported adapters until runtime migration is complete.

## Lane/profile resolution

For each candidate action, determine:

```text
Subject:
Durable owner role:
Horizontal lane:
Promotion profile:
Current authority:
Blocking scope:
Operations interrupt:
Operational hold:
Safe next action:
```

Fail closed when any required fact is ambiguous.

## Ops interrupt detection

Before normal project dispatch, inspect for a qualifying standalone `OPS:` source Issue.

The Issue qualifies only when all are true:

1. it is open, same-repository, and not a pull request;
2. its title begins `OPS:`;
3. it is standalone rather than a project task or project-lifecycle child;
4. its body provides an authoritative bounded objective, ownership, scope, acceptance criteria, validation, rollback, and stop conditions appropriate to the work; and
5. it is not merely a generated tracker, duplicate, bookkeeping record, advisory alert, or evidence-only record unless Product Authority explicitly elevated it.

When multiple qualifying `OPS:` Issues exist, preserve the interrupt and route ordering to Product Authority or Day-2 Operations according to current authority, severity, dependency, and collision evidence. Do not silently choose concurrent Cursor execution.

## Ops interrupt dispatch

When a qualifying `OPS:` Issue is detected:

1. record or confirm the standing Operations interrupt `HOLD` over project execution;
2. stop dispatching new project tasks and project successors;
3. identify all active project claims, commands, branches, tests, reviews, deployments, migrations, and rollback operations;
4. direct each active project task to the nearest safe checkpoint;
5. do not terminate an operation in a way that corrupts repository, environment, deployment, data, claim, or evidence state;
6. preserve the exact source Issue, branch, head SHA, claim, check, review, deployment, blocker, and next-action state for each interrupted project task;
7. route the `OPS:` Issue to the existing PMO / Engineering, Implementation / Operations, PR Approver / Engineering, Deterministic CI, Day-2 Operations, and Administration & Communications roles it requires;
8. give the `OPS:` Issue the next available execution capacity without creating duplicate or conflicting claims;
9. follow the normal delivery and promotion profile required by the operational change;
10. keep project dispatch halted until the `OPS:` Issue closes, is explicitly deferred, or an authorized `RESUME` releases the interrupt; and
11. restore preserved project state without duplicate dispatch, stale instructions, or lost evidence.

No additional material-risk threshold or new case-by-case priority decision is required after the Issue qualifies. The dispatcher is executing standing Product Authority, not inventing priority.

The interrupt affects project sequencing only. It does not bypass scope, validation, review, Production authority, rollback, or protected-stop requirements.

## Normal Development dispatch

Normal Development dispatch is eligible only when no Operations interrupt hold is active.

1. Confirm PMO / Engineering recorded implementation Go.
2. Confirm the task is in Development and has a valid source Issue.
3. Confirm dependencies, branch, allowlist, and operational-hold state.
4. Confirm one active Implementation / Operations claim per approved execution stream unless authority permits more.
5. Route the assignment or wake event.
6. Do not report work active until a later comment, commit, or PR update proves pickup.
7. When `IMPLEMENTATION HANDOFF` occurs, move only that task to review/integration disposition.
8. Make the next independent Development task eligible when dependencies, collision state, and Operations interrupt state allow it.

Administrative closeout of the prior task is not a universal successor gate. An active Operations interrupt is a universal project-dispatch gate.

## Sandbox dispatch

Sandbox dispatch is eligible only when no Operations interrupt hold is active or the Sandbox work belongs to the controlling Operations Issue.

1. Confirm PMO / Engineering authorized the experiment and its question.
2. Confirm isolation and no Production path.
3. Route the bounded experiment.
4. Record result as discard, evidence-only, or adopt into Development.
5. For adoption, require a normal Development work package.
6. Block any direct Sandbox-to-Promotion Candidate or Sandbox-to-Production transition.

## Promotion Candidate dispatch

Project Promotion Candidate dispatch pauses while an Operations interrupt is active unless completing the in-flight transition is the smallest safe checkpoint or the owning authority explicitly permits it.

1. Confirm the exact integrated Development candidate identity.
2. Confirm qualification requirements and evidence owners.
3. Route applicable integrated, regression, load/performance, security, migration, rollback, readiness, and standards checks.
4. Route subjective or protected findings to PR Approver / Engineering or the owning role.
5. Record Go, No-Go, or return-to-Development.
6. Do not route Production until the candidate is approved and unchanged.

## Production dispatch

Project Production dispatch pauses while an Operations interrupt is active unless completing or reversing an in-flight Production operation is the safest checkpoint or the controlling Operations Issue authorizes the promotion.

1. Confirm `PRODUCTION GO` and required approval evidence.
2. Confirm the exact approved candidate identity.
3. Confirm no unreviewed drift.
4. Confirm rollback and environment readiness.
5. Route controlled promotion/deployment.
6. Route live verification results.
7. On failure, route containment, rollback, or `OPERATIONAL INCIDENT`.

## Lightweight problem adjustment

When `PROBLEM FOUND` appears:

1. identify the prior controlling decision;
2. route to the role that made that decision;
3. preserve the smallest affected scope unless the standing Operations interrupt applies;
4. allow independent project work to continue only when no Operations interrupt hold is active;
5. route `GUIDANCE`, `ADJUSTMENT`, or `PLAN CHANGE REQUIRED`;
6. record the decision and route `RESUME` when its condition is met.

Do not convert routine bounded adjustment into a project-wide replan. Do not weaken an active Operations interrupt merely because the operational work is bounded.

## Day-2 incident dispatch

An incident may be the controlling `OPS:` Issue or may be created beneath an existing Operations interrupt.

1. Create or update one deduplicated incident from trusted evidence.
2. Confirm the standing Operations interrupt hold.
3. Route an additional assessment hold when impact is unknown.
4. Preserve active PMO and Implementation state.
5. Route severity, scope, probable cause, containment, and ownership assessment.
6. After Day-2 Operations bounds the incident, narrow incident-specific holds without automatically releasing the standing Operations interrupt.
7. Route corrective Development and Promotion Candidate work when required.
8. Route `RECOVERY VERIFIED` and applicable hold release.
9. Restore preserved project state only after the controlling `OPS:` Issue closes, is deferred, or records authorized `RESUME`.

## Administration & Communications actions

When deterministic and authorized, the dispatcher may:

- add or remove routing, lane, profile, owner, priority, severity, hold, and status labels;
- reconcile assignments and parent/child/project/program/release/Operations/incident links;
- post structured events, acknowledgments, retries, and escalation;
- prepare evidence packets;
- activate or defer an already-authorized successor;
- apply, narrow, release, or restore an authorized hold;
- preserve and restore interrupted project execution state;
- reconcile Issue, PR, check, review, deployment, reporting, and closeout state;
- create or update bounded remediation, communication-failure, and closeout-exception Issues;
- perform or verify authorized non-merge dispositions.

The dispatcher must not independently change product outcome, design, acceptance, implementation scope, delivery model, promotion profile, PR disposition, recovery strategy, priority, Production authority, repository settings, credentials, or infrastructure. Applying the standing Operations interrupt rule is not an independent priority change.

## Local Cursor wake adapter

Until the controller migration is complete, a valid local wake requires:

1. open source Issue;
2. applicable local runtime authority;
3. current wake labels;
4. authoritative decision/event on the Issue;
5. no newer state superseding the action;
6. one separate `LOCAL CURSOR RESUME` pointing to the decision;
7. one bounded next action; and
8. no active conflicting claim.

While an Operations interrupt hold is active, project wake events are ineligible. The controlling `OPS:` Issue may be woken when its normal eligibility contract is satisfied.

The wake marker is transport only. It does not prove pickup.

## Acknowledgment and stale communication

- Stable event/action identities suppress duplicates.
- Repeated transport retries do not create duplicate work.
- Acknowledgment confirms receipt, not successful execution.
- Stale events do not overwrite newer check, review, decision, hold, merge, deployment, or closeout state.
- Missed acknowledgment routes to the recorded escalation role.
- Runner/controller failure is recorded as a communication fault and routed to Day-2 Operations for host/service recovery.
- A stale project `RESUME` must not override an active Operations interrupt.

## Closeout and successor handling

`CLOSEOUT` reconciles completed work after required execution, validation, approval, profile transitions, integration/deployment, and evidence are satisfied.

- A merged Development child may close after verified non-main integration and required task evidence.
- Promotion Candidate and Production closeout require their own evidence.
- A source Issue does not close because a PR is merely green, review-ready, approved, or mergeable.
- A successful deterministic closeout transaction is not duplicated.
- Closeout exceptions block only the affected transition or successor when a substantive invariant is missing, except that an active Operations interrupt continues to block project dispatch.
- Independent project Development work continues unless it shares the failed dependency or collision and no Operations interrupt is active.
- Closing, deferring, or releasing the controlling `OPS:` Issue triggers restoration of preserved project state.

## Idempotency and expected state

Before mutation:

1. read current live state;
2. identify the exact authority and evidence;
3. compute the intended state revision;
4. suppress duplicate or stale action;
5. ensure only the allowed scope changes.

After mutation:

1. re-read the surface;
2. verify the intended state;
3. record the next eligible action or exact halt reason;
4. resolve or supersede any exception record.

## Prohibited outcomes

The dispatcher must prevent:

- repository-wide serialization caused by routine PR review or administration;
- failure to halt project dispatch for a qualifying standalone `OPS:` Issue;
- destructive interruption before a safe checkpoint;
- project wake or successor routing while an Operations interrupt hold is active;
- treating `OPS:` as a fifth operating lane;
- direct Sandbox-to-Promotion Candidate or Production routing;
- direct Development-to-Production routing;
- runner/controller invention of authority;
- self-approval of protected work;
- Production promotion without approved candidate identity;
- incident-specific holds remaining broad after the incident is sufficiently bounded;
- release of the standing Operations interrupt without close, explicit deferral, or authorized `RESUME`;
- duplicate assignment, hold, resume, integration, closeout, or incident actions.

## Required references

- Constitution: `docs/governance/REPOSITORY-AUTHORITY.md`
- PMO priority and Operations interrupt precedence: `docs/governance/PMO-PORTFOLIO.md`
- Administration & Communications: `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md`
- Lane/profile contract: `docs/reference/operations/operating-lanes-and-promotion-profiles.md`
- Cross-lane communication workflow: `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- Delivery policy: `docs/governance/DELIVERY-AND-RELEASE.md`
- Day-2 policy: `docs/governance/OPERATIONS-AND-RECOVERY.md`
- Closeout procedure: `docs/ops/pmo/github-issue-closeout-protocol.md`
- Runner contract: `docs/reference/ci/repository-runner-contract.md`