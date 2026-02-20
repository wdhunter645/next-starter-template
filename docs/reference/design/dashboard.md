---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: Routes, navigation invariants, UI/UX contracts, page content contracts
Does Not Own: How-to procedures; operational runbooks; governance policies
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-02-20
---

> **STATUS:** INCOMPLETE  
> This document is a working draft and does not yet fully represent the implemented state.

# LGFC — Admin Dashboard Specification  
## Lou Gehrig Fan Club — Admin & CMS UI  
**Version:** 2025-11-16

---

## 1. Purpose and Scope

The **Admin Dashboard** is the primary interface for LGFC administrators and moderators to manage:

- Reported content (core moderation queue).
- Posts (news, Q&A).
- Media assets (B2-backed images).
- Milestones.
- Events (calendar).
- Weekly Matchup configuration.
- Basic user management.
- System health overview.

The dashboard runs **only** on the Vercel members/admin site and provides the UI layer for the Supabase-based CMS.

---

## 2. Location and Access

### URL

- Main entry: `/admin/dashboard`

### Access Control

- Only available on the Vercel-hosted members/admin app.
- Access requires:
  1. Valid Supabase session.
  2. User email present in `ADMIN_EMAILS` env var (primary gate).
- All `/admin/**` routes are protected; Cloudflare public site **never** hosts admin functionality.

### Link from Public Site

- Footer on Cloudflare includes an `Admin` link pointing to the admin endpoint (e.g. `https://members.lougehrigfanclub.com/admin` or `/admin` depending on final routing).
- Until the Vercel admin is fully live, public Cloudflare `/admin` may show a placeholder, but the **real** dashboard is on Vercel.

---

## 3. High-Level Dashboard Structure

The Admin Dashboard is organized into key areas:

1. **Reports** (moderation queue)  
2. **Posts** (news + Q&A)  
3. **Media** (B2-backed assets)  
4. **Milestones**  
5. **Events**  
6. **Weekly Matchup**  
7. **Users**  
8. **System Health**

### Layout

- Left sidebar navigation listing all sections.
- Main content area for tables, forms, and detail panels.
- Top bar with current admin's name/email and a logout action.

---

## 4. Reports (Core Moderation Queue)

The **Reports** view is the central moderation hub.

### Data Source

- Supabase `reports` table, joined with:
  - `profiles` (reporting user)
  - `posts`, `post_comments`, and `media_assets` (depending on target_type)

### List View

Columns:

- Type: `post`, `comment`, or `media`
- Snippet: small preview of the content
- Reporter: name/screen_name of reporting user
- Count: number of reports tied to this target
- Status: `open`, `reviewed`, `dismissed`
- Created: timestamp of earliest report
- Actions: review / open / resolve

### Actions

Admins can:

- Open full context (view post + surrounding thread, or full media context).
- Hide content (temporarily remove from member-facing views).
- Delete content (hard remove with cascading comment removal if required).
- Issue warnings (recorded in log; can be surfaced to user later).
- Dismiss report (mark as no-issue).
- Mark as reviewed (without full delete/hide).

All actions are stored in an `admin_actions` log or equivalent for audit.

---

## 5. Posts Manager

The **Posts** section manages both:

- `news` posts (public announcements)
- `qna` posts (member discussions)

### List View

Columns:

- Type: `news` / `qna`
- Title
- Author (profile link)
- Created date
- Status (published, hidden)
- Comment count

### Detail View

Displays:

- Full title and body.
- Associated media (thumbnails).
- Comments (threaded view).
- Controls for hide/delete/edit.

### Admin Actions

- Edit title/body.
- Hide/unhide post.
- Delete post (with cascade rules for comments defined carefully).
- Optionally pin/unpin posts (future enhancement).
- Convert a post from `qna` to `news` or vice versa (with constraints).

---

## 6. Media Manager

The **Media** section controls images and other media assets stored in B2.

### List View

Columns:

- Thumbnail preview
- Filename or key
- Primary tags (gallery/memorabilia/milestone/etc.)
- Owner (uploading user)
- Uploaded at
- Status (approved/pending)

### Filters

- Tag-based: gallery, memorabilia, milestone, event, matchup, quote, etc.
- Approval status.
- Uploader.

### Detail View

Shows:

- Larger preview.
- All tags and metadata.
- Related posts or milestones using the asset.

