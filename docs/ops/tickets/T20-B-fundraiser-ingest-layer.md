---
Doc Type: Ticket
Audience: Internal
Authority Level: Working
Owns: T20-B implementation scope and exit criteria
Does Not Own: PR body, implementation notes, fundraiser ranking policy
Canonical Reference: docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md
Last Reviewed: 2026-03-25
---

# T20-B — Fundraiser Ingest Layer

## Objective
Create the application ingest layer for fundraiser data using the launch-safe manual JSON source.

## Scope
- Create `lib/fundraiser.ts`
- Load from `data/fundraiser.json`
- Validate source record shape
- Normalize values into app-safe typed output
- Compute `points = total_amount * donor_count`

## Inputs
Expected source fields:
- `team_id`
- `team_name`
- `total_amount`
- `donor_count`
- `timestamp`

## Required Behavior
- Reject malformed or incomplete records
- Normalize numeric fields before point calculation
- Preserve source timestamp in normalized output
- Export a clean dataset for downstream leaderboard logic
- Keep implementation launch-safe and deterministic

## Explicit Out of Scope
- Leaderboard sorting
- Tie-break logic
- Winner resolution
- Homepage spotlight rendering
- D1 migration
- Admin authoring workflow

## Deliverable
A clean fundraiser dataset is available in code through a dedicated ingest utility.

## Exit Criteria
- `lib/fundraiser.ts` exists
- Data can be loaded from `data/fundraiser.json`
- Schema/shape validation is applied
- Points are computed consistently
- Normalized output is ready for T20-C

## File Allowlist For Implementation
- `lib/fundraiser.ts`
- `data/fundraiser.json` only if required for fixture alignment or typing validation
- Minimal test/supporting file only if strictly required by existing repo patterns

## Notes For Codex
- Keep scope to T20-B only
- No UI work
- No tracker edits
- No unrelated cleanup
- Stop after the ingest layer is complete
