---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Legacy closeout/handoff surface mapping, retirement criteria, and reversible migration rules into cumulative lane evidence v1
Does Not Own: Event schema (v1 contract), writer implementation, Production merge, or deletion of historical GitHub comments
Canonical Reference: /docs/reference/operations/cumulative-lane-evidence-contract.md
Related Issues: #2678, #2884, #2677
Last Reviewed: 2026-07-31
---

# Cumulative Lane Evidence — Legacy Migration and Controller Integration (v1)

## Purpose

Define how the #2677 deterministic handoff-controller transactions and active legacy closeout/handoff surfaces reconcile into one cumulative work unit without deleting history and without letting administrative residue halt safe in-lane work.

Implementation lives under `scripts/cumulative-lane-evidence/`:

| Module | Role |
| --- | --- |
| `controller-transaction-adapter.mjs` | Map #2677 transition kinds → cumulative event drafts |
| `legacy-closeout-adapter.mjs` | Detect/map legacy markers → compatibility records/drafts |
| `admin-residue.mjs` | Classify residue as non-blocking for in-lane work |
| `reconcile-unit.mjs` | One read-only cumulative unit view |

## Controller integration (#2677)

Supported transition kinds (frozen mirror of the controller observability contract):

- `handoff_received`, `evidence_complete`, `disposition`, `resume`
- `integration`, `verification`, `closeout`, `successor_activation`
- `duplicate_suppression`, `blocker`, `escalation`
- `reconciliation_scan`, `mutation_disabled`

Rules:

1. Mapping is pure data transformation. It does not execute merges, close Issues, or invent approval/Production authority.
2. Controller progress drafts are not lane-exit packages; exit/closeout still requires a complete matrix-valid event.
3. Administrative/diagnostic kinds (`duplicate_suppression`, `reconciliation_scan`, `mutation_disabled`, `handoff_received`, `evidence_complete`, `resume`) never block continued safe in-lane work by themselves.
4. This component branch does not absorb the full `scripts/agent-routing/**` tree; integration is via the adapter contract so Promotion Candidate can compose both components later.

## Legacy surfaces in scope

| Marker | Retirement class |
| --- | --- |
| `## POST-MERGE CLOSEOUT CHECKLIST` | `pr_body_checklist` |
| `CHATGPT CLOSEOUT` | `issue_comment_closeout` |
| `CHATGPT HANDOFF` | `issue_comment_handoff` |
| `IMPLEMENTATION HANDOFF` | `issue_comment_handoff` |
| `CLOSEOUT ASSIGNMENT` | `issue_comment_closeout` |
| `POST-MERGE CLOSEOUT — COMPLETE` | `issue_comment_closeout` |

Compatibility mapping marks `authoritative: false` and `preservesHistory: true`. Legacy comments and PR-body checklists remain in place.

## Retirement criteria (reversible)

A legacy retirement class may be marked **eligible for retirement** only when all of the following are true:

1. The work unit has authoritative cumulative events covering the same lane slot.
2. Controllers and closeout automation consume the cumulative unit (or an approved dual-read period has completed).
3. A separately reviewed retirement decision is recorded by PMO / Engineering (and Product Authority if deletion of historical text is proposed).
4. Rollback remains: re-enable the legacy adapter; append-only cumulative history is retained.

Until those conditions hold, adapters run in **compatibility mode**. No historical Issue comment or PR-body checklist is deleted by this work unit.

## Administrative residue invariant

```text
administrative residue  -X->  halt safe in-lane work
missing/invalid exit evidence or protected stops  ->  fail-closed lane exit only
```

`evaluateLaneExitWithAdminResidue()` encodes this: `inLaneWorkPermitted` stays true whenever residue is the only concern; `canExit` follows `evaluateLaneExit()` alone.

## Rollback

1. Stop calling the new adapters from controllers/closeout paths.
2. Leave cumulative event comments and legacy comments untouched.
3. Revert this component-branch PR if needed; history on Issues is preserved either way.

## Non-goals

- Copying or merging `component/deterministic-handoff-controller` into this branch
- Enabling controller mutation switches
- Deleting or rewriting legacy closeout comments
- Production / `main` promotion
