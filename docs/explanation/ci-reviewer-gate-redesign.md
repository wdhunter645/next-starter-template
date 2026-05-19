---
Doc Type: Explanation
Audience: Maintainers, operators, AI agents, CI governance contributors
Authority Level: Canonical Draft
Owns: Reviewer gate redesign architecture and governance direction for Issue #1058
Does Not Own: Final implementation behavior, branch protection settings, workflow runtime logic
Canonical Reference: Issue #1058
Last Reviewed: 2026-05-19
---

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
Responsibilities:
- required approvals
- required review threads
- merge safety
- protected review enforcement

### OPS — Reviewer Advisory
Responsibilities:
- stale review reporting
- reviewer visibility
- governance reminders
- operational summaries

### GOV — PR Accounting
Responsibilities:
- source issue normalization
- intent mapping
- allowlist governance

## Remediation Rule
Governance remediation PRs must automatically downgrade reviewer advisory workflows to warning-only.

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
