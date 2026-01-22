# LGFC — Navigation Invariants (Authoritative)

This document is **authoritative**. If any UI or doc contradicts this file, this file wins.

## Global header (public site)
**Header nav labels and order are fixed:**
1. Weekly Matchup → `/weekly`
2. Milestones → `/milestones`
3. Charities → `/charities`
4. News & Q&A → `/news`
5. Calendar → `/calendar`
6. Join → `/member`

## Hamburger menu (global rules)
Hamburger menus list **ONLY standalone pages**.

Hamburger menus must NEVER include:
- Home page sections (e.g., “Charities section”, “Events section”, “Social Wall”)
- Footer-only links (Privacy, Terms)
- Join or Login
- Member-only header buttons


### Hamburger menu interaction behavior
- **Click-away close**: Clicking/tapping outside the open dropdown (but not on the toggle button) closes it.
- **Escape key close**: Pressing Escape when the dropdown is open closes it.
- **Focus restoration**: When closed via click-away or Escape, focus returns to the toggle button.
- **X button**: The X close button remains functional as an explicit close option.
- This behavior applies to all header variants (Visitor and Member) and all breakpoints (desktop/tablet/mobile).
### Visitor hamburger (standalone pages only)
- Home (MOBILE ONLY)
- About
- Contact
- Support → `/support` with `from` query parameter
- Store (external)

### Desktop/tablet hamburger rule
- Desktop/tablet hamburger does **NOT** include Home.
- Home may appear on mobile only.

## Footer (footer-only)
- Privacy → `/privacy`
- Terms → `/terms`
- Contact → `/contact`
- Support → `/support` with `from` query parameter
- Admin → `/admin` (conditional, admin-only)

## Support + Store
- Support routes to `/support` page with `from` query parameter for return-to-source behavior
- Support page:
  - Public intake form for Visitors and Members
  - Email field: required and validated for logged-out users; auto-filled/hidden for logged-in users
  - Optional "Subject detail" field
  - Required "Message" textarea
  - Cancel button: returns to validated `from` path (fallback `/`)
  - Send button: submits server-side email via authorized sender model
  - Success confirmation with explicit return control
- Email envelope (locked):
  - From: `support@lougehrigfanclub.com`
  - To: `lougehrigfanclub@gmail.com`
  - Reply-To: requester's email
  - Subject: `SUPPORT - <requester_email>` or `SUPPORT - <requester_email> - <subject detail>`
  - Body includes: requester email, message, source page (validated `from`), timestamp (ISO)
- Safe `from` validation:
  - Must start with `/`
  - Must not contain `http://`, `https://`, or `//`
  - Invalid/missing values fallback to `/`
- Store is an external link.

## Search
Search appears as a header button **only** if an actual `/search` page exists.
Search must never be placed into the hamburger unless explicitly locked later.
