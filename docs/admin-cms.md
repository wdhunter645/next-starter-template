# Admin CMS Documentation

## Overview

The Admin CMS provides a complete content management system for editing page content blocks with a draft/publish workflow and revision history.

**Phase:** 2B (PR 2 of 5)  
**Status:** Active  
**Version:** 1.0.0

---

## Architecture

### Database Schema

The CMS uses two D1 tables created in PR 1:

#### `content_blocks`
Stores the current state of each content block:
- `key` (TEXT, PRIMARY KEY) - Unique identifier (e.g., "home.hero.primary")
- `page` (TEXT) - Page identifier (e.g., "home", "about")
- `section` (TEXT) - Section within page (e.g., "hero", "intro")
- `title` (TEXT) - Human-readable title
- `body_md` (TEXT) - Current draft markdown content
- `status` (TEXT) - Either "draft" or "published"
- `published_body_md` (TEXT, NULL) - Last published markdown content
- `version` (INTEGER) - Incremental version number
- `updated_at` (TEXT) - ISO8601 timestamp of last update
- `published_at` (TEXT, NULL) - ISO8601 timestamp of last publish
- `updated_by` (TEXT) - User who made last update (currently "admin")

#### `content_revisions`
Stores historical versions:
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `key` (TEXT) - References content_blocks.key
- `version` (INTEGER) - Version number
- `body_md` (TEXT) - Markdown content at this version
- `status` (TEXT) - Status when saved ("draft" or "published")
- `updated_at` (TEXT) - ISO8601 timestamp
- `updated_by` (TEXT) - User who created this revision

---

## Security & Access Control

### Admin Gate

All admin routes and API endpoints are protected by the `requireAdminEmail` function in `functions/_lib/auth.ts`.

**Requirements:**
1. Valid `ADMIN_TOKEN` in environment variables
2. Token passed in `x-admin-token` header or `Authorization: Bearer <token>` header
3. Optional: `ADMIN_EMAILS` environment variable (comma-separated list for future use)

**Unauthorized Access:**
- Returns HTTP 401 (Unauthorized) if token is missing or invalid
- Returns HTTP 403 (Forbidden) if email check fails (when implemented)
- Does NOT leak any draft content to unauthorized users

**Environment Variables:**
```bash
ADMIN_TOKEN=your-secure-random-token-here
ADMIN_EMAILS=admin@example.com,editor@example.com  # Optional, for future use
```

---

## Admin UI Routes

### Dashboard: `/admin`

Main admin dashboard with navigation links.

**Features:**
- Link to CMS Content Blocks (`/admin/cms`)
- Link to legacy page content editor

---

### CMS List View: `/admin/cms`

Browse and filter content blocks by page.

**Features:**
- Page filter dropdown (home, about, charities, events, library, photos, memorabilia, join)
- Table showing all blocks for selected page:
  - Key (unique identifier)
  - Title
  - Status (draft/published)
  - Updated timestamp
  - Published timestamp
  - Edit action link
- Client-side ADMIN_TOKEN entry (stored in localStorage)
- Auto-loads blocks when page changes

**UI Flow:**
1. Enter ADMIN_TOKEN (stored locally in browser)
2. Select page from dropdown
3. View list of blocks
4. Click "Edit →" to edit a specific block

---

### Block Editor: `/admin/cms/[key]`

Edit individual content blocks with markdown support.

**Features:**

#### Display
- Block metadata: key, page, section, status, version
- Timestamps: updated_at, published_at
- Editable title field
- Markdown editor textarea (monospace font)
- Live markdown preview panel (sanitized HTML)
- Revision history list (last 20 versions)

#### Actions
- **Save Draft** - Save changes without publishing
- **Publish** - Publish current content (makes it live)
- **Unpublish** - Remove from public view (emergency action)
- **Revert Draft to Published** - Reset draft to last published version
- **Rollback to Revision** - Restore published content to a prior version

#### Workflow
1. Edit title and/or markdown content
2. Preview rendered output
3. Save Draft (creates new revision, increments version)
4. Publish when ready (updates published_body_md, creates published revision)
5. Unpublish if needed (sets status=draft, clears published_body_md)
6. Rollback if needed (restores published content from revision)

---

## Admin API Endpoints

All endpoints require `x-admin-token` header.

### GET `/api/admin/cms?page=<page>`

List all content blocks for a specific page.

**Query Parameters:**
- `page` (required) - Page identifier

