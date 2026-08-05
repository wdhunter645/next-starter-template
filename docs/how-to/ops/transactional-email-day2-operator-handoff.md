---
Doc Type: How-To
Audience: Bill, Day-2 operators, Administration, Work, Cursor
Authority Level: Procedure
Owns: Step-by-step Day-2 operator handoff for LGFC transactional email (disable rollback, log review, bounce/unsubscribe support, monitoring signal handoff)
Does Not Own: Production enablement authority, DNS mutation, paid provider decisions, #2780 platform implementation, or Product consent disposition
Canonical Reference: /docs/ops/reports/transactional-deliverability-qualification-2925.md
Related Issues: #2785, #2925, #2924, #2923, #2922, #2780, #2919
Last Reviewed: 2026-08-05
---

# Transactional Email — Day-2 Operator Handoff

## Purpose

Operate join/Ask transactional email after Development integration (#2922–#2925) **without** assuming Production sending is enabled. Prefer configuration-disable rollback and truthful support responses.

## Prerequisites

- Read #2923 provider validation and #2925 qualification report.
- Confirm whether Production `MAILCHANNELS_ENABLED` is `0` or `1` (Bill authority for any change to `1`).
- Have access to Cloudflare Pages project env vars and `/admin/audit` (or equivalent D1 export) for `join_email_log`.
- Do **not** paste API keys, member message bodies, or PII into public issues.

## Controlled test boundary (agents and CI)

Use stub/unit tests only unless Bill authorizes a named mailbox pilot. Never enable preview env sending.

## Procedure

### 1. Confirm sender posture

1. Check env: `MAILCHANNELS_ENABLED`, presence (not values in tickets) of `MAILCHANNELS_API_KEY`, `MAIL_FROM`, `MAIL_REPLY_TO`, `MAIL_ADMIN_TO`.
2. If any Production enablement is requested, stop and route to Bill with the #2923 protected-decision list (DNS + Domain Lockdown + SPF/DKIM/DMARC first).
3. Preview/component builds must keep `MAILCHANNELS_ENABLED=0`.

### 2. Instant disable rollback (incident or suspected abuse)

1. Set `MAILCHANNELS_ENABLED=0` in the affected environment.
2. Redeploy/restart only if the platform requires env change propagation (Cloudflare Pages env updates typically apply on next deploy — follow platform practice).
3. Verify: a Join/Ask attempt returns non-delivery messaging; D1 request rows still created.
4. Record incident note: time, env, reason, who authorized disable. Do not include secrets.

### 3. Review delivery evidence

1. Open Admin Audit → `join_email_log` (or export).
2. Filter by recent `request_id` / message_type (`welcome` / `admin`).
3. Interpret `result`: `sent` | `skipped` | `failed` with `provider` / `status_code` / `error`.
4. Never claim “email delivered” to a member unless `result=sent` (provider accepted). Provider accept ≠ inbox guarantee.

### 4. Member support — “I didn’t get a welcome email”

1. Confirm join/Ask record exists (request retained even when email disabled/failed).
2. Check `join_email_log` for that request.
3. If disabled/missing config: explain email is not active; offer human contact path.
4. If failed/rejected: do not retry-blast; escalate to Ops with log metadata only.
5. If Production sending was never authorized: do not imply outage — state deferred activation.

### 5. Bounce, complaint, unsubscribe (manual)

1. Monitor `MAIL_REPLY_TO` / admin mailbox for bounces and unsubscribe replies.
2. For hard bounce or spam complaint: stop further optional mail to that address; open a support/ops note.
3. For unsubscribe of marketing-like content: remove from admin mailing practice; do not invent an automated suppression table unless Product authorizes a follow-up issue.
4. Optional-marketing envelope classification remains blocked until #2919 disposition.

### 6. Monitoring handoff (#2780)

When #2780 is ready to ingest:

| Signal | Suggested use |
| --- | --- |
| Spike in `join_email_log` `failed` while enabled | Page/ticket Ops |
| Preview env with `MAILCHANNELS_ENABLED=1` | Immediate disable + incident |
| Sustained provider 429/5xx | Consider config disable; Bill decides plan/quota |

Do not treat Slack Bridge or unrelated ops scripts as member transactional delivery monitoring.

### 7. Optional envelope controls (Development/staging only unless Bill expands)

| Variable | Effect |
| --- | --- |
| `MAIL_TIMEOUT_MS` | Provider call timeout (default 8000) |
| `MAIL_RETRY_MAX` | Extra attempts after timeout/transient (capped in code) |
| `MAIL_RATE_LIMIT_PER_MINUTE` | Isolate-local send ceiling when > 0 |

These do not replace Production enablement authority.

## Acceptance checks for operators

- [ ] Can disable sending via config without data loss
- [ ] Can find send outcomes in `join_email_log` without exposing secrets in tickets
- [ ] Know Bill owns DNS and Production enablement
- [ ] Know #2780 owns long-term alerting platform
- [ ] Know not to run uncontrolled live send tests

## Rollback

Follow §2 (config disable). Code rollback is separate and multi-step on the component branch if a regression is introduced.

## Related reading

- `docs/ops/reports/transactional-deliverability-qualification-2925.md`
- `docs/ops/reports/transactional-provider-validation-2923.md`
- `docs/reference/platform/component-environment-isolation.md`
