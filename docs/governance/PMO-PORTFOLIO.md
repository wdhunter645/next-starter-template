---
Doc Type: Governance
Audience: Human + AI
Authority Level: Domain Policy
Owns: PMO intake, work sizing, delivery-model selection, Sandbox authorization, launch authorization, portfolio inventory, and authoritative priority decisions
Does Not Own: Development execution, Promotion Candidate execution, CI implementation, Administration & Communications mutation procedure, Day-2 recovery strategy, or Production approval
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2477, #2487, #2640, #2641, #2695
Last Reviewed: 2026-07-21
---

# PMO Portfolio

## Purpose

This document defines how work enters the portfolio, how it is designed and sized, when an optional Sandbox is used, how a delivery model is selected, and when implementation Go is authorized.

PMO / Engineering owns the decision package. Administration & Communications prepares, routes, records, and reconciles the package but does not make the decision.

## Intake

Every one-off, project, and program enters PMO with:

- stated objective;
- provisional size;
- Product Authority and PMO / Engineering roles;
- initial priority;
- known constraints and dependencies;
- current lane and profile;
- unresolved design assumptions.

Provisional intake is not launch authority.

## Design and planning

Before implementation Go, PMO / Engineering defines:

- requirements and acceptance criteria;
- architecture and design;
- scope and non-goals;
- dependencies and protected stops;
- verification and rollback expectations;
- delivery model;
- whether Sandbox evidence is needed;
- Development work package;
- Promotion Candidate expectations;
- Production and Day-2 boundaries.

## Sandbox authority

Sandbox is an optional PMO / Engineering proof-of-concept profile.

Use Sandbox when factual experimentation can reduce material design uncertainty before Development.

Sandbox requirements:

- isolated remote branch or environment;
- a clear question or assumption to test;
- scaled-down safety checks;
- no Production credentials, writes, bindings, or promotion path;
- explicit result: discard, retain evidence, or adopt into Development.

Sandbox is not implementation Go and cannot promote directly to Promotion Candidate or Production.

When Sandbox output is adopted, PMO / Engineering converts the evidence into a normal Development work package and identifies experimental shortcuts that must be removed, tested, or hardened.

## Size contract

### Small

Small requires all of the following:

- one complete and independently reviewable PR;
- one-step rollback;
- full pre-Production testability;
- no unresolved architecture decision;
- no protected multi-step boundary;
- no harmful incomplete Production state.

### Large

Large is satisfied when any of the following is true:

- multiple deployable components;
- multiple planned Production promotions;
- multiple architectural or data domains requiring independent release units;
- several protected boundaries;
- a platform migration or repository-wide operating-model change.

### Medium

Medium is everything not objectively Small or Large.

## Delivery-model selection

Select Model A only when the complete solution fits one reviewable PR, can become a complete Promotion Candidate before merge, and has one-step rollback.

Any failed condition selects Model B.

Model B is the default for remote component-branch implementation, multiple Development increments, or work needing integrated Promotion Candidate qualification.

No work may use both Model A and Model B for the same release unit.

## Promotion-profile planning

PMO / Engineering records the intended profile path:

```text
optional Sandbox -> Development -> Promotion Candidate -> Production
```

For Model A, the single PR itself becomes the Promotion Candidate before Production merge.

For Model B:

- child tasks execute in Development;
- integrated component state becomes the Promotion Candidate;
- Production is a separate controlled promotion.

Development cannot promote directly to Production.

## Implementation Go

Implementation Go authorizes Development execution against a complete work package. It does not authorize Production promotion.

After Go:

- routine PMO ceremony does not throttle Development;
- independent tasks may proceed while prior tasks are review- or administration-pending;
- PR review pauses the affected task, not the entire project;
- PMO / Engineering remains available for lightweight problem adjustment;
- material plan changes return to PMO / Engineering authority.

## Operations interrupt precedence

Normal repository execution consists primarily of authorized project tasks. A qualifying standalone `OPS:` source Issue is a standing Product Authority interrupt and takes precedence over every project Issue and project task.

A qualifying Operations interrupt is:

- an open, same-repository, non-PR Issue whose title begins `OPS:`;
- a standalone source Issue rather than a child of a project lifecycle;
- bounded by an objective, owner, scope, acceptance criteria, validation, rollback, and stop conditions appropriate to the work; and
- not merely a generated tracker, duplicate, bookkeeping record, advisory alert, or evidence-only record unless Product Authority explicitly elevates it.

