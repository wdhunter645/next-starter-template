---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Program #1259 Task 001 as-built inventory and gap classification for Website QA / Production Validation
Does Not Own: Application code changes, issue closure, child issue creation, or workflow YAML
Canonical Reference: /docs/ops/implementation-plans/website-qa-production-validation.md
Related issues: #1255, #1259, #1053, #943, #946, #947, #1013, #1014, #1015, #1016, #1017, #1108, #1109, #1110, #1111, #1112, #1500
Last Reviewed: 2026-06-15
---

# Website QA / Production Validation — As-Built Inventory and Gap Analysis

## Purpose

Task 001 deliverable for Program #1255 child project `#1259`. Inventory public
routes, auth surfaces, navigation, public read APIs, and automated test coverage
on current `main`; classify gaps against design authority and legacy T21–T34 /
T50 lanes; record H-011 status for downstream tasks.

## Boundary

- Read-only repo inspection only; no runtime mutations
- No GitHub issue closure or relabeling
- Admin feature builds (`#1258` complete) and CI program `#1500` out of scope

Assessment date: **2026-06-15** (`main` after planning PR `#1656` merge `b0cc0da`;
predecessor `#1258` closed complete).

## Executive summary

Public-core website implementation is **substantially present on `main`**. T21–T34
lanes are **satisfied as-built** with remaining work concentrated in **verification
evidence, production QA checklists, launch-readiness CI scheduling (H-011), and
legacy issue hygiene** — not greenfield public feature builds.

**Inventory-before-delta rule:** Tasks 002–009 must treat this gap table as
authority. Do not claim new build gaps without contradicting evidence here.

| Theme | As-built | Remaining work |
| --- | --- | --- |
| Public routes (T21–T23, T25) | Pages + APIs present | Task 002 route/nav checklist; Task 006 content render spot-check |
| Auth states (T28, T30–T35) | Client layout gates + session API | Task 003 auth matrix; fanclub layout redirect untested |
| Mobile/responsive (T26) | Unit + Playwright specs exist | Task 004 viewport checklist on priority routes |
| D1/B2 public reads (T29) | Fail-closed tests + public APIs | Task 005 production smoke evidence |
| Content inventory public (T34 + `#1256`) | Helpers + rotation/search tests | Task 006 published-record surface validation |
| Launch readiness (T50 / `#1112`) | Manual `launch-readiness:*` scripts | **H-011 open** — not scheduled in CI (Task 007) |
| Legacy GitHub hygiene | issues open with stale labels | Task 008 disposition batch only |

## Auth and route protection model (as-built)

| Layer | Path / surface | Behavior |
| --- | --- | --- |
| Root layout | `src/app/layout.tsx` | No auth gate; `SiteHeader` + `Footer` on all routes |
| Public core | `/`, `/about`, `/ask`, `/contact`, `/events`, `/faq`, `/health`, `/join`, `/logout`, `/privacy`, `/search`, `/terms` | Unauthenticated access |
| Legacy redirects | `/login` → `/`; `/auth` → `/join` | `src/app/login/page.tsx`, `src/app/auth/page.tsx` |
| FanClub gate | `src/app/fanclub/layout.tsx` | `useMemberSession({ redirectTo: '/' })`; unauth → `/` |
| Admin gate | `src/app/admin/layout.tsx` | `useMemberSession({ redirectTo: '/', requireAdmin: true })` |
| Session API | `functions/api/session/me.ts` | `requireMember`; roles `admin` \| `member` \| `guest` |
| Join/login | `src/app/join/page.tsx` → `AuthClient` | POST `/api/join`, `/api/login`; authed → `/fanclub` |
| API middleware | `functions/api/_middleware.ts` | Rate limit + D1 env on sensitive paths; not page-route gating |

**Architectural note:** No Next.js `middleware.ts`. Route protection is **client-side**
(layout hooks). Expect brief unauthenticated render (`null`) before redirect on
`/fanclub/**` and `/admin/**`.

## Public route inventory

### Public core (`src/app/**`, excluding `/fanclub/**`, `/admin/**`)

