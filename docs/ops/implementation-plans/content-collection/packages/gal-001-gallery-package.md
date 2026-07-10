---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, implementation agents
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: GAL-001 implementation envelope — governed Gallery (Photo) route, API, validation, and freeze dependencies
Does Not Own: Canonical content model, D1 schema authority, public website routes, or merge authorization
Canonical Reference: /docs/reference/design/fanclub-subpages.md
Related Issues: #2362, #2359, #2360, #2361, #2286
Last Reviewed: 2026-07-10
---

# GAL-001 Gallery Package

## Purpose

Define the implementation envelope for governed **Gallery** content on the member Photo Gallery route (`/fanclub/photo`). This package documents repo-verified surfaces, gaps vs CC-001/CC-002, allowlists, and validation — not greenfield route creation.

## Scope

**In scope:** Photo gallery route, APIs, display fields, member auth boundary, design compliance, validation, as-built expectations.

**Out of scope:** Public gallery routes, bulk ingestion, OCR, CI changes, Library/Memorabilia/Club shell files.

## Current known truth

| Surface | Repo path | Status |
| --- | --- | --- |
| Route | `src/app/fanclub/photo/page.tsx` | **Exists** — member-authenticated gallery with search/tags/grid |
| Layout auth | `src/app/fanclub/layout.tsx` | **Exists** — redirects unauthenticated users to `/` |
| Photos API | `functions/api/fanclub/photos.ts` | **Exists** — D1 `photos` table, non-memorabilia filter |
| Tags API | `functions/api/fanclub/photos/tags.ts` | **Exists** |
| API client | `src/lib/fanclubApi.ts` | **Exists** — `buildFanclubPhotoListApiUrl` |
| Grid styles | `src/components/fanclub/fanclubGridStyles.ts` | **Shared** — hot zone |
| Design authority | `docs/reference/design/fanclub-subpages.md` | **Canonical** — `/fanclub/photo` spec |
| Production design | `docs/reference/design/LGFC-Production-Design-and-Standards.md` | Parent authority |
| Content pipeline | `functions/_lib/content-pipeline-*.ts` | **#2286** — consume, do not rebuild |
| Foundation packages | `docs/ops/implementation-plans/content-collection/packages/cc-001-content-asset-model-package.md`, `cc-002-provenance-rights-contract-package.md` | Contract + freeze rules |

**Access boundary today:** Gallery is **member-only** (`requireMember` on API; layout session gate). Not a public route.

**Data source today:** D1 `photos` table (not full `content_inventory` candidate model). API comment notes no explicit approval column — treats rows as approved catalog content.

## Blocked / unblocked conditions

| Condition | Status |
| --- | --- |
| #2360 audit disposition | Complete |
| #2361 foundation package docs | Complete |
| `CONTRACT-FROZEN: content-asset-model v1` | **Not posted** — **blocks feature implementation PRs** that change governed field contracts |
| `CONTRACT-FROZEN` + CC-002 provenance freeze | Required before public/member display field enforcement changes |
| Docs-only enrichment (#2362) | **Unblocked** (this document) |

## Gap matrix (intake GAL-001 vs repo reality)

| Draft requirement | Repo reality | Gap / action |
| --- | --- | --- |
| Title, caption, alt text | `title`, `description`, img `alt` from title | **Partial** — caption/credit not distinct fields |
| `media_credit`, `source_credit` | `uploaded_by` shown as "Source" | **Gap** — map to CC-001/CC-002 fields at freeze |
| Governed image assets | `photos` rows + B2 URLs | **Consume existing** — no parallel gallery SOT |
| Public exposure rules | Member-only route | **N/A today** — document if public gallery ever scoped |
| `src/components/fanclub/gallery/**` | **Missing** — logic inline in `page.tsx` | Extract components only when implementation issue authorizes |
| Reference `content-collection/gallery-asset-contract.md` | **Rejected path** per #2360 | Use CC-001 view contract + this package |

## CC-001 view contract (Gallery)

Must consume when implementing governed display: `id`, `title`, `media_url`, `media_alt_text`, `media_caption`, `media_credit`, `source_credit`, scoped tags, visibility flags.

See [cc-001-content-asset-model-package.md](./cc-001-content-asset-model-package.md).

## Repo-verified file allowlist (implementation child issue)

```text
src/app/fanclub/photo/**
src/components/fanclub/gallery/**
src/lib/fanclubApi.ts
functions/api/fanclub/photos.ts
functions/api/fanclub/photos/**
tests/*gallery*
tests/*photo*
tests/e2e/launch-readiness-fanclub-routes.spec.ts
docs/ops/implementation-plans/content-collection/packages/gal-001-gallery-package.md
docs/ops/reports/gal-001-as-built-*.md
```

**Hot zones — do not touch without explicit approval:**

- `src/app/fanclub/layout.tsx`
- `src/app/fanclub/page.tsx`
- `src/app/fanclub/library/**`
- `src/app/fanclub/memorabilia/**`
- `src/components/fanclub/fanclubGridStyles.ts` (shared with Memorabilia)
- `functions/_lib/content-pipeline-*.ts` (unless narrow CC-001 extension authorized)
- `.github/workflows/**`, `scripts/ci/**`

## Parallel execution control

| Field | Value |
| --- | --- |
| `parallel_safe` | `true` after `CONTRACT-FROZEN: content-asset-model v1` |
| `allowed_parallel_lanes` | Library, Memorabilia (disjoint allowlists) |
| `conditional_parallel_lanes` | Club Newspaper — only if shell files not in flight |
| `prohibited_parallel_lanes` | CI workflow edits; concurrent edits to shared grid styles |

## Validation plan

**Route smoke (member session required):**

1. Sign in as test member; open `/fanclub/photo`.
2. Confirm grid renders or empty state message displays.
3. Apply search + tag filters; confirm results update.
4. Confirm unauthenticated `/fanclub/photo` redirects to `/`.

**Commands:**

```bash
npm run typecheck
npm run build
npm test -- tests/fanclub-operations.test.tsx
npm run test:e2e -- tests/e2e/launch-readiness-fanclub-routes.spec.ts
```

**Evidence required:** build/test output, screenshot or smoke notes, design authority citation, as-built path.

**Pass:** Governed fields display per CC-001/CC-002 after freeze; no auth regression; responsive layout acceptable per design lock (desktop-first).

**Fail:** Missing credit/provenance on governed assets, auth bypass, or hot-zone collision — stop lane.

## Design authority

- `docs/reference/design/fanclub-subpages.md` — Photo Gallery section
- `docs/reference/design/LGFC-Production-Design-and-Standards.md`
- `docs/ops/pmo/program-3-club-home-page-design.md` — feature link to `/fanclub/photo` only

## Procedure

1. Confirm `CONTRACT-FROZEN: content-asset-model v1` on program issue before code PR.
2. Copy allowlist into child issue; verify paths on `main`.
3. Implement within allowlist; cite design authority in PR.
4. Run validation commands; attach evidence.
5. Post as-built under `docs/ops/reports/`.

## Acceptance criteria

- [ ] Package documents repo-verified routes, APIs, and gaps.
- [ ] Blocked until CC-001 freeze explicitly stated.
- [ ] Allowlist and hot zones defined.
- [ ] Validation and as-built requirements defined.
- [ ] No rejected `docs/reference/website/content-collection/` parallel SOT.
