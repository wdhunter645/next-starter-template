---
Doc Type: Operations
Audience: Bill, Atlas, Cursor, LGFC maintainers, implementation agents, and reviewers
Authority Level: Controlled
Owns: Task 001 as-built gap table for Website Completion / Fan Club Product Buildout
Does Not Own: Application code changes, runtime architecture decisions, D1 migrations, issue closure, labels, or merge approval
Canonical Reference: /docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md
Related issues: #1686, #1685
Last Reviewed: 2026-06-17
---

# Website Completion / Fan Club Product Buildout - Design and As-Built Gap Review

## Purpose

This report is the Task 001 deliverable for source issue `#1686`.

It compares the current Website and Fan Club implementation against the Priority #1
design authority and records a current gap table for follow-on implementation tasks.

## Scope

Writable scope for this task:

- `docs/ops/reports/**`
- `docs/reference/website/**`
- `docs/reference/design/**`

Read-only inspection scope used for this report:

- `src/**`
- `functions/**`
- `tests/**`

Out of scope:

- application code changes;
- workflow YAML changes;
- D1 migrations;
- production configuration;
- issue closure, relabeling, merge, or approval actions.

## Source authority cross-check

| Source | Role in this report |
| --- | --- |
| `docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md` | Task sequence, Task 001 acceptance criteria, allowlist, validation model, and successor expectations |
| `docs/ops/pmo/website-completion-fan-club-product-buildout-readiness.md` | Priority #1 readiness boundary, child-project map, backend/content reconciliation rule |
| `docs/reference/design/LGFC-Production-Design-and-Standards.md` | Canonical runtime, route, auth, navigation, footer, homepage, data-model, and floating-logo authority |
| `docs/reference/design/fanclub-subpages.md` | Canonical Fan Club destination-page contracts for `/fanclub/photo`, `/fanclub/library`, `/fanclub/memorabilia`, and `/fanclub/myprofile` |
| `docs/ops/pmo/program-3-club-home-page-design.md` | Planning evidence for authenticated Club Home newspaper layout, feature links, source map, content rotation, and content reuse |

## Current known truth

- Fan Club route protection exists in `src/app/fanclub/layout.tsx` through
  `useMemberSession({ redirectTo: '/' })`.
- Route-based Fan Club header selection exists in `src/components/SiteHeader.tsx`,
  and the Fan Club header/drawer implementation is in
  `src/components/FanClubHeader.tsx` and `src/components/HamburgerMenu.tsx`.
- Current Fan Club app routes include canonical routes plus extra member routes:
  `/fanclub`, `/fanclub/myprofile`, `/fanclub/photo`, `/fanclub/library`,
  `/fanclub/memorabilia`, `/fanclub/membercard`, `/fanclub/submit`, and
  `/fanclub/chat`.
- Current Fan Club member APIs include
  `functions/api/fanclub/photos.ts`, `functions/api/fanclub/library.ts`,
  `functions/api/fanclub/memorabilia.ts`, `functions/api/fanclub/profile.ts`,
  `functions/api/content/membercard.ts`, `functions/api/library/submit.ts`,
  and `functions/api/discussions/**`.
- Current tests cover Fan Club operational pages/API states, mobile navigation,
  content-inventory related content, and launch-readiness route loading under
  `tests/fanclub-operations.test.tsx`, `tests/mobile-navigation.test.tsx`,
  `tests/content-inventory-public.test.ts`, and
  `tests/e2e/launch-readiness-fanclub-routes.spec.ts`.

## Intended final state

Follow-on tasks should be able to proceed without inferring requirements from
chat history or legacy project names:

1. Task 002 receives a concrete data-surface and backend-reconciliation evidence
   list.
2. Task 003 and later Fan Club page work receives an explicit design/as-built
   gap table.
3. Deferred or blocked surfaces are separated from "fix now" deltas.
4. Existing satisfied surfaces are not rebuilt.

## Classification key