| Route | Page file | Launch manifest | Playwright public suite | Page/unit tests |
| --- | --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | required | yes | `tests/homepage-structure.test.tsx`, `tests/e2e/homepage-sections.spec.ts` |
| `/about` | `src/app/about/page.tsx` | required | yes | manifest marker only |
| `/ask` | `src/app/ask/page.tsx` | required | yes | `tests/ask-page.test.tsx` |
| `/auth` | `src/app/auth/page.tsx` | required | no | `tests/join-login-auth.test.tsx` (redirect) |
| `/contact` | `src/app/contact/page.tsx` | required | yes | — |
| `/events` | `src/app/events/page.tsx` | required | yes | manifest marker |
| `/faq` | `src/app/faq/page.tsx` | required | yes | `tests/faq-page.test.tsx` |
| `/health` | `src/app/health/page.tsx` | required | **no** | — |
| `/join` | `src/app/join/page.tsx` | required | yes | `tests/join-login-auth.test.tsx` |
| `/login` | `src/app/login/page.tsx` | required | yes | `tests/join-login-auth.test.tsx` (redirect) |
| `/logout` | `src/app/logout/page.tsx` | required | no | — |
| `/privacy` | `src/app/privacy/page.tsx` | required | yes | — |
| `/search` | `src/app/search/page.tsx` | required | yes | `tests/content-inventory-search.test.ts` (API) |
| `/terms` | `src/app/terms/page.tsx` | required | yes | — |

Contract source: `scripts/launch-readiness/manifest.json` (`requiredRoutes`,
`publicPlaywrightRoutes`, `pageMarkers`).

### FanClub member routes

| Route | Page file | Manifest | Playwright fanclub suite |
| --- | --- | --- | --- |
| `/fanclub` | `src/app/fanclub/page.tsx` | required | yes |
| `/fanclub/chat` | `src/app/fanclub/chat/page.tsx` | required | yes |
| `/fanclub/library` | `src/app/fanclub/library/page.tsx` | required | yes |
| `/fanclub/membercard` | `src/app/fanclub/membercard/page.tsx` | required | yes |
| `/fanclub/memorabilia` | `src/app/fanclub/memorabilia/page.tsx` | required | yes |
| `/fanclub/myprofile` | `src/app/fanclub/myprofile/page.tsx` | required | yes |
| `/fanclub/photo` | `src/app/fanclub/photo/page.tsx` | required | yes |
| `/fanclub/submit` | `src/app/fanclub/submit/page.tsx` | required | yes |

Layout gate: `src/app/fanclub/layout.tsx`. Ops runbook deferrals (PDF/upload edge
cases) remain for Task 009.

### Navigation and shell components

| Component | Path | Role |
| --- | --- | --- |
| SiteHeader | `src/components/SiteHeader.tsx` | Switches public `Header` vs `FanClubHeader` |
| Header | `src/components/Header.tsx` | Guest/member button sets; Store → Bonfire |
| FanClubHeader | `src/components/FanClubHeader.tsx` | Member nav on `/fanclub/**` |
| HamburgerMenu | `src/components/HamburgerMenu.tsx` | Drawer variants `public-guest`, `public-member`, `fanclub` |
| Footer | `src/components/Footer.tsx` | `/api/footer-quote`; Privacy/Terms/Contact links |

## Public read API inventory (`functions/api/**`, non-admin)

| Path | File | Auth | Test touchpoint |
| --- | --- | --- | --- |
| `GET /api/health` | `functions/api/health.ts` | public | — |
| `GET /api/footer-quote` | `functions/api/footer-quote.ts` | public | Footer consumer |
| `GET /api/faq/list` | `functions/api/faq/list.ts` | public | `tests/faq-page.test.tsx` |
| `GET /api/cms/get` | `functions/api/cms/get.ts` | public | — |
| `GET /api/content/get` | `functions/api/content/get.ts` | public | — |
| `GET /api/events/next` | `functions/api/events/next.ts` | public | `tests/admin-events.test.tsx` (public read block) |
| `GET /api/events/month` | `functions/api/events/month.ts` | public | — |
| `GET /api/friends/list` | `functions/api/friends/list.ts` | public | `tests/friends-of-fanclub.test.tsx` |
| `GET /api/milestones/list` | `functions/api/milestones/list.ts` | public | `tests/milestones-section.test.tsx` |
| `GET /api/matchup/current` | `functions/api/matchup/current.ts` | public | `tests/admin-matchup.test.tsx` (public read block) |
| `GET /api/matchup/results` | `functions/api/matchup/results.ts` | public | — |
| `GET /api/photos/list` | `functions/api/photos/list.ts` | public | `tests/admin-media-assets.test.tsx` |
| `GET /api/search` | `functions/api/search.ts` | public (+ member extras) | `tests/content-inventory-search.test.ts` |

