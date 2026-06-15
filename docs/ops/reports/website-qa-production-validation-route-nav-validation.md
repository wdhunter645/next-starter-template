---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Program #1259 Task 002 route and navigation validation evidence for Website QA / Production Validation
Does Not Own: Application code changes unless gap-only fix authorized, issue closure, or workflow YAML
Canonical Reference: /docs/ops/implementation-plans/website-qa-production-validation.md
Related issues: #1255, #1259, #1108, #947
Last Reviewed: 2026-06-15
---

# Website QA / Production Validation — Route and Navigation Validation

## Purpose

Task 002 deliverable for Program #1255 child project `#1259`. Verify canonical
public-core routes resolve to page files, launch-readiness manifest parity,
header/footer/mobile nav invariants, and legacy redirect wiring. Gaps are
classified with severity for downstream tasks.

## Boundary

- Route/nav scoped tests and documentation only
- No admin route changes or homepage redesign
- Auth-state matrix deferred to Task 003; responsive checklist deferred to Task 004

Assessment date: **2026-06-15** (`main` after Task 001 PR `#1657` merge `da02c01`).

## Executive summary

Route and navigation validation **passes** with three documented pass-with-note
items across 25 checklist rows (22 pass, 3 pass-with-note, 0 fail).

| Result | Count |
| --- | --- |
| Pass | 22 |
| Pass with note | 3 |
| Fail | 0 |

Automated evidence: `tests/public-route-navigation-validation.test.ts` (7 cases)
plus existing `tests/launch-readiness-manifest.test.ts` (4 cases).

## Route checklist

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Every public-core route has a page file | **Pass** | `PUBLIC_CORE_ROUTES` → `src/app/**/page.tsx` |
| 2 | `/` homepage resolves | **Pass** | `src/app/page.tsx` |
| 3 | `/about` resolves | **Pass** | `src/app/about/page.tsx` |
| 4 | `/ask` resolves | **Pass** | `src/app/ask/page.tsx` |
| 5 | `/contact` resolves | **Pass** | `src/app/contact/page.tsx` |
| 6 | `/events` resolves | **Pass** | `src/app/events/page.tsx` |
| 7 | `/faq` resolves | **Pass** | `src/app/faq/page.tsx` |
| 8 | `/join` resolves | **Pass** | `src/app/join/page.tsx` |
| 9 | `/privacy` resolves | **Pass** | `src/app/privacy/page.tsx` |
| 10 | `/search` resolves | **Pass** | `src/app/search/page.tsx` |
| 11 | `/terms` resolves | **Pass** | `src/app/terms/page.tsx` |
| 12 | `/health` resolves with probe marker | **Pass** | `src/app/health/page.tsx` contains `OK: health` |
| 13 | `/logout` resolves | **Pass** | `src/app/logout/page.tsx` |
| 14 | `/login` legacy redirect wired | **Pass** | `POST_LOGOUT_ROUTE` + `window.location.replace` |
| 15 | `/auth` legacy redirect to `/join` | **Pass with note** | Redirect page present; excluded from Playwright public suite |
| 16 | `/store` forbidden route absent | **Pass** | `manifest.forbiddenRoutes` |
| 17 | Manifest lists all public-core routes | **Pass** | `requiredRoutes` superset check |
| 18 | Playwright exclusions documented | **Pass** | `/auth`, `/health`, `/logout` only |

### Playwright exclusion notes (pass-with-note)

| Route | Reason |
| --- | --- |
| `/auth` | Legacy redirect to `/join`; not a static browse target |
| `/health` | Ops health probe; minimal shell without full public nav contract |
| `/logout` | Client POST `/api/logout` flow; not a static browse target |

These routes remain in `requiredRoutes` for static export parity but are
intentionally omitted from `publicPlaywrightRoutes`.

## Navigation checklist

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | SiteHeader switches public vs fanclub header | **Pass** | `src/components/SiteHeader.tsx` |
| 2 | Public Header exposes Join/Search/Store | **Pass** | `src/components/Header.tsx` |
| 3 | Store links to Bonfire external URL | **Pass** | `https://www.bonfire.com/store/lou-gehrig-fan-club/` |
| 4 | Footer Privacy/Terms/Contact links | **Pass** | `src/components/Footer.tsx` + manifest `footerLinks` |
| 5 | Manifest footer contract matches Footer | **Pass** | `tests/public-route-navigation-validation.test.ts` |
| 6 | Hamburger menu variants exist | **Pass with note** | `public-guest`, `public-member`, `fanclub` — auth matrix in Task 003 |
| 7 | Events calendar production validation | **Pass with note** | Route present; full calendar smoke deferred from `#1258` runbooks (Task 005) |

## Gap disposition

| Gap | Severity | Task 002 disposition |
| --- | --- | --- |
| `/health`, `/logout`, `/auth` not in Playwright public suite | Low | Documented; intentional |
| Auth-aware header button matrix | Medium | Deferred to Task 003 |
| Events calendar production smoke | Medium | Deferred to Task 005 |
| Dedicated search page unit test | Low | No blocker; route resolves |

No Task 002 code fixes required.

## Validation commands

```bash
npm test -- tests/public-route-navigation-validation.test.ts tests/launch-readiness-manifest.test.ts

printf '%s\n' \
  docs/ops/reports/website-qa-production-validation-route-nav-validation.md \
  docs/ops/implementation-plans/website-qa-production-validation.md \
  > /tmp/task002-docs-header-list.txt
DOCS_HEADER_FILE_LIST=/tmp/task002-docs-header-list.txt ./scripts/ci/docs_check_headers.sh .
```