**Response:**
```json
{
  "ok": true,
  "blocks": [
    {
      "key": "home.hero.primary",
      "page": "home",
      "section": "hero",
      "title": "Hero Section",
      "status": "published",
      "body_md": "# Welcome",
      "published_body_md": "# Welcome",
      "version": 2,
      "updated_at": "2025-01-10T20:00:00.000Z",
      "published_at": "2025-01-10T20:00:00.000Z",
      "updated_by": "admin"
    }
  ]
}
```

**Error Responses:**
- `400` - Missing page parameter
- `401` - Unauthorized (invalid token)
- `500` - Server error

---

### GET `/api/admin/cms/[key]`

Get a specific content block with revision history.

**Response:**
```json
{
  "ok": true,
  "block": {
    "key": "home.hero.primary",
    "page": "home",
    "section": "hero",
    "title": "Hero Section",
    "status": "published",
    "body_md": "# Welcome",
    "published_body_md": "# Welcome",
    "version": 2,
    "updated_at": "2025-01-10T20:00:00.000Z",
    "published_at": "2025-01-10T20:00:00.000Z",
    "updated_by": "admin"
  },
  "revisions": [
    {
      "id": 2,
      "key": "home.hero.primary",
      "version": 2,
      "body_md": "# Welcome",
      "status": "published",
      "updated_at": "2025-01-10T20:00:00.000Z",
      "updated_by": "admin"
    },
    {
      "id": 1,
      "key": "home.hero.primary",
      "version": 1,
      "body_md": "# Hello",
      "status": "draft",
      "updated_at": "2025-01-10T19:00:00.000Z",
      "updated_by": "admin"
    }
  ]
}
```

**Error Responses:**
- `404` - Block not found
- `401` - Unauthorized
- `500` - Server error

---

### POST `/api/admin/cms/[key]/save-draft`

Save draft changes to a content block.

**Request Body:**
```json
{
  "title": "Updated Title",
  "body_md": "# Updated content"
}
```

**Parameters:**
- `title` (optional) - New title
- `body_md` (required) - Updated markdown content

**Behavior:**
1. Increments version number
2. Updates `body_md`, `title`, `updated_at`, `updated_by`
3. Sets `status='draft'`
4. Does NOT change `published_body_md`
5. Creates new revision in `content_revisions` with status='draft'

**Response:**
```json
{
  "ok": true,
  "version": 3
}
```

**Error Responses:**
- `400` - Missing required body_md
- `404` - Block not found
- `401` - Unauthorized
- `500` - Server error

---

### POST `/api/admin/cms/[key]/publish`

Publish content block (make it live).

**Request Body:**
```json
{
  "title": "Title",
  "body_md": "# Content"
}
```

**Parameters:**
- `title` (optional) - Override title
- `body_md` (optional) - Override body (uses current body_md if omitted)

**Behavior:**
1. Increments version if body changed since last publish
2. Sets `published_body_md` to content being published
3. Sets `body_md` to same content
4. Sets `status='published'`
5. Updates `published_at`, `updated_at`, `updated_by`
6. Creates new revision with status='published'

**Response:**
```json
{
  "ok": true,
  "version": 4
}
```

**Error Responses:**
- `404` - Block not found
- `401` - Unauthorized
- `500` - Server error

---

### POST `/api/admin/cms/[key]/unpublish`

Unpublish content block (emergency remove from public view).

**Request Body:**
```json
{}
```

**Behavior:**
1. Sets `status='draft'`
2. Clears `published_body_md` (sets to NULL)
3. Preserves `body_md` (draft content retained)
4. Updates `updated_at`, `updated_by`
5. Creates revision with status='draft' noting unpublish action

**Response:**
```json
{
  "ok": true
}
```

**Error Responses:**
- `404` - Block not found
- `401` - Unauthorized
- `500` - Server error

---

### POST `/api/admin/cms/[key]/rollback`

Rollback published content to a prior revision.

**Request Body:**
```json
{
  "version": 2
}
```

**Parameters:**
- `version` (required, number) - Target revision version to rollback to

**Behavior:**
1. Finds revision by key and version
2. Sets `published_body_md` to revision's body_md
3. Sets `body_md` to same content
4. Sets `status='published'`
5. Increments version number
6. Updates `published_at`, `updated_at`, `updated_by`
7. Creates new revision with status='published'

**Response:**
```json
{
  "ok": true,
  "version": 5,
  "rolledBackTo": 2
}
```

**Error Responses:**
- `400` - Missing or invalid version parameter
- `404` - Block or revision not found
- `401` - Unauthorized
- `500` - Server error

---

## Draft/Publish Semantics

### Draft State
- `status='draft'`
- `body_md` contains draft content
- `published_body_md` contains last published content (or NULL if never published)
- Public pages should NOT render draft content

