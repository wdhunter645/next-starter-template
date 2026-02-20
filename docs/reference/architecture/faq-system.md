# FAQ System Architecture

## Overview

The FAQ (Frequently Asked Questions) system is a complete content management workflow featuring:
- Public-facing FAQ library and search
- User question submission
- Admin moderation and approval
- View tracking and pinning
- Lifecycle management (pending → approved/denied)

## Data Layer

### D1 Database Schema

**Table**: `faq_entries`

```sql
CREATE TABLE IF NOT EXISTS faq_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'approved',  -- approved|pending|denied
  submitter_email TEXT,                     -- added in migration 0027
  view_count INTEGER NOT NULL DEFAULT 0,    -- added in migration 0028
  pinned INTEGER NOT NULL DEFAULT 0,        -- added in migration 0028 (0=no, 1=yes)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_faq_status_updated 
  ON faq_entries(status, updated_at DESC);
```

**Schema Evolution**:
- Migration `0013_faq.sql` - Initial table creation
- Migration `0027_faq_email_and_seed.sql` - Added `submitter_email`, seeded 10 approved FAQs
- Migration `0028_faq_view_count_and_pinned.sql` - Added `view_count` and `pinned` columns

### Status Values

| Status | Description | Visibility | Notes |
|--------|-------------|------------|-------|
| `pending` | Awaiting admin review | Admin only | New submissions default to this |
| `approved` | Published and searchable | Public | Requires non-empty answer |
| `denied` | Rejected by admin | Admin only | Record kept for audit trail |

**Historical note**: Earlier versions used `hidden` status; current implementation uses `denied`.

### View Count Mechanics

