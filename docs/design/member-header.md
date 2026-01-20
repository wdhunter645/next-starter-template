# Member Header Design Specification

## Overview
The member header implements the same locked design pattern as the visitor header: sticky navigation controls with a non-sticky, overlapping logo.

## Locked Behavior

### Header Controls (Sticky)
- **Position**: Fixed at top of viewport
- **Behavior**: Remains visible when scrolling
- **Components**: Navigation buttons (Member Home, Search, Store, Logout) and hamburger menu
- **Z-index**: 1000 (above banner content)
- **Styling**: Semi-transparent background with backdrop blur

### Logo (Non-Sticky)
- **Position**: Absolute positioning within header container
- **Behavior**: Does NOT scroll with sticky header controls
- **Size**: ~240px height (3× baseline of 80px)
- **Aspect Ratio**: Preserved (width scales automatically)
- **Z-index**: 999 (below sticky controls, above banner)
- **Click Target**: Matches visible logo area, remains functional

## Overlap Mechanics

### Layering
The logo overlaps the banner region below the header:
1. Banner layer (base, lowest z-index)
2. Logo layer (z-index: 999, overlaps banner)
3. Sticky controls layer (z-index: 1000, always on top)

### Visual Positioning
- Logo is positioned at `top: 8px, left: 16px` relative to header container
- Logo extends downward into banner area
- Logo does NOT push layout or create extra spacing
- Logo remains in left position (not centered)

## Member Page Banner
The member home page (`/member/page.tsx`) has an additional large logo treatment within the banner itself (lines 85-99), which is separate from the header logo. Both treatments coexist:
- Header logo: Non-sticky, overlaps from header container
- Banner logo: Positioned within member banner, used for visual emphasis

## Responsive Behavior
- Logo size remains consistent across breakpoints
- Click area matches visible logo
- Header controls collapse to hamburger menu on mobile
- Logo layering maintained on all screen sizes

## Guardrails

### DO NOT
- Make the header taller to accommodate the logo
- Make the logo sticky/fixed
- Center the logo
- Block header control clicks with logo layering
- Add extra padding to make room for logo

### DO
- Keep header height at 104px
- Keep logo in left position
- Ensure sticky controls remain clickable
- Maintain logo aspect ratio
- Allow logo to visually overlap banner

## Implementation Reference
- Component: `/src/components/MemberHeader.tsx`
- Logo asset: `/public/IMG_1946.png`
- Size: 240px height (auto width)
