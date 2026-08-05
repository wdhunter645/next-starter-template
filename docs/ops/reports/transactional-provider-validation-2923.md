---
Doc Type: Operations
Audience: Bill, Work, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2923 zero-cost provider, domain, sender, secrets, quota, and contingency validation for Project #2785
Does Not Own: Provider signup, paid commitments, DNS/credential mutation, Production sender activation, public-copy changes, runtime implementation (#2924), or deliverability qualification (#2925)
Canonical Reference: /docs/reference/architecture/vendor-inventory.md
Related Issues: #2785, #2922, #2923, #2924, #2925, #2784, #2919, #2780
Last Reviewed: 2026-08-05
---

# Transactional Communications — Provider / Domain / Secret / Contingency Validation (#2923)

## Purpose

Validate whether LGFC can rely on a **zero-cost** outbound email path for launch-required transactional messages: current MailChannels adapter fitness, provider availability/terms, domain and sender identity, SPF/DKIM/DMARC requirements, secret boundaries, quotas, logging, and a truthful no-provider contingency.

This document is **evidence and decision routing only**. It does not create a MailChannels account, mutate DNS or credentials, enable Production sending, or implement #2924+.

## Scope

- In scope: repository as-built on `component/transactional-communications` tip `d220bcde1a20b192b996d14c966ccb251a35113f`; public MailChannels documentation cited below; public pricing/terms evidence available to the agent without signup.
- Out of scope: paid provider commitment; DNS mutation; secret creation or live secret inspection; runtime/public-copy/workflow edits; Production activation.

## Current known truth

- The sole outbound product-email adapter is `functions/_lib/email.ts`, calling MailChannels `POST https://api.mailchannels.net/tx/v1/send` with `X-Api-Key` when `MAILCHANNELS_ENABLED=1`; otherwise it returns `{ sent: false, provider: 'disabled' }`.
- The historical free Cloudflare Workers MailChannels integration ended **2024-06-30** and must not be relied on.
- Current MailChannels Email API docs require an account, API key, and Domain Lockdown DNS; public pricing describes a **free developer plan** (~100 emails/day) before paid monthly tiers.
- Preview/component isolation keeps MailChannels disabled by default; Production enablement, DNS mutation, credential creation, and paid upgrades remain Bill-owned.
- Join/Ask preserve D1 requests when email is disabled or fails; UI still does not always surface non-delivery (#2924 gap). Live SPF/DKIM/DMARC/Domain Lockdown state for `lougehrigfanclub.com` was not verified in the agent environment.

## Intended final state

Project #2785 reaches a Product-accepted provider posture (MailChannels Email API free plan **or** an explicit contingency-only path), with DNS/sender authentication complete only under Bill authority, a provider-neutral envelope and truthful disabled/failure UX from #2924, and deliverability/bounce/unsubscribe/monitoring qualification from #2925 — without false delivery claims and without unpaid Production enablement. This task only validates and routes; it does not claim that final state is complete.

## Evidence sources

| Source | Role |
| --- | --- |
| `functions/_lib/email.ts` | Sole outbound adapter |
| `functions/api/join.ts`, `functions/api/ask.ts` | Callers |
| `.env.example`, `scripts/ci/preview-isolation-manifest.json`, `docs/reference/platform/component-environment-isolation.md` | Env defaults and preview isolation |
| `docs/reference/architecture/vendor-inventory.md` | Vendor listing |
| `docs/ops/reports/transactional-communications-inventory-2922.md` | Event inventory (#2922) |
| `docs/archive/research/phase-6-email.md` | Historical smoke notes |
| [MailChannels Email API overview](https://docs.mailchannels.com/email-api/overview) | Current API prerequisites |
| [MailChannels Email API pricing](https://docs.mailchannels.com/email-api/billing/pricing) and [MailChannels pricing](https://www.mailchannels.com/pricing/) | Free developer plan / paid tiers |
| [MailChannels blog — Workers free API termination](https://blog.mailchannels.com/important-update-mailchannels-email-sending-api-for-cloudflare-workers-to-be-terminated/) | Free Workers integration ended **2024-06-30** |

DNS authentication **live state** for `lougehrigfanclub.com` was **not verified in this agent environment** (no authoritative dig results returned). DNS requirements below are derived from provider docs; actual published records remain an operator/Product check without mutation.

---

## 1. Current MailChannels adapter and call paths

| Item | As-built |
| --- | --- |
| Adapter | `functions/_lib/email.ts` |
| Endpoint | `POST https://api.mailchannels.net/tx/v1/send` |
| Auth header | `X-Api-Key: <MAILCHANNELS_API_KEY>` when enabled |
| Enable gate | `MAILCHANNELS_ENABLED === '1'`; otherwise `{ sent: false, provider: 'disabled' }` |
| Required when enabled | `MAILCHANNELS_API_KEY`, `MAIL_FROM` (`assertEmailEnvOrThrow` on join); soft-fail on send if missing key/from |
| Optional | `MAIL_REPLY_TO`, `MAIL_ADMIN_TO`, `NEXT_PUBLIC_SITE_URL` |
| Helpers | `sendWelcomeEmail`, `sendAdminJoinNotification` |
| Success signal | HTTP **202** → `{ sent: true, provider: 'mailchannels' }` |
| Callers | `functions/api/join.ts` (welcome + admin; asserts env when enabled); `functions/api/ask.ts` (first-time join side effect; no assert) |
| Audit | D1 `join_email_log` |
| Preview | `MAILCHANNELS_ENABLED=0` required (`preview-isolation-manifest.json`) |

**Fitness vs current MailChannels Email API:** The as-built client matches the documented authenticated Email API pattern (API key + JSON send). It does **not** implement Domain Lockdown proof in-repo, DKIM fields in the payload, or webhooks. Those are external/DNS/account concerns.

---

## 2. Provider availability and terms (current evidence)

### Terminated path (do not rely on)

MailChannels terminated the **free Cloudflare Workers email-sending API** on **30 June 2024**. After that date the unauthenticated Workers convenience path stopped accepting requests. Any design that assumed “free Workers MailChannels without an account” is **obsolete**.

### Current path (Email API)

Per MailChannels Email API overview (retrieved 2026-08-05), sending requires:

1. A MailChannels account (`dash.mailchannels.net`)
2. An API key with `api` scope
3. A **Domain Lockdown** DNS TXT record for each sending domain

### Zero-cost posture

Public pricing docs (MailChannels Email API billing/pricing and mailchannels.com/pricing, retrieved 2026-08-05) describe a **free developer plan**:

- **$0 / month**
- About **100 emails / day** (marketing also states up to ~3,000 / month with no overages / daily cap language)
- Intended for testing, development, and low-volume application email
- No credit card required for the free plan per signup flow evidence
- Paid tiers begin around **10,000 emails / month** (exact dollar amounts are Bill-owned commercial decisions; this task does **not** commit to any paid plan)

**Conclusion for #2785 launch volume:** Join welcome + admin notify at LGFC scale likely fits the free daily cap **if** Product accepts MailChannels Email API + free plan **and** completes account + DNS prerequisites. Burst risk and newsletter/marketing volume would exceed free tier and require a paid plan or a different provider — both are Bill-owned.

**No paid commitment is made by this task.**

---

## 3. Domain and sender identity requirements

| Requirement | Evidence / LGFC implication |
| --- | --- |
| Sending domain | Must resolve (A or MX); MailChannels rejects otherwise (`550 5.1.2` class errors per docs) |
| From identity | `.env.example` proposes `Lou Gehrig Fan Club <noreply@lougehrigfanclub.com>` |
| Reply-To | Optional; example `admin@lougehrigfanclub.com` (human mailbox / iCloud layer per vendor inventory) |
| Admin recipients | `MAIL_ADMIN_TO` comma-separated; skipped if empty |
| Domain Lockdown | Required TXT on `_mailchannels.<domain>` authorizing the MailChannels account — **Bill/DNS owned**; not present in repo config |
| Live DNS state | **Unverified in this session** — operator must confirm before enablement |

Protected: choice of from-address, reply-to, and whether `noreply@` is acceptable for transactional receipts.

---

## 4. SPF, DKIM, and DMARC (requirements without DNS mutation)

Per MailChannels Email API production checklist / SPF–DKIM–DMARC docs:

| Control | Required before Production send | Notes |
| --- | --- | --- |
| SPF | Publish / merge `include:relay.mailchannels.net` into the domain SPF TXT | Single SPF record only |
| DKIM | Configure signing (MailChannels-managed keys or self-managed) and publish DNS | Adapter today does not pass `dkim_*` fields |
| DMARC | Start with monitoring (`p=none`) recommended | Improves disposition over time |
| Domain Lockdown | TXT on `_mailchannels` | Account authorization |

**Current known state:** Not asserted from live DNS in this task. Treat as **unknown until Product/Day-2 confirms**. Enabling `MAILCHANNELS_ENABLED=1` without these records risks silent failure or poor deliverability — must not claim delivery.

---

## 5. Secret and credential boundaries

| Secret / env | Boundary |
| --- | --- |
| `MAILCHANNELS_API_KEY` | Cloudflare Pages / Workers secret only; `.env.example` uses non-secret placeholder `change-me-mailchannels-api-key` |
| `MAILCHANNELS_ENABLED` | Config flag; default `0` |
| `MAIL_FROM` / `MAIL_REPLY_TO` / `MAIL_ADMIN_TO` | Non-secret identity strings; still environment-scoped |
| Logging | Adapter truncates provider error bodies; must never log API key values (as-built throws/logs missing **key names** only in `assertEmailEnvOrThrow`) |
| Preview | Must not carry production MailChannels enablement or production API keys (`component-environment-isolation.md`) |

This task did **not** inspect live Cloudflare secrets.

---

## 6. Quotas, limits, logging, failure handling, privacy

| Topic | As-built / evidence |
| --- | --- |
| Provider quota | Free plan ~100/day; paid tiers monthly — Bill decides when/if to upgrade |
| Adapter rate limit / retry | **None** — single attempt |
| Idempotency | Duplicate join → 409, no re-send; Ask skips join side effect if member exists |
| Failure handling | Join/Ask succeed even if email fails/disabled; results logged to `join_email_log` |
| Hard fail | Join returns 500 only if enabled **and** required env missing (`assertEmailEnvOrThrow`) |
| Privacy | Do not put secrets or full message bodies in logs; welcome copy / consent still gated by #2919 Product decisions |
| Bounce/complaint webhooks | **Not implemented** — deferred to #2925 after provider capability acceptance |

---

## 7. Truthful zero-provider contingency

**Required behavior when provider is unavailable, disabled, misconfigured, or unpaid-blocked:**

1. Keep `MAILCHANNELS_ENABLED=0` (or treat send failures as non-delivery).
2. **Preserve** the user request in D1 (`join_requests` / Ask inbox) — already true for join/ask.
3. Return API fields that expose `sent: false` / provider / error (join already returns `email` result objects).
4. **Never** show UI copy that claims email was delivered when it was not.
5. Provide an on-screen confirmation / support path and administrative queue evidence (admin notify skipped when unset; human mailto contact remains available).

**Gap (for #2924):** AuthClient / Ask success UX today does not surface disabled/failed delivery (#2922 finding C2). Contingency design is sound at API/log layer; UI truthfulness is unfinished.

**Rollback:** Disable sending via `MAILCHANNELS_ENABLED=0`; no data loss of join/ask records.

---

## 8. Proposed implementation paths and tests for #2924

Writable allowlist for #2924 must be recorded on that Issue before edits. Candidates from this validation + #2922:

| Path | Purpose |
| --- | --- |
| `functions/_lib/email.ts` | Provider-neutral send envelope; keep MailChannels as one adapter; disabled/missing-key/timeout/rejection shapes |
| New `functions/_lib/` template/registry module (name TBD) | Accessible text/HTML templates; transactional vs marketing classification hooks |
| `functions/api/join.ts`, `functions/api/ask.ts` | Consume envelope; honor accepted #2919 consent disposition; consistent env assert |
| `src/app/auth/AuthClient.tsx`, `src/app/ask/page.tsx` | Truthful disabled/failed delivery UX |
| Tests | `tests/api/join-email-*.test.ts` (disabled provider, missing secret, rejection, duplicate suppression, rate-limit stub); Ask receipt tests if Product requires |

**Do not** enable Production sending or mutate DNS/credentials in #2924 without explicit Bill authority.

---

## 9. Protected decisions that remain Bill-owned

| Decision | Why protected |
| --- | --- |
| Create MailChannels account / accept free-plan terms | Provider commitment / legal |
| Any paid MailChannels tier or alternate paid provider (Resend, SendGrid, Cloudflare Email Workers binding, etc.) | Cost |
| Publish/alter SPF, DKIM, DMARC, Domain Lockdown DNS | DNS mutation |
| Create or rotate `MAILCHANNELS_API_KEY` in Production | Credential |
| Set `MAILCHANNELS_ENABLED=1` on Production | Production activation |
| Final from/reply-to identity and admin recipient list | Sender / privacy |
| Welcome vs transactional classification / `email_opt_in` gate (#2919) | Product / privacy |
| Whether free-tier daily cap is acceptable for launch | Product / ops risk |

---

## Disposition summary

| Question | Result |
| --- | --- |
| Can LGFC keep using the as-built MailChannels HTTP adapter shape? | **Yes** — matches current Email API; needs account key + Domain Lockdown |
| Is a documented **zero-cost** path available? | **Conditionally yes** — MailChannels Email API **free developer plan** (~100/day), **not** the terminated Workers free integration |
| Are DNS/sender prerequisites satisfied today? | **Unknown / not verified here** — treat as incomplete until operator confirms |
| May Cursor enable sending or pay for a plan? | **No** — Bill-owned |
| Safe contingency without provider? | **Yes** at data/API layer; **UI truthfulness still required in #2924** |
| Paid commitment made? | **No** |

**Recommended next step for Product/Work:** Accept or reject MailChannels Email API free plan as the Development target provider; if accepted, authorize a bounded Day-2/DNS package for Domain Lockdown + SPF/DKIM/DMARC **separate from** #2924 code work. If rejected, keep email disabled and proceed #2924 envelope + truthful UI against the contingency path only.

---

## Validation

- Repository claims verified against component tip `d220bcde…`
- Public provider docs cited above (no signup, no DNS mutation, no secret inspection)
- Docs header / DIATAXIS / `git diff --check` on allowlisted file (recorded in PR)

## Rollback

Delete or revert `docs/ops/reports/transactional-provider-validation-2923.md`. No provider, DNS, credential, runtime, or Production state changed.

## Stop conditions

None triggered that block completing this documentation validation. Protected decisions are routed, not invented. No paid provider, credential, DNS, or Production mutation performed.
