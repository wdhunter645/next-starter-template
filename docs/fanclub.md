# FanClub / Member Content — Authentication Requirements

**Status:** AUTHORITATIVE  
**Effective Date:** 2026-01-24

This document defines authentication and access control requirements for FanClub (member-only) content pages.

---

## Overview

FanClub content pages are **member-only** and require authentication. Unauthenticated users must be redirected to the visitor home page (`/`).

---

## Authentication Model

- **Auth State:** Client-side via `localStorage` key `lgfc_member_email`
- **When Present:** User is considered authenticated (logged in member)
- **When Absent:** User is unauthenticated (visitor)

---

## Member-Only Routes

The following routes enforce authentication and redirect unauthenticated users to `/`:

### Top-Level Member Content Pages
- `/photo` — Single photo viewer
- `/photos` — Photo gallery
- `/library` — Gehrig library submissions
- `/memorabilia` — Memorabilia archive
- `/ask` — Ask a question
- `/news` — Member news

### Member-Specific Pages (under `/member/**`)
- `/member` — Member home
- `/member/profile` — Member profile
- `/member/card` — Membership card
- All other `/member/**` routes

---

## Authentication Enforcement Behavior

### Unauthenticated User Access Attempt
When an unauthenticated user (no `lgfc_member_email` in localStorage) attempts to access a member-only route:

1. **Redirect immediately** to `/` (visitor home)
2. **No content rendering** before redirect
3. **Client-side check** runs on page load

### Implementation Pattern

All member-only pages MUST include this auth check pattern:

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function MemberOnlyPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const email = window.localStorage.getItem('lgfc_member_email');
    if (!email) {
      window.location.href = '/';
      return;
    }
    setIsAuthenticated(true);
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return null; // or loading indicator
  }

  if (!isAuthenticated) {
    return null;
  }

  // Actual page content here
  return (
    <main>
      {/* Member content */}
    </main>
  );
}
```

---

## Routes WITHOUT Auth Enforcement

Public routes (no authentication required):

- `/` — Visitor home
- `/about` — About page
- `/contact` — Contact page
- `/support` — Support (mailto link)
- `/join` — Join/registration page
- `/login` — Login page
- `/logout` — Logout page
- `/weekly` — Weekly matchup
- `/milestones` — Milestones timeline
- `/charities` — Charities/Friends of the Club
- `/calendar` — Events calendar
- `/faq` — Frequently asked questions
- `/terms` — Terms of service
- `/privacy` — Privacy policy
- `/search` — Search (if implemented)
- `/admin/**` — Admin routes (separate auth check for admin role)

---

## Admin Routes

Admin routes (`/admin/**`) have **separate access control**:
1. Check member login state
2. Check admin role via `/api/member/role?email=...`
3. Display appropriate message if not admin

Admin auth is **independent** of FanClub member auth (admins must also be logged-in members).

---

## Header Behavior

### Visitor Header (Logged Out)
- Join, Search, Store, Login buttons visible

### Visitor Header (Logged In)
- Join, Search, Store, Members, Logout buttons visible
- "Members" button links to `/member`

### Member Header
- Member Home, Search, Store, Logout buttons visible

---

## Compliance Verification

### Manual Verification
1. Clear `localStorage` (simulate logged-out user)
2. Navigate to each member-only route
3. Verify immediate redirect to `/`
4. No member content should flash/render before redirect

### Automated Verification
- E2E tests should verify redirect behavior
- Tests should check both authenticated and unauthenticated states

---

## No Exceptions

**There are NO exceptions to FanClub auth enforcement.**

Every route listed under "Member-Only Routes" MUST enforce authentication.

---

## References

- `/docs/NAVIGATION-INVARIANTS.md` — Navigation structure
- `/docs/LGFC-Production-Design-and-Standards.md` — Design standards
- `/context.md` — Auth model overview
- `/docs/website-process.md` — Header state rules
