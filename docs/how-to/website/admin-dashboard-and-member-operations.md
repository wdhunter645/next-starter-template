---
Doc Type: How-To
Audience: LGFC operators, maintainers, and AI implementation agents
Authority Level: Operational Procedure
Owns: Dashboard, join requests, worklist, and member-operations admin procedures
Does Not Own: Member auth provisioning, D1 schema changes, or join approval policy
Canonical Reference: /docs/reference/architecture/access-model.md
Related issues: #1258, #1565, #1119
Last Reviewed: 2026-06-14
---

# Admin Dashboard and Member Operations

## Purpose

Operate the admin shell, join-request queue, team worklist, and member-operations
configuration surfaces (`#1119` / T41).

## Scope

Routes:

- `/admin` — dashboard and stats snapshot
- `/admin/join-requests` — inbound join queue
- `/admin/worklist` — team worklist
- `/admin/member-operations` — welcome email and membership card config

## Steps

1. Sign in as admin and save the admin API token.
2. Open the target route from `AdminNav` or dashboard cards.
3. Refresh data; confirm stats or lists load.
4. Perform the allowed action (review join request, update worklist item, edit member ops copy).
5. Confirm status text reports success or `Error:` on failure.

## Procedure

### Dashboard (`/admin`)

1. Open **Dashboard**.
2. Save token if prompted.
3. Review dashboard cards linking to operational lanes.
4. Use stats snapshot when present; treat missing stats as token or API configuration issue.

### Join requests (`/admin/join-requests`)

1. Open **Join Requests**.
2. Refresh the queue.
3. Review masked applicant fields; do not expect raw PII in admin UI.
4. Use available actions per row (approve/deny or documented deferral).
5. On API failure, note `Error:` status and retry after confirming token and D1 health.

### Worklist (`/admin/worklist`)

1. Open **Worklist**.
2. Refresh items from `/api/admin/worklist`.
3. Update or clear items per team process.
4. Confirm empty queue messaging when no items remain.

### Member operations (`/admin/member-operations`)

1. Open **Member Operations**.
2. Edit welcome-email or membership-card content exposed by the page.
3. Save through the page controls; confirm success status.
4. Verify public member surfaces separately if copy changes are user-visible.

## Verification

- `tests/admin-operations.test.tsx` covers layout, nav, and token gating patterns.
- Manual: each route loads only after token save; clearing token resets visible state.

## Closeout Criteria

Join/worklist/member-ops actions are complete when API responses succeed, status
text confirms the outcome, and no stale data remains after token clear.
