---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Normalized workflow-health event adapters, idempotent ingest, transaction materializer, and informational SLO engine for #2680
Does Not Own: Event inventory contract (#2886), static views/data products (#2888), reconciliation/retention (#2889), Production promotion
Canonical Reference: /scripts/workflow-health/adapters.mjs
Related Issues: #2680, #2887, #2886, #2678, #2677
Last Reviewed: 2026-08-01
---

# Workflow-health adapters, materializer, and SLO engine

## Purpose

Implement work unit #2887 (2680-002): normalize authoritative workflow evidence
into `lgfc-workflow-health-event:v1` envelopes, derive current transaction state,
and compute informational SLO / executable-but-idle metrics. Derived state is a
read-only view. It never creates authority, approves work, or merges to `main`.

## Scope

| Module | Role |
| --- | --- |
| `scripts/workflow-health/envelope.mjs` | Build/validate the #2886 envelope |
| `scripts/workflow-health/adapters.mjs` | Bridge, controller, post-merge, #2678, wake, PR, gap adapters |
| `scripts/workflow-health/ingest.mjs` | Idempotent merge + supersession |
| `scripts/workflow-health/materializer.mjs` | Stage/owner/age/blocker/next-action derivation |
| `scripts/workflow-health/slo.mjs` | Informational SLO + idle-time engine |

Machine-readable modules are canonical where this document and code disagree.

## Current known truth

- The adapter contract and ten-stage inventory live in
  `scripts/workflow-health/event-inventory.mjs` (#2886).
- Adapters consume GitHub-visible emissions and in-memory snapshots. They do not
  vendor `component/deterministic-handoff-controller` or
  `component/cumulative-lane-evidence` code.
- First-release SLOs are **informational** (one watcher interval for pickup
  visibility; optional per-stage age thresholds). Enforcement requires separate
  Product Authority.
- Views (#2888) and scheduled reconciliation (#2889) are out of scope here.

## Ground rules

1. **Idempotent ingestion.** Replaying the same `idempotencyKey` suppresses
   duplicates; history is retained. Duplicate-suppression and supersession
   identity is scoped per `transactionId`, so identical keys on different
   transactions never suppress each other.
2. **Supersession preserves history.** A later event with `supersedes` removes
   the prior key from the *active* set only. Supersession may only target a
   chronologically earlier event in the same transaction; self-references and
   cycles are structurally rejected.
3. **Missing evidence → unknown.** Gap adapters emit
   `phase: unknown` / `evidenceQuality: unknown_evidence_missing`. They never
   emit a healthy pass for an uninstrumented boundary. In
   `adaptEvidenceBundle` gap emission is **opt-in** via `emitGaps: true`;
   reconciliation (#2889) is the intended scheduled caller that forces gap
   visibility, while ad-hoc bundle callers with deterministic alternatives
   are not flooded by default.
4. **Component failures stay distinct.** A degraded controller does not mark
   Bridge or Cursor unhealthy.
5. **No derived authority.** Every public return value sets
   `mutatesExecutionAuthority: false`.
6. **UTC timestamps only.** `occurredAt` and `sloDeadline` must be ISO 8601
   UTC (`Z` / `+00:00`); `lane` must be one of the four contract lanes.
   Evidence without an authoritative source timestamp (for example a
   post-merge artifact missing `completed_at`) is rejected, never backfilled
   with ingestion wall-clock time.

## Adapter coverage

| Source | Entry point | Stages touched |
| --- | --- | --- |
| Wake workflow run | `adaptWakeWorkflowRun` | authority_ready end, delivery start |
| Bridge comments | `adaptBridgeComments` | delivery end, eligibility, execution |
| LOCAL CURSOR RESUME | `adaptLocalCursorResumeComments` | authority_ready / remediation start |
| Controller snapshots | `adaptControllerSnapshots` | mapped via `CONTROLLER_KIND_MAP` |
| Post-merge result / closeout comment | `adaptPostMergeEvidence` | verification end |
| #2678 cumulative evidence marker | `adaptCumulativeEvidenceComments` | closeout start |
| Task PR opened | `adaptTaskPrOpened` | execution end |
| Component merge | `adaptComponentMerge` | integration end |
| Inventory gaps | `adaptEvidenceMissingGaps` | unknown at uninstrumented boundaries |
| Mixed bundle | `adaptEvidenceBundle` | fan-in; per-adapter errors stay local |

Authoritative source selection for a stage boundary must go through
`getAuthoritativeSources()` from the inventory module. Legacy
`## POST-MERGE CLOSEOUT CHECKLIST` remains non-authoritative.

## Materializer outputs

`materializeTransaction()` returns
`lgfc-workflow-health-materialized:v1` with:

- `currentStage`, `currentPhase`, `owner`
- `ageMs` (time in current frontier), `totalAgeMs`
- `lastSuccessfulTransition`, `nextExpectedAction`
- `blockerClass`, `evidenceQuality`, `workflowStatus`
- `componentStatus` / `failingComponents`
- `mutatesExecutionAuthority: false`

Stage advancement requires the **latest** event for a stage to be a successful
`end` (pass/deferred) before the next stage is considered; an older successful
end never overrides newer blocked/fail/unknown evidence. Unknown or blocked
frontiers stop advancement. `materializeAllTransactions()` isolates each
transaction's history, duplicates, and supersession from the others.

## SLO engine outputs

`evaluateSlo()` returns `lgfc-workflow-health-slo:v1` with:

- `pickupVisibleWithinInterval` — tri-state: `true` (pickup evidence at or
  after the latest authority_ready end, within one watcher interval), `false`
  (deadline passed), `null` (no authority end yet, or pending inside the
  interval without evidence — never reported satisfied before evidence exists)
- `executableButIdleMs`
- `breaches[]` (each carries `sourceIssue`, `pr`, `evidenceRef`, `informational: true`)
- `enforcement: 'informational'`
- `mutatesExecutionAuthority: false`

All SLO calculations run on the same ingested (sorted, deduplicated,
supersession-resolved) active event set the materializer uses.

## Rollback

Revert this task's component-branch PR. No workflow, schedule, secret store, or
Production state is created. Authoritative Issue/PR/evidence history is
untouched because adapters only read.

## Follow-on work

- #2888 — Live Flow / Exceptions / Daily / Two-Week / Component Health views
- #2889 — scheduled reconciliation, retention, pilot, operator handoff
