# LGFC — Production Design & Standards (AUTHORITATIVE)

Status: LOCKED — PRODUCTION SOURCE OF TRUTH
Effective Date: 2026-01-16

This document supersedes all prior design, header, navigation, and standards documentation.
Any conflict must be resolved in favor of this file.

[Content intentionally condensed for repo insertion — full content approved in control review]

---


---

## Day 1 Design Locks — Explicit (Authoritative)

### 1) Auth Boundaries (explicit)
- `/fanclub/**` requires login; unauthenticated access redirects to `/`.
- Public pages remain visitor-accessible: `/contact`, `/about`, `/support`, `/terms`, `/privacy`, `/search`, `/join`, `/login`, `/faq`, `/health`.

### 2) Canonical Routes (explicit)
See `/docs/NAVIGATION-INVARIANTS.md` for the canonical route list. This file and NAVIGATION-INVARIANTS are the source of truth.

### 3) Headers (explicit)
- Public header:
  - Not logged in: Join, Search, Store (external), Login
  - Logged in while on public pages: add Club Home + Logout (6 total)
- FanClub header (single variant): Club Home, My Profile, Search, Store (external), Logout
- Global logo always links to `/`.

### 4) Footer (explicit)
- Left: quote line + legal line
- Center: small logo scroll-to-top current page
- Right links (order): Contact, Support, Terms, Privacy
- No email displayed in footer.

### 5) Weekly Vote (explicit, deferred)
- Current matchup appears on the public home page.
- `/weeklyvote` is a hidden results page revealed only after a vote.
- Weekly vote route consolidation is deferred; do not delete weekly-related routes until finalized.

### 6) Store (explicit)
- Store is an external Bonfire link. There is no internal `/store` route.


## Consolidated Design Locks (Authoritative) — merged 2026-01-19 UTC

The content below was merged from `LGFC-Lite-Design-Locks.md` so that this document is self-contained.

# LGFC-Lite Design Locks — January 16, 2026 (AUTHORITATIVE)

This document captures **all** design decisions explicitly locked in the design review threads up to January 15, 2026.
It is additive (does not overwrite existing authoritative docs) and is maintained via the SHADOW workflow.

---

## 1) Visitor vs Member Boundary

### Entry
- Visitors and members arrive at **`home/page.tsx`** (www.lougehrigfanclub.com).

### Visitor experience (public) — Home page sections
Home page sections, in order:
1. Header
2. Weekly Vote (two photos; rotates weekly)
3. **JOIN** promoted conversion block (only promoted CTA; directly under Weekly Vote and above Social Wall)
4. Social Wall (Elfsight widget)
5. Recent Discussion teaser (shows last 5–10 items from member Discussions; read-only teaser)
6. Friends of the Club (tiles for charities and businesses that sponsor/collaborate/benefit)
7. Milestones (Gehrig career timeline)
8. Events Calendar (current month grid)
9. FAQ (preview 5–10; link to full FAQ page)
10. Ask a Question (linked from FAQ; dedicated stub page)
11. Footer

#### Social Wall Implementation
- **Platform Script:** Loaded globally in `src/app/layout.tsx` using `next/script` with `strategy="beforeInteractive"`
- **Script URL:** `https://static.elfsight.com/platform/platform.js`
- **Widget Container:** Located in `src/components/SocialWall.tsx`
- **Widget ID:** `elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8` (stored in the container class)
- **Loading:** Platform script is loaded once globally in the layout head, not per component
- **Important:** Do not reintroduce per-component script loading or use the older `apps.elfsight.com/p/platform.js` URL

### Members-only
- **All other features** are members-only and accessed from **`MEMBER/page.tsx`**.

---

## 2) Visitor Header (Public) — Final Lock (Updated 2026-01-16)

### Desktop / Tablet header layout — Not logged in
- Layout: **Logo + 4 buttons + Hamburger**
- Sticky: **the 4 buttons + hamburger**
- Not sticky: **the large overlapping logo** (it scrolls away and must not obstruct content)
- Logo destination: **Home**

