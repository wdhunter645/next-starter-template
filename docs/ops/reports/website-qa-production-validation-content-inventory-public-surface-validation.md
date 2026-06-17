---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Program #1259 Task 006 content inventory public surface validation evidence for Website QA / Production Validation
Does Not Own: Homepage inventory wiring, schema migrations, issue closure, or workflow YAML
Canonical Reference: /docs/ops/implementation-plans/website-qa-production-validation.md
Related issues: #1255, #1256, #1259, #1015, #1017
Last Reviewed: 2026-06-17
---

# Website QA / Production Validation — Content Inventory Public Surface Validation

## Purpose

Task 006 deliverable for Program #1255 child project `#1259`. Confirm `#1256`
published `content_inventory` records render only on applicable `allowed_sections`
surfaces; document spot-check evidence for search, library, and deferred homepage /
milestones inventory routing.

## Boundary

- Public surface validation scoped to read paths, page/API wiring contracts, pilot
  pack spot-checks, and this report
- No homepage `homepage_*` inventory consumer implementation (out of scope)
- No schema migrations or admin write-path changes
- Tracker/PMO sync deferred unless explicitly authorized in a follow-up PR

Assessment date: **2026-06-17** (`main` after Task 005 tracker sync PR `#1712` merge
`cd5c8dd`; operator Task 006 authorization on `#1259`).

## Executive summary

Content inventory public surface validation **passes** with three documented
pass-with-note items. Search (`/search` → `search` section) and member library
(`/fanclub/library` → `library` section) consume published inventory with
`allowed_sections` gating. Homepage and milestones surfaces use CMS / legacy D1
tables today — `homepage_spotlight` and `homepage_milestones` sections are
admin-declared but not yet wired to public renderers.

| Result | Count |
| --- | --- |
| Pass | 14 |
| Pass with note | 3 |
| Fail | 0 |

Automated evidence: `tests/content-inventory-public-surface-validation.test.ts` (7
cases) plus existing `tests/content-inventory-*.test.ts` suite and pilot pack
`verifyPilotPublicReads`.

## allowed_sections authority

Admin editorial UI (`src/app/admin/editorial/page.tsx`) declares:

| Key | Intended surface | Wired consumer |
| --- | --- | --- |
| `homepage_spotlight` | Homepage spotlight | **No** — CMS `/api/cms/get` |
| `homepage_discussions` | Homepage discussions | **No** |
| `homepage_milestones` | Homepage milestones | **No** — `milestones` table |
| `library` | Fan Club library | **Yes** — `/api/fanclub/library` |
| `search` | Public search (Archive) | **Yes** — `/api/search` |
| `archive` | Archive browse | **No dedicated route** |
| `related_content` | Related / memorabilia | **Yes** — member APIs |

Canonical model: `docs/reference/website/content-inventory-model.md` (`#1256`).

## Public surface spot-check matrix

| # | Surface | Route | Section | Auth | Result | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Search | `/search` | `search` | Public | **Pass** | Page → `/api/search`; Archive hits use `publishedInventoryWhere('search')` |
| 2 | Library | `/fanclub/library` | `library` | Member | **Pass** | Page → `/api/fanclub/library`; rotation-ranked inventory |
| 3 | Related content | member APIs | `related_content` | Member | **Pass** | `resolveRelatedStories` in related + memorabilia APIs |
| 4 | Homepage | `/` | `homepage_*` | Public | **Pass with note** | No `content_inventory` consumer; CMS + legacy tables by design today |
| 5 | Milestones | `/#milestones` | `homepage_milestones` (reserved) | Public | **Pass with note** | `MilestonesSection` → `/api/milestones/list` (separate table) |
| 6 | Pilot search record | pilot pack | `search` | Public | **Pass** | `verifyPilotPublicReads` — `public:search-event-year` |
| 7 | Pilot library record | pilot pack | `library` | Member | **Pass** | `verifyPilotPublicReads` — `public:library-count` |
| 8 | Draft exclusion | pilot pack | — | — | **Pass** | `public:draft-excluded` |
| 9 | Rejected queue exclusion | pilot pack | — | — | **Pass** | `content-inventory-seed.test.ts` |
| 10 | Attribution required | all wired APIs | — | — | **Pass** | `source_name` + `credit_line` in `publishedInventoryWhere` |
| 11 | Section SQL gating | library/search/related | — | — | **Pass** | `sectionAllowedClause` + `LIKE '%section%'` |
| 12 | Member Library search hits | `/search` (member) | `library` | Member | **Pass** | `content-inventory-search.test.ts` integration |
| 13 | Baseline Program #1256 tests | — | — | — | **Pass** | public, search, rotation, seed suites on disk |
| 14 | Production live spot-check | production URLs | — | — | **Pass with note** | Deferred — vitest + pilot pack evidence; optional operator curl below |
| 15 | Archive section route | — | `archive` | — | **Pass with note** | Admin key declared; no dedicated public archive browse route yet |
| 16 | Homepage inventory delta | future | `homepage_spotlight` | — | **Pass with note** | Bounded follow-up if homepage should consume inventory |
| 17 | Task 001 gap disposition | cross-cutting | — | — | **Pass** | Content inventory public surface proof closed for wired surfaces |

## Gap disposition

| Gap (Task 001 / legacy) | Severity | Task 006 disposition |
| --- | --- | --- |
| Content inventory public surface proof (`#1256`) | Medium | **Closed** — wired surfaces validated; deferred surfaces documented |
| `#1015` T32 Library content render vs inventory | Low | **Closed** — library API + page wiring verified |
| `#1017` T34 Homepage published inventory on allowed sections | Medium | **Pass with note** — homepage does not consume inventory yet; `homepage_*` keys reserved |
| Homepage/milestones inventory consumer missing | Medium | **Pass with note** — intentional as-built; future delta if authorized |
| Production live inventory spot-check | Low | **Pass with note** — optional operator smoke |
| Archive browse route for `archive` section | Low | **Pass with note** — no public route; search covers Archive hits |

## Validation commands

```bash
npm test -- tests/content-inventory-public-surface-validation.test.ts tests/content-inventory-public.test.ts tests/content-inventory-search.test.ts tests/content-inventory-seed.test.ts

npm run typecheck

printf '%s\n' \
  docs/ops/reports/website-qa-production-validation-content-inventory-public-surface-validation.md \
  docs/ops/implementation-plans/website-qa-production-validation.md \
  > /tmp/task006-docs-header-list.txt
DOCS_HEADER_FILE_LIST=/tmp/task006-docs-header-list.txt ./scripts/ci/docs_check_headers.sh .
```

Optional production smoke (operator, guest + member):

```bash
curl -sS "https://www.lougehrigfanclub.com/api/search?q=lou&page=1" | jq '.results[:3]'
# Member session required:
curl -sS -b "$MEMBER_COOKIE" "https://www.lougehrigfanclub.com/api/fanclub/library?page=1" | jq '.items[:3]'
```

## Downstream routing

| Task | Routing from Task 006 |
| --- | --- |
| 007 | H-011 launch-readiness / scheduled e2e gap |
| 008 | `#1111` T29 disposition — inventory surface class closed for wired paths |
| 009 | Consolidate validation evidence in final QA report |
