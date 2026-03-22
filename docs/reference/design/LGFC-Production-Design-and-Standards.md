
---
Doc Type: Design Authority
Audience: Human + AI
Authority Level: Canonical
Owns: Production behavior, routing rules, navigation invariants
Does Not Own: Implementation details inside components
Canonical Reference: /docs/governance/standards/document-authority-hierarchy_MASTER.md
Last Reviewed: 2026-03-15
---

# LGFC Production Design and Standards

This document defines the **production behavior of the Lou Gehrig Fan Club website**.

All implementations must conform to this document.

If any implementation conflicts with this file, **this document wins**.

---

# Navigation Model

Navigation is divided into four logical areas:

Public  
FanClub  
Admin  
Store

---

# Canonical Routes

Public:
/, /about, /contact, /terms, /privacy, /search, /join, /login, /auth, /logout, /faq, /ask, /health

FanClub (auth required):
/fanclub, /fanclub/myprofile, /fanclub/photo, /fanclub/library, /fanclub/memorabilia

Admin:
/admin/**

Store:
external Bonfire link (no /store route)

---

# Public Header (not logged in)

Buttons:

Join  
Search  
Store (external)  
Login

---

# Public Header (logged in)

Buttons:

Club Home  
Search  
Store (external)  
Logout  

(4 total — Club Home replaces Join, Logout replaces Login)

---

# Header Button Mapping

Club Home → /fanclub  
Search → /search  
Store → external Bonfire link  
Logout → /logout  

---

# FanClub Header

Buttons:

Club Home  
My Profile  
Search  
Store (external)  
Logout

---

# Hamburger Menu Behavior

Store is:
A page link in mobile hamburger menus only.

---

# Footer

Purpose:
- Preserve a quiet, public-facing footer that supports legal navigation, light brand anchoring, and rotating historical context without advertising admin surfaces or exposing raw email text.

Structure:

Left
- Rotating quote sourced from the D1-backed footer quote flow
- Copyright line rendered as:
  © {current_year} Lou Gehrig Fan Club

Center
- LG logo
- Behavior: scroll-to-top of the current page
- Must not navigate to `/`

Right
- Row 1: Terms, Privacy
- Row 2: Contact

Behavior Rules:
- Quote content is data-driven, not hardcoded in the design
- Quote pool may include:
  - Lou Gehrig quotes
  - Quotes about Lou Gehrig
- Copyright year is dynamic and derived from the current year
- The right-side layout is intentionally two-row, not one continuous link row

Constraints:
- No Admin link in footer
- No visible email address
- No visible mailto link
- No additional footer links beyond Terms, Privacy, Contact
- Order is fixed:
  - Terms → Privacy
  - Contact on second row

Design Intent:
- Left = rotating historical/editorial context
- Center = visual anchor and return-to-top affordance
- Right = minimal legal/contact utility

---

## Data Model (Cloudflare D1)

The LGFC platform uses **Cloudflare D1** as its primary relational datastore.

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

These tables support the fan club member system, media library, weekly matchup voting, event calendar, memorabilia catalog, and timeline/FAQ content surfaces.

Implementation-level schema definitions and migrations are maintained separately from the design authority.


---
