---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Cumulative lane evidence event schema v1, lane requirement matrix, supersession/idempotency rules, protected-stop binding, and fixture contract for Sandbox/Development/Promotion Candidate/Production
Does Not Own: Event writer/adapters, derived summary materializer, controller integration, legacy migration, or Production merge authority
Canonical Reference: /docs/reference/operations/operating-lanes-and-promotion-profiles.md
Related Issues: #2678, #2882
Last Reviewed: 2026-07-31
---

# Cumulative Lane Evidence Contract (v1)

## Purpose

Define the versioned, append-only evidence event that accumulates across Sandbox, Development, Promotion Candidate, and Production. Administrative evidence may accumulate while safe work continues inside a lane. Required evidence fails closed only at lane exit.

This document and `schemas/cumulative-lane-evidence/v1/event.schema.json` are the Work Unit 001 deliverable for project #2678. Writers, adapters, summary materialization, and controller integration are later work units (#2883–#2885).

## Marker and payload

Authoritative events are posted as Issue comments whose body begins with:

```text
<!-- lgfc-cumulative-evidence:v1 -->
```

followed by a JSON object that validates against `schemas/cumulative-lane-evidence/v1/event.schema.json`.

The JSON payload is the historical authority. Derived summary comments (later work unit) are views and must never silently rewrite history.

## Event identity

An event is uniquely identified for duplicate suppression by `idempotencyKey`.

Logical identity for human/controller correlation combines:

| Field | Role |
| --- | --- |
| `schemaVersion` | Always `lgfc-cumulative-evidence:v1` |
| `sourceIssue` | Primary task Issue |
| `workUnitId` | Stable work-unit / release-unit identity |
| `lane` | `sandbox` \| `development` \| `promotion_candidate` \| `production` |
| `transition` | Lifecycle verb for this event |
| `candidateSha` | Exact candidate when bound to an integrated SHA |
| `idempotencyKey` | Duplicate suppression key |

## Supersession

- History is append-only. Corrections append a new event with `transition: correct` (or a later authoritative transition) and `supersedes` set to the prior event's `idempotencyKey`.
- Controllers and agents must select the latest non-superseded authorized revision for each logical slot and must not treat superseded events as concurrently authoritative.
- `result: superseded` may appear on a later acknowledgment event; the authoritative correction is the event that carries `supersedes`.

## Protected stops

`protectedStops` uses the flag set from `docs/reference/agents/implementation-authority-contract.md`:

- `materialDesignDecision`
- `authorityConflict`
- `unsafePreviewIsolation`
- `credentialsCostBusinessAuth`
- `structuralDesignFailure`
- `incompleteLaunchPackage`
- `scopeOrAllowlistConflict`
- `requiredGateFailure`
- `blockingReviewThreads`
- `explicitHoldInstruction`
- `closeoutEvidenceConflict`

Rules:

1. Non-empty `protectedStops` requires stop and escalation.
2. Lane **exit** must fail closed while any protected stop remains active (not superseded by a later event that clears it).
3. Protected stops do not by themselves block continued safe in-lane work unless the owning role recorded an explicit hold.

## Lane requirement matrix

Required `laneFields` keys by lane when `transition` is `exit` or `closeout`. Other transitions may carry a subset; missing keys on exit/closeout are fixture-proven failures.

### Sandbox (`lane: sandbox`)

| Field | Meaning |
| --- | --- |
| `hypothesis` | Experiment question and hypothesis |
| `isolationBoundary` | Isolation boundary description |
| `observedResult` | Artifacts and observed result |
| `disposition` | `discard` \| `retain_as_evidence` \| `adopt_to_development` |
| `carriedRisks` | Risks or unknowns carried forward (array; may be empty) |

### Development (`lane: development`)

| Field | Meaning |
| --- | --- |
| `sourceIssue` | Source Issue number (must match payload `sourceIssue`) |
| `objective` | Approved objective |
| `allowlist` | Exact changed-path allowlist (array of strings) |
| `implementationSummary` | What changed |
| `verification` | Tests and current-head check evidence (object or string refs) |
| `reviewDispositions` | Review findings and dispositions |
| `limitationsAndRollback` | Known limitations, deferred work, rollback approach |
| `componentCandidate` | Integrated component candidate identity (branch and/or SHA) |

### Promotion Candidate (`lane: promotion_candidate`)

| Field | Meaning |
| --- | --- |
| `candidateSha` | Exact candidate SHA (must match payload `candidateSha`) |
| `qualificationEvidence` | Regression, security, migration, performance, rollback, standards, readiness as applicable |
| `driftReconciliation` | Drift reconciliation statement |
| `unresolvedRisks` | Unresolved risks and disposition |
| `productionRecommendation` | `go` \| `no_go` \| `return_to_development` |

### Production (`lane: production`)

| Field | Meaning |
| --- | --- |
| `approvedCandidateSha` | Final approved candidate identity (must match payload `candidateSha`) |
| `mergeOrDeployEvidence` | Merge/deployment evidence refs |
| `environmentChangeRecord` | Environment/configuration change record |
| `liveVerification` | Live verification and public evidence |
| `incidentRollbackStatus` | Incident/rollback status |
| `finalRisksAndFollowUps` | Final known risks and follow-ups |
| `reconciliation` | Source Issue, PR, release, and project/program reconciliation |

## Transition and profile rules (schema-level)

Allowed promotion-profile progression remains:

```text
Sandbox -> Development -> Promotion Candidate -> Production
```

Prohibited (controllers must reject; fixtures cover the contract):

```text
Sandbox -X-> Promotion Candidate
Sandbox -X-> Production
Development -X-> Production
```

`candidateSha` is required (non-null, 40-hex) for:

- `promotion_candidate` + `exit` or `closeout`
- every `production` transition

## Fixtures

Fixtures live under `schemas/cumulative-lane-evidence/v1/fixtures/` and are proven by `tests/cumulative-lane-evidence/`:

| Class | Intent |
| --- | --- |
| `valid/` | Well-formed exit/closeout events for each lane |
| `missing/` | Exit/closeout events missing required laneFields (schema-valid JSON that fails matrix validation) |
| `corrected/` | Superseding correction events |
| `duplicate/` | Same `idempotencyKey` as a prior valid event |
| `protected-stop/` | Non-empty protectedStops that must block lane exit |

## Validation entry point

`scripts/cumulative-lane-evidence/validate-event.mjs` validates:

1. JSON Schema compliance
2. Lane-matrix required fields for `exit` / `closeout`
3. `candidateSha` binding rules
4. Duplicate detection when a prior-key set is supplied
5. Protected-stop fail-closed for exit/closeout

## Non-goals (this work unit)

- Issue comment writer or GitHub adapters
- Derived summary materializer
- Controller / post-merge integration
- Legacy PR-body ledger migration
- Any Production merge or repository-settings change
