---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, implementation agents
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: CC-001 implementation envelope — shared content asset contract, gap matrix, allowlist, validation, and freeze rules for Content Collection successor program
Does Not Own: Canonical candidate/inventory/metadata authority, #2286 runtime code, feature UI routes, or merge authorization
Canonical Reference: /docs/reference/content/lgfc-content-candidate-model.md
Related Issues: #2433, #2431, #2432, #2361, #2359, #2360, #2286, #1738, #2273
Last Reviewed: 2026-07-20
---

# CC-001 Content Asset Model Package

## Purpose

Define the shared content asset contract consumed by Gallery, Library, Memorabilia, Club Newspaper, metadata/source-credit, and AI-ready tagging guardrails — **without duplicating** the completed #2286 runtime foundation or existing reference authority.

## Scope

**In scope:**

- Gap matrix between intake draft CC-001 and live repo reference/runtime surfaces.
- Downstream view contracts (Gallery, Library, Memorabilia, Club).
- State, visibility, and freeze-marker requirements.
- Repo-verified implementation paths and file allowlist.
- Validation commands and pass/fail criteria.
- #2433 contract-freeze evidence packet (prepared for Atlas verification).

**Out of scope:**

- Creating `docs/reference/website/content-collection/` (rejected per #2360 C7).
- Rebuilding #2286 candidate repository, admin API, member submission, media reference, publication-prep, audit, or retention layers.
- Gallery/Library/Memorabilia/Club route implementation (blocked until this contract is frozen and Atlas-verified).
- Self-approval or publication of the freeze marker (Atlas verifies).

## Current known truth

| Surface | Repo path | Role |
| --- | --- | --- |
| Candidate registry model | `docs/reference/content/lgfc-content-candidate-model.md` | Upstream candidate fields and promotion states (#2273) |
| Content inventory model | `docs/reference/website/content-inventory-model.md` | Story-centric D1 inventory requirements (#1256) |
| Lou Gehrig metadata schema | `docs/reference/website/lou-gehrig-content-metadata-schema.md` | Candidate metadata for provenance/rights |
| Unified workflow | `docs/reference/website/unified-content-workflow.md` | Editorial pipeline stages + CC-001 type/state/exposure contract |
| #2286 runtime libs | `functions/_lib/content-pipeline-*.ts`, `functions/_lib/content-inventory-*.ts` | Completed foundation — consume, do not rebuild |
| Intake draft (non-authority) | `_incoming/drive-drafts/content-collection/CC-001 … Draft.docx` on `atlas/drive-draft-intake-2367` | Planning input only |

**ChatGPT disposition (#2360):** CC-001 is `merge_into_existing` first. Any new file is a **delta/gap matrix** under this package path until ChatGPT freezes a supersession.

## #2286 inheritance rule

CC-001 **consumes** #2286. Classify every proposed change as one of:

1. **consume** — use existing capability as-is.
2. **narrow extension** — add fields/types required for final asset contract only.
3. **verified defect repair** — documented bug in #2286 surfaces.
4. **integration adapter** — thin mapping on top of existing runtime.

If the change cannot be classified, the package fails readiness. Stop and post `CHATGPT HANDOFF`.

### #2286 inheritance map (#2433)

| Surface | Classification | Disposition |
| --- | --- | --- |
| `functions/_lib/content-pipeline-candidate-constants.ts` | **consume** | Enums for `content_type`, review/rights/privacy/publication states, and publication targets remain canonical runtime enums |
| `functions/_lib/content-pipeline-candidate-repository.ts` | **consume** | Candidate persistence/API foundation — do not rebuild |
| `functions/_lib/content-pipeline-candidate-admin.ts` | **consume** | Admin review mutations — do not rebuild |
| `functions/_lib/content-pipeline-member-submission-intake.ts` | **consume** | Member intake → candidate/queue path |
| `functions/_lib/content-pipeline-media-reference.ts` | **consume** | Media reference block for candidates |
| `functions/_lib/content-pipeline-publication-prep.ts` | **consume** | Publication prep / conversion gate |
| `functions/_lib/content-inventory-public.ts` | **consume** | Public/member published-inventory eligibility (`status`, `allowed_sections`, credit/source) |
| `functions/_lib/content-inventory-media.ts` | **consume** | Story–media association helpers |
| `functions/_lib/content-inventory-club-home.ts` | **consume** | Club Home inventory reads |
| `functions/_lib/content-inventory-rotation.ts` | **consume** | Rotation ranking for published inventory |
| Cross-lane `asset_type` view labels | **integration adapter** | Documented mapping only — no parallel enum in #2286 constants |
| Downstream Gallery/Library/Memorabilia/Club field lists | **integration adapter** | View contracts map to existing candidate/inventory/`photos` fields |
| SEO (`seo_title`, `seo_description`, `index_policy`) | **narrow extension** deferred | Explicitly deferred to Metadata lane / feature packages — not in this freeze |
| Memorabilia/gallery grouping relations beyond `duplicate_of` / inventory alternates | **narrow extension** deferred | Minimum relations frozen; grouping deferred to feature packages |

**No verified defect repairs** are authorized under #2433. Runtime code is unchanged.

## Gap matrix (draft CC-001 vs repo authority) — #2433 disposition

| CC-001 draft concept | Existing authority | Disposition |
| --- | --- | --- |
| `asset_type` taxonomy (`gallery_image`, `library_entry`, `memorabilia_item`, `club_article`, …) | `content_type` in candidate model; inventory story types; publication targets | **Resolved** — cross-lane mapping table in this package and `unified-content-workflow.md`; adapter labels only |
| Base identity fields (`id`, `slug`, `title`, `summary`, `status`) | candidate + inventory models | **Resolved** — field names verified below; inventory uses `id`/`tag` (slug role) / `title` / `summary` / `status` |
| Source/provenance block | metadata schema + provenance model | **Resolved (covered)** — detail freeze owned by CC-002 (#2434); CC-001 requires provenance fields present before public/member display |
| Rights/privacy/publication block | rights model + candidate `rights_status` / `privacy_flag` | **Resolved (covered)** — enum alignment uses #2286 constants; CC-002 owns rights-display enforcement detail |
| Media block | `content-pipeline-media-reference.ts`, inventory media association | **Resolved — consume #2286** |
| Metadata/SEO (`seo_title`, `seo_description`, `index_policy`) | partial in inventory/search fields | **Explicitly deferred** — Metadata lane / GAL/LIB/MEM packages; deferred-work D-001 adjacent AI tagging remains deferred |
| Relations (`candidate_id`, `parent_asset_id`, `related_asset_ids`) | candidate model + inventory alternates | **Resolved (minimum)** — `candidate_id`, `duplicate_of`, inventory `tag`/canonical alternates, `content_inventory_id` / `submission_queue_id`; parent/related asset grouping deferred to feature packages |
| Operational (`validation_status`, `retention_status`, `soft_deleted_at`) | #2286 retention/soft-delete | **Resolved — consume #2286** |
| State model (draft → published → archived) | candidate `review_status` + inventory publication states | **Resolved** — unified cross-lane state diagram in this package and `unified-content-workflow.md` |
| Visibility (`private_admin`, `member_only`, `public`, …) | rights model + inventory filters + `content-inventory-public` helper | **Resolved** — single cross-lane exposure contract below |
| Downstream view contracts | fanclub design docs; club-home how-to | **Resolved** — per-surface field consumption lists + repo field mappings below |

Unresolved C3 conflicts: **none**.

## Cross-lane content type / asset type mapping

`asset_type` is a **view label** for downstream lanes. It does not replace candidate `content_type` or inventory `story_type`. Runtime remains #2286 `CONTENT_PIPELINE_CONTENT_TYPES` + `CONTENT_PIPELINE_PUBLICATION_TARGETS`.

| Downstream `asset_type` (view) | Primary candidate `content_type` values | Primary publication target(s) | Durable store after promotion |
| --- | --- | --- | --- |
| `gallery_image` | `photo`, `artifact` (when visual) | `gallery` | `photos` (+ optional inventory media association) |
| `library_entry` | `story`, `article`, `biography_note`, `record`, `quote`, `timeline_fact` | `library`, `article`, `biography`, `timeline` | `content_inventory` (`allowed_sections` includes `library`) |
| `memorabilia_item` | `artifact`, `photo` | `memorabilia` | `photos` with memorabilia filter / related inventory |
| `club_article` | `story`, `article`, `quote` | `homepage_feature`, `newsletter`, `article` | `content_inventory` (`allowed_sections` includes `club_home`) |
| `internal_reference_only` | any | `internal_reference_only` / review-only | candidate registry / admin only — never public |

Mapping rules:

1. One candidate may map to at most one primary `asset_type` for a given publication target decision.
2. Feature lanes consume the view contract for their `asset_type`; they do not invent parallel `content_type` enums.
3. Legacy `photos` catalog rows without candidate linkage remain operator-managed approved content until a feature child issue authorizes governed-field migration.

## Base identity field verification

| Contract concept | Candidate registry | `content_inventory` | `photos` (gallery/memorabilia) |
| --- | --- | --- | --- |
| Stable id | `candidate_id` | `id` | `id` |
| Slug / grouping key | n/a (future); tags arrays | `tag` | category/tag filters as implemented |
| Title | `title` | `title` | `title` |
| Summary / description | `summary` | `summary` / `text` | `description` |
| Lifecycle status | `review_status` + `publication_status` | `status` (`draft`/`published`/`archived`) | no status column — treat as operator-approved catalog |

## Unified cross-lane state model

States remain **orthogonal** on the candidate registry. Inventory uses a separate publication status. Surfaces never read raw candidates.

```text
Candidate intake
  review_status: pending_review → (approved_* | deferred_* | rejected | private_internal_only)
  publication_status: not_ready → draft_candidate → staged → approved_for_publish
        ↓ editorial conversion (human)
content_inventory.status: draft → published → archived
        ↓ public/member eligibility
Surface render only when published + attribution + section + exposure rules pass
```

Cross-lane summary:

| Lane-visible lifecycle | Candidate gate | Inventory / catalog gate |
| --- | --- | --- |
| Draft / not ready | `publication_status` in `not_ready`, `draft_candidate` | `status = draft` or no inventory row |
| Staged / preview | `publication_status = staged` | operator preview only — not public helpers |
| Published | `publication_status = published` + inventory link | `status = published` (+ credit/source/section) |
| Unpublished / archived | `unpublished` / `archived` | `archived` or withdrawn; excluded from public helpers |

## Visibility and public/private exposure contract

Exposure is a **derived eligibility class**, not a new persisted enum replacing rights/privacy columns.

| Exposure class | Meaning | Eligibility rule |
| --- | --- | --- |
| `private_admin` | Admin/operator only | Candidate or queue row; or inventory `draft`; never returned by `content-inventory-public` helpers |
| `member_only` | Authenticated Fan Club surfaces | Published inventory/catalog rows on `/fanclub/**` that pass member session gates; still require credit/source where inventory-backed |
| `public` | Public website surfaces | Published inventory only; `status = published`; non-empty `source_name` + `credit_line`; matching `allowed_sections`; no blocked rights/privacy at conversion |
| `internal_reference_only` | Research/citation, no reproduction | Candidate `review_status` / publication target `internal_reference_only` or citation-only rights — never public route payload |

Hard rules (consume existing helpers and references):

1. Public routes **must not** query the candidate registry (`lgfc-content-candidate-model.md` public route safety).
2. Published inventory eligibility is enforced by `publishedInventoryWhere` in `functions/_lib/content-inventory-public.ts`.
3. Gallery/Memorabilia today are **member-only** catalog reads (`photos`); public gallery is out of scope until an authorized feature issue changes that boundary.
4. Automatic public publication remains **forbidden** (program boundary).
5. Rights/privacy detail and display-credit enforcement freeze remain **CC-002 (#2434)** before public/member display field enforcement changes.

## Downstream view contracts

Feature lanes must consume only governed fields. Minimum consumption and repo field mapping:

### Gallery (`asset_type = gallery_image`)

| Contract field | Repo source (consume / adapt) |
| --- | --- |
| `id` | `photos.id` |
| `title` | `photos.title` |
| `media_url` | B2/public URL builders from photo storage fields |
| `media_alt_text` | title/alt as implemented; governed alt when feature PR authorizes |
| `media_caption` | `description` / caption fields when present |
| `media_credit` | photo credit / `uploaded_by` until CC-002 display mapping |
| `source_credit` | `credit_line` / source fields when associated via inventory media |
| scoped tags/categories | photo tags API |
| visibility / exposure | member-only route today; `member_only` class |

### Library (`asset_type = library_entry`)

| Contract field | Repo source |
| --- | --- |
| `id` | `content_inventory.id` |
| `title` | `title` |
| `summary` | `summary` / excerpt mapping in public helpers |
| `source_name` | `source_name` (required for publish) |
| `source_credit` | `credit_line` |
| citation/provenance | candidate/metadata fields at conversion; CC-002 detail |
| tags/categories | `tag`, topic-derived `search_text` |
| date/era | `event_date` / `event_year` |
| detail route | library route when scoped |
| visibility / exposure | `member_only` or `public` per `allowed_sections` + published rules |

### Memorabilia (`asset_type = memorabilia_item`)

| Contract field | Repo source |
| --- | --- |
| `id` | `photos.id` (memorabilia filter) |
| `title` | `title` |
| `description` | `description` |
| media reference | photo media URL fields |
| category | memorabilia category/tag filters |
| date/era | date fields when present / related inventory |
| `source_credit` | credit/source mapping (CC-002 for display enforcement) |
| `provenance_note` | provenance notes from candidate/metadata at conversion |
| tags | photo/inventory tags |
| visibility / exposure | member-only today |

### Club Newspaper (`asset_type = club_article`)

| Contract field | Repo source |
| --- | --- |
| `id` | `content_inventory.id` (club-home helpers) |
| `title` | `title` |
| summary/body | `summary` / `text` |
| media reference | `content_inventory_media` / associated media |
| block type | Club Home module / placement metadata |
| date/era | `event_date` / `event_year` |
| source/credit when derived | `source_name` / `credit_line` |
| display priority | `priority` / rotation fields |
| visibility / exposure | member Club Home; published + `club_home` section |

## Freeze marker (blocks feature work)

Until Atlas verifies and posts acceptance, **P2/P3/P4/P5 feature implementation must not start**:

```text
CONTRACT-FROZEN: content-asset-model v1
```

### Freeze evidence packet (PREPARED — not self-approved)

```text
CONTRACT-FROZEN: content-asset-model v1
Status: PREPARED — awaiting independent Atlas verification (Cursor must not self-approve)
source issue: #2433
package path: docs/ops/implementation-plans/content-collection/packages/cc-001-content-asset-model-package.md
merged PR reference: pending component merge of this child PR (fill SHA after merge)
fields included:
  - cross-lane asset_type ↔ content_type / publication_target mapping
  - base identity field verification (candidate / inventory / photos)
  - unified cross-lane state model (candidate orthogonal states → inventory status → surface)
  - visibility / exposure classes (private_admin, member_only, public, internal_reference_only)
  - downstream view contracts for Gallery, Library, Memorabilia, Club Newspaper
  - #2286 inheritance map (consume / adapter / deferred narrow extensions)
downstream lanes released: NONE — P2 Gallery, P3 Library, P4 Memorabilia, P5 Club remain blocked until Atlas verifies this freeze and CC-002 (#2434) completes as required
known limitations:
  - SEO metadata fields deferred to Metadata lane / feature packages
  - parent/related asset grouping beyond minimum relations deferred to feature packages
  - Gallery/Memorabilia remain member-only catalog (`photos`) until authorized feature work
  - Rights/provenance display enforcement detail owned by CC-002 (#2434)
  - No runtime/#2286 code changes in this freeze PR
ChatGPT verification request: Verify gap matrix dispositions, inheritance classifications, exposure rules, and whether the freeze marker may be posted on #2433 / #2431
```

CC-002 depends on CC-001 freeze for downstream public/member display lanes.

## Repo-verified implementation surfaces

| Kind | Verified paths |
| --- | --- |
| Reference (canonical — update only when child issue authorizes) | `docs/reference/content/lgfc-content-candidate-model.md`, `docs/reference/website/content-inventory-model.md`, `docs/reference/website/lou-gehrig-content-metadata-schema.md`, `docs/reference/website/unified-content-workflow.md` |
| Package envelope (this doc) | `docs/ops/implementation-plans/content-collection/packages/cc-001-content-asset-model-package.md` |
| Shared libraries | `functions/_lib/content-pipeline-*.ts`, `functions/_lib/content-inventory-*.ts` |
| Migrations | `migrations/*content*` (only when migration child issue authorizes) |
| Tests | `tests/*content-pipeline*`, `tests/*content-asset*` (create when code changes authorize) |

**Hot zones — do not touch without explicit approval:**

- `src/app/fanclub/photo/**`, `src/app/fanclub/library/**`, `src/app/fanclub/memorabilia/**`, `src/app/fanclub/page.tsx`
- `.github/workflows/**`, `scripts/ci/**`, `functions/_middleware.ts`, `src/app/layout.tsx`

## File allowlist (CC-001 implementation child issue)

Copy into child issue before edits:

```text
docs/reference/content/lgfc-content-candidate-model.md
docs/reference/website/content-inventory-model.md
docs/reference/website/lou-gehrig-content-metadata-schema.md
docs/reference/website/unified-content-workflow.md
docs/ops/implementation-plans/content-collection/packages/cc-001-content-asset-model-package.md
functions/_lib/content-pipeline-*.ts
functions/_lib/content-inventory-*.ts
migrations/*content*
tests/*content-asset*
tests/*content-pipeline*
```

Note: use `migrations/*content*` consistently (covers `content_asset` and related migration names).

## Parallel execution control

| Field | Value |
| --- | --- |
| `parallel_safe` | `false` for dependent feature implementation |
| `max_active_tasks_in_lane` | 1 |
| `contract_dependency` | none (CC-001 is root contract) |
| `required_freeze_marker` | `CONTRACT-FROZEN: content-asset-model v1` before P2/P3/P4/P5 feature code |
| `prohibited_parallel_lanes` | Gallery, Library, Memorabilia, Club implementation until freeze verified |

## Validation plan

**What to verify:**

- Gap matrix resolved or explicitly deferred with issue/deferred-work link.
- #2286 surfaces consumed, not duplicated.
- View contracts documented for all four downstream surfaces.
- Public/private exposure rules explicit.
- State model documented.

**Commands (docs-only package review):**

```bash
bash scripts/ci/docs_check_headers.sh
node scripts/ci/diataxis_folder_audit.mjs
node .agents/checks/agent-governance-check.mjs
```

**Commands (code implementation child issue):**

```bash
npm run typecheck
npm test -- --run tests/content-pipeline*
npm test -- --run tests/content-asset*
```

**Pass:** Contract complete, stable, gap matrix has no unresolved C3 conflicts, freeze evidence prepared for Atlas; feature lanes remain blocked until Atlas verifies.

**Fail:** Duplicates #2286, lacks exposure rules, or downstream lanes cannot consume contract — stop dependent lanes.

## PR closeout requirements

Implementation PR must include:

- Source issue and package path.
- #2286 inheritance statement.
- File allowlist adherence.
- Gap matrix updates (if canonical refs changed).
- Validation evidence.
- Freeze marker status (`PREPARED` until Atlas verifies).
- As-built doc path.

## Procedure

1. Read #2360 audit and this package.
2. Re-verify all canonical reference paths exist on the component branch / `main`.
3. Resolve gap matrix items or record explicit deferrals (deferred-work register / successor issues).
4. Implement only within child-issue allowlist.
5. Prepare freeze evidence packet; do not self-approve.
6. Request ChatGPT/Atlas review before releasing downstream feature lanes.

## Acceptance criteria

- [x] Content asset contract documented with repo-verified paths.
- [x] #2286 inheritance respected in plan and implementation (#2433 docs freeze — consume/adapter only).
- [x] Downstream view contracts exist for Gallery/Library/Memorabilia/Club.
- [x] Public/private exposure model explicit.
- [x] Validation commands and evidence requirements defined.
- [x] Freeze marker evidence prepared; feature work remains blocked until Atlas verifies.
- [x] No parallel SOT created under rejected `content-collection/` reference tree.
