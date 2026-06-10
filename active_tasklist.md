# active_tasklist.md — Read-Only Snapshot (Derived from GitHub Issues)

Date: 2026-06-10

This file is **not** the system of record.

System of record for all work is GitHub **Issues**.

Use this file only as an optional, human-readable snapshot.

---

## Open — Program #1255 terminal closeout (immediate)

| Item | State | Blocker |
| --- | --- | --- |
| `#1407` Task 009 | `status:post-merge-verify` | PR `#1520` merged; closeout pending |
| `#1526` post-merge exception | open | Unchecked acceptance criterion in PR `#1520` body |
| `#1448` rebaseline | open | Stale pause language — reconcile after `#1407` closeout |
| `#1256` child project | `status:active` + stale `status:failed` | Completes when `#1407` / `#1526` close |

## Queued — not started

| Item | State |
| --- | --- |
| `#1258` Website Operations Admin | `status:queued` |
| `#1259` Website QA / Production Validation | `status:queued` |

## Out of scope (this cleanup pass)

- Issue `#1500` — next prioritized program after Program #1255 completes
- `#1258` / `#1259` implementation

---

## Completed (reference)

- Program #1256 Tasks 001–008 — merged on `main`
- PR `#1520` Task 009 seed pack — merged `f40cd068`
- Issue `#1411` — closed complete (planning artifact, not open blocked program)
- PMO v3 docs — PR `#1502` merged
