# CI Reviewer Gate Redesign — Architecture Draft

## Status
Draft architecture assessment for Issue #1058.

## Core Principle
Reviewer systems exist to improve merge confidence and governance visibility. Reviewer systems must not create circular remediation deadlocks or block governance repair work.

## Root Causes Identified

### Circular remediation deadlocks
Governance remediation PRs became blocked by the same reviewer/accounting systems they were attempting to repair.

### Workflow responsibility overlap
Review accounting, PR accounting, governance enforcement, and merge-readiness workflows developed overlapping responsibilities.

### Conversational enforcement
Some workflows effectively enforced conversational rituals instead of merge safety.

## Final Tier Model

### Tier 1 — Hard Blocking
Hard blockers limited to:
- required approvals missing
- unresolved required security reviews
- unresolved protected review threads
- explicit branch protection violations

Hard blockers must:
- use GitHub-native review state
- avoid PR-body parsing
- avoid stylistic enforcement
- produce deterministic diagnostics

### Tier 2 — Governance Enforcement
Conditional blocking only when governance integrity is compromised:
- missing source issue mapping
- allowlist violations
- unsafe operational mutations

### Tier 3 — Advisory / Warning
Advisory-only workflows:
- reviewer reminders
- stale review nudges
- governance suggestions
- checklist guidance
- response visibility

These must not block merge.

## Workflow Separation

### GATE — Merge Safety
Filename:
- gate-merge-safety.yml

Responsibilities:
- required approvals
- required review threads
- merge safety
- protected review enforcement

### OPS — Reviewer Advisory
Filename:
- ops-reviewer-advisory.yml

Responsibilities:
- stale review reporting
- reviewer visibility
- governance reminders
- operational summaries

Non-blocking.

### GOV — PR Accounting
Filename:
- gov-pr-accounting.yml

Responsibilities:
- source issue normalization
- intent mapping
- allowlist governance

## Remediation Rule
PRs labeled:
- governance
- ci
- remediation
- hotfix-governance

must automatically downgrade reviewer advisory workflows to warning-only.

## Protected File Scope
Hard reviewer enforcement applies primarily to:
- .github/workflows/**
- scripts/ci/**
- deployment/security-sensitive configuration

Website/UI/docs work defaults advisory-first.

## Strategic Goal
Target state:
- deterministic governance
- low-friction contributor flow
- minimal false positives
- remediation-safe governance
- AI-agent-safe orchestration
- reduced workflow sprawl

## Remaining Required Work
Before implementation merge:
1. Full workflow inventory
2. Existing reviewer workflow audit
3. Consolidation matrix
4. Branch protection compatibility review
5. Workflow retirement list
6. Rollback strategy
7. Documentation reconciliation
8. Operational runbooks
