---
Doc Type: Governance
Audience: Human + AI
Authority Level: Domain Policy
Owns: Production health, degraded-service routing, incident classification, containment, recovery strategy, operational hold release, component recovery, and stabilization-first boundaries
Does Not Own: Administration & Communications policy, delivery-model selection, PMO sizing, PR approval roles, CI implementation, project objectives, or daily operator checklists
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2495, #2640, #2641, #2695
Last Reviewed: 2026-07-21
---

# Operations and Recovery

## Purpose

This document is the canonical Day-2 Operations policy. It defines how Operations interrupts are coordinated, how production health is monitored, how degradation and outages are classified, how work is paused, how recovery strategy is selected, and how normal project work resumes.

Administration & Communications policy is owned separately by `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md`.

## Day-2 Operations lane

Day-2 Operations begins when a feature reaches Production and continues for the life of the service. It also coordinates repository operational work that is validly opened as a standalone `OPS:` source Issue.

It owns:

- Operations interrupt coordination and release within its authority;
- production monitoring and health interpretation;
- incident severity and impact classification;
- containment and rollback decisions;
- recovery strategy;
- operational assessment and targeted holds;
- runner host/service health and recovery;
- corrective implementation routing;
- recovery validation and sustained-health criteria;
- release of operational holds.

All current team members may participate according to their durable roles.

`OPS:` is a cross-lane interrupt classification, not a fifth operating lane. PMO / Engineering retains design and implementation-Go authority, Implementation / Operations performs corrective work, PR Approver / Engineering performs independent review, Deterministic CI provides machine evidence, and Administration & Communications records and routes state.

## Operations interrupt precedence

A qualifying standalone `OPS:` source Issue interrupts normal project execution immediately under the standing Product Authority rule in `docs/governance/PMO-PORTFOLIO.md`.

The Operations interrupt applies whether the Issue concerns:

- an active Production incident;
- degraded service or a corrective release;
- runner, bridge, controller, CI, deployment, recovery, capacity, security, or communication infrastructure;
- repository operational reliability or hardening; or
- another bounded Day-2 Operations need validly classified as a standalone `OPS:` source Issue.

The interrupt does not require a separate material-risk finding or case-by-case reprioritization after the Issue qualifies.

When an Operations interrupt activates:

1. Administration & Communications stops new project dispatch and records the hold.
2. Active project work reaches the nearest safe checkpoint and preserves its state.
3. Day-2 Operations confirms the operational owner, immediate objective, affected systems, and release condition.
4. The Operations Issue receives the next available capacity required from the existing lanes.
5. The work follows the delivery, validation, approval, Production, and rollback controls required by its risk.
6. Project work remains held until the Issue closes, is explicitly deferred, or Day-2 Operations or Product Authority records an authorized `RESUME`.

A safe checkpoint protects in-flight branch, claim, test, deployment, migration, rollback, and evidence state. The interrupt must not terminate work in a way that creates a second operational problem.

Tracker-only, duplicate, bookkeeping, advisory, and evidence-only records do not trigger the interrupt unless Product Authority explicitly elevates them into authoritative standalone Operations work.

## Detection and incident creation

Trusted evidence may come from:

- deployment status;
- route or uptime monitoring;
- application health checks;
- CI/CD runtime checks;
- D1, B2, or external-service connectivity;
- logs and alerts;
- verified human reports.

Deterministic automation may create or elevate a deduplicated operational Issue and attach evidence. It must not invent cause, recovery strategy, production authority, or authoritative `OPS:` classification beyond pre-authorized deterministic rules.

Not every Operations interrupt is a Production incident. Day-2 Operations must classify Production impact separately after the interrupt is active.

## Assessment hold

When production impact is unknown, Day-2 Operations may authorize a broad incident assessment hold in addition to the standing Operations interrupt.

The incident assessment hold exists to prevent project work from worsening an incident or consuming the small team before scope is understood.

During assessment determine:

- user and system impact;
- severity;
- probable cause or bounded hypothesis;
- containment;
- affected projects, branches, environments, and resources;
- recovery owner;
- safe next action.

Administration & Communications records the hold, preserves work state, routes assignments, and tracks acknowledgment.

## Narrowing and releasing holds

An incident assessment hold should not remain broad until full recovery when the incident has been sufficiently bounded.

Once impact, probable cause, containment, affected scope, and resolution ownership are understood:

- convert the broad incident hold to targeted project or incident-task holds;
- release resources not required by the incident when doing so does not conflict with the controlling Operations interrupt;
- continue incident work with the assigned team;
- preserve any collision or safety restrictions that remain.

Day-2 Operations authorizes incident-hold narrowing and release. Administration & Communications executes state restoration and routes `RESUME`.

Narrowing or releasing an incident-specific hold does not automatically release the standing Operations interrupt. Normal project execution resumes only after the controlling `OPS:` Issue closes, is explicitly deferred, or an authorized `RESUME` releases the interrupt.

## Recovery paths

A single incident uses one primary path at a time.

| Path | Trigger | Primary goal |
| --- | --- | --- |
| Emergency stabilization | Production unavailable, unsafe, exploited, data at risk, or materially degraded | Restore safe service first |
| Bounded corrective release | Known, isolated defect with a complete low-risk fix | Restore behavior through the applicable Promotion Candidate and Production path |
| Structural recovery | Multi-component, architectural, data, or standards change | Return through PMO / Engineering, Development, Promotion Candidate, and Production |

