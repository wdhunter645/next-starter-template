---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2918 compliance surface/control/claim inventory and gap matrix for Project #2784
Does Not Own: Legal conclusions, public-policy decisions, rights authorizations, Production implementation, or Promotion/Production authority
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Related Issues: #2784, #2918, #2919, #2920, #2921
Last Reviewed: 2026-08-04
---

# Compliance Readiness — Inventory and Gap Matrix (#2918)

## Purpose

Record the current, as-built state of every legal/rights/privacy/disclosure/fundraiser-compliance surface on the LGFC website, per Project #2784's requirement for "one compliance matrix covering surface/journey, topic, current control/copy, applicable decision owner, required evidence, implementation location, launch severity, review date, and unresolved question."

This document provides **no legal conclusion** and authorizes **no public-policy change**. It is an evidence inventory only. Product decisions, rights authorizations, and implementation belong to #2919 and #2920.

## Scope

Covers the 13 minimum domains named in #2784: privacy/contact/deletion/retention; terms/disclaimers; cookies/analytics; authentication/member data; member submissions; photos/media/archive rights and attribution; takedown; newsletter/transactional email; fundraiser/charity/proceeds/partner statements; store/donation distinctions; receipts/refunds; accessibility statement/contact path.

Does not cover: legal adequacy judgments, jurisdiction-specific requirement determination, or any implementation change. Evidence gathered by read-only repository survey (routes, components, D1 migrations, and existing governance/design/content docs) — no live D1 query was run to confirm which seeded row is presently served; see Finding F1 below.

## Current known truth

- No dedicated legal/compliance authority document exists today; the closest owners are `docs/reference/design/text-pages.md` (flags `/privacy` and `/terms` copy as "Awaiting legal copy"), `docs/reference/content/*` (rights/privacy/consent data model), and `docs/reference/website/lou-gehrig-rights-privacy-publication-review.md` (content-specific rights/privacy clearance).
- `/privacy` and `/terms` each have two divergent copies in the codebase: a component-level hardcoded fallback (`src/app/privacy/page.tsx`, `src/app/terms/page.tsx`) and a D1-seeded CMS row (`migrations/0009_page_content_seed.sql`) that was never updated by a later migration. Which one actually renders depends on whether the seed row exists live in D1 — not independently confirmed here (Finding F1).
- The fundraiser program is explicitly **BLOCKED from execution** pending Bill/ChatGPT launch authorization (`docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md`); no live donation processing exists on-site (Givebutter is external).
- The store is an external Bonfire link only; no on-site checkout, no donation/purchase distinction copy exists because none is needed yet.
- The documented member-submission rights/consent data model (`ownership_statement`, `permission_statement`, `credit_preference`, `consent_status`) is **not implemented** in the live `/fanclub/submit` form or `submission_queue` schema — the form collects no rights attestation at all today.

## Intended final state

Every row below is either: (a) traced to implemented evidence, or (b) recorded as an explicit unresolved question routed to Bill/legal for #2919 disposition (resolve, accept risk, or hold/disable the affected surface). No row is silently left ambiguous.

## Compliance matrix

Launch severity: **P0** = live public claim/gap with plausible legal exposure now; **P1** = should resolve before any related feature (e.g., fundraiser) goes live; **P2** = hygiene/best-practice gap, no known active claim at risk.

