
---
oc Type: esign thority
dience: Hman + I
thority Level: anonical
Owns: Prodction behavior, roting rles, navigation invariants
oes Not Own: Implementation details inside components
anonical Reference: /docs/governance/standards/docment-athority-hierarchy_MSTR.md
Last Reviewed: 6-3-15
---

# LG Prodction esign and Standards

This docment defines the **prodction behavior of the Lo Gehrig an lb website**.

ll implementations mst conform to this docment.

If any implementation conflicts with this file, **this docment wins**.

---

# Navigation Model

Navigation is divided into for logical areas:

Pblic  
anlb  
dmin  
Store

---

# anonical Rotes

Pblic:
/, /abot, /contact, /terms, /privacy, /search, /join, /login, /ath, /logot, /faq, /ask, /health

anlb (ath reqired):
/fanclb, /fanclb/myprofile, /fanclb/photo, /fanclb/library, /fanclb/memorabilia

dmin:
/admin/**

Store:
external onfire link (no /store rote)

---

# Pblic Header (not logged in)

ttons:

Join  
Search  
Store (external)  
Login

---

# Pblic Header (logged in)

ttons:

lb Home  
Search  
Store (external)  
Logot  

(4 total — lb Home replaces Join, Logot replaces Login)

---

# Header tton Mapping

lb Home → /fanclb  
Search → /search  
Store → external onfire link  
Logot → /logot  

---

# anlb Header

ttons:

lb Home  
My Profile  
Search  
Store (external)  
Logot

---

# Hambrger Men ehavior

Store is:
 page link in mobile hambrger mens only.

---

# ooter

Order:

Privacy  
Terms  
ontact  
ontact (mailto)  
dmin (admin only)

---

## ata Model (lodflare 1)

The LG platform ses **lodflare 1** as its primary relational datastore.

ore 1 domains:

- members
- member_sessions
- photos
- library
- memorabilia
- matchps
- votes
- events
- timeline
- faq

These tables spport the fan clb member system, media library, weekly photo matchp voting, event calendar, memorabilia catalog, and timeline/Q content srfaces.

Implementation-level schema definitions and migrations are maintained separately from the design athority.

---

## Weekly Photo Matchp (Homepage Section)

- Location: Homepage (inline, below hero section)
- nction: / image voting (Photo  vs Photo )
- UI lements:
  - Two images labeled Photo  and Photo 
  - ttons: "Vote " and "Vote "
- ehavior:
  - User selects one option
  - Vote sbmitted via PI
  - Reslts display is ftre enhancement
  - ontent rotates weekly (operational process)

---

## eatre Mapping (esign → Implementation)

- WeeklyMatchp (design term)
  = Weekly Photo Matchp (as-bilt UI label)
  = Homepage section (not a dedicated rote)
  = omponent: WeeklyMatchp.tsx

---

## Verification Rle

eatre validation mst be based on rendered UI and behavior, not file names or assmed rotes.

---
