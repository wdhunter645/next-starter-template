---
Doc Type: Ticket
Audience: Internal
Authority Level: Final
Owns: Removal of pseudo/fallback event data from homepage calendar runtime
Does Not Own: broader events schema, admin event authoring, unrelated homepage sections
Canonical Reference: docs/reference/design/home-calendar.md
Last Reviewed: 2026-04-02
---

# Calendar — Remove Pseudo Data

## Objective
Remove all pseudo, sample, fallback, or preview event data from the homepage event calendar.

## Scope
- `src/components/CalendarSection.tsx`
- `docs/reference/design/home-calendar.md` if needed to remove the fallback-data statement
- Tests only if required to keep CI green

## Required Outcome
- Homepage calendar must never render invented event rows.
- If live event data is unavailable or empty, show a truthful empty/unavailable state only.
- No fabricated titles, dates, descriptions, hosts, fees, or locations.

## Implementation Notes
- Remove `buildFallbackForMonth` and all related pseudo-event templates.
- Replace fallback behavior with honest status messaging and empty-state rendering.
- Preserve overall section layout stability.
- Do not introduce scope drift outside the calendar section and any directly dependent tests/docs.
