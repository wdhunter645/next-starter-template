---
Doc Type: Operations
Audience: Bill, Work, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2925 deliverability qualification, controlled failure evidence, configuration-disable rollback proof, monitoring handoff notes, and Day-2 ownership routing for Project #2785
Does Not Own: Live sender/DNS/credential activation, paid commitments, Production enablement, #2780 monitoring implementation, Product consent disposition (#2919), or bounce/suppression schema invention
Canonical Reference: /docs/ops/reports/transactional-provider-validation-2923.md
Related Issues: #2785, #2922, #2923, #2924, #2925, #2780, #2784, #2919
Last Reviewed: 2026-08-05
---

# Transactional Communications — Deliverability / Rollback / Monitoring / Day-2 Qualification (#2925)

## Purpose

Qualify launch-required transactional email **without** live Production sending or DNS mutation:

1. Controlled deliverability and failure-path evidence (stub/unit only).
2. Documented SPF/DKIM/DMARC / Domain Lockdown requirements (validation checklist; no DNS writes).
3. Proven configuration-disable rollback (`MAILCHANNELS_ENABLED=0`).
4. Monitoring evidence compatible with #2780 (handoff only; #2780 not claimed complete).
5. Support and Day-2 operator procedures (`docs/how-to/ops/transactional-email-day2-operator-handoff.md`).

## Scope

