# active_tasklist.md — Daily Work List (Ephemeral)

Date: 2026-01-21

This file is a **daily** FYI task tracker. Keep it lightweight.
- Start the day with remaining open items at the top.
- Mark completed items in the Completed section.
- Next day: carry forward any remaining open items, then refresh.

---

## Open (Today)

- Admin diagnostics: Use `/api/d1-test` endpoint for D1 database health checks and troubleshooting
- Align FanClub routing: ensure Photo/Library/Memorabilia are FanClub-only under `/fanclub/**`
- Align headers:
  - Public header supports logged-in variant (adds Club Home + Logout)
  - FanClub header buttons match invariants
- Align footer to locked design (quote + legal left, center logo scroll-to-top, right links order)
- Docs refresh:
  - NAVIGATION invariants
  - FanClub spec
  - README + 3-file method

---

## Completed (Today)

- Admin access configuration: `/admin` now accessible via browser with `ADMIN_TOKEN` environment variable
- Admin API endpoints: `/api/admin/**` protected by token-based authentication
- D1 diagnostics endpoint: `/api/d1-test` available for database health monitoring