| Surface/Journey | Topic | Current control/copy | Decision owner | Required evidence | Implementation location | Severity | Review date | Unresolved question |
|---|---|---|---|---|---|---|---|---|
| `/privacy` | Privacy policy — data collected, use, sale, removal | Two divergent copies exist (component fallback vs. D1 seed); neither discloses Google Analytics/cookies | Bill (Product) + legal review flagged in `text-pages.md` | Confirm which copy is live; legal review of both texts; GA disclosure added | `src/app/privacy/page.tsx`; `migrations/0009_page_content_seed.sql` | **P0** | 2026-08-04 | Which copy is actually served from D1 today? Does either satisfy applicable privacy-disclosure requirements (GA, cookies, data retention)? |
| `/terms` | Terms of use, content-license grant, copyright, **charity/proceeds claim** | D1 seed makes an unverified public claim: "zero-profit mission; any proceeds are directed to ALS-related charitable giving." Component fallback contains no such claim. | Bill (Product) — public claims require Product/legal sign-off | Confirm live copy; verify or retract the proceeds claim; confirm org's actual charitable/tax status if the claim is kept | `migrations/0009_page_content_seed.sql` (seeded); `src/app/terms/page.tsx` (fallback) | **P0** | 2026-08-04 | Is the "proceeds directed to ALS-related charitable giving" claim true and substantiated? If the LGFC is not itself a registered charity, is this claim legally accurate as worded? |
| Site-wide (`layout.tsx`) | Cookie/analytics disclosure and consent | Google Analytics (`GoogleAnalytics.tsx`) loads unconditionally on every route via `NEXT_PUBLIC_GA_ID`; no consent banner, no opt-out, no DNT handling; not disclosed on `/privacy` | Bill (Product) — jurisdiction/consent-model decision | Determine applicable jurisdiction(s) and whether consent-before-load is required; add disclosure at minimum | `src/components/GoogleAnalytics.tsx`; `src/app/layout.tsx` | **P0** | 2026-08-04 | What visitor jurisdictions does the club need to account for? Is disclosure-only sufficient, or is consent-before-load required? |
| `/contact` | Contact / correction / removal request path | Email-only (`Support@LouGehrigFanClub.com`, `admin@lougehrigfanclub.com`); no form; explicit design decision, current copy matches D1 (migration 0040 kept the two in sync) | Bill (Product) | None required — consistent and current | `src/app/contact/page.tsx`; `migrations/0040_contact_launch_copy.sql` | P2 | 2026-08-04 | None — lowest-risk surface surveyed. |
| `/join`, `/login`, `/fanclub/myprofile` | Auth/member data collection, session handling | Screen name, name, email, `email_opt_in` collected at join; 30-day session cookie; documented in `auth-model.md` | Bill (Product) + `docs/reference/design/auth-model.md` (design authority) | None required for current scope; disclosure of what's collected belongs on `/privacy` (see above) | `functions/api/join.ts`; `functions/api/login.ts`; `docs/reference/design/auth-model.md` | P1 | 2026-08-04 | Does `/privacy` need to explicitly enumerate the join/session data collected? (Currently it does, in generic terms.) |
| `/join`, `/fanclub/myprofile` | Email consent (`email_opt_in`) | Checkbox exists and is persisted, but **no code path reads it as a send gate** — welcome/admin emails are transactional and sent regardless | Bill (Product) | Decide whether `email_opt_in` should gate any current or future send, or whether transactional-only sending makes the field currently moot | `functions/api/join.ts` (`sendWelcomeEmail`); `functions/_lib/email.ts` | P1 | 2026-08-04 | Is transactional-only email exempt from needing the opt-in gate, or should the UI be corrected to not imply marketing-consent control that doesn't exist? |
| `/fanclub/submit` | Member content/photo submission — ownership, permission, credit, consent capture | Form collects name/email/title/content only. **No ownership, permission, credit-preference, or consent-status capture exists**, despite the documented data model (`lgfc-content-candidate-model.md`, `member-submission-content-model.md`) requiring these fields | Bill (Product) — rights-capture is a protected decision | Implement (or explicitly defer) the documented `ownership_statement`/`permission_statement`/`credit_preference`/`consent_status` fields before broader submission launch | `src/app/fanclub/submit/page.tsx`; `functions/api/library/submit.ts`; model docs in `docs/reference/content/` | **P0** | 2026-08-04 | Should rights/consent capture be required before the submission feature is promoted beyond its current limited/internal use? |
| Fan Club photo/memorabilia display | Attribution/credit display | Items render `uploaded_by`/source/tags in admin views; no visible on-page public credit/rights UI found | Bill (Product) | Confirm intended public credit-display requirement before any public gallery launch | `src/app/fanclub/photo/page.tsx`; `src/app/fanclub/memorabilia/page.tsx` | P1 | 2026-08-04 | Is a visible public credit line required by design intent, and if so where is it enforced before publish? |
| Site-wide | Takedown / content-removal request process | No dedicated takedown page, form, or schema fields; removal handled only via `/contact` → manual email → manual admin action. Gap is already self-documented (`cc-002-provenance-rights-contract-package.md`: missing `suppression_reason`, `takedown_request_source`, etc.) | Bill (Product) | Decide whether email-only is an accepted interim process or whether a documented takedown procedure/schema is required before any rights-sensitive content goes public at scale | `docs/ops/implementation-plans/content-collection/packages/cc-002-provenance-rights-contract-package.md` | P1 | 2026-08-04 | Is manual email-based takedown an accepted interim control, or does a formal documented process need to exist before wider content publication? |
| Transactional email | Welcome/admin notification content and unsubscribe | Reply-to-unsubscribe only (no automated unsubscribe link/list management); fail-open on send error; all attempts logged | Bill (Product) | None required for current transactional-only scope | `functions/_lib/email.ts`; `functions/api/join.ts` | P2 | 2026-08-04 | Would a future newsletter/marketing send require a proper unsubscribe mechanism beyond reply-to? (Not built; not currently needed.) |
| Homepage campaign spotlight, fundraiser design | Fundraiser/charity claims, proceeds language, tax-deductibility, partner representations | Feature is hidden by default and the implementation program is explicitly BLOCKED pending Bill/ChatGPT launch; no tax-deductibility or 501(c) claim found anywhere; Givebutter is the external donation processor | Bill (Product) — protected launch decision, already gated | Pre-launch checklist already exists in the blocked implementation plan; no new evidence needed until launch is authorized | `docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md`; `docs/reference/design/als-fundraiser-2026-campaign-spotlight.md` | P1 (dormant until launch) | 2026-08-04 | None pending — correctly gated. Re-review required before this program's own launch authorization, not before #2784 closeout. |
| `CharitySpotlight`, `CharitiesTiles` | Third-party charity links/representations | Static external links (ALS Cure Project, LiveLikeLou, Project ALS) and a D1-driven "friends" tile list; no on-site donation processing, no claim of partnership/endorsement beyond the link itself | Bill (Product) | Confirm no implied partnership/endorsement claim exceeds what's actually agreed with each named charity | `src/components/CharitySpotlight.tsx`; `src/components/CharitiesTiles.tsx` | P1 | 2026-08-04 | Are the named third-party charities aware of / consenting to being linked/featured this way? |
| Header "Store" link | Store/donation distinction | External Bonfire link only; no on-site checkout exists, so no distinction copy is currently needed | Bill (Product) | None required at current scope | `src/components/Header.tsx`; `docs/ops/tickets/store-hamburger-doc-fix.md` | P2 | 2026-08-04 | Revisit only if an on-site store or donation flow is ever built. |
| Store/donations | Receipts/refunds | Entirely provider-owned (Bonfire for store, Givebutter for donations, once launched) — LGFC does not process payments | Bill (Product) — confirm provider terms are sufficient | Confirm Bonfire/Givebutter receipt and refund terms are linked or referenced somewhere accessible to users | Provider-external; no LGFC-owned implementation | P2 | 2026-08-04 | Should `/terms` or `/contact` link out to provider receipt/refund policies explicitly? |
| `members`, `join_requests` (D1) | Data retention / account deletion | No self-service deletion UI/API; no `deleted_at`/soft-delete column on either table; only documented retention mechanism is the quarterly `submission_queue` purge for rejected content | Bill (Product) | Decide whether manual email-based deletion is an accepted interim process, and whether a retention/deletion policy statement is needed on `/privacy` | `migrations/0001_join_requests.sql`; `migrations/0019_members.sql`; `docs/how-to/website/review-content-submission.md` | P1 | 2026-08-04 | What is the target SLA/process for a user-requested data-deletion email, and should it be documented publicly? |
| Site-wide | Accessibility statement / accessibility contact path | No public accessibility statement or route exists; internal WCAG AA build-standard exists (`style-guide.md`) but is not user-facing | Bill (Product) | Decide whether a public accessibility statement/contact path is required before broader public launch | `docs/reference/design/style-guide.md` (internal only) | P1 | 2026-08-04 | Is a public accessibility statement required, and should it point to the existing `/contact` channel or a dedicated path? |

