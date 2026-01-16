# Cloudflare Frontend As-Built Documentation

**Last Updated**: 2025-11-16  
**Baseline Commit**: PR #308 (3d64267)

---

## Overview

This document captures the **current, real state** of the Cloudflare Pages-hosted public frontend for the Lou Gehrig Fan Club (LGFC) website.

### Purpose

- **Cloudflare Pages** hosts the **public, static LGFC site** accessible at the production domain.
- This is a **Next.js static export** (`output: "export"`) deployed to Cloudflare Pages.
- **No Supabase/Vercel logic lives here** — all dynamic features (member authentication, database-backed content, admin functions) belong to the future Vercel members/admin app.
- This document tracks the **as-built frontend baseline** and must be updated whenever public page layouts, routes, or major structural elements change.

### Governance

This document serves as the **authoritative baseline** for:
- Sentinel-Write Bot rules (Day 2 Ops)
- Supabase/Vercel integration planning
- Future PR reviews and drift detection
- Codex, Copilot Agent, and automated tooling alignment

---

## Routes / Pages

The following routes are served by Cloudflare Pages as static HTML pages:

### `/` — Homepage
**Purpose**: Primary landing page for the Lou Gehrig Fan Club.

**Major Sections** (in order):
1. Hero Banner ("Welcome to the Lou Gehrig Fan Club!")
2. Weekly Photo Matchup
3. Join/Login CTA
4. Social Wall (Elfsight widget)
5. Recent Club Discussions (static placeholder)
6. Friends of the Fan Club (Charities)
7. Lou Gehrig Milestones
8. Calendar of Events
9. FAQ and Ask a Question

**Static Placeholders**:
- Social Wall uses Elfsight embed (widget ID must be swapped when production widget is finalized)
- Recent Club Discussions section shows placeholder text; will become dynamic with Supabase
- Calendar events use static sample data
- Milestones use static sample data

### `/weekly` — Weekly Photo Matchup
**Purpose**: Dedicated page for the weekly photo voting feature.

**Major Sections**:
- Title: "Weekly Photo Matchup. Vote for your favorite!"
- Static matchup cards with sample photos
- Voting functionality is visual-only (no backend yet)

**Static Placeholders**:
- All matchup data is hardcoded
- Vote counts are not stored

### `/milestones` — Lou Gehrig Milestones
**Purpose**: Timeline of significant dates in Lou Gehrig's life and career.

**Major Sections**:
- Chronological timeline with date badges
- Key events and achievements
- Static content with no dynamic elements

### `/charities` — Friends of the Fan Club (Charities)
**Purpose**: Showcase ALS charities and organizations supported by the fan club.

**Major Sections**:
- List of partner organizations
- Charity spotlights with descriptions
- Static content with external links

### `/news` — News & Q&A Overview
**Purpose**: News updates and community Q&A section.

**Major Sections**:
- News article teasers
- Q&A interface (non-functional placeholder)
- Static content; future backend integration planned

### `/calendar` — Calendar of Events
**Purpose**: Display upcoming Lou Gehrig Fan Club events.

**Major Sections**:
- Monthly calendar grid
- Event listings with dates, titles, and locations
- Static sample events; will be populated from Supabase later

### `/member` — Member Area (Static Stub)
**Purpose**: Visual mockup of the member area until Vercel/Supabase wiring is active.

**Major Sections** (see detailed breakdown in "MemberPage As-Built" section below):
- Welcome section with profile card and upcoming events
- Club Discussions layout (composer + sample thread)
- Club Archives tiles (Memorabilia, Photo Gallery, Library)
- Admin & Moderator Tools teaser

**Status**: Completely static; no authentication or database integration yet.

### `/privacy` — Privacy Policy
**Purpose**: Legal privacy policy for the site.

**Major Sections**:
- Standard privacy policy content
- Static legal text

### `/terms` — Terms of Service
**Purpose**: Legal terms of service for the site.

**Major Sections**:
- Standard terms of service content
- Static legal text

### `/about` — About the Fan Club
**Purpose**: Information about the Lou Gehrig Fan Club.

**Major Sections**:
- Club history and mission
- Static informational content

### `/contact` — Contact Information
**Purpose**: Contact form and information.

**Major Sections**:
- Contact form (static placeholder)
- Email and social media links

### `/admin` — Admin Dashboard (Static Stub)
**Purpose**: Visual placeholder for admin functionality.

**Status**: No real admin functionality; will be implemented in Vercel/Supabase phase.

### `/join` — Join the Club
**Purpose**: Membership signup page.

