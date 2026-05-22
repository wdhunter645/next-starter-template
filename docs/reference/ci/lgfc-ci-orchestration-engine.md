---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: As-built CI orchestration engine behavior, state model, pause contract, generated CI implementation issue schema
Does Not Own: Individual CI redesign phase implementation details, branch protection settings, production runtime behavior
Canonical Reference: /docs/how-to/ci/lgfc-ci-orchestration-issue-model.md
Related Issues: #1075, #1058
Last Reviewed: 2026-05-22
---

# LGFC CI Orchestration Engine

## Purpose

This document records the as-built CI orchestration engine added for the LGFC CI redesign rollout.

The engine turns the approved CI design docs into a controlled, one-issue-at-a-time sequence of Cursor-ready implementation issues.

## Scope

The engine owns:

- CI rollout phase selection.
- Active CI implementation issue detection.
- CI instability pause decisions.
- Remediation issue/comment creation when rollout advancement is unsafe.
- Generated issue body structure for CI implementation tasks.

The engine does not implement the full CI redesign, reviewer gate rebuild, merge protection consolidation, website behavior changes, or Cloudflare runtime changes.

## Current Known Truth

The engine is implemented by:

- `/.github/workflows/ci-orchestration-engine.yml`
- `/.github/ci-orchestration-state.json`
- `/scripts/orchestrator/ci-orchestration-engine.mjs`

The workflow can run on a schedule or by manual dispatch. Manual dispatch supports `dry_run=true` so operators can inspect the decision without creating or updating issues.

## State Model

The durable state model lives in `/.github/ci-orchestration-state.json`.

It defines:

- the primary source issue and related program issue
- canonical CI source-of-truth documents
- required orchestration labels
- monitoring thresholds
- expected workflow names for visibility reporting
- ordered CI implementation phases
- each phase objective, scope, allowed files, forbidden scope, rollback boundary, validation requirements, acceptance criteria, and post-merge verification requirements

## Rollout Order

The engine follows this sequence:

1. PR Hygiene Foundation
2. Merge Protection Consolidation
3. Reviewer Lifecycle Redesign
4. Post-Merge Validation Expansion
5. OPS Runtime Consolidation
6. As-built Documentation Update

Each generated issue includes a stable marker:

```text
<!-- lgfc-ci-phase:<phase-id> -->
```

The marker is the duplicate-prevention key and completion-tracking key.

## Advancement Rules

The engine creates a new phase issue only when all of these are true:

- no open active CI implementation issue exists
- no CI implementation issue is labeled `status:failed`
- the next phase dependencies are complete
- no issue already exists for the next phase marker
- recent CI health does not show blocking instability

If the current phase is still active, the engine pauses. If the phase has been active longer than the configured stale issue threshold, the pause reason becomes stale active issue.

## CI Monitoring Foundation

The engine inspects recent `main` workflow runs and reports:

- repeated workflow failures
- stale queued or in-progress workflow runs
- expected workflows not seen in the recent run window

Repeated failures and stale workflow runs are blocking instability signals. Expected workflows missing from the recent run window are reported as warnings because some workflows may not run on every merge.

## Pause and Remediation Behavior

The engine pauses advancement when:

- a CI implementation issue is active
- a CI implementation issue is failed
- a CI implementation issue is stale
- a duplicate phase issue already exists
- recent workflow runs show blocking instability

For failed issues, stale active issues, or CI instability, the engine creates or updates a remediation issue using this marker:

```text
<!-- lgfc-ci-orchestration-remediation -->
```

The remediation issue records the pause reason, blocking evidence, monitoring warnings, and recovery steps.

## Generated Issue Schema

Every generated CI implementation issue includes:

- objective
- source-of-truth docs
- exact scope
- allowed files
- forbidden scope
- rollback boundary
- validation requirements
- acceptance criteria
- post-merge verification requirements
- orchestration rules

This structure is intentionally suitable for Cursor implementation without requiring the agent to infer scope from the broader CI redesign docs.

## Intended Final State

The final CI rollout has one active implementation issue at a time, advances only after merge and post-merge verification are stable, and records a final as-built documentation issue after all implementation phases complete.
