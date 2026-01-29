# LGFC Admin Access Model — ZIP 41 As-Built

**Version:** 2026-01-28  
**Status:** Active (Post ZIP 41 / PR #457)

---

## Overview

This document describes the **as-built** admin access model implemented in ZIP 41 (PR #457), which unblocked admin UI access while maintaining API security through token-based authentication.

## Architecture Summary

The admin access model follows a **two-tier approach**:

1. **Admin UI Pages** (`/admin/**`): Browser-reachable, client-side rendered pages
2. **Admin API Endpoints** (`/api/admin/**`): Token-gated server-side functions

This separation allows:
- **Frontend development** without requiring production secrets
- **API security** through environment-variable-based token authentication
- **Flexible deployment** with static UI and secure runtime APIs

---

## Admin UI Pages

### Routes

All admin UI routes are under `/admin/**`:

- **`/admin`** — Main admin dashboard (CMS, content management, stats)
- **`/admin/d1-test`** — D1 database diagnostic tool
- **`/admin/cms`** — CMS content management interface
- **`/admin/content`** — Page content editor

### Access Model

**Browser-Reachable:** Admin UI pages are **publicly accessible** via direct browser navigation.

**Client-Side:** All admin UI pages are Next.js client components (`'use client'`) that run in the browser.

**Token Management:**
- Admin pages use `sessionStorage` to store an admin token (`lgfc_admin_token`)
- Pages prompt for token input if not present
- Token is sent as `x-admin-token` header in API requests

**No Server-Side Gate:** Admin UI routes do **not** have server-side authentication. Access control is enforced at the API layer.

### Purpose

The admin UI serves as:
- **Diagnostic tools** for D1 database inspection
- **CMS interfaces** for content management
- **Analytics dashboards** for member/join stats
- **Configuration panels** for dynamic content (quotes, welcome email, worklist)

---

## Admin API Endpoints

### Routes

All admin API endpoints are under `/api/admin/**`:

- **`/api/admin/stats`** — Database row counts
- **`/api/admin/export`** — Data export (CSV)
- **`/api/admin/d1-inspect`** — D1 table inspection
- **`/api/admin/worklist`** — Team task management
- **`/api/admin/footer-quotes`** — Footer quote rotation
- **`/api/admin/membership-card`** — Membership card content
- **`/api/admin/welcome-email`** — Welcome email template
- **`/api/admin/cms/**` — CMS content operations
- **`/api/admin/content/**` — Page content operations

### Access Model

**Token-Gated:** All `/api/admin/**` endpoints require the `ADMIN_TOKEN` environment variable.

**Authentication Check:**
```typescript
import { requireAdmin } from "../../_lib/auth";

export const onRequestGet = async (context: any): Promise<Response> => {
  const { request, env } = context;
  
  const deny = requireAdmin(request, env);
  if (deny) return deny;  // Returns 403 if token invalid
  
  // Proceed with admin operation
};
```

**Token Verification:**
- Client sends token via `x-admin-token` request header
- Server compares against `env.ADMIN_TOKEN`
- Missing or mismatched token → `403 Forbidden`

**Environment Variable:**
- **Variable Name:** `ADMIN_TOKEN`
- **Set in:** Cloudflare Pages project settings (Environment Variables)
- **NOT in repository** — never committed to git
- **Format:** Any secure string (recommended: 32+ character random token)

### Security Boundary

The API layer is the **hard security boundary**:

✅ **Protected:**
- Database writes (CMS, content, worklist)
- Database reads of sensitive data (join requests, members)
- Data exports (CSV dumps)
- Configuration changes (quotes, email templates)

❌ **Not Protected:**
- Admin UI page access (browser-reachable)
- D1 test page UI (browser-reachable)
- Public API endpoints (`/api/join`, `/api/login`, etc.)

---

## D1 Diagnostic Tool

### Route

**`/admin/d1-test`**

### Purpose

Browser-based diagnostic tool for D1 database inspection:
- List all tables with row counts
- View table schemas (column names, types)
- Query table contents (SELECT * with row limit)
- Verify D1 binding configuration
- Troubleshoot migration/seeding issues

### Access Model

**Page Access:** Browser-reachable (no gate)

**API Access:** Uses `/api/admin/d1-inspect` (token-gated)

**Token Flow:**
1. User navigates to `/admin/d1-test`
2. Page prompts for admin token (stored in `sessionStorage`)
3. User enters token
4. Page calls `/api/admin/d1-inspect` with token header
5. API validates token and returns D1 data

### Use Cases

- **Development:** Verify local D1 setup and migrations
- **Deployment:** Confirm production D1 binding is configured
- **Troubleshooting:** Inspect table schemas and row counts
- **Seeding Verification:** Check if `d1-seed-all.sh` populated tables correctly

---

## Configuration

### Cloudflare Pages Environment Variables

**Production Environment:**

1. Go to Cloudflare Dashboard → Pages → Project → Settings → Environment Variables
2. Add variable:
   - **Name:** `ADMIN_TOKEN`
   - **Value:** (secure random token, 32+ characters)
   - **Scope:** Production (and Preview if testing admin features)
3. Save and redeploy

**Local Development:**

Create `.env.local` (gitignored):
```
ADMIN_TOKEN=your-local-dev-token-here
```

Run local dev server:
```bash
npm run dev:cf
```

Wrangler loads `.env.local` automatically for local Pages Functions.

### Verification

**Check Token is Required:**
```bash
# Should return 403 Forbidden
curl -X GET https://your-site.pages.dev/api/admin/stats

# Should return 200 OK with data
curl -X GET https://your-site.pages.dev/api/admin/stats \
  -H "x-admin-token: YOUR_ADMIN_TOKEN"
```

**Test D1 Diagnostic Tool:**
1. Navigate to `/admin/d1-test`
2. Enter admin token when prompted
3. Click "Load Tables"
4. Verify table list appears

---

## Security Considerations

### What is Protected

✅ **API operations** that modify or read sensitive data  
✅ **Database writes** via admin endpoints  
✅ **Data exports** and reporting  
✅ **Configuration changes** (quotes, email templates, etc.)

### What is NOT Protected

❌ **Admin UI pages** — Publicly accessible HTML/JS  
❌ **Admin page source code** — Visible in static export  
❌ **Client-side logic** — Runs in browser (no secrets)

### Threat Model

**Assumption:** Admin UI pages may be discovered by external users.

**Mitigation:** All sensitive operations gated at API layer with `ADMIN_TOKEN`.

**Risk:** Unauthorized users can:
- View admin UI page structure
- See client-side code and component organization
- Attempt API calls (which will fail without token)

**Acceptable because:**
- No sensitive data exposed in UI pages (data fetched via API)
- Token-gated APIs prevent unauthorized operations
- Admin UI is intended for internal use; discovery is not a security breach

### Best Practices

1. **Use strong tokens:** Generate `ADMIN_TOKEN` with `openssl rand -hex 32` or similar
2. **Rotate tokens:** Change `ADMIN_TOKEN` periodically
3. **Limit distribution:** Share token only with authorized admins
4. **Monitor API logs:** Review Cloudflare logs for unauthorized API attempts
5. **Never commit tokens:** Ensure `.env.local` and secrets are in `.gitignore`

---

## Migration from Prior Model

### Before ZIP 41

Admin pages were **blocked** with an HTML gate (token prompt before page load).

**Issues:**
- Static Next.js export could not server-render token checks
- HTML gate was client-side only (easily bypassed)
- Development friction (needed production-like setup for UI work)

### After ZIP 41 (Current)

Admin pages are **open** for UI access, APIs are token-gated.

**Benefits:**
- UI can be developed and previewed without secrets
- Security enforcement is at the correct layer (API)
- Diagnostic tools (D1 test) usable in local development
- Clear separation of concerns (UI vs. API security)

---

## Future Enhancements

**Phase 6+:** Supabase-based admin authentication

When Supabase auth is integrated:
- **Admin UI pages** will check Supabase session + role
- **Admin APIs** may add Supabase JWT validation (in addition to or replacing `ADMIN_TOKEN`)
- **D1 diagnostic tool** will require Supabase admin role
- **Migration path:** Token-based auth remains as fallback or backup access method

See `/docs/admin/dashboard.md` for full admin feature roadmap.

---

## References

- **PR #457:** ZIP 41 implementation (infra: unblock /admin UI and add D1 test page)
- **Auth Library:** `functions/_lib/auth.ts` (requireAdmin function)
- **Admin Pages:** `src/app/admin/**`
- **Admin APIs:** `functions/api/admin/**`
- **D1 Test Tool:** `src/app/admin/d1-test/page.tsx`
- **Environment Setup:** `/docs/START_HERE.md`
- **D1 Configuration:** `/docs/website-process.md` (D1 Database Binding Requirements)
