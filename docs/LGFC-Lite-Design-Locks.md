# LGFC Lite Design Locks (Historical)

> **Status:** Historical reference only.
> **Authority:** Non-authoritative. All binding design and standards are consolidated into
> `LGFC-Production-Design-and-Standards.md`.

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

### Members-only
- **All other features** are members-only and accessed from **`MEMBER/page.tsx`**.

---

## 2) Visitor Header (Public) — Final Lock (Updated 2026-01-16)

### Desktop / Tablet header layout
- Layout: **Logo + 3 buttons + Hamburger**
- Sticky: **the 3 buttons + hamburger**
- Not sticky: **the large overlapping logo** (it scrolls away and must not obstruct content)
- Logo destination: **Home**

Buttons (left → right):
1. **Join**
2. **Search**
3. **Login**
4. **Hamburger**

### Visitor hamburger menu (desktop/tablet)
Order:
1. **About**
2. **Contact**
3. **Support** (mailto: Support@LouGehrigFanClub.com, subject: “Support Needed”)

### Mobile header layout
- Visible: **Logo + Hamburger only**
- Sticky: **Hamburger**
- Not sticky: **Logo**
- All header buttons move into the hamburger to save space.

Mobile visitor hamburger order:
1. **Search**
2. **Home**
3. **Join**
4. **About**
5. **Contact**
6. **Support**
7. **Login**

## 3) Visitor Hamburger Menu — Final Lock (Updated 2026-01-16)

### Desktop / Tablet
- About
- Contact
- Support (mailto: Support@LouGehrigFanClub.com, subject: “Support Needed”)

### Mobile
Mobile visitor hamburger order:
1. Search
2. Home
3. Join
4. About
5. Contact
6. Support
7. Login

## 4) Home CTA Lock (re-affirmed)
- **JOIN** is the only promoted conversion block on Home.
- **LOGIN** is not promoted in page content sections; it exists only in the header + hamburger.

---

## LOGIN / LOGOUT — Final Lock (Updated 2026-01-16)

### Login
- Login routes to the Login page.
- Successful login lands on **Member Home**.
- Failed login remains on the Login page and shows an on-page message for **email unknown**.

### Security guardrails (re-affirmed)
- If email entered on Login does not exist: do **not** send any email.
- Show: “Email not found.” and provide a Join link.
- Allow max **3** failed Login attempts per hour per source; lock out for 1 hour after 3 failures.

### Logout
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
- Layout: **Logo + 3 buttons + Hamburger**
- Sticky: **the 3 buttons + hamburger**
- Not sticky: **the large overlapping logo** (it scrolls away and must not obstruct content)
- Logo destination: **Home**

Buttons (left → right):
1. **Member Home**
2. **Search**
3. **Logout**
4. **Hamburger**

My Profile is **not** a header button.

### Member hamburger menu (desktop/tablet)
Order:
1. **My Profile**
2. **Obtain Membership Card**
3. **About**
4. **Contact**
5. **Support** (mailto: Support@LouGehrigFanClub.com, subject: “Support Needed”)

### Mobile header layout
- Visible: **Logo + Hamburger only**
- Sticky: **Hamburger**
- Not sticky: **Logo**
- All header buttons move into the hamburger to save space.

Mobile member hamburger order:
1. **Search**
2. **Home**
3. **Member Home**
4. **My Profile**
5. **Obtain Membership Card**
6. **About**
7. **Contact**
8. **Support**
9. **Login**
10. **Logout** (must be last)

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