Fail-closed D1/B2 behavior: `tests/d1-b2-fail-closed.test.ts`.

## Automated test coverage inventory

| Area | Primary tests | Gap signal |
| --- | --- | --- |
| Route manifest parity | `tests/launch-readiness-manifest.test.ts` | — |
| Public routes e2e | `tests/e2e/launch-readiness-public-routes.spec.ts` | `/health`, `/logout`, `/auth` not in `publicPlaywrightRoutes` |
| Fanclub routes e2e | `tests/e2e/launch-readiness-fanclub-routes.spec.ts` | Mocked session; not true unauth redirect |
| Mobile/responsive | `tests/mobile-navigation.test.tsx`, `tests/e2e/mobile-navigation.spec.ts` | Task 004 checklist |
| Join/login/auth UX | `tests/join-login-auth.test.tsx` | — |
| FAQ / Ask | `tests/faq-page.test.tsx`, `tests/ask-page.test.tsx` | — |
| Homepage / sections | `tests/homepage-structure.test.tsx`, `tests/e2e/homepage-sections.spec.ts` | `tests/homepage.spec.ts` outside Playwright `testDir` |
| Content inventory public | `tests/content-inventory-public.test.ts`, `rotation`, `search` | Task 006 surface spot-check |
| D1/B2 fail-closed | `tests/d1-b2-fail-closed.test.ts` | Task 005 production evidence |
| Fanclub layout gate | — | **No test** for `fanclub/layout.tsx` redirect (admin layout tested in `admin-operations.test.tsx`) |

### Launch-readiness manual bundle (not CI)

| Script | Scope |
| --- | --- |
| `npm run launch-readiness:unit` | manifest, d1-b2, homepage-structure, join-login-auth, mobile-navigation |
| `npm run launch-readiness:e2e` | Playwright against static `out/` (`LAUNCH_READINESS_E2E=1`) |
| `npm run launch-readiness` | `scripts/launch-readiness/run.mjs` orchestrator |

## H-011 / T50 launch-readiness status

| Field | Value |
| --- | --- |
| Legacy issue | `#1112` [T50] Launch readiness QA and production validation suite |
| Merge evidence | PR `#1221` — launch-readiness manifest, scripts, Playwright specs |
| Disposition | **Partially satisfied** |
| H-011 gap | Scheduled launch-readiness e2e **not wired in `.github/workflows/**`** |
| CI today | `gate-quality.yml` runs `npm test` + build; no `launch-readiness:*` |
| Nightly assess | `ops-assess.yml` runs `assess:ci` (manifest/HTML); no Playwright launch-readiness |
| Production audit | `production-audit.yml` Playwright against live URL; not static-export launch-readiness mode |
| Owner route | Task 007 — close, document, or bound to `#1500` with sign-off |

## Gap table — legacy public-core issues (T21–T34, T50)

Classification key:

| Class | Meaning |
| --- | --- |
| **Satisfied** | Route/API/tests present; acceptance largely met on `main` |
| **Verify** | Present; needs checklist or production evidence |
| **Docs** | Operator/QA documentation missing |
| **Delta** | Concrete missing code path |
| **Hygiene** | GitHub labels/body stale |
| **Open** | Known unresolved gap (H-011) |

