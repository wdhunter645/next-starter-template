---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: Routes, navigation invariants, UI/UX contracts, page content contracts
Does Not Own: How-to procedures; operational runbooks; governance policies
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-02-20
---

# Login Page Specification — LGFC-Lite

## Purpose

The `/login` page in **LGFC-Lite** provides a **local member session** mechanism for accessing member features.

**Authentication Implementation:** The login page validates member email addresses and establishes local browser sessions using `localStorage`. This is a lightweight, single-path approach suitable for LGFC-Lite's current phase requirements.

The login page serves to:
1. Validate that a visitor's email exists in the join_requests database
2. Create a local member session by storing the email in `localStorage`
3. Redirect authenticated members to the member area
4. Direct new visitors to the Join flow

## Cross-Reference to Authoritative Documentation

**This specification aligns with:**
- `/docs/LGFC-Production-Design-and-Standards.md` — See "LOGIN / LOGOUT — Final Lock" section for the authoritative phase definition and deferred behavior specification.

The authoritative doc clearly separates:
- **LGFC-Lite (Current)**: Login is an informational stub; authentication is intentionally disabled.
- **Future: Auth Phase Lock (Deferred)**: Full authentication behavior (session-based gating, member role enforcement, logout flows, etc.) will be implemented in a future phase with Vercel/Supabase or equivalent backend.

## Implementation Status

### Current Phase: LGFC-Lite (Cloudflare Pages + Local Sessions)
- **Authentication**: ✅ IMPLEMENTED (local session via localStorage)
- **Login page**: ✅ Operational with email validation
- **Backend dependencies**: ✅ Cloudflare D1 (via `/api/login` function)
- **Session mechanism**: ✅ localStorage-based (lgfc_member_email)

## How Login Works

The `/login` page implements a simple email-based validation flow:

1. **User enters email address**
2. **POST to `/api/login`** (proxied to Cloudflare Function)
   - Validates email exists in `join_requests` table
   - Rate limits failed attempts (3 per IP per hour)
3. **On success:**
   - Stores `lgfc_member_email` in `localStorage`
   - Redirects to `/fanclub`
4. **On failure:**
   - Shows error message
   - Provides link to `/join` for new members

## What the Login Page Shows

The `/login` page displays:

1. **Page title**: "Member Login"
2. **Email input field** with validation
3. **Submit button** ("Login")
4. **Error messaging** for:
   - Email not found → directs to `/join`
   - Rate limit exceeded → wait 1 hour
   - Server errors
5. **Secondary CTA**: "Back to Home" → routes to `/`

## Session Management

### Local Session (lgfc_member_email)
- **Storage**: `localStorage.setItem('lgfc_member_email', email)`
- **Duration**: Persists until cleared by user
- **Scope**: Browser-specific, not cross-device
- **Security**: NOT cryptographically secure; suitable for LGFC-Lite only

### Member Area Access
The `/fanclub` page checks for the presence of `lgfc_member_email`:
```typescript
const memberEmail = window.localStorage.getItem('lgfc_member_email');
if (!memberEmail) {
  // Show "not signed in" prompt with link to /login
}
```

## What This Is (and What It Isn't)

### ✅ What This IS
- Email-based membership validation
- Local browser session for member access
- Lightweight, single-path authentication for LGFC-Lite
- Protection against rapid-fire login attempts

### ❌ What This IS NOT
- Cryptographically secure authentication
- Password-based login
- Multi-factor authentication
- OAuth/social login
- Server-side session management
- Cross-device session sync
- Enterprise-grade authorization

## Technical Implementation

### File Location
- **Path**: `/src/app/login/page.tsx`
- **Route**: `/login`

### Page Type
- **Next.js App Router**: Client Component (`'use client'`)
- **Client-side state**: Email input, error messages, loading state
- **Navigation**: Uses `useRouter` from `next/navigation`

### API Integration
- **Endpoint**: `POST /api/login`
- **Proxy Route**: `src/app/api/login/route.ts` (for local dev)
- **Upstream Function**: `functions/api/login.ts` (Cloudflare Pages Function)

### Styling Approach
- **Inline styles**: Consistent with other pages
- **CSS variables**: Use `var(--lgfc-blue)` for brand color
- **Responsive**: Mobile-friendly layout

## Routing Requirements

### Public Accessibility
- **`/login` route**: ✅ Publicly accessible
- **No middleware**: ❌ No authentication middleware required
- **No pre-redirects**: ❌ No redirects based on existing session state

### Navigation Flow
- **From header "Login" button**: Routes to `/login`
- **From `/login` on success**: Redirects to `/fanclub`
- **From `/login` "Join" link**: Routes to `/join` (shown on error)
- **From `/login` "Home" button**: Routes to `/`

## Future Phase: Enhanced Authentication

Enhanced authentication may be introduced in a **future phase** (outside LGFC-Lite scope).

**Deferred Auth Phase Details:**
- Full specification of authentication behavior (session-based gating, member role enforcement, logout behavior) is documented in `/docs/LGFC-Production-Design-and-Standards.md` under "Future: Auth Phase Lock (Deferred Behavior)".

When that phase begins:
- Technology stack will be determined (Supabase, Auth0, custom, etc.)
- Full authentication specification will be written
- Login page will be re-implemented with real functionality
- This document will be updated to reflect the new implementation

### Phase Boundary
When transitioning to enhanced authentication:
- Local session mechanism may be replaced or supplemented
- Login page will be updated with new authentication UI
- Migration path for existing members will be provided
- This document will be updated to reflect new implementation

See `/docs/design/phases.md` for phase definitions and boundaries.

## Related Documentation

- **Phase Definitions**: `/docs/design/phases.md` — LGFC-Lite capabilities
- **Join Flow**: `/docs/design/join.md` — Member join/signup process
- **Member Page**: `/docs/memberpage.html` — Member area specification
- **Navigation Invariants**: `/docs/NAVIGATION-INVARIANTS.md` — Header structure
- **Website Process**: `/docs/governance/PR_GOVERNANCE.md` — Development standards

## Verification Checklist

Before accepting any changes to the login page:

- [x] Page displays email input field
- [x] Page validates email via POST /api/login
- [x] On success: sets lgfc_member_email in localStorage
- [x] On success: redirects to /fanclub
- [x] On failure: shows error message
- [x] Email not found error provides link to /join
- [x] NO password fields present
- [x] Client component with 'use client' directive
- [x] Page builds successfully with `npm run build:cf`
- [x] `/login` route is publicly accessible
- [x] Styling consistent with site design

## Governance

This specification is **authoritative** for the LGFC-Lite phase.

Any deviation from this spec requires:
1. Explicit discussion and approval
2. Phase boundary verification (Are we still in LGFC-Lite?)
3. Documentation update in this file
4. Update to `/docs/design/phases.md` if phase has changed
