---
Doc Type: Governance
Audience: Human + AI
Authority Level: Domain Policy
Owns: Cross-lane communication, evidence, routing, repository-state reconciliation, acknowledgment, escalation, hold/resume administration, reporting, and closeout policy
Does Not Own: Product outcomes, design decisions, implementation methods, PR approval decisions, incident recovery strategy, runner host maintenance, or production authorization
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2640, #2641, #2639
Last Reviewed: 2026-07-19
---

# Administration and Communications

## Purpose

Administration & Communications is the vertical control lane that supports PMO / Engineering, Implementation / Operations, and Day-2 Operations.

It ensures that decisions, evidence, assignments, acknowledgments, escalations, holds, resumes, reports, and closeout records move reliably between the horizontal lanes.

It does not make the decisions owned by those lanes.

## Operating position

```text
                    Administration & Communications
                    evidence | routing | runner | state
                         |             |             |
                         v             v             v
PMO / Engineering -> Implementation / Operations -> Day-2 Operations
```

The lane is active before project Go, during implementation and promotion, after Production deployment, and throughout Day-2 support.

## Owns

- Go/No-Go evidence packet preparation;
- issue, project, program, PR, check, deployment, release, and incident state reconciliation;
- labels, assignments, current-owner routing, and durable event records;
- cross-lane communication and acknowledgment tracking;
- decision requests and escalation routing;
- operational hold, hold-narrowing, release, and resume administration;
- traceability from requirement to task, acceptance, validation, and evidence;
- planned-versus-completed accounting and gap detection;
- task, issue, project, program, release, and incident closeout;
- preservation and restoration of active work state;
- stale or unanswered communication detection;
- runner/controller communication-health state.

## Does not own

Administration & Communications must not independently change:

- product outcome or priority;
- architecture, design, or acceptance criteria;
- implementation scope or method;
- delivery model or promotion profile;
- PR approval disposition;
- incident classification or recovery strategy;
- production authorization;
- repository settings, credentials, or paid services.

It executes state transitions only from the recorded authority of the role that owns the decision.

## Communication surfaces

| Surface | Use |
| --- | --- |
| GitHub Issues | Durable task, project, program, escalation, and incident authority |
| Labels | Current machine-readable lane, profile, owner, priority, severity, hold, and routing state |
| Structured Issue comments | Durable cross-lane events and decisions |
| PR reviews and threads | Engineering disposition and code-review evidence |
| Check runs | Deterministic validation, eligibility, readiness, and health evidence |
| Deployment status | Deployment progress, success, failure, and rollback state |
| Workflow artifacts and committed reports | Detailed evidence packets |
| External notifications | Attention acceleration only; decisions must be written back to GitHub |

## Runner and controller

The repository runner and routing controller are shared communications/control-plane infrastructure in this lane.

They provide the “dial tone” used by horizontal lanes to announce work, route assignments, publish evidence, request decisions, apply holds, and resume work.

They do not own decision authority.

- Administration & Communications owns event transport, routing semantics, acknowledgment, retry, escalation, and communication-health state.
- Implementation / Operations owns workflow creation and onboarding.
- Day-2 Operations owns runner host/service availability, capacity, patching, security, stop/start, rollback, and recovery.
- The originating horizontal lane owns the meaning and authorization of the work request.

## Minimum communication vocabulary

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

Events must identify the subject, source role/lane, target role/lane, evidence, requested action, blocking scope, decision authority, and supersession state when applicable.

## Lightweight problem adjustment

Default path:

```text
PROBLEM FOUND
  -> route to the role that made the controlling decision
  -> GUIDANCE or ADJUSTMENT
  -> record the decision
  -> RESUME
```

Only the affected task or incident pauses unless evidence supports broader impact.

Use `PLAN CHANGE REQUIRED` only for material changes to product outcome, architecture, acceptance criteria, dependency structure, delivery model, production boundary, or recovery strategy.

## Non-blocking rule

Pending prose, labels, dashboards, routine reports, or bookkeeping do not block PMO, Development, Promotion Candidate, or Production work.

Administration & Communications may hold or return work only when evidence shows a substantive invariant failure, including missing or contradictory:

- authority;
- required task;
- dependency;
- acceptance criterion;
- validation;
- approval;
- safety or production boundary;
- promotion-profile transition;
- closeout integrity.

## Operational hold administration

When production impact is unknown, Administration & Communications records a broad assessment hold and preserves active work state.

Day-2 Operations determines impact, probable cause, containment, affected scope, resolution ownership, and hold release authority.

Once the incident is bounded, Administration & Communications narrows the hold and restores unrelated work. Full recovery is not required before unaffected resources resume.

## Closeout

Closeout verifies:

- every planned item is completed, removed, superseded, or explicitly deferred;
- required evidence and approvals exist;
- Promotion Candidate and Production decisions are recorded;
- unresolved defects and production risks are explicit;
- issue, project, program, release, and incident state agree;
- no required promotion profile was skipped.

Successful deterministic post-merge automation may perform the primary closeout transaction. Administration & Communications owns missing, partial, contradictory, non-merge, and later-discovered exceptions.