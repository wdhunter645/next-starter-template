---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, implementation agents
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: LIB-001 implementation envelope — governed Library route, API, validation, and freeze dependencies
Does Not Own: Canonical content inventory authority, D1 migrations, or merge authorization
Canonical Reference: /docs/reference/design/fanclub-subpages.md
Related Issues: #2362, #2359, #2360, #2361, #1256
Last Reviewed: 2026-07-10
---

# LIB-001 Library Package

## Purpose

Define the implementation envelope for governed **Library** content on the member Gehrig Library route (`/fanclub/library`). Documents repo-verified surfaces, gaps vs CC-001/CC-002, allowlists, and validation.

## Scope

**In scope:** Library route, API, `content_inventory` integration, source/credit display, member auth, validation.

**Out of scope:** OCR, crawler automation, bulk acquisition, Gallery/Memorabilia/Club shell, CI changes.

## Current known truth

| Surface | Repo path | Status |
| --- | --- | --- |
| Route | `src/app/fanclub/library/page.tsx` | **Exists** — search + story list from API |
| Library API | `functions/api/fanclub/library.ts` | **Exists** — prefers `content_inventory` published rows |
| Inventory helper | `functions/_lib/content-inventory-public.ts` | **Exists** — `fetchLibraryInventoryPage`, `LIBRARY_SECTION` |
| Inventory model | `docs/reference/website/content-inventory-model.md` | **Canonical** reference |
| Legacy fallback | `library_entries` table in API | Transitional read if inventory empty |
| Design authority | `docs/reference/design/fanclub-subpages.md` | `/fanclub/library` spec |
| Foundation packages | `docs/ops/implementation-plans/content-collection/packages/cc-001-content-asset-model-package.md`, `cc-002-provenance-rights-contract-package.md` | Freeze dependency |

**Access boundary:** Member-only (`requireMember` on API; layout session gate).

**Display today:** Shows `title`, `content`/`description`, `author` as credit line, `year`, `created_at`. Prose mentions source/credit but API fields are limited to inventory mapping.

## Blocked / unblocked conditions

| Condition | Status |
| --- | --- |
| `CONTRACT-FROZEN: content-asset-model v1` | **Not posted** — blocks governed-field implementation PRs |
| CC-002 provenance/rights freeze | Required for publication-safe display changes |
| #2362 docs enrichment | **Unblocked** |

## Gap matrix (intake LIB-001 vs repo reality)

| Draft requirement | Repo reality | Gap / action |
| --- | --- | --- |
| Title, summary | `title`, `content`/`description` | **Covered** |
| Source/provenance, citation | `author` used as credit; no `source_name`/`citation_text` in UI | **Gap** — extend API mapping from inventory fields post-freeze |
| Date/era | `year`, `created_at` | **Partial** |
| Tags/categories | Not shown in current UI | **Gap** if scoped |
| Empty state | "No entries yet" / search empty | **Covered** — not permanently empty if inventory seeded |
| `functions/api/library/**` | **Does not exist** | Use `functions/api/fanclub/library.ts` only |
| Rejected reference contract path | N/A | Use CC-001 Library view contract |

## CC-001 view contract (Library)

`id`, `title`, `summary`, `source_name`, `source_credit`, citation/provenance fields, tags/categories, date/era, detail route when scoped.

See [cc-001-content-asset-model-package.md](./cc-001-content-asset-model-package.md).

## Repo-verified file allowlist (implementation child issue)

```text
src/app/fanclub/library/**
functions/api/fanclub/library.ts
functions/_lib/content-inventory-public.ts
tests/*library*
tests/e2e/launch-readiness-fanclub-routes.spec.ts
docs/ops/implementation-plans/content-collection/packages/lib-001-library-package.md
docs/ops/reports/lib-001-as-built-*.md
```

**Hot zones — require explicit approval:**

- `src/app/fanclub/page.tsx`, `layout.tsx`
- `src/app/fanclub/photo/**`, `src/app/fanclub/memorabilia/**`
- Broad `content_inventory` migrations
- `.github/workflows/**`, `scripts/ci/**`

## Parallel execution control

| Field | Value |
| --- | --- |
| `parallel_safe` | `true` after content-asset freeze |
| `allowed_parallel_lanes` | Gallery, Memorabilia |
| `collision_action` | Pause on shared `content-inventory-public` edits without coordination |

## Validation plan

**Route smoke:**

1. Member session → `/fanclub/library`.
2. Search with `?q=` param; confirm results filter.
3. Verify credit line appears when `author`/inventory credit populated.
4. Unauthenticated access redirects to `/`.

**Commands:**

```bash
npm run typecheck
npm run build
npm test -- tests/fanclub-operations.test.tsx
npm run test:e2e -- tests/e2e/launch-readiness-fanclub-routes.spec.ts
```

**Pass:** Governed entries display with source/provenance per CC-002 after freeze; empty state justified or populated.

## Design authority

- `docs/reference/design/fanclub-subpages.md` — Library section
- `docs/reference/website/content-inventory-model.md`
- `docs/how-to/website/club-home-content-operations-runbook.md` — cross-surface verification

## Procedure

1. Wait for `CONTRACT-FROZEN: content-asset-model v1` before field-contract implementation.
2. Map inventory fields to CC-001 Library view contract in implementation PR.
3. Stay within allowlist; run validation; publish as-built report.

## Acceptance criteria

- [ ] Repo-verified paths and gaps documented.
- [ ] Freeze blocker explicit.
- [ ] Allowlist, validation, as-built requirements defined.
- [ ] No parallel `content-collection/` reference SOT.
