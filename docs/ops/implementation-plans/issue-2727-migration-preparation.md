---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled Implementation Plan
Owns: Read-only live inventory, quarantine map, and pre-migration preparation evidence for Issue #2727 under Project #2702
Does Not Own: Live label mutation, Product Authority priority/stage decisions, merge approval, or Production authorization
Canonical Reference: /docs/ops/implementation-plans/issue-2724-queue-label-migration-plan.md
Related Issues: #2702, #2724, #2725, #2726, #2727
Last Reviewed: 2026-07-22
---

# #2727 Migration Preparation (Read-Only)

## Purpose

Prepare the reversible live-label migration that restores PMO Dashboard Active and Pipeline population after lifecycle-aware validation.

## Procedure

1. Capture a read-only inventory of open `pmo:active` and `pmo:pipeline` portfolio parents.
2. Mark missing required labels without inventing priority or stage values.
3. Quarantine every ambiguous Engineering priority mapping from legacy `pmo:priority:*` on Pipeline parents.
4. Keep live mutation gated until #2725/#2726 are integration-ready and Product Authority authorizes execution.

## Current inventory summary

See `docs/ops/implementation-plans/issue-2727-live-queue-label-inventory.json`.

At capture time:

- Active parents: 8 open non-task issues; 0 fully ready; all missing `team:pmo` while retaining existing `pmo:priority:*`.
- Pipeline parents: 35 open non-task issues; 0 fully ready; nearly all retain legacy `pmo:priority:*` and lack `team:engineering` / `eng:priority:*`.

## Proposed safe batch (still requires Product Authority Go)

Active parents that are missing only `team:pmo` and already carry exactly one valid `pmo:priority:1-4` are `autoTeamOnlyCandidate` records. Adding `team:pmo` does not invent priority.

## Quarantine requiring Product Authority decision

Pipeline parents with legacy `pmo:priority:*` must not receive automatic `eng:priority:*` transfer. Each needs an explicit mapping or exclusion decision before live mutation.

## Live mutation gate

Blocked until:

1. #2725 dashboard contract remediations are terminal/verified.
2. #2726 routing/wiring is independently reviewed and complete.
3. Product Authority authorizes the live execution checkpoint.
4. Pre-migration snapshot + rollback operations are captured under the #2724 procedure.

## Rollback

No live changes were made by this preparation artifact. Rollback for future mutation batches remains the exact reverse label operations from the #2724 plan snapshot.
