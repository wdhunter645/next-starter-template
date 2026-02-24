---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: Routes, navigation invariants, UI/UX contracts, page content contracts
Does Not Own: How-to procedures; operational runbooks; governance policies
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-02-20
---

# Home Page Design Specification (Authoritative)

This document is the **single source of truth** for the public HOME page structure and section ordering.

## Canonical Section Order (must match `src/app/page.tsx`)

1) Hero Banner  
2) Weekly Photo Matchup  
3) Join CTA  
4) About Lou Gehrig  
5) Social Wall  
6) Recent Discussions (teaser)  
7) Friends of the Fan Club  
8) Milestones  
9) Calendar  
10) FAQ

## Terminology and Aliases (drift guardrail)

**Canonical feature name (UI + docs):** *Weekly Photo Matchup*.

Conversation shorthand that refers to the same feature (do not create new files for these names):
- Weekly Matchup
- Photo Matchup
- Weekly Vote *(note: “Weekly Vote” is a nav/routing label in transition; do not rename/delete weekly-related routes unless the canonical design docs explicitly finalize it)*

**Canonical implementation anchors (must not fork):**
- UI component: `src/components/WeeklyMatchup.tsx`
- API (Cloudflare Pages Functions): `functions/api/matchup/{current,vote,results}.ts`

## Section-to-Component Map (code source of truth)

- Hero Banner → `src/app/page.tsx` (hero header markup)
- Weekly Photo Matchup → `src/components/WeeklyMatchup`
- Join CTA → `src/components/JoinCTA`
- About Lou Gehrig → `src/components/AboutLouGehrig`
- Social Wall → `src/components/SocialWall`
- Recent Discussions (teaser) → `src/components/RecentDiscussionsTeaser`
- Friends of the Fan Club → `src/components/FriendsOfFanClub`
- Milestones → `src/components/MilestonesSection`
- Calendar → `src/components/CalendarSection`
- FAQ → `src/components/FAQSection`

## Documented-but-missing UI (must be implemented)

A compact banner strip displayed **above the site header** on all public pages.

- Component: `src/components/TopNoticeBar`
- Mounted in: `src/app/layout.tsx` above `<SiteHeader />`
- Copy:
  - Left: "🎗️ 100% of proceeds support ALS research via ALS Cure Project."
- Behavior:
  - Always visible (until a future PR introduces a toggle)
  - Must be keyboard accessible
  - Must not shift layout unexpectedly (fixed height, predictable padding)

## Join CTA Section Contrast Requirements (locked)

### Background Color
The Join CTA section uses the LGFC blue brand color:
- **CSS Variable**: `var(--lgfc-blue)`
- **Hex Value**: `#0033cc`
- **RGB Value**: `rgb(0, 51, 204)`

### Text Color Requirement
All text within the Join CTA section MUST be white for proper contrast, including headings, body copy, and links.

### Implementation (Authoritative)
CSS must ensure headings do not inherit `var(--lgfc-blue)` on the blue background.

### Buttons Exception
Join/Login buttons may use white backgrounds with dark text for hierarchy while maintaining contrast.

## Notes on Documentation Drift (tracked)
The following sections exist on the HOME page and are now explicitly documented here:
- Social Wall
- Recent Discussions (teaser)
- About Lou Gehrig
If any future homepage sections are added, this document MUST be updated in the same PR.
