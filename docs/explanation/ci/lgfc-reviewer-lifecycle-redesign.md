---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Controlled
Owns: Reviewer lifecycle redesign rationale and conceptual model
Does Not Own: Canonical PR-process policy or specific workflow implementation
Canonical Reference: /docs/governance/PR_PROCESS.md
Related issues: #2175, #2179, #2208
Last Reviewed: 2026-07-04
---

# LGFC Reviewer Lifecycle Redesign

This explanation supports `/docs/governance/PR_PROCESS.md`. It explains why reviewer lifecycle state must move out of the PR body and into GitHub-native review/thread state.

## Purpose

The previous reviewer gate model attempted to enforce asynchronous reviewer behavior synchronously during merge approval. That created brittle logic, false-positive failures, rerun instability, and PR deadlocks.

The redesigned model preserves governance accountability while moving reviewer intelligence to the correct lifecycle domain.

## Root architectural defect

The retired reviewer-response model assumed:

- reviewer artifacts appear immediately;
- reviewer systems behave synchronously;
- every head SHA change requires a fresh reviewer artifact;
- PR-body response/disposition ledgers are reliable lifecycle authority;
- reruns invalidate prior valid review state.

These assumptions are operationally incorrect.

Reviewer systems such as Copilot, Gemini, Cubic, Cursor, and future AI reviewers operate asynchronously.

The repository therefore experienced:

- timing races;
- stale reviewer-state invalidation;
- false failures after unrelated reruns;
- deadlocks during active review processing;
- PR approval instability.

## Correct governance principle

The repository should not require a new reviewer artifact simply because a SHA changed.

The repository should require renewed review only when meaningful reviewed-state changed.

Examples of meaningful reviewed-state change:

- protected files changed after review;
- reviewed lines materially changed;
- unresolved reviewer findings remain;
- requested changes remain unresolved;
- implementation scope expanded materially.

Examples of non-meaningful reviewed-state change:

- rerunning CI after flaky checks;
- rerunning after label timing failures;
- metadata-only changes;
- resolved reviewer comments with no new review findings.

## Final lifecycle placement

### Pre-merge reviewer enforcement

Pre-merge reviewer checks must use GitHub-native reviews and review threads as the authoritative source.

The PR body must not be used for:

- review-comment ID ledgers;
- thread-state ledgers;
- reviewer response rituals;
- `READY FOR MERGE` state.

Potential blocking conditions, once intentionally promoted, may include:

- latest human `CHANGES_REQUESTED` review remains active;
- unresolved non-outdated human review threads remain;
- required protected-file review evidence is absent;
- GitHub API state is incomplete and enforcement is enabled.

Bot and external tool findings remain advisory unless explicitly promoted by governance decision.

### Post-merge reviewer intelligence

Much reviewer governance belongs post-merge.

Post-merge reviewer validation should:

- audit reviewer outcomes;
- compare merged behavior to reviewer findings;
- verify remediation completeness;
- detect omitted reviewer implementations;
- create remediation issues or PRs when required.

This creates a fact-driven governance model rather than a timing-driven model.

## Reviewer-state persistence

The redesigned system should support reviewer-state persistence.

A valid reviewer state should remain valid unless meaningful reviewed-state changes invalidate it.

The system may track:

- reviewer timestamp;
- reviewed file scope;
- reviewed diff scope;
- protected-file state;
- unresolved reviewer findings;
- implementation deltas after review.

Such tracking belongs in generated artifacts or GitHub-native state, not in mutable PR-body ledgers.

## Rerun awareness

The redesigned system must understand rerun context.

If a rerun occurs for unrelated reasons:

- reviewer validity should remain intact;
- review artifacts should not be invalidated automatically;
- reviewer deadlocks should not occur.

## Final governance outcome

The redesigned reviewer lifecycle model preserves governance discipline while eliminating brittle timing dependencies.

The repository gains:

- stable rerun behavior;
- reduced PR deadlocks;
- asynchronous reviewer compatibility;
- better AI-agent usability;
- evidence-driven reviewer audits;
- stronger post-merge accountability.

## Current known truth

During #2175 / #2208 rebuild, reviewer-response enforcement is not final. The final implementation must be rebuilt advisory-first, validated, and only then considered for required-check promotion.