| Classification | Meaning |
| --- | --- |
| `fix now` | The current implementation conflicts with controlling design authority and can be addressed by a bounded follow-on implementation task once that task is assigned. |
| `defer` | The source authority treats the item as optional, future, or not Day 1; do not implement in the next task unless a later source issue scopes it. |
| `already satisfied` | The as-built surface materially satisfies the design contract; follow-on tasks should preserve and verify it rather than rebuild it. |
| `blocked` | A code delta would require Task 002 data-surface reconciliation, a design decision, or explicit issue authority before implementation. |

## As-built gap table

| ID | Area | Classification | Controlling source document | Observed implementation surface | Gap / disposition | Follow-on evidence needed |
| --- | --- | --- | --- | --- | --- | --- |
| G-001 | Runtime model | already satisfied | `LGFC-Production-Design-and-Standards.md` - Runtime Platform Model; `website-completion-fan-club-product-buildout.md` - validation model | `package.json` exposes `build:cf`; Pages Functions live under `functions/api/**`; Fan Club member APIs are implemented as Functions | The implementation uses the locked Cloudflare Pages + Pages Functions model. Preserve this architecture. | Task 002 should inventory exact API/data dependencies, not propose a runtime migration. |
| G-002 | Fan Club auth boundary | already satisfied | `LGFC-Production-Design-and-Standards.md` - Canonical Redirect Policy and Authentication Model; `fanclub-subpages.md` - all pages require login | `src/app/fanclub/layout.tsx`; `src/hooks/useMemberSession.ts`; `functions/_lib/session.ts`; `tests/public-auth-state-validation.test.tsx` | `/fanclub/**` uses a client session gate and member APIs call `requireMember`. The design redirect target `/` is implemented. | Later tasks should add route-specific auth matrix evidence when changing pages or APIs. |
| G-003 | Fan Club header and drawer navigation | already satisfied | `LGFC-Production-Design-and-Standards.md` - FanClub Header and Hamburger Menu Behavior | `src/components/FanClubHeader.tsx`; `src/components/HamburgerMenu.tsx`; `tests/mobile-navigation.test.tsx`; `tests/e2e/mobile-navigation.spec.ts` | Desktop/tablet Fan Club nav has Club Home, My Profile, Search, external Store, and Logout. Mobile drawer order matches the canonical list and excludes Admin, Support, Members, and duplicate Home labels. | Preserve in Tasks 003, 005, and 007; rerun mobile/header tests when navigation changes. |
| G-004 | Footer invariants | already satisfied | `LGFC-Production-Design-and-Standards.md` - Footer | `src/components/Footer.tsx`; `tests/mobile-navigation.test.tsx` | Footer uses D1-backed quote fetch, dynamic year, logo scroll-to-top, and only Privacy, Terms, Contact links. | Preserve in all UI tasks; no footer changes are needed for Priority #1. |
| G-005 | Floating logo scope | already satisfied | `LGFC-Production-Design-and-Standards.md` - Floating Logo | `src/components/SiteHeader.tsx`; `src/components/FloatingLogo.tsx`; `src/app/page.tsx`; `src/app/fanclub/page.tsx` | Floating logo is mounted for `/` and `/fanclub`; other Fan Club subpages use the standard header logo. | If Task 003 changes Club Home shell, validate `/` and `/fanclub` only. |
| G-006 | Canonical Fan Club route set versus as-built route manifest | blocked | `LGFC-Production-Design-and-Standards.md` - Canonical Routes; `fanclub-subpages.md` - covered pages; `program-3-club-home-page-design.md` - submission/discussion planning evidence | `src/app/fanclub/membercard/page.tsx`; `src/app/fanclub/submit/page.tsx`; `src/app/fanclub/chat/page.tsx`; `scripts/launch-readiness/manifest.json` | Production design lists `/fanclub`, `/fanclub/myprofile`, `/fanclub/photo`, `/fanclub/library`, and `/fanclub/memorabilia`. The as-built manifest also treats `/fanclub/membercard`, `/fanclub/submit`, and `/fanclub/chat` as launch-readiness routes. The extra routes have implementation evidence but need design authority reconciliation before removal, promotion, or redesign. | Task 002 should inventory API/data dependencies for these extra routes. Task 003 or Task 007 needs explicit design authority on whether each route remains, is folded into a canonical page, or is deferred. |
| G-007 | Membership card placement | fix now | `LGFC-Production-Design-and-Standards.md` - Data Model; `fanclub-subpages.md` - `/fanclub/myprofile` Membership Card Section | `src/app/fanclub/myprofile/page.tsx`; `src/app/fanclub/membercard/page.tsx`; `functions/api/content/membercard.ts` | Design says membership card is not a standalone page and its instructions/front/back images appear on `/fanclub/myprofile`. As-built `/fanclub/myprofile` links to `/fanclub/membercard`; the card content and images render on a separate route. | Task 003 should fold membership card content into My Profile or obtain design authority for a separate route. Task 002 should verify `membership_card_content` and image asset ownership. |
| G-008 | My Profile data source | blocked | `LGFC-Production-Design-and-Standards.md` - Data Model; `fanclub-subpages.md` - `/fanclub/myprofile` Data | `functions/api/fanclub/profile.ts`; `src/app/fanclub/myprofile/page.tsx`; `functions/api/join.ts` | Design says MyProfile is a page per member in `members`, and the member row is created during JOIN. As-built `profile.ts` inserts an email/role into `members` but reads/writes editable profile fields from `join_requests`. | Task 002 must reconcile `members` versus `join_requests` ownership before Task 003 changes the profile API or UI. |
| G-009 | Club Home newspaper layout | fix now | `program-3-club-home-page-design.md` - Newspaper-style layout model; `website-completion-fan-club-product-buildout.md` - Task 003 objective | `src/app/fanclub/page.tsx`; `src/components/fanclub/WelcomeSection.tsx`; `ArchivesTiles.tsx`; `PostCreation.tsx`; `DiscussionFeed.tsx`; `GehrigTimeline.tsx` | As-built Club Home is a simple member dashboard with welcome, archive tiles, post creation, discussion feed, timeline, and admin link. It does not yet implement the planned newspaper-style order: masthead, lead story, secondary story rail, feature cards, rotating photo/memorabilia feature, archive spotlight, campaign/event/recognition slots, and submission CTA. | Task 003 should implement a static/fail-closed shell for the newspaper structure after Task 002 identifies available data surfaces. |
| G-010 | Club Home feature-link cards | already satisfied | `program-3-club-home-page-design.md` - Club Home feature-link card model | `src/components/fanclub/ArchivesTiles.tsx` | The Gallery, Library, and Memorabilia links degrade to static route targets, which the design allows when counts/thumbnails are unavailable. | Task 005 may add counts/thumbnails only after Task 002 verifies `photos`, `content_inventory`, and B2 availability. |
| G-011 | Club Home dynamic content sourcing | blocked | `program-3-club-home-page-design.md` - Backend source map, D1 source expectations, content rotation strategy; `website-completion-fan-club-product-buildout-readiness.md` - backend services boundary | `src/app/fanclub/page.tsx`; `functions/api/milestones/list.ts`; `functions/api/discussions/**`; `functions/_lib/content-inventory-public.ts` | Some dynamic sources exist, but there is no single Club Home data contract for lead story, secondary rail, photo/memorabilia feature, archive spotlight, campaign module, event callout, recognition tile, and submission CTA. | Task 002 must inventory `content_inventory`, `page_content`, `photos`, `content_inventory_media`, `events`, discussions, campaign config, and any missing tables/API contracts before Tasks 005-006 wire data. |
| G-012 | Photo Gallery route/API presence | already satisfied | `fanclub-subpages.md` - `/fanclub/photo` Purpose and Data; `LGFC-Production-Design-and-Standards.md` - `photos` table rule | `src/app/fanclub/photo/page.tsx`; `functions/api/fanclub/photos.ts`; `src/lib/fanclubApi.ts`; `tests/fanclub-operations.test.tsx` | A member-gated Photo Gallery page and `GET /api/fanclub/photos` exist, sourced from `photos` and excluding memorabilia-tagged rows. Empty and error states have test coverage. | Preserve route/API. Later UI fixes should not rebuild the data endpoint unless Task 002 finds schema gaps. |
| G-013 | Photo Gallery UI contract | fix now | `fanclub-subpages.md` - `/fanclub/photo` Search Bar, Tag Filter Bar, Photo Grid, Submit a Photo | `src/app/fanclub/photo/page.tsx`; `functions/api/fanclub/photos.ts` | The page has a free-text Search field with placeholder "Title, description, or tags" and a comma-separated Tags input. Design requires placeholder `"Search photos..."`, a pill-based tag filter bar populated from `photos`, a 3-column desktop grid, and CTA copy "Have a photo to share? [Submit a Photo ->]". | Task 003 or Task 005 should align UI copy/filter presentation. Task 002 should confirm whether API can expose tag lists for pill population. |
| G-014 | Photo approval/source state | blocked | `fanclub-subpages.md` - approved fan club photos; `program-3-club-home-page-design.md` - editorial rules | `functions/api/fanclub/photos.ts`; `functions/api/library/submit.ts`; admin editorial surfaces under `functions/api/admin/editorial/**` | `functions/api/fanclub/photos.ts` explicitly notes there is no approval column for `photos` and treats current rows as already-approved catalog content. Design requires approved content and reviewed submissions. | Task 002 must decide whether `photos` needs approval/status fields, a join through `content_inventory`, or documented legacy treatment before implementation changes. |
| G-015 | Library route/API presence | already satisfied | `fanclub-subpages.md` - `/fanclub/library` Data; `LGFC-Production-Design-and-Standards.md` - `content_inventory` and `library_entries` rules | `src/app/fanclub/library/page.tsx`; `functions/api/fanclub/library.ts`; `functions/_lib/content-inventory-public.ts`; `tests/fanclub-operations.test.tsx`; `tests/content-inventory-public.test.ts` | A member-gated Library page and API exist. API prefers published `content_inventory` library rows and falls back to `library_entries`, satisfying the no-orphan legacy rule. | Preserve fallback behavior. Task 002 should document current table/section eligibility and migration boundaries. |
| G-016 | Library UI/search contract | fix now | `fanclub-subpages.md` - `/fanclub/library` Page Layout, Search Bar, Library List | `src/app/fanclub/library/page.tsx`; `functions/api/fanclub/library.ts` | Design requires H1 `"Gehrig Library"`, placeholder `"Search library..."`, URL param `?q=keyword`, and entries supporting tags/photo linkage. As-built H1 is "Library"; search filters the already-loaded page client-side and does not pass `q` to the API. | Task 003 or Task 005 should align H1/search behavior. Task 002 should verify tag/photo linkage fields in `content_inventory` and association tables. |
| G-017 | Memorabilia route/API presence | already satisfied | `fanclub-subpages.md` - `/fanclub/memorabilia` Canonical Data Rule and Data | `src/app/fanclub/memorabilia/page.tsx`; `functions/api/fanclub/memorabilia.ts`; `tests/content-inventory-public.test.ts` | A member-gated Memorabilia page and API exist. API derives items from `photos` where `is_memorabilia = 1` and exposes related story snippets. | Preserve the "not a standalone table" rule. Task 002 should inventory related story and media association paths. |
| G-018 | Memorabilia UI/related-content contract | fix now | `fanclub-subpages.md` - `/fanclub/memorabilia` Page Layout, Search Bar, Tag Filter Bar, Detail View | `src/app/fanclub/memorabilia/page.tsx`; `functions/api/fanclub/memorabilia.ts` | Design requires H1 `"Memorabilia Archive"`, placeholder `"Search memorabilia..."`, tag filter bar, 3-column desktop grid, and detail view including tags and related story. As-built H1 is "Memorabilia"; query is client-side only; tag filtering is absent in UI; API-related stories are not rendered. | Task 003 or Task 005 should align page UI and render related-story evidence. Task 002 should confirm API response shape and B2/media fields. |
| G-019 | Member submissions path | blocked | `fanclub-subpages.md` - Submit a Photo CTA; `program-3-club-home-page-design.md` - Submission CTA and editorial rules; `website-completion-fan-club-product-buildout-readiness.md` - content collection strategy folded into content management | `src/app/fanclub/submit/page.tsx`; `functions/api/library/submit.ts`; `src/components/fanclub/ArchivesTiles.tsx`; `tests/fanclub-operations.test.tsx` | As-built `/fanclub/submit` accepts article/note text into `submission_queue`. Photo Gallery CTA says "Submit a story or note" rather than the photo-specific design. The route is not in the canonical FanClub route list but is supported by content-management planning evidence. | Task 002 and Task 004 should reconcile submission types, media/PDF upload scope, source/credit fields, and route authority before expanding uploads or changing navigation. |
| G-020 | Member discussions | defer | `program-3-club-home-page-design.md` - member/community prompts and editorial rules; `LGFC-Production-Design-and-Standards.md` - Canonical Routes | `src/app/fanclub/chat/page.tsx`; `src/components/fanclub/PostCreation.tsx`; `src/components/fanclub/DiscussionFeed.tsx`; `functions/api/discussions/**`; `tests/fanclub-operations.test.tsx` | Discussion features exist, but `/fanclub/chat` is not a canonical route in production design. Planning evidence supports member prompts/discussions, but not necessarily a standalone Day 1 destination route. | Preserve existing route until design authority says otherwise. Later tasks should not expand discussion automation beyond manual/member posting without explicit scope. |
| G-021 | Campaign/fundraiser module on Club Home | defer | `website-completion-fan-club-product-buildout-readiness.md` - fundraiser boundary; `program-3-club-home-page-design.md` - campaign/fundraiser module | `src/lib/campaignSpotlight.ts`; public/admin fundraiser preview surfaces; no Club Home campaign module observed in `src/app/fanclub/page.tsx` | Priority #1 may only passively accommodate fundraiser modules. Full fundraiser operations are a separate future program. | Task 003 may include a fail-closed placeholder only if explicitly scoped; implementation of Givebutter, leaderboard, donor recognition, or campaign operations stays out of scope. |
| G-022 | Events/recognition modules on Club Home | blocked | `program-3-club-home-page-design.md` - Events/calendar callout and recognition/partner tile | `src/components/fanclub/GehrigTimeline.tsx`; `functions/api/events/**`; `src/components/FriendsOfFanClub.tsx`; no Club Home event/recognition modules observed | Event and friend/partner data surfaces exist elsewhere, but Club Home event callout and recognition tile source rules are not implemented. Recognition automation requires display rules first. | Task 002 should inventory events and partner/friend data. Task 003 may add fail-closed slots; recognition automation needs a later design decision. |
| G-023 | Search surface includes member archive results | already satisfied | `LGFC-Production-Design-and-Standards.md` - Public route `/search`; `program-3-club-home-page-design.md` - content reuse strategy | `functions/api/search.ts`; `functions/_lib/content-inventory-public.ts`; `tests/content-inventory-search.test.ts` | Search resolves published inventory/library records to `/fanclub/library` and also searches photo/memorabilia records when tables exist. | Preserve this reuse path. Task 002 should document member-auth expectations for search-result destinations. |
| G-024 | Tests for exact destination-page design markers | fix now | `website-completion-fan-club-product-buildout.md` - validation model; `fanclub-subpages.md` - page content contracts | `tests/fanclub-operations.test.tsx`; `tests/e2e/launch-readiness-fanclub-routes.spec.ts` | Current tests cover route loading, empty/error states, and some APIs, but do not assert exact H1s/placeholders/tag-filter contracts from `fanclub-subpages.md`. | Task 003/005 should add targeted tests when correcting page UI contracts. |

