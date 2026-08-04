---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2922 inventory of communication events, recipients, current code, and launch classes for Project #2785
Does Not Own: Provider selection, DNS/credential activation, Production sender enablement, public-copy decisions, paid-service commitments, or #2923–#2925 implementation
Canonical Reference: /docs/reference/architecture/vendor-inventory.md
Related Issues: #2785, #2922, #2923, #2924, #2925, #2784, #2918, #2919, #2780
Last Reviewed: 2026-08-04
---

# Transactional Communications — Event / Recipient / Code Inventory (#2922)

## Purpose

Inventory every current or launch-required communication event for Project #2785: trigger, sender, recipient, owner, privacy/consent class, current implementation, failure behavior, truthful user/admin state, and gap.

This document is **evidence and design reconciliation only**. It does not invent Product/#2784 dispositions, authorize a paid provider, mutate credentials/DNS/Production, or implement #2923+.

## Scope

- In scope: repository as-built on component tip `df9199502a79d44f6eb37300e0401803fe09fe38` (`component/transactional-communications`, created from `main` for this project); launch classes named by #2785; #2784/#2918/#2919 dependency routing for email consent and unsubscribe.
- Out of scope: runtime/config/workflow edits; provider signup; live secret inspection; Production activation; marketing blast implementation; fundraiser receipt ownership beyond noting Givebutter externality.

## Current known truth