**Status**: Static form placeholder; will integrate with Supabase authentication later.

### `/health` — Health Check
**Purpose**: Simple health check endpoint for monitoring.

**Major Sections**:
- Returns basic status JSON
- Used for uptime monitoring

---

## Global Layout

### Header

**Structure**:
- **Logo**: Positioned at top-left (8px from top, 16px from left)
  - Logo image: `/IMG_1946.png`
  - Height: 80px (auto width)
  - Links to `/` (homepage)
- **Login Button**: Positioned at top-right
  - Text: "Login"
  - Links to `/member`
  - Styling: Blue text, white background, rounded corners with border
- **Hamburger Menu Button**: Positioned at top-right (next to Login button)
  - Opens navigation drawer on click
  - SVG hamburger icon (3 horizontal lines)

**Navigation Items** (in hamburger menu):
1. Home → `/`
2. About → `/about`
3. Contact → `/contact`
4. Store → `https://www.bonfire.com/store/lou-gehrig-fan-club/` (external)
5. Members Area → `/member`
6. Admin → `/admin`

**Behavior**:
- Header is **non-sticky** (does not follow scroll)
- Hamburger drawer opens as overlay positioned from top-right
- Menu items close the drawer on click

**Implementation Files**:
- `src/components/Header.tsx`
- `src/components/HamburgerMenu.tsx`

### Footer

**Structure**:
- **Copyright Notice**: `© 2025 Lou Gehrig Fan Club. All rights reserved.`
  - Year updates dynamically via JavaScript
  - Site name from `NEXT_PUBLIC_SITE_NAME` environment variable (default: "Lou Gehrig Fan Club")
- **Links**:
  - Privacy → `/privacy`
  - Terms → `/terms`
  - Admin → `/admin`
- **Layout**: Horizontal flex container with copyright on left, links on right

**Notable**:
- No build/version hash exposed in the footer
- No deployment timestamp displayed
- Clean, minimal design

**Implementation Files**:
- `src/components/Footer.tsx`
- `src/components/Footer.module.css`

---

## Homepage Structure (Final As-Built)

The homepage (`src/app/page.tsx`) implements sections in the following order:

### 1. Hero Banner
**Component**: Inline `<header>` element with `styles.hero` class

**Content**:
- **Title**: "Welcome to the Lou Gehrig Fan Club!"
- **Subtitle**: "We are proud to be fans of the greatest baseball player ever and are dedicated to celebrating his life and legacy."

**Styling**:
- Custom module CSS (`page.module.css`)
- Centered text layout
- Prominent heading size

### 2. Weekly Photo Matchup
**Component**: `<WeeklyMatchup />`

**Content**:
- **Title**: "Weekly Photo Matchup. Vote for your favorite!"
  - Color: `rgb(0, 51, 204)` (LGFC Blue, `--lgfc-blue`)
  - Centered, bold
- Static matchup cards with sample photos
- Visual-only voting interface

**Styling**:
- Section spacing: `.section-gap` class
- Custom styles in `src/styles/weekly.css`

### 3. Join/Login CTA
**Component**: `<JoinCTA />`

**Content**:
- **Text**: "Become a member. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more."
- **Buttons**: "Join Now" and "Login" (static links)

**Styling**:
- Background color: `rgb(0, 51, 204)` (LGFC Blue, `--lgfc-blue`)
- White text on blue background
- Rounded corners with padding
- Section spacing: `.section-gap` class

### 4. Social Wall
**Component**: `<SocialWall />`

**Content**:
- Elfsight social feed widget embed
- **Script URL**: `https://elfsightcdn.com/platform.js`
- **Widget Container Class**: `elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8`
- **Lazy Loading**: `data-elfsight-app-lazy` attribute present
- **Fallback Text**: Displayed while widget loads

**Status**: Uses Elfsight static embed; widget ID is a placeholder and must be swapped when production widget is finalized.

**Styling**:
- Section spacing: `.section-gap` (via parent section)
- Custom styles in `src/components/social-wall.module.css`

### 5. Recent Club Discussions
**Content**:
- **Title**: "Recent Club discussions"
- **Subtitle**: "Displays the last 5 posts from the members' discussion area."
- Empty grid placeholder (no posts rendered)

**Status**: Purely static for now; will become dynamic with Supabase member posts.

**Styling**:
- Section spacing: `.section-gap` class
- Container wrapper for max-width constraint

### 6. Friends of the Fan Club (Charities)
**Component**: `<FriendsOfFanClub />`

**Content**:
- Showcase of ALS charities and partner organizations
- Charity spotlight cards with descriptions
- External links to charity websites

