---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, implementation agents
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: MEM-001 implementation envelope — governed Memorabilia route, API, validation, and freeze dependencies
Does Not Own: Photo schema authority, storage expansion policy, or merge authorization
Canonical Reference: /docs/reference/design/fanclub-subpages.md
Related Issues: #2362, #2359, #2360, #2361, #2286
Last Reviewed: 2026-07-10
---

# MEM-001 Memorabilia Package

## Purpose

Define the implementation envelope for governed **Memorabilia** content on `/fanclub/memorabilia` — grid/cards, tags, related library stories, and member auth boundaries.

## Scope

**In scope:** Memorabilia route, photo-archive integration (`is_memorabilia`), APIs, layout, validation.

**Out of scope:** Bulk acquisition, B2 expansion policy, Gallery/Library route trees, Club shell.

## Current known truth

| Surface | Repo path | Status |
| --- | --- | --- |
| Route | `src/app/fanclub/memorabilia/page.tsx` | **Exists** — grid, search, tags, load-more |
| Photos API (gallery mode) | `functions/api/fanclub/photos.ts` | **Exists** — D1 `photos`, excludes memorabilia rows |
| Memorabilia API | `functions/api/fanclub/memorabilia.ts` | **Exists** — separate endpoint (client does not use `memorabilia=true` on photos URL) |
| Tags API | `functions/api/fanclub/memorabilia/tags.ts` | **Exists** |
| API client | `src/lib/fanclubApi.ts` | Switches path: `/api/fanclub/memorabilia` vs `/api/fanclub/photos` |
| Grid styles | `src/components/fanclub/fanclubGridStyles.ts` | **Shared hot zone** with Gallery |
| Related stories | API returns `related_library_entries` | **Exists** — links to Library |
| Design authority | `docs/reference/design/fanclub-subpages.md` | Memorabilia section |

**Data model today:** Memorabilia items are **`photos` rows** with memorabilia flag/filter — not a separate memorabilia table.

## Blocked / unblocked conditions

| Condition | Status |
| --- | --- |
| `CONTRACT-FROZEN: content-asset-model v1` | **Not posted** — blocks governed-field implementation |
| #2362 docs | **Unblocked** |

## Gap matrix (intake MEM-001 vs repo reality)

| Draft requirement | Repo reality | Gap / action |
| --- | --- | --- |
| Card/grid layout | `fanclubThreeColumnGridClassName` grid | **Covered** |
| Title, description, tags | `title`, `description`, `tags` | **Covered** |
| Date/era, category | Not displayed in UI | **Gap** |
| Source credit, provenance | Not shown (only tags) | **Gap** — CC-002 fields post-freeze |
| Media reference | `thumbnail_url` | **Covered** |
| Separate memorabilia API tree | Single photos endpoint + memorabilia.ts | **Document** — no duplicate data path |
| `src/components/fanclub/memorabilia/**` | **Missing** — inline page | Optional extract later |

## CC-001 view contract (Memorabilia)

`id`, `title`, `description`, media reference, category, date/era, `source_credit`, `provenance_note`, tags, visibility flags.

## Repo-verified file allowlist (implementation child issue)

```text
src/app/fanclub/memorabilia/**
functions/api/fanclub/memorabilia.ts
functions/api/fanclub/memorabilia/**
functions/api/fanclub/photos.ts
src/lib/fanclubApi.ts
tests/*memorabilia*
tests/e2e/launch-readiness-fanclub-routes.spec.ts
docs/ops/implementation-plans/content-collection/packages/mem-001-memorabilia-package.md
docs/ops/reports/mem-001-as-built-*.md
```

**Hot zones:**

- `src/app/fanclub/photo/**`, `src/app/fanclub/library/**`, `src/app/fanclub/page.tsx`, `src/app/fanclub/layout.tsx`
- `src/components/fanclub/fanclubGridStyles.ts`
- `.github/workflows/**`, `scripts/ci/**`

## Parallel execution control

| Field | Value |
| --- | --- |
| `parallel_safe` | `true` after freeze |
| `allowed_parallel_lanes` | Gallery, Library |
| `collision_action` | Pause if `photos.ts` or grid styles concurrently edited |

## Validation plan

**Route smoke:**

1. Member → `/fanclub/memorabilia`; confirm grid or empty state.
2. Tag filter + search via URL params.
3. Load more pagination.
4. Related library section when API returns entries.
5. Auth redirect for anonymous users.

**Commands:**

```bash
npm run typecheck
npm run build
npm test -- tests/fanclub-operations.test.tsx
npm run test:e2e -- tests/e2e/launch-readiness-fanclub-routes.spec.ts
```

## Design authority

- `docs/reference/design/fanclub-subpages.md`
- `docs/reference/design/LGFC-Production-Design-and-Standards.md`

## Procedure

1. Confirm freeze marker before provenance/credit UI work.
2. Coordinate `photos.ts` changes with Gallery lane if shared query logic changes.
3. Validate; as-built under `docs/ops/reports/`.

## Acceptance criteria

- [ ] Repo paths verified; memorabilia-via-photos model documented.
- [ ] Freeze dependency explicit.
- [ ] Allowlist, validation, as-built defined.
- [ ] Shared shell/grid risks identified.
