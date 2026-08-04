---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2919 first-increment Product-decision register, conservative dispositions, and #2919/#2920 implementation-ownership split for Project #2784's compliance findings
Does Not Own: Legal conclusions, public-policy decisions, rights authorizations, runtime/schema implementation, public-copy changes, or Production/Promotion authority
Canonical Reference: /docs/ops/reports/compliance-readiness-inventory-2918.md
Related Issues: #2784, #2918, #2919, #2920, #2921
Last Reviewed: 2026-08-04
---

# Compliance Product-Decision Register — First Increment (#2919)

## Purpose

Convert the accepted #2918 inventory (`docs/ops/reports/compliance-readiness-inventory-2918.md`, findings F1–F7 and every P0/P1 matrix row) into an executable Product-decision register: concrete decision options for Bill, a conservative default disposition for every item while unresolved, and an exact implementation-ownership split between #2919 (rights/privacy evidence controls) and #2920 (public disclosures and fundraiser/provider boundaries).

This document makes **no legal conclusion**, approves **no public copy**, and changes **no runtime behavior**. It is a decision-routing and disposition-default register only. Every item remains held at its current (as-built) state until Bill records a decision.

## Scope

Source authority: accepted #2918 report, PR #3045, merge commit `e2d5e0d70a2d20600a7f7266f8ae900c4892658f` on `component/compliance-readiness`. Every F1–F7 finding and every P0/P1 matrix row from that report is represented below. P2 rows are out of scope for this increment (per #2918: no known active claim at risk).

Ownership split used throughout:
- **#2919 (rights/privacy evidence controls)** — consent/rights/credit/provenance capture, takedown workflow, data-subject deletion/retention mechanisms, evidence-custody and audit-trail controls. Matches #2919's charter text: "provenance, permission, credit, privacy, takedown, submission, and evidence-custody controls."
- **#2920 (public disclosures and fundraiser/provider boundaries)** — public-facing copy, disclosure wording, consent-banner UI, partner/charity representation text, accessibility statement copy. Matches #2920's charter text: "approved public disclosures and fundraiser/provider boundaries."

Where an item has both an evidence/mechanism component and a public-copy component (e.g., `/privacy` and `/terms`), the split is stated explicitly per item.

## Findings F1–F7 (from #2918)

### F1 — Live-copy ambiguity (`/privacy`, `/terms`)

- **Current evidence:** Per-section D1 rendering (`title`/`lead_html`/`body_html`), each falling back to hardcoded copy independently when absent. Migration 0009 seeds only `title`/`body_html` for both pages (no `lead_html` row). Live per-section D1 state was not queried by #2918.
- **Risk / launch impact:** Cannot evaluate legal sufficiency of either page's actual rendered text without knowing which sections are live — the composed page may be a seed/fallback hybrid, not either document reviewed in isolation.
- **Decision owner:** Bill (Product), with legal review of the resulting composed text.
- **External review required:** Unknown until live state is confirmed; likely yes once the composed text is known (privacy-disclosure and charity-claim adequacy).
- **Concrete Product options:**
  1. Confirm live D1 section state first (read-only query), then route the composed text to legal/Bill review.
  2. Skip confirmation and proactively overwrite `lead_html` for both pages with reviewed copy, making the hybrid-ambiguity question moot regardless of prior seed state.
  3. Leave as-is and accept current risk pending a later review cycle.