**Styling**:
- Section spacing: `.section-gap-moderate` class
- Custom module CSS (`FriendsOfFanClub.module.css`)

### 7. Lou Gehrig Milestones
**Component**: `<MilestonesSection />`

**Content**:
- Timeline of key dates in Lou Gehrig's life
- Date badges with event descriptions
- Static chronological data

**Styling**:
- Section spacing: `.section-gap-tight` class
- Grid layout for timeline items

### 8. Calendar of Events
**Component**: `<CalendarSection />`

**Content**:
- Monthly calendar grid
- Static sample events with dates, titles, locations
- Links to `/calendar` for full view

**Status**: Static sample data; will be populated from Supabase events table later.

**Styling**:
- Section spacing: `.section-gap-tight` class
- Custom module CSS (`CalendarSection.module.css`)

### 9. FAQ and Ask a Question
**Component**: `<FAQSection />`

**Content**:
- Common questions about the fan club
- Search interface (visual-only)
- "Ask a Question" form (non-functional placeholder)
- Sample FAQ entries

**Status**: Static content; form submission will be wired to backend later.

**Styling**:
- Section spacing: `.section-gap-tight` class
- Card-based layout with borders

### 10. Footer
**Component**: `<Footer />` (global layout component)

**Content**: See "Global Layout > Footer" section above.

---

## MemberPage As-Built

**Route**: `/member`  
**File**: `src/app/member/page.tsx`

### Overview

The member page is a **visual-only layout** demonstrating the planned member area structure. No authentication, database, or backend functionality is active. All content is static or hardcoded.

### Layout Sections

#### 1. Welcome Section
**Content**:
- **Title**: "Welcome back, Member"
- **Subtitle**: "This is your home inside the Lou Gehrig Fan Club. Here's what's happening over the next 30 days."
- **Grid Layout** with two cards:

  **a) Your Profile Card**
  - Describes profile management features
  - "Go to Profile Page" button (link to `/member/profile`)
  - Note about email verification via magic link
  - Background: Light blue (`#f8fbff`)

  **b) Upcoming Events Card**
  - Lists 3 hardcoded sample events:
    1. "Annual Lou Gehrig Memorial Event" — Dec 15, 2025
    2. "Virtual Q&A with Baseball Historians" — Jan 8, 2026
    3. "Fan Club Meet & Greet" — Feb 3, 2026
  - Link to "View full club calendar" → `/calendar`
  - Background: Light purple (`#f5f7ff`)

**Status**: All data is static placeholders; real user profiles and events will come from Supabase.

#### 2. Club Discussions Section
**Content**:
- **Title**: "Club Discussions"
- **Subtitle**: Explains posting requirements (text + photo/video for top-level, text for replies)
- **Grid Layout** with two columns:

  **a) New Discussion Composer (Left Column)**
  - Form fields:
    - Topic title input (read-only)
    - Post text textarea (read-only)
    - Photo/video upload placeholder
  - Disabled "Posting from this page will be enabled later" button
  - Note: "This is a layout placeholder. Posting will be wired to Supabase and Backblaze B2 in a later phase."

  **b) Example Discussion Thread (Right Column)**
  - Sample thread: "Remembering Lou's 'Luckiest Man' Speech"
  - Posted by @GehrigFan42, 2 days ago
  - Thread body text
  - Controls: Like, Dislike, Report buttons (non-functional)
  - Two sample replies:
    - @IronHorse1939 (1 day ago)
    - @ALSAdvocate (18 hours ago)
  - Reply controls: Like, Report buttons (non-functional)

**Status**: All content is static; real posting, commenting, and moderation will be implemented in Supabase/Vercel Phase 2.

#### 3. Club Archives Section
**Content**:
- **Title**: "Club Archives"
- **Subtitle**: "Deep dives into memorabilia, photo history, and the Gehrig library—each backed by tagged media in Backblaze B2."
- **Grid Layout** with three tiles:

  **a) Memorabilia Archive**
  - Description: "Game-used items, tickets, programs, and vintage pieces submitted by members."
  - Link to `/archives/memorabilia`

  **b) Photo Gallery**
  - Description: "Curated photo sets from Gehrig's career, stadium shots, and fan-submitted images."
  - Link to `/archives/photos`

  **c) Library**
  - Description: "Books, articles, and research materials about Lou Gehrig, ALS, and baseball history."
  - Link to `/archives/library`

**Status**: Static tiles with placeholder links; archive functionality will integrate with Backblaze B2 and Supabase later.