Buttons (left → right):
1. **Join** → `/join`
2. **Search** → `/search`
3. **Store** → external Bonfire link (https://www.bonfire.com/store/lou-gehrig-fan-club/)
4. **Login** → `/login`
5. **Hamburger**

### Desktop / Tablet header layout — Logged in (browsing public pages)
When a member is logged in but browsing public pages (not `/fanclub/**`), the header shows all 4 public buttons PLUS two additional buttons:

Buttons (left → right):
1. **Join** → `/join`
2. **Search** → `/search`
3. **Store** → external Bonfire link
4. **Login** → `/login`
5. **Club Home** → `/fanclub`
6. **Logout** → `/logout`
7. **Hamburger**

### Visitor hamburger menu (desktop/tablet)
Same for both logged-out and logged-in states (hamburger contains only standalone pages, not header button duplicates):

Order:
1. **About** → `/about`
2. **Contact** → `/contact`
3. **Support** → mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed


### Mobile header layout
- Visible: **Logo + Hamburger only**
- Sticky: **Hamburger**
- Not sticky: **Logo**
- All header buttons move into the hamburger to save space.

Mobile visitor hamburger order (same for logged-out and logged-in states):
1. **Home** → `/`
2. **About** → `/about`
3. **Contact** → `/contact`
4. **Support** → mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed
5. **Store** → external Bonfire link (opens new tab)


## 3) Hamburger Menu Interaction Behavior — Final Lock (Added 2026-01-20)

### Click-Away Close (All Headers, All Breakpoints)
- When the hamburger dropdown is open, clicking or tapping **outside** the dropdown container AND outside the hamburger toggle button **closes** the dropdown.
- Clicking or tapping **inside** the dropdown does NOT close it.
- Implementation uses `pointerdown` event on `document` to avoid focus/click ordering issues.

### Keyboard Close (All Headers, All Breakpoints)
- Pressing the **Escape** key when the dropdown is open **closes** the dropdown.

### Focus Management (All Headers, All Breakpoints)
- When the dropdown is closed via click-away or Escape key, focus **returns to the hamburger toggle button**.
- This ensures keyboard navigation and accessibility are maintained.

### Implementation Standard
- The dropdown close behavior is implemented in a shared `useClickAway` hook located at `src/hooks/useClickAway.ts`.
- This hook is used by both `HamburgerMenu.tsx` (Visitor) and `MemberHamburgerMenu.tsx` (Member) to ensure consistent behavior across all header variants.
- Event listeners are added only while the dropdown is open and removed on close/unmount to optimize performance.

### Regression Prevention
- This behavior standard must NOT regress. Any changes to hamburger menu components must maintain click-away and Escape key close functionality.
- Focus restoration to the toggle button is required for accessibility compliance.

## 4) Home CTA Lock (re-affirmed)
- **JOIN** is the only promoted conversion block on Home.
- **LOGIN** is not promoted in page content sections; it exists only in the header.

---

## LOGIN / LOGOUT — Final Lock (Updated 2026-01-16)

### Phase Reality: LGFC-Lite vs Future Auth Phase

**LGFC-Lite (Current — Cloudflare Pages Static Export):**
- `/login` is an **informational stub page only**.
- Authentication is **intentionally disabled** in LGFC-Lite.
- The login page informs visitors that member login functionality is not yet live and directs them to the Join flow.
- **No email/password fields, no authentication logic, no backend dependencies.**

**Authoritative Spec Reference:**
- See `/docs/design/login.md` for the current LGFC-Lite login page specification.

### Future: Auth Phase Lock (Deferred Behavior)

The detailed login/logout behavior below is **deferred to the future Auth phase** (Vercel/Supabase or equivalent backend). This content documents the intended behavior when authentication is implemented but does **not** apply to LGFC-Lite.

#### Login (Future Auth Phase)
- Login routes to the Login page.
- Successful login lands on **Member Home**.
- Failed login remains on the Login page and shows an on-page message for **email unknown**.

#### Security guardrails (Future Auth Phase)
- If email entered on Login does not exist: do **not** send any email.
- Show: "Email not found." and provide a Join link.
- Allow max **3** failed Login attempts per hour per source; lock out for 1 hour after 3 failures.

#### Logout (Future Auth Phase)
- Logout signs the member out and lands on **Visitor Home**.

## 6) JOIN — Behavior Lock

### Fields
- First name (required)
- Last name (required)
- Screen name (optional)
- Email (required)

### Duplicate email handling
- If JOIN is submitted with an email that already exists:
  - **Do NOT** update any existing member record
  - **Do NOT** send a welcome email
  - Show on-screen message that the email address is already in use, with guidance to use LOGIN instead.

### Welcome email
- Sent on successful new JOIN.
- Includes membership card instructions and a **CONFIRM** button (routes to LOGIN for validation).

---

## 7) Support Access Lock

- Header and hamburger menu include **Support** item:
  - mailto: `Support@LouGehrigFanClub.com`
  - subject: **"Support Needed"**
- JOIN page includes Support button:
  - subject: **"Support Needed JOIN"**
- LOGIN page includes Support button:
  - subject: **"Support Needed LOGIN"**

Support is separate from Ask a Question.

---

## 8) Ask a Question — Behavior Lock

- Entry: from FAQ section link **Ask a Question**.
- Form collects same fields as JOIN + freeform question.
- Submitting Ask a Question:
  - Adds the person to the club and sends welcome email with CONFIRM button.
  - Brings the question to admin attention for response via direct email.
- Relationship to FAQ upgraded:
  - Ask-a-Question items should be stored in D1 as an inbox (triage via POST/HIDE).
  - Admin UI provides dropdown to set visibility and manage duplicates.

---

## 9) FAQ — Final Lock

- Retain existing structure: **search + last 10 shown**.
- Backed by D1 canonical FAQ entries (POST only for public).
- Ordering: **most recently answered / updated first**.
- Each question links to a detail view/page for full answer.
- Empty search state includes link to Ask a Question.

---

## 10) Event Calendar — Final Lock

### Content scope
- Calendar entries must be strictly limited to Lou Gehrig’s life, career, and baseball legacy.
- Explicit exclusion: ALS-related discussions, support groups, awareness events, or non-Gehrig ALS content.

### Update model (v1)
- **Admin-manual only** (no automated online searching in v1).
- Members may suggest events via email:
  - to: `admin@lougehrigfanclub.com`
  - subject: **"Calendar Event"**

### Display + interaction
- Display: **current month grid** on Home.
- Grid does not expand for long titles; titles truncate/ellipsis.
- Event titles are clickable to open full detail view (date/time, location, host, admission fees optional, description, external link optional).

---

## 11) Members Header — Final Lock (Updated 2026-01-16)

### Desktop / Tablet header layout (same structure as Visitor)
- Layout: **Logo + 5 buttons + Hamburger**
- Sticky: **the 5 buttons + hamburger**
- Not sticky: **the large overlapping logo** (it scrolls away and must not obstruct content)
- Logo destination: **/** (global home)

Buttons (left → right):
1. **Club Home** → `/fanclub`
2. **My Profile** → `/fanclub/myprofile`
3. **Search** → `/search`
4. **Store** → external Bonfire link (opens new tab)
5. **Logout** → `/logout`
6. **Hamburger**

Note: This header only appears on `/fanclub/**` routes. Unauthenticated access to `/fanclub/**` redirects to `/`.

### Member hamburger menu (desktop/tablet)
Same items for all FanClub pages (hamburger contains only standalone pages not already in header buttons):

Order:
1. **About** → `/about`
2. **Contact** → `/contact`
3. **Support** → mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed

Note: Obtain Membership Card is accessed via Member Home quick links, not hamburger menu.

### Mobile header layout
- Visible: **Logo + Hamburger only**
- Sticky: **Hamburger**
- Not sticky: **Logo**
- All header buttons move into the hamburger to save space.

Mobile member hamburger order:
Note: On mobile, all header buttons move into hamburger. Store does not appear because it's not currently implemented on mobile for FanClub pages.

1. **Home** → `/`
2. **Club Home** → `/fanclub`
3. **My Profile** → `/fanclub/myprofile`
4. **Search** → `/search`
5. **About** → `/about`
6. **Contact** → `/contact`
7. **Support** → mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed
8. **Logout** → `/logout` (must be last)

Note: Obtain Membership Card is accessed via Member Home quick links.


## 12) Member Welcome Hero (MEMBER/page.tsx)

- Welcome section is a hero banner: full-width Lou Gehrig image with overlay text:
  - **"WELCOME LOU GEHRIG FAN CLUB MEMBERS!"**
- Banner image is changeable; photos must be tagged for banner eligibility (avoid portraits stretched as banners).

---

## 13) Member Pages — Large Logo Overlapping Banner (Final Lock)

### Purpose
- Strong members-only branding and “club crest” identity.

### Placement & overlap
- Logo partially overlaps the bottom edge of the hero banner and the content below.
- Left-aligned to the page content gutter.
- Overlap target: ~60–70% on banner, ~30–40% on content below.

### Treatment
- Logo placed inside a solid container (light background) with padding.
- Subtle border/shadow to remain readable over any banner image.
- Header controls remain above both banner and logo (no interaction overlap).

### Responsiveness
- Desktop: full overlap treatment.
- Tablet/mobile: reduced logo size and reduced overlap depth to prevent layout compression.

### Interaction
- Logo links to `MEMBER/page.tsx`.

---

## 14) Photo Usage Tagging + Member Profile Picture (Final Lock)

### Usage tagging/eligibility
Photos require usage tagging/eligibility for safe selection by placement:
- banner-eligible
- decor-eligible
- matchup-eligible
- profile-avatar-eligible
- (optionally later) thumbnail-safe, featured/spotlight, etc.

### Member profile pictures
- Members select a profile pic from the existing photo gallery (curated eligibility).
- No member uploads for profile pics (now, and potentially ever).

---

## 15) MEMBER/page.tsx Update (Final Lock)
- The prior "Member Overview" section is removed from `MEMBER/page.tsx`.
- Account details and overview live exclusively on a dedicated **My Profile** page (accessed via header button).

## Search — Final Lock (Updated 2026-01-16)

### Interaction
- Search is accessed via the header Search control.
- Search opens a **dedicated Search page** (not a modal, not a drawer).

### Scope
- Visitor Search: searches **visitor-accessible content only**.
- Member Search: searches **visitor + member-accessible content**.
- Admin Search: separate admin-only search with **no exclusions**.

### Results behavior
- Keywords/criteria entered on the Search page.
- Results list renders on the page with pagination as needed.

## Footer — Final Lock (Updated 2026-01-16)

### Global rules
- Same footer on **all pages** (visitor + member)
- Not sticky
- Auto-updating year in the copyright line

### Desktop / Tablet layout
- **Center:** Small LGFC logo
- **Left:** Rotating quote (from or about Lou Gehrig) + copyright/legal line
  - `© Lou Gehrig Fan Club, {auto-year}`
- **Right (2×2 stack):**
  - Terms
  - Privacy
  - Contact
  - Support (opens email draft)

### Mobile layout
Default:
- Logo left
- Terms / Privacy / Contact / Support to the right
- Copyright line with auto-year

Optional (if space requires):
- Logo left + footer hamburger right
  - Menu items: Terms, Privacy, Contact, Support

## My Profile — Final Lock (Updated 2026-01-16)

### Identity
- Each member has an internal UUID (used for lookups only).
- UUID must never be shown on the profile page.

### Member-editable fields
- First name
- Last name
- Screen name
- Email address
- Email communication opt in/out
- Profile picture selected from the gallery (filtered to size-vetted/approved images only)

### Save behavior
- Page uses **Save** and **Cancel** buttons.
- Save persists changes; Cancel discards unsaved changes and reverts to last saved state.

## Admin Access Control (Updated 2026-01-28)

### Admin Access Model
- **Admin UI pages** (`/admin`, `/admin/*`): Accessible via browser navigation without token requirement
  - UI pages allow admin users to enter and store their token in the session
  - Token is stored in `sessionStorage` as `lgfc_admin_token`
- **Admin API endpoints** (`/api/admin/**`): Protected by `ADMIN_TOKEN` environment variable
  - Requires `x-admin-token` header or `Authorization: Bearer <token>` header
  - Returns 401 Unauthorized if token is missing or incorrect
  - Returns 503 Service Unavailable if `ADMIN_TOKEN` is not configured

### Cloudflare Pages Environment Variables
Configure in Cloudflare Pages → Settings → Environment Variables (for both Preview and Production):
- `ADMIN_TOKEN`: Long random secret (minimum 32 characters recommended)

### Admin Pages
- `/admin` — Main admin dashboard
- `/admin/content` — Site content management (CMS)
- `/admin/cms` — CMS interface
- `/admin/d1-test` — D1 database inspection (tables, schema, sample rows)

## Admin Page — Final Lock (Updated 2026-01-16)

### Top of page — Health Status
A quick health snapshot including:
- Uptime
- Errors
- Utilization

### Admin sections (each supports Search + Add records)
1. Members
2. FAQ / Q&A
3. Events (suppression flag supports Gehrig-only compliance review; admin may unsuppress if permitted)
4. Friends of the Club (suppress flag to hide tiles without deleting)
5. Footer Quotes (rotating quotes management)
6. Membership Card Content (canonical content management)
7. Welcome Email Content (canonical content management)

8. Reports — Deferred (not required for Launch; Day 2/Day 3)

9. Admin Team Worklist (tasks needing attention)
- Fields: task, date opened, needed completion date, admin/mod owner, status (open/in progress/completed)

## Membership Card — Final Lock (Updated 2026-01-16)

### Label + page name
- Hamburger label: **Obtain Membership Card**
- Page name: **MembershipCard**

### Canonical content sources
- `/docs/MembershipCard.MD` is the canonical MembershipCard instructions content.
- `/docs/WelcomeEmail.MD` is the canonical Welcome Email top-half copy.

### Welcome email assembly rule
- Welcome email = `WelcomeEmail.MD` (upper half) + `MembershipCard.MD` (lower half).
- The CONFIRM CTA is presented as a button labeled **CONFIRM** (link provided by the email system).
---

# Addendum — January 16, 2026 Session Locks (Must Match Implementation)

This addendum captures every design/standards decision finalized in-session after the baseline January 15 locks. These items are **LOCKED** and override any conflicting older language.

## Navigation & Menus — FINAL
- Hamburger menus list **ONLY standalone pages**. Never list page sections, anchors, or footer-only destinations.
- **Charities** and **Events** are **sections of Visitor Home**, not pages.
- **Privacy Policy** and **Terms of Service** are **footer-only destinations** and **never appear** in hamburger menus.
- **Desktop & tablet** hamburger menus do **NOT** include **Home** or **Member Home**.
- Desktop and tablet hamburger menus do NOT include Home or Member Home.
- **Mobile** hamburger menus also must not include page sections or footer-only items.
- **Join** and **Login** never appear in hamburger menus (all device sizes).
- Header buttons and hamburger menus are distinct; do not assume parity.

## Fan Club Store — FINAL
- **Fan Club Store** is a standalone **PUBLIC** destination implemented as an **external Bonfire.com URL**.
- Must open in a **new browser tab**.
- Appears as:
  - Header button on **Visitor** and **Member** headers
  - A page link in **all hamburger menus** (desktop/tablet/mobile)
- Header button position: **#3 of 4** from the left.

## Search — FINAL
- Search covers the whole site but results are permission-filtered:
  - Visitors: public only
  - Members: public + member-only (no admin-only)
  - Admin: all
- Ranking:
  1) Closest textual match
  2) Most-used / most-accessed

## Presence (“Members Online”) — FINAL
- On login: set member status to **Active** (in D1).
- On logout: set member status to **Inactive** and remove from online list.
- Timeout: **1 hour of no detected activity** (scroll/click/etc.) → set to **Inactive**.
- Display: count of logged-in members + list of screen names currently Active.

## Media & Photos — FINAL
- Profile pictures: **no member uploads** for avatars; profile image is chosen from existing **approved Photo Gallery** items only.
- Members may submit photos to the gallery (uploads allowed) but all submissions are hidden pending admin moderation.
- Moderation state: all submissions received but **hidden** pending admin approval for visibility/use.
- Admin-controlled publish to B2: because B2 bucket is public, photos must not become publicly reachable until approved/published.

## Admin UX — FINAL
- Admin Dashboard is a **router/index** only (no crowded inline editing).
- One dedicated **review page per content type** (full-width for readability).
- Admin landing lists pages by type:
  - Public Pages / Member Pages / Admin Pages (names-only list, status tracked separately).
- Project tracking uses an internal XY table (Design Locked / Build Exists / Standards Aligned) and **does not appear on the website**.

## Operations — Photo Moderation Cleanup (Day 2/3 Enhancement) — FINAL
- Cleanup cadence: **quarterly**.
- Job scope:
  1) Identify D1 photo records with `status = declined` older than retention window.
  2) Delete corresponding B2 objects by object key.
  3) Delete D1 records only after successful B2 deletion (or if object already missing).
- Reporting on completion:
  - Total records evaluated
  - Number successfully removed
  - Number failed
  - Explicit list of failures for manual admin intervention
- Include a **dry-run** capability prior to destructive execution.
- This is an operations/maintenance job, not part of the public website UI.

## Accessibility — FINAL
- Support browser/OS accessibility scaling (browser zoom, iPad pinch-to-zoom, OS font scaling).
- No in-app font size controls are required.

---

## ADDENDUM — January 20, 2026: Header Layout & Hamburger Menu Clarifications (PR #392)

### Header Layout Lock (Visitor + Member Headers)

**Desktop/Tablet Header Button Positioning:**
- Header button groups MUST be **centered horizontally** on both visitor and member headers.
- Implementation:
  - Use `left: 50%` positioning
  - Use `transform: translateX(-50%)` for centering
  - Logo remains on the left (not centered)
  - Button container is sticky; logo is not sticky

**Visitor Header Buttons (Desktop/Tablet) — Not logged in:**
1. Join → `/join`
2. Search → `/search`
3. Store → external Bonfire link
4. Login → `/login`
5. Hamburger

**Visitor Header Buttons (Desktop/Tablet) — Logged in (browsing public pages):**
1. Join → `/join`
2. Search → `/search`
3. Store → external Bonfire link
4. Login → `/login`
5. Club Home → `/fanclub`
6. Logout → `/logout`
7. Hamburger

**Member Header Buttons (Desktop/Tablet):**
1. Club Home → `/fanclub`
2. My Profile → `/fanclub/myprofile`
3. Search → `/search`
4. Store → external Bonfire link
5. Logout → `/logout`
6. Hamburger

### Hamburger Menu — Store Placement Rules (CRITICAL)

**Desktop/Tablet Hamburger Menus:**
- Store MUST NOT appear in hamburger menus on desktop/tablet
- Reason: Store is a header button on desktop/tablet

**Visitor hamburger (desktop/tablet):**
- About → `/about`
- Contact → `/contact`
- Support → mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed

**Member hamburger (desktop/tablet):**
- About → `/about`
- Contact → `/contact`
- Support → mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed

Note: My Profile is now a header button. Obtain Membership Card is accessed via Member Home quick links.

**Mobile Hamburger Menus:**
- Store MUST appear in hamburger menus on mobile
- Reason: No header button row on mobile; hamburger is the only navigation

**Visitor hamburger (mobile):**
1. Home → `/`
2. About → `/about`
3. Contact → `/contact`
4. Support → mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed
5. Store → external Bonfire link (opens new tab)

**Member hamburger (mobile):**
1. Home → `/`
2. Club Home → `/fanclub`
3. My Profile → `/fanclub/myprofile`
4. Search → `/search`
5. About → `/about`
6. Contact → `/contact`
7. Support → mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed
8. Logout → `/logout` (must be last)

Note: Obtain Membership Card is accessed via Member Home quick links. Store is not currently shown on mobile for FanClub pages.

### Footer Lock

**Footer Structure:**
- Line 1: Rotating quote (from or about Lou Gehrig)
- Line 2: Copyright line with auto-updating year (NO email address visible)
- Line 3: Links row

**Footer Links:**
- Privacy → `/privacy`
- Terms → `/terms`
- Contact → `/contact`
- Support → mailto:Support@LouGehrigFanClub.com?subject=Support%20Request
- Admin → `/admin` (only visible to admin users)

**Email Display Policy:**
- Footer displays NO email address
- Contact page (`/contact`) displays: `admin@lougehrigfanclub.com`
- Support emails go to: `Support@LouGehrigFanClub.com`

### Member Home Quick Links

**Required links on Member Home (`/member/page.tsx`):**
- My Profile → `/member/profile`
- Membership Card → `/member/card`
- Gehrig Library → `/library`
- Photo → `/photo`
- Photo Gallery → `/photos`
- Memorabilia Archive → `/memorabilia`

---

## ADDENDUM — January 20, 2026: Header Logo Implementation Details

This addendum clarifies the technical implementation of the header logo behavior defined in Section 2 (Visitor Header) and Section 11 (Member Header).

### Logo Sizing

**Locked Specification:**
- Logo height: **240px** (3× baseline of 80px)
- Logo width: **auto** (preserves aspect ratio)
- Logo asset: `/public/IMG_1946.png`

### Z-Index Layering Hierarchy

**Locked Z-Index Values:**
1. **Sticky header controls**: `z-index: 1000` (always on top)
2. **Logo**: `z-index: 999` (below controls, above banner)
3. **Banner**: default z-index (base layer)

**Purpose:**
- Ensures sticky header controls remain clickable when scrolling
- Allows logo to overlap banner area without blocking navigation
- Maintains visual hierarchy across all page states

### Positioning Implementation

**Logo:**
- Position: `absolute` (non-sticky, scrolls with page)
- Top: `8px`
- Left: `16px`
- Z-index: `999`

**Header Controls:**
- Position: `fixed` or `sticky` (remains at top when scrolling)
- Z-index: `1000`
- Centered horizontally (per Section "ADDENDUM — January 20, 2026: Header Layout")

### Component Implementation Reference

**Affected Files:**
- `/src/components/Header.tsx` (Visitor Header)
- `/src/components/MemberHeader.tsx` (Member Header)

**CSS Class Pattern:**
```css
.logo-link {
  position: absolute;
  top: 8px;
  left: 16px;
  z-index: 999;
}

.logo-img {
  height: 240px;
  width: auto;
}

.header-right {
  position: fixed;  /* or sticky */
  z-index: 1000;
}
```

### Behavior Verification

**Required Tests:**
- Logo scrolls out of view when page scrolls (non-sticky confirmed)
- Header controls remain fixed at top when scrolling (sticky confirmed)
- Logo overlaps banner area below header
- All header controls remain clickable at all scroll positions
- Logo click target routes to Home (visitor) or Member Home (member)

### Guardrails

**DO NOT:**
- Change logo z-index to 1000 or higher (blocks header controls)
- Make logo sticky/fixed (must scroll with page)
- Reduce logo size below 240px height
- Center logo horizontally

**DO:**
- Maintain z-index hierarchy (controls > logo > banner)
- Keep logo at 240px height with auto width
- Ensure logo scrolls with page content
- Preserve logo overlap behavior over banner

