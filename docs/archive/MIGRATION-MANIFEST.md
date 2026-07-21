---
Doc Type: Archive
Audience: Human + AI
Authority Level: Historical Record
Owns: Legacy documentation retirement ledger (old path to DIATAXIS authority mapping)
Does Not Own: Active operational authority; legacy retirement policy rules
Canonical Reference: /docs/ops/pmo/diataxis-legacy-retirement-policy.md
Related issues: #1353, #1076, #1134, #2140
Last Reviewed: 2026-07-02
---

# Legacy Documentation Migration Manifest

## Purpose

Append-only ledger of legacy documentation retirements. Each row records where a former live path moved or was deleted and which DIATAXIS document now owns authority.

## Authority

This manifest is **historical traceability only**. It does not grant implementation authority. Active authority remains in DIATAXIS documents per `/docs/ops/pmo/diataxis-legacy-retirement-policy.md`.

## Row Schema

| Field | Required | Description |
| --- | --- | --- |
| legacy path | yes | Former live repository path |
| archive path or deleted | yes | archive destination permitted by the legacy retirement policy, or `deleted` |
| replacement DIATAXIS path | yes | Current authoritative document |
| status | yes | `planned`, `in-progress`, `retired`, or `deleted` |
| rationale | yes | Why the legacy path was retired |
| date | yes | Retirement date (YYYY-MM-DD) |

## Entries

Rows are append-only. Do not delete historical rows; append corrections with a new date and rationale if a mapping changes.

| legacy path | archive path or deleted | replacement DIATAXIS path | status | rationale | date |
| --- | --- | --- | --- | --- | --- |
| *(none yet)* | — | — | — | Placeholder manifest created before portfolio work | 2026-06-05 |
| docs/reference/orchestration/startup-governance.md | docs/archive/reference/orchestration/startup-governance.md | docs/ops/ai/CHATGPT-RULES.md | retired | Superseded by Agent.md startup routing and the ChatGPT/ChatGPT startup contract; retained as historical startup governance evidence. | 2026-07-02 |