| issue | Task | Class | As-built evidence | Gap / notes | Proposed task |
| --- | --- | --- | --- | --- | --- |
| `#943` | T21 FAQ | **Satisfied** | `/faq`, `/api/faq/list`, `tests/faq-page.test.tsx` | Production post-merge label hygiene | Task 008 |
| `#946` | T22 Ask | **Satisfied** | `/ask`, `/api/ask`, `tests/ask-page.test.tsx` | Same | Task 008 |
| `#947` | T23-E Events | **Verify** | `/events`, `/api/events/next`, manifest marker | Full calendar production validation deferred from `#1258` runbooks | Task 002 / 005 |
| `#1013` | T30 FanClub shell | **Verify** | `/fanclub/**`, layout gate, fanclub e2e (mocked session) | Layout redirect untested; true unauth behavior | Task 003 |
| `#1014` | T31 Profile / card | **Satisfied** | `/fanclub/myprofile`, `/fanclub/membercard` | Membercard API gated — verify in auth matrix | Task 003 |
| `#1015` | T32 Library | **Satisfied** | `/fanclub/library`, `/fanclub/memorabilia`, library APIs | Content render vs `#1256` inventory | Task 006 |
| `#1016` | T33 Social Wall | **Verify** | `/fanclub/chat`, discussions APIs | Ops edge cases deferred | Task 003 / 009 |
| `#1017` | T34 Homepage D1 | **Verify** | `/`, milestones/friends APIs, homepage tests | Published inventory on allowed sections | Task 006 |
| `#1108` | T25 Search | **Satisfied** | `/search`, `/api/search`, inventory search tests | No dedicated search page unit test | Task 002 |
| `#1109` | T26 Mobile nav | **Verify** | mobile unit + e2e specs | Breakpoint checklist not recorded for QA sign-off | Task 004 |
| `#1110` | T28 Join/Login | **Verify** | `/join`, legacy redirects, `join-login-auth` tests | Guest/member/admin header matrix for Task 003 | Task 003 |
| `#1111` | T29 D1/B2 fail-closed | **Verify** | `d1-b2-fail-closed.test.ts`, public list APIs | Production smoke evidence not consolidated | Task 005 |
| `#1112` | T50 Launch readiness | **Open** | Manual launch-readiness scripts | **H-011:** not in CI schedule | Task 007 |
| `#1053` | Coordination tree | **Hygiene** | Historical T21–T50 index | Body/labels stale; subordinated to `#1255` | Task 008 |

## Cross-cutting gaps (all lanes)

| Gap | Severity | Evidence | Route |
| --- | --- | --- | --- |
| H-011 launch-readiness CI | **High** | No workflow references `launch-readiness` | Task 007 |
| Fanclub layout auth redirect untested | Medium | No test mirrors admin layout gate | Task 003 |
| `/health` in manifest but not Playwright public suite | Low | `manifest.json` vs `publicPlaywrightRoutes` | Task 002 |
| Client-only route gates (flash before redirect) | Low | No `middleware.ts` | Document in Task 003 matrix |
| `tests/homepage.spec.ts` outside e2e dir | Low | Not in default Playwright `testDir` | Task 007 or defer |
| Stale open legacy issues (T21–T34) | Hygiene | GitHub OPEN vs worklist CLOSED | Task 008 |
| Cloudflare preview vs production drift | Medium | Deferred from `#1258` runbooks | Task 009 |
| Content inventory public surface proof | Medium | `#1256` complete; spot-check needed | Task 006 |

## Recommended task routing (002–009)

| Task | Focus from this inventory |
| --- | --- |
| 002 | Canonical route + header/footer/mobile nav checklist; manifest vs Playwright parity |
| 003 | Guest/member/admin matrix; fanclub layout redirect; header auth variants |
| 004 | Responsive checklist at 375/768/1024 on priority public routes |
| 005 | D1/B2 public read-path production smoke; events/calendar stability |
| 006 | Published `content_inventory` on homepage, library, milestones, search |
| 007 | H-011 disposition; scheduled e2e path or bounded deferral |
| 008 | Legacy disposition package for `#943`–`#947`, `#1013`–`#1017`, `#1108`–`#1112` |
| 009 | Final QA report; consolidate evidence; open blocker classification |

## Validation

```bash
DOCS_HEADER_FILE_LIST="docs/ops/reports/website-qa-production-validation-as-built-gap-analysis.md" \
  ./scripts/ci/docs_check_headers.sh .
```
