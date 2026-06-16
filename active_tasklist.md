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
| `#1259` | `status:active` (open) | **Phase 4 active** — reopened 2026-06-16; Tasks 001–004 complete; Task 005 next (held) |

## Portfolio note (2026-06-16)

Program `#1500` was originally queued after `#1255`. Both programs executed in
parallel when ChatGPT became capable of `#1500` implementation. `#1500` is now
**closed complete**. `#1255` remains the active Cursor lane.

## Operator issue hygiene

Apply on GitHub (cloud agent cannot mutate issues):

```bash
gh issue edit 1259 --remove-label "status:complete" --add-label "status:active"
gh issue close 1666 --comment "Task 003 complete via PR #1667. Cleanup 2026-06-16."
```

| Issue | Target after cleanup |
| --- | --- |
| `#1259` | OPEN + `status:active` only |
| `#1666` | CLOSED + `status:complete` |

## Completed (reference)

| Item | State |
| --- | --- |
| `#1256` Content Strategy / Editorial Inventory | **closed complete** — Tasks 001–009 |
| `#1258` Website Operations Admin | **closed complete** — Phase 4 Tasks 001–013; terminal PR `#1652` |
| `#1259` Phase 3 planning | PR `#1656` merged (`b0cc0da`) |
| `#1259` Phase 4 Task 001 | PR `#1657` merged (`da02c01`); issue `#1659` closed complete |
| `#1259` Phase 4 Task 002 | PR `#1662` merged (`2e811a6`); issue `#1661` closed complete |
| `#1259` Phase 4 Task 003 | PR `#1667` merged (`0347b27`); issue `#1666` closed complete |
| `#1259` Phase 4 Task 004 | PR `#1672` merged (`5e10f72`); mobile/responsive validation report on `main` |
| `#1500` CI Post-Merge Closeout Reliability | **closed complete** — Tasks 001–005 (`#1544`–`#1548`) |
| issue `#1411` | completed planning artifact |

## Out of scope (current pass)

- `#1259` Phase 4 Tasks 005–009 (not authorized until per-task Atlas/Bill approval)
- Application code outside the next authorized `#1259` task scope
