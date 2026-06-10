---
Doc Type: Reference
Audience: Human + AI
Authority Level: Canonical Architecture Specification
Owns: System architecture, data flows, access model, runtime dependencies
Does Not Own: Operational runbooks; governance policies; UI/UX design specifics
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Related issues: #1255, #1258
Last Reviewed: 2026-06-10
---

# LGFC Admin Access Model — As-Built

**Version:** 2026-06-10  
**Status:** Active (reconciled for Program `#1258` Task 002)

---

## Overview

LGFC admin operations use **dual gating**:

1. **Admin UI session gate** — `/admin/**` pages require an authenticated member session with `role: admin`.
2. **Admin API token gate** — `/api/admin/**` endpoints require the configured `ADMIN_TOKEN` on every request.

A site operator must satisfy **both** layers to use admin tools end-to-end: sign in as an admin member to reach the UI, then save the admin API token in the browser to load data and perform mutations.

This document reflects the as-built implementation on `main` after T40–T49 admin work (PRs `#1171`–`#1216`) and Task 001 gap analysis (PR `#1531`).

---

## Architecture summary

| Layer | Surface | Enforcement | Primary code |
| --- | --- | --- | --- |
| Member session | `/api/session/me` | Cookie-backed member session; returns `role: admin \| member \| guest` | `functions/api/session/me.ts`, `functions/_lib/session.ts` |
| Admin UI gate | `/admin/**` | Client layout redirects non-admin or unauthenticated users to `/` | `src/app/admin/layout.tsx`, `src/hooks/useMemberSession.ts` |
| Admin API gate | `/api/admin/**` | `x-admin-token` or `Authorization: Bearer` must match `env.ADMIN_TOKEN`; fail-closed if unset | `functions/_lib/auth.ts` (`requireAdmin`) |
| Operator token UX | Admin dashboard and most pages | Token entered in `AdminTokenPanel`; stored in browser `localStorage` | `src/components/admin/AdminTokenPanel.tsx`, `src/lib/adminClient.ts` |
| D1 test token UX (exception) | `/admin/d1-test` only | Page-local token input; stored in `sessionStorage` (not shared with `adminClient`) | `src/app/admin/d1-test/page.tsx` |

**Security boundary:** The UI gate controls **who can see and navigate** admin pages. The API gate controls **who can read or mutate** privileged data. Either layer alone is insufficient for full admin operations.

---

## Admin UI pages

### Routes

All admin UI routes live under `/admin/**`. Current routes include dashboard, moderation, audit, FAQ, CMS, content, editorial, events, matchup, fundraiser preview, join requests, worklist, member operations, media assets, and D1 inspect. See Task 001 inventory: `docs/ops/reports/website-operations-admin-as-built-gap-analysis.md`.

### Access model

**Session-gated (not public):** `src/app/admin/layout.tsx` wraps all admin pages and calls:

```typescript
useMemberSession({ redirectTo: '/', requireAdmin: true })
```

While loading, or when the session is missing or `role !== 'admin'`, the layout renders nothing and redirects to the public homepage.

**Client-side only:** The gate runs in the browser after `/api/session/me` returns. There is no server-rendered admin auth in the static export.

**What this protects:** Casual visitors and signed-in non-admin members cannot use admin navigation or page chrome.

**What this does not protect:** Determined clients could still request static admin JS bundles directly. Sensitive operations remain blocked at the API layer.

### Admin API token panel

Most admin pages load data through `/api/admin/**`. The dashboard includes `AdminTokenPanel`, which:

- Reads and writes `localStorage` key `lgfc_admin_token` (via `src/lib/adminClient.ts`)
- Sends the saved value as header `x-admin-token` on admin API calls
- Does **not** use `sessionStorage`

Help text on the panel: *"Admin pages are session-gated; operational APIs also require the configured admin token."*

---

## Admin API endpoints

### Routes

Privileged operations are under `/api/admin/**`, including stats, export, worklist, CMS, content, editorial, FAQ, Ask, reports, events, matchup, media assets, join requests, welcome email, membership card, footer quotes, and D1 inspect. See Task 001 inventory for the full file list under `functions/api/admin/**`.

