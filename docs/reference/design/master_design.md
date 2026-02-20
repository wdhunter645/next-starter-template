---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: Routes, navigation invariants, UI/UX contracts, page content contracts
Does Not Own: How-to procedures; operational runbooks; governance policies
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-02-20
---

## Authority & Design Hierarchy

This document is the global model and route authority.

Design hierarchy:
1) docs/design/master_design.md (global model and routes)
2) docs/LGFC-Production-Design-and-Standards.md
3) docs/NAVIGATION-INVARIANTS.md
4) docs/design/RECONCILIATION-NOTES.md
5) docs/design/home.md (defines the homepage page only; not the project)

Mobile/tablet is deferred (halted). Desktop is the only binding target for Day 1.

# MASTER DESIGN — LGFC (REVISED)

Purpose:
High-level blueprint of what the website IS.
Defines structure, sections, routes, and data surfaces.
Detailed implementation lives in next-level docs.

---

## GLOBAL HEADER MODEL

Always 4 buttons + hamburger.

### Public (not logged in)
- Join
- Search
- Store (external)
- Login

### Public (logged in)
- Club Home (replaces Join)
- Search
- Store (external)
- Logout (replaces Login)

### FanClub header
- Club Home
- My Profile
- Search
- Store (external)
- Logout

### Hamburger menu
- About → fan club history

Logo:
- Always visible
- Always links to `/`

Unauthorized access:
- Visiting `/fanclub/**` while logged out → redirect to `/`

---

## HOMEPAGE — STRUCTURE

1. Header
2. Hero / Banner
3. Weekly Matchup (vote entry)
   Data: matchups, photos, votes
4. Join Prompt
5. About Lou Gehrig (new section)
6. Social Wall / Community Signal
7. Discussions Entry
8. Friends / Partners Tiles
9. Calendar Preview
   - Shows next 10 upcoming events from current date
   - Scrollable ±6 months
   Data: events
10. Milestones (baseball only)
    - 1923–1939 career highlights
    - Visitor view only
    Data: timeline (filtered)
11. FAQ Section
    - Search bar
    - Top 5 approved questions
    Links:
      - `/faq` (full list)
      - `/ask` (submit form)
12. Footer

---

## CORE PUBLIC ROUTES

`/`
`/about`
`/contact`
`/faq`
`/ask`
`/search`
`/join`
`/login`
`/auth`
`/logout`

Contact model:
- `/contact` contains both contact + support guidance

Search model:
- `/search` is a real page
- Results render on same page
- Used as unified browsing surface

---

## FANCLUB AREA (AUTH REQUIRED)

Primary entry:
`/fanclub`

### FanClub homepage sections link to:

#### `/fanclub/photo`
- Thumbnail gallery
- Searchable via tags/text
Data:
- photos

#### `/fanclub/library`
- Reading materials list
Columns:
- year
- author
- title
- description/snippet
Data:
- library

#### `/fanclub/memorabilia`
- Thumbnail gallery
- Tag-based search
- Description per item
- Long documents stored in Library with linkage
Data:
- memorabilia
- library

Each page:
- Has keyword search bar at top

### Profile consolidation

#### `/fanclub/myprofile`
Purpose:
- Member profile edit/view
- Membership card section lives here

Top:
- Member-specific data

Bottom:
- Membership card instructions
- Card front/back images

Data:
- members
- member_sessions
- membership_card_content

Route removed:

### Timeline (FanClub only)
- Full Gehrig life + legacy timeline
- Baseball + non-baseball
Data:
- timeline

---

## ADMIN AREA

Admin dashboard links to dedicated management pages:

- `/admin/photos`
- `/admin/library`
- `/admin/memorabilia`

Purpose:
- Create
- Edit
- Tag
- Correct
- Link content

---

## DATA MODEL — HIGH LEVEL

Core D1 domains:

- members
- member_sessions
- photos
- library
- memorabilia
- matchups
- votes
- events
- timeline
- faq

---

## DESIGN INTENT SUMMARY

This document defines:

- What pages exist
- What sections exist
- What users see
- What data powers each surface

Implementation detail, layout rules, and behavior locks live in the next-level design/standards documentation.


- /about page is for Fan Club history (linked from hamburger).


## Footer (single design)

- Left: rotating quote (D1) + legal statement
- Center: small LGFC logo scroll-to-top (height uses both left lines)
- Right: line 1 Terms + Privacy; line 2 Contact
- Support page does not exist.
