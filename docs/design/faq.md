# FAQ Design Specification

## Overview

The FAQ (Frequently Asked Questions) system provides users with answers to common questions about the Lou Gehrig Fan Club. The system supports browsing approved answers, searching, submitting new questions for admin review, and admin moderation with pinning and view tracking.

## Architecture

### Database Schema

Table: `faq_entries`

Columns:
- `id` - Primary key (auto-increment)
- `question` - Question text (required)
- `answer` - Answer text (default: empty string)
- `status` - One of: `approved`, `pending`, `denied` (default: `approved`)
- `submitter_email` - Email address of the person who submitted the question (optional for seeded content, required for user submissions)
- `view_count` - Number of times the FAQ has been viewed/clicked (default: 0)
- `pinned` - Pin status: 0 (not pinned) or 1 (pinned) (default: 0)
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update

### Question Lifecycle

1. **Submission**: User submits a question via the "Ask a Question" form on `/ask`
   - Question must be at least 10 characters
   - Valid email address is required
   - Stored with `status='pending'` and empty `answer`
   
2. **Review**: Admin reviews pending questions via `/admin/faq`
   - Admin can approve (requires adding answer text) or deny questions
   - Approval sets `status='approved'` and adds answer
   - Denial sets `status='denied'` (keeps record but never shows publicly)
   
3. **Publication**: Approved questions become searchable on `/faq` and homepage
   - Only questions with `status='approved'` AND non-empty `answer` appear publicly
   - Search matches question text or answer text (case-insensitive)
   - Admin can pin approved FAQs to appear at the top

4. **View Tracking**: When users click/expand an FAQ item
   - `view_count` increments by 1
   - Only counts views on approved entries
   - Used for sorting "Top FAQs"

## User-Facing Features

### Homepage FAQ Section

- **Location**: Homepage, bottom section
- **Features**: 
  - Search input for filtering FAQs
  - Displays Top 5 FAQs (when search is empty)
  - Displays up to 10 matching FAQs (when search has text)
  - Click to expand/collapse answer
  - "View all FAQs" link → `/faq`
  - "Ask a Question" link → `/ask`
  - If search has results, shows "View all results" link to `/faq?q={term}`
- **Top FAQs Ordering**: 
  - Pinned first (`pinned DESC`)
  - Then by view count (`view_count DESC`)
  - Then by update time (`updated_at DESC`)
- **Implementation**: `GET /api/faq/list?limit=5` (or 10 when searching)

### /faq - Full FAQ Library

- **Route**: `/faq`
- **Features**:
  - Search input (pre-populated from `?q=` query param if present)
  - Full list of approved FAQs (up to 50)
  - Click question to expand/collapse answer
  - View count increments on expand
  - "Ask a Question" link → `/ask`
- **Ordering**: Same as homepage (pinned DESC, view_count DESC, updated_at DESC)
- **Implementation**: `GET /api/faq/list?limit=50&q={search}`

### /ask - Question Submission

- **Route**: `/ask`
- **Form Fields**:
  - Email input (required, validated)
  - Question textarea (minimum 10 characters, required)
  - Submit button (disabled until both fields are valid)
  - Cancel button (returns to `/faq`)
- **Validation**:
  - Email: basic format check (must contain `@` and `.`), max 254 characters
  - Question: minimum 10 characters
- **Success**: Displays confirmation: "Thanks — your question was submitted for review."
- **Note**: Submitted questions do not appear immediately (pending admin review)
- **Security**: Email is not logged to server logs

## API Endpoints

### List FAQs

**Endpoint**: `GET /api/faq/list`

**Query Parameters**:
- `q` (optional) - Search term to filter questions/answers
- `limit` (optional) - Maximum results to return (default: 10, max: 50)

**Response**:
```json
{
  "ok": true,
  "items": [
    {
      "id": 1,
      "question": "What is the Lou Gehrig Fan Club?",
      "answer": "The Lou Gehrig Fan Club brings fans together...",
      "view_count": 42,
      "pinned": 1,
      "updated_at": "2026-02-06T12:00:00Z"
    }
  ]
}
```

