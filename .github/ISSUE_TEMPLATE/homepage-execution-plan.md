---
name: Homepage Execution Plan (Locked Framework)
about: Parent issue orchestrating serialized sub-tasks for LGFC homepage
title: 'LGFC Homepage: Locked Framework v2025-10-31 — Execution Plan'
labels: ['epic', 'spec-locked', 'copilot:run']
assignees: []
---

## Canonical Spec (do not modify)

- Top Notice Bar (optional)
- Header (fixed): **logo → “/”** left; **About · Store · Search · Login** right (exact)
- Hero Banner
- Weekly Photo Matchup
- Join / Login CTA
- Social Wall
- Member Posts Preview
- Milestone Highlight
- Friends of the Fan Club (tiles)
- Upcoming Events / Calendar (month grid)
- Footer: Privacy · Terms · Admin · © YYYY Lou Gehrig Fan Club

**Header rules**: remove any middle/full-width nav; keep the 4 items above on the right, in order.  
**Markers**: keep JSX section markers from `docs/HOMEPAGE_SPEC.md`.

## Orchestration (serialized)

Create sub-issues for each; only **one** active (non-draft) PR at a time.

- [ ] 0. Install/verify spec guard + CODEOWNERS
- [ ] 1. Header reset to spec
- [ ] 2. Hero banner
- [ ] 3. Weekly Photo Matchup placeholder
- [ ] 4. Join/Login CTA
- [ ] 5. Social Wall placeholder (Elfsight hook only)
- [ ] 6. Member Posts Preview placeholder
- [ ] 7. Milestone Highlight placeholder
- [ ] 8. Friends of the Fan Club tiles
- [ ] 9. Calendar Preview (month grid + “View all → /calendar”)
- [ ] 10. Hidden route `/weekly/results` (winner + prior champion)

## Quality Gates (every PR)

- [ ] spec-guard CI green
- [ ] Cloudflare Pages preview green
- [ ] Screenshots attached
- [ ] No deps/lockfile changes
- [ ] Section order/header unchanged unless this issue authorizes it
