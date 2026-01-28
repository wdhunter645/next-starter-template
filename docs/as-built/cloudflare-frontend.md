# Cloudflare Frontend - As-Built Documentation

**Last Updated:** 2026-01-20  
**Status:** Active Development

## Overview

This document serves as the authoritative baseline for the Cloudflare Pages-hosted public frontend and member area of the LGFC website.

## Member Home Page Implementation

### Route Structure
- **Primary Route:** `/member` (main member home page)
- **Alias Route:** `/memberpage` (redirects to `/member`)
- **Sub-routes:**
  - `/member/profile` (member profile/settings)
  - `/member/card` (membership card display)

### Implementation Status

✅ **IMPLEMENTED** per `/docs/memberpage.html` specification (v1)

### Source of Truth
- Canonical Specification: `/docs/memberpage.html`
- Versioned Specification: `/docs/memberpage-v1.html`
- Navigation Rules: `/docs/NAVIGATION-INVARIANTS.md`
- Process Guidelines: `/docs/website-process.md`

### Architecture

#### Layout (`src/app/member/layout.tsx`)
Member area uses a dedicated layout with:
- **Header:**
  - Logo (links to `/memberpage`)
  - Logout button (visible when authenticated)
  - Hamburger menu with: Home, About, Contact, Support, Store, Members, Admin (conditional)
- **Navigation:**
  - Home → `/` (public homepage)
  - Members → `/memberpage` (member home)
  - Admin → `/admin` (conditional, only for admins)
- **Authentication:**
  - Reads member email from localStorage (`lgfc_member_email`)
  - Checks admin role via `/api/member/role` endpoint
  - Shows/hides Admin menu item based on role

#### Page Sections (`src/app/member/page.tsx`)

Sections are rendered in **exact spec order**:

1. **Header** (via layout.tsx)
   - Member-specific navigation
   - Logout functionality
   - Conditional admin access

2. **Welcome Section** (`WelcomeSection.tsx`)
   - Personalized greeting using email-based display name
   - Profile link to `/member/profile`
   - 30-day events summary
   - **D1 Connectivity:** Fetches events from `events` table for current and next month, filters to 30-day window

3. **Post Creation / Work Area** (`PostCreation.tsx`)
   - "Share with the Club" text area
   - Post visibility notice (members-only)
   - Submit button
   - **D1 Connectivity:** POSTs to `/api/discussions/create` endpoint
   - **Future Enhancement:** Photo/video attachments (noted in UI)

4. **Member Discussion Feed** (`DiscussionFeed.tsx`)
   - Reverse chronological feed of member posts
   - Shows: author name, timestamp, title, body
   - **D1 Connectivity:** Fetches from `discussions` table (status='posted', limit 20)
   - **Future Enhancements:** Replies, reactions (like/dislike), report buttons (UI placeholders present)

5. **Archives Tiles** (`ArchivesTiles.tsx`)
   - Three clickable tiles in responsive grid:
     1. **Memorabilia Archive** → `/memorabilia`
     2. **Photo Gallery** → `/photos`
     3. **Library** → `/library`
   - Hover effects for visual feedback

6. **Gehrig Timeline** (`GehrigTimeline.tsx`)
   - Member-focused timeline with 8 major life events
   - Events: Birth (1903), Yankees Debut (1923), The Streak Begins (1925), Murderers' Row (1927), Triple Crown (1934), Farewell Speech (1939), Passing (1941), MLB's Greatest First Baseman (1969)
   - Visual timeline with vertical line and event markers

7. **Admin Dashboard Link** (`AdminLink.tsx`)
   - **Conditional:** Only visible to admin users
   - "Admin Tools" section with dashboard link
   - **Authorization:** Uses role check from `/api/member/role`

### Components

All member-specific components are in `src/components/member/`:

- `WelcomeSection.tsx` - Welcome message and upcoming events
- `PostCreation.tsx` - Post creation form
- `DiscussionFeed.tsx` - Display member discussions
- `ArchivesTiles.tsx` - Archive navigation tiles
- `GehrigTimeline.tsx` - Lou Gehrig timeline
- `AdminLink.tsx` - Conditional admin dashboard link

### D1 Database Integration

#### Tables Used
- **discussions:** Member posts (title, body, author_email, status, created_at)
- **events:** Calendar events (title, start_date, end_date, location, status)
- **members:** User roles (email, role: 'member'|'admin')

