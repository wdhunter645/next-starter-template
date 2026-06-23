---
Doc Type: Operations
Audience: Bill, Atlas, Cursor, LGFC maintainers, and implementation agents
Authority Level: Controlled
Owns: Task 004 reconciliation report for content management and collection workflow unification
Does Not Own: Application code, migrations, issue closure, labels, or merge approval
Canonical Reference: /docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md
Related issues: #1689, #1685, #1686, #1687
Last Reviewed: 2026-06-23
---

# Website Content Workflow Reconciliation (Task 004)

## Purpose

This report is the Task 004 deliverable for source issue `#1689`.

It reconciles content management and content collection into one documented
editorial workflow for Priority #1 and records decisions needed by Tasks 005, 006,
and 008.

## Scope

Writable scope for this task:

- `docs/explanation/website/**`
- `docs/reference/website/**`
- `docs/how-to/website/**`
- `docs/tutorials/website/**`
- `docs/ops/reports/**`

Out of scope:

- application code;
- D1 migrations and B2 configuration;
- workflow YAML changes;
- issue closure or merge actions.

## Source Authority Cross-Check

| Source | Role |
| --- | --- |
| `website-completion-fan-club-product-buildout.md` | Task 004 objective and acceptance criteria |
| `website-completion-fan-club-product-buildout-readiness.md` | Content collection subordination to content management |
| `website-content-strategy-editorial-inventory.md` (#1256) | Editorial model and schema authority |
| `website-operations-admin.md` (#1258) | Admin ops boundary (does not reopen #1256 design) |
| `website-completion-fan-club-product-gap-review.md` (#1686) | G-011, G-014, G-019 gap IDs |
| `website-completion-fan-club-backend-reconciliation.md` (#1687) | B-002, B-006, B-007 dispositions |
| `fan-club-data-surface-inventory.md` | Runtime data-surface inventory (read-only cross-check) |

## Decision Summary

| Topic | Decision | Evidence |
| --- | --- | --- |
| Content collection naming | Upstream intake layer inside content management; not a standalone peer program for Priority #1 | Readiness doc §Content collection strategy relationship |
| Unified workflow authority | `docs/reference/website/unified-content-workflow.md` | Created in this task |
| Member intake surface | `/fanclub/submit` → `POST /api/library/submit` → `submission_queue` | `functions/api/library/submit.ts` |
| Text vs binary intake | Text intake supported; binary photo/PDF upload deferred | B-007 blocked → documented deferral |
| Photo approval model | No `photos.status` column; legacy catalog operator-approved; new visuals via queue → editorial publish | B-006 deferred; G-014 blocked → resolved in docs |
| Club Home placement | Register `club_home` in `allowed_sections`; slot map documented for Task 005 | `editorial-placement-and-rotation.md` update |
| CMS vs inventory on Club Home | Module ownership table: copy blocks in `page_content`; stories in `content_inventory`; catalog features in `photos` | `unified-content-workflow.md`, `admin-cms-and-page-content.md` |
| Extra Fan Club routes | `/fanclub/submit`, `/fanclub/chat`, `/fanclub/membercard` documented as transitional until Task 007 navigation reconciliation | G-006 blocked; membercard addressed in Task 003 |
| Priority #4 expansion | External/AI large-scale collection is out of scope for this workflow | `lou-gehrig-content-collection-expansion-readiness.md` |

## Conflict Reconciliation Table

| Conflict | Before | Resolution | Follow-on task |
| --- | --- | --- | --- |
| Standalone "content collection strategy" | Appeared as PMO peer / backlog rank 12 | Subordinated to content management intake layer | #1690 docs absorb normal intake; #1736 remains Priority #4 |
| `club_home` missing from placement registry | Program 3 draft used `club_home`; reference registry omitted it | Added `club_home` and Club Home slot map | Task 005 dynamic integration |
| Photo approval column | Design expects approved photos; no DB column | Document legacy catalog policy; new content via queue only | Task 006 if schema change authorized |
| Submit a Photo CTA vs text submit | Design photo CTA; as-built text queue | Document text-only intake; binary deferred | Future media intake task |
| Legacy doc tree | `lgfc-content-collection-strategy.md`, `content-inventory-design-spec.md` | Website authority is `docs/**/website/*`; legacy named as superseded in unified reference | No file change outside allowlist |
| Task 004 label collision | Same task number across programs | This report is **Program #1685 Task 004** (`#1689`), not #1256/#1258 Task 004 | N/A |

## Gap Disposition (Tasks 001–002)

| Gap / backlog ID | Classification | Task 004 disposition |
| --- | --- | --- |
| G-011 Club Home dynamic sourcing | blocked | Placement rules and `club_home` registry documented; aggregator remains Task 005 (B-002) |
| G-014 Photo approval/source | blocked | Legacy catalog policy + queue path documented (B-006 deferred) |
| G-019 Member submissions | blocked | Unified intake doc + member how-to; binary upload deferred (B-007) |
| B-002 Club Home aggregator API | blocked | Unblocked for implementation after this doc merge |
| B-006 Photo approval column | deferred | Explicitly not required for Task 004 docs |
| B-007 Binary photo upload | blocked | Documented deferral; no schema/API change in Task 004 |

## Deliverables Produced

| Path | Action |
| --- | --- |
| `docs/reference/website/unified-content-workflow.md` | created |
| `docs/how-to/website/member-content-submission.md` | created |
| `docs/ops/reports/website-content-workflow-reconciliation.md` | created (this report) |
| `docs/explanation/website/content-strategy.md` | updated — intake layer section |
| `docs/reference/website/editorial-placement-and-rotation.md` | updated — `club_home` registry |
| `docs/reference/website/content-inventory-model.md` | updated — workflow pointer |
| `docs/how-to/website/fanclub-operational-workflows.md` | updated — submit lane alignment |
| `docs/how-to/website/review-content-submission.md` | updated — member intake cross-link |
| `docs/how-to/website/admin-editorial-archive-operations.md` | updated — member queue entry |
| `docs/how-to/website/admin-cms-and-page-content.md` | updated — Club Home module boundary |
| `docs/tutorials/website/editor-first-story.md` | updated — member submission branch |

## Handoff

| Successor | Needs from Task 004 |
| --- | --- |
| Task 005 (#1690) — dynamic Club Home integration | `club_home` placement keys, slot ownership, published-only reads |
| Task 006 (#1691) — backend deltas | Respect B-006/B-007 deferrals unless new issue authorizes schema/media intake |
| Task 008 (#1693) — operator workflow | Unified lane routing table and member submit how-to |

## Validation

- Documentation headers added or updated on all changed files.
- How-to files include `## Steps` and `## Procedure`.
- Reference files remain non-procedural except bounded field tables.
- Cross-links resolve within the branch for all new paths listed above.