- In scope: repository as-built on `component/transactional-communications` tip `1d1659e633fbaec197ead8209602ef49271a4b91` (post-#2924); controlled envelope tests; documentation.
- Out of scope: MailChannels account signup; paid plan; DNS mutation; secret creation/rotation; setting Production `MAILCHANNELS_ENABLED=1`; uncontrolled external sends; inventing Product consent gates; implementing #2780.

## Current known truth

- #2924 integrated a provider-neutral envelope (`functions/_lib/email-envelope.ts`), templates, Join/Ask API `deliveryMessage`, and truthful Join/Ask UI messaging on the component branch.
- Default and preview-safe posture remains `MAILCHANNELS_ENABLED=0` (`.env.example`, preview-isolation manifest). Disabled sends return `{ sent: false, provider: 'disabled', reason: 'disabled' }` without calling the provider.
- Join/Ask retain D1 user requests when email is disabled or fails; optional-marketing classification is blocked pending #2919.
- Live SPF/DKIM/DMARC/Domain Lockdown for `lougehrigfanclub.com` remains **unverified / Bill-owned** (#2923). This task does not claim those records exist.
- Bounce/complaint webhooks and suppression tables are **not implemented**. Day-2 uses manual mailbox + `join_email_log` until Product/#2780 authorize automation.
- #2780 (Production Monitoring / Alerting / Incident Ownership) is a separate Active project on `component/production-monitoring-response`. This task only defines handoff signals.

## Intended final state

After Bill-owned DNS/sender activation (separate authority), operators can: confirm required DNS; enable sending only under protected Production authority; disable sending instantly via config; observe send outcomes in `join_email_log` / admin export; follow Day-2 bounce/unsubscribe and support procedures; and feed monitoring/incident ownership into #2780 without false delivery claims.

This task documents and proves the Development-safe qualification path. It does **not** activate Production sending.

## Evidence sources

| Source | Role |
| --- | --- |
| `functions/_lib/email-envelope.ts` | Delivery controls and rollback surface |
| `functions/_lib/email.ts`, `functions/_lib/email-templates.ts` | Launch events (welcome + admin join) |
| `functions/api/join.ts`, `functions/api/ask.ts` | Callers + `join_email_log` |
| `src/app/auth/AuthClient.tsx`, `src/app/ask/page.tsx` | Truthful UI |
| `src/app/admin/audit/page.tsx` | Admin export of `join_email_log` |
| `.env.example`, `scripts/ci/preview-isolation-manifest.json` | Fail-closed defaults |
| #2922 / #2923 reports | Inventory + provider/DNS requirements |
| `tests/api/join-email-envelope.test.ts` | #2924 controlled cases |
| `tests/api/join-email-deliverability-2925.test.ts` | This task’s qualification cases |
| `docs/how-to/ops/transactional-email-day2-operator-handoff.md` | Day-2 procedure |

## 1. Controlled deliverability and failure tests

**Boundary:** stub transport only. No live `api.mailchannels.net` calls. No Production env mutation.

| Case | Expected | Evidence |
| --- | --- | --- |
| Disabled provider | `sent:false`, `reason:disabled`; transport not called; user-safe message | envelope suite + #2925 suite |
| Missing API key / MAIL_FROM | deterministic `missing_*`; fail-closed assert when enabled | envelope suite |
| Hard provider rejection (4xx) | `reason:rejected`; no retry storm | envelope suite |
| Timeout + retry | retries per `MAIL_RETRY_MAX`; final `reason:timeout` | envelope suite |
| Duplicate idempotency | second send suppressed | envelope suite |
| Rate limit | `reason:rate_limited` | envelope suite |
| Optional marketing | blocked pending #2919 | envelope suite |
| **Config-disable rollback** | After a successful stub send, setting `MAILCHANNELS_ENABLED=0` yields disabled without transport | #2925 suite |
| **Welcome + admin launch events (templates)** | Accessible text/HTML subjects/bodies present; no secrets in content | #2925 suite |
| Truthful user message | Never claims delivery when `sent!==true` | both suites |

Secrets and private member data must not appear in test fixtures or this report (placeholders only).

## 2. DNS / sender authentication checklist (no mutation)

Per #2923 MailChannels Email API requirements — **operator confirms; agents do not mutate**:

| Control | Required before Production enablement | Mutation authority |
| --- | --- | --- |
| MailChannels account + API key in env | Yes | Bill / Day-2 secrets |
| Domain Lockdown DNS for sending domain | Yes | Bill |
| SPF includes MailChannels guidance | Yes | Bill |
| DKIM per MailChannels | Yes | Bill |
| DMARC present (start `p=none` recommended) | Yes | Bill |
| `MAIL_FROM` / `MAIL_REPLY_TO` / `MAIL_ADMIN_TO` correct | Yes | Bill / Ops |
| Preview/`MAILCHANNELS_ENABLED=0` on non-prod | Always | Enforcement already documented |

**Current state:** live DNS for `lougehrigfanclub.com` **not verified in this task** — treat as incomplete until Bill/Day-2 confirms.

## 3. Configuration-disable rollback (proven)

**Primary rollback (preferred, zero deploy):** set Cloudflare Pages / Workers env `MAILCHANNELS_ENABLED=0` (or unset / non-`1`).

Proven behavior (code + unit evidence):

1. Envelope short-circuits before transport.
2. Join/Ask continue to persist user requests.
3. API/UI expose non-delivery honestly (`deliveryMessage` / Join-Ask copy).
4. Admin can still inspect `join_email_log` for prior attempts.

**Secondary rollback:** revert component-branch email PRs (#3085 / predecessors) if code regression — multi-step; does not replace config disable for incident response.

**Data safety:** disable does not delete `join_requests`, Ask inbox, or historical `join_email_log` rows.

## 4. Monitoring evidence handoff to #2780

Compatible signals (already available; not a substitute for #2780):

| Signal | Location | Notes |
| --- | --- | --- |
| Per-attempt send result | D1 `join_email_log` (`result`, `provider`, `status_code`, `error`) | Privacy: avoid logging API keys or full message bodies |
| Admin export | `/admin/audit` → `join_email_log` | Operator review |
| API response fields | Join/Ask `email.welcome` / `email.admin` / `deliveryMessage` | Runtime truth |
| Preview isolation | `MAILCHANNELS_ENABLED` must stay `0` on preview | Prevents accidental prod-shared sends |

**Explicit non-claims:**

- No automated bounce/complaint webhook ingestion.
- No Slack/PagerDuty/email-ops alert wiring claimed complete under #2780.
- No Production SLO / page created by this task.

**Recommended #2780 intake (do not implement here):** alert when enabled-env error rate on `join_email_log` spikes; alert when Production enablement drifts on preview; ticket queue for bounce mailbox review.

## 5. Bounce, complaint, unsubscribe (Day-2 procedural)

Until Product authorizes automation:

| Class | Procedure |
| --- | --- |
| Bounce / soft fail | Operator reviews provider/mailbox bounce notices + `join_email_log` failures; do not re-blast; prefer config disable if systemic |
| Complaint / spam | Treat as stop-send for that address; record on support issue; Product decides suppression store later |
| Unsubscribe (marketing-like) | Reply-to / admin mailbox removal; optional marketing remains blocked in envelope until #2919 |
| Transactional necessary mail | Keep truthful; do not invent marketing opt-out as a send-gate for transactional without Product disposition |

## 6. Support and Day-2 ownership

Canonical procedure: `docs/how-to/ops/transactional-email-day2-operator-handoff.md`.

| Concern | Owner |
| --- | --- |
| Production `MAILCHANNELS_ENABLED=1` | Bill (protected) |
| DNS / Domain Lockdown / SPF / DKIM / DMARC | Bill |
| Secrets create/rotate | Bill / Day-2 secrets process |
| Config disable during incident | Day-2 Ops (Implementation/Operations may execute when authorized) |
| Member support (“I didn’t get email”) | Administration / support using join-Ask records + log export |
| Monitoring platform buildout | #2780 |
| Consent / welcome classification | #2919 / #2784 |

## 7. Production sender activation remains separately protected

This task **does not** authorize:

- Creating/paying MailChannels plans
- Publishing DNS
- Creating Production API keys
- Setting Production `MAILCHANNELS_ENABLED=1`

Those remain Bill-owned protected decisions recorded in #2923 §9.

## Disposition summary

| Question | Result |
| --- | --- |
| Do required events + truthful fallbacks pass controlled tests? | **Yes** — envelope + #2925 suites (stub only) |
| Are secrets/private data absent from evidence? | **Yes** — placeholders only |
| Is Production sender activation separately protected? | **Yes** — documented; not performed |
| Are rollback, monitoring, support, Day-2 ownership documented? | **Yes** — this report + Day-2 how-to |
| Live deliverability to real inboxes proven? | **No** — requires Bill-owned DNS + enablement; explicitly out of scope |
| Bounce automation complete? | **No** — procedural Day-2 only |

## Validation

- Controlled: `npx vitest run tests/api/join-email-envelope.test.ts tests/api/join-email-deliverability-2925.test.ts`
- Docs headers / DIATAXIS / `git diff --check` on allowlisted paths (recorded in PR)
- No live provider calls; no DNS/credential/Production mutation

## Rollback

Revert or delete:

- `docs/ops/reports/transactional-deliverability-qualification-2925.md`
- `docs/how-to/ops/transactional-email-day2-operator-handoff.md`
- `tests/api/join-email-deliverability-2925.test.ts`

Runtime email behavior remains as left by #2924.

## Stop conditions

None triggered that block this documentation/qualification task. Protected activation and DNS work are routed, not executed.