### Published State
- `status='published'`
- `body_md` and `published_body_md` are identical
- `published_at` timestamp is set
- Public pages render `published_body_md`

### Workflow States

**New Block (Initial Seed):**
```
status: 'draft'
body_md: seed content
published_body_md: NULL
```

**After First Publish:**
```
status: 'published'
body_md: published content
published_body_md: published content
published_at: timestamp
```

**After Editing (Draft):**
```
status: 'draft'
body_md: new draft content
published_body_md: last published content (unchanged)
```

**After Re-Publishing:**
```
status: 'published'
body_md: new published content
published_body_md: new published content
published_at: new timestamp
```

**After Unpublish (Emergency):**
```
status: 'draft'
body_md: draft content (preserved)
published_body_md: NULL (cleared)
```

---

## Markdown Rendering

### Library
Uses `marked` with `isomorphic-dompurify` for Cloudflare Workers compatibility.

### Security
All markdown is sanitized before rendering:
- Scripts, iframes, and dangerous tags are removed
- Only safe HTML tags allowed (p, h1-h6, ul, ol, li, etc.)
- href and src attributes validated against safe URI patterns
- Prevents XSS attacks

### Functions

**`renderMarkdown(markdown: string): string`**
- Strict sanitization for public rendering
- Allowlist of safe tags and attributes
- Use for public-facing content

**`renderMarkdownPreview(markdown: string): string`**
- Less restrictive for admin preview
- Still forbids scripts, iframes, dangerous event handlers
- Use for admin preview panel

### Usage
```typescript
import { renderMarkdown, renderMarkdownPreview } from '@/lib/markdown';

// For public pages (PR 3)
const html = renderMarkdown(block.published_body_md);

// For admin preview
const html = renderMarkdownPreview(block.body_md);
```

---

## Testing

### Manual Test Checklist

**Unauthorized Access:**
- [ ] Access `/admin/cms` without token → Shows token input, no content leak
- [ ] Access `/api/admin/cms?page=home` without header → 401 response

**Admin Workflow:**
- [ ] Enter ADMIN_TOKEN
- [ ] List blocks for page="home"
- [ ] Click Edit on a block
- [ ] Modify title and body_md
- [ ] Save Draft → Version increments, revision created
- [ ] Verify revision appears in history
- [ ] Publish → Status changes to published, published_at updated
- [ ] Verify published revision created
- [ ] Edit again (creates draft state)
- [ ] Revert Draft to Published → Body reverts to published version
- [ ] Unpublish → Status=draft, published_body_md cleared
- [ ] Rollback to prior version → Published content restored

**Markdown Preview:**
- [ ] Enter markdown with headers, lists, links
- [ ] Toggle preview → Renders correctly
- [ ] Try script tag → Sanitized out
- [ ] Try XSS attempt → Blocked

---

## Future Enhancements

### Authentication
When user auth is added:
- Replace hardcoded "admin" in `updated_by` with actual user email
- Enforce ADMIN_EMAILS allowlist checking
- Add per-user audit trails

### UI Improvements
- Diff view between draft and published
- Rich markdown editor with toolbar
- Image upload integration
- Search/filter across all blocks
- Bulk operations

### Versioning
- Configurable revision retention (currently last 20)
- Export/import revisions
- Compare any two revisions
- Branch/merge workflows

---

## Troubleshooting

### "Admin access is not configured"
- Set `ADMIN_TOKEN` in Cloudflare Pages environment variables
- Redeploy after setting environment variables

### "Unauthorized"
- Verify ADMIN_TOKEN matches environment variable
- Check browser localStorage (`lgfc_admin_token`)
- Verify token is sent in `x-admin-token` header

### Blocks not loading
- Check page parameter matches seeded data
- Verify D1 migrations applied
- Check seed script ran successfully
- Inspect browser network tab for API errors

### Preview not rendering
- Check browser console for errors
- Verify `marked` and `isomorphic-dompurify` installed
- Check markdown syntax is valid

---

## Related Documentation

- [Phase 2 Overview](./website.md)
- [Admin Dashboard Spec](./admin/dashboard.md)
- [D1 Schema Migration](../migrations/0011_cms_content_blocks.sql)
- [CMS Read Helpers](../src/lib/cmsContent.ts)
- [Markdown Utilities](../src/lib/markdown.ts)

---

## Support

For issues or questions:
1. Check this documentation
2. Review console/network errors
3. Verify environment variables
4. Check D1 database state with wrangler CLI
5. Open GitHub issue with detailed error information