#### 4. Admin & Moderator Tools Section
**Content**:
- **Title**: "Admin & Moderator Tools"
- **Subtitle**: "This block will only be visible to admins and moderators once Supabase auth and role checks are wired in."
- **Admin Dashboard Card**:
  - Description: "Review reported posts and comments, manage media tagging, and oversee member activity in a unified view."
  - "Go to Admin Dashboard" button (link to `/admin`)
  - Background: Light tan (`#fdf9f3`)

**Status**: Static stub; visibility controls and admin functionality will be implemented with Supabase role-based access control.

### Styling Notes

All memberpage styles are defined in `src/app/globals.css` under the `.memberpage-*` class namespace.

**Key Classes**:
- `.memberpage`: Main container (max-width: 1120px)
- `.memberpage-section`: Section wrapper with bottom margin
- `.memberpage-card`: Card component with border, background, padding, shadow
- `.memberpage-button`: Blue pill-shaped button
- `.memberpage-pill-button`: Small rounded button for actions (Like, Report, etc.)
- `.memberpage-archive-tile`: Hoverable tile for archive links

**Responsive Behavior**:
- Welcome grid: 2 columns on desktop, 1 column on mobile
- Discussions grid: 2 columns on desktop, 1 column on mobile
- Archives grid: 3 columns on desktop, 1 column on mobile

---

## Styling As-Built

### Global Font Family

**Variable**: `--lgfc-font-family`  
**Value**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif`

**Applied to**:
- `body` element
- All `.memberpage-*` elements

### Approved Heading Sizes and Weights

Defined in `src/app/globals.css`:

| Heading | Variable | Size | Weight |
|---------|----------|------|--------|
| Hero | `--lgfc-font-size-hero` | 2.5rem (40px) | 700 (bold) |
| H1 | `--lgfc-font-size-h1` | 2rem (32px) | 700 (bold) |
| H2 | `--lgfc-font-size-h2` | 1.5rem (24px) | 700 (bold) |
| H3 | `--lgfc-font-size-h3` | 1.125rem (18px) | 600 (semibold) |
| Body | `--lgfc-font-size-body` | 1rem (16px) | 400 (normal) |
| Small | `--lgfc-font-size-small` | 0.875rem (14px) | 400 (normal) |
| Fine | `--lgfc-font-size-fine` | 0.8125rem (13px) | 400 (normal) |

### Canonical Color Variables

Defined in `src/app/globals.css`:

**Primary Colors**:
- `--lgfc-blue`: `#0033cc` (computed: `rgb(0, 51, 204)`) — Primary brand color
- `--lgfc-blue-hover`: `#0028a3` — Hover state for blue elements
- `--lgfc-navy`: `#001a66` — Darker blue accent

**Text Colors**:
- `--lgfc-text-main`: `#333333` — Primary body text
- `--lgfc-text-muted`: `#666666` — Secondary/muted text
- `--lgfc-text-light`: `#999999` — Tertiary/disabled text

**Background Colors**:
- `--lgfc-bg-page`: `#f5f7fb` — Page background
- `--lgfc-bg-card`: `#ffffff` — Card/component background
- `--lgfc-bg-subtle`: `#f8f9ff` — Subtle background tint

**Border Colors**:
- `--lgfc-border-soft`: `#dde3f5` — Standard borders
- `--lgfc-border-light`: `#e8ecf5` — Lighter borders

### Layout Variables

**Border Radius**:
- `--lgfc-radius-xl`: `18px` — Extra large radius
- `--lgfc-radius-lg`: `14px` — Large radius (default for cards)
- `--lgfc-radius-md`: `12px` — Medium radius (buttons, inputs)
- `--lgfc-radius-pill`: `999px` — Pill-shaped elements

**Spacing/Rhythm**:
- `--rhythm-lg`: `48px` — Large vertical spacing
- `--rhythm-md`: `32px` — Medium vertical spacing
- `--rhythm-sm`: `20px` — Small vertical spacing
- `--section-gap`: `2.5rem` (40px) — Standard section gap
- `--section-gap-tight`: `3rem` (48px) — Tight section gap
- `--section-gap-moderate`: `4rem` (64px) — Moderate section gap

### CSS Files Reference

**Global Styles**:
- `src/app/globals.css` — Main stylesheet with all LGFC design tokens, layout utilities, and memberpage styles
- `src/styles/variables.css` — Legacy color variables (partially deprecated; `globals.css` takes precedence)