When a qualifying `OPS:` Issue appears:

1. no new project task may be dispatched;
2. active project work stops at the nearest safe checkpoint rather than being terminated in a way that corrupts a branch, claim, test, deployment, or evidence state;
3. Administration & Communications preserves the exact project state and records the Operations interrupt hold;
4. the Operations Issue receives the next available PMO / Engineering, Implementation / Operations, PR Approver / Engineering, Deterministic CI, and communication capacity it requires;
5. no additional material-risk test or case-by-case reprioritization decision is required; and
6. project execution resumes only after the Operations Issue is closed, explicitly deferred by Product Authority or Day-2 Operations within its authority, or a recorded `RESUME` releases the interrupt hold.

`OPS:` is a cross-lane queue classification, not a fifth operating lane. The existing PMO / Engineering, Implementation / Operations, Day-2 Operations, and Administration & Communications lanes retain their normal decision and execution authority.

Operations interrupt precedence changes sequencing only. It does not bypass source-Issue scope, promotion profiles, validation, independent review, Production authority, rollback, or protected-stop requirements.

This standing Product Authority rule supersedes lower-level instructions that require a separate risk threshold or new prioritization decision before a qualifying standalone `OPS:` Issue can interrupt project execution.

## Lightweight problem adjustment

When Implementation / Operations reports `PROBLEM FOUND`, PMO / Engineering should first determine whether a bounded adjustment can preserve the approved objective and acceptance criteria.

```text
PROBLEM FOUND
  -> PMO / Engineering reviews evidence
  -> GUIDANCE or ADJUSTMENT
  -> Administration & Communications records
  -> RESUME
```

Use formal `PLAN CHANGE REQUIRED` only when product outcome, architecture, acceptance, dependency structure, delivery model, Production boundary, or release strategy materially changes.

## Emergency exit

Production degradation, outage, unsafe behavior, or material risk exits normal PMO sequencing and routes to Day-2 Operations as an incident. Incident handling is a specialized Operations path within the broader `OPS:` interrupt precedence rule.

A broad assessment hold may pause PMO while incident impact is unknown. Once scope, probable cause, containment, and resolution ownership are sufficiently understood, Day-2 Operations may narrow incident-specific holds, but the standing Operations interrupt remains in effect until the controlling `OPS:` Issue is closed, explicitly deferred, or releases project work through `RESUME`.

## Portfolio rules

- GitHub program and project Issues are the durable portfolio record.
- Product Authority makes final priority decisions and has established qualifying standalone `OPS:` Issues as automatic interrupts over project execution.
- Planning tools outside the repository are inputs only.
- PMO reporting lag is not an execution blocker unless it prevents authority, dependency, safety, validation, approval, profile transition, or closeout from being determined.
- Independent approved projects may proceed in parallel only when no Operations interrupt hold is active.
- The portfolio must represent Sandbox, Development, Promotion Candidate, Production, and Day-2 state independently.

## Administration & Communications interface

Administration & Communications may:

- prepare Go/No-Go and Promotion Candidate evidence packets;
- reconcile PMO labels, parent/child links, lifecycle reporting, and dashboard state to existing authority;
- route decisions, acknowledgments, escalation, holds, resumes, and closeout;
- apply and release the standing Operations interrupt hold when the qualifying Issue state and owning-role decision require it;
- preserve historical evidence and interrupted project state.

It may not originate or change priority, size, delivery model, objective, acceptance, dependency, profile, launch authority, or Production Go. Applying the standing Operations interrupt rule is execution of recorded Product Authority, not an independent priority decision.

## Canonical references

| Topic | Owner |
| --- | --- |
| Lane and promotion-profile definitions | `docs/reference/operations/operating-lanes-and-promotion-profiles.md` |
| Delivery and release policy | `docs/governance/DELIVERY-AND-RELEASE.md` |
| Administration & Communications | `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md` |
| Operations and recovery | `docs/governance/OPERATIONS-AND-RECOVERY.md` |
| Size and delivery-model facts | `docs/reference/pmo/work-size-and-delivery-model-contract.md` |
| Classification procedure | `docs/how-to/pmo/classify-work-and-select-delivery-model.md` |

## Supersession

Lower-level PMO instructions are superseded where they permit administrative reporting, generic predecessor state, or routine per-task PMO review to block independent Development after implementation Go, or where they require additional risk-based elevation before a qualifying standalone `OPS:` Issue interrupts project execution.
