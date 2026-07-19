---
Doc Type: Governance
Audience: Human + AI
Authority Level: Domain Policy
Owns: Production health, degraded-service routing, incident classification, containment, recovery strategy, operational hold release, component recovery, and stabilization-first boundaries
Does Not Own: Administration & Communications policy, delivery-model selection, PMO sizing, PR approval roles, CI implementation, project objectives, or daily operator checklists
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2495, #2640, #2641
Last Reviewed: 2026-07-19
---

# Operations and Recovery

## Purpose

This document is the canonical Day-2 Operations policy. It defines how production health is monitored, how degradation and outages are classified, how work is paused while impact is unknown, how recovery strategy is selected, and how normal work resumes after an incident is bounded.

Administration & Communications policy is owned separately by `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md`.

## Day-2 Operations lane

Day-2 Operations begins when a feature reaches Production and continues for the life of the service.

It owns:

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

## Detection and incident creation

Trusted evidence may come from:

- deployment status;
- route or uptime monitoring;
- application health checks;
- CI/CD runtime checks;
- D1, B2, or external-service connectivity;
- logs and alerts;
- verified human reports.

Deterministic automation may create or elevate a deduplicated operational Issue and attach evidence. It must not invent cause, recovery strategy, or production authority.

## Assessment hold

When production impact is unknown, Day-2 Operations may authorize a broad assessment hold.

The hold exists to prevent project work from worsening the incident or consuming the small team before scope is understood.

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

A broad assessment hold should not remain until full recovery when the incident has been sufficiently bounded.

Once impact, probable cause, containment, affected scope, and resolution ownership are understood:

- convert the broad hold to targeted project or incident-task holds;
- release unaffected PMO / Engineering and Implementation / Operations resources;
- continue incident work with the assigned team;
- preserve any collision or safety restrictions that remain.

Day-2 Operations authorizes hold release. Administration & Communications executes the state restoration and routes `RESUME`.

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
| Cosmetic or documentation-only defect | Routine delivery unless risk justifies incident priority |

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
| Green | Required Development checks pass | Eligible independent work may integrate |
| Red | Broken build, integration failure, or unresolved protected issue | Affected integration stops until green is restored |
| Hold | Explicit operational or Engineering hold | Only covered work stops |

A red Development component is not automatically a Production incident. Classify Production impact separately.

When Development integration breaks:

1. identify the failing change and evidence;
2. stop affected successor integration;
3. remediate on a bounded branch;
4. rerun integrated checks;
5. restore green state through the applicable approval path;
6. resume independent work.

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

## Recovery completion

Recovery is complete when:

- service is safe and functioning within accepted bounds;
- corrective change and required Promotion Candidate checks are complete;
- Production verification passes;
- monitoring shows sustained health for the required period;
- remaining holds are released;
- unresolved root cause, hardening, or standards work is tracked;
- incident evidence and project state are reconciled.

## Canonical references

| Topic | Owner |
| --- | --- |
| Administration & Communications policy | `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md` |
| Lane and profile contract | `docs/reference/operations/operating-lanes-and-promotion-profiles.md` |
| Delivery and promotion policy | `docs/governance/DELIVERY-AND-RELEASE.md` |
| Runner contract | `docs/reference/ci/repository-runner-contract.md` |
| Emergency recovery procedure | `docs/how-to/ops/run-emergency-recovery.md` |
| Rollback evidence | `docs/reference/delivery/delivery-and-rollback-profiles.md` |

## Supersession

This policy supersedes lower-level instructions that keep a repository-wide hold active after the incident is bounded, assign Administration independent recovery authority, or permit operational corrective work to bypass required Development, Promotion Candidate, or Production controls.