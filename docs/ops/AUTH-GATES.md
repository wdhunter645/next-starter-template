# Authentication Gates

This document describes the authentication and authorization system for protected routes.

## Overview

The site has two levels of access control:
1. **Member-only pages** - Require user authentication
2. **Admin-only pages** - Require authentication + admin role

## Protected Routes

### Member Area (`/member`)
- **Access**: Authenticated users only
- **Location**: `src/app/member/page.tsx`
- **Guard**: Checks for valid session via `getSession()`
- **Behavior**: Shows "Authentication Required" message if not signed in

### Admin Area (`/admin`)
- **Access**: Authenticated admin users only
- **Location**: `src/app/admin/page.tsx`
- **Guards**: 
  1. Checks for valid session via `getSession()`
  2. Checks email against ADMIN_EMAILS via `isUserAdmin()`
- **Behavior**: 
  - Not signed in → "Authentication Required"
  - Signed in but not admin → "Access Denied"
  - Admin user → Dashboard access

## Auth Libraries

### Session Management (`src/lib/auth/session.ts`)
Handles user session checking.

**Functions:**
```typescript
getSession(): Promise<Session>
// Returns current user session or { user: null }

isAuthenticated(): Promise<boolean>
// Check if user has valid session

getUserEmail(): Promise<string | null>
// Get current user's email
```

**Current Status:** Placeholder implementation
- Returns `{ user: null }` (no session)
- TODO: Implement real session management with cookies/database

### Admin Guard (`src/lib/auth/adminGuard.ts`)
Server-side helper for admin authorization. **Never use on client side.**

**Functions:**
```typescript
isUserAdmin(email: string | null): boolean
// Check if email is in ADMIN_EMAILS list

getAdminEmails(): string[]
// Get list of admin emails from environment

hasAdminConfig(): boolean
// Check if ADMIN_EMAILS is configured
```

**How it works:**
1. Reads `ADMIN_EMAILS` environment variable
2. Splits by comma, trims whitespace
3. Compares user email (case-insensitive)

## Environment Configuration

### Required Environment Variables

```bash
# Admin emails (comma-separated)
ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

Add to `.env.local` or configure in hosting platform (Cloudflare Pages, etc.).

## Acceptance Checks

### Testing Member Area
1. **Without session**: Visit `/member`
   - ✅ Should show "Authentication Required" message
   - ✅ Should NOT show member content

2. **With session**: (Once auth implemented)
   - ✅ Should show member content
   - ✅ Should display user email
   - ✅ Should show sign out option

### Testing Admin Area
1. **Without session**: Visit `/admin`
   - ✅ Should show "Authentication Required" message
   - ✅ Should NOT show admin dashboard

2. **With session (non-admin)**: (Once auth implemented)
   - ✅ Should show "Access Denied" message
   - ✅ Should NOT show admin dashboard

3. **With session (admin user)**:
   - ✅ Email must be in ADMIN_EMAILS
   - ✅ Should show admin dashboard
   - ✅ Should display admin email

### Environment Variable Check
```bash
# Verify ADMIN_EMAILS is set
echo $ADMIN_EMAILS

# Test admin guard logic (example in Node.js)
node -e "console.log(process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()))"
```

## Implementation Status

### ✅ Completed
- [x] Auth guard helper functions
- [x] Session interface and placeholder
- [x] Member page with session requirement
- [x] Admin page with session + admin check
- [x] Documentation

### 🚧 TODO: Real Authentication
- [ ] Implement session storage (cookies, database)
- [ ] Add login/logout pages
- [ ] Integrate with OAuth callback handler
- [ ] Add CSRF protection
- [ ] Session expiration and renewal
- [ ] Sign out functionality
- [ ] Redirect to login instead of showing messages

## Security Notes

1. **Server-side only**: Auth checks happen server-side (Next.js Server Components)
2. **No service role**: Does not use Supabase service role or privileged keys
3. **Environment separation**: Admin emails in environment, not in code
4. **Case-insensitive**: Email comparison is case-insensitive
5. **Graceful degradation**: Shows clear messages instead of crashing

## Future Enhancements

Consider adding:
- Role-based access control (RBAC) beyond admin/member
- Permission levels within admin role
- Session management UI for admins
- Audit logging for admin actions
- Two-factor authentication
- Rate limiting on auth endpoints

## Rollback

To revert auth gates:
```bash
git checkout HEAD -- src/app/member/page.tsx
git checkout HEAD -- src/app/admin/page.tsx
rm -rf src/lib/auth/
```

Pages will return to simple placeholder state.
