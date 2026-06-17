# active_tasklist.md — Read-Only Snapshot (Derived from GitHub Issues)

Date: 2026-06-17

This file is **not** the system of record.

System of record for all work is GitHub **issues**.

Use this file only as an optional, human-readable snapshot.

---

## Active — Program #1255

| Item | State | Notes |
| --- | --- | --- |
| `#1255` | `status:active` (open) | Umbrella — **closeout inspection pending** Atlas/Bill authorization |
| `#1259` | `status:active` (open) | Phase 4 complete (Tasks 001–009); open pending `#1255` terminal closeout |

## Closeout prep (operator — pending final inspection)

| Item | Action |
| --- | --- |
| `#1123` | Remove stale `status:pr-draft` label (issue already CLOSED) |
| `#1258` | Close as complete — deliverables satisfied by PR `#1652` |
| `#1259` / `#1255` | **Do not close** until terminal closeout authorized |

Packet: `docs/ops/reports/program-1255-closeout-readiness.md`

## Portfolio note (2026-06-16)

Program `#1500` was originally queued after `#1255`. Both programs executed in
parallel when ChatGPT became capable of `#1500` implementation. `#1500` is now
**closed complete**. `#1255` remains the active Cursor lane.

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
| `#1259` Phase 4 Task 005 | PR `#1684` merged (`8893591`); D1/B2 read-path validation report on `main` |
| `#1259` Phase 4 Task 006 | PR `#1728` merged (`c170d3c`); content inventory public surface validation report on `main` |
| `#1259` Phase 4 Task 007 | PR `#1737` merged (`552fb8f`); H-011 launch-readiness disposition report on `main` |
| `#1259` Phase 4 Task 008 | PR `#1753` merged (`678699e`); legacy disposition package on `main` |
| `#1259` Phase 4 Task 009 | PR `#1751` merged (`fd17af2`); final QA handoff report on `main` |
| `#1500` CI Post-Merge Closeout Reliability | **closed complete** — Tasks 001–005 (`#1544`–`#1548`) |
| issue `#1411` | completed planning artifact |

## Out of scope (current pass)

- Program `#1255` terminal closeout (requires Atlas/Bill authorization after inspection)
- Priority #1 / #2 / #3 program execution (parked launch-control programs)