### Access model

**Token-gated:** Every admin API handler should call `requireAdmin(request, env)` before reading or writing data.

**Token verification:**

- Client sends `x-admin-token` (or `Authorization: Bearer <token>`)
- Server compares against `env.ADMIN_TOKEN`
- Missing `ADMIN_TOKEN` configuration → `503` with `{ ok: false, error: "Admin access is not configured." }`
- Missing or wrong client token → `401` with `{ ok: false, error: "Unauthorized." }`

**Environment variable:**

| Field | Value |
| --- | --- |
| Name | `ADMIN_TOKEN` |
| Set in | Cloudflare Pages project settings (Production and Preview as needed) |
| Repository | Never committed |
| Recommended format | 32+ character random string |

### Example handler pattern

```typescript
import { requireAdmin } from "../../_lib/auth";

export const onRequestGet = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  // Proceed with admin operation
};
```

---

## Operator workflow (site operator)

Use this sequence when operating the live or preview site. No developer tooling is required beyond a browser and credentials supplied by the site maintainer.

### Prerequisites

- Your member account is assigned **admin** role in the member database (maintainer action).
- You have the **admin API token** value configured for the target environment (maintainer shares out-of-band; never post in chat or email threads).

### Operator sequence

1. **Sign in as a member** using the normal site login flow (same as Fan Club / member areas).
2. **Open an admin URL**, for example `/admin` or `/admin/moderation`.
3. **Session check:** If you are not signed in or your account is not an admin, you are redirected to the homepage. Sign in with an admin account and try again.
4. **Enter the admin API token:** On the admin dashboard (or any page showing the token panel), paste the admin API token and click **Save token**. The browser stores it in `localStorage` for this site origin.
5. **Use admin tools:** Navigate via admin nav or dashboard cards. Lists, saves, exports, and publishes call `/api/admin/**` with your saved token.
6. **If data does not load:** Confirm the token is saved, matches the environment’s `ADMIN_TOKEN`, and that you are on the correct preview or production URL. API errors surface in page status text (for example *"Error: Unauthorized."*).
7. **Sign out / clear token:** Clear the token field and save to remove `localStorage` entry when finished on a shared machine.

### Operator expectations

| Situation | Expected behavior |
| --- | --- |
| Not signed in → visit `/admin` | Redirect to `/` |
| Signed in as member (non-admin) → visit `/admin` | Redirect to `/` |
| Signed in as admin, no API token saved | Admin UI visible; API-backed panels empty or show unauthorized errors |
| Signed in as admin, valid token saved | Full read/write per page capabilities |
| API called without token | `401 Unauthorized` JSON response |

---

## Security boundary

| Capability | UI session gate | API token gate |
| --- | --- | --- |
| View admin page chrome and navigation | Required | Not required |
| Load D1-backed lists, stats, exports | Required (to reach UI) | Required (for data) |
| CMS / content / editorial publish | Required | Required |
| Moderation approve/deny/archive | Required | Required |
| Join requests, worklist, member ops config | Required | Required |
| Public member/Fan Club routes | Not applicable | Not applicable |

**Protected by API gate (hard boundary):** database reads of sensitive data, all privileged writes, CSV exports, configuration changes.

**Not a substitute for API security:** UI session gate alone does not prevent direct API calls; `requireAdmin` is the enforcement point for mutations and sensitive reads.

---

## D1 diagnostic tool

**Route:** `/admin/d1-test`

**Purpose:** Browser tool for D1 table inspection (counts, schemas, sample rows).

**Access:**

| Layer | `/admin/d1-test` behavior |
| --- | --- |
| Session UI gate | Same as other `/admin/**` routes (`layout.tsx` + `useMemberSession`) |
| API token | Page-local password input in `d1-test/page.tsx`; reads/writes `sessionStorage` key `lgfc_admin_token` — **not** `AdminTokenPanel` / `localStorage` |
| API call | `/api/admin/d1-inspect` with `x-admin-token` from the page-local value |

