---
Doc Type: Reference
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: FanClub home route purpose, section/zone contracts, responsive breakpoints, accessibility requirements, data dependencies
Does Not Own: FanClub subpage specs; API schema details; implementation internals
Canonical Reference: /docs/reference/design/fanclub.md
Related issues: #1685, #1688, #1690, #1962, #2461, #2661, #2662, #2663
Last Reviewed: 2026-08-05
---

# `/fanclub` — FanClub Home Page Specification

## Purpose

Define the authenticated FanClub member home experience and locked newspaper-style section sequence per Program #1685 and `docs/ops/pmo/program-3-club-home-page-design.md`.

## Route / Path

- Canonical route: `/fanclub`
- Access boundary: authenticated members only (`/fanclub/**`)
- Unauthenticated behavior: redirect to `/`

## Section / Component Breakdown

Newspaper-style order (fail-closed static fallbacks when inventory is empty):

| Order | Zone ID | Section | Component |
| --- | --- | --- | --- |
| 1 | `masthead` | Masthead / hero | `ClubHomeMasthead` |
| 2 | `lead-story` | Lead story | `ClubHomeStaticStory` |
| 3 | `story-rail` | Secondary story rail | `ClubHomeStoryRail` |
| 4 | `feature-links` | Feature link cards | `ArchivesTiles` |
| 5 | `media-feature` | Photo / memorabilia feature | `ClubHomeMediaFeature` |
| 6 | `member-prompt` | Member prompt | `ClubHomeMemberPrompt` (links to `/fanclub/chat`) |
| 7 | `archive-spotlight` | Archive spotlight | `ClubHomeArchiveSpotlight` |
| 8 | `campaign` | Campaign / fundraiser module | `ClubHomeDeferredModule` (fail-closed) |
| 9 | `events` | Events / calendar callout | `ClubHomeDeferredModule` (fail-closed) |
| 10 | `recognition` | Recognition / partner tile | `ClubHomeDeferredModule` (fail-closed) |
| 11 | `submission-cta` | Submission CTA | `ClubHomeSubmissionCta` (links to `/fanclub/submit`) |
| 12 | `admin-link` | Admin link (conditional) | `AdminLink` |

Zone IDs are the stable identity for #2663/#2664 to reference; component names may change on refactor without changing zone identity, per #2461's "stable zone ID and human label" requirement.

Page shell: `src/app/fanclub/page.tsx`

## Removed from Club Home (audit #1962)

The following legacy dashboard modules are **not** part of the newspaper Club Home contract. Their capabilities remain on dedicated routes:

- Inline discussion posting (`PostCreation`) → `/fanclub/chat`
- Discussion feed (`DiscussionFeed`) → `/fanclub/chat`
- Gehrig timeline (`GehrigTimeline`) → deferred; not a Club Home section

## Zone Contracts (#2662)

Every zone below traces to #2461's "Newspaper layout zones" and "Content asset model" sections. Visibility is one of two kinds: **always-visible** (renders dynamic content or fails closed to static copy — never disappears) or **conditional** (rendered only when a role/session check passes; absent entirely otherwise). Only `admin-link` is conditional; every other zone is always-visible.

| Zone ID | Visibility | Content source | Destination | Fallback when empty |
| --- | --- | --- | --- | --- |
| `masthead` | Always-visible (fully static) | Session email only | `/fanclub/myprofile` | N/A — no inventory dependency |
| `lead-story` | Always-visible | `club_home` inventory, `story_type: primary` preferred | None (display-only; credit/source shown inline) | Static lead copy supplied by `useClubHomeContent` when inventory is empty |
| `story-rail` | Always-visible | `club_home` inventory, `story_type` in `secondary`/`brief`, up to 4 | None (display-only) | Built-in `STATIC_RAIL_ITEMS` (2 fixed items) |
| `feature-links` | Always-visible (fully static) | None — fixed link set | `/fanclub/photo`, `/fanclub/library`, `/fanclub/memorabilia` | N/A — no inventory dependency |
| `media-feature` | Always-visible | Lead story's associated media, else latest `photos` row | `/fanclub/photo` or `/fanclub/memorabilia` (by `is_memorabilia`) | Static prompt copy plus Gallery/Memorabilia links when no media resolves |
| `member-prompt` | Always-visible (fully static) | None | `/fanclub/chat` | N/A — no inventory dependency |
| `archive-spotlight` | Always-visible | `club_home` inventory, next-highest-ranked row not already used by `lead-story`/`story-rail` | `/fanclub/library` (always shown) | Static "browse the library" copy when no spotlight row resolves |
| `campaign` | Always-visible (deferred placeholder) | None — explicitly gated off pending a campaign program | None | Fixed "no active campaign" message; not hidden, always rendered as a placeholder |
| `events` | Always-visible (deferred placeholder) | None — explicitly gated off pending calendar integration | None | Fixed "events will appear here" message; not hidden |
| `recognition` | Always-visible (deferred placeholder) | None — explicitly gated off pending display-feature work | None | Fixed "recognition highlights will appear here" message; not hidden |
| `submission-cta` | Always-visible (fully static) | None | `/fanclub/submit`, `/fanclub/photo` | N/A — no inventory dependency |
| `admin-link` | **Conditional** — admin role only | Session role | `/admin` | Renders nothing (`null`) for non-admins; not a fail-closed placeholder |

