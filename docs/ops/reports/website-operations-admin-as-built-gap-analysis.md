---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Program #1258 Task 001 as-built inventory and gap classification for Website Operations Admin
Does Not Own: Application code changes, issue closure, child issue creation, or workflow YAML
Canonical Reference: /docs/ops/implementation-plans/website-operations-admin.md
Related Issues: #1255, #1258, #1053, #1118, #1119, #1120, #1121, #1122, #1123, #1124, #1125, #1126, #1127
Last Reviewed: 2026-06-10
---

# Website Operations Admin — As-Built Inventory and Gap Analysis

## Purpose

Task 001 deliverable for Program #1255 child project `#1258`. Inventory admin and
operations surfaces on current `main`, classify gaps against legacy issues
`#1118`–`#1127`, and recommend the next bounded task before hardening PRs begin.

## Boundary

- Read-only repo inspection only; no runtime mutations
- No child issues created
- `#1259` and `#1500` out of scope

Assessment date: **2026-06-10** (merge base includes PR `#1528` planning and PR `#1530` closeout remediation).

## Executive summary

T40–T49 admin/ops implementation is **substantially present on `main`**. Remaining
`#1258` work is predominantly **verification, documentation alignment, operator
runbooks, and issue hygiene** — not greenfield feature builds. One cross-cutting
documentation gap (admin access model) blocks safe operator and agent assumptions
and should be Task 002 before area hardening PRs.

## Admin protection model (as-built)

| Layer | Path | Behavior |
| --- | --- | --- |
| UI session gate | `src/app/admin/layout.tsx` | `useMemberSession({ redirectTo: '/', requireAdmin: true })` |
| Session API | `functions/api/session/me.ts` | Returns `role: admin \| member \| guest` |
| Admin API gate | `functions/_lib/auth.ts` | `requireAdmin()` — `x-admin-token` / Bearer vs `env.ADMIN_TOKEN`; fail-closed |
| Client token storage | `src/lib/adminClient.ts` | `localStorage` key `lgfc_admin_token` (not `sessionStorage`) |
| Token UI | `src/components/admin/AdminTokenPanel.tsx` | Prompt/save token for API calls |

**Documentation drift:** `docs/reference/architecture/access-model.md` (Last Reviewed
2026-02-20) describes `sessionStorage`-only admin UI access. As-built is **dual
gating** (session role for UI + admin token for APIs).

## Admin UI inventory (`src/app/admin/**`)

| Route | Page file | Nav (`AdminNav.tsx`) | Dashboard card | Tests |
| --- | --- | --- | --- | --- |
| `/admin` | `src/app/admin/page.tsx` | Dashboard | — | `tests/admin-operations.test.tsx` (layout/nav) |
| `/admin/moderation` | `src/app/admin/moderation/page.tsx` | Yes | Yes | `tests/admin-moderation.test.tsx` |
| `/admin/audit` | `src/app/admin/audit/page.tsx` | Yes | Yes | `tests/admin-audit-reporting.test.tsx` |
| `/admin/faq` | `src/app/admin/faq/page.tsx` | Yes | Yes | `tests/faq-moderation.test.ts` |
| `/admin/content` | `src/app/admin/content/page.tsx` | Yes | Yes | `tests/admin-cms-content.test.tsx` |
| `/admin/cms` | `src/app/admin/cms/page.tsx` | Yes | Yes | `tests/admin-cms-content.test.tsx` |
| `/admin/editorial` | `src/app/admin/editorial/page.tsx` | Yes | No | `tests/admin-editorial-archive.test.tsx` |
| `/admin/events` | `src/app/admin/events/page.tsx` | Yes | No | `tests/admin-events.test.tsx` |
| `/admin/matchup` | `src/app/admin/matchup/page.tsx` | Yes | No | `tests/admin-matchup.test.tsx` |
| `/admin/fundraiser-preview` | `src/app/admin/fundraiser-preview/page.tsx` | Yes | No | `tests/admin-fundraiser-preview.test.tsx` |
| `/admin/join-requests` | `src/app/admin/join-requests/page.tsx` | Yes | Yes | `tests/admin-operations.test.tsx` |
| `/admin/worklist` | `src/app/admin/worklist/page.tsx` | Yes | No | `tests/admin-operations.test.tsx` |
| `/admin/member-operations` | `src/app/admin/member-operations/page.tsx` | Yes | No | `tests/admin-operations.test.tsx` |
| `/admin/media-assets` | `src/app/admin/media-assets/page.tsx` | Yes | No | `tests/admin-media-assets.test.tsx` |
| `/admin/d1-test` | `src/app/admin/d1-test/page.tsx` | Yes | Yes | — |

