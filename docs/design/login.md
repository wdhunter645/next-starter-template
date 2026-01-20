# Login Page Specification — LGFC-Lite

## Purpose

The `/login` page in **LGFC-Lite** is an **informational stub page only**.

**Authentication is explicitly disabled** in the LGFC-Lite phase. The login page serves to:
1. Inform visitors that member login functionality is not yet live
2. Explain that LGFC-Lite does not support authentication
3. Direct users to the Join flow to express interest in membership

## Implementation Status

### Current Phase: LGFC-Lite (Cloudflare Pages Static Export)
- **Authentication**: ❌ NOT IMPLEMENTED (intentional)
- **Login page**: ✅ Stub/informational page only
- **Backend dependencies**: ✅ ZERO (static page)

## What the Login Page Shows

The `/login` page displays:

1. **Page title**: "Member Login"
2. **Informational message box** clearly stating:
   - Member login is not yet available
   - LGFC-Lite is a public information site
   - Authentication functionality is in development
3. **Call-to-Action buttons**:
   - **Primary CTA**: "Join the Fan Club" → routes to `/member`
   - **Secondary CTA**: "Back to Home" → routes to `/`

## What the Login Page Must NEVER Do

The login page in LGFC-Lite **must NOT** include:

### ❌ Prohibited UI Elements
- Email input fields
- Password input fields
- "Remember me" checkboxes
- "Forgot password" links
- Magic link request forms
- OAuth/social login buttons (Google, Facebook, etc.)
- Any other authentication UI components

### ❌ Prohibited Functionality
- Email validation or submission
- Password validation
- Session token generation
- Cookie management
- API calls to authentication endpoints
- Redirect logic based on authentication state
- LocalStorage/SessionStorage manipulation for auth state

### ❌ Prohibited Dependencies
- Supabase client libraries
- Auth0 or other authentication SDKs
- Session management libraries
- JWT libraries
- OAuth client libraries
- Any backend authentication services

## Hard Rules

### Rule 1: DO NOT Implement Authentication Before Auth Phase
**Authentication functionality is explicitly deferred to a future phase.**

Any PR that introduces authentication-related code, configuration, or dependencies to LGFC-Lite **must be rejected**.

This includes:
- Installing auth packages
- Creating auth API routes
- Adding authentication middleware
- Configuring OAuth providers
- Setting up session management

### Rule 2: DO NOT Introduce Backend Dependencies
The login page **must build and deploy** as a static page with **zero backend dependencies**.

The LGFC-Lite phase uses Next.js static export (`output: "export"`). Any code that requires server-side runtime will break the build.

### Rule 3: Stub Page Must Be Obvious
The login page **must not** give the impression that login functionality is available.

Messages must be:
- Clear and direct
- Explicitly state that login is not available
- Provide actionable next steps (Join flow)

## Technical Implementation

### File Location
- **Path**: `/src/app/login/page.tsx`
- **Route**: `/login`

### Page Type
- **Next.js App Router**: Server Component (default)
- **No client-side state**: No `'use client'` directive needed
- **No interactivity**: Pure informational content + navigation links

### Styling Approach
- **Inline styles**: Consistent with other stub pages
- **CSS variables**: Use `var(--lgfc-blue)` for brand color
- **Responsive**: Mobile-friendly layout

### Example Structure
```tsx
import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main>
      <h1>Member Login</h1>
      
      <div className="info-box">
        <h2>Member Login Is Not Yet Available</h2>
        <p>LGFC-Lite does not support authentication...</p>
      </div>

      <div className="cta-container">
        <Link href="/member">Join the Fan Club</Link>
        <Link href="/">Back to Home</Link>
      </div>
    </main>
  );
}
```

## Routing Requirements

### Public Accessibility
- **`/login` route**: ✅ Must be publicly accessible
- **No middleware**: ❌ Do NOT add authentication middleware
- **No redirects**: ❌ Do NOT redirect based on auth state

### Navigation Flow
- **From header "Login" button**: Routes to `/login`
- **From `/login` "Join" button**: Routes to `/member`
- **From `/login` "Home" button**: Routes to `/`

## Future Phase: Authentication Implementation

Authentication will be introduced in a **future, explicitly-defined phase**.

When that phase begins:
- Technology stack will be determined (Supabase, Auth0, custom, etc.)
- Full authentication specification will be written
- Login page will be re-implemented with real functionality
- This document will be updated to reflect the new implementation

### Phase Boundary
See `/docs/design/phases.md` for the explicit phase definition and authentication timeline.

## Related Documentation

- **Visitor Header**: `/docs/design/visitor-header.md` — Login button behavior
- **Phase Definitions**: `/docs/design/phases.md` — LGFC-Lite vs Auth Phase
- **Navigation Invariants**: `/docs/NAVIGATION-INVARIANTS.md` — Header structure
- **Website Process**: `/docs/website-process.md` — Development standards

## Verification Checklist

Before accepting any changes to the login page:

- [ ] Page displays informational message stating login is not available
- [ ] Page clearly explains LGFC-Lite does not support authentication
- [ ] Primary CTA routes to `/member` (Join flow)
- [ ] Secondary CTA routes to `/` (Home)
- [ ] NO email/password fields present
- [ ] NO authentication logic (API calls, session management, etc.)
- [ ] NO authentication dependencies added to `package.json`
- [ ] Page builds successfully with `npm run build:cf`
- [ ] No middleware or redirects related to authentication
- [ ] `/login` route is publicly accessible

## Governance

This specification is **authoritative** for the LGFC-Lite phase.

Any deviation from this spec requires:
1. Explicit discussion and approval
2. Phase boundary verification (Are we still in LGFC-Lite?)
3. Documentation update in this file
4. Update to `/docs/design/phases.md` if phase has changed