- The only outbound product-email adapter is `functions/_lib/email.ts`. It calls MailChannels HTTP (`https://api.mailchannels.net/tx/v1/send`) when `MAILCHANNELS_ENABLED=1`, otherwise returns `{ sent: false, provider: 'disabled' }`.
- Implemented sends today: **member welcome** (`sendWelcomeEmail`) and **administrator join notification** (`sendAdminJoinNotification`). Callers: `functions/api/join.ts` and first-time side effect in `functions/api/ask.ts`.
- Delivery attempts are audited in D1 `join_email_log` (`migrations/0005_join_email_log.sql`).
- `email_opt_in` is collected and persisted (join UI, profile, D1) but **is not read as a send gate**. Welcome default copy describes “periodic updates … milestones, events, and ways to support ALS charities” — beyond a strict transactional receipt (#2918 / #2919 open Product item).
- Auth model (`docs/reference/design/auth-model.md`) is cookie + D1 session; **magic-link and password-reset email are prohibited / absent**. No security-alert email exists.
- `/contact` is mailto-only (`Support@…`, `admin@…`). FAQ submit stores `submitter_email` with no outbound notification. Fundraiser receipts are external (Givebutter) when/if launched.
- Vendor inventory records MailChannels for outbound transactional email and Apple iCloud Mail for the custom-domain mailbox layer. `.env.example` comments Resend/SendGrid placeholders as **not used today**.
- #2785 launch-required initial classes: membership/join receipt; administrator join notification; security-sensitive account messages actually supported by the auth model; Ask/contact receipt or failure disposition; operational test/alert messages required by #2780. Marketing/newsletter remains optional and consent/unsubscribe gated.

## Intended final state (project-level; not claimed complete by this task)

A provider-neutral envelope, validated zero-cost sender/domain path, launch-required events with truthful UI/admin failure states, bounce/complaint/unsubscribe procedures, and deliverability evidence — delivered by serial children #2923 → #2924 → #2925 after this inventory is accepted. Production activation remains separately protected.

## Classification legend

| Field | Values used here |
| --- | --- |
| Launch class | **launch-required** (per #2785) / **optional-deferred** / **not-applicable (auth)** / **external-provider** |
| Consent class | **transactional** / **optional-marketing** / **admin-internal** / **human-mailbox** |
| Implementation | **implemented** / **partial** / **missing** / **external** / **N/A** |

---

## Event inventory matrix

| Event ID | Trigger | Sender (from) | Recipient | Owner | Consent class | Launch class | Current implementation | Failure behavior | Truthful user/admin state | Gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E1 | Successful first-time `POST /api/join` | `MAIL_FROM` via MailChannels when enabled | Joining member email | Implementation/Ops (runtime); Product (copy/consent) | **Ambiguous** — stored as join side effect; default copy reads like optional updates | launch-required (membership/join receipt) | **implemented** — `sendWelcomeEmail` in `functions/_lib/email.ts`; caller `functions/api/join.ts`; optional intro from `welcome_email_content` | Join API still returns `ok: true` if send fails/disabled; attempt logged to `join_email_log` | API returns `email.welcome` result object; AuthClient success UI (“Joined. Logging you in…”) does **not** surface delivery failure/disabled | Classify/rewrite as transactional vs gate on `email_opt_in` (**#2784/#2919**); truthful UI when disabled/failed (**#2924**); provider/domain validation (**#2923**) |
| E2 | Same join success | `MAIL_FROM` | `MAIL_ADMIN_TO` (comma-separated) | Implementation/Ops | admin-internal | launch-required (admin join notification) | **implemented** — `sendAdminJoinNotification`; skipped if `MAIL_ADMIN_TO` empty | Soft fail / skip; join still succeeds; logged | Admin has no in-app “email failed” banner; relies on `join_email_log` / export | Confirm admin recipients for each env; monitoring/alert handoff (**#2925** / #2780) |
| E3 | First-time Ask visitor path creates join (`functions/api/ask.ts` `maybeJoinNewVisitor`) | Same as E1/E2 | Member + admin | Implementation/Ops | Same ambiguity as E1; Ask hardcodes `email_opt_in=1` on insert | launch-related (reuses E1/E2; not a dedicated Ask receipt) | **implemented as side effect**; does **not** call `assertEmailEnvOrThrow` | Ask inbox insert is primary; email errors caught and logged; Ask still succeeds | Ask UI: “We'll reply by email.” — implies human reply, not automated receipt; no delivery status shown | Separate Ask receipt vs human triage (**#2924**); align opt-in default with Product decision |
| E4 | Dedicated Ask question receipt / failure disposition | n/a today | Ask submitter | Product + Implementation | transactional (expected) | launch-required (Ask/contact receipt or failure disposition) | **missing** — Ask stores `ask_inbox` only; no dedicated receipt email | N/A | Success copy promises email reply without automated confirmation | Design receipt or explicit “queued for human reply” + admin queue evidence (**#2924**) |
| E5 | Contact page outreach | Human mailbox (mailto) | Support / admin addresses on page | Administration (human) | human-mailbox | launch-required (contact disposition) | **N/A as adapter** — `src/app/contact/page.tsx` mailto only; CMS copy via migrations/0040 | Browser/mail client failure only | Page shows addresses; no form submit state | Decide if mailto remains accepted launch disposition or needs form+receipt (**Product**; may stay mailto) |
| E6 | FAQ question submit | n/a | Submitter (none today); admin (none today) | Implementation/Ops | transactional (if added) | optional-deferred / launch-adjacent | **missing** — `functions/api/faq/submit.ts` stores `submitter_email` only | N/A | UI success without email confirmation | Optional admin notify + submitter ack in later envelope work if Product requires |
| E7 | Account verification / magic link | n/a | n/a | Product (auth model locked) | N/A | not-applicable (auth) | **N/A** — magic-link prohibited in `auth-model.md` | N/A | N/A | Do not invent email verification flows |
| E8 | Password reset | n/a | n/a | Product | N/A | not-applicable (auth) | **missing / N/A** — no password auth | N/A | N/A | None for Day-1 model |
| E9 | Security-sensitive account alerts (e.g. new login, lockout) | n/a | Member | Product + Implementation | transactional | launch-required **only if auth model supports** | **missing** — login rate-limit is D1-only (`functions/api/login.ts`); no email alert | N/A | User sees login failure locally only | Product decide whether any Day-1 security email is required; if none, record explicit N/A at #2924 acceptance |
| E10 | Fundraiser donation confirmation | Givebutter (external) | Donor | Product / external | external-provider | external / blocked program | **external** — no in-repo send; fundraiser program blocked pending launch auth | Provider-owned | Site must not claim LGFC emailed a receipt it did not send | Keep out of adapter until fundraiser unblocked; do not duplicate Givebutter receipts |
| E11 | Operational test/alert messages for #2780 | TBD after provider validation | Operators | Day-2 / Implementation | admin-internal | launch-required (per #2785 ↔ #2780) | **missing** in email adapter; Slack/Bridge notify scripts are **not** substitute product email | N/A | Ops alerts today ≠ member transactional email | After #2923 validation, define test message in #2924/#2925; #2780 remains successor/gated |
| E12 | Newsletter / marketing / “periodic updates” blast | Would use same adapter if built | Opted-in members only | Product | **optional-marketing** — must stay consent + unsubscribe gated | optional-deferred | **not implemented** as blast; welcome default copy currently *sounds* marketing-like | N/A | Opt-in checkbox exists (`AuthClient`, myprofile) but does not gate E1 | **Must not** ship marketing without consent/unsubscribe; route welcome classification to #2919 `email_opt_in` decision |
| E13 | Bounce / complaint / suppression handling | Provider webhooks (none) | Ops / suppression list | Implementation/Ops | transactional hygiene | launch-required procedures (#2785 unit 6 / #2925) | **missing** — no webhooks, no suppression table | Failed sends logged only | Admin can export `join_email_log`; no bounce UI | Design in #2925 after provider capabilities known (#2923) |
| E14 | Unsubscribe / List-Unsubscribe | Reply-to human text only | Member requesting removal | Administration (manual) | required for optional-marketing; best practice for bulk | launch for any non-transactional send | **partial** — welcome text: reply to remove; no `List-Unsubscribe` header; no automated suppression | Manual only | Privacy page points to admin email for removal | #2919 / Product: if welcome remains marketing-like, require real unsubscribe before scale; transactional-only rewrite may allow reply-to interim |

---

## Recipients summary

| Recipient role | Current channels | Notes |
| --- | --- | --- |
| Member / joiner | Welcome email (E1/E3) when enabled | Delivery not gated by `email_opt_in` |
| Administrator | `MAIL_ADMIN_TO` join notify (E2/E3) | Skipped if unset |
| Security | None | No security email events |
| Contact / support | Human mailto inboxes | Apple iCloud Mail per vendor inventory |
| Fundraiser | External Givebutter | Not in-repo |
| Operations | `scripts/slack_notify.sh`, Cursor Bridge `notify.mjs` | Not product transactional email |

---

## Current code map (read-only evidence)

| Path | Role |
| --- | --- |
| `functions/_lib/email.ts` | Sole outbound adapter; MailChannels; welcome + admin helpers; `assertEmailEnvOrThrow` |
| `functions/api/join.ts` | Join + E1/E2; calls `assertEmailEnvOrThrow`; returns email results; logs attempts |
| `functions/api/ask.ts` | Ask intake + optional first-join email side effect (no assert) |
| `functions/api/admin/welcome-email.ts` | Admin CRUD for welcome body (no send) |
| `functions/api/admin/export.ts` / `stats.ts` | `join_email_log` visibility |
| `migrations/0005_join_email_log.sql` | Audit schema |
| `migrations/0023_welcome_email_content.sql` (+ later seeds) | Admin-managed welcome intro MD |
| `src/app/auth/AuthClient.tsx` | Opt-in checkbox; join success UX without delivery status |
| `src/app/ask/page.tsx` | “We'll reply by email.” success copy |
| `src/app/contact/page.tsx` | Mailto contact |
| `src/app/fanclub/myprofile/page.tsx` | Opt-in preference UI |
| `src/app/privacy/page.tsx` | Removal via admin email narrative |
| `docs/reference/architecture/vendor-inventory.md` | MailChannels + iCloud Mail |
| `docs/archive/research/phase-6-email.md` | Historical MailChannels smoke notes |
| `.env.example` | `MAILCHANNELS_*`, `MAIL_FROM`, `MAIL_REPLY_TO`, `MAIL_ADMIN_TO`; Resend/SendGrid commented unused |
| `scripts/ci/preview-isolation-manifest.json` | Preview keeps MailChannels disabled |
| `tests/preview-isolation-inventory.test.ts` | Asserts preview isolation for MailChannels flag |
| `tests/admin-operations.test.tsx` | Welcome-email admin empty-state UI only |

Non-product notify (excluded from launch email contract): `scripts/cursor-bridge/lib/notify.mjs`, `scripts/slack_notify.sh`, Administration & Communications agent-routing docs.

---

## Privacy / consent / #2784 dependency routing

Do **not** treat #2784 as a global blocker for this inventory. Exact dependencies:

| Dependency | Finding / decision owner | How #2922 treats it | Blocks which later work |
| --- | --- | --- | --- |
| Welcome vs transactional vs marketing; whether `email_opt_in` must gate send | #2918 inventory row + #2919 register item `email_opt_in` send-gate (options: gate; rewrite transactional; accept gap) | Recorded as open Product decision; inventory does not choose | Runtime gating/copy in #2924; any marketing send forever |
| Unsubscribe beyond reply-to for non-transactional mail | #2918 transactional-email row; #2785 optional marketing rule | Marketing remains **explicitly consent/unsubscribe gated** here | #2924/#2925 if Product keeps marketing-like welcome or adds newsletter |
| Privacy/deletion copy mentioning email collection | #2918 F1 / auth-data enumeration; #2920 public-copy lane | Identified only; no copy change | Public copy tasks — not #2922 writable scope |
| Claude lane #2919/#2920/#2921/#2784 | Parallel; do not mutate | Read-only collision check | Consume accepted dispositions before integrating dependent behavior |

**Standing rule restated:** Optional marketing/newsletter delivery remains consent- and unsubscribe-gated. This inventory does not authorize ungated marketing.

---

## Failure, retry, and audit behavior (as-built)

| Behavior | Evidence |
| --- | --- |
| Provider disabled | `MAILCHANNELS_ENABLED≠1` → `{ sent:false, provider:'disabled' }` |
| Missing key/from when enabled | Soft fail on send; join calls `assertEmailEnvOrThrow` (hard fail 500 if enabled + missing required env) |
| Non-202 provider response | Logged `failed`; join/ask still succeed |
| Retries | None |
| Bounce/complaint webhooks | None |
| Idempotency | Duplicate join → 409, no re-send; Ask skips side effect if join already exists |
| Preview isolation | MailChannels off by default in preview manifest / platform docs |

---

## Proposed implementation paths and tests (for later tasks — not executed here)

### #2923 — Provider / domain / secret / quota / contingency validation

Proposed evidence/docs paths (subject to #2923 allowlist when opened):

- `docs/ops/reports/transactional-communications-provider-validation-2923.md` (expected)
- Read-only use of `.env.example` names, vendor inventory, platform isolation docs
- No Production credential mutation

Proposed validation evidence: disabled-provider, missing-secret, free-tier/terms notes, SPF/DKIM/DMARC requirements checklist, contingency “email off + on-screen confirmation” path.

### #2924 — Provider-neutral envelope, templates, launch events

Proposed code paths (future allowlist candidates):

- `functions/_lib/email.ts` — extract provider-neutral send envelope; keep MailChannels as one adapter
- `functions/api/join.ts`, `functions/api/ask.ts` — consume envelope; gate/copy per accepted #2919 disposition; truthful API + UI fields
- New template/registry module under `functions/_lib/` (name TBD in #2924)
- `src/app/auth/AuthClient.tsx`, `src/app/ask/page.tsx` — surface disabled/failed delivery honestly
- Tests: `tests/api/join-email-*.test.ts` (opt-in gate, disabled provider, missing secret, duplicate suppression); Ask receipt tests if added

### #2925 — Deliverability, bounce/unsubscribe, monitoring, #2780 handoff, rollback

Proposed paths:

- Ops runbooks under `docs/ops/` / `docs/how-to/` (exact names in #2925)
- Suppression/bounce schema only if Product/#2923 capabilities require
- Monitoring hooks compatible with #2780 without claiming #2780 complete

---

## Launch-required completeness checklist (inventory view)

| #2785 launch class | Status after this inventory |
| --- | --- |
| Membership/join receipt | Present (E1) — consent/classification gap open |
| Administrator join notification | Present (E2) |
| Security-sensitive account messages supported by auth model | None required by locked Day-1 auth **or** missing E9 — Product must confirm N/A vs add |
| Ask/contact receipt or failure disposition | Contact mailto OK as human disposition (E5); dedicated Ask receipt missing (E4) |
| Operational test/alert for #2780 | Missing (E11) — later serial tasks |
| Optional marketing | Not built; must remain consent/unsubscribe gated (E12/E14) |

---

## Findings (non-blocking for inventory close; routed)

- **C1 — Consent/classification conflict.** Welcome sends regardless of `email_opt_in`; copy is marketing-like. Route: #2919 `email_opt_in` send-gate (do not invent disposition).
- **C2 — Truthful UI gap.** Join/Ask UX does not show disabled/failed delivery despite API/log evidence.
- **C3 — Ask path inconsistency.** Hardcoded `email_opt_in=1`; skips `assertEmailEnvOrThrow`.
- **C4 — No bounce/unsubscribe automation.** Reply-to + manual admin email only.
- **C5 — Provider not launch-committed.** MailChannels is as-built + inventory-listed; #2923 must validate before rely. Resend/SendGrid are unused placeholders.
- **C6 — Component branch bootstrap.** `component/transactional-communications` did not exist; created at start of #2922 from `main` @ `df919950…` per Project Graduation naming.

---

## Validation

Documentation-only task. Commands:

- Repository path reads for every cited file (adapter, callers, auth model, migrations, UI, vendor inventory, `.env.example`, related #2918/#2919 text on `component/compliance-readiness`)
- `DIATAXIS_CHANGED_FILES_FILE` folder audit for this report path
- `scripts/ci/docs_check_headers.sh` / `docs_check_paths.sh` on the new file
- `git diff --check`

No runtime, credential, or Production verification claimed.

## Rollback

Delete or revert `docs/ops/reports/transactional-communications-inventory-2922.md`. No other repository impact.

## Stop conditions

None triggered that block completing this inventory. Protected Product decisions (C1 and related) are recorded as routed dependencies, not invented. No paid provider, credential, DNS, or Production mutation performed.
