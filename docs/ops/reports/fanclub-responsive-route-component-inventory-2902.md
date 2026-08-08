---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: #2858 Task 001 (#2902) Fan Club responsive route/component/state/breakpoint inventory and baseline evidence
Does Not Own: Responsive implementation (#2903–#2904), Production merge, #2857 photo-intake/detail contracts, public homepage redesign
Canonical Reference: /docs/ops/reports/fanclub-responsive-route-component-inventory-2902.md
Related Issues: #2858, #2902, #2903, #2904, #2905, #2857
Last Reviewed: 2026-08-08
---

# Fan Club Responsive Inventory — #2858-001 / #2902

## Pre-implementation checkpoint

| Field | Value |
| --- | --- |
| Lane | Lane 2 — Cursor Local (`#2858`) |
| Source issue | `#2902` |
| Parent project | `#2858` |
| Component branch | `component/fanclub-responsive-completion` |
| Component SHA (bound) | `00e1608adb8ff27b24eae2fa995372e79c2ab8eb` |
| Working branch | `cursor/2902-fanclub-responsive-inventory` |
| Delivery model | Model B child → PR target `component/fanclub-responsive-completion` |
| Production | **Not authorized** |
| Collision check | Open PR `#3186` (library recovery verification) touches only `docs/ops/reports/library-content-recovery-verification-2912.md` + library tests — **no Fan Club responsive path overlap** |
| Upstream dependency | `#2857` remains governing for **final accepted photo-surface contracts** (binary intake, photo-detail, moderation). This inventory does **not** implement those contracts |

### Exact writable allowlist (this task)

- `docs/ops/reports/fanclub-responsive-route-component-inventory-2902.md`
- `tests/fanclub-responsive-inventory.test.ts`

All other paths are out of scope for `#2902`.

## Purpose

Complete the `#2858-001` inventory: authenticated Fan Club routes, shared components, loading/empty/error/form/media/list states, approved breakpoints, baseline evidence, and successor implementation/test implications — without weakening authentication or access control.

## Auth and shell (as-built)

| Surface | Mechanism | Responsive notes |
| --- | --- | --- |
| Route gate | `src/app/fanclub/layout.tsx` — `useMemberSession({ redirectTo: '/' })`; renders `null` while loading / unauthenticated | Loading is blank (no skeleton); preserve fail-closed redirect |
| Global header switch | `src/components/SiteHeader.tsx` — `/fanclub/**` → `FanClubHeader` | Floating logo footprint at `/` and `/fanclub` root |
| Member header | `src/components/FanClubHeader.tsx` + `FanClubHeader.module.css` | Hamburger-only ≤767px; logo/layout tweaks at 920px / 520px |
| Drawer | `HamburgerMenu` variant `fanclub` | Items: Club Home, My Profile, Search, Store (external), Logout, About, Contact — **does not list** Photo / Library / Memorabilia / Chat / Submit |

Authentication and access control are **preserved** for successors: no inventory change weakens session gating or credentials-on-fetch patterns.

## Approved viewport / breakpoint matrix

Aligned with existing `#1259` Task 004 contract (`tests/public-mobile-responsive-validation.test.ts`) plus Fan Club grid CSS:

| Viewport | Width (px) | Shell expectation | Primary evidence today |
| --- | --- | --- | --- |
| Mobile | 390 | `FanClubHeader` hamburger-only; no center btn row | Playwright `mobile-navigation.spec.ts` + CSS `@media (max-width: 767px)` |
| Tablet | 768 | Center buttons visible | Playwright |
| Desktop narrow | 920 | Center buttons + logo footprint rules | Playwright + CSS `@media (max-width: 920px)` |
| Desktop | 1280 | Full header | Playwright |
| Grid expand | ≥900 | Photo/memorabilia 3-column grid | `fanclubGridStyles.module.css` |

**Hamburger switch:** `HAMBURGER_ONLY_MAX_WIDTH_PX = 767`.

## Route / component / state matrix

| Route | Page file | Key components | States observed | Baseline responsive posture |
| --- | --- | --- | --- | --- |
| `/fanclub` | `src/app/fanclub/page.tsx` | `FloatingLogo`, Club Home stack (`ClubHomeMasthead`, story rail, `ArchivesTiles`, media feature, deferred modules, `ClubHomeSubmissionCta`, `AdminLink`) | Session loading → `null`; content via `useClubHomeContent` (lead/rail/media/archive/deferred empty reasons) | Desktop-first stack; e2e overflow check on `/fanclub` only among fanclub deep routes |
| `/fanclub/myprofile` | `src/app/fanclub/myprofile/page.tsx` | Profile form + `MembershipCardSection` | loading profile; dirty form; save message; hash scroll `#membership-card` | Form/card use fixed widths / flexWrap; **no route-level media queries** — successor `#2903` |
| `/fanclub/membercard` | `src/app/fanclub/membercard/page.tsx` | Redirect to `/fanclub/myprofile#membership-card` | Redirect message while navigating | Thin redirect surface |
| `/fanclub/photo` | `src/app/fanclub/photo/page.tsx` | Search/tags pills, `fanclubThreeColumnGridClassName`, gallery cards | loading; error string; empty list; tag filter; submit-photo link | Grid 1→3 cols @900px; **photo detail / binary intake owned by `#2857`** — do not redefine contracts here |
| `/fanclub/library` | `src/app/fanclub/library/page.tsx` | Search form, single-column card list | loading; empty; error message; query param `q` | Single-column cards; padding/maxWidth inline — successor `#2904` |
| `/fanclub/memorabilia` | `src/app/fanclub/memorabilia/page.tsx` | Tags/search, 3-col grid, related library | loading; empty; error; pagination offset; related entries | Grid @900px; related block; successor `#2904` |
| `/fanclub/chat` | `src/app/fanclub/chat/page.tsx` | Composer + feed | loading; error; empty; missing email banner; report path | Inline layout; forms need touch/keyboard review — `#2903`/`#2904` |
| `/fanclub/submit` | `src/app/fanclub/submit/page.tsx` | Article submit form | busy; validation gate; success/error message | Form grid; PDF upload deferred; `#2903` form polish |

### Shared Fan Club components (inventory)

| Component | Path | Responsive relevance |
| --- | --- | --- |
| `FanClubHeader` | `src/components/FanClubHeader.tsx` | Primary shell — already breakpoint-aware |
| `HamburgerMenu` | `src/components/HamburgerMenu.tsx` | Fanclub drawer IA gap vs in-page Club Home tiles |
| `fanclubGridStyles` | `src/components/fanclub/fanclubGridStyles.*` | 900px 3-col switch for photo/memorabilia |
| Club Home suite | `src/components/fanclub/ClubHome*.tsx`, `ArchivesTiles`, `WelcomeSection`, etc. | Mostly desktop stack; tile grids need tablet/mobile verification |
| `MembershipCardSection` | `src/components/fanclub/MembershipCardSection.tsx` | Fixed ~190px card images; flexWrap |
| `PhotoLightboxGrid` | `src/components/fanclub/PhotoLightboxGrid.tsx` | Media/dialog — coordinate with `#2857` detail UX |
| `DiscussionFeed` / `PostCreation` | `src/components/fanclub/*` | Chat-adjacent patterns |
| `fanclubApi` | `src/lib/fanclubApi.ts` | URL builders only |

### Linked non-`/fanclub` surfaces (header only)

`FanClubHeader` / hamburger also link to `/search`, Bonfire Store (external), `/logout`, `/about`, `/contact`. These are **not** authenticated Fan Club routes under `src/app/fanclub/layout.tsx`, but shell navigation must remain usable at mobile breakpoints (already covered for header CSS).

## Baseline evidence (overflow, focus, nav, keyboard, touch, zoom, orientation)

| Check | Status | Evidence / gap |
| --- | --- | --- |
| Header hamburger ≤767 | **Preserved** | `FanClubHeader.module.css`; unit + playwright contracts |
| Touch target ≥44px (hamburger) | **Preserved** (priority routes) | `tests/e2e/mobile-navigation.spec.ts` |
| No horizontal overflow | **Partial** | Playwright asserts on `/` and `/fanclub` only — **deficient** for `/fanclub/photo|library|memorabilia|myprofile|chat|submit` |
| Keyboard / focus in drawer | **Partial** | Existing hamburger tests; deep-route forms/dialogs not fully covered |
| Zoom / orientation | **Deficient** for Fan Club deep routes | Not recorded per-route; successor `#2905` Production/viewport evidence |
| Fan Club deep-route e2e matrix | **Deficient** | Priority e2e list is only `['/', '/fanclub']` |
| Auth fail-closed | **Preserved** | Layout + per-page session checks; `credentials: 'include'` on Fan Club fetches (ops tests) |
| Nav IA completeness | **Deficient** | Drawer omits Photo/Library/Memorabilia/Chat/Submit (reachable from Club Home tiles / in-page links) |

## Preserved vs deficient summary

**Preserved (keep for `#2903+`):**

- Session-gated `/fanclub/**` layout.
- Header hamburger/CSS breakpoint contract at 767/920/520.
- Existing overflow guard pattern and touch-target assertion for Club Home.
- Credentials-on-fetch for Fan Club APIs.
- Photo/memorabilia 3-column grid breakpoint at 900px as a starting layout contract.

**Deficient (drive successors):**

1. Deep Fan Club routes lack automated overflow / viewport evidence.
2. Drawer IA incomplete vs authenticated product surfaces.
3. Profile / membership card / chat / submit forms lack dedicated responsive CSS.
4. Photo **detail** and **binary intake** UX not finalized — blocked on `#2857` acceptance for those increments only.
5. Orientation/zoom/keyboard deep-route checklist not yet executed as Production viewport evidence (`#2905`).

## Implications for successors

### `#2903` — shared shell, navigation, profile, auth, forms

- Expand Fan Club drawer and/or document intentional secondary IA (tiles-only) with Bill/Atlas acceptance.
- Responsive CSS for profile form + membership card images.
- Chat composer / submit form touch targets, focus order, readable text at 390/768.
- Do **not** change auth redirect semantics.
- **Stop** if work would require `#2857` final photo-detail/intake contracts.

### `#2904` — gallery, photo, library, memorabilia, search

- Extend overflow + layout verification to photo/library/memorabilia grids and filters.
- Align search UX in-header (`/search`) vs in-page filters.
- Consume `#2857` accepted photo-detail / intake contracts when integrating detail modals or upload entry points; until then preserve current list/browse behavior.
- Library/memorabilia list density and tag pill wrapping at mobile.

### `#2905` — cross-route qualification, rollback, Production handoff

- Full viewport matrix evidence for every authenticated Fan Club route in the table above.
- Keyboard, zoom, orientation, focus traps for dialogs/lightbox.
- Rollback = revert responsive CSS/component commits on `component/fanclub-responsive-completion` without backend auth changes.
- **No Production merge** without separate authorization.

## Protected stops applied

| Condition | Action |
| --- | --- |
| `#2857` photo contracts incomplete | Inventory proceeds; **implementation** of intake/detail deferred |
| Collision with `#3186` | None — different paths |
| Production | Not authorized — PR targets component branch only |

## Validation (this PR)

```bash
git rev-parse HEAD
npm test -- tests/fanclub-responsive-inventory.test.ts tests/public-mobile-responsive-validation.test.ts tests/mobile-navigation.test.tsx
DOCS_HEADER_FILE_LIST=<(printf '%s\n' docs/ops/reports/fanclub-responsive-route-component-inventory-2902.md) ./scripts/ci/docs_check_headers.sh .
```

## Acceptance criteria mapping

| Criterion | Status |
| --- | --- |
| Complete route/component/state and viewport matrix | Met — this report |
| Baseline overflow/focus/nav/keyboard/touch/zoom/orientation evidence | Met as inventory baseline; gaps explicit |
| Preserved vs deficient identified | Met |
| Exact implementation/test implications for successors | Met — `#2903`–`#2905` |
| No weakening of authentication or access control | Met — docs/tests only |
