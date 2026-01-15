# LGFC-Lite Design Locks — January 15, 2026 (SHADOW)

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

## 2) Visitor Header (Public) — Final Lock

### Left → Right
1. **Logo / Home**
2. **JOIN**
3. **Search**
4. **LOGIN**
5. **Hamburger menu**

### Rules
- JOIN is the **only promoted conversion CTA**.
- LOGIN is a utility entry (not promoted as a content section).
- Visitor header is intentionally minimal.

---

## 3) Visitor Hamburger Menu — Final Lock

### Primary menu
- Home
- About
- Contact
- Support (mailto: Support@LouGehrigFanClub.com, subject "Support Needed")

### Member-only resources (visible but gated)
- Library
- Photos
- Memorabilia

Behavior:
- If a visitor selects a member-only resource while logged out → route to LOGIN.

### Home sections (jump links / anchors)
- Charities
- Events
- FAQ

---

## 4) Home CTA Lock (re-affirmed)
- **JOIN** is the only promoted conversion block on Home.
- **LOGIN** is not promoted in page content sections; it exists only in the header + hamburger.

---

## 5) LOGIN — Behavior Lock

### Access points
- Home header has **LOGIN** button; hamburger menu also has **LOGIN**.
- JOIN welcome email **CONFIRM** button links to LOGIN.
- Ask a Question welcome email **CONFIRM** button links to LOGIN.

### Unknown email handling (security + UX)
- If email entered on LOGIN does **not** exist:
  - **Do NOT send any email**
  - Show on-screen: **"Email not found."**
  - Secondary copy: **"If you are not a member yet, join us here"** (link to `JOIN/page.tsx`)
- Rate limit: **max 3 LOGIN attempts per hour per source; after 3 failures, lock for 1 hour.**

---

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

## 11) Members-Only Header — Final Lock

Members-only pages header (left → right):
1. **Large site logo**
2. **My Profile** (button)
3. **Support** (button; mailto Support@LouGehrigFanClub.com, subject "Support Needed")
4. **Logout** (button)
5. **Hamburger menu**

Hamburger menu omits Profile/Support/Logout (already in header) and contains member navigation links.
Members never see JOIN or LOGIN in the header. If not authenticated → route to LOGIN.

---

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
