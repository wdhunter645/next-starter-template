---
Doc Type: Governance
Audience: Human + AI
Authority Level: Domain Policy
Owns: Administrative control lane policy, final clarification and housekeeping resolution, degraded-service routing, emergency recovery policy, component-branch synchronization and red/green state rules, and stabilization-first incident boundaries
Does Not Own: Delivery-model selection, PMO sizing, agent approval roles, CI gate implementation, project objectives, or detailed day-to-day operator checklists
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2495, #2641
Last Reviewed: 2026-07-19
---

# Operations and Recovery

## Purpose

This document is the canonical **Operations and Recovery** domain policy. It defines the repository-wide administrative control lane; how final clarifications, housekeeping, closeout exceptions, and deterministic metadata corrections are resolved; how degraded service is routed among break-glass recovery, expedited Model A, and planned Model B; how emergency recovery remains stabilization-first and independent from normal delivery models; and how component branches synchronize, recover, and report integration health.

Stable administrative mutation and trigger requirements live in `docs/reference/operations/administrative-control-lane-contract.md`. Stable rollback evidence requirements live in `docs/reference/delivery/delivery-and-rollback-profiles.md`. Administrative execution procedures live in `docs/ops/pmo/queue-watch-and-dispatch-protocol.md` and `docs/ops/pmo/github-issue-closeout-protocol.md`. Emergency execution steps live in `docs/how-to/ops/run-emergency-recovery.md`.

## Administrative control lane

The administrative control lane is the repository's mutation-capable, non-code operational control plane. It follows all approved execution and review lanes from intake through final closure without becoming a repository-wide implementation lock.

### Policy boundary

The lane may reconcile deterministic repository state to existing authority, including:

- lifecycle, status, routing, handoff, PMO, and reporting labels;
- Issue and PR assignments;
- parent, child, predecessor, successor, project, and program references;
- stale, contradictory, duplicate, or terminally invalid administrative state;
- dashboard, audit, milestone, closeout, and queue-continuation evidence;
- final administrative closure, reopen, cancellation, supersession, or remediation state when already authorized;
- bounded exception and housekeeping records.

The lane must not create new execution authority. It must not change:

- project objectives, product scope, acceptance criteria, or non-goals;
- technical design, architecture, file allowlists, implementation branch, runtime, or environment authority;
- delivery model, validation requirements, review requirements, or approval requirements;
- priority, dependency order, or successor order without explicit higher authority;
- repository code, workflow implementation, production configuration, secrets, credentials, or external infrastructure as an administrative action.

When the correct administrative result is ambiguous, the lane records the conflict and obtains final clarification from the owning authority. It does not guess.

### Final clarification ownership

The administrative control lane owns final clarification management for housekeeping, reporting, routing, and closeout exceptions.

Chat / Atlas resolves routine administrative clarifications from canonical policy, the source Issue, current GitHub state, and verified execution evidence. Bill resolves only material product, priority, cost, credential, business, destructive, or unresolved authority decisions.

Every clarification must be persisted on the relevant GitHub Issue, pull request, or canonical repository document before the resulting administrative mutation is applied.

A clarification that changes objectives, design, acceptance criteria, delivery model, validation, approval, priority, production behavior, or business intent is not an administrative clarification and routes to the owning domain.

### Post-merge and exception ownership

Successful post-merge closeout CI is the primary merge-triggered administrative actor. It should atomically reconcile source-Issue state, terminal labels, parent reporting, successor disposition, remediation state, and final closeout evidence.

The broader administrative lane owns:

- failed or partial post-merge closeout;
- closeout exceptions and housekeeping remediation;
- non-merge completion, cancellation, duplicate, not-planned, and supersession dispositions;
- stale or contradictory state detected before or after merge;
- clarification and evidence gaps that prevent deterministic closeout;
- final administrative closure after required execution, validation, review, approval, and closeout evidence is complete.

A successful closeout transaction must not be duplicated. Exceptions must be bounded, idempotent, evidence-backed, and resolved without changing technical objectives.

### Non-blocking rule

Administrative reconciliation is non-blocking by default. Reporting lag, dashboard lag, optional comments, cosmetic label order, and non-critical housekeeping debt do not stop authorized execution.

The administrative lane may block only the affected lane or transition when a required source-Issue, authority, dependency, validation, review, approval, closeout, collision, production, or safety invariant is missing, contradictory, or failed.

Independent approved lanes continue unless they share the failed invariant or mutation collision set.

### Stable contract

Allowed and prohibited mutation classes, trigger classes, blocking rules, evidence requirements, clarification boundaries, idempotency, and exception lifecycle are defined in `docs/reference/operations/administrative-control-lane-contract.md`.

## Mutually exclusive recovery paths

Emergency recovery is **not** Model A and **not** Model B.

| Path | Trigger | Delivery model metadata | Primary goal |
| --- | --- | --- | --- |
| **Emergency recovery** | Production unavailable, unsafe, data at risk, or materially degraded requiring immediate stabilization | `emergency-recovery` | Restore safe service first |
| **Expedited Model A** | Bounded defect with known cause; slower but usable system; one PR can restore behavior | `A` with expedited handling | Fast complete fix through normal production PR |
| **Planned Model B** | Structural degradation requiring redesign, multi-component coordination, or multi-step activation | `B-child` / `B-promotion` | Coordinated release-unit construction |

A single incident uses one primary path. Switching paths requires Chat or Bill disposition recorded on the source issue.

## Degraded-service routing table

Use this table when production is impaired but the incident is not yet classified as full emergency recovery.