## Task 002 evidence handoff

Task 002 should inspect and reconcile these surfaces before any backend/API/data
delta is implemented:

| Evidence area | Files / surfaces to inspect read-only first | Reason |
| --- | --- | --- |
| Member/profile ownership | `members`, `join_requests`, `member_sessions`; `functions/api/fanclub/profile.ts`; `functions/api/join.ts` | Resolve whether editable profile fields belong in `members` or remain tied to join requests. |
| Membership card content | `membership_card_content`; `functions/api/content/membercard.ts`; static assets `membercard-front.png`, `membercard-back.png`; `/fanclub/myprofile` | Decide how card content moves onto My Profile or whether separate route authority is granted. |
| Photos and approval state | `photos`; `functions/api/fanclub/photos.ts`; `functions/api/fanclub/memorabilia.ts`; admin media/editorial paths | Resolve approved/published status for photos and memorabilia before display behavior changes. |
| Content inventory and related stories | `content_inventory`, `content_inventory_media`, `library_entries`; `functions/_lib/content-inventory-public.ts`; `functions/api/fanclub/library.ts`; `functions/api/content-inventory/related.ts` | Preserve `content_inventory` preference and legacy fallback while documenting migration/backfill expectations. |
| Club Home content model | `page_content`, `content_inventory`, `photos`, `events`, discussions, campaign config, partner/friend data | Define a single data contract for lead story, story rail, feature media, archive spotlight, events, recognition, and submission CTA. |
| Extra route authority | `/fanclub/membercard`, `/fanclub/submit`, `/fanclub/chat`; `scripts/launch-readiness/manifest.json`; current e2e route list | Decide whether routes are canonical, transitional, folded into canonical pages, or explicitly deferred. |
| B2/media mapping | `media_assets`, `content_inventory_media`, `photos.photo_id/url`; `functions/_lib/photo-url.ts` | Confirm thumbnail/detail image sourcing before adding dynamic feature cards or photo/memorabilia details. |

