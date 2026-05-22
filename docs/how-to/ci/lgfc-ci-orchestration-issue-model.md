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
