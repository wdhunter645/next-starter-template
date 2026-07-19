---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Repository queue watch, cross-lane dispatch, local Cursor wake routing, acknowledgment, stale-communication recovery, profile-aware continuation, and bounded administrative reconciliation
Does Not Own: Product or Engineering decisions, PR approval, Production authorization, recovery strategy, workflow implementation, credentials, or project objectives
Canonical Reference: /docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md
Related Issues: #2396, #2492, #2640, #2641, #2639
Last Reviewed: 2026-07-19
---

# Queue Watch and Dispatch Protocol

## Purpose

Keep authorized LGFC work moving by translating current GitHub state into one safe next communication or action without serializing independent work.

Administration & Communications is the vertical control lane. It follows:

- PMO / Engineering;
- Implementation / Operations;
- Day-2 Operations;
- Sandbox, Development, Promotion Candidate, and Production profiles.

## Current truths

- GitHub Issues are executable task authority.
- Labels and comments make work detectable; they do not prove agent pickup.
- The runner/controller is transport and deterministic execution infrastructure, not decision authority.
- Development may continue on an independent task while prior tasks are review- or administration-pending.
- Promotion Candidate is a mandatory barrier before Production.
- Sandbox cannot route directly to Promotion Candidate or Production.
- Development cannot route directly to Production.
- Administration & Communications is non-blocking unless a substantive invariant fails.
- Day-2 Operations may authorize a broad assessment hold while Production impact is unknown and narrow it after scope, containment, and ownership are understood.

## Dispatcher inputs

Every cycle inspects, as applicable:

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
Operational hold:
Safe next action:
```

Fail closed when any required fact is ambiguous.

## Normal Development dispatch

1. Confirm PMO / Engineering recorded implementation Go.
2. Confirm the task is in Development and has a valid source Issue.
3. Confirm dependencies, branch, allowlist, and operational-hold state.
4. Confirm one active Implementation / Operations claim per approved execution stream unless authority permits more.
5. Route the assignment or wake event.
6. Do not report work active until a later comment, commit, or PR update proves pickup.
7. When `IMPLEMENTATION HANDOFF` occurs, move only that task to review/integration disposition.
8. Make the next independent Development task eligible when dependencies and collision state allow it.

Administrative closeout of the prior task is not a universal successor gate.

## Sandbox dispatch

1. Confirm PMO / Engineering authorized the experiment and its question.
2. Confirm isolation and no Production path.
3. Route the bounded experiment.
4. Record result as discard, evidence-only, or adopt into Development.
5. For adoption, require a normal Development work package.
6. Block any direct Sandbox-to-Promotion Candidate or Sandbox-to-Production transition.

## Promotion Candidate dispatch

1. Confirm the exact integrated Development candidate identity.
2. Confirm qualification requirements and evidence owners.
3. Route applicable integrated, regression, load/performance, security, migration, rollback, readiness, and standards checks.
4. Route subjective or protected findings to PR Approver / Engineering or the owning role.
5. Record Go, No-Go, or return-to-Development.
6. Do not route Production until the candidate is approved and unchanged.

## Production dispatch

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
3. preserve the smallest affected scope;
4. allow independent work to continue when safe;
5. route `GUIDANCE`, `ADJUSTMENT`, or `PLAN CHANGE REQUIRED`;
6. record the decision and route `RESUME` when its condition is met.

Do not convert routine bounded adjustment into a project-wide replan.

## Day-2 incident dispatch

1. Create or update one deduplicated incident from trusted evidence.
2. Route an assessment hold when impact is unknown.
3. Preserve active PMO and Implementation state.
4. Route severity, scope, probable cause, containment, and ownership assessment.
5. After Day-2 Operations bounds the incident, narrow holds and resume unrelated work.
6. Route corrective Development and Promotion Candidate work when required.
7. Route `RECOVERY VERIFIED` and remaining hold release.
8. Restore preserved work state without duplicate claims.

## Administration & Communications actions

When deterministic and authorized, the dispatcher may:

- add or remove routing, lane, profile, owner, priority, severity, hold, and status labels;
- reconcile assignments and parent/child/project/program/release/incident links;
- post structured events, acknowledgments, retries, and escalation;
- prepare evidence packets;
- activate or defer an already-authorized successor;
- apply, narrow, release, or restore an authorized hold;
- reconcile Issue, PR, check, review, deployment, reporting, and closeout state;
- create or update bounded remediation, communication-failure, and closeout-exception Issues;
- perform or verify authorized non-merge dispositions.

The dispatcher must not independently change product outcome, design, acceptance, implementation scope, delivery model, promotion profile, PR disposition, recovery strategy, priority, Production authority, repository settings, credentials, or infrastructure.

## Local Cursor wake adapter

Until the controller migration is complete, a valid local wake requires:

1. open source Issue;
2. applicable local runtime authority;
3. current wake labels;
4. authoritative decision/event on the Issue;
5. no newer state superseding the action;
6. one separate `LOCAL CURSOR RESUME` pointing to the decision;
7. one bounded next action.

The wake marker is transport only. It does not prove pickup.

## Acknowledgment and stale communication

- Stable event/action identities suppress duplicates.
- Repeated transport retries do not create duplicate work.
- Acknowledgment confirms receipt, not successful execution.
- Stale events do not overwrite newer check, review, decision, hold, merge, deployment, or closeout state.
- Missed acknowledgment routes to the recorded escalation role.
- Runner/controller failure is recorded as a communication fault and routed to Day-2 Operations for host/service recovery.

## Closeout and successor handling

`CLOSEOUT` reconciles completed work after required execution, validation, approval, profile transitions, integration/deployment, and evidence are satisfied.

- A merged Development child may close after verified non-main integration and required task evidence.
- Promotion Candidate and Production closeout require their own evidence.
- A source Issue does not close because a PR is merely green, review-ready, approved, or mergeable.
- A successful deterministic closeout transaction is not duplicated.
- Closeout exceptions block only the affected transition or successor when a substantive invariant is missing.
- Independent Development work continues unless it shares the failed dependency or collision.

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
- direct Sandbox-to-Promotion Candidate or Production routing;
- direct Development-to-Production routing;
- runner/controller invention of authority;
- self-approval of protected work;
- Production promotion without approved candidate identity;
- operational holds remaining broad after the incident is sufficiently bounded;
- duplicate assignment, hold, resume, integration, closeout, or incident actions.

## Required references

- Constitution: `docs/governance/REPOSITORY-AUTHORITY.md`
- Administration & Communications: `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md`
- Lane/profile contract: `docs/reference/operations/operating-lanes-and-promotion-profiles.md`
- Cross-lane communication workflow: `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- Delivery policy: `docs/governance/DELIVERY-AND-RELEASE.md`
- Day-2 policy: `docs/governance/OPERATIONS-AND-RECOVERY.md`
- Closeout procedure: `docs/ops/pmo/github-issue-closeout-protocol.md`
- Runner contract: `docs/reference/ci/repository-runner-contract.md`