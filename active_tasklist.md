# active_tasklist.md — Daily Work List (Ephemeral)

Date: 2026-01-28

This file is a **daily** FYI task tracker. Keep it lightweight.
- Start the day with remaining open items at the top.
- Mark completed items in the Completed section.
- Next day: carry forward any remaining open items, then refresh.

---

## Open (Today)

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

- ZIP 41: Unblock `/admin` UI access (removed HTML middleware gate)
- ZIP 41: Add `/admin/d1-test` page for D1 table inspection
- ZIP 41: Add `/api/admin/d1-inspect` endpoint for table list + schema + samples
- ZIP 41: Admin APIs remain token-gated via `ADMIN_TOKEN`
