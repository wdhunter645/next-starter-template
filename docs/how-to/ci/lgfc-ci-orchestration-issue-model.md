---
Doc Type: How-To
Audience: Human + AI
Authority Level: Controlled
Owns: CI implementation issue orchestration model
Does Not Own: Workflow implementation logic
Canonical Reference: /docs/how-to/ci/lgfc-ci-implementation-plan.md
Related Issues: #1058
Last Reviewed: 2026-05-21
---

# LGFC CI Orchestration Issue Model

## Purpose

This document defines how orchestration workflows should create and manage CI redesign implementation issues.

## One-Issue Execution Rule

Only one CI implementation issue should be active at a time.

This reduces:

- merge conflicts
- workflow overlap
- governance drift
- rollback complexity
- branch protection instability

## Execution

The orchestration layer should follow this execution sequence:

1. Validate that no other CI implementation issue is active.
2. Create one implementation issue for the next dependency phase.
3. Include exact workflow scope and allowed files.
4. Assign the implementation issue to Cursor.
5. Wait for the implementation PR to complete merge protection successfully.
6. Validate post-merge stability.
7. Create the next implementation issue only after verification succeeds.

The orchestration layer must pause advancement automatically when:

- CI instability exists
- rollback is required
- remediation work remains open
- branch protection becomes unstable

## Required Issue Structure

Each implementation issue should contain:

- objective
- workflow scope
- allowed files
- rollback plan
- acceptance criteria
- CI impact statement
- validation requirements
- post-merge verification requirements

## Required Lifecycle

1. issue created
2. issue assigned to Cursor
3. implementation PR created
4. CI validated
5. PR merged
6. post-merge verification completed
7. orchestration creates next issue

## Failure Handling

If a phase fails:

- orchestration pauses advancement
- remediation issue may be created
- rollback recommendation may be generated
- next implementation issue must not be created until stability returns

## As-Built Engine

The active engine is:

- workflow: `/.github/workflows/ci-orchestration-engine.yml`
- state model: `/.github/ci-orchestration-state.json`
- script: `/scripts/orchestrator/ci-orchestration-engine.mjs`
- reference: `/docs/reference/ci/lgfc-ci-orchestration-engine.md`

The engine creates or updates only one CI implementation issue at a time. It pauses when an active or failed CI implementation issue exists, when phase dependencies are incomplete, when a duplicate phase marker exists, or when recent workflow runs show blocking CI instability.

## Implementation Categories

### Category A — Merge Protection

Examples:
- deterministic gate consolidation
- branch protection simplification
- catastrophic blocker isolation

### Category B — PR Hygiene

Examples:
- docs auto-fix
- metadata normalization
- Diataxis correction

### Category C — Post-Merge Validation

Examples:
- reviewer audit
- design audit
- implementation verification
- remediation issue generation

### Category D — OPS Runtime

Examples:
- deployment verification
- smoke testing
- runtime health
- retry/recovery automation
