---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: CI implementation sequencing dependencies and orchestration ordering
Does Not Own: Workflow implementation details
Canonical Reference: /docs/how-to/ci/lgfc-ci-implementation-plan.md
Related Issues: #1058
Last Reviewed: 2026-05-21
---

# LGFC CI Implementation Dependency Matrix

## Purpose

This document defines the dependency ordering for the LGFC CI redesign rollout.

The repository must implement CI evolution in a controlled sequence to avoid branch-protection instability, merge deadlocks, workflow overlap, and operational regression.

## Dependency Rules

A workflow domain may not advance until:

- prerequisite workflows are stable
- prerequisite branch protections are validated
- rollback boundaries are defined
- prior implementation issues are merged and verified

## Implementation Dependency Matrix

| Phase | Domain | Depends On | Blocking Risks | Validation Requirement |
|---|---|---|---|---|
| 1 | Architecture Documentation | None | Incorrect governance assumptions | Documentation review |
| 2 | PR Hygiene Foundation | Phase 1 | Metadata normalization drift | PR metadata validation |
| 3 | Merge Protection Consolidation | Phase 2 | Branch protection instability | Deterministic gate validation |
| 4 | Reviewer Lifecycle Redesign | Phase 3 | Reviewer deadlocks | Reviewer rerun validation |
| 5 | Post-Merge Validation | Phase 4 | False remediation generation | Post-merge audit verification |
| 6 | OPS Runtime Consolidation | Phase 5 | Operational regression | Runtime smoke testing |

## Required Ordering Constraints

### Constraint A — PR Hygiene Before Merge Consolidation

The repository should improve branch-quality correction before consolidating merge protection.

Reason:

- lower governance noise
- cleaner PR metadata
- fewer false-positive failures
- more stable merge-gate testing

### Constraint B — Merge Protection Before Reviewer Redesign

Deterministic merge safety must stabilize before reviewer lifecycle redesign begins.

Reason:

- reviewer redesign depends on stable rerun behavior
- branch protection must remain predictable
- catastrophic blockers must remain isolated

### Constraint C — Reviewer Redesign Before Post-Merge Expansion

Post-merge reviewer intelligence depends on redesigned reviewer-state behavior.

Reason:

- reviewer audits require stable reviewer-state persistence
- remediation generation depends on valid reviewer evidence

### Constraint D — OPS Runtime Last

OPS runtime consolidation should occur after governance stabilization.

Reason:

- runtime workflows should not evolve while merge governance remains unstable
- operational monitoring depends on stable deployment behavior

## Rollback Requirements

Every implementation phase must:

- isolate one workflow concern
- preserve rollback simplicity
- avoid simultaneous lifecycle-domain changes
- preserve historical audit visibility
- maintain stable branch protection behavior

## Final Outcome

The dependency model ensures:

- stable incremental rollout
- predictable governance evolution
- controlled branch-protection changes
- lower operational regression risk
- safer AI-agent implementation sequencing
