---
Doc Type: Report
Audience: Human + AI
Authority Level: Program Evidence
Status: Task #2042 copy reconciliation in progress
source issue: #2041
Parent Program: #2039
Owns: Website public launch gap inventory and routing of gaps to #2039 child tasks
Does Not Own: Runtime implementation, production launch, campaign launch, content automation
Canonical Reference: /docs/ops/pmo/website-public-launch-relaunch-readiness.md
related issues: #1685, #2039, #2041, #2042, #2043, #2044, #2045, #2046, #2047, #2048
Last Reviewed: 2026-06-29
---

# Website Public Launch Gap Inventory

## Purpose

This report inventories the remaining gaps between the #1685 structural website baseline and public-launch readiness for Program #2039.

It converts live repository inspection into bounded implementation recommendations and routes each gap to the correct #2039 child task.

## Scope

This report covers public and member-facing route inventory, navigation/footer review, and gap routing for Program #2039 Tasks #2042–#2048 after Program #1685 closeout.

It does not implement runtime changes, authorize production launch, or define Program #2040 publication automation.

## Current known truth

- Program #1685 structural baseline is closed complete on `main`.
- Program #2039 child tasks #2041–#2048 exist; Task #2041 is the authorized docs-only inventory task.
- `/admin/clubstaging` does not exist; social wall depends on Elfsight; sitemap/robots artifacts are absent; most core public pages are client components.
- Fail-closed campaign and fundraiser placeholders are present on homepage and Fan Club surfaces.

## Intended final state

After Task #2041 merge, Program #2039 has a single authoritative gap inventory that routes each launch-readiness gap to the correct downstream child task with recommended file-touch boundaries, escalations, and a Task #2042 readiness decision.

## Launch boundary

This report does **not** authorize production launch, runtime changes, or Program #2040 publication automation. It routes discovered work into the #2039 child task chain only.

## Predecessor evidence reviewed

- Program #1685 closeout evidence:
  - `docs/ops/reports/website-completion-program-1685-launch-readiness.md`
  - `docs/ops/reports/website-completion-program-closeout.md`
  - `docs/ops/reports/website-completion-program-1685-audit-register.md`
