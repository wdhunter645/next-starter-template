---
Doc Type: TBD
Audience: Human + AI
Authority Level: TBD
Owns: TBD
Does Not Own: TBD
Canonical Reference: TBD
Last Reviewed: 2026-02-20
---

# CLOUDFLARE — Resource Inventory (LGFC)

This document captures what currently exists in Cloudflare for the LGFC deployment (design + resource inventory only).

---

## Cloudflare Pages

**Project:** `next-starter-template`  
**Connected repo:** `wdhunter645/next-starter-template`  
**Production branch:** `main`  
**Automatic deployments:** enabled  
**Domains:**  
- `next-starter-template-6yr.pages.dev`  
- `www.lougehrigfanclub.com`

---

## Cloudflare D1 (SQLite)

**Database name:** `lgfc_lite`  
**Database UUID:** `22d0dc3e-ad34-43af-8e6a-2063df1a1e04`  

**Database inventory (as shown in D1 Studio sidebar):**
- 
admin_team_worklist- content_blocks- content_revisions- d1_migrations- discussions- events- faq_entries- footer_quotes- friends- join_email_log- join_requests- join_verifications- library_entries- login_attempts- media_assets- member_sessions- members- membership_card_content- milestones- page_content- page_content_history- photos- reports- sqlite_sequence- v_page_content_live- weekly_matchups- weekly_votes- welcome_email_content

**Notes about the inventory list**
- The UI also shows internal SQLite objects (example: `sqlite_sequence`) and at least one view (`v_page_content_live`), in addition to normal tables.

---

## Cloudflare platform areas visible in the account UI (not enumerated here)

- Workers & Pages  
- D1 SQL database  
