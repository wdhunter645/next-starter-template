# Header + MemberHeader + Logo + Banner — LOCKED-IN DESIGN (Do Not Regress)

## Purpose
This document is the source of truth for:
- Public header (Header.tsx)
- FanClub header (MemberHeader.tsx)
- Site-level header selector (SiteHeader.tsx)
- Floating/non-sticky logo behavior (FloatingLogo.tsx)
- Visual relationship between:
  - floating logo
  - sticky header
  - homepage banner/hero
  - initial scroll transitions

This file exists because the header/logo system has been reworked repeatedly across multiple sessions. The goal is to make regression *hard* and restoration *mechanical*.

---

## Non-negotiable design goals
### G1 — Button group coherence
- The navigation buttons and hamburger menu must behave as one cohesive group.
- The hamburger must not appear “stranded” away from the buttons.

### G2 — Stable sticky header
- The header is sticky while scrolling.
- The header must not jump, resize, or reflow unexpectedly as the user scrolls.

### G3 — Floating logo is NOT sticky
- The “big logo” is not part of the sticky header.
- It behaves as its own object.

### G4 — Floating logo is visually tied to the header + banner
- The floating logo sits at the top-left “corner zone” and visually overlaps the header/border and the top-left edge of the banner/hero region.
- The header and banner should appear to run behind it (layering/z-index), producing a “badge pinned to the corner” effect.

### G5 — Floating logo scroll behavior
Target behavior (the “classic” look):
- The floating logo remains visible as the page begins to scroll.
- It disappears only when it naturally scrolls off the top with the content, OR when the banner/hero region is mostly leaving the viewport.
- It must NOT vanish on a 1–2 pixel scroll (this was an observed regression).

---

## Component responsibilities
### 1) `SiteHeader.tsx` — Route-based selection only
**Responsibility**
- Choose `Header` vs `MemberHeader` based on route.
- Decide where/when the floating logo is rendered (and whether header renders the small logo).

**Rules**
- `/fanclub` and `/fanclub/**` => `MemberHeader`
- Everything else => `Header`
- Floating logo may be shown on:
  - `/` (home)
  - `/fanclub` (FanClub home)
- When floating logo is shown, the header’s small logo must be hidden to avoid double-logos.

**Locked behavior**
- `showFloatingLogo` boolean determines whether to render `<FloatingLogo />`
- Pass `showLogo={!showFloatingLogo}` into `Header` and `MemberHeader`

**Implementation shape**
- `showFloatingLogo` is derived from pathname
- `isFanClub` derived from pathname prefix

### 2) `Header.tsx` — Public header layout
**Responsibility**
- Sticky header container.
- Left constrained small logo (optional).
- Centered nav button group (always centered visually).
- Hamburger included inside the centered group (as last item).

**Layout invariants**
- Header is sticky: `position: sticky; top: 0; z-index: 50;`
- Logo hitbox is constrained: left container width fixed (72px) and does not intercept clicks except the logo link.
- Center nav group is truly centered: absolute positioning relative to `.inner`, translated `-50%/-50%`.

**Center nav content rules**
Public not logged in:
- Join, Search, Store (external), Login, Hamburger
Logged in:
- Search, Store, Club, Logout, Hamburger

### 3) `MemberHeader.tsx` — FanClub header layout
Same structural rules as public header:
- sticky
- optional small logo
- centered button group
- hamburger grouped with buttons

FanClub button order:
- Club Home, My Profile, Search, Store (external), Logout, Hamburger

### 4) `FloatingLogo.tsx` — The “big” non-sticky logo
**Responsibility**
- Renders a large logo badge at top-left.
- Must not interfere with header centering.
- Must not cause header height changes.
- Scroll behavior must match G5 (not instant vanish).

**Two acceptable implementations**
A) Preferred (“natural scroll away”):
- FloatingLogo is placed in normal flow above the banner section and scrolls away naturally.
- Requires it to be rendered in page layout above banner, not `position: fixed`.

B) Acceptable fallback (“fixed + threshold”):
- `position: fixed` but hide only after a meaningful scroll boundary.
- If this is used, the threshold must be tuned so the logo does not vanish immediately.

**Hard rule**
- No unused imports/vars (Cloudflare fails builds on eslint errors).

---

## CSS invariants (do not regress)
### Header and MemberHeader CSS
- `.header` sticky with z-index 50
- `.inner` is relatively positioned and fixed height (72px)
- `.left` is a constrained hitbox:
  - width/max-width 72px
  - `overflow: hidden`
  - `pointer-events: none` on container
  - `pointer-events: auto` on link/image only
- `.center` is absolute centered group
- `.btn` is consistent across both headers
- Hamburger must be within the centered group:
  - `.right` container becomes inline-flex inside `.center`, NOT absolute right corner

### Floating logo CSS
- Must layer above header and banner:
  - z-index > header (e.g. 120)
- Must not introduce a white “card/box” unless explicitly desired.
- Should scale to fill its own intended size region.

---

## Known failure modes (don’t repeat)
1) Regex-based JSX prop patching produced invalid JSX:
   - `<Header showLogo / showLogo={...}>` (invalid)
2) Importing FloatingLogo without rendering it caused Cloudflare build fail:
   - eslint unused-vars treated as error
3) “Hide on tiny scroll” behavior feels wrong:
   - disappears too early; violates the “classic” expected behavior
4) Search tooling mismatch:
   - `rg` not installed in some envs; don’t rely on it for recovery steps

---

## Acceptance criteria for this design (visual + functional)
### Desktop
- Buttons + hamburger are a cohesive centered group
- Header remains sticky and stable while scrolling
- Floating logo appears top-left and visually overlaps header/banner
- Floating logo does not vanish immediately on tiny scroll
- Logo link returns to home
- Hamburger menu opens and the first link is not cramped against the close “X”

### Mobile / narrow widths
- Center group wraps as needed without breaking header height
- Hamburger remains accessible and does not overlap text/buttons

---

## Files that implement this design (current)
- `src/components/SiteHeader.tsx`
- `src/components/Header.tsx`
- `src/components/MemberHeader.tsx`
- `src/components/Header.module.css`
- `src/components/MemberHeader.module.css`
- `src/components/FloatingLogo.tsx`
- `src/components/FloatingLogo.module.css`
- (menu spacing) `src/components/HamburgerMenu*.module.css` + member equivalent

---

## Change control rule
Any future change to header/logo/banner MUST:
1) Preserve the invariants above
2) Update this file in the same commit
3) Include before/after screenshots (or at minimum, explicit verification notes)
