---
Doc Type: How-To
Audience: Human + AI
Authority Level: Operational
Owns: Program #2039 production smoke-test procedure
Does Not Own: Automated CI replacement for operator sign-off
Canonical Reference: /docs/ops/reports/website-public-launch-gap-inventory.md
Related issues: #2039, #2047
Last Reviewed: 2026-07-01
---

# Website Production Smoke Test

## Purpose

Executable smoke coverage for public relaunch verification.

## Public routes

- [ ] `/`, `/about/`, `/contact/`, `/faq/`, `/ask/`, `/search/`, `/join/`, `/events/`
- [ ] `/privacy/`, `/terms/`
- [ ] `/login/`, `/auth/`, `/logout/`

## Member and admin boundaries

- [ ] Guest visiting `/fanclub/` is redirected/denied
- [ ] Admin routes require admin session
- [ ] `/admin/clubstaging/` shows staging boundary banner only

## Launch readiness surfaces

- [ ] Social wall shows widget or fallback platform links
- [ ] Campaign spotlight hidden when CMS config disabled
- [ ] `/sitemap.xml` and `/robots.txt` reachable
- [ ] Core pages expose expected metadata in HTML head