## Recommended follow-on routing

| Task | Recommended use of this report |
| --- | --- |
| Task 002 - Backend service and data-surface reconciliation | Use `blocked` rows G-006, G-008, G-011, G-014, G-019, and G-022 as the required reconciliation list. |
| Task 003 - Fan Club home page shell and static fallback implementation | Use `fix now` rows G-007, G-009, G-013, G-016, G-018, and G-024 for UI/page shell alignment after Task 002 evidence is available. |
| Task 004 - Content management and collection workflow reconciliation | Use G-014 and G-019 for approved-content, submission, source/credit, and publication handoff boundaries. |
| Task 005 - Fan Club dynamic content and media integration | Use G-010, G-011, G-015, G-017, G-021, and G-022 for fail-closed dynamic content integration. |
| Task 006 - Backend/API delta implementation | Implement only backend/API deltas proven by Task 002 and accepted by later source issues. |
| Task 007 - Member-facing flow hardening and navigation integration | Resolve the extra route authority from G-006 before hardening navigation among member-facing routes. |
| Task 008 - Content operations handoff and Cursor runbook package | Convert accepted data/source/credit decisions into operator handoff docs. |
| Task 009 - Program validation and implementation-ready closeout report | Reconcile this gap table against final implemented/deferred/blocked outcomes. |

## Validation notes

Changed docs should pass the repository documentation header check. This report
does not change application code, Functions code, tests, workflows, migrations,
runtime configuration, or issue state.

The inspected `src/**`, `functions/**`, and `tests/**` files are read-only
evidence for this Task 001 report.