- Production standards:
  - `docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Program #2039 control docs:
  - `docs/ops/pmo/website-public-launch-relaunch-readiness.md`
  - `docs/ops/implementation-plans/website-public-launch-relaunch-readiness.md`

## Program #2040 automation boundary

**Confirmed:** Program #2040 (Automatic Content Publication Capability) is **not required** for public launch readiness.

Public relaunch can proceed with manual/staged content review via `/admin/clubstaging` (#2043) without ingestion, scheduling, auto-publication, or rollback automation owned by #2040.

## Public route inventory

Routes below were verified from `src/app/**/page.tsx` on `main` at 2026-06-29.

| Route | Purpose | Auth | Launch state | Gap summary | Routed task |
| --- | --- | --- | --- | --- | --- |
| `/` | Public homepage | Public | Needs review | Launch copy, social-wall reliability, campaign boundary, per-route SEO/social cards | #2042, #2044, #2045, #2046 |
| `/about` | About the Fan Club | Public | Needs review | Launch copy; donation language needs campaign-boundary review | #2042, #2045 |
| `/contact` | Contact / support | Public | Needs review | Launch copy and metadata | #2042, #2046 |
| `/terms` | Terms of use | Public | Needs review | Legal copy and metadata | #2042, #2046 |
| `/privacy` | Privacy policy | Public | Needs review | Legal copy and metadata | #2042, #2046 |
| `/search` | Site search | Public | Acceptable baseline | Optional launch copy polish; confirm member-only result boundaries in smoke tests | #2042, #2047 |
| `/join` | Join / login entry | Public | Needs review | Public-to-member boundary messaging for relaunch | #2042 |
| `/logout` | Session logout | Public | Acceptable baseline | Smoke-test only | #2047 |
| `/faq` | Public FAQ | Public | Needs review | Launch copy, metadata, moderation expectations | #2042, #2046 |
| `/ask` | Ask / FAQ intake | Public | Needs review | Launch copy, submission messaging, metadata | #2042, #2046 |
| `/events` | Upcoming events | Public | Needs review | Route exists but is **not** listed in canonical design standards; navigation discoverability unclear | #2042, #2046 |
| `/health` | Routing health check | Public / ops | Acceptable baseline | Exclude from public launch marketing; include in operator smoke tests | #2047 |
| `/login` | Legacy login route | Public | Acceptable baseline | Must remain redirect-only per design standards | #2047 |
| `/auth` | Legacy auth route | Public | Acceptable baseline | Must remain redirect-only per design standards | #2047 |
| `/fanclub` | Member Club Home | Member | Needs review | Fail-closed deferred modules are correct; launch copy polish for masthead and static content | #2042 |
| `/fanclub/myprofile` | Member profile | Member | Acceptable baseline | Smoke-test in launch checklist | #2047 |
| `/fanclub/photo` | Photo archives | Member | Acceptable baseline | Smoke-test only | #2047 |
| `/fanclub/library` | Library archives | Member | Acceptable baseline | Smoke-test only | #2047 |
| `/fanclub/memorabilia` | Memorabilia archives | Member | Acceptable baseline | Smoke-test only | #2047 |
| `/fanclub/submit` | Member submission | Member | Acceptable baseline | Smoke-test only | #2047 |
| `/fanclub/chat` | Member chat | Member | Acceptable baseline | Smoke-test only | #2047 |
| `/fanclub/membercard` | Member card | Member | Acceptable baseline | Smoke-test only | #2047 |
| `/admin` | Admin dashboard | Admin | Internal | Missing Club Staging navigation/card | #2043 |
| `/admin/clubstaging` | Admin staging preview | Admin | **Missing** | Route does not exist | #2043 |
| `/admin/fundraiser-preview` | Admin campaign preview | Admin | Internal | Keep admin-only; do not imply live public campaign | #2045, #2047 |
| `/ai-review/*` | AI review snapshots | Restricted | Out of launch scope | Internal review surface; exclude from public launch checklist except operator note | #2047 |

## Navigation and footer review

| Surface | Launch state | Gap | Routed task |
| --- | --- | --- | --- |
| Public header (guest/member) | Matches design standards | No launch blocker identified | — |
| Fan Club header | Matches design standards | No launch blocker identified | — |
| Hamburger menus | Matches design standards | FAQ, Ask, and Events are not hamburger items; confirm relaunch IA is intentional | #2042 |
| Footer | Matches design standards | Privacy, Terms, Contact only; D1 quote loading is acceptable | #2047 |
| Admin navigation | Incomplete for #2039 | No Club Staging item in `AdminNav` or dashboard | #2043 |

## Gap categories

### 1. Public copy and content polish

**Owner task:** #2042

**Required review:**

- Homepage hero, lede, and section headings for relaunch positioning.
- `/about`, `/contact`, `/faq`, and `/ask` launch-facing copy.
- Fan Club public/auth boundary messaging on `/join` and member redirect behavior.
- `/events` route status versus canonical design standards.
- Ensure no references imply unavailable content automation (#2040) or a live fundraiser campaign (#1700).

**Recommended allowlist (Task 002):**

- `src/app/page.tsx`
- `src/app/about/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/faq/page.tsx`
- `src/app/ask/page.tsx`
- `src/app/events/page.tsx` (if retained for launch)
- `src/app/join/**` and related auth copy surfaces as needed
- `src/components/**` for affected public sections only
- `docs/ops/pmo/website-public-launch-relaunch-readiness.md`
- `docs/ops/reports/website-public-launch-gap-inventory.md`

### 2. Admin Club Staging

**Owner task:** #2043

**Required result:**

- Protected route at `/admin/clubstaging`.
- Admin dashboard and `AdminNav` link to Club Staging.
- Staged/sample club content cards using production-like components.
- At least one rotation preview section.
- Clear non-public staging boundary copy.
- No staged content exposed on public routes.
- `/admin/homestaging` remains reserved only.

**Recommended allowlist (Task 003):**

- `src/app/admin/clubstaging/page.tsx`
- `src/app/admin/clubstaging/**`
- `src/components/admin/AdminNav.tsx`
- `src/components/admin/AdminDashboard.tsx`
- `tests/**` for route/auth coverage
- `docs/ops/pmo/website-public-launch-relaunch-readiness.md`

### 3. Media and social reliability

**Owner task:** #2044

**Current state:**

- `SocialWall` depends on Elfsight third-party widget (`elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8`).
- Loading and generic error text exist, but there is no repo-owned fallback content or platform-origin links when the widget fails or omits networks.
- No `src/lib/socialFallbacks.ts` or equivalent fallback model exists.

**Required result:**

- Third-party failure must not produce a broken homepage section.
- Displayed social content must link to originating platforms where shown.
- Facebook and Pinterest omissions must degrade gracefully.
- No scraping or platform-term bypass.

**Recommended allowlist (Task 004):**

- `src/components/SocialWall.tsx`
- `src/components/social-wall.module.css`
- `src/lib/socialFallbacks.ts` (new)
- `src/app/page.tsx` (only if wiring requires it)
- `tests/**`
- `docs/ops/pmo/website-public-launch-relaunch-readiness.md`
- `docs/ops/reports/website-public-launch-gap-inventory.md`

### 4. Donation and fundraiser boundary

**Owner task:** #2045

**Current state:**

- `CampaignSpotlightSlot` on the homepage is fail-closed and renders only when valid published CMS config exists.
- Fan Club deferred "Campaign & Fundraiser" module fails closed with explicit separate-program messaging.
- Admin-only `/admin/fundraiser-preview` exists for operator preview/configuration.
- `/about` mentions donations to ALS organizations in general terms; no public Givebutter/live-campaign surface was found.
- Full fundraiser operations remain Program #1700.

**Required result:**

- Document public-safe donation/fundraiser messaging boundaries.
- Confirm no false live-campaign claims on public routes.
- Document Givebutter/vendor operator actions separately from repo changes.

**Recommended allowlist (Task 005):**

- Docs-first by default:
  - `docs/ops/pmo/website-public-launch-relaunch-readiness.md`
  - `docs/ops/implementation-plans/website-public-launch-relaunch-readiness.md`
  - `docs/ops/reports/website-public-launch-gap-inventory.md`
- Runtime copy corrections only if needed to remove false launch claims:
  - `src/app/about/page.tsx`
  - `src/components/home/CampaignSpotlightSlot.tsx` (copy only, if required)

### 5. SEO, analytics, sitemap, and social cards

**Owner task:** #2046

**Current state:**

- Root `src/app/layout.tsx` defines site-wide title and description only.
- No per-route `metadata` or `generateMetadata` exports were found under `src/app/**`.
- Most core public pages (`/`, `/about`, `/faq`, `/ask`, `/events`, `/search`) are client components (`'use client'`), so per-route metadata must be implemented via server layouts/wrappers rather than page exports alone.
- No `src/app/sitemap.ts`, `src/app/robots.ts`, `public/sitemap.xml`, or `public/robots.txt` found.
- `functions/[[path]].ts` pass-through expects `/robots.txt` and `/sitemap.xml`, but artifacts are absent.
- `GoogleAnalytics` loads only when `NEXT_PUBLIC_GA_ID` is set; no hardcoded secrets observed.
- No Open Graph or Twitter card metadata configured.

**Required result:**

- Launch-grade metadata for core public routes.
- Sitemap and robots behavior verified or corrected.
- Social preview cards documented or implemented safely.
- GA and Search Console operator boundaries documented without hardcoded secrets.

**Recommended allowlist (Task 006):**

- `src/app/layout.tsx`
- `src/app/sitemap.ts` and/or `src/app/robots.ts` (if added)
- `public/**` static SEO assets (if added)
- Route-level server layouts or wrappers for client pages, for example:
  - `src/app/about/layout.tsx`
  - `src/app/faq/layout.tsx`
  - `src/app/ask/layout.tsx`
  - `src/app/events/layout.tsx`
  - `src/app/search/layout.tsx`
  - additional route `layout.tsx` files as needed for homepage/metadata boundaries
- `docs/ops/pmo/website-public-launch-relaunch-readiness.md`
- `docs/ops/reports/website-public-launch-seo-analytics-readiness.md` (new report expected)

### 6. Launch checklist, smoke tests, rollback, and evidence

**Owner task:** #2047

**Current state:**

- No launch checklist, smoke-test, rollback, or evidence-template docs exist under `docs/how-to/website/` or `docs/ops/reports/` for #2039.

**Required docs (Task 007):**

- `docs/how-to/website/website-public-launch-checklist.md`
- `docs/how-to/website/website-production-smoke-test.md`
- `docs/how-to/website/website-production-rollback.md`
- `docs/ops/reports/website-public-launch-evidence-template.md`

**Smoke areas to cover:**

- Public routes (`/`, `/about`, `/contact`, `/faq`, `/ask`, `/search`, `/join`, `/events`)
- Legal pages (`/privacy`, `/terms`)
- Legacy/auth compatibility routes (`/login`, `/auth`, `/logout`)
- Auth boundary (`/fanclub/**` redirect for guests)
- Admin routes including future `/admin/clubstaging`
- Donation/campaign fail-closed behavior
- Social-wall fallback behavior
- SEO/sitemap/robots/social-card checks
- Analytics/Search Console operator checks
- Cloudflare Pages deployment verification

### 7. Program validation and handoff

**Owner task:** #2048

Deferred until Tasks #2042–#2047 are merged or explicitly dispositioned.

## Escalations for Bill/Atlas

| Item | Decision needed |
| --- | --- |
| `/events` route | Retain for public launch and add to navigation/metadata, or defer/hide until calendar integration is launch-ready |
| `/events` vs design standards | Reconcile undocumented route with `LGFC-Production-Design-and-Standards.md` canonical route list |
| Production GA / Search Console | Confirm operator-owned IDs and dashboard configuration outside the repo |
| Cloudflare production secrets | See OPS gap #2090; operator configuration remains outside #2041 |
| #2039 post-merge closeout failure on docs PR #2057 | Administrative remediation; does not block Task 002 if docs remain valid on `main` |

## Task 002 readiness decision

**Program #2039 may safely proceed to Task 002 (#2042)** after this inventory PR merges, provided Bill/Atlas accept the routed gap list.

Task 002 should begin with the public copy/content gaps listed above. Tasks #2043–#2047 may proceed in program order as separately authorized; Task 004 depends on Task 003 per the implementation plan.

## Downstream task sequence reminder

| Order | issue | Depends on |
| ---: | ---: | --- |
| 1 | #2041 | #1685 closeout |
| 2 | #2042 | #2041 |
| 3 | #2043 | #2041 |
| 4 | #2044 | #2041, #2043 |
| 5 | #2045 | #2041 |
| 6 | #2046 | #2042 |
| 7 | #2047 | #2041–#2046 |
| 8 | #2048 | #2041–#2047 |
