---
Doc Type: As-Built
Audience: Human + AI
Authority Level: Historical
Owns: Snapshot summary of implemented Cloudflare frontend behaviors at review time
Does Not Own: Canonical design authority or governance policy
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-27
---

# Cloudflare Frontend — As-Built Snapshot

## Overview

This document serves as the authoritative baseline for the Cloudflare Pages-hosted public frontend and member area of the LGFC website.

Canonical auth reference: /docs/reference/design/auth-model.md

## FanClub Home Page Implementation

### Route Structure
- **Primary Route:** `/fanclub` (main member home page)
- **Alias Route:** (none)  — `/member` is not used (FanClub is `/fanclub`)
- **Sub-routes:**
  - `/fanclub/myprofile` (member profile/settings)

### Implementation Status

✅ **IMPLEMENTED** per `docs/reference/design/fanclub.md` specification

### Source of Truth
- Canonical Specification: `docs/reference/design/fanclub.md`
- Canonical Auth: `docs/reference/design/auth-model.md`
- Navigation Rules: `docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Process Guidelines: `docs/governance/PR_GOVERNANCE.md`

### Architecture

#### Layout (`src/appfanclub/layout.tsx`)
FanClub area uses a dedicated layout with:
- **Header:**
  - Logo (links to `/`)
  - Logout button (visible when authenticated)
  - Hamburger menu with: Home, About, Contact, Support, Store, Members, Admin (conditional)
- **Navigation:**
  - Home → `/` (public homepage)
  - Members → `/fanclub` (member home)
  - Admin → `/admin` (conditional, only for admins)
- **Authentication:**
  - Uses cookie-backed session (`lgfc_session`) validated via session API
  - Checks admin role via `members` identity/role resolution
  - Shows/hides Admin menu item based on role

#### Page Sections (`src/appfanclub/page.tsx`)

Sections are rendered in **exact spec order**:

1. **Header** (via layout.tsx)
   - FanClub-specific navigation
   - Logout functionality
   - Conditional admin access

2. **Welcome Section** (`WelcomeSection.tsx`)
   - Personalized greeting using email-based display name
   - Profile link to `/fanclub/myprofile`
   - 30-day events summary
   - **D1 Connectivity:** Fetches events from `events` table for current and next month, filters to 30-day window

3. **Archives Tiles** (`ArchivesTiles.tsx`)
   - Three clickable tiles in responsive grid:
     1. **Photo Gallery** → `/fanclub/photo`
     2. **Memorabilia Archive** → `/fanclub/memorabilia`
     3. **Library** → `/fanclub/library`
   - Hover effects for visual feedback
   - Public routes `/memorabilia`, `/photos`, `/photo`, and `/library` must not exist

4. **Post Creation / Work Area** (`PostCreation.tsx`)
   - "Share with the Club" text area
   - Post visibility notice (members-only)
   - Submit button
   - **D1 Connectivity:** POSTs to `/api/discussions/create` endpoint
   - **Future Enhancement:** Photo/video attachments (noted in UI)

5. **FanClub Discussion Feed** (`DiscussionFeed.tsx`)
   - Reverse chronological feed of member posts
   - Shows: author name, timestamp, title, body
   - **D1 Connectivity:** Fetches from `discussions` table (status='posted', limit 20)
   - **Future Enhancements:** Replies, reactions (like/dislike), report buttons (UI placeholders present)

6. **Gehrig Timeline** (`GehrigTimeline.tsx`)
   - FanClub-focused timeline with 8 major life events
   - Events: Birth (1903), Yankees Debut (1923), The Streak Begins (1925), Murderers' Row (1927), Triple Crown (1934), Farewell Speech (1939), Passing (1941), MLB's Greatest First Baseman (1969)
   - Visual timeline with vertical line and event markers

7. **Admin Dashboard Link** (`AdminLink.tsx`)
   - **Conditional:** Only visible to admin users
   - "Admin Tools" section with dashboard link
   - **Authorization:** Uses role check from `/apifanclub/role`

### Components

All member-specific components are in `src/componentsfanclub/`:

- `WelcomeSection.tsx` - Welcome message and upcoming events
- `PostCreation.tsx` - Post creation form
- `DiscussionFeed.tsx` - Display member discussions
- `ArchivesTiles.tsx` - Archive navigation tiles
- `GehrigTimeline.tsx` - Lou Gehrig timeline
- `AdminLink.tsx` - Conditional admin dashboard link

### D1 Database Integration

#### Tables Used
- **discussions:** FanClub posts (title, body, author_email, status, created_at)
- **events:** Calendar events (title, start_date, end_date, location, status)
- **members:** User roles (email, role: 'member'|'admin')

#### API Endpoints
- `GET /api/discussions/list` - Fetch posted discussions (limit 1-20)
- `POST /api/discussions/create` - Create new discussion post
- `GET /api/events/month` - Fetch events by month (YYYY-MM format)
- `GET /apifanclub/role` - Check user role by email

### Authentication & Authorization

#### FanClub Authentication
- Cookie-backed authentication via `lgfc_session`
- Not authenticated → redirects to `/` (canonical unauthenticated target)
- Session validation is server-backed via D1 `member_sessions`

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
- Email change flow is deferred; no magic-link behavior is canonical in Day 1 docs

### Navigation Behavior

Per `docs/reference/design/LGFC-Production-Design-and-Standards.md`:

**FanClub Area Logo:**
- Always links to `/` (public home), consistent with global site logo behavior

**Hamburger Menu:**
- Contains **only standalone pages** (no sections, no footer links)
- Visitor hamburger items: Home (mobile only), About, Contact, Support, Store
- FanClub hamburger adds: Members (current location indicator), Admin (conditional)
- Desktop/tablet: Does not include "Home"
- Mobile: Includes "Home" for easy navigation

**Footer:** (per `/docs/reference/design/LGFC-Production-Design-and-Standards.md`)
- Left:
  - Quote fetched from `/api/footer-quote` (D1-backed)
  - Quote may include Lou Gehrig quotes or quotes about Lou Gehrig
  - Dynamic display, not hardcoded page text
  - Copyright line: `© {new Date().getFullYear()} Lou Gehrig Fan Club`
- Center:
  - LG logo button
  - Behavior: scroll to top of current page
- Right (two-row layout):
  - Row 1: Privacy (`/privacy`), Terms (`/terms`)
  - Row 2: Contact (`/contact`)
- Constraints:
  - No `mailto:` footer link
  - No Admin link in the public footer
  - Contact/support email belongs on `/contact`, not in footer navigation
  - No extra footer links beyond the locked set

### Styling

- Uses global CSS variables (e.g., `var(--lgfc-blue)` for brand color)
- No Tailwind, no CSS-in-JS frameworks
- Inline styles for component-specific layout
- Responsive grid for Archives Tiles (auto-fit, minmax 250px)

### Testing Requirements

Per `/.github/pull_request_template.md` and `docs/governance/PR_GOVERNANCE.md`:

- **Build Validation:** `npm run build:cf` must pass
- **Lint:** `npm run lint` (warnings acceptable, no errors)
- **Assessment:** `npm run assess` validates route structure and page markers
- **Manual Testing:**
  - Navigate to `/fanclub` without login → Redirected to `/` (or login flow)
  - Navigate to `/fanclub` with login → FanClub sections visible
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

### Social Wall (Elfsight) — CSP and runtime

- Social Wall depends on CSP coverage in `public/_headers` for Elfsight and social media asset domains.
- Social Wall also depends on client-side widget initialization logic in `src/components/SocialWall.tsx`.
- Known symptom: shell renders but feed is partial/blank.
- First checks: CSP domains, script load, widget reload/init, external source cache/permissions.

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

**2026-03-27:** Documentation route correction
- Updated FanClub Archives Tiles documentation to use canonical fanclub-only routes
- Recorded that public archive routes must not exist

**2026-01-28:** ZIP 41 (PR #457) - Admin Access Model
- Added admin UI pages: `/admin`, `/admin/d1-test`, `/admin/cms`, `/admin/content`
- Admin pages are browser-reachable (no server-side gate)
- Admin API endpoints token-gated via `ADMIN_TOKEN`
- D1 diagnostic tool for database inspection
- See `/docs/admin/access-model.md` for details

**2026-01-20:** Initial implementation of FanClub Home per `docs/reference/design/fanclub.md`
- Implemented all 7 required sections in correct order
- Created member area layout with proper header/navigation
- Added D1 connectivity for discussions, events
- Created post creation endpoint
- Added admin role checking and conditional UI
- Build validated, linter passed (warnings only)
