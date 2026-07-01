---
Doc Type: Report
Audience: Human + AI
Authority Level: Program Evidence
Status: Draft until #2046 PR merge
source issue: #2046
Parent Program: #2039
Owns: Task 006 SEO, analytics, sitemap, metadata, and social-card readiness evidence
Does Not Own: Production GA/Search Console account provisioning or legal copy approval
Canonical Reference: /docs/ops/reports/website-public-launch-gap-inventory.md
related issues: #2039, #2042, #2046, #2047
Last Reviewed: 2026-07-01
---

# Website Public Launch SEO and Analytics Readiness

## Purpose

Record Task #2046 launch-grade metadata, sitemap/robots, and analytics boundary evidence for Program #2039.

## Scope

Core public routes, static `sitemap.xml` and `robots.txt` generation, root Open Graph/Twitter defaults, and per-route server layout metadata for client pages. Does not hardcode production analytics secrets.

## Current known truth

- Root layout exports `metadataBase`, default title template, Open Graph, and Twitter card defaults.
- Public routes use server `layout.tsx` metadata wrappers for `/about`, `/faq`, `/ask`, `/events`, `/search`, and `/contact`.
- `src/app/sitemap.ts` and `src/app/robots.ts` export static launch sitemap/robots artifacts.
- `GoogleAnalytics` remains env-gated via `NEXT_PUBLIC_GA_ID`.
- `/fanclub/**` and `/admin/**` are disallowed in robots rules.

## Intended final state

Search engines and social preview crawlers receive consistent metadata for core public pages. Operators configure GA and Search Console outside the repo using documented env boundaries.

## Route metadata coverage

| Route | Metadata source |
| --- | --- |
| `/` | Root layout defaults |
| `/about/` | `src/app/about/layout.tsx` |
| `/faq/` | `src/app/faq/layout.tsx` |
| `/ask/` | `src/app/ask/layout.tsx` |
| `/events/` | `src/app/events/layout.tsx` |
| `/search/` | `src/app/search/layout.tsx` |
| `/contact/` | `src/app/contact/layout.tsx` |
| `/privacy/`, `/terms/` | Root defaults (legal review escalated in #2042) |

## Analytics and Search Console boundaries

| Item | Repo behavior | Operator action |
| --- | --- | --- |
| Google Analytics | Loads only when `NEXT_PUBLIC_GA_ID` is set at build time | Bill/Atlas set Cloudflare Pages env var |
| Search Console verification | Not embedded in repo | Operator-owned DNS/HTML verification |
| Secrets | No hardcoded GA IDs in source | Use environment configuration only |

## Operator follow-up

1. Set production `NEXT_PUBLIC_GA_ID` in Cloudflare Pages when launch is authorized.
2. Submit `https://www.lougehrigfanclub.com/sitemap.xml` in Search Console after deploy.
3. Complete legal review for `/privacy/` and `/terms/` before relaunch messaging finalization.
