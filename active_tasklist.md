# active_tasklist.md — Daily Work List (Ephemeral)

Date: 2026-01-28

This file is a **daily** FYI task tracker. Keep it lightweight.
- Start the day with remaining open items at the top.
- Mark completed items in the Completed section.
- Next day: carry forward any remaining open items, then refresh.

---

## Open (Today)

- Home page final polish:
  - Social Wall widget stability check
  - Weekly Vote section alignment
- D1 migration and seeding verification across environments
- Widget integration testing (Elfsight, B2 media)

---

## Completed (Today)

- ✅ Admin access model documented (ZIP 41 / PR #457)
  - `/admin` pages browser-reachable
  - `/api/admin/**` endpoints token-gated by `ADMIN_TOKEN`
  - `/admin/d1-test` D1 diagnostic tool operational
  - Full documentation in `/docs/admin/access-model.md`
- ✅ FanClub routing aligned: Photo/Library/Memorabilia under `/fanclub/**`
- ✅ Headers aligned:
  - Public header supports logged-in variant (adds Club Home + Logout)
  - FanClub header buttons match invariants
- ✅ Footer aligned to locked design (quote + legal left, center logo scroll-to-top, right links order)
- ✅ Docs refreshed:
  - NAVIGATION invariants
  - FanClub spec
  - README + 3-file method
