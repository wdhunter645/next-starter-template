---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Controlled
Owns: Reviewer lifecycle redesign philosophy, async reviewer governance model, reviewer gate lifecycle placement
Does Not Own: Specific workflow implementation
Canonical Reference: /docs/explanation/ci/lgfc-ci-production-design.md
Related Issues: #1196, #1058
Last Reviewed: 2026-05-21
---

# LGFC Reviewer Lifecycle Redesign

## Purpose

This document explains the redesign direction for reviewer governance in the LGFC repository.

The previous reviewer gate model attempted to enforce asynchronous reviewer behavior synchronously during merge approval. This created brittle logic, false-positive failures, rerun instability, and PR deadlocks.

The redesigned model preserves governance accountability while moving reviewer intelligence to the correct lifecycle domain.

## Root Architectural Defect

The previous reviewer-response-completion gate assumed:

- reviewer artifacts appear immediately
- reviewer systems behave synchronously
- every head SHA change requires a fresh reviewer artifact
- reruns invalidate prior valid review state

These assumptions are operationally incorrect.

Reviewer systems such as Copilot, Gemini, Cubic, and future AI reviewers operate asynchronously.

The repository therefore experienced:

- timing races
- stale reviewer-state invalidation
- false failures after unrelated reruns
- deadlocks during active review processing
- PR approval instability

## Correct Governance Principle

The repository should not require a new reviewer artifact simply because a SHA changed.

The repository should require renewed review only when meaningful reviewed-state changed.

Examples of meaningful reviewed-state change:

- protected files changed after review
- reviewed lines materially changed
- unresolved reviewer findings remain
- requested changes remain unresolved
- implementation scope expanded materially

Examples of non-meaningful reviewed-state change:

- rerunning CI after flaky checks
- rerunning after label timing failures
- metadata-only changes
- resolved reviewer comments with no new review findings

## Final Lifecycle Placement

### Pre-Merge Reviewer Enforcement

Pre-merge reviewer enforcement should remain intentionally narrow.

Only catastrophic reviewer conditions should block merge approval.

Examples:

- unresolved required protected-review findings
- missing mandatory protected-file review
- unresolved security review requirement

Reviewer timing itself must never block merge approval.

## Post-Merge Reviewer Intelligence

The majority of reviewer governance belongs post-merge.

Post-merge reviewer validation should:

- audit reviewer outcomes
- compare merged behavior to reviewer findings
- verify remediation completeness
- detect omitted reviewer implementations
- create remediation issues or PRs

This creates a fact-driven governance model rather than a timing-driven model.

## Reviewer-State Persistence

The redesigned system should support reviewer-state persistence.

A valid reviewer state should remain valid unless meaningful reviewed-state changes invalidate it.

The system should track:

- reviewer timestamp
- reviewed file scope
- reviewed diff scope
- protected-file state
- unresolved reviewer findings
- implementation deltas after review

## Rerun Awareness

The redesigned system must understand rerun context.

If a rerun occurs for unrelated reasons:

- reviewer validity should remain intact
- review artifacts should not be invalidated automatically
- reviewer deadlocks should not occur

## Final Governance Outcome

The redesigned reviewer lifecycle model preserves governance discipline while eliminating brittle timing dependencies.

The repository gains:

- stable rerun behavior
- reduced PR deadlocks
- asynchronous reviewer compatibility
- better AI-agent usability
- evidence-driven reviewer audits
- stronger post-merge accountability

## Current Known Truth

Task 003 implementation issue #1196 establishes the redesigned surface documented
in `docs/reference/ci/reviewer-lifecycle-surface.md`.

The current model uses:

- `.github/workflows/reviewer-response-completion.yml`
- `.github/workflows/post-merge-intent-verification.yml`
- `scripts/ci/reviewer_lifecycle_gate.mjs`
- `scripts/ci/reviewer-gate-simulation.mjs`
- `scripts/ci/post_merge_reviewer_audit.mjs`

Pre-merge blocking is limited to protected CI scope with unresolved protected review
threads or missing current-head trusted review artifacts. Reviewer timing, quiet
periods, and PR-body response rituals are not merge blockers outside that scope.

Post-merge validation and reviewer audit remain responsible for late findings and
orchestration pause state.