Shared components: `src/components/admin/AdminNav.tsx`, `AdminDashboard.tsx`,
`AdminTokenPanel.tsx`, `AdminNav.module.css`, `AdminDashboard.module.css`.

## Admin API inventory (`functions/api/admin/**`)

| Area | Files |
| --- | --- |
| Stats / export / worklist | `stats.ts`, `export.ts`, `worklist.ts` |
| CMS | `cms/list.ts`, `cms/save.ts`, `cms/publish.ts` |
| Page content | `content/list.ts`, `content/save.ts`, `content/publish.ts` |
| Editorial (`#1256` overlap) | `editorial/list.ts`, `editorial/inventory.ts`, `editorial/review.ts`, `editorial/publish.ts`, `editorial/media-associations.ts` |
| FAQ moderation | `faq/list.ts`, `faq/pending.ts`, `faq/approved.ts`, `faq/approve.ts`, `faq/deny.ts`, `faq/create.ts`, `faq/update.ts`, `faq/delete.ts`, `faq/pin.ts` |
| Ask moderation | `ask/list.ts`, `ask/approve.ts`, `ask/reject.ts`, `ask/archive.ts` |
| Reports (admin) | `reports/list.ts`, `reports/close.ts` |
| Events | `events/list.ts`, `events/create.ts`, `events/update.ts`, `events/seed-next10.ts` |
| Matchup | `matchup/list.ts`, `matchup/create.ts`, `matchup/update.ts`, `matchup/close-active.ts` |
| Media assets | `media-assets/list.ts`, `media-assets/sync-from-b2.ts` |
| Join requests | `join-requests/list.ts` |
| Member ops content | `welcome-email.ts`, `membership-card.ts` |
| Config (no dedicated admin UI) | `footer-quotes.ts` |
| D1 diagnostic | `d1-inspect.ts` |

## Fan Club operational paths (`#1118` scope)

| Route | Page | Supporting APIs |
| --- | --- | --- |
| `/fanclub/photo` | `src/app/fanclub/photo/page.tsx` | `functions/api/fanclub/photos.ts`, `functions/api/photos/**` |
| `/fanclub/submit` | `src/app/fanclub/submit/page.tsx` | `functions/api/library/submit.ts` |
| `/fanclub/chat` | `src/app/fanclub/chat/page.tsx` | `functions/api/discussions/**` |
| `/fanclub/library` | `src/app/fanclub/library/page.tsx` | `functions/api/fanclub/library.ts`, `functions/api/library/**` |
| `/fanclub/memorabilia` | `src/app/fanclub/memorabilia/page.tsx` | `functions/api/fanclub/memorabilia.ts` |
| Fan Club shell | `src/app/fanclub/layout.tsx`, `page.tsx` | `functions/api/session/me.ts`, member routes |

Layout gate: `src/app/fanclub/layout.tsx` uses member session (not admin).

## Public/member APIs used by ops flows

