---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Workflow event inventory and the normalized workflow-health adapter contract for #2680
Does Not Own: Adapter implementation (#2887), views/data products (#2888), reconciliation/retention (#2889), Production promotion
Canonical Reference: /scripts/workflow-health/event-inventory.mjs
Related Issues: #2680, #2886, #2678, #2677
Last Reviewed: 2026-08-01
---

# Workflow event inventory and adapter contract

Work unit #2886 (2680-001). Maps every required workflow stage from the #2680
project contract to its authoritative, deterministic evidence sources and
finalizes the adapter contract that later work units (#2887–#2889) implement.
The machine-readable inventory is `scripts/workflow-health/event-inventory.mjs`;
this document explains it. Where the two disagree, the module is canonical.

## Ground rules

1. **No label-only inference.** Labels (`agent:cursor`, `handoff:ready`,
   `pmo:active`, …) gate eligibility but never constitute evidence that work
   started, progressed, or completed. Pickup requires Bridge start, Cursor
   acknowledgment, a commit, a PR update, or a canonical handoff comment.
2. **Missing evidence is visible.** A stage without deterministic evidence is
   classified `evidence_missing` in the inventory, and adapters must emit an
   explicit `unknown` event for it. Missing instrumentation can never produce
   a healthy state.
3. **Read-only.** Adapters consume existing GitHub and artifact evidence.
   They create no authority, approve nothing, and never mutate `main`.

## Where the evidence lives

Three of the authoritative sources are not on `main` yet:

| Source | Location | Status |
| --- | --- | --- |
| #2677 controller observability (13 transition kinds, `OBSERVABILITY_SCHEMA_VERSION 1`) | `component/deterministic-handoff-controller` | Promotion Candidate, not promoted |
| #2678 cumulative lane evidence (`<!-- lgfc-cumulative-evidence:v1 -->` events, schema v1) | `component/cumulative-lane-evidence` | Promotion Candidate accepted 2026-08-01, not promoted |
| Bridge host records (wake packet, `claim.json`, `in-flight.json`) | Bridge host filesystem | Local-only; GitHub-visible via Bridge comments |

Adapters targeting these sources are a **cross-component dependency**: until
promotion, the workflow-health component consumes only their GitHub-visible
emissions (issue comments, workflow artifacts) — never a vendored copy of
their code.

## Stage inventory

The ten required stages, their owners, and their deterministic markers. Exact
marker strings, identity fields, and gap notes are in the module; this table
is the orientation view.

| # | Stage | Owner | Deterministic start | Deterministic end | Explicit gaps |
| ---: | --- | --- | --- | --- | --- |
| 1 | Authority ready | PMO/Engineering | `LOCAL CURSOR RESUME` comment; controller `handoff_received` | wake workflow run | Free-form dispatch comments |
| 2 | Delivery | Deterministic CI | `cursor-local-wake.yml` run | `CURSOR BRIDGE ACK: delivered` + delivery id | Wake packet is host-local |
| 3 | Eligibility | Implementation/Operations | ACK comment | `CURSOR BRIDGE FALLBACK:` (fail) | Pass-path claim is host-local; visible only via STARTED |
| 4 | Execution | Implementation/Operations | `CURSOR BRIDGE STARTED` | `CURSOR BRIDGE COMPLETED`; task PR opened | Manual/poll-wake pickup has no structured start marker |
| 5 | Review | PR Approver/Engineering | PR review objects; controller `evidence_complete`/`disposition` | `GATE — Reviewer Response Completion`; advisory markers | — |
| 6 | Remediation | Implementation/Operations | `LOCAL CURSOR RESUME`; controller `resume` | — | Correction completion has no dedicated marker |
| 7 | Integration | Deterministic CI | controller `integration` | component merge SHA; controller `blocker`/`escalation` | — |
| 8 | Verification | Deterministic CI | `post-merge-closeout.yml` run | `post-merge-result.json` artifact; source-issue closeout comment | — |
| 9 | Closeout | Implementation/Operations | `lgfc-cumulative-evidence:v1` events; legacy `## POST-MERGE CLOSEOUT CHECKLIST` | controller `closeout`; issue closed (paired) | — |
| 10 | Continuation | Administration | controller `successor_activation` | successor `CURSOR BRIDGE ACK` | Manual successor dispatch is free-form |

## Adapter contract — `lgfc-workflow-health-event:v1`

Every adapter normalizes source evidence into this envelope. Required fields
(canonical list: `ENVELOPE_REQUIRED_FIELDS` in the module):

| Field | Meaning |
| --- | --- |
| `schemaVersion` | `lgfc-workflow-health-event:v1` |
| `transactionId` | Stable work-transaction identity (source issue + work unit) |
| `sourceIssue` | Source Issue number |
| `project` | Parent project issue number |
| `lane` | `sandbox` / `development` / `promotion_candidate` / `production` |
| `pr` | PR number or `null` |
| `candidateSha` | Candidate SHA or `null` |
| `stage` | One of the ten stage ids |
| `phase` | `start` / `end` / `blocked` / `unknown` |
| `occurredAt` | Authoritative source timestamp (ISO 8601 UTC) |
| `actor` | Emitting login/agent |
| `actorComponent` | `runner` / `wake_workflow` / `bridge` / `cursor` / `controller` / `checks` / `post_merge_validator` / `closeout` / `human` |
| `result` | `pass` / `fail` / `blocked` / `deferred` / `unknown` |
| `blockerClass` | Failure taxonomy (`authentication`, `capacity`, `eligibility`, `execution`, `review`, `controller`, `integration`, `verification`, `closeout`, `continuation`, `unknown`) or `null` |
| `nextExpectedAction` | `{ owner, action }` or `null` |
| `sloDeadline` | ISO deadline or `null` (informational in first release) |
| `idempotencyKey` | Duplicate-suppression key |
| `supersedes` | Superseded idempotency key or `null` (same semantics as #2678) |
| `evidence` | `{ channel, ref, marker }` pointing at the source artifact |
| `evidenceQuality` | `deterministic` or `unknown_evidence_missing` |

### Mapping rules

- One source emission maps to at most one envelope event; adapters are
  idempotent under replay via `idempotencyKey`.
- Supersession follows the #2678 model: a later event carrying `supersedes`
  replaces the prior event for the same logical slot; history is retained.
- Bridge comment adapters key on the fixed first-line prefixes
  (`CURSOR BRIDGE ACK: delivered`, `CURSOR BRIDGE STARTED`,
  `CURSOR BRIDGE COMPLETED`, `CURSOR BRIDGE FALLBACK:`).
- Controller adapters consume observability snapshot events
  (`schemaVersion`, `kind`, `outcome`, `at`, `runId`, `source`) and map the 13
  transition kinds onto stages as recorded in the module.
- Post-merge adapters consume `post-merge-result.json`
  (`status`, `pr`, `merge_sha`, `source_issue`, `sync_action`) and the
  source-issue closeout comment first lines.
- A stage boundary with only `evidence_missing` or `local_only` sources must
  produce a `phase: unknown`, `evidenceQuality: unknown_evidence_missing`
  event rather than being skipped.

## Rollback

Revert this task's component-branch PR. No workflow, schedule, or Production
state is created by this work unit; the inventory and contract are inert
reference data plus tests.
