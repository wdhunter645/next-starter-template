# Authentication Gates

This document describes the authentication and authorization guards used in the application.

## Overview

The application has two levels of protected content:
1. **Member Area** - Requires any authenticated session
2. **Admin Area** - Requires authenticated session + admin email verification

## Implementation Status

**Current State:** Placeholder guards with documentation
- Guards are stubbed for future authentication integration
- `/member` page shows member-only content structure
- `/admin` page shows admin-only content structure
- `lib/auth/adminGuard.ts` provides server-side admin checking

**Future Integration:** When authentication is added (e.g., Supabase Auth, GitHub OAuth):
1. Replace placeholder session checks with real auth provider
2. Extract user email from verified session
3. Guards will work automatically with minimal changes

## Member Area (`/member`)

**Path:** `/member/index.tsx`

**Requirements:**
- Valid authenticated session (any user)

**Current Implementation:**
```typescript
// TODO: Replace with actual auth check
// const session = await getServerSession();
// if (!session) {
//   redirect('/auth/login');
// }
```

**Displays:**
- User email and account info
- Member-only features and benefits
- Sign out button

## Admin Area (`/admin`)

**Path:** `/admin/index.tsx`

**Requirements:**
- Valid authenticated session
- User email must be in `ADMIN_EMAILS` environment variable

**Current Implementation:**
```typescript
// TODO: Replace with actual auth check
// const session = await getServerSession();
// if (!session) {
//   redirect('/auth/login');
// }
// const adminCheck = await checkAdminAccess(session.user.email);
// if (!adminCheck.authorized) {
//   return <div>403 Forbidden</div>;
// }
```

**Displays:**
- Admin email and role
- Admin tools (B2 storage, Supabase status)
- Links to API endpoints
- Security notes

## Admin Guard Helper

**File:** `lib/auth/adminGuard.ts`

### Functions

#### `checkAdminAccess(request: NextRequest)`

Checks if a request has admin access based on:
1. Authentication status
2. Email in ADMIN_EMAILS environment variable

**Returns:**
```typescript
interface AdminCheckResult {
  authorized: boolean;
  status: number;        // 200, 401, 403, or 503
  reason: string;
  userEmail?: string;
}
```

**Status Codes:**
- `200` - Authorized (admin access granted)
- `401` - Not authenticated (no session)
- `403` - Insufficient permissions (not an admin)
- `503` - Configuration issue (ADMIN_EMAILS not set)

### Usage Example

```typescript
import { checkAdminAccess } from '@/lib/auth/adminGuard';

export async function GET(request: NextRequest) {
  const adminCheck = await checkAdminAccess(request);
  if (!adminCheck.authorized) {
    return NextResponse.json(
      { error: adminCheck.reason },
      { status: adminCheck.status }
    );
  }
  
  // Proceed with admin operation
  return NextResponse.json({ message: 'Admin access granted' });
}
```

#### `getAdminEmails()`

Returns the list of admin emails from environment.

**Returns:** `string[]`

## Environment Configuration

### ADMIN_EMAILS

Comma-separated list of admin email addresses.

```bash
ADMIN_EMAILS="admin@example.com,superadmin@example.com"
```

**Security Notes:**
- Always use environment variables, never hardcode emails
- Keep the list minimal (principle of least privilege)
- Use work/organizational emails, not personal emails
- Rotate access when team members change

## Integration Checklist

When adding authentication:

- [ ] Choose auth provider (Supabase, GitHub OAuth, etc.)
- [ ] Update `/member/page.tsx` to check real session
- [ ] Update `/admin/page.tsx` to check real session + admin
- [ ] Update `adminGuard.ts` to extract email from session
- [ ] Add redirect to login for unauthenticated users
- [ ] Test member access with regular user
- [ ] Test admin access with admin email
- [ ] Test admin access with non-admin email (should fail)
- [ ] Document provider-specific setup

## Testing

**Development Testing:**

The admin guard currently accepts a `x-user-email` header for testing:

```bash
curl -H "x-user-email: admin@example.com" \
  http://localhost:3000/api/admin/...
```

**⚠️ Security Warning:** This header-based auth is NOT SECURE and is only for development. Remove before production deployment.

## Rollback Plan

All auth guards are additive and non-breaking:
```bash
git revert <commit-sha>
```

Pages will function without auth (as they did before), just without protection.

## Related Documentation

- [Website Buildout Plan](../../README.md) - Parent planning document
- Admin Guard: `src/lib/auth/adminGuard.ts`
- Member Page: `src/app/member/page.tsx`
- Admin Page: `src/app/admin/page.tsx`