| Path | Role |
| --- | --- |
| `functions/api/reports/create.ts`, `reports/list.ts` | Member report creation; admin close via `admin/reports/**` |
| `functions/api/matchup/current.ts`, `vote.ts`, `results.ts` | Public matchup reads; admin lifecycle via `admin/matchup/**` |
| `functions/api/events/next.ts`, `events/month.ts` | Public calendar reads; admin CRUD via `admin/events/**` |
| `functions/api/footer-quote.ts` | Public read; admin write API `admin/footer-quotes.ts` without UI |

## Operator documentation inventory

| Surface | How-to / runbook on `main` |
| --- | --- |
| Editorial / content inventory | `docs/how-to/website/add-content-story.md`, `review-content-submission.md`, `publish-update-content.md`, `add-content-media.md` |
| General admin/ops surfaces | **None** — no operator how-tos for moderation, events, matchup, media, audit, join-requests, etc. |

## Gap table — legacy issues `#1118`–`#1127`

Classification key:

| Class | Meaning |
| --- | --- |
| **Satisfied** | UI + API + tests present; acceptance criteria largely met on `main` |
| **Verify** | Present but needs hardening pass (empty/error/auth edge cases) |
| **Docs** | Documentation or operator runbook missing |
| **Delta** | Concrete missing code path identified |
| **Hygiene** | GitHub issue labels/body stale; not a build gap |
| **Decision** | Requires Atlas/Bill policy call |

| issue | Task | Class | As-built evidence | Gap / notes | Proposed task |
| --- | --- | --- | --- | --- | --- |
| `#1118` | T40 Fan Club ops | **Verify** | Fan Club routes + APIs above | Production empty/error/auth states not documented in ops runbook; manual verification checklist needed | Task 003 (unchanged) |
| `#1119` | T41 Admin shell | **Verify** + **Docs** | `layout.tsx`, `AdminNav.tsx`, dashboard, join/worklist/member pages | Access-model doc drift affects operator onboarding; `footer-quotes` API has no admin UI | Task 004; consider footer-quotes UI defer to Atlas |
| `#1120` | T42 Moderation | **Satisfied** | `moderation/page.tsx`, `faq/page.tsx`, ask/faq/report APIs, `admin-moderation.test.tsx` | Hardening pass only | Task 005 — may be gap-only |
| `#1121` | T43 CMS/content | **Satisfied** | `cms/`, `content/` pages + APIs, `admin-cms-content.test.tsx` | Overlap with `#1256`; no new CMS schema expected | Task 006 — likely gap-only / docs touch |
| `#1122` | T44 Media | **Verify** | `media-assets/page.tsx`, `sync-from-b2.ts`, `admin-media-assets.test.tsx` | B2 sync fail-closed UX needs production verification evidence | Task 007 (unchanged) |
| `#1123` | T45 Editorial | **Verify** + **Decision** | `editorial/page.tsx`, `admin/editorial/**`, `admin-editorial-archive.test.tsx` | `#1256` owns `content_inventory` authority; `#1258` verifies ops alignment only | Task 008; **Atlas/Bill:** confirm boundary |
| `#1124` | T46 Events | **Satisfied** | `events/page.tsx`, `admin/events/**`, `events/next.ts`, `admin-events.test.tsx` | Public calendar stability verification deferred to `#1259` if needed | Task 009 — likely gap-only |
| `#1125` | T47 Fundraiser | **Satisfied** | `fundraiser-preview/page.tsx`, `CampaignSpotlight*.tsx`, `campaignSpotlight.ts`, tests | Preview fail-closed behavior present in UI | Task 010 — likely gap-only |
| `#1126` | T48 Matchup | **Satisfied** | `matchup/page.tsx`, admin + public matchup APIs, `admin-matchup.test.tsx` | Admin page already compares public read paths | Task 011 — likely gap-only |
| `#1127` | T49 Audit/reporting | **Satisfied** | `audit/page.tsx`, export/stats/reports APIs, `admin-audit-reporting.test.tsx` | Export table list may need operator doc | Task 012 — likely gap-only |
| `#1053` | Coordination tree | **Hygiene** + **Decision** | Historical T-task index | Body/labels stale; not implementation authority | Task 013; **Atlas/Bill:** body update vs closeout |

