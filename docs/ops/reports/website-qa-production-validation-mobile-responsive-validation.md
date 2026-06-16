---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Program #1259 Task 004 mobile and responsive validation evidence for Website QA / Production Validation
Does Not Own: Application code changes unless gap-only fix authorized, issue closure, or workflow YAML
Canonical Reference: /docs/ops/implementation-plans/website-qa-production-validation.md
Related issues: #1255, #1259, #1109
Last Reviewed: 2026-06-16
---

# Website QA / Production Validation — Mobile and Responsive Validation

## Purpose

Task 004 deliverable for Program #1255 child project `#1259`. Validate critical
public and fanclub surfaces at mobile/tablet/desktop breakpoints; document
responsive checklist evidence and tie unit/playwright coverage to CSS contracts.

## Boundary

- Mobile/responsive scoped tests and documentation only
- No visual redesign
- D1/B2 production smoke deferred to Task 005

Assessment date: **2026-06-16** (`main` after Task 003 PR `#1667` merge `0347b27`;
tracker drift sync PR `#1669` merged `56a9394`).

## Executive summary

Mobile and responsive validation **passes** with two documented pass-with-note
items. Hamburger-only navigation activates at 767px for public and fanclub
headers. Playwright mobile suite covers `/` and `/fanclub` at 390/768/920/1280px
with horizontal overflow guards. No code fixes required in this task.

| Result | Count |
| --- | --- |
| Pass | 14 |
| Pass with note | 2 |
| Fail | 0 |

Automated evidence: `tests/public-mobile-responsive-validation.test.ts` (7 cases)
plus existing `tests/mobile-navigation.test.tsx` and
`tests/e2e/mobile-navigation.spec.ts`.

## Breakpoint matrix

| Viewport | Width (px) | Public header | Fanclub header | Evidence |
| --- | --- | --- | --- | --- |
| Mobile | 390 | Hamburger-only; center buttons hidden | Hamburger-only; center buttons hidden | Playwright + CSS `@media (max-width: 767px)` |
| Tablet | 768 | Center buttons visible | Center buttons visible | Playwright |
| Desktop narrow | 920 | Center buttons visible | Center buttons visible | Playwright |
| Desktop | 1280 | Center buttons visible | Center buttons visible | Playwright |

## Responsive checklist

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Mobile unit suite present | **Pass** | `tests/mobile-navigation.test.tsx` |
| 2 | Mobile playwright suite present | **Pass** | `tests/e2e/mobile-navigation.spec.ts` |
| 3 | Breakpoints 390/768/920/1280 documented | **Pass** | contract test + e2e |
| 4 | Public `/` mobile hamburger-only | **Pass** | playwright public mobile test |
| 5 | Fanclub `/fanclub` mobile hamburger-only | **Pass** | playwright fanclub mobile test |
| 6 | Public header hides center buttons ≤767px | **Pass** | `Header.module.css` |
| 7 | Fanclub header hides center buttons ≤767px | **Pass** | `FanClubHeader.module.css` |
| 8 | Hamburger touch target ≥44px | **Pass** | `openHamburger` in e2e |
| 9 | No horizontal overflow on mobile public | **Pass** | `assertNoHorizontalOverflow` |
| 10 | No horizontal overflow on mobile fanclub | **Pass** | same |
| 11 | Guest drawer canonical item order | **Pass** | `mobile-navigation.test.tsx` |
| 12 | Member drawer canonical item order | **Pass** | same |
| 13 | Fanclub drawer canonical item order | **Pass** | same |
| 14 | Footer locked links on mobile | **Pass** | playwright footer test |
| 15 | Additional public routes at mobile | **Pass with note** | `/`, `/fanclub` covered; other public routes inherit header CSS |
| 16 | Playwright not in default CI `npm test` | **Pass with note** | Run via `launch-readiness:e2e` / manual; Task 007 H-011 |

## Gap disposition

| Gap | Severity | Task 004 disposition |
| --- | --- | --- |
| Breakpoint checklist not recorded (Task 001) | Medium | **Closed** — this report |
| Playwright mobile not in CI schedule | Low | Documented; Task 007 H-011 |
| Priority route spot-check beyond `/` and `/fanclub` | Low | Pass-with-note; shared header CSS |

No Task 004 code fixes required.

## Validation commands

```bash
npm test -- tests/public-mobile-responsive-validation.test.ts tests/mobile-navigation.test.tsx

printf '%s\n' \
  docs/ops/reports/website-qa-production-validation-mobile-responsive-validation.md \
  docs/ops/implementation-plans/website-qa-production-validation.md \
  > /tmp/task004-docs-header-list.txt
DOCS_HEADER_FILE_LIST=/tmp/task004-docs-header-list.txt ./scripts/ci/docs_check_headers.sh .
```

Optional playwright (requires static `out/` build):

```bash
LAUNCH_READINESS_E2E=1 npx playwright test tests/e2e/mobile-navigation.spec.ts
```
