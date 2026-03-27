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

# Component Mapping

About Lou Gehrig → src/components/AboutLouGehrig