## Findings requiring explicit Product/legal disposition (routed to #2919)

Per #2784's conservative zero-cost rule ("when a material legal/rights/privacy question cannot be resolved without qualified advice, the affected optional feature/content is held or disabled rather than allowing an AI-generated legal conclusion"), the following are flagged as **unresolved** rather than dispositioned here:

- **F1 — Live-copy ambiguity.** `/privacy` and `/terms` each have two different texts in the codebase (component fallback vs. D1 seed) with no later migration reconciling them. This report could not confirm from static analysis alone which text is presently served to visitors. **Recommend confirming live D1 content before any other privacy/terms decision is made**, since #2919 cannot resolve a claim it can't first identify as live.
- **F2 — Unverified charitable-proceeds claim.** The seeded `/terms` copy states proceeds go to "ALS-related charitable giving" under a "zero-profit mission." No corroborating charity/tax-status documentation was found anywhere in the repository. If this text is live, it is a public representation with no evidenced backing found in this survey.
- **F3 — Undisclosed analytics.** Google Analytics runs on every page load with no consent gate and no mention on `/privacy`. Jurisdiction-dependent risk; at minimum a disclosure gap.
- **F4 — Rights/consent capture gap.** The org's own documented content model requires ownership/permission/consent capture on member submissions; the live form/schema does not implement it. This is a self-identified gap against the org's own stated design, not merely an external-standard gap.
- **F5 — No takedown process.** Also self-identified as a gap in existing planning docs; only a manual email path exists today.
- **F6 — No account-deletion self-service or documented SLA.**
- **F7 — No public accessibility statement.**

None of F1–F7 are resolved, implemented, or disabled by this report. #2919 owns the decision register and disposition (resolve / accept risk / hold-disable) for each.

## Validation

This is a documentation-only inventory task — no code, schema, or public-copy change was made. Validation consists of:
- `npm test` — not run; no code changed by this task.
- Source verification: every file path cited above was read directly; the D1-seed-vs-component-fallback discrepancy (F1/F2) was independently confirmed by inspecting `migrations/0009_page_content_seed.sql` and grepping all migrations for any later row update to `/privacy` or `/terms` (none found).

## Rollback

This document can be removed or revised without any other repository impact — it makes no code or schema change.

## Stop conditions triggered

None reached the level requiring a full stop of this task (no destructive action, no credential exposure, no unauthorized Production mutation). F1–F7 are recorded as unresolved questions per the task's own acceptance criteria, not as blockers to completing this inventory.
