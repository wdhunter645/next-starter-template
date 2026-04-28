---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Context
Owns: Rationale for editorial rotation behavior
Does Not Own: Content inventory schema; homepage implementation; publishing procedures
Canonical Reference: /docs/reference/content-inventory-design-spec.md
Last Reviewed: 2026-04-28
---

# Editorial Rotation Model

Many key Gehrig events occur in June.

Without rotation, the homepage would repeat the same stories yearly.

Solution:
- use event_date for seasonality
- use rotation_group to group similar stories
- use last_featured to prevent repetition
- use feature_weight to prioritize importance

Result: dynamic homepage with historical depth and variation.
