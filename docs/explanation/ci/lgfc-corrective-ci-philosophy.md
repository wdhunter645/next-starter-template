---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Controlled
Owns: Corrective CI philosophy, branch-quality automation model, deterministic auto-remediation strategy
Does Not Own: Specific workflow implementation
Canonical Reference: /docs/explanation/ci/lgfc-ci-production-design.md
Related Issues: #1058
Last Reviewed: 2026-05-21
---

# LGFC Corrective CI Philosophy

## Purpose

This document defines the corrective CI philosophy for the LGFC repository.

The repository intentionally shifts many deterministic governance corrections away from punitive merge blocking and into branch-quality automation.

## Historical Problem

The previous CI model often detected problems only during merge gating.

This created:

- repeated rework
- unnecessary reruns
- noisy governance failures
- avoidable reviewer churn
- AI-agent instability
- wasted implementation cycles

Many detected failures were deterministic and automatically correctable.

Examples:

- missing documentation headers
- malformed PR issue lines
- metadata normalization
- label normalization
- Diataxis placement formatting

Blocking merge approval for deterministic formatting defects created unnecessary operational friction.

## Corrective CI Principle

If a defect can be corrected deterministically and safely, the repository should correct it automatically or return immediate correction guidance before merge gating begins.

The repository should reserve punitive merge blocking for catastrophic or deterministic production-risk conditions.

## Corrective CI Responsibilities

Corrective CI should:

- normalize metadata
- normalize documentation structure
- normalize PR body formatting
- apply deterministic corrections
- provide branch-quality guidance
- reduce governance noise
- improve AI-agent consistency

Corrective CI should not:

- silently alter implementation behavior
- modify runtime code without explicit governance
- bypass protected-file review requirements
- mutate production-sensitive configuration automatically

## Auto-Fix Scope

Safe deterministic auto-fixes include:

- docs header insertion
- markdown metadata normalization
- PR body normalization
- issue-line normalization
- label normalization
- deterministic Diataxis formatting corrections

## Escalation Behavior

When corrective CI cannot determine the correct remediation safely:

- CI should comment
- CI should classify the issue
- CI should route back to the implementation agent
- CI should avoid silent assumptions

## Relationship to Merge Protection

Corrective CI is intentionally separate from merge protection.

Merge protection answers:

> Is this safe to merge?

Corrective CI answers:

> Can this branch be improved automatically before merge review?

## Relationship to Post-Merge Validation

Corrective CI operates before merge review.

Post-merge validation operates after merged reality exists.

Together they create:

- lower governance noise
- fewer false failures
- cleaner PR branches
- stronger post-merge evidence
- improved operational maintainability

## Final Outcome

The corrective CI model improves repository quality while reducing unnecessary merge friction.

The repository gains:

- cleaner branches
- faster review cycles
- reduced rerun churn
- improved AI-agent implementation stability
- stronger governance clarity
- lower operational overhead
