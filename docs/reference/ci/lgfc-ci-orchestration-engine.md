---
Doc Type: Reference
Audience: Human + AI
Authority Level: Historical
Status: Retired
Owns: Historical record of the #1075 dedicated CI phase engine
Does Not Own: Current workflow behavior, CI strategy, issue generation, or branch protection
Canonical Reference: /docs/governance/PR_PROCESS.md
Related Issues: #1075, #2469
Last Reviewed: 2026-07-12
---

# Retired LGFC CI Orchestration Engine

## Purpose

Preserve an auditable record of the dedicated scheduled CI phase engine created under #1075.

## Scope

This reference covers the retired engine, its fixed state model, and its historical outputs. It does not define current workflow behavior, issue generation, queue authority, or branch protection.

## Current known truth

Issue #2469 removes the engine workflow, JSON state, implementation script, fixed task decomposition assets, and dedicated tests. The retired system cannot generate `lgfc-ci-phase:*` issues, create #1089-style remediation, or influence current CI queue decisions.

## Intended final state

This file remains historical context only. The retired engine must not be restored without a new authorized design and issue.

Current CI authority is maintained in:

- `/docs/governance/PR_PROCESS.md`
- `/docs/reference/ci/pr-process-current-state.md`
- `/docs/reference/ci/merge-protection-surface.md`
- `/docs/reference/ci/pr-workflow-ci-inventory.md`
