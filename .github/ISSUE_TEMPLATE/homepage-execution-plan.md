---
name: Homepage Execution Plan (Locked Framework)
description: Parent issue orchestrating serialized sub-tasks for LGFC homepage
title: "LGFC Homepage: Locked Framework v2025-10-31 — Execution Plan"
labels: ["epic","spec-locked","copilot:run"]
assignees: []
---

## Canonical Spec (do not modify)
- Top Notice Bar (optional)
- Header (fixed): **logo → “/”** on left; **About · Store · Search · Login** on right (exact)
- Hero Banner
- Weekly Photo Matchup
- Join / Login CTA
- Social Wall
- Member Posts Preview
- Milestone Highlight
- Friends of the Fan Club (tiles)
- Upcoming Events / Calendar (grid, month view)
- Footer: Privacy · Terms · Admin · © YYYY Lou Gehrig Fan Club

**Header rules**: remove any middle/full-width nav; only the 4 items above on the right, in order.  
**Markers**: keep JSX section markers from `docs/HOMEPAGE_SPEC.md`.

## Orchestration (serialized)
Create sub-issues for each step below. At any time only **one** PR is active (non-draft). Next step begins **after** merge.

- [ ] 0. Install/verify spec guard + CODEOWNERS
- [ ] 1. Header reset to spec (logo left; right = About, Store, Search, Login)
- [ ] 2. Hero banner (no marketing paragraph)
- [ ] 3. Weekly Photo Matchup placeholder
- [ ] 4. Join/Login CTA
- [ ] 5. Social Wall placeholder (Elfsight hook only)
- [ ] 6. Member Posts Preview placeholder
- [ ] 7. Milestone Highlight placeholder
- [ ] 8. Friends of the Fan Club (rename + tiles)
- [ ] 9. Calendar Preview (month grid placeholder; “View all → /calendar”)
- [ ] 10. Hidden route scaffold `/weekly/results` (Last Week’s Winner + Prior Cycle Champion)

## Quality Gates (every PR)
- [ ] `spec-guard` CI green
- [ ] Cloudflare Pages preview build green
- [ ] Screenshots of affected section(s)
- [ ] No dependency changes (incl. package-lock)
- [ ] Section order/header unchanged unless this issue explicitly authorizes it
