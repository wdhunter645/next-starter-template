---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: Homepage milestones section purpose, layout contract, and behavior
Does Not Own: Historical content curation governance; admin CMS workflows
Canonical Reference: /docs/reference/design/home.md
Last Reviewed: 2026-03-27
---

# Homepage Section Spec — Milestones

## Purpose
Define the homepage milestones section that surfaces notable Lou Gehrig / club timeline highlights.

## Route / Path
- Host page: `/`
- Section anchor/id: `#milestones`

## Section / Component Breakdown
- Section wrapper in `src/app/page.tsx`
- Component owner: `src/components/MilestonesSection.tsx`

## Data Dependencies
- Reads milestone records from the milestones data source used by `MilestonesSection`.
- Provides loading and no-data fallback messaging.

## Auth / Access Expectations
- Publicly visible.
- No auth gate.

## Key UX / Behavior Notes
- Section order is locked relative to Friends and Calendar.
- Content must remain legible with concise date/event presentation.