### Content and media constraints

- `lead-story`, `story-rail`, `archive-spotlight` read only `published` rows with `club_home` in `allowed_sections`, per `docs/reference/website/content-inventory-model.md`; no draft/under-review content may reach these zones.
- `media-feature` requires a resolvable, normalized media URL (via `normalizePhotoUrl`) before rendering an image; absent that, it falls back to link-only copy rather than a broken image.
- Every story-bearing zone (`lead-story`, `story-rail`, `archive-spotlight`, `media-feature`) displays credit/source inline when present, consistent with the content-inventory model's `credit_line` requirement; it does not fabricate attribution when absent.

### #2461 zone-category mapping and one open design note

#2461's "Newspaper layout zones" describes three informal groupings — above the fold, side rails and supporting departments, below the fold — and names several candidate side-rail departments explicitly: "Today in Gehrig History," "Fan Club Partners," "Featured Photo," "Join the Conversation," "Share with the Club," "Featured Memorabilia." Mapped against the current implementation:

- **Above the fold:** `masthead`, `lead-story`.
- **Side rail (implemented as such):** `story-rail` ("Today in Gehrig History"-type recurring content), `media-feature` (matches "Featured Photo"/"Featured Memorabilia"), `member-prompt` (matches "Join the Conversation" by name).
- **Below the fold:** `feature-links` (matches "Library, Gallery, and Memorabilia entry points" by name), `archive-spotlight`, `campaign`, `events`, `recognition`, `submission-cta`, `admin-link` (matches "Administrative access" by name) — the last two per the open design note immediately below.

**Open design note, not resolved by this contract:** #2461 names "Fan Club Partners" and "Share with the Club" as *candidate* side-rail departments, but the current implementation places their closest matches — `recognition` and `submission-cta` — as below-the-fold zones (order 10 and 11) instead. #2461 used "candidate" language for its side-rail list, not a strict requirement, and the current below-the-fold placement is already the accepted, implemented state per #2661. This contract preserves that current placement rather than unilaterally moving either zone into the side rail; a future side-rail placement for `recognition` and/or `submission-cta` remains available for Product reconsideration but is not decided here.

## Responsive Behavior (#2662)

### Current known truth

Club Home has **no breakpoint-based responsive layout today**. `clubHomePageStack` (`clubHomeStyles.ts`) is a single-column vertical stack (`flexDirection: column`) with no `@media` queries anywhere under `src/components/fanclub/` or `src/app/fanclub/`. Only `story-rail` and `feature-links` use intrinsic CSS Grid `auto-fit`/`minmax` wrapping — that is card reflow within a zone, not a distinct desktop/tablet/mobile page composition. No sitewide breakpoint values are declared in `docs/reference/design/style-guide.md`; the values below adopt the same 768px/920px pair already used by the closest analogous shared-shell component, `src/components/Header.module.css`, for consistency rather than inventing new numbers.

### Breakpoints

| Name | Range | Basis |
| --- | --- | --- |
| Mobile | `< 768px` | Matches `Header.module.css`'s existing mobile boundary |
| Tablet | `768px – 919px` | Matches `Header.module.css`'s existing tablet boundary |
| Desktop | `≥ 920px` | Matches `Header.module.css`'s existing desktop boundary |

### Intended layout per breakpoint

