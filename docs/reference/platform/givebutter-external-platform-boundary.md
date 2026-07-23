---
Doc Type: Reference
Audience: Bill, ChatGPT, Cursor, LGFC operators, and platform maintainers
Authority Level: Controlled
Owns: Platform-side statement that Givebutter remains an external vendor boundary with no LGFC platform credential or payment ownership
Does Not Own: Website display rules detail, Givebutter account operations, or runtime integration code
Canonical Reference: /docs/reference/website/givebutter-integration-boundary-model.md
Related Issues: #1700, #1702
Last Reviewed: 2026-07-23
---

# Givebutter External Platform Boundary

## Purpose

Record the platform-domain boundary for Givebutter so Cloudflare, D1, B2, and
related LGFC platform surfaces are not mistaken for donation/campaign backends.

## Scope

In scope:

- platform non-ownership of Givebutter payments and vendor admin;
- prohibition on storing Givebutter secrets in LGFC platform config repos;
- pointer to the website ownership model for display/link rules.

Out of scope:

- website spotlight/UI behavior (see website boundary model);
- vendor account setup;
- D1 schema design for future snapshots (later tasks if authorized).

## Current known truth

- LGFC platform stack (Cloudflare Pages/Workers, D1, B2, auth) does not process
  Givebutter donations or replace Givebutter settlement.
- Campaign payments remain on the external vendor platform.
- Website may store only approved public campaign references when Task 006
  implements display config.

## Intended final state

Platform operators treat Givebutter as external. No platform runbook requires
LGFC to host payment credentials, Givebutter API tokens, or live donor ledgers
as platform source of truth.

## Platform rules

1. Do not add Givebutter secrets to Cloudflare/Wrangler/GitHub Actions secrets
   unless a future explicitly authorized task defines a bounded server-side use
   and secret hygiene plan.
2. Do not model Givebutter payment tables as LGFC production finance systems.
3. Any future snapshot import path must be operator-mediated and privacy-filtered
   before public display (Task 003 / Task 005).
4. Canonical website ownership detail lives in
   [`givebutter-integration-boundary-model.md`](/docs/reference/website/givebutter-integration-boundary-model.md).