Operators must enter the admin API token **on the D1 test page itself** even if they already saved a token on the dashboard panel. This is a known storage split documented as a follow-up gap below.

---

## Configuration

### Cloudflare Pages environment variables

1. Cloudflare Dashboard → Pages → project → Settings → Environment Variables
2. Add `ADMIN_TOKEN` for Production (and Preview when testing admin APIs)
3. Redeploy after changes

### Local development

Create a gitignored `.env.local` with `ADMIN_TOKEN=your-local-dev-token-here`, then start the local Cloudflare Pages dev server (`npm run dev:cf` per `package.json`).

### Verification signals

| Check | Expected result |
| --- | --- |
| `GET /api/admin/stats` without `x-admin-token` | `401 Unauthorized` JSON |
| `GET /api/admin/stats` with valid `x-admin-token` | `200` with stats payload |
| Browser: sign in as admin → open `/admin/d1-test` → enter token on that page | D1 table list loads |

Operator how-to with full click-path detail may move to `docs/how-to/website/` in Task 013.

---

## Security considerations

### Threat model

- Admin UI static assets may be discoverable; session gate reduces casual access.
- All sensitive operations must fail without a valid `ADMIN_TOKEN`.
- Tokens in `localStorage` persist per browser origin; operators should clear tokens on shared devices.

### Best practices

1. Generate strong tokens (`openssl rand -hex 32` or equivalent)
2. Rotate `ADMIN_TOKEN` periodically; update operator copies
3. Limit token distribution to authorized operators
4. Review Cloudflare request logs for repeated `401`/`503` on `/api/admin/**`
5. Never commit tokens or store them in repository files

---

## Historical context

### ZIP 41 (PR `#457`)

Early post–ZIP 41 documentation described admin UI pages as browser-reachable without a session gate, with `sessionStorage` token UX and API-only security. That matched an interim static-export compromise.

### Current as-built (2026-06)

Admin UI now uses **session-backed layout gating** via `useMemberSession({ requireAdmin: true })` plus **`localStorage` admin token** (`adminClient.ts`) for most API calls. `/admin/d1-test` still uses page-local `sessionStorage` token UX. Documentation here supersedes ZIP 41–era claims of "publicly accessible" admin pages and universal `sessionStorage` token storage.

---

## Follow-up gaps (explicit; no code in Task 002)

| Gap | Notes | Suggested route |
| --- | --- | --- |
| Dedicated operator how-to under `docs/how-to/website/` | Task 002 captures workflow in this spec; a standalone how-to may help non-technical operators | Task 013 runbooks |
| D1 test `sessionStorage` vs dashboard `localStorage` | Operators must re-enter token on `/admin/d1-test`; not unified with `AdminTokenPanel` | Task 004 admin shell hardening |
| `footer-quotes` admin API without admin UI | Token-only config surface | Task 004 (deferred UI) |
| Role/session hardening beyond `ADMIN_TOKEN` | OAuth, MFA, server-side UI gate | Future auth program; not `#1258` Task 002 |
| PMO `production-ready` dependency-map fields | Plan promotion gate | Atlas/Bill before child issue creation |

---

## Future enhancements

Phase 6+ may add layered role verification on APIs, stronger server-side UI enforcement, and audit logging. Until then, operators and agents should treat **session UI gate + `ADMIN_TOKEN` API gate** as the canonical model.

---

## References

- Task 001 inventory: `docs/ops/reports/website-operations-admin-as-built-gap-analysis.md`
- Implementation plan: `docs/ops/implementation-plans/website-operations-admin.md`
- Auth library: `functions/_lib/auth.ts`
- Session API: `functions/api/session/me.ts`
- Admin layout: `src/app/admin/layout.tsx`
- Admin client: `src/lib/adminClient.ts`
- Token panel: `src/components/admin/AdminTokenPanel.tsx`
- Admin pages: `src/app/admin/**`
- Admin APIs: `functions/api/admin/**`