#### API Endpoints
- `GET /api/discussions/list` - Fetch posted discussions (limit 1-20)
- `POST /api/discussions/create` - Create new discussion post
- `GET /api/events/month` - Fetch events by month (YYYY-MM format)
- `GET /api/member/role` - Check user role by email

### Authentication & Authorization

#### Member Authentication
- Email-based authentication via localStorage (`lgfc_member_email`)
- Not authenticated → Shows login prompt, redirects to `/login`
- No server-side session management (client-side state only)

#### Admin Authorization
- Admin check via `members` table lookup (role='admin')
- Admin-specific UI elements:
  - "Admin" item in hamburger menu
  - "Admin Tools" section at bottom of member home
- Admin dashboard at `/admin` (separate route)

### Future Enhancements (Noted in Code)

**Post Creation:**
- Photo/video attachments (B2-backed media)

**Discussion Feed:**
- Nested replies/threading
- Reactions (like, dislike)
- Report functionality with moderation queue
- Full social features per spec

**Profile Page:**
- Edit name, email, screen_name
- Contributions summary
- Email change with magic-link verification

### Navigation Behavior

Per `/docs/NAVIGATION-INVARIANTS.md`:

**Member Area Logo:**
- Always links to `/memberpage` (not public homepage)
- Provides clear "home" for member context

**Hamburger Menu:**
- Contains **only standalone pages** (no sections, no footer links)
- Visitor hamburger items: Home (mobile only), About, Contact, Support, Store
- Member hamburger adds: Members (current location indicator), Admin (conditional)
- Desktop/tablet: Does not include "Home"
- Mobile: Includes "Home" for easy navigation

**Footer:**
- Privacy, Terms, Admin links (footer-only, not in hamburger)

### Styling

- Uses global CSS variables (e.g., `var(--lgfc-blue)` for brand color)
- No Tailwind, no CSS-in-JS frameworks
- Inline styles for component-specific layout
- Responsive grid for Archives Tiles (auto-fit, minmax 250px)

### Testing Requirements

Per `/docs/website.md` and `/docs/website-process.md`:

- **Build Validation:** `npm run build:cf` must pass
- **Lint:** `npm run lint` (warnings acceptable, no errors)
- **Assessment:** `npm run assess` validates route structure and page markers
- **Manual Testing:**
  - Navigate to `/member` without login → Redirected to login prompt
  - Navigate to `/member` with login → All sections visible
  - Post creation → Submits to D1 and refreshes feed
  - Events display → Shows next 30 days from D1
  - Admin user → Sees Admin menu item and Admin Tools section
  - Non-admin → Does not see admin-specific elements

### Deployment Notes

- Static export via Next.js (`npm run build`)
- Output to `out/` directory
- Cloudflare Pages deployment
- `_routes.json` copied to `out/` for Cloudflare Functions routing
- Functions in `functions/` directory are deployed alongside static assets

### Admin Access Model (ZIP 41)

**Admin UI Pages** (`/admin`, `/admin/d1-test`, `/admin/cms`, `/admin/content`):
- Browser-reachable static pages
- Client-side rendered (`'use client'` Next.js components)
- No server-side access gate
- Used for diagnostics, CMS, content management

**Admin API Endpoints** (`/api/admin/**`):
- Token-gated via `ADMIN_TOKEN` environment variable
- All admin operations require `x-admin-token` header
- Enforces security boundary at API layer

**D1 Diagnostic Tool** (`/admin/d1-test`):
- Browser-based D1 database inspector
- Lists tables, schemas, row counts
- Queries table contents with pagination
- Calls `/api/admin/d1-inspect` (token-gated)

See `/docs/admin/access-model.md` for complete admin architecture documentation.

### Change History

**2026-01-28:** ZIP 41 (PR #457) - Admin Access Model
- Added admin UI pages: `/admin`, `/admin/d1-test`, `/admin/cms`, `/admin/content`
- Admin pages are browser-reachable (no server-side gate)
- Admin API endpoints token-gated via `ADMIN_TOKEN`
- D1 diagnostic tool for database inspection
- See `/docs/admin/access-model.md` for details

**2026-01-20:** Initial implementation of Member Home per `docs/memberpage.html` v1 spec
- Implemented all 7 required sections in correct order
- Created member area layout with proper header/navigation
- Added D1 connectivity for discussions, events
- Created post creation endpoint
- Added admin role checking and conditional UI
- Build validated, linter passed (warnings only)
