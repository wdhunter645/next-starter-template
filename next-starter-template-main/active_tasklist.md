# active_tasklist.md — Daily Work List (Ephemeral)

Date: 2026-01-28

This file is a **daily** FYI task tracker. Keep it lightweight.
- Start the day with remaining open items at the top.
- Mark completed items in the Completed section.
- Next day: carry forward any remaining open items, then refresh.

---

## Open (Today)

- Home page: JOIN section button must route to `/join` and load consistently
- Logout must force UI state refresh so header flips back to Login layout without manual refresh
- Weekly Photo Matchup must show photos (D1/B2 data path)
- Social Wall: restore Elfsight widget OR remove the section cleanly (no giant whitespace / no "Loading…" stuck text)
- Footer: restore quote line; increase center logo size so it is visibly a logo (not a dot)
- Home initial load/perf investigation (cold load + refresh)
- D1 pseudo-data population for every D1-backed page/section (verify via `/admin/d1-test`)

---

## Completed (Today)

- /admin access denied (fixed via ZIP 41 - admin UI now browser-reachable, APIs token-gated)
- D1 test page (`/admin/d1-test`) — browser-based diagnostic tool now functional
- Docs allowlist deadlock fix — resolved via repo41 ZIP deployment
- Canonical label alignment docs — updated in `/docs/website-process.md`