- **Incremented**: When user clicks to expand an FAQ item (on homepage or /faq)
- **Scope**: Only approved entries (pending/denied never increment)
- **Implementation**: `POST /api/faq/view` with `{ id }`
- **Client behavior**: Fire-and-forget (doesn't wait for response)
- **V1 simplification**: No deduplication, no session tracking

### Pinned Status

- **Values**: 0 (not pinned), 1 (pinned)
- **Purpose**: Force FAQs to top of lists regardless of view count
- **Admin control**: Toggle via `/admin/faq` UI
- **Ordering impact**: Pinned FAQs always sort first

## API Layer

### Public Endpoints

**`GET /api/faq/list`**
- Query params: `q` (search), `limit` (1-50, default 10)
- Returns: Approved FAQs with non-empty answers only
- Ordering: `pinned DESC, view_count DESC, updated_at DESC`
- Search: Case-insensitive match on question OR answer

**`POST /api/faq/submit`**
- Body: `{ question, email }`
- Validation: question ≥10 chars, email valid format
- Creates: New entry with `status='pending'`, empty answer
- Security: Email not logged to server logs

**`POST /api/faq/view`**
- Body: `{ id }`
- Action: Increments `view_count` by 1 (approved entries only)
- Response: Always `{ ok: true }`

### Admin Endpoints

All require `x-admin-token` header matching `ADMIN_TOKEN` environment variable.

**`GET /api/admin/faq/pending`**
- Returns: All pending entries, newest first
- Fields: id, question, answer, status, submitter_email, view_count, pinned, timestamps

**`GET /api/admin/faq/approved`**
- Returns: All approved entries, ordered by pinned/views/date
- Purpose: Admin management UI (pin/unpin, view stats)

**`POST /api/admin/faq/approve`**
- Body: `{ id, answer }`
- Validation: Answer required (non-empty)
- Action: Sets `status='approved'`, updates `answer` and `updated_at`
- Constraint: Only operates on pending entries

**`POST /api/admin/faq/deny`**
- Body: `{ id }`
- Action: Sets `status='denied'`, updates `updated_at`
- Constraint: Only operates on pending entries
- Note: Keeps record (does not delete)

**`POST /api/admin/faq/pin`**
- Body: `{ id, pinned }` where pinned is 0 or 1
- Action: Updates `pinned` flag, updates `updated_at`
- Constraint: Only operates on approved entries

## Presentation Layer

### Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` (homepage) | `FAQSection` | Top 5 FAQs, search, links |
| `/faq` | `FAQPage` | Full library, search, view tracking |
| `/ask` | `AskPage` | Question submission form |
| `/admin/faq` | `AdminFAQPage` | Pending review, approve/deny, pin/unpin |

### Component Architecture

**`FAQSection` (Homepage)**
- Shows Top 5 FAQs when search is empty
- Shows up to 10 matching FAQs when searching
- Click-to-expand with view count increment
- Links to `/faq` (View all) and `/ask` (Ask a Question)
- If search has results, links to `/faq?q={term}` for full results

**`FAQPage` (/faq)**
- Accepts `?q=` query param to pre-populate search
- Shows up to 50 approved FAQs
- Click-to-expand with view count increment
- Link to `/ask`

**`AskPage` (/ask)**
- Email + Question form
- Validation: email format, question ≥10 chars
- Submit → pending entry
- Cancel → returns to `/faq`
- Success message: "Thanks — your question was submitted for review."

**`AdminFAQPage` (/admin/faq)**
- Token-gated (sessionStorage: `lgfc_admin_token`)
- Pending section: List + Approve/Deny actions
- Approved section: List + Pin/Unpin toggles
- Approval requires answer text input
- Real-time updates after actions

## Data Flow

### User Submission Flow

```
User (/ask) 
  → POST /api/faq/submit { question, email }
    → D1: INSERT status='pending', answer=''
  → Confirmation message shown
  → Entry appears in /admin/faq (pending section)
```

### Admin Approval Flow

```
Admin (/admin/faq)
  → GET /api/admin/faq/pending
    → D1: SELECT WHERE status='pending'
  → Admin types answer
  → POST /api/admin/faq/approve { id, answer }
    → D1: UPDATE status='approved', answer={text}
  → Entry appears on /faq and homepage
```

### View Tracking Flow

```
User clicks FAQ item (homepage or /faq)
  → POST /api/faq/view { id } (fire-and-forget)
    → D1: UPDATE view_count = view_count + 1 WHERE status='approved'
  → Next page load shows updated view_count
```

### Top FAQs Ordering

```
Public pages (/faq, homepage)
  → GET /api/faq/list?limit={5|10|50}
    → D1: SELECT WHERE status='approved' AND answer != ''
          ORDER BY pinned DESC, view_count DESC, updated_at DESC
  → Pinned FAQs appear first
  → Then sorted by popularity (view_count)
  → Then by recency (updated_at)
```

## Security Considerations

### Public API Protection

- Submit endpoint validates email format but does not expose list of submitter emails
- Email not logged to server-side logs (privacy)
- View endpoint only increments approved entries (prevents gaming pending/denied)
- Rate limiting handled by Cloudflare Pages platform

### Admin API Protection

- All admin endpoints require `ADMIN_TOKEN` environment variable
- Token passed via `x-admin-token` header
- Token stored client-side in sessionStorage (not localStorage for better security)
- No admin operations allowed without valid token
- Admin API uses "fail closed" policy (if token not configured, returns 503)

### Content Security

- Public queries filter `status='approved'` AND `answer IS NOT NULL AND answer != ''`
- Prevents accidental exposure of pending/denied entries
- Prevents showing approved entries with empty answers
- Admin queries explicitly select status-specific content

## Performance Characteristics

### Database Queries

- Public list query: Index on `(status, updated_at)` supports filtering and sorting
- View increment: Single UPDATE by primary key (very fast)
- Admin queries: Full table scans acceptable (low volume, admin context)

### Client-Side Rendering

- Homepage FAQ: Loads top 5 on mount, searches up to 10
- /faq page: Loads up to 50 on mount, client-side expand/collapse
- View tracking: Async, doesn't block UI

### API Response Times

- List endpoint: < 100ms typical (small dataset, indexed query)
- Submit endpoint: < 50ms (single INSERT)
- View endpoint: < 20ms (single UPDATE by PK)
- Admin endpoints: < 200ms (acceptable for admin context)

## Migration Strategy

### Idempotent Migrations

All migrations use safe patterns:
- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `ALTER TABLE ADD COLUMN` (SQLite allows adding columns)
- `INSERT ... WHERE NOT EXISTS` for seeding

### Rollback Safety

- Adding columns is non-destructive (existing data preserved)
- Default values ensure compatibility with old code
- Status values are extensible (can add new statuses without schema change)

### Testing Checklist

Before deploying migrations:
- [ ] Local test: `npx wrangler d1 migrations apply lgfc_lite --local`
- [ ] Verify schema: Check columns exist with correct defaults
- [ ] Test API: Submit question, verify pending status
- [ ] Test admin: Approve entry, verify published
- [ ] Test views: Click FAQ, verify count increments
- [ ] Test pinning: Pin FAQ, verify appears first
- [ ] Remote deploy: `npx wrangler d1 migrations apply lgfc_lite --remote`

## Operational Notes

### Monitoring

Key metrics to track:
- Pending questions count (spikes = high user interest or spam)
- Approved FAQs count (should grow over time)
- Average view count per FAQ (engagement metric)
- Denied questions count (quality control metric)

### Maintenance

Periodic admin tasks:
- Review denied entries for patterns (FAQ gaps, common misconceptions)
- Update popular FAQs with better answers
- Pin seasonal FAQs (e.g., Lou Gehrig Day)
- Archive outdated FAQs (change status to denied or delete)

### Future Enhancements

Potential improvements (not in V1):
- View deduplication (cookie or session-based)
- Edit approved FAQs (admin UI)
- FAQ categories/tags
- Search analytics (track popular searches with no results)
- Submitter notifications (email when approved/denied)
- FAQ export/import for migrations