## Cross-cutting gaps (all lanes)

| Gap | Evidence | Blocks | Route |
| --- | --- | --- | --- |
| Access model documentation drift | `access-model.md` vs `layout.tsx` + `auth.ts` + `adminClient.ts` | Operator and agent assumptions | **Task 002** (recommended next) |
| No general admin operator how-tos | Only `#1256` editorial how-tos exist | Long-term ops handoff | Task 013 |
| `footer-quotes` API without admin UI | `functions/api/admin/footer-quotes.ts` only | Operator config for footer rotation | Defer or add to Task 004 — **Decision** |
| PMO dependency-map fields incomplete | Plan has per-task Dependencies but not full predecessor/successor/stage/halt map | `production-ready` promotion | **Atlas/Bill** before child issue creation |
| Legacy GitHub label drift | `#1118`–`#1127` open with `pr-draft` / `post-merge-verify` / `status:failed` | Queue trust | Task 013 disposition batch (authorized separately) |
| Production QA / launch CI | H-011 in Phase 0 report | Launch confidence | `#1259` only |

## Proposed child task corrections

| Task | Plan title | Task 001 recommendation |
| --- | --- | --- |
| 001 | As-built inventory | **Complete** (this report) |
| 002 | Access model docs | **Proceed next** — blocking documentation gap |
| 003 | Fan Club verification | Unchanged — verification + runbook gap |
| 004 | Admin shell / member ops | Unchanged; confirm `footer-quotes` UI in/out of scope with Atlas |
| 005–012 | Area hardening | Most may execute as **gap-only** (verification + docs) unless Task 002–004 find code deltas |
| 006 | CMS delta | Narrow to verification; do not reopen `#1256` schema work |
| 008 | Editorial alignment | Keep bounded to ops verification under `#1256` authority |
| 013 | Runbooks / disposition | Unchanged; absorbs `#1053` hygiene and operator how-tos |

No task sequence renumbering recommended.

## Risks and blockers before implementation PRs

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Dual admin gate confusion | High | Task 002 before code hardening |
| Agents infer wrong auth from `access-model.md` | High | Task 002 |
| False “complete” from stale GitHub labels | Medium | Disposition batch; use this report as truth |
| Editorial scope creep into `#1256` | Medium | Atlas boundary decision on `#1123` |
| B2/media sync partial failure silent in prod | Medium | Task 007 verification with operator evidence |
| Static export vs Pages Functions mismatch | Medium | Verify admin APIs on deployed target during hardening |
| `#1500` post-merge closeout failures on ops PRs | Low | Compliant PR bodies; `#1500` deferred |

## Recommended Task 002 scope

**Task 002 — Admin access model documentation reconciliation**

Deliverables:

1. Update `docs/reference/architecture/access-model.md` to describe session UI gate +
   `ADMIN_TOKEN` API gate + `localStorage` token panel flow.
2. Add operator-facing steps: admin login → session role check → enter admin token →
   use admin surfaces (new how-to under `docs/how-to/website/` if needed).
3. Record security boundary: UI reachability vs API mutability.

Out of scope for Task 002: auth redesign, OAuth, workflow YAML, code changes unless
doc-driven correction is required and explicitly allowlisted.

## Decisions needed (Atlas/Bill)

1. Confirm Task 002 as next authorized task after this PR merges.
2. `#1123` / `#1256` editorial boundary — ops alignment only vs shared ownership.
3. `footer-quotes` admin UI — in Task 004 scope, defer, or obsolete API.
4. `#1053` — update body vs historical closeout.
5. PMO full dependency-map fields before plan moves to `production-ready`.
6. Whether Tasks 005–012 may proceed as gap-only without code when verification passes.

## Validation

```bash
./scripts/ci/docs_check_headers.sh docs/ops/reports/website-operations-admin-as-built-gap-analysis.md
```
