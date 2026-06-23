---
Doc Type: Report
Audience: Bill, Atlas, operators, and AI implementation agents
Authority Level: Operational Evidence
Owns: Task 008 handoff evidence for Program #1685 content operations package
Does Not Own: Program closeout (#1694) or parent issue closure (#1685)
Canonical Reference: /docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md
Related issues: #1693, #1685, #1689, #1690, #1691, #1692
Last Reviewed: 2026-06-23
---

# Website Completion — Task 008 Handoff Evidence

## Purpose

Record operator and Cursor handoff deliverables for Task 008 and map them to
completed task evidence from Tasks 004–007.

## Scope

This report lists documentation added in Task 008 and cross-references
implementation evidence—it does not re-implement runtime behavior.

## Current known truth

- Program #1685 Tasks 004–007 delivered unified workflow docs, Club Home dynamic integration, backend deltas, and member subpage alignment.
- Task 008 adds operator and Cursor handoff documents only; no application code changes.
- Program closeout remains Task #1694 with parent issue #1685 open pending Bill/Atlas acceptance.

## Task 008 Deliverables

| Document | Role |
| --- | --- |
| `docs/how-to/website/club-home-content-operations-runbook.md` | Operator procedure for Club Home publish and member-surface verification |
| `docs/reference/website/cursor-club-home-content-handoff.md` | Cursor safe-edit matrix and fail-closed rules |
| `docs/ops/reports/website-completion-task-008-handoff.md` | This evidence record |

## Cross-Reference Matrix (Tasks 004–007)

| Task | issue | Evidence consumed by handoff |
| --- | --- | --- |
| 004 | #1689 | `docs/reference/website/unified-content-workflow.md`, `docs/how-to/website/member-content-submission.md` |
| 005 | #1690 | `GET /api/fanclub/home`, Club Home components, `tests/fanclub-home-dynamic.test.tsx` |
| 006 | #1691 | Profile API, photo tags API, `club_home` inventory API key, migration `0039_members_profile_fields.sql` |
| 007 | #1692 | Gehrig Library / Memorabilia Archive UI, server `q` search, photo tag pills, related stories on memorabilia |

## Current Implementation Summary

- **Club Home:** Dynamic sections read published `club_home` inventory with static fallback (Task 005).
- **Library:** Server-side search via `q` on `/api/fanclub/library` (Tasks 006–007).
- **Photos:** Tag facet API and pill filters on gallery (Tasks 006–007).
- **Memorabilia:** Server-side search and `related_library_entries` render (Tasks 006–007).
- **Workflow:** Single unified editorial pipeline documented in Task 004 reference.

## Accepted Limitations

1. Member binary upload remains text/reference-only on submit path.
2. Homepage inventory sections (`homepage_*`) remain deferred per surface validation tests.
3. Admin UI must stay aligned with API `allowed_sections` keys (`club_home` included in API; operators should confirm UI checkbox on deploy branch).

## Deferred to Task 009

- Consolidated program validation report for Tasks 001–008.
- Bill/Atlas acceptance and parent issue #1685 closeout decision.

## Validation Performed (Task 008)

- Documentation headers follow `docs/templates/markdown-header-template.md`.
- How-to runbook includes **Steps** and **Procedure** sections.
- Canonical references point to existing repository paths on this branch.
- Cross-check against Tasks 004–007 evidence files (no chat-history inference).
