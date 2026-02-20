---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Platform Specification
Owns: Cloudflare, D1, B2, platform constraints, platform operational rules
Does Not Own: UI design specifics; PR process; incident response playbooks
Canonical Reference: /docs/reference/platform/CLOUDFLARE.md
Last Reviewed: 2026-02-20
---

# LGFC — D1 DATABASE DESIGN + OPERATIONS GUIDE
Authoritative reference for schema control, migrations, and deployment workflow.

---

# PURPOSE

This document defines:

- How the LGFC D1 database is structured
- How schema changes are deployed
- How migrations are executed
- Where authentication happens
- How to avoid local token/OAuth failures

This is the permanent design record for D1 operations.

️

---

# DATABASE NAME

lgfc_lite

Platform:
Cloudflare D1 (SQLite)

Environment model:
- Local D1 → dev testing
- Remote D1 → production (source of truth)

---

# CURRENT CORE TABLES

### Identity + Access
- members
- member_sessions
- login_attempts
- join_requests
- join_verifications

### Content
- library_entries
- page_content
- page_content_history
- membership_card_content

### Media
- media_assets
- photos

### Engagement
- weekly_matchups
- weekly_votes
- milestones
- events (via page_content/milestones structures)

### Moderation / Safety
- reports  ← NEW

### System
- sqlite_sequence
- v_page_content_live (view)

---

# NEW TABLES ADDED (PHASE 2 AUTH FOUNDATION)

## member_sessions
Server-side auth replacement for localStorage gate.

Fields:
- id (TEXT PK)
- email
- created_at
- expires_at
- last_seen_at
- ip
- ua

Purpose:
- Cookie-based auth session store
- Enables secure FanClub access control

---

## reports
Moderation intake pipeline.

Fields:
- id
- kind
- target_id
- reporter_email
- reason
- status
- admin_note
- created_at
- resolved_at

Purpose:
- Chat reporting
- Photo reporting
- Content reporting

---

# MIGRATION STRATEGY (LOCKED)

ALL schema changes are applied using:

GitHub Actions → Wrangler → D1 Remote

NOT:
- Local CLI
- Codespaces OAuth
- Manual SQL entry

---

# MIGRATION FILE LOCATION

/migrations/

Example:

- 0029_member_sessions.sql
- 0030_reports.sql

Rules:
- Never edit past migrations
- Only add new numbered files
- Always use CREATE TABLE IF NOT EXISTS

---

# DEPLOYMENT WORKFLOW (OFFICIAL METHOD)

Workflow file:

.github/workflows/lgfc-d1-migrate.yml

Trigger:
Manual

Process:
1) GitHub Action runs
2) Uses repo secrets
3) Authenticates to Cloudflare
4) Applies SQL files to REMOTE D1
5) Logs result

---

# REQUIRED REPO SECRETS

Stored in:

GitHub → Settings → Secrets → Actions

Required:

- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID

Token permissions:

Account:
- D1: Edit
- Cloudflare Pages: Edit
- Workers Scripts: Edit
- Workers KV: Edit

Scope:
- Include account
- No IP restriction

---

# WHY THIS METHOD IS LOCKED IN

Codespaces Wrangler login causes:

- OAuth failures
- localhost callback errors
- terminal crashes
- Chromebook incompatibility

GitHub Actions solves this by:

- Running server-side
- Using stored secrets
- Eliminating local auth entirely

This is now the permanent migration method.

---

# HOW TO APPLY FUTURE SCHEMA CHANGES

Step 1:
Create new SQL file in:

/migrations/0031_*.sql

Step 2:
Upload to repo

Step 3:
Open:

GitHub → Actions → LGFC D1 Migrate (remote)

Step 4:
Click:
Run workflow

Step 5:
Verify in:
Cloudflare → D1 → Studio

---

# HOW TO VERIFY TABLE CREATION

Cloudflare Dashboard:

Workers & Pages → D1 → lgfc_lite → Studio

Confirm tables appear in left panel.

---

# AUTH DESIGN DECISION (CRITICAL)

We are transitioning FROM:

localStorage-only login

TO:

server-validated sessions

Backed by:

member_sessions table

This enables:

- Secure FanClub gating
- Role validation
- Admin protection
- Persistent login cookies

---

# ROLE SYSTEM DESIGN

members.role:

- member
- admin

Admin pages will:

- Query DB for role
- NOT rely on token claims

---

# REPORTING PIPELINE DESIGN

Reports table supports:

- Chat message reporting
- Photo reporting
- Article reporting
- Memorabilia reporting

Status flow:

open → reviewed → closed

---

# DATA SAFETY RULES

NEVER:

- Delete tables manually
- Modify schema from Studio
- Run production SQL from local terminal

ALWAYS:

- Use migration files
- Use Actions workflow

---

# RECOVERY MODEL

If schema corruption occurs:

- Re-run migrations
- Tables are IF NOT EXISTS safe
- No destructive changes

---

# CURRENT STATUS (AS OF TODAY)

Confirmed present in production:

✔ member_sessions  
✔ reports  

Auth infrastructure base layer is now installed.

---

# NEXT SYSTEMS DEPENDING ON THIS

Phase 2:
- Secure login
- Session validation
- Role enforcement

Phase 3:
- Chat reporting
- Moderation tools

Phase 4:
- Admin content control

---

# SOURCE OF TRUTH

Production D1 database is authoritative.

Repo migrations define structure.
Actions workflow enforces deployment.
