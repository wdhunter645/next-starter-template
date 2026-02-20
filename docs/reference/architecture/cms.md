---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Architecture Specification
Owns: System architecture, data flows, access model, runtime dependencies
Does Not Own: Operational runbooks; governance policies; UI/UX design specifics
Canonical Reference: /docs/explanation/ARCHITECTURE_OVERVIEW.md
Last Reviewed: 2026-02-20
---

# LGFC — CMS ARCHITECTURE  
## Lou Gehrig Fan Club — Content Management System Architecture  
## (Supabase-Driven CMS for Members/Admin, Cloudflare Static Public)  
**Version:** 2025-11-16

---

## 1. Overview

The Lou Gehrig Fan Club (LGFC) uses a deliberate **dual-host architecture**:

### Cloudflare Pages — Public Site
- Hosts the public website.
- Fully static.
- Delivers:
  - `/` (homepage)
  - `/weekly`
  - `/milestones`
  - `/charities`
  - `/news`
  - `/calendar`
  - `/privacy`
  - `/terms`
- **No CMS, no database, no server-side execution.**
- All public content is defined in Git-managed React files under `src/app/...`.
- Changes to public content occur only via:
  - Pull Requests
  - Commits
  - Approved governance process

Cloudflare is intentionally **static-only**.

### Vercel — Members/Admin Site
- Hosts the dynamic, authenticated members and admin experiences.
- Next.js app connected to Supabase.
- Renders live data from Supabase and Backblaze B2.
- Provides:
  - MemberPage (member home)
  - Discussions
  - Archives (Gallery, Memorabilia, Library)
  - Admin Dashboard
  - Media and event management
- All dynamic content is managed via **Supabase as the CMS**.

---

## 2. CMS Principle: Supabase *is* the CMS

There is **no external CMS** (no Sanity, Contentful, Netlify CMS, HubSpot CMS, WordPress, etc.).

The CMS stack is:

- **Supabase Postgres** — content database.
- **Supabase RLS policies** — access control.
- **Supabase Auth** — membership identity.
- **Backblaze B2 (S3 compatible)** — media file storage.
- **Vercel Admin Dashboard** — editing and moderation interface.
- **Vercel Member flows** — member-facing content creation and interaction.

All structured content is modeled in Supabase tables.  
All media assets live in B2 with metadata in Supabase.

Supabase is the **single source of truth** for dynamic content.

---

## 3. Content Types and Tables

### 3.1 Posts (News + Q&A)

- **Table:** `posts`
- **Purpose:** News articles and fan Q&A topics.
- **Key fields (conceptual):**
  - `id`
  - `created_at`
  - `user_id` (author)
  - `kind` (`news` | `qna`)
  - `title`
  - `body`
  - `media_ids` (array of media asset IDs)
  - `tags` (text[])

**Related table:** `post_comments`  
- Stores replies to posts.
- Fields include `id`, `post_id`, `user_id`, `body`, `media_id`, `created_at`.

**Usage:**
- `/news` (public) shows `kind = 'news'`.
- Member discussions view shows both `news` and `qna` plus comments.
- Admin Dashboard can edit, hide, or delete posts and comments.

---

### 3.2 Media Assets

- **Storage:** Backblaze B2 (S3-compatible endpoint).
- **Metadata:** Supabase `media_assets` table.

**Key fields (conceptual):**
- `id`
- `created_at`
- `b2_key` or `path`
- `public_url`
- `alt_text`
- `tags` (e.g. `gallery`, `memorabilia`, `milestone`, `event`, `matchup`, `quote`)
- `owner_user_id` (optional)

**Usage:**
- Weekly Matchup tiles.
- Photo Gallery.
- Memorabilia Archive.
- Milestone and event visuals.
- Quote cards.
- Post/Comment attachments.

---

### 3.3 Weekly Matchup

- **Tables:**  
  - `matchups`
  - `votes`

**`matchups`:**
- Defines matchups (image A vs image B).
- Fields include `id`, `start_at`, `end_at`, `media_a_id`, `media_b_id`, `title`, `description`.

**`votes`:**
- Tracks member votes.
- Fields include `id`, `matchup_id`, `user_id`, `choice` (`a` | `b`), `created_at`.

