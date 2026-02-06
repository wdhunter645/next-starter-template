# FAQ Design Specification

## Overview

The FAQ (Frequently Asked Questions) section provides users with answers to common questions about the Lou Gehrig Fan Club. The system supports both browsing approved answers and submitting new questions for admin review.

## Architecture

### Database Schema

Table: `faq_entries`

Columns:
- `id` - Primary key (auto-increment)
- `question` - Question text (required)
- `answer` - Answer text (default: empty string)
- `status` - One of: `approved`, `pending`, `hidden` (default: `approved`)
- `submitter_email` - Email address of the person who submitted the question (optional for seeded content, required for user submissions)
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update

### Question Lifecycle

1. **Submission**: User submits a question via the "Ask a Question" form
   - Question must be at least 10 characters
   - Valid email address is required
   - Stored with `status='pending'` and empty `answer`
   
2. **Review**: Admin reviews pending questions (via admin workflow)
   - Admin can approve, hide, or delete questions
   - Admin adds answer text for approved questions
   
3. **Publication**: Approved questions become searchable
   - Only questions with `status='approved'` appear in search results
   - Search matches question text or answer text

## User-Facing Features

### Search

- **Location**: Homepage FAQ section
- **Behavior**: 
  - Searches approved FAQ entries in real-time (debounced)
  - Matches against both question and answer text (case-insensitive)
  - Returns up to 10 results, sorted by most recent
  - Empty state message shown when no matches found
- **Implementation**: `GET /api/faq/list?q={search_term}&limit=10`

### Ask a Question

- **Location**: Homepage FAQ section, below search results
- **Form Fields**:
  - Question textarea (minimum 10 characters)
  - Email input (required, validated for basic format)
  - Submit button (disabled until both fields are valid)
- **Validation**:
  - Question: minimum 10 characters
  - Email: must contain `@` and `.`, maximum 254 characters
- **Success**: Displays confirmation message: "Thanks! Your question was received and queued for review."
- **Note**: Submitted questions do not appear immediately (pending admin review)

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
      "updated_at": "2026-02-06T12:00:00Z"
    }
  ]
}
```

**Behavior**:
- Only returns approved entries (`status='approved'`)
- Search is case-insensitive partial match on question or answer
- Results sorted by `updated_at` descending

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
- Email: must contain `@` and `.`, maximum 254 characters

**Response**:
```json
{
  "ok": true
}
```

**Behavior**:
- Inserts new entry with `status='pending'` and empty `answer`
- Stores `submitter_email` for admin follow-up
- Does not return the created entry (pending approval)

## Admin Workflow

Admin reviews pending questions through the admin interface:

1. View all pending questions (`status='pending'`)
2. For each question:
   - Write an answer
   - Set status to `approved` to publish
   - Or set status to `hidden` to suppress
   - Contact submitter via `submitter_email` if needed
3. Approved answers become immediately searchable

**Note**: Admin workflow tools are documented separately in admin documentation.

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

- FAQ list API endpoint already supports search functionality
- Migration adds `submitter_email` column idempotently (safe for repeated deploys)
- Seeding uses `INSERT ... WHERE NOT EXISTS` to prevent duplicates
- Existing test questions in the database are preserved
- Search results update within 1 second of user input (debounced)
- Email is required for new submissions but optional for historical/seeded entries
