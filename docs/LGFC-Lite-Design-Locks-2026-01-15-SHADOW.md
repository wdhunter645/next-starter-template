# LGFC‑Lite Design Locks — January 15, 2026 (SHADOW)

This document captures the design decisions explicitly locked in the design review thread ending January 15, 2026.
It is additive (does not overwrite existing authoritative docs) and is intended to be maintained via the SHADOW workflow.

---

## 1) Visitor vs Member Boundary

### Entry
- Visitors and members arrive at **`home/page.tsx`** (www.lougehrigfanclub.com).

### Visitor experience (public)
Home page sections, in order:
1. Header
2. Weekly Vote (two photos; rotates weekly)
3. **JOIN** promoted conversion block (only promoted CTA; located directly under Weekly Vote and above Social Wall)
4. Social Wall (Elfsight widget)
5. Recent Discussion teaser (shows last 5–10 items from member Discussions; read‑only teaser)
6. Friends of the Club (tiles for charities and businesses that sponsor/collaborate/benefit)
7. Milestones (Gehrig career timeline)
8. Events Calendar (current month grid)
9. FAQ (preview 5–10; link to full FAQ page)
10. Ask a Question (linked from FAQ; dedicated stub page)
11. Footer

### Members-only
- **All other features** are members-only and accessed from **`MEMBER/page.tsx`**.

---

## 2) Home CTA Lock
- **JOIN** is the only promoted conversion block on Home.
- **LOGIN** is not promoted in page content sections; it exists only as a utility entry (Header + Hamburger).

---

## 3) LOGIN — Behavior Lock

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

## 4) JOIN — Behavior Lock

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

## 5) Support Access Lock
- Header and hamburger menu include **Support** item:
  - mailto: `Support@LouGehrigFanClub.com`
  - subject: **"Support Needed"**
- JOIN page includes Support button:
  - subject: **"Support Needed JOIN"**
- LOGIN page includes Support button:
  - subject: **"Support Needed LOGIN"**

Support is separate from Ask a Question.

---

## 6) Ask a Question — Behavior Lock
- Entry: from FAQ section link **Ask a Question**.
- Form collects same fields as JOIN + freeform question.
- Submitting Ask a Question:
  - Adds the person to the club and sends welcome email with CONFIRM button.
  - Brings the question to admin attention for response via direct email.
- Relationship to FAQ upgraded:
  - Ask-a-Question items should be stored in D1 as an inbox (triage via POST/HIDE).
  - Admin UI provides dropdown to set visibility and manage duplicates.

---

## 7) FAQ — Final Lock
- Retain existing structure: **search + last 10 shown**.
- Backed by D1 canonical FAQ entries (POST only for public).
- Ordering: **most recently answered / updated first**.
- Each question links to a detail view/page for full answer.
- Empty search state includes link to Ask a Question.

---

## 8) Event Calendar — Final Lock

### Content scope
- Calendar entries must be strictly limited to Lou Gehrig’s life, career, and baseball legacy.
- Explicit exclusion: ALS-related discussions, support groups, awareness events, or non‑Gehrig ALS content.

### Update model (v1)
- **Admin‑manual only** (no automated online searching in v1).
- Members may suggest events via email:
  - to: `admin@lougehrigfanclub.com`
  - subject: **"Calendar Event"**
- Display: **current month grid** on Home.
  - Grid does not expand for long titles; titles truncate/ellipsis.
  - Event titles are clickable to open full detail view (date/time, location, host, admission fees optional, description, external link optional).

---

## 9) Members-Only Header — Final Lock
Members-only pages header (left → right):
1. Large site logo
2. My Profile (button)
3. Support (button)
4. Logout (button)
5. Hamburger menu

Hamburger menu omits Profile/Support/Logout (already in header) and contains member navigation links.
Members never see JOIN or LOGIN in the header. If not authenticated → route to LOGIN.

---

## 10) Member Welcome Hero (MEMBER/page.tsx)
- Welcome section is a hero banner: full-width Lou Gehrig image with overlay text:
  - **"WELCOME LOU GEHRIG FAN CLUB MEMBERS!"**
- Banner image is changeable; photos must be tagged for banner eligibility (avoid portraits stretched as banners).

---

## 11) Photo Usage Tagging + Member Profile Picture
- Photos require usage tagging/eligibility (e.g., banner-eligible, decor-eligible, matchup-eligible, profile-avatar-eligible, thumbnail-safe, featured/spotlight).
- Member profile pictures: members select a profile pic from the photo gallery (curated eligibility).
- No uploads for profile pics.

---

## 12) MEMBER/page.tsx Update
- The prior "Member Overview" section is removed from `MEMBER/page.tsx`.
- Account details and overview live exclusively on a dedicated **My Profile** page (accessed via header button).