| Symptom class | User impact | Data risk | Known cause | Route | Approval |
| --- | --- | --- | --- | --- | --- |
| Site down / white screen | Total | Any | Any | **Emergency recovery** | Chat or Bill |
| Core auth or admin broken | High | High | Any | **Emergency recovery** | Chat or Bill |
| Single feature broken | Medium | Low | Yes, one bounded fix | **Expedited Model A** | Chat or Bill |
| Performance materially degraded | Medium–High | Low | Yes, isolated config/deploy | **Expedited Model A** | Chat or Bill |
| Performance degraded, structural | Medium–High | Low | No — needs redesign | **Planned Model B** | Chat design + normal Model B launch |
| Multi-component regression | High | Medium | No — spans release unit | **Planned Model B** or **Emergency recovery** if unsafe | Chat or Bill |
| Cosmetic / docs-only defect | Low | None | Yes | Routine Model A or routine ops | Normal delivery path |
| Security active exploit | Any | High | Any | **Emergency recovery** first | Chat or Bill |

When uncertain between emergency recovery and expedited Model A, prefer **emergency recovery** until Chat or Bill confirms a bounded one-PR fix is safe.

## Emergency recovery policy

Emergency recovery is stabilization-first and independent from Model A and Model B construction flows.

### Response order

1. Confirm impact and severity.
2. Pause conflicting promotions and auto-integration.
3. Roll back to last known good when possible.
4. Apply the smallest safe recovery change when rollback alone is insufficient.
5. Obtain Chat or Bill approval before production-affecting recovery actions.
6. Run targeted recovery verification.
7. Restore service to a safe bounded state.
8. Create mandatory follow-up work for root cause, hardening, and deferred documentation migration.

### Emergency metadata

| Field | Value |
| --- | --- |
| Delivery model | `emergency-recovery` |
| Change mode | `emergency` |
| Target environment | `recovery` |
| Approval profile | `emergency-approval` |
| Gate profile | `emergency-recovery` |
| Rollback profile | `emergency-stabilization` |
| Component branch | `not-applicable` |
| Component master | `not-applicable` |

### Stabilization-first rules

- Restore safe service before root-cause analysis or documentation migration.
- DIATAXIS migration on touched legacy documents may defer through a mandatory follow-up issue — stabilization takes precedence.
- Emergency PRs still use one intent label and record rollback plan in the PR body.
- Cursor does not self-approve emergency recovery PRs.
- After stabilization, open normal follow-up work (`change-ops` or scoped fix) for RCA and hardening.

## Component-branch synchronization and recovery

### Synchronization rules

Before a Model B promotion PR opens:

- Rebase or merge current `main` into `component/<release-unit>`.
- Resolve conflicts in favor of the integrated release candidate unless Chat directs otherwise.
- Re-run integrated release-candidate tests after synchronization.
- Record the synchronized `main` SHA on the promotion issue.

During active component construction:

- Child branches should track the component branch base, not `main` directly.
- When `main` receives urgent fixes, Chat decides whether to synchronize into the component branch before the next child integrates.

### Red/green component state

Component integration health is recorded through GitHub checks or branch status — not PR-body lifecycle prose.

| State | Meaning | Successor child behavior |
| --- | --- | --- |
| **Green** | Latest integrated child passed required technical checks; component branch is integrable | Next eligible child may proceed |
| **Red** | Failed integration checks, broken build, or unresolved protected-change hold | Auto-integration blocked; successors halt until green restored |
| **Hold** | Chat or Bill explicit hold on component integration | No auto-integration; Cursor stops at hold boundary |

Rules:

- A red component state blocks subsequent auto-integration until Cursor restores green with Chat verification.
- A failed child PR does not advance the component program queue.
- Component red state does not authorize emergency recovery by itself — classify production impact separately.

### Component recovery

When a child merge breaks the component branch:

1. Identify the failing child PR and integration checks.
2. Halt successor child dispatch.
3. Cursor remediates on a fix branch targeting the component branch.
4. Re-run integrated tests after fix merges.
5. Chat confirms green state before queue resumes.

Component recovery is **not** production rollback unless the defect already reached `main` through an erroneous promotion.

## Day-to-day operations boundary

Routine upkeep, monitoring cadence, administrative reconciliation, clarification handling, closeout housekeeping, deploy logging, and operator onboarding procedures remain under `docs/ops/**` execution surfaces. This governance document owns policy boundaries for the administrative control lane, degradation routing, emergency independence, and component health — not step-by-step daily checklists.

## Canonical references

| Topic | Owner |
| --- | --- |
| Administrative control lane contract | `docs/reference/operations/administrative-control-lane-contract.md` |
| Queue watch and administrative dispatch procedure | `docs/ops/pmo/queue-watch-and-dispatch-protocol.md` |
| Post-merge closeout and exception procedure | `docs/ops/pmo/github-issue-closeout-protocol.md` |
| Delivery and release models | `docs/governance/DELIVERY-AND-RELEASE.md` |
| Rollback profiles and evidence | `docs/reference/delivery/delivery-and-rollback-profiles.md` |
| Emergency recovery procedure | `docs/how-to/ops/run-emergency-recovery.md` |
| PMO emergency exit from sizing tree | `docs/governance/PMO-PORTFOLIO.md` |
| Delivery metadata contract | `docs/reference/ci/delivery-profile-contract.md` |

## Supersession

`docs/ops/OPERATING_MANUAL.md` is superseded for delivery procedures, deployment rollback policy, incident severity routing, emergency response authority, administrative control-lane policy, and closeout-exception ownership. Retained operational detail in that file remains non-authoritative execution context until archived in a later disposition pass.