### Admin Actions

- Approve or reject images.
- Add/remove tags.
- Delete images (with warnings about breaking references).
- Bulk tag operations.

---

## 7. Milestones Manager

The **Milestones** section manages the historical timeline content.

### List View

Columns:

- Date or year
- Title
- Published status
- Has media? indicator

### Detail View

Fields:

- Title
- Date/Year
- Description (short to medium length)
- Optional media association
- Published toggle (draft vs live)

### Admin Actions

- Add new milestone.
- Edit milestone content.
- Attach/change image.
- Publish/unpublish.
- Reorder (where applicable) or rely on date ordering in queries.

---

## 8. Events / Calendar Manager

The **Events** section manages upcoming and past events that feed the calendar and member views.

### List View

Columns:

- Date
- Name
- Location
- Published status

### Detail View

Fields:

- Title
- Start date/time
- End date/time (optional)
- Location
- Description
- External link (e.g. livestream URL, partner site)
- Related media (optional)
- Published flag

### Admin Actions

- Add events.
- Edit event details.
- Publish/unpublish.
- Delete events.
- Control which events appear in the 30-day MemberPage snapshot.

---

## 9. Weekly Matchup Manager

The **Weekly Matchup** area controls matchup configuration.

### View

Shows:

- Current active matchup.
- Upcoming scheduled matchup(s).
- Historical results summary (optional in later phases).

### Fields for a Matchup

- Title
- Start date/time
- End date/time
- Image A (selected from media assets tagged appropriately)
- Image B
- Description
- Status (draft, scheduled, active, closed)

### Admin Actions

- Configure new matchup by selecting A/B images.
- Schedule start/end times.
- Activate/deactivate matchups.
- Reset votes for a matchup (if needed due to error).
- View high-level results (vote counts A vs B).

---

## 10. Users Manager (Minimal)

The **Users** section provides basic oversight of member accounts.

### List View

Columns:

- Name
- Screen name
- Email
- Joined date
- Status (active/suspended)

### Detail View

Shows:

- Profile fields.
- Recent posts/comments.
- Recent reports involving this user (either as reporter or as target).

### Admin Actions

- Suspend/unsuspend user (soft block: prevent posting).
- Reset screen name.
- Trigger an email re-verification flow (if email change requests are part of the flows).
- View moderation history related to the user.

No deep PII, no exporting of large personal datasets.

---

## 11. System Health

The **System Health** section provides a high-level operational summary.

### Contents

- Supabase connection checks.
- Vercel deployment status (version + last deployment time).
- Cloudflare Pages status (link to latest deployment).
- Backblaze B2 connectivity (basic check on bucket access).
- Elfsight widget status (basic connectivity indication).
- Warnings if critical environment variables are missing.

This is a **read-only diagnostic view** to guide admin troubleshooting and decision-making.

---

## 12. Permissions & Logging

### Access

- Only authenticated users whose email is listed in `ADMIN_EMAILS` can access `/admin/**`.
- RLS and backend policies must ensure that admin-only operations are not reachable by regular members.

### Logging

- All destructive or high-impact actions (delete, hide, warn, change roles) must be logged in an `admin_actions` log or equivalent.
- Logs should capture:
  - Admin user id.
  - Target type and id.
  - Action.
  - Timestamp.
  - Optional reason/comment.

---

## 13. Visual and UX Guidelines

- Use the same LGFC color palette and type scale defined in `/docs/style-guide.md`.
- Maintain a clean, table-and-card-based layout.
- Ensure mobile-friendly layouts for quick moderation on smaller screens.
- Avoid visual overload; prioritize clarity and readability.
- Consistent button styles for primary actions (approve, save, publish, etc.).

---

## 14. Definition of Done

The Admin Dashboard is considered **functionally complete** when:

- All sections defined in this document exist and are reachable.
- Reports queue is fully operational and drives moderation workflow.
- Posts, Media, Milestones, Events, Weekly Matchup, Users, and System Health sections perform their intended CRUD operations end-to-end.
- All admin routes `/admin/**` are properly gated by auth + `ADMIN_EMAILS`.
- Core actions are logged.
- No 404s or dead links in the admin navigation.

Any further enhancements (filters, charts, advanced analytics) must be additive and **must not** break or replace the structure defined here.