- **Mobile (`< 768px`):** Single-column stack in the exact zone order in "Section / Component Breakdown" above. This is already what ships today and already satisfies #2461's "ordered newspaper story stream preserving headline hierarchy and section identity" requirement — no change required for mobile.
- **Tablet (`768–919px`):** Two-column layout. Primary column: `masthead`, `lead-story`. Secondary column, positioned alongside the primary column: `story-rail`, `media-feature`, `member-prompt`. All below-the-fold zones (`feature-links`, `archive-spotlight`, `campaign`, `events`, `recognition`, `submission-cta`, `admin-link`) span full width beneath both columns.
- **Desktop (`≥ 920px`):** Same two-region composition as tablet (primary column plus side rail for above-the-fold/side-rail zones, full-width bands below), with additional horizontal breathing room up to the page's existing `1100px` max width (`clubHomePageStack.maxWidth`) rather than a wider unbounded layout — per the site's existing newspaper-restraint visual direction (`docs/explanation/lgfc-design-evolution.md`, Pillar 2).

This is a documentation-only contract; implementing the tablet/desktop column CSS is Phase 1 runtime work, out of #2662's scope.

### Reading-order requirement

DOM order must equal the numbered zone order in "Section / Component Breakdown" at every breakpoint. Any future CSS Grid/Flexbox layout that visually repositions zones into columns must not use `order` (or equivalent) properties that diverge from DOM order — visual column placement is allowed to differ from a strict top-to-bottom single stream, but keyboard tab order and screen-reader reading order must still traverse zones in the numbered sequence.

## Accessibility Requirements (#2662)

### Heading hierarchy — current known truth

`masthead` renders the page's only `<h1>` ("Club Home"). Every other zone renders exactly one `<h2>` as its section heading (a flat sibling structure, not nested) — `lead-story`'s headline and each `story-rail` item's headline are the only `<h3>` elements. No heading level is skipped. This hierarchy is already correct and must be preserved by any future implementation touching these components.

### Reading order

See "Reading-order requirement" above — DOM order must equal visual order and zone-table order at every breakpoint.

### Contrast

All zone body text renders via `clubHomeMutedText` (`rgba(0,0,0,0.75)` ≈ `#404040` on `clubHomeSectionCard`'s white background), which exceeds WCAG AA's 4.5:1 minimum for normal-size text. Requirement: any future zone text must be checked against this same 4.5:1 minimum on white before shipping; do not introduce lighter tones (e.g., unverified light-blue accents) without a contrast check.

### Focus

Current known truth: no custom `:focus`/`:focus-visible` override exists in any reviewed Club Home component; all interactive elements (links, the admin button) rely on the browser's native focus indicator. Requirement: preserve a visible focus indicator on every interactive element; do not strip the native outline without shipping an equally visible custom replacement in the same change.

### Alternative media (alt text)

Current known truth: `media-feature` is the only zone that renders an `<img>`, and it always supplies non-empty alt text (`media.title` or the `'Featured club photo'` fallback — never omitted). Requirement: any future media rendition or gallery work (#2663 scope) must preserve non-empty, descriptive alt text for every informative image; a genuinely decorative image (none exist in Club Home today) would use `alt=""`, not a missing attribute.

### Reduced motion

Current known truth: no CSS transition, animation, or `prefers-reduced-motion` handling exists anywhere in Club Home today — there is nothing to reduce yet. Requirement: any future rotation-reveal, carousel, or transition animation introduced by #2663's edition/rotation work must respect `prefers-reduced-motion: reduce` by disabling or substantially shortening motion for users who request it.

## Data Dependencies

- Member session state from `useMemberSession`
- Dynamic Club Home inventory: `GET /api/fanclub/home` (`club_home` section in `content_inventory`)
- Rotation, media-pairing, and edition contract: `docs/explanation/website/content-strategy.md`, "Club Newspaper rotation, media-pairing, and edition contract (#2663)"
- Feature-link card targets: `/fanclub/photo`, `/fanclub/library`, `/fanclub/memorabilia`
- Discussion workflows: `/fanclub/chat` and discussion APIs
- Editorial submission intake: `/fanclub/submit` → `submission_queue`

## Auth / Access Expectations

- Route is member-only.
- Session/role checks are required before rendering member content.
- Admin-only affordances are conditional UI, not a global route override.

## Key UX / Behavior Notes

- This page is distinct from public home (`/`).
- Section order is locked per Program #1685 newspaper model.
- Floating logo remains present and links to `/`.
- Dynamic modules fail closed to static copy when `club_home` inventory is empty.
- See "Zone Contracts," "Responsive Behavior," and "Accessibility Requirements" above (#2662) for the formal per-zone contract, breakpoint definitions, and accessibility baseline backing this section order.
