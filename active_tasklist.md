# active_tasklist.md — Read-Only Snapshot (Derived from GitHub Issues)

Date: 2026-06-16

This file is **not** the system of record.

System of record for all work is GitHub **issues**.

Use this file only as an optional, human-readable snapshot.

---

## Active — Program #1255

| Item | State | Notes |
| --- | --- | --- |
| `#1255` | `status:active` | Umbrella program — Website Implementation and Content Operations (Cursor) |
| `#1259` | `status:active` (open) | **Phase 4 active** — reopened 2026-06-16; Task 004 mobile/responsive **in progress** (PR `#1672`); Tasks 005+ held |

## Portfolio note (2026-06-16)

Program `#1500` was originally queued after `#1255`. Both programs executed in
parallel when ChatGPT became capable of `#1500` implementation. `#1500` is now
**closed complete** (ChatGPT final review/docs). `#1255` remains the active Cursor
lane — do not reference `#1500` in `#1259` task PR bodies except plan out-of-scope
boundaries.

## Operator issue hygiene (pending)

| Issue | Expected state | Drift |
| --- | --- | --- |
| `#1259` | Open + `status:active` only | Remove `status:complete`, `status:failed`, `status:post-merge-verify` |
| `#1666` | Closed + `status:complete` | Reopened after Task 003 merge — close again (satisfied by PR `#1667`) |

## Completed (reference)

| Item | State |
| --- | --- |
| `#1256` Content Strategy / Editorial Inventory | **closed complete** — Tasks 001–009 |
| `#1258` Website Operations Admin | **closed complete** — Phase 4 Tasks 001–013; terminal PR `#1652` |
| `#1259` Phase 3 planning | PR `#1656` merged (`b0cc0da`) |
| `#1259` Phase 4 Task 001 | PR `#1657` merged (`da02c01`); issue `#1659` closed complete |
| `#1259` Phase 4 Task 002 | PR `#1662` merged (`2e811a6`); issue `#1661` closed complete |
| `#1259` Phase 4 Task 003 | PR `#1667` merged (`0347b27`); issue `#1666` closed complete on `main` |
| `#1500` CI Post-Merge Closeout Reliability | **closed complete** — Tasks 001–005 (`#1544`–`#1548`) |
| issue `#1411` | completed planning artifact |

## Out of scope (current pass)

- `#1259` Phase 4 Tasks 005–009 (not authorized until Task 004 merged and per-task approval)
- Application code outside Task 004 mobile/responsive scoped deliverables