**Behavior**:
- Only returns approved entries with non-empty answers (`status='approved' AND answer IS NOT NULL AND answer != ''`)
- Search is case-insensitive partial match on question or answer
- Results sorted by: `pinned DESC, view_count DESC, updated_at DESC`

### Submit Question

**Endpoint**: `POST /api/faq/submit`

**Request Body**:
```json
{
  "question": "How do I become a member?",
  "email": "user@example.com"
}
```

**Validation**:
- Question: minimum 10 characters
- Email: basic format validation, maximum 254 characters

**Response**:
```json
{
  "ok": true
}
```

**Behavior**:
- Inserts new entry with `status='pending'` and empty `answer`
- Stores `submitter_email` for admin reference
- Does not log email to server logs
- Does not return the created entry (pending approval)

### Increment View Count

**Endpoint**: `POST /api/faq/view`

**Request Body**:
```json
{
  "id": 1
}
```

**Validation**:
- `id` must be a valid positive integer

**Response**:
```json
{
  "ok": true
}
```

**Behavior**:
- Increments `view_count` by 1 ONLY for approved entries
- Does not increment for pending/denied entries
- Called when user clicks to expand an FAQ item
- Silently fails on client side (view count is not critical)

## Admin Features

### Admin FAQ Management

**Route**: `/admin/faq`

**Authentication**: Requires admin token (stored in sessionStorage as `lgfc_admin_token`)

**Features**:

1. **Pending Questions Section**
   - Lists all pending questions newest-first
   - Displays: question, submitter email, created date
   - For each pending entry:
     - "Approve..." button → opens answer textarea
     - "Deny" button → sets status to denied
   - Approval requires answer text (cannot approve without answer)
   - Denied entries never appear publicly but record is kept

2. **Approved FAQs Section**
   - Lists all approved FAQs by top ordering (pinned/views/date)
   - Displays: question, answer, view count, pinned status
   - For each approved entry:
     - "Pin" / "Unpin" toggle button
     - Shows 📌 icon when pinned

**Admin API Endpoints**:
- `GET /api/admin/faq/pending` - List pending entries
- `GET /api/admin/faq/approved` - List approved entries
- `POST /api/admin/faq/approve` - Approve with answer (`{ id, answer }`)
- `POST /api/admin/faq/deny` - Deny entry (`{ id }`)
- `POST /api/admin/faq/pin` - Toggle pin status (`{ id, pinned }`)

All admin endpoints require `x-admin-token` header matching `ADMIN_TOKEN` environment variable.

## Page Routes

| Route | Purpose | Features |
|-------|---------|----------|
| `/` (homepage) | FAQ section | Top 5 FAQs, search, links to /faq and /ask |
| `/faq` | Full FAQ library | All approved FAQs, search, click to expand, view tracking |
| `/ask` | Question submission | Email + question form, submit to pending |
| `/admin/faq` | Admin moderation | Pending review, approve/deny, pin/unpin approved |

## View Count Definition

"Click = View" - A view is counted when:
- User clicks an FAQ item to expand/reveal the answer
- On both homepage FAQ section and `/faq` page
- Only for approved entries
- No deduplication (same user can increment multiple times)
- V1 implementation: simple, no cookies or session tracking

## Seeded Content

The system includes 10 pre-approved FAQ entries covering common topics:
- Club overview and membership
- Lou Gehrig Day
- ALS policy
- Contact and support
- Store information
- Weekly Matchup
- FAQ submission process
- Member contributions

These entries are seeded via migration `0027_faq_email_and_seed.sql` and preserved across deployments.

## Implementation Notes

- FAQ list API endpoint supports search and new ordering
- Migrations `0027` and `0028` add all required columns idempotently
- Seeding uses `INSERT ... WHERE NOT EXISTS` to prevent duplicates
- Homepage shows Top 5, /faq shows up to 50
- Search results are immediate (no debouncing on server side)
- View tracking is fire-and-forget (client doesn't wait for response)
- Pinned FAQs always appear first regardless of view count
- Denied entries never appear publicly but are kept for admin records
