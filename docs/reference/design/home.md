---
Doc Type: Design Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Homepage section layout and component mapping
Does Not Own: Component implementation; global navigation standards
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-27
---

# Homepage Layout

The homepage uses a fixed canonical section order.

---

# Homepage Canonical Section Order

1. Hero Banner
2. Campaign Spotlight (conditional slot; omitted when inactive)
3. Weekly Photo Matchup
4. Join CTA
5. About Lou Gehrig
6. Social Wall
7. Recent Discussions (teaser)
8. Friends of the Fan Club
9. Milestones
10. Calendar
11. FAQ

When the campaign spotlight is inactive, the slot is removed and Weekly Photo Matchup becomes the second rendered section.

---

# Homepage Section → Component Mapping

| Homepage section | Ownership status | Component / file mapping |
|---|---|---|
| Floating logo (homepage-only behavior) | Implemented | `src/components/FloatingLogo.tsx` (invoked in `src/app/page.tsx`) |
| Hero Banner | Implemented (inline in page) | `src/app/page.tsx` hero `<header id="banner">` block |
| Campaign Spotlight slot | Implemented | `src/components/home/CampaignSpotlightSlot.tsx` |
| Weekly Photo Matchup | Implemented | `src/components/WeeklyMatchup.tsx` |
| Join CTA | Implemented | `src/components/JoinCTA.tsx` |
| About Lou Gehrig | Implemented (inline in page) | `src/app/page.tsx` `<section id="about-lou-gehrig">` block |
| Social Wall | Implemented | `src/components/SocialWall.tsx` |
| Recent Discussions teaser | Implemented | `src/components/RecentDiscussionsTeaser.tsx` |
| Friends of the Fan Club | Implemented | `src/components/FriendsOfFanClub.tsx` |
| Milestones | Implemented | `src/components/MilestonesSection.tsx` |
| Calendar | Implemented | `src/components/CalendarSection.tsx` |
| FAQ | Implemented | `src/components/FAQSection.tsx` |

## Planned Extraction Mapping (non-blocking)

The following sections are currently implemented inline in `src/app/page.tsx` and may be extracted later for consistency; this is planning guidance, not a statement that files already exist.

- Hero Banner → planned `src/components/home/HeroBanner.tsx`
- About Lou Gehrig → planned `src/components/home/AboutLouGehrigSection.tsx`

---

## Related Specs

- `/docs/reference/design/home-discussions.md`
- `/docs/reference/design/home-friends.md`
- `/docs/reference/design/home-milestones.md`
- `/docs/reference/design/home-calendar.md`
