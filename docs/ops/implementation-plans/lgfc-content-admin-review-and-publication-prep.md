---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, admin implementers, and LGFC maintainers
Authority Level: Controlled
Owns: Admin review queue and publication-prep implementation sequence for post-#2273 work
Does Not Own: Runtime code, migrations, issue closure for #1738/#2073/#2040, or merge approval
Canonical Reference: /docs/reference/content/content-publication-prep-model.md
Project: lgfc-content-pipeline
Related issues: #2273, #2279, #2275, #2277, #2278
Last Reviewed: 2026-07-05
---

# LGFC Content Admin Review and Publication Prep

## Purpose

Ready-to-launch implementation package for admin review queues, audit history,
publication preparation, and safe public surfacing — without building runtime in
Program #2273.

## Predecessors

- #2275 canonical candidate model
- #2277 member submission intake model
- #2278 storage implementation path

## Smallest useful implementation sequence

| Order | Deliverable | Type |
| --- | --- | --- |
| 1 | D1 core tables + seed import | migration + script |
| 2 | Admin candidate list/detail API | read-only first |
| 3 | Review state transition API + audit events | write |
| 4 | Member submission review integration | queue + candidate link |
| 5 | Publication prep staging UI | `publication_candidates` |
| 6 | Editorial conversion bridge | candidate → inventory |
| 7 | Review transition tests | vitest + D1 fixtures |

## Admin review queues

| Queue | Data source | Primary actions |
| --- | --- | --- |
| Source review | `sources` | trust/block domain |
| Member submission review | `member_submissions`, `submission_queue` | consent, privacy, permission |
| Candidate item review | `content_items` | relevance, review_status |
| Media asset review | `media_assets`, `photos` | rights, linkage |
| Rights/privacy review | candidate rights + privacy columns | clearance |
| Publication eligibility | `publication_candidates` | target, credit, approve |
| Audit history | `moderation_events` | read-only trail |
| Deferred/rejected | filtered `content_items` | follow-up, purge prep |
| Duplicate review | `duplicate_of` not null | merge/reject |
| Purge/retention | queue + candidate rejected rows | quarterly prep |

## API route design (future)

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/admin/content-pipeline/candidates` | list/filter |
| GET | `/api/admin/content-pipeline/candidates/:id` | detail + events |
| POST | `/api/admin/content-pipeline/candidates/:id/review` | state transition |
| GET | `/api/admin/content-pipeline/sources` | source trust queue |
| POST | `/api/admin/content-pipeline/publication-prep` | stage for target |
| POST | `/api/admin/content-pipeline/convert-to-inventory` | editorial bridge |

Extend existing `/api/admin/editorial/*` rather than duplicating publish logic.

## Admin UI surfaces (future)

| Surface | Location | Notes |
| --- | --- | --- |
| Candidate review | `/admin/content-pipeline/candidates` | new section |
| Member submissions | `/admin/content-pipeline/member-submissions` | links queue |
| Publication prep | `/admin/content-pipeline/publication-prep` | staging |
| Audit log | `/admin/content-pipeline/audit` | read-only |

Align with Project 11 admin/tools design readiness.

## Review-state transition tests (specified)

| Test | Assertion |
| --- | --- |
| pending → approved_internal_reference | audit event written |
| pending → rejected | requires admin notes; no inventory created |
| approved_public_candidate without rights | blocked transition to approved_for_publish |
| member submission pending consent | cannot reach approved_for_publish |
| duplicate_of set | blocked from publication prep |
| convert to inventory | creates draft/published row with attribution |
| public API | never returns non-published inventory |

Use pilot seed fixtures + D1 test DB pattern from existing editorial tests.

## Safe public publication helper

Extend or wrap `publishedInventoryWhere()` — do not replace.

Future `getSafePublicationView()` may join inventory + publication_candidates
metadata but public routes remain inventory-gated.

## Successor recommendations for paused issues

| Issue | Recommendation after #2273 |
| --- | --- |
| **#1738** | Remain paused. Reusable docs absorbed into #2270/#2273 model. Reopen only if Bill/ChatGPT launch a merged "content collection operations" program that explicitly supersedes #2273 storage/admin child issues. |
| **#2073** | Remain paused as future advanced media/archive acquisition layer. Trigger after manual seed pilot and Phase D media upload are stable. |
| **#2040** | Remain paused as publication automation layer. Trigger after admin review queues (this plan) are implemented and publication prep is proven manual-first. |

**No modification, closure, or relabel of #1738, #2073, or #2040 in this program.**

## Launch authorization

Implementation child issues require Bill/ChatGPT launch authorization per LGFC
operating model. This plan is ready for child issue creation, not autonomous execution.

## Acceptance checklist

- [x] Admin review implementation plan ready for child tasks
- [x] Publication prep separated from publication
- [x] Public route safety explicit
- [x] Review transition tests specified
- [x] Smallest sequence identified
- [x] #1738/#2073/#2040 successor recommendations documented
