---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, implementation agents
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: CC-001 implementation envelope — shared content asset contract, gap matrix, allowlist, validation, and freeze rules for Content Collection successor program
Does Not Own: Canonical candidate/inventory/metadata authority, #2286 runtime code, feature UI routes, or merge authorization
Canonical Reference: /docs/reference/content/lgfc-content-candidate-model.md
Related Issues: #2361, #2359, #2360, #2286, #1738, #2273
Last Reviewed: 2026-07-08
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

**Out of scope:**

- Creating `docs/reference/website/content-collection/` (rejected per #2360 C7).
- Rebuilding #2286 candidate repository, admin API, member submission, media reference, publication-prep, audit, or retention layers.
- Gallery/Library/Memorabilia/Club route implementation (blocked until this contract is frozen).

## Current known truth

| Surface | Repo path | Role |
| --- | --- | --- |
| Candidate registry model | `docs/reference/content/lgfc-content-candidate-model.md` | Upstream candidate fields and promotion states (#2273) |
| Content inventory model | `docs/reference/website/content-inventory-model.md` | Story-centric D1 inventory requirements (#1256) |
| Lou Gehrig metadata schema | `docs/reference/website/lou-gehrig-content-metadata-schema.md` | Candidate metadata for provenance/rights |
| Unified workflow | `docs/reference/website/unified-content-workflow.md` | Editorial pipeline stages |
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

## Gap matrix (draft CC-001 vs repo authority)

| CC-001 draft concept | Existing authority | Gap / action |
| --- | --- | --- |
| `asset_type` taxonomy (`gallery_image`, `library_entry`, `memorabilia_item`, `club_article`, …) | `content_type` in candidate model; inventory story types | **Gap** — cross-lane type map not unified in one reference; document mapping table in implementation PR or enrich `unified-content-workflow.md` when authorized |
| Base identity fields (`id`, `slug`, `title`, `summary`, `status`) | candidate + inventory models | **Mostly covered** — verify field names at implementation time |
| Source/provenance block | metadata schema + provenance model | **Covered** — see CC-002 package |
| Rights/privacy/publication block | rights model + candidate `rights_status` / `privacy_flag` | **Covered** — enum alignment may need narrow delta |
| Media block | `content-pipeline-media-reference.ts`, inventory media association | **Consume #2286** |
| Metadata/SEO (`seo_title`, `seo_description`, `index_policy`) | partial in inventory/search fields | **Gap** — feature-lane SEO contract deferred to Metadata lane; document in GAL/LIB/MEM packages |
| Relations (`candidate_id`, `parent_asset_id`, `related_asset_ids`) | candidate model + inventory alternates | **Partial** — relationship model for memorabilia/gallery grouping not fully specified |
| Operational (`validation_status`, `retention_status`, `soft_deleted_at`) | #2286 retention/soft-delete | **Consume #2286** |
| State model (draft → published → archived) | candidate `review_status` + inventory publication states | **Gap** — unified cross-lane state diagram needed before feature implementation |
| Visibility (`private_admin`, `member_only`, `public`, …) | rights model + inventory filters + `content-inventory-public` helper | **Partial** — public exposure rules exist but not as single cross-lane contract |
| Downstream view contracts | fanclub design docs; club-home how-to | **Gap** — per-surface field consumption lists required (see below) |

## Downstream view contracts

Feature lanes must consume only governed fields. Minimum consumption:

### Gallery

`id`, `title`, `media_url`, `media_alt_text`, `media_caption`, `media_credit`, `source_credit`, scoped tags/categories, visibility and public-exposure flags.

### Library

`id`, `title`, `summary`, `source_name`, `source_credit`, citation/provenance fields, tags/categories, date/era, detail route when scoped.

### Memorabilia

`id`, `title`, `description`, media reference, category, date/era, `source_credit`, `provenance_note`, tags, visibility flags.

### Club Newspaper

`id`, `title`, summary/body, media reference, block type, date/era, source/credit when derived, display priority.

## Freeze marker (blocks feature work)

Until posted, **P2/P3/P4/P5 feature implementation must not start**:

```text
CONTRACT-FROZEN: content-asset-model v1
```

Freeze comment must include: source issue, package path, merged PR, fields included, downstream lanes released, known limitations, ChatGPT verification.

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
| `prohibited_parallel_lanes` | Gallery, Library, Memorabilia, Club implementation until freeze |

## Validation plan

**What to verify:**

- Gap matrix resolved or explicitly deferred with issue link.
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

**Pass:** Contract complete, stable, gap matrix has no unresolved C3 conflicts, freeze marker posted before feature lanes.

**Fail:** Duplicates #2286, lacks exposure rules, or downstream lanes cannot consume contract — stop dependent lanes.

## PR closeout requirements

Implementation PR must include:

- Source issue and package path.
- #2286 inheritance statement.
- File allowlist adherence.
- Gap matrix updates (if canonical refs changed).
- Validation evidence.
- Freeze marker status.
- As-built doc path.

## Procedure

1. Read #2360 audit and this package.
2. Re-verify all canonical reference paths exist on `main`.
3. Resolve gap matrix items or open follow-up issues for unresolved gaps.
4. Implement only within child-issue allowlist.
5. Post freeze marker on source issue when contract is stable.
6. Request ChatGPT review before releasing downstream feature lanes.

## Acceptance criteria

- [ ] Content asset contract documented with repo-verified paths.
- [ ] #2286 inheritance respected in plan and implementation.
- [ ] Downstream view contracts exist for Gallery/Library/Memorabilia/Club.
- [ ] Public/private exposure model explicit.
- [ ] Validation commands and evidence requirements defined.
- [ ] Freeze marker blocks feature work until posted.
- [ ] No parallel SOT created under rejected `content-collection/` reference tree.