- **Conservative unresolved disposition:** Hold — no `/privacy` or `/terms` copy change is made by #2919. The page continues to render exactly as it does today.
- **#2919 vs #2920 owner:** #2919 owns confirming live D1 section state (evidence step, no copy change). #2920 owns any resulting copy remediation.
- **Exact proposed writable paths (future, not this increment):** `docs/ops/reports/compliance-privacy-terms-live-state-2919.md` (evidence-confirmation sub-report, #2919); `migrations/00XX_privacy_terms_copy_review.sql`, `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` (#2920, only after Bill approves specific text).
- **Required tests/evidence:** A read-only D1 query (or authorized script) confirming which `page_content` rows/sections exist for `privacy` and `terms` slugs; screenshot or rendered-HTML capture of the current composed page for Bill's review.
- **Rollback/disable behavior:** N/A this increment (no change made). Future copy change: revert migration/page edit to restore current composed state.
- **Explicit decision required from Bill:** Approve/reject each option above; if option 1 or 2, approve the specific reviewed `/privacy` and `/terms` text before #2920 implements it.

### F2 — Unverified charitable-proceeds claim (`/terms`)

- **Current evidence:** Seeded `/terms` `body_html` (migration 0009) states proceeds go to "ALS-related charitable giving" under a "zero-profit mission." No corroborating charity/tax-status documentation exists in the repository. Live-ness of this seed row is the same open question as F1.
- **Risk / launch impact:** If live, this is an unsubstantiated public charitable/tax representation — P0, plausible legal exposure now.
- **Decision owner:** Bill (Product) — requires knowledge of the organization's actual tax/charity status, which is outside repository evidence.
- **External review required:** Yes, if the claim is kept — requires the org's actual charitable/tax-status documentation, not an AI conclusion.
- **Concrete Product options:**
  1. Retract/soften the claim to a factually supportable statement (e.g., "we encourage support of ALS-related charities" without implying a formal proceeds-distribution guarantee).
  2. Substantiate the claim with actual tax/charity-status evidence and keep it as-is or reworded to match that evidence exactly.
  3. Remove the claim entirely pending resolution.
- **Conservative unresolved disposition:** Hold — no `/terms` copy change is made by #2919. Bundled with F1's live-state confirmation since both concern the same seed row.
- **#2919 vs #2920 owner:** #2919 confirms live state (bundled with F1). #2920 implements whichever copy Bill selects.
- **Exact proposed writable paths (future, not this increment):** Same as F1 — `migrations/00XX_privacy_terms_copy_review.sql`, `src/app/terms/page.tsx` (#2920).
- **Required tests/evidence:** Organization's actual charity/tax-status documentation (external, not repository-derivable); confirmation of live seed state (shared with F1).
- **Rollback/disable behavior:** N/A this increment. Future: revert to current text if the new claim is later disputed.
- **Explicit decision required from Bill:** Select option 1, 2, or 3, and supply substantiating documentation if option 2 is chosen.

### F3 — Undisclosed analytics (conditional on `NEXT_PUBLIC_GA_ID`)

- **Current evidence:** `GoogleAnalytics.tsx` is a no-op unless `NEXT_PUBLIC_GA_ID` is set; Production's actual env configuration was not confirmed by #2918.
- **Risk / launch impact:** P0 only if the variable is set in Production; otherwise not applicable. No consent gate or `/privacy` disclosure exists today regardless.
- **Decision owner:** Bill (Product) — jurisdiction/consent-model decision once live configuration is known.
- **External review required:** Unknown until Production config is confirmed; likely yes for jurisdiction-specific consent-mechanism adequacy if GA is live.
- **Concrete Product options:**
  1. Confirm whether `NEXT_PUBLIC_GA_ID` is set in Production (evidence step, no code change).
  2. If set: add a `/privacy` disclosure only (lowest-friction remediation).
  3. If set and jurisdiction requires it: add consent-before-load gating in addition to disclosure.
  4. If set and no immediate remediation is authorized: unset the variable to disable GA until disclosure/consent is implemented (conservative default per #2784's zero-cost rule).
- **Conservative unresolved disposition:** Hold current behavior (no code change). If Bill wants the zero-cost-default applied immediately, option 4 (unset the env var) is the only action available to #2919/#2920 without a public-copy or consent-UI build — flagged here as available but **not applied** without explicit authorization, since unsetting a Production env var is itself a Production configuration change outside this increment's writable-file allowlist.
- **#2919 vs #2920 owner:** #2919 confirms live Production configuration (evidence step). #2920 owns any disclosure copy or consent-UI build; Production configuration changes require separate authorized Production access outside either component branch.
- **Exact proposed writable paths (future, not this increment):** `docs/ops/reports/compliance-ga-production-state-2919.md` (evidence sub-report, #2919); `src/app/privacy/page.tsx` or a new `src/components/ConsentBanner.tsx` (#2920, pending Bill's choice of option 2 vs 3).
- **Required tests/evidence:** Confirmation of Production `NEXT_PUBLIC_GA_ID` value (requires access outside this task's allowlist — flagged as a stop condition if pursued this increment); if a consent banner is later built, focused component/route tests.
- **Rollback/disable behavior:** Disclosure copy: revert page edit. Consent banner: feature-flag or remove component. Env var: revert to prior Production value through the authorized Production configuration path (not this task).
- **Explicit decision required from Bill:** Confirm whether GA is live in Production (or authorize #2919 to check); select option 2, 3, or 4.

### F4 — Rights/consent capture gap (`/fanclub/submit`)

- **Current evidence:** The documented content model (`ownership_statement`, `permission_statement`, `credit_preference`, `consent_status`) is not implemented in the live submission form or `submission_queue` schema; the form collects no rights attestation today.
- **Risk / launch impact:** P0 — a documented, self-identified gap against the org's own required data model, not merely an external-standard gap.
- **Decision owner:** Bill (Product) — rights-capture is a protected decision.
- **External review required:** No — this is implementing the org's own already-documented model, not inventing a new legal position.
- **Concrete Product options:**
  1. Implement the documented fields (schema migration + form fields + validation) before broader submission-feature promotion.
  2. Explicitly defer and keep the submission feature limited/internal-only until implemented.
  3. Implement a minimal subset (e.g., ownership + permission only, deferring credit-preference/consent-status) as an interim step.
- **Conservative unresolved disposition:** Hold — submission feature's current limited/internal-use scope is unchanged; no schema or form change is made by this increment.
- **#2919 vs #2920 owner:** #2919 — this is core rights/consent evidence-capture, squarely within #2919's charter.
- **Exact proposed writable paths (future, not this increment):** `migrations/00XX_submission_rights_capture.sql` (add `ownership_statement`, `permission_statement`, `credit_preference`, `consent_status` to `submission_queue`); `src/app/fanclub/submit/page.tsx` (form fields); `functions/api/library/submit.ts` (validation/persistence); `tests/api/library-submit-rights-capture.test.ts` (new, focused).
- **Required tests/evidence:** Focused API/route tests proving required-field validation, persistence, and fail-closed rejection of submissions missing required rights attestations.
- **Rollback/disable behavior:** Revert migration and form/API changes; submission feature reverts to current (no rights capture) behavior, which is itself the documented gap — rollback restores the gap, not a safe state, so rollback should be paired with re-limiting the feature to internal-only use per option 2.
- **Explicit decision required from Bill:** Select option 1, 2, or 3, and confirm exact field wording/requiredness before #2919 implements.

### F5 — No takedown process

- **Current evidence:** No dedicated takedown page, form, or schema fields; removal handled only via `/contact` → manual email → manual admin action. Gap is self-documented in `cc-002-provenance-rights-contract-package.md` (missing `suppression_reason`, `takedown_request_source`, etc.).
- **Risk / launch impact:** P1 — should resolve before any rights-sensitive content goes public at scale.
- **Decision owner:** Bill (Product).
- **External review required:** No — implementing an already-identified internal gap.
- **Concrete Product options:**
  1. Accept manual email-based takedown as the permanent interim process (no build required).
  2. Implement the documented schema fields (`suppression_reason`, `takedown_request_source`, etc.) and an internal admin workflow, keeping the request intake at `/contact` (no new public route).
  3. Implement a dedicated public takedown-request path in addition to schema/workflow support.
- **Conservative unresolved disposition:** Hold — current manual `/contact`-based process continues unchanged; no schema or route change is made by this increment.
- **#2919 vs #2920 owner:** #2919 — takedown controls are explicitly named in #2919's charter. A new public-facing takedown *page* (if option 3 is chosen) would be a #2920 boundary item (public route/copy) layered on #2919's underlying schema/workflow.
- **Exact proposed writable paths (future, not this increment):** `migrations/00XX_takedown_fields.sql` (add fields to the relevant content/moderation table); `functions/api/admin/takedown.ts` (new, internal); `docs/how-to/website/review-content-submission.md` (process doc update); `src/app/takedown/page.tsx` (only if option 3).
- **Required tests/evidence:** Focused tests proving a takedown record is created with required fields, is auditable, and that content is suppressed (not deleted) pending review.
- **Rollback/disable behavior:** Revert schema/workflow changes; current manual email process remains available regardless (it is not being removed by any option).
- **Explicit decision required from Bill:** Select option 1, 2, or 3.

### F6 — No account-deletion self-service or documented SLA

- **Current evidence:** No self-service deletion UI/API; no `deleted_at`/soft-delete column on `members` or `join_requests`; only documented retention mechanism is the quarterly `submission_queue` purge for rejected content.
- **Risk / launch impact:** P1 — should resolve before broader launch; also affects whether `/privacy` can accurately describe a deletion process (see F1/#2920 boundary).
- **Decision owner:** Bill (Product).
- **External review required:** Unknown — depends on applicable jurisdiction(s) for data-subject deletion rights; flag for legal review if the club has EU/CA members or otherwise represents a deletion right publicly.
- **Concrete Product options:**
  1. Accept manual email-based deletion as the permanent interim process; document an internal SLA (e.g., "within 30 days") without building self-service tooling.
  2. Implement a soft-delete mechanism (`deleted_at` column, admin-triggered) reachable only via the existing manual email intake (no new public UI).
  3. Implement full self-service deletion (member-triggered, from `/fanclub/myprofile`).
- **Conservative unresolved disposition:** Hold — no schema or deletion-mechanism change is made by this increment; current manual/no-formal-SLA state continues.
- **#2919 vs #2920 owner:** #2919 — deletion mechanism and evidence-custody (audit of what was deleted/when) are evidence-control work. Any public-facing SLA statement or self-service UI copy is a #2920 boundary item layered on #2919's mechanism.
- **Exact proposed writable paths (future, not this increment):** `migrations/00XX_members_soft_delete.sql`, `migrations/00XX_join_requests_soft_delete.sql`; `functions/api/admin/delete-member.ts` (option 2) or `functions/api/member/delete-account.ts` (option 3); `src/app/fanclub/myprofile/page.tsx` (option 3 only).
- **Required tests/evidence:** Focused tests proving deletion is soft (auditable, not destructive), reversible within a defined window if applicable, and that a deletion request produces durable evidence.
- **Rollback/disable behavior:** Revert schema/route changes; manual email process remains the fallback regardless of option chosen.
- **Explicit decision required from Bill:** Select option 1, 2, or 3; confirm applicable jurisdictions if known, to route to external review.

### F7 — No public accessibility statement

- **Current evidence:** No public accessibility statement or route exists; an internal WCAG AA build-standard exists (`style-guide.md`) but is not user-facing.
- **Risk / launch impact:** P1 — should resolve before broader public launch.
- **Decision owner:** Bill (Product).
- **External review required:** No — publishing an accessibility statement based on the existing internal build-standard is a copy/publication decision, not a new legal position.
- **Concrete Product options:**
  1. Publish a public accessibility statement page referencing the existing internal WCAG AA standard and the `/contact` channel for accessibility issues.
  2. Add a short accessibility-contact mention to an existing page (e.g., `/contact` or footer) without a dedicated statement page.
  3. Defer — no public statement yet.
- **Conservative unresolved disposition:** Hold — no new page or copy is added by this increment.
- **#2919 vs #2920 owner:** #2920 — this is entirely public-facing copy/disclosure, no evidence-control mechanism is involved.
- **Exact proposed writable paths (future, not this increment):** `src/app/accessibility/page.tsx` (option 1); `src/app/contact/page.tsx` or `src/components/Footer.tsx` (option 2).
- **Required tests/evidence:** None beyond standard route/render tests once #2920 implements.
- **Rollback/disable behavior:** Remove the new route/copy; no schema or data impact.
- **Explicit decision required from Bill:** Select option 1, 2, or 3, and approve exact statement wording if 1 or 2.

## Additional P1 matrix rows (not already covered by F1–F7)

### Auth/member data disclosure completeness (`/join`, `/login`, `/fanclub/myprofile`)

- **Current evidence:** Screen name, name, email, `email_opt_in` collected at join; 30-day session cookie; documented in `docs/reference/design/auth-model.md`. `/privacy` currently describes collected data only in generic terms.
- **Risk / launch impact:** P1 — disclosure completeness question, not a missing control.
- **Decision owner:** Bill (Product).
- **External review required:** No.
- **Concrete Product options:** (1) Leave `/privacy`'s generic description as-is; (2) enumerate the specific fields collected (screen name, name, email, opt-in flag, session cookie) explicitly.
- **Conservative unresolved disposition:** Hold — no `/privacy` change made by this increment; bundled with the broader F1 `/privacy` copy-review decision.
- **#2919 vs #2920 owner:** #2920 (public disclosure copy), informed by #2919's F1 live-state confirmation.
- **Exact proposed writable paths (future):** `src/app/privacy/page.tsx` or the corresponding `page_content` migration (#2920).
- **Required tests/evidence:** None beyond the shared F1 live-state confirmation.
- **Rollback/disable behavior:** Revert copy edit.
- **Explicit decision required from Bill:** Option 1 or 2, decided together with F1/F2.

### `email_opt_in` send-gate

- **Current evidence:** Checkbox exists and is persisted at join, but no code path reads it as a send gate; the welcome message ("periodic updates about new content, milestones, events, and ways to support ALS charities") sends regardless of opt-in state.
- **Risk / launch impact:** P1 — consent captured but not enforced; welcome copy exceeds strictly transactional content.
- **Decision owner:** Bill (Product).
- **External review required:** No.
- **Concrete Product options:** (1) Gate the current welcome message on `email_opt_in`, sending a shorter strictly-transactional confirmation to non-opted-in members instead; (2) reword the welcome message to be strictly transactional so no gating is needed; (3) leave as-is and accept the gap.
- **Conservative unresolved disposition:** Hold — no send-path change is made by this increment.
- **#2919 vs #2920 owner:** #2919 — enforcing captured consent against a send path is a consent-evidence control, not public copy.
- **Exact proposed writable paths (future):** `functions/api/join.ts` (`sendWelcomeEmail` gating logic); `functions/_lib/email.ts` (if a separate strictly-transactional template is needed); `tests/api/join-email-opt-in-gate.test.ts` (new, focused).
- **Required tests/evidence:** Focused tests proving opted-out members receive only strictly-transactional content and opted-in members receive the full welcome message.
- **Rollback/disable behavior:** Revert gating logic; welcome message reverts to sending unconditionally (current behavior).
- **Explicit decision required from Bill:** Select option 1, 2, or 3, and approve any new non-opted-in message copy (#2920 boundary if new copy is written).

### Fan Club photo/memorabilia attribution/credit display

- **Current evidence:** Authenticated member views (`useMemberSession`-gated) render `uploaded_by`/source/tags; a separate admin editorial workflow holds source/credit fields; no public (unauthenticated) credit/rights UI exists.
- **Risk / launch impact:** P1 — relevant only if/when a public (unauthenticated) gallery is launched; current member-gated display is not itself a gap.
- **Decision owner:** Bill (Product).
- **External review required:** No.
- **Concrete Product options:** (1) Confirm no public gallery is planned near-term — no action needed; (2) if a public gallery is planned, require a visible credit line enforced at publish time before that launch.
- **Conservative unresolved disposition:** Hold — no display change is made by this increment; current member-gated behavior is unaffected.
- **#2919 vs #2920 owner:** #2919 owns credit-preference capture/enforcement (already partly covered under F4); #2920 owns any new public-facing credit-line UI if a public gallery is later authorized.
- **Exact proposed writable paths (future):** Public gallery route + credit-line component (#2920), gated on #2919's credit-preference field existing and being enforced at publish time.
- **Required tests/evidence:** Deferred until a public gallery is authorized.
- **Rollback/disable behavior:** N/A — no change this increment.
- **Explicit decision required from Bill:** Confirm whether a public gallery is planned; if so, when this item becomes launch-blocking for that feature.

### Fundraiser/charity campaign spotlight (dormant, already gated)

- **Current evidence:** Feature hidden by default; implementation program explicitly BLOCKED pending Bill/ChatGPT launch authorization; no tax-deductibility or 501(c) claim found anywhere; Givebutter is the external processor.
- **Risk / launch impact:** P1, dormant — correctly gated, no live exposure today.
- **Decision owner:** Bill (Product) — already exercised via the existing block.
- **External review required:** Deferred to that program's own launch review.
- **Concrete Product options:** None needed this increment — re-review belongs to the fundraiser program's own launch authorization, not #2784/#2919 closeout.
- **Conservative unresolved disposition:** No action — already conservatively held by the existing program block.
- **#2919 vs #2920 owner:** N/A this increment.
- **Exact proposed writable paths (future):** None (out of #2919/#2920 scope; owned by the fundraiser program's own implementation plan).
- **Required tests/evidence:** N/A.
- **Rollback/disable behavior:** N/A.
- **Explicit decision required from Bill:** None pending — noted for completeness only, per #2918's own recommendation.

### Third-party charity "Partner" labeling (`CharitySpotlight`, `CharitiesTiles`, `FriendsOfFanClub`)

- **Current evidence:** `FriendsOfFanClub.tsx` explicitly labels default entities `kind: 'Partner'` (visible "Partner" badge) with descriptive blurbs (e.g., "Supporting ALS awareness and impact through community action") — an affirmative partnership/support representation, not a neutral outbound link. No on-site donation processing.
- **Risk / launch impact:** P1 — representational accuracy risk if named entities have not agreed to the "Partner" label or blurb wording.
- **Decision owner:** Bill (Product).
- **External review required:** No legal review required to change wording; confirming each named entity's actual relationship/consent is a Product/relationship-management task, not a legal one.
- **Concrete Product options:** (1) Confirm each named entity's actual relationship and consent to the "Partner" label/blurb, keeping current wording if confirmed; (2) soften to a neutral label (e.g., "Resources" or "Related organizations") pending confirmation; (3) remove entities whose relationship cannot be confirmed.
- **Conservative unresolved disposition:** Hold current labeling — no component change is made by this increment; flagged for Bill's relationship confirmation.
- **#2919 vs #2920 owner:** #2920 — this is public representation/copy, not an evidence-control mechanism.
- **Exact proposed writable paths (future):** `src/components/FriendsOfFanClub.tsx`, `src/components/CharitySpotlight.tsx`, `src/components/CharitiesTiles.tsx` (#2920).
- **Required tests/evidence:** Confirmation (external to this repository) of each named entity's actual relationship/consent.
- **Rollback/disable behavior:** Revert label/blurb wording to current text.
- **Explicit decision required from Bill:** Select option 1, 2, or 3 per named entity.

## Summary — items requiring an explicit Bill decision before any #2919/#2920 runtime implementation

1. F1/F2 — confirm live `/privacy`/`/terms` D1 state; approve reviewed text and proceeds-claim wording (or retraction).
2. F3 — confirm Production `NEXT_PUBLIC_GA_ID` state; select disclosure/consent/disable option.
3. F4 — select rights/consent capture scope for `/fanclub/submit` (full, deferred, or minimal subset).
4. F5 — select takedown-process scope (manual-only, internal workflow, or public path).
5. F6 — select deletion-mechanism scope (manual-only, admin soft-delete, or self-service) and applicable-jurisdiction confirmation.
6. F7 — select accessibility-statement scope (dedicated page, footer mention, or defer).
7. Auth data disclosure — enumerate collected fields on `/privacy` or leave generic.
8. `email_opt_in` — gate the welcome message or rewrite it as strictly transactional.
9. Photo/memorabilia public credit line — confirm whether a public gallery is planned.
10. Charity "Partner" labeling — confirm each named entity's relationship/consent, or soften/remove.

No item above is implemented, disabled, or publicly changed by this increment. Every item's conservative disposition is to **hold current (as-built) behavior** pending Bill's decision, consistent with #2784's zero-cost rule.

## Remaining task boundary

This first increment does not complete #2919. Runtime implementation of whichever rights/privacy evidence controls Bill approves (F4, F5, F6, and the `email_opt_in` gate, per the #2919 ownership column above) requires a separately recorded second bounded assignment after this register is independently accepted and Bill has recorded decisions on the ten items above. Public-copy and disclosure implementation (F1, F2, F3's disclosure/consent UI, F7, auth-data enumeration, and charity-label wording) is out of #2919's scope entirely and belongs to #2920.

## Validation

This is a documentation-only decision-register task — no code, schema, or public-copy change was made.

- `bash scripts/ci/docs_check_headers.sh` — PASS (recorded at PR open).
- `node scripts/ci/diataxis_folder_audit.mjs` — PASS (recorded at PR open).
- `git diff --check` — PASS (recorded at PR open).
- Source verification: every finding and matrix row above is traced directly to the accepted #2918 report; no new repository claims were made without that source citation.

## Rollback

This document can be removed or revised without any other repository impact — it makes no code, schema, or public-copy change.

## Stop conditions triggered

None reached the level requiring a full stop of this increment. F3's Production `NEXT_PUBLIC_GA_ID` confirmation and F1/F2's live-D1-state confirmation both require read access beyond static repository survey; both are recorded above as required evidence steps for a future bounded increment, not attempted here, since confirming them was outside this task's writable-file allowlist and this increment's evidence-gathering scope was bounded to the already-accepted #2918 survey.
