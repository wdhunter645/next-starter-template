---
Doc Type: Archive
Audience: Human + AI
Authority Level: Historical Record
Owns: Legacy documentation retirement ledger (old path → DIATAXIS authority mapping)
Does Not Own: Active operational authority; legacy retirement policy rules
Canonical Reference: /docs/ops/pmo/diataxis-legacy-retirement-policy.md
Related Issues: #1353, #1076, #1134
Last Reviewed: 2026-06-05
---

# Legacy Documentation Migration Manifest

## Purpose

Append-only ledger of legacy documentation retirements. Each row records where a
former live path moved or was deleted and which DIATAXIS document now owns
authority.

## Authority

This manifest is **historical traceability only**. It does not grant
implementation authority. Active authority remains in DIATAXIS documents per
`/docs/ops/pmo/diataxis-legacy-retirement-policy.md`.

## Row Schema

| Field | Required | Description |
| --- | --- | --- |
| legacy path | yes | Former live repository path |
| archive path or deleted | yes | `docs/archive/superseded/...` destination or `deleted` |
| replacement DIATAXIS path | yes | Current authoritative document |
| status | yes | `planned`, `in-progress`, `retired`, or `deleted` |
| rationale | yes | Why the legacy path was retired |
| date | yes | Retirement date (YYYY-MM-DD) |

## Entries

No legacy paths have been retired under this manifest yet. Rows will be appended
as incremental retirement task PRs land. Do not delete historical rows; append
corrections with a new date and rationale if a mapping changes.

| legacy path | archive path or deleted | replacement DIATAXIS path | status | rationale | date |
| --- | --- | --- | --- | --- | --- |
| *(none yet)* | — | — | — | Placeholder manifest created before portfolio work | 2026-06-05 |
