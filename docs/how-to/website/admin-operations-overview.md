---
Doc Type: How-To
Audience: LGFC operators, Atlas, Bill, maintainers, and AI implementation agents
Authority Level: Operational Procedure
Owns: Entry-point operator workflow for Website Operations Admin surfaces under Program #1258
Does Not Own: GitHub issue closure, runtime deployment, schema migration, or auth policy changes
Canonical Reference: /docs/reference/architecture/access-model.md
Related Issues: #1255, #1258, #1565
Last Reviewed: 2026-06-14
---

# Website Operations Admin — Overview

## Purpose

Orient operators to LGFC admin surfaces after Phase 4 hardening (Tasks 003–012). Use
this overview before lane-specific runbooks.

## Scope

Covers:

- dual admin gating (session UI + API token);
- navigation across `/admin/**` surfaces;
- pointers to per-surface runbooks;
- fail-closed expectations shared by hardened admin pages.

Does not cover editorial content strategy (`#1256`) or production QA (`#1259`).

## Steps

1. Sign in as an admin member and open `/admin`.
2. Save the admin API token in `AdminTokenPanel` on the target page (or dashboard).
3. Open the lane runbook for the surface you need.
4. Perform the operation; confirm status text reports success or an `Error:` prefix.
5. If token is cleared, expect lists and stats to reset until a token is saved again.

## Procedure

### 1. Satisfy the session UI gate

1. Sign in with a member account whose session returns `role: admin` from `/api/session/me`.
2. Navigate to `/admin` or any `/admin/**` route.
3. If redirected to `/`, the session is missing or not admin — resolve sign-in before continuing.

Reference: `src/app/admin/layout.tsx`, `docs/reference/architecture/access-model.md`.

### 2. Save the admin API token

Most admin pages use `AdminTokenPanel` and `localStorage` key `lgfc_admin_token`
(`src/lib/adminClient.ts`).

1. Enter the configured `ADMIN_TOKEN` value in **Admin token**.
2. Click **Save token**.
3. Wait for the page status to confirm data loaded (not “Save an admin API token above…”).

Without a saved token, hardened pages fail closed: no stats, lists, exports, or mutations.

### 3. Use admin navigation

`AdminNav` links (current `main`):

| Route | Runbook |
| --- | --- |
| `/admin` | [Dashboard and member operations](./admin-dashboard-and-member-operations.md) |
| `/admin/moderation` | [Moderation and FAQ](./admin-moderation-and-faq.md) |
| `/admin/audit` | [Audit and reporting](./admin-audit-and-reporting.md) |
| `/admin/faq` | [Moderation and FAQ](./admin-moderation-and-faq.md) |
| `/admin/content` | [CMS and page content](./admin-cms-and-page-content.md) |
| `/admin/cms` | [CMS and page content](./admin-cms-and-page-content.md) |
| `/admin/editorial` | [Editorial archive operations](./admin-editorial-archive-operations.md) |
| `/admin/events` | [Events calendar](./admin-events-calendar.md) |
| `/admin/matchup` | [Matchup administration](./admin-matchup.md) |
| `/admin/fundraiser-preview` | [Fundraiser preview](./admin-fundraiser-preview.md) |
| `/admin/join-requests` | [Dashboard and member operations](./admin-dashboard-and-member-operations.md) |
| `/admin/worklist` | [Dashboard and member operations](./admin-dashboard-and-member-operations.md) |
| `/admin/member-operations` | [Dashboard and member operations](./admin-dashboard-and-member-operations.md) |
| `/admin/media-assets` | [Media assets](./admin-media-assets.md) |
| `/admin/d1-test` | [D1 inspect](./admin-d1-inspect.md) |

Fan Club member operational paths (T40 / `#1118`): [Fan Club operational workflows](./fanclub-operational-workflows.md).

### 4. Shared fail-closed signals

After Tasks 004–012 hardening, expect:

- controls disabled until token is ready or while background work is active;
- error status prefixed with `Error:` for operator-visible failures;
- state cleared when the admin token is removed from the panel.

### 5. Verification quick checks

| Check | Expected |
| --- | --- |
| Open `/admin` without admin session | Redirect to `/` |
| Open hardened admin page without saved token | Prompt to save token; no API list loads |
| `GET /api/admin/stats` without `x-admin-token` | `401` JSON |
| Clear saved token on a hardened page | Lists/stats reset; controls disabled |

## Closeout Criteria

An operator session is correctly set up when admin session is active, token is saved,
and the target lane runbook procedure completes with success status or a documented
deferral to `#1259`.
