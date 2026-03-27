# LGFC Backlog

This file tracks deferred ideas, improvements, and future enhancements that are intentionally not part of Day 1 canonical behavior.

## Day 2

- Harden Day 1 auth controls (rate limiting depth, abuse protections, and broader session guardrails).
- Add idle timeout policy and presence timeout handling for inactive sessions.
- Add explicit offline/stale-session detection and cleanup paths.
- Add stronger server-side session revocation and scheduled cleanup workflows.
- Improve member presence model beyond approximate `last_seen_at` activity updates.
- Refine auth UX for clearer error states, recovery paths, and post-login continuity.

## Day 3

- Add richer account/session management (active session visibility and member-managed sign-out options).
- Add member security controls (device/session review, stronger verification options when approved).
- Add authentication/session audit history for support and operations review.
- Expand advanced admin/member management capabilities tied to role workflows.
- Evaluate future auth modernization options if approved by product/ops governance.

## Parking Lot

- Keep unscheduled ideas here until approved and assigned to a future delivery horizon.
- Capture low-priority auth/presence enhancements without making them canonical.
- Track exploratory concepts that need design/ops validation before implementation.
