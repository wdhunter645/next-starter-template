---
Doc Type: Reference
Audience: LGFC editors, operators, maintainers, and AI implementation agents
Authority Level: Controlled
Owns: Unified editorial workflow from member intake through publication and surface placement for Priority #1
Does Not Own: Runtime implementation, D1 migrations, B2 configuration, route behavior, or issue closure
Canonical Reference: /docs/explanation/website/content-strategy.md
Related issues: #1689, #1685, #1256, #1686, #1687
Last Reviewed: 2026-06-23
---

# Unified Content Workflow

## Purpose

This reference defines one editorial workflow for the Website Completion / Fan Club
Product Buildout program. It reconciles **content collection** (upstream intake
and source/credit capture) with **content management** (review, approval,
publication, and placement).

Content collection is not a separate peer workflow. It is the intake layer inside
content management, as resolved in
`docs/ops/pmo/website-completion-fan-club-product-buildout-readiness.md`.

## Scope

This reference covers:

- intake actors and surfaces (member submit, editor draft);
- `submission_queue` review and disposition;
- publication into `content_inventory` and media associations;
- placement via `allowed_sections` and rotation metadata;
- public and Fan Club surface eligibility;
- lane routing among editorial, CMS, moderation, and discussions;
- legacy `photos` catalog policy and deferred binary upload.

This reference does not authorize code, migration, workflow YAML, or production
configuration changes.

## Current Known Truth

- `submission_queue` is the member and editor intake staging table before
  publication.
- `content_inventory` is the approved editorial archive for published stories.
- Members may write `submission_queue` through `POST /api/library/submit`; they
  do not write `content_inventory` or `photos` directly.
- `POST /api/library/submit` accepts text fields and optional `media_url` /
  `media_reference` strings; binary upload to B2 is not implemented on the member
  path.
- `photos` rows power the Photo Gallery and Memorabilia surfaces; the table has
  no approval/status column. Existing catalog rows are treated as
  operator-managed approved content.
- Admin editorial APIs under `functions/api/admin/editorial/**` own review,
  publish, inventory, and media-association operations.
- CMS blocks and `page_content` own reusable copy blocks and slug-based page
  sections; they are not substitutes for story inventory.

## Intended Final State

Operators and implementation agents can route any content item through one
documented pipeline without inferring boundaries from legacy planning names or
conflicting route manifests.

## Workflow Stages

| Stage | Store / surface | Actor | Outcome |
| --- | --- | --- | --- |
| 1. Intake | `submission_queue` (pending) | Member (`/fanclub/submit`) or editor | Raw submission with source/credit fields captured |
| 2. Triage | `submission_queue` (triaged) | Editor / admin | Objective checks recorded; duplicates flagged |
| 3. Review | `submission_queue` | Editor / admin | Factual/editorial decision recorded |
| 4. Publication | `content_inventory` (+ optional `content_inventory_media`) | Editor / admin | Approved story published with placement metadata |
| 5. Placement | `allowed_sections`, `priority`, rotation fields | Editor / admin | Story eligible for homepage, library, `club_home`, search, etc. |
| 6. Public render | Website / Fan Club surfaces | Runtime (read-only) | Published inventory only; no direct queue reads |

Rejected queue items remain excluded from public surfaces until quarterly purge
eligibility is met per editorial policy.

## Actor Responsibilities

| Actor | May write | May not write |
| --- | --- | --- |
| Member (authenticated) | `submission_queue` via `POST /api/library/submit`; discussions per discussion policy | `content_inventory`, `photos`, admin editorial tables |
| Editor / admin | `submission_queue`, `content_inventory`, media associations, placement fields | Autonomous publish without review on member submissions |
| Runtime (public/member APIs) | none | any editorial table |

## Lane Routing

Use this table before opening the wrong admin surface.

| Content type | Primary lane | Admin entry | Notes |
| --- | --- | --- | --- |
| Member story / note submission | Editorial intake | `/admin/editorial` review queue | Starts in `submission_queue` |
| Editor-authored inventory draft | Editorial | `/admin/editorial` inventory | May skip queue when created as draft inventory per policy |
| CMS block or slug page copy | CMS / page content | `/admin/cms`, `/admin/content` | Not `content_inventory` |
| Photo/memorabilia catalog row (legacy) | Media + editorial | `/admin/media`, `/admin/editorial` | Legacy `photos` rows; new photo stories via queue → inventory → association |
| FAQ, Ask Lou, member reports | Moderation | `/admin/moderation`, `/admin/faq` | Separate from editorial archive |
| Live discussions | Discussions API | moderation follow-up only | Not a publication path into `content_inventory` |

## Source and Credit Requirements

| Stage | Required fields | Rule |
| --- | --- | --- |
| Member intake | `name`, `title`, `content`; `source_name`, `source_url`, `credit_line` strongly encouraged | Submitter email is derived from session, not client input |
| Queue review | completeness check on source/credit | Editors reject or hold incomplete attributions before publish |
| Publication | source/credit on inventory record | Public and Fan Club surfaces display attribution where required |
| Media association | `content_inventory_media` role + attribution | Binary object stays in B2/`photos`; D1 owns linkage |

## Photo and Memorabilia Policy

### Legacy catalog (`photos`)

- Existing `photos` rows are operator-managed catalog content.
- No `photos.status` column exists; do not infer member-submission approval from
  gallery presence alone.
- Photo Gallery (`/fanclub/photo`) and Memorabilia (`/fanclub/memorabilia`) read
  published catalog rows under current API filters.

### New member-contributed visual content

- Text intake is available today through `/fanclub/submit` → `POST /api/library/submit`.
- Binary photo or PDF upload to B2 is **deferred** until a later implementation
  task authorizes media intake (Task 004 disposition: document only).
- When binary intake is implemented, the path remains queue → editorial review →
  inventory and/or controlled promotion into `photos` — never direct member write
  to `photos`.

## Public and Fan Club Surface Eligibility

| Surface | Primary data authority | Eligibility rule |
| --- | --- | --- |
| Homepage sections | `content_inventory` | `status = published` and matching `allowed_sections` |
| Fan Club library | `content_inventory` (fallback `library_entries`) | published + `library` section |
| Club Home modules | `content_inventory`, `page_content`, `photos` | see Club Home slot map in `editorial-placement-and-rotation.md` |
| Photo Gallery | `photos` | catalog rows per API filters |
| Memorabilia | `photos` + related inventory | `is_memorabilia` and related-story joins |
| Search | `content_inventory` | published + `search` section |

## Relationship to Other Programs

| Program / name | Relationship |
| --- | --- |
| Program `#1256` Content Strategy / Editorial Inventory | Schema and editorial model authority; this doc extends Priority #1 intake/placement boundaries |
| Program `#1258` Website Operations / Admin | Operational runbooks; does not reopen `#1256` design |
| Priority #4 Lou Gehrig Content Collection Expansion | Future large-scale external/AI ingestion; **not** normal member/editorial intake |
| Legacy `docs/explanation/lgfc-content-collection-strategy.md` | Superseded for website authority by `content-strategy.md` and this reference |

## Cross-References

- Strategy rationale: `docs/explanation/website/content-strategy.md`
- Field definitions: `docs/reference/website/content-inventory-model.md`
- Placement registry: `docs/reference/website/editorial-placement-and-rotation.md`
- Member submit procedure: `docs/how-to/website/member-content-submission.md`
- Editor review procedure: `docs/how-to/website/review-content-submission.md`
- Task 004 reconciliation report: `docs/ops/reports/website-content-workflow-reconciliation.md`
- Architecture inventory: `docs/reference/architecture/fan-club-data-surface-inventory.md`