**Usage:**
- Public can view matchups (read-only) via Vercel + Cloudflare-integrated pages.
- Members can vote via Vercel member site.
- Admin Dashboard configures upcoming matchups.

---

### 3.4 Milestones

- **Table:** `milestones`
- Represents historical milestones in Lou Gehrig's life and career.

**Key fields:**
- `id`
- `date` (or `year` + `month` where relevant)
- `title`
- `description`
- `media_id` (optional)
- `is_published`

**Usage:**
- Public view on `/milestones` (Cloudflare is static initially; in later phases, can be fed via published data export).
- Member and admin views read dynamically from Supabase.

---

### 3.5 Events / Calendar

- **Table:** `events`

**Key fields:**
- `id`
- `start_at`
- `end_at` (optional)
- `title`
- `location`
- `description`
- `is_published`
- `related_media_id` (optional)

**Usage:**
- Public calendar overview (static content initially, dynamic later).
- MemberPage shows events within the next 30 days.
- Admin Dashboard manages the full event lifecycle.

---

### 3.6 Members and Profiles

- **Auth:** Supabase's built-in auth.
- **Profile table:** `profiles`

**Profiles include:**
- `id` (matches auth user id)
- `name`
- `email`
- `screen_name` (defaults to email or part of it)
- `created_at`

**Constraints:**
- Only these basic fields; no extended PII.
- Email changes must trigger a fresh magic-link verification before updates.

---

### 3.7 Admins and Roles

- Admin identities come from:
  - Env var `ADMIN_EMAILS` (primary gating on Vercel).
  - Optionally a `roles` table (e.g. `role = 'admin' | 'moderator'`).

Admin-only sections under `/admin/**` must verify:
- Valid Supabase session.
- Email is in `ADMIN_EMAILS`.

No admin features on Cloudflare; all admin logic lives on Vercel.

---

### 3.8 Reports

- **Table:** `reports`

**Purpose:** Centralized moderation queue for all reported content.

**Key fields:**
- `id`
- `reported_by_user_id`
- `target_type` (`post`, `comment`, `media`)
- `target_id`
- `reason`
- `status` (`open`, `reviewed`, `dismissed`)
- `created_at`
- `updated_at`

**Usage:**
- Admin Dashboard "Reports" section consumes this table.
- Every report appears in a unified queue.
- Actions (hide, delete, warn, dismiss) are recorded in `admin_actions` or an equivalent log.

---

## 4. Member Interactions

Members, once authenticated via Supabase magic-link, can:

- View and create posts (`qna`, limited `news` if allowed).
- Reply to posts with text and optional media.
- Vote in Weekly Matchup.
- Upload images (within size/type constraints).
- Explore archives:
  - Photo Gallery
  - Memorabilia Archive
  - Library (articles, book references)
- See upcoming events (30-day window from `events` table).
- Manage profile: name, screen_name, email change (with verification).
- Report content for admin review.

All actions originate from the Vercel app and are persisted in Supabase + B2.

---

## 5. Admin Workflows (CMS Controls)

Admins, through the Vercel Admin Dashboard, can:

- Review and act on reported content (Reports queue).
- Edit or remove posts and comments.
- Approve, tag, or remove media assets.
- Manage milestones (add/edit/delete, publish/unpublish).
- Manage events (add/edit/delete, schedule).
- Configure weekly matchups (select images, set windows, reset votes).
- View high-level system health (Supabase, Vercel, Cloudflare, B2 integrations).

---

## 6. Public vs FanClub/Admin Responsibilities

### Cloudflare Public Site
- Static content only.
- No database queries.
- No user auth.
- Change mechanism: PRs and commits only.

### Vercel Members/Admin Site
- All dynamic content and interactivity.
- Reads/writes to Supabase.
- Uses B2 for media.
- Handles auth and session gating.
- Contains MemberPage and Admin Dashboard.

---

## 7. Rationale

This architecture is chosen because:

1. It respects the dual-host design and keeps Cloudflare simple and robust.
2. It centralizes all dynamic content in Supabase, avoiding fragmented CMS tools.
3. It uses B2 for cost-effective, durable media storage.
4. It supports the LGFC mission and future "Character & Courage" fan club expansion.
5. It is compatible with governance automation like Sentinel-Write Bot.
6. It is maintainable long-term with clear separation of concerns.

This CMS architecture is **final and canonical**.  
All implementation work must conform to this design.
