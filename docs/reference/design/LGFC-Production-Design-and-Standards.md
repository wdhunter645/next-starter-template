
---
Doc Type: Design Authority
Audience: Human + AI
Authority Level: Canonical Design
Owns: Production behavior, routing rules, navigation invariants
Does Not Own: Implementation details inside components
Canonical Reference: N/A
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

Order:

Privacy  
Terms  
Contact  
Contact (mailto)  
Admin (admin only)

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