Changing the recovery path requires a Day-2 Operations decision recorded on the incident Issue. If the new path changes architecture, acceptance, product outcome, delivery model, or Production boundary, route the decision to the owning role.

## Degraded-service routing

| Symptom | Default route |
| --- | --- |
| Site unavailable, active exploit, data-loss risk, unsafe auth/admin behavior | Emergency stabilization |
| Single feature broken with known bounded fix | Bounded corrective release |
| Material performance issue with known isolated cause | Bounded corrective release |
| Structural performance, architecture, or multi-component regression | Structural recovery |
| Cosmetic or documentation-only defect | Routine delivery inside the active Operations interrupt unless Product Authority defers it |

When uncertain, stabilize and contain before choosing a broader implementation path.

## Emergency stabilization

Response order:

1. confirm impact and severity;
2. pause conflicting Production promotions and Development integration when necessary;
3. contain traffic, writes, or affected functionality;
4. roll back to last known good when possible;
5. apply the smallest safe recovery when rollback is insufficient;
6. obtain required protected Production authority;
7. run targeted recovery verification;
8. restore safe bounded service;
9. create follow-up work for root cause, hardening, standards, and documentation.

Emergency automation is limited to pre-authorized, deterministic, reversible actions. It must not mutate credentials, paid services, destructive data, or repository settings without authority.

## Corrective implementation and promotion

Operational corrective work uses the profile path required by its risk:

```text
Day-2 Operations
  -> Development
  -> Promotion Candidate
  -> Production
  -> recovery verification
```

A narrowly authorized emergency action may stabilize Production before full release qualification, but the resulting state must be followed by normal Development and Promotion Candidate work when required.

Sandbox may be used by PMO / Engineering to test uncertain recovery assumptions, but Sandbox output cannot move directly into Production.

Operations interrupt precedence never authorizes bypass of a required profile, independent review, Production approval, or rollback plan.

## Lightweight recovery-strategy adjustment

When new evidence invalidates the current recovery approach:

```text
PROBLEM FOUND
  -> Day-2 Operations reviews evidence
  -> GUIDANCE, ADJUSTMENT, or PLAN CHANGE REQUIRED
  -> Administration & Communications records and routes
  -> RESUME under the revised strategy
```

A bounded adjustment does not require a full incident redesign. A material change to recovery strategy, architecture, Production boundary, or risk classification requires recorded authority.

## Component and Development health

Component integration health is recorded through checks or branch status.

| State | Meaning | Effect |
| --- | --- | --- |
| Green | Required Development checks pass | Eligible independent work may integrate when no Operations interrupt hold applies |
| Red | Broken build, integration failure, or unresolved protected issue | Affected integration stops until green is restored |
| Hold | Explicit operational or Engineering hold | Covered work stops |

A red Development component is not automatically a Production incident. Classify Production impact separately. A qualifying standalone `OPS:` Issue may nevertheless interrupt project work before Production impact is known.

When Development integration breaks:

1. identify the failing change and evidence;
2. stop affected successor integration;
3. remediate on a bounded branch;
4. rerun integrated checks;
5. restore green state through the applicable approval path;
6. resume independent work only when no Operations interrupt hold remains.

## Runner service operations

The runner is communications/control-plane infrastructure, but its host and service are Day-2 Operations assets.

Day-2 Operations owns:

- registration and service availability;
- `systemd` operation;
- capacity and storage;
- patching and security;
- unexpected workload containment;
- stop/start, disable, rollback, and recovery.

Administration & Communications owns runner event routing, acknowledgments, retries, escalation, and communication-health state. Implementation / Operations owns workflow creation and onboarding.

## Operations completion and project resume

An Operations interrupt is complete or releasable when:

- the source Issue's acceptance and validation requirements are satisfied, or authorized deferral is recorded;
- the service or repository capability is safe and functioning within accepted bounds;
- corrective change and required Promotion Candidate checks are complete;
- Production verification passes when Production was touched;
- monitoring shows sustained health for the required period;
- unresolved root cause, hardening, or standards work is tracked;
- the Operations Issue, incident evidence, and interrupted project state are reconciled; and
- Product Authority or Day-2 Operations within its authority records closeout, deferral, or `RESUME`.

Administration & Communications then restores the preserved project queue without duplicate claims or stale assignments.

## Canonical references

| Topic | Owner |
| --- | --- |
| PMO priority and Operations interrupt precedence | `docs/governance/PMO-PORTFOLIO.md` |
| Administration & Communications policy | `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md` |
| Lane and profile contract | `docs/reference/operations/operating-lanes-and-promotion-profiles.md` |
| Delivery and promotion policy | `docs/governance/DELIVERY-AND-RELEASE.md` |
| Runner contract | `docs/reference/ci/repository-runner-contract.md` |
| Emergency recovery procedure | `docs/how-to/ops/run-emergency-recovery.md` |
| Rollback evidence | `docs/reference/delivery/delivery-and-rollback-profiles.md` |

## Supersession

This policy supersedes lower-level instructions that treat qualifying standalone `OPS:` Issues as ordinary project backlog, require a separate risk threshold before their interrupt precedence applies, keep an incident hold broad after the incident is bounded, assign Administration independent recovery authority, or permit operational corrective work to bypass required Development, Promotion Candidate, or Production controls.
