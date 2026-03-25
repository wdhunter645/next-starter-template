---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Homepage floating logo size and positioning fix scope and execution prompt
Does Not Own: Media pipeline, API routing, Weekly Matchup logic
Canonical Reference: /docs/governance/PR_GOVERNANCE.md
Last Reviewed: 2026-03-25
---

# Homepage Floating Logo Fix

## Objective
Restore proper size and alignment of the homepage floating logo after recent regression.

## Problem
- Logo appears too small
- Slight misalignment from top-left
- Visual inconsistency vs intended LGFC design

## Allowed Scope
- Header component
- Logo component
- CSS modules related to header/logo

## Out of Scope
- Media pipeline
- API routes
- Weekly Matchup
- Navigation behavior
- Auth

## Codex Prompt
Work only on this PR branch.

Fix the homepage floating logo size and alignment.

Requirements:
1. Increase logo size to visually balanced scale relative to header height.
2. Ensure the logo is properly aligned to the top-left with consistent padding.
3. Maintain responsiveness across desktop and mobile.
4. Do not modify navigation behavior or routing.
5. Keep changes minimal and isolated to logo/header styling.

Exit condition:
- Logo appears correctly sized and aligned on homepage.
- No layout regressions.
