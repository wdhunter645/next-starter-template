---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: F1/F2 live-state evidence for `/privacy` and `/terms` D1-composed rendering, per the #2919 approved Product Decision Record item 1
Does Not Own: Legal conclusions, public-copy authorship, or the resulting `/privacy`/`/terms` copy change (owned by #2920)
Canonical Reference: /docs/ops/reports/compliance-product-decision-register-2919.md
Related Issues: #2784, #2918, #2919, #2920
Last Reviewed: 2026-08-05
---

# `/privacy` and `/terms` Live D1 State — Evidence (#2919)

## Purpose

Record what can and cannot be confirmed about the live, currently-rendered composition of `/privacy` and `/terms`, per Product Decision Record item 1 ("verify the live D1-composed `/privacy` and `/terms` state"). This is read-only evidence gathering; it makes no copy change and no legal conclusion.

## Current known truth

`/privacy` and `/terms` render per-section (`title`, `lead_html`, `body_html`) via `fetchPageContent()` (`src/lib/pageContent.ts`), each section falling back to hardcoded component copy independently when the corresponding D1 `page_content` row/section is absent. Migration `0009_page_content_seed.sql` seeds only `title` and `body_html` for both slugs — no `lead_html` row is seeded by any migration found in this repository (confirmed by reading every `migrations/*.sql` file for a `lead_html` insert or update targeting the `privacy`/`terms` slugs; none exists).

## What this evidence step could confirm from the repository alone

- The seed migration's exact `body_html` text for both slugs (already quoted in the accepted #2918 inventory and the #2919 decision register).
- No later migration updates, overwrites, or deletes the `privacy`/`terms` `page_content` rows.
- The rendering code's fallback behavior is per-section, not all-or-nothing.

## What this evidence step could not confirm

**Whether the seeded rows are actually present in the live Production D1 database today, and therefore whether the rendered page is the pure hardcoded fallback, the pure seeded text, or a section-by-section hybrid of both.**

This requires a live, read-only query against the Production D1 database (e.g., `SELECT slug, title, lead_html, body_html FROM page_content WHERE slug IN ('privacy','terms')` via `wrangler d1 execute --remote` or equivalent authorized access). This session/environment has no Cloudflare authentication (`wrangler whoami` reports "You are not authenticated") and no Production D1 binding — there is no credential-free way to run this query from here, and none is authorized to be added under this task's envelope (credential/Production access changes are explicitly out of scope).

## Protected stop

Per the #2919 executable package's stop conditions ("credential/Production mutation" and the requirement to report rather than guess a Production state): **this specific verification is blocked on authorized read-only Production D1 access that this implementation session does not have.** No copy conclusion is drawn from an unconfirmed live state.

## Recommended next step

An operator or agent with authenticated `wrangler`/Cloudflare dashboard access to the Production D1 database should run the query above and record the result here (or in a follow-up comment on #2919), after which #2920 can proceed with the exact composed-text review Bill approved.

## Rollback

This document can be removed or revised without any other repository impact — it makes no code, schema, or public-copy change.
