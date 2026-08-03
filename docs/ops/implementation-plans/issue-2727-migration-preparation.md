---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled Implementation Plan
Owns: Live inventory, quarantine map, pre-migration snapshot, and executed migration evidence for Issue #2727 under Project #2702
Does Not Own: Merge approval or Production authorization beyond Product Authority Go recorded on #2727
Canonical Reference: /docs/ops/implementation-plans/issue-2724-queue-label-migration-plan.md
Related Issues: #2702, #2724, #2725, #2726, #2727
Last Reviewed: 2026-07-22
---

# #2727 Migration Preparation and Execution Evidence

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

Pipeline parents with non-contract legacy priorities (`pmo:priority:5+`) or missing stage remain quarantined. Contract priorities `{1,2,3,4,idea}` received matching `eng:priority:*` only after Product Authority Go on the reopened #2727 remediation.

## Live mutation gate — cleared

Cleared by Bill/ChatGPT reopen of #2727/#2702 with Cursor ownership to complete PMO Dashboard remediation after incorrect closeout.

## Execution result (2026-07-22)

Artifacts:

- `docs/ops/implementation-plans/issue-2727-pre-migration-snapshot.json`
- `docs/ops/implementation-plans/issue-2727-migration-execution-log.json`

Batches applied:

1. Registry labels created (`team:*`, `ops:*`, `eng:priority:*`).
2. Active auto-team: 8 Issues received `team:pmo`.
3. Pipeline matching-priority: 15 Issues received `team:engineering` + matching `eng:priority:*`; legacy `pmo:priority:*` removed.
4. Quarantine retained: 20 Pipeline Issues (non-contract priorities or missing stage).

Local live generate/validate after mutation:

- Active Programs: 4 (PROJECT/PROGRAM portfolio titles with `team:pmo`)
- PMO Pipeline: 15
- Incomplete retains OPS:/TASK: Active titles (unsupported portfolio prefixes) and quarantined Pipeline rows by design

## Rollback

Reverse each `applied` entry in `issue-2727-migration-execution-log.json`: remove labels in `add[]` and restore labels in `remove[]` / `before`.