**Component-Specific Styles**:
- `src/styles/weekly.css` — Weekly matchup section
- `src/styles/home.css` — Homepage-specific utilities
- `src/components/Header.module.css` — Header component (note: mostly inline in Header.tsx)
- `src/components/Footer.module.css` — Footer component
- `src/components/CalendarSection.module.css` — Calendar section
- `src/components/FriendsOfFanClub.module.css` — Charities section
- `src/components/social-wall.module.css` — Social Wall section
- Various other component `.module.css` files

---

## Known Gaps / TODOs (As-Built)

These are **deliberate, accepted gaps** in the Cloudflare static baseline. They will be addressed in follow-up Vercel/Supabase integration work.

### Social Wall
- **Status**: Uses Elfsight static embed with placeholder widget ID
- **TODO**: Swap widget container class `elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8` when production widget is finalized
- **TODO**: Verify script URL remains `https://elfsightcdn.com/platform.js`
- **Reference**: See `docs/website-PR-governance.md` for Social Wall drift prevention rules

### Member Page
- **Status**: Not wired to Supabase or authentication system
- **TODO**: Implement Supabase authentication (magic link)
- **TODO**: Connect profile data to Supabase users table
- **TODO**: Wire discussions to Supabase posts/comments tables
- **TODO**: Integrate Backblaze B2 for media uploads
- **TODO**: Implement role-based access control for admin tools
- **TODO**: Hide non-functional forms and show working UI components

### Calendar Events
- **Status**: Uses static sample data
- **TODO**: Populate from Supabase events table
- **TODO**: Add admin interface for event management
- **TODO**: Implement event registration/RSVP functionality

### Milestones
- **Status**: Uses static sample data
- **TODO**: Move to Supabase content management system
- **TODO**: Add admin interface for milestone editing

### Weekly Photo Matchup
- **Status**: Visual-only; no vote storage
- **TODO**: Implement voting backend with Supabase
- **TODO**: Add admin interface for matchup management
- **TODO**: Track and display vote counts

### Recent Club Discussions (Homepage)
- **Status**: Empty placeholder section
- **TODO**: Pull latest 5 posts from Supabase
- **TODO**: Render post cards with links to full threads

### FAQ / Ask a Question
- **Status**: Static content; form is non-functional
- **TODO**: Wire form submission to Supabase
- **TODO**: Add admin moderation interface for submitted questions
- **TODO**: Implement search functionality

### Join/Login Forms
- **Status**: Static placeholder forms
- **TODO**: Implement Supabase authentication
- **TODO**: Add member registration flow
- **TODO**: Wire to Stripe for membership payments (if applicable)

### Admin Dashboard
- **Status**: Static placeholder page
- **TODO**: Implement full admin interface in Vercel app
- **TODO**: Add content moderation tools
- **TODO**: Add analytics dashboard
- **TODO**: Add member management interface

---

## Change Tracking

### How to Maintain This Document

This document is the **authoritative baseline** for the Cloudflare static frontend. Any changes to the public site structure must be reflected here.

**Update this document in the same PR whenever**:
1. **Public route structure changes**
   - New pages added or removed
   - Route paths modified
   - Page redirects implemented

2. **Page-level layouts change**
   - Section order modified (e.g., homepage section reordering)
   - Major sections added or removed
   - Component hierarchy changes

3. **Header/footer navigation changes**
   - New menu items added
   - Menu items removed or renamed
   - Navigation structure reorganized

4. **Major section additions/removals**
   - New homepage sections added
   - Existing sections removed
   - Section content significantly restructured

5. **Styling baseline changes**
   - Color variables modified
   - Typography scale updated
   - Global layout tokens changed

6. **Known gaps resolved**
   - Static placeholders replaced with dynamic content
   - Backend integrations completed
   - TODOs addressed

### Enforcement

- **Manual Review**: All PRs touching Cloudflare pages must update this doc (enforced by code review)
- **Future**: Sentinel-Write Bot will automatically check for doc updates when page files change (PR #311)
- **Process Docs**: See `docs/website-PR-process.md` and `docs/website-PR-governance.md` for PR requirements

### Version History

| Date | Commit | Description |
|------|--------|-------------|
| 2025-11-16 | PR #310 | Initial as-built baseline documentation created |
| (future) | | Updates from subsequent PRs will be logged here |

---

## Questions / Clarifications

For questions about this document or the Cloudflare frontend baseline:

1. **Check** `docs/website-PR-process.md` for structural and formatting standards
2. **Check** `docs/website-PR-governance.md` for operational and rollback protocols
3. **Check** `docs/homepage.html` for canonical markup source
4. **Check** `docs/memberpage.html` for canonical MemberPage specification
5. **Contact** repository owner (@wdhunter645) for authorization questions

---

**End of As-Built Documentation**
