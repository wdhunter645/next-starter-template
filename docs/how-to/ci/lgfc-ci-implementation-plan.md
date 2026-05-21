---
Doc Type: How-To
Audience: Human + AI
Authority Level: Controlled
Owns: CI migration implementation sequencing, orchestration task decomposition, Cursor execution phases
Does Not Own: Final workflow implementation
Canonical Reference: /docs/explanation/ci/lgfc-ci-production-design.md
Related Issues: #1058
Last Reviewed: 2026-05-21
---

# LGFC CI Implementation Plan

## Purpose

This document defines the implementation rollout plan for the LGFC CI redesign.

The rollout is intentionally decomposed into isolated implementation tasks so repository orchestration workflows can create one implementation issue at a time for Cursor execution.

## Implementation Strategy

The repository must not attempt a large CI rewrite in one PR.

Each implementation step should:

- have isolated rollback boundaries
- contain one logical workflow concern
- include deterministic acceptance criteria
- avoid simultaneous governance and runtime changes
- preserve branch protection stability

## Orchestration Model

The orchestration layer should create exactly one active implementation issue at a time.

When one issue closes successfully:

1. orchestration validates merge success
2. orchestration validates CI stability
3. orchestration creates the next issue automatically
4. the next issue is assigned to Cursor

## Recommended Implementation Sequence

### Phase 1 — Inventory and Documentation

Status: current PR

Goals:
- establish final CI architecture
- define lifecycle domains
- define workflow classifications
- define rebuild and retirement targets

### Phase 2 — PR Hygiene Foundation

Goals:
- add PR metadata normalization
- add deterministic docs auto-fix capability
- add Diataxis correction support
- reduce noisy governance failures

### Phase 3 — Merge Protection Consolidation

Goals:
- consolidate deterministic merge gates
- reduce overlapping workflows
- isolate catastrophic blockers
- simplify branch protection configuration

### Phase 4 — Reviewer Gate Redesign

Goals:
- remove brittle reviewer lifecycle enforcement
- move reviewer intelligence post-merge
- preserve protected review enforcement
- support asynchronous reviewers safely

### Phase 5 — Post-Merge Validation

Goals:
- implement implementation-verification workflows
- implement design-audit workflows
- implement remediation issue generation
- implement architectural drift analysis

### Phase 6 — OPS Runtime Suite

Goals:
- consolidate operational monitoring
- improve Cloudflare validation
- improve D1/B2 operational health checks
- implement self-healing retry logic
- preserve rollback evidence

## Cursor Issue Model

Each implementation issue should contain:

- exact workflow scope
- allowed files
- rollback plan
- acceptance criteria
- CI impact statement
- post-merge verification expectations

## Success Criteria

The final CI design succeeds when:

- pre-merge gates are deterministic
- false failures are minimized
- reviewer timing deadlocks are eliminated
- post-merge validation becomes evidence-driven
- operational monitoring becomes proactive
- repository maintenance burden decreases
- AI implementation workflows remain stable
