---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO program issue registry, current program issue assignments, launch-state control, child-project mapping, and authoritative execution chain for LGFC orchestrated work
Does Not Own: PMO v3 top-level policy, implementation plan task definitions, workflow code, runtime behavior, product design, or unauthorized GitHub issue changes
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1411, #1379, #1255, #1259, #1500, #1678, #1685, #1696, #1700, #1713, #1719, #1736, #1738, #1739, #1740, #1741, #1742, #1743, #1744, #1745, #1746
Last Reviewed: 2026-06-17
---

# PMO Program Issue Registry

## Purpose

Record current PMO program issues and their status under PMO v3.

This registry is subordinate to `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`. If this registry conflicts with the PMO v3 operating model, the PMO v3 operating model controls.

## Current known truth

- Program #1255 is the active execution program. Cursor owns completion of its remaining work.
- Child project #1259 is open and active for Phase 4 execution; remaining tasks require per-task authorization.
- Priority #1 Website Completion / Fan Club Product Buildout is parked as program issue #1685 with child issues #1686 through #1694.
- Priority #2 Fundraiser / Charity Campaign Operations Buildout has program issue #1700 with child issues #1701 through #1708.
- Priority #3 PMO Governance / Workflow Automation Completion has program issue #1719 with child issues #1720 through #1727. PMO sync PR #1733 is currently draft/blocked and must not be treated as ready until review/CI are clean.
- Priority #4 Lou Gehrig Content Collection / Research Pipeline Expansion has program issue #1738 with child issues #1739 through #1746. It remains blocked from execution until explicit queue authorization.
- issue #1411 is completed historical planning evidence.
- issue #1500 is completed historical closeout-reliability evidence.
- issue #1696 completed Priority #2 planning documentation.
- issue #1713 completed Priority #3 planning documentation.
- issue #1736 is the Priority #4 planning/source issue.

## Execution chain

```text
PMO meeting issue → PMO Backlog review/update → program issue → project/task issue → PR → verification → closeout
```

## Active program

| Program issue | Name | Historical label | Status | Notes |
| --- | --- | --- | --- | --- |
| #1255 | Website Implementation and Content Operations | Program 2 | Active | Cursor owns remaining work; #1259 remains open/active |

## Queued / launch-control-ready programs

| Program issue | Backlog priority | Name | Status | First task | Launch rule |
| --- | ---: | --- | --- | --- | --- |
| #1685 | 1 | Website Completion / Fan Club Product Buildout | Parked launch-control ready | #1686 | Blocked until Atlas/Bill authorize Cursor to begin #1686 or reprioritize |
| #1700 | 2 | Fundraiser / Charity Campaign Operations Buildout | Launch-control ready / queued | #1701 | Blocked until Atlas/Bill authorize Cursor to begin #1701 |
| #1719 | 3 | PMO Governance / Workflow Automation Completion | Launch-control issues created; docs sync pending in draft #1733 | #1720 | Blocked until docs sync is clean and Atlas/Bill authorize Cursor to begin #1720 |
| #1738 | 4 | Lou Gehrig Content Collection / Research Pipeline Expansion | Launch-control ready / queued after this package merges | #1739 | Blocked until Atlas/Bill authorize Cursor to begin #1739 |

## Priority #4 child issue chain

| Task | issue | Title | Predecessor | Successor |
| ---: | ---: | --- | --- | --- |
| 001 | #1739 | Source discovery and intake inventory | #1738 launch authorization | #1740 |
| 002 | #1740 | Research queue and triage workflow | #1739 | #1741 |
| 003 | #1741 | Source credit and provenance model | #1739 and #1740 | #1742 |
| 004 | #1742 | Rights copyright privacy and publication review model | #1741 | #1743 |
| 005 | #1743 | Editorial conversion and website-ready content workflow | #1740 through #1742 | #1744 |
| 006 | #1744 | Admin and data-surface boundary review | #1739 through #1743 | #1745 |
| 007 | #1745 | AI-assisted research guardrails and automation candidate review | #1739 through #1744 | #1746 |
| 008 | #1746 | Program validation and operator handoff | #1739 through #1745 | terminal |

## Project 11 — Admin Page and Tools Design Readiness

Project 11 is an admin/tools review and design-readiness audit. It should inventory the existing admin page and tools, reconcile what Program #1255/#1258 already built, classify active/diagnostic/retired tools, identify token UX and failure-state gaps, and produce a PMO v3 readiness package before any admin implementation work.

Project 11 remains ahead of Priority #4 in backlog order, but Priority #4 may be launch-control ready while still blocked behind higher-priority queue decisions.

## Related references

- PMO Backlog: `docs/ops/pmo/pmo-backlog.md`
- Priority #4 readiness: `docs/ops/pmo/lou-gehrig-content-collection-expansion-readiness.md`
- Priority #4 implementation plan: `docs/ops/implementation-plans/lou-gehrig-content-collection-expansion.md`
