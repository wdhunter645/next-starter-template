---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: MEDIA-03 Weekly Matchup read-path repair scope and execution prompt
Does Not Own: Broader media architecture redesign, unrelated homepage UI, tracker closeout
Canonical Reference: /docs/governance/PR_GOVERNANCE.md
Last Reviewed: 2026-03-25
---

# MEDIA-03 Matchup Read Path Fix

## Objective
Repair the Weekly Matchup image pipeline broken after PR #683 by restoring two working real images on the homepage while preserving the intended MEDIA routing direction where possible.

## Problem
`functions/api/matchup/current.ts` was changed to depend on:
- `/api/photos/get/:id`
- `/api/photos/list`

Homepage Weekly Matchup now renders broken images.

## Allowed Scope
- `functions/api/matchup/current.ts`
- Actual live photo read-path files only if strictly required to make the matchup pipeline work

## Out of Scope
- Homepage layout
- Header
- Floating logo
- Footer
- Routing
- Auth
- Placeholder image logic
- Tracker closeout

## Codex Prompt
Work only on this PR branch.

Fix the broken Weekly Matchup image pipeline introduced by PR #683.

Requirements:
1. Verify whether `/api/photos/get/:id` and `/api/photos/list` are valid live callable read paths in this runtime.
2. If those paths are missing, invalid, or not returning usable items for matchup, rewire `functions/api/matchup/current.ts` to the actual working live photo source.
3. If the paths exist but parsing/validation is wrong, fix only the read/validation path.
4. Return exactly two usable real images for the homepage Weekly Matchup.
5. Do not add placeholders.
6. Do not touch unrelated UI or homepage files.
7. Keep the diff minimal.

Exit condition:
- Homepage Weekly Matchup loads two real images again.
- No unrelated files changed.
