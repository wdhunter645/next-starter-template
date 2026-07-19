---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Controlled
Owns: Conceptual explanation of the four-lane topology, four promotion profiles, and progressive control model
Does Not Own: Role assignments, executable gate configuration, incident severity, or production authorization
Canonical Reference: /docs/reference/operations/operating-lanes-and-promotion-profiles.md
Related Issues: #2640, #2641, #2639
Last Reviewed: 2026-07-19
---

# Four-Lane, Four-Profile Operating Model

## Purpose

LGFC separates **who owns work** from **how close that work is to production**.

- **Lanes** define ownership and communication.
- **Profiles** define control intensity and promotion state.

This prevents production-grade process from slowing early exploration while preserving a mandatory, progressively stricter path to public production use.

## Operating topology

Three operating lanes run horizontally:

1. **PMO / Engineering** — intake, requirements, design, decomposition, prioritization, optional proof-of-concept work, and implementation Go.
2. **Implementation / Operations** — Development and Promotion Candidate execution, testing, remediation, integration, promotion preparation, and deployment execution.
3. **Day-2 Operations** — live monitoring, incident assessment, containment, remediation, recovery, and operational hold management.

A fourth lane runs vertically across all three:

4. **Administration & Communications** — evidence, routing, issue and PR state, labels, acknowledgments, escalation, hold/resume, reporting, and closeout.

```text
                    Administration & Communications
                    evidence | routing | runner | state
                         |             |             |
                         v             v             v
PMO / Engineering -> Implementation / Operations -> Day-2 Operations
```

Administration & Communications carries information and authorized state transitions. It does not replace the decision authority of a horizontal lane.

## Promotion profiles

### 1. Sandbox

Sandbox is an optional PMO / Engineering proof-of-concept environment.

It exists to test uncertain assumptions, architecture, integrations, or behavior with minimal process overhead. It uses an isolated remote branch, scaled-down safety checks, and no production path.

Sandbox output may be discarded, retained as evidence, or deliberately adopted into Development.

### 2. Development

Development is the main Model B implementation environment.

Work occurs on remote component branches. Automated PR gates validate build quality, tests, security, scope, metadata, and branch eligibility. Eligible non-protected work may integrate automatically into the component branch.

Development is where repository standards are overlaid onto useful Sandbox output and where experimental work becomes maintainable repository implementation.

### 3. Promotion Candidate

Promotion Candidate is the mandatory release barrier between Development and Production.

The integrated solution is subjected to the full release qualification needed for its risk and scope, including applicable:

- integrated and regression testing;
- load and performance testing;
- security validation;
- migration and failure-path testing;
- deployment rehearsal;
- rollback validation;
- operational-readiness review;
- planned-versus-built reconciliation;
- repository-standards reconciliation.

If the solution introduces a valid need to change repository standards, the owning role must review and update those standards before promotion continues.

### 4. Production

Production is the controlled path to `main`, deployment, live verification, and public use.

The full repository standards apply. The exact approved Promotion Candidate must be promoted without unreviewed drift. Production entry requires the applicable manual authority, rollback readiness, deployment controls, and live verification.

## Mandatory progression

```text
Sandbox -> Development -> Promotion Candidate -> Production -> Day-2 Operations
```

The following transitions are prohibited:

```text
Sandbox -X-> Promotion Candidate
Sandbox -X-> Production
Development -X-> Production
```

Sandbox is too unstructured to become a release candidate directly. Development must first apply repository structure and confirmation testing. Promotion Candidate then proves the complete integrated solution before Production.

## Progressive narrowing

The profiles intentionally increase control as production risk increases:

| Profile | Primary goal | Control level |
| --- | --- | --- |
| Sandbox | Learn and prove | Minimal, isolated safety controls |
| Development | Build maintainable implementation | Automated PR quality and integration gates |
| Promotion Candidate | Prove release readiness | Comprehensive validation and standards reconciliation |
| Production | Enter and verify live service | Full repository standards and production authority |

The hurdles do not exist to stop work. They allow work to occur freely inside the correct profile and progressively narrow it into full repository alignment.

## Runner and control-plane placement

The repository runner and routing controller are part of the Administration & Communications control plane. They provide the shared “dial tone” used by horizontal lanes to announce work, route assignments, publish evidence, request decisions, apply holds, and resume work.

The runner does not own the meaning or authority of an event.

```text
Horizontal lane decides
  -> Administration & Communications records and routes
  -> runner/controller transports or executes authorized automation
  -> Administration & Communications confirms the result
```

Runner host maintenance, service availability, patches, security, and recovery remain Day-2 Operations responsibilities.

## Lightweight problem-adjustment loop

Most implementation discoveries should not trigger a heavyweight replan.

```text
PROBLEM FOUND
  -> route to the role that made the controlling decision
  -> GUIDANCE or ADJUSTMENT
  -> Administration & Communications records the decision
  -> RESUME
```

Only material changes to product objective, architecture, acceptance criteria, dependency structure, delivery model, production boundary, or recovery strategy require formal plan revision.

## Day-2 preemption

A material production event may initially pause most work because the current team is small and the impact is unknown.

Once impact, probable cause, containment, affected scope, and resolution ownership are sufficiently understood, the broad assessment hold should narrow. Unaffected resources may resume normal work while the assigned incident team continues remediation and recovery.

This same model scales as additional agents are added: the incident hold follows affected work and resources rather than remaining repository-wide after the problem is bounded.