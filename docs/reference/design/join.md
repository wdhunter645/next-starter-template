# Join Page Specification — LGFC

## Purpose

The `/join` page provides the primary visitor → member intake flow for the Lou Gehrig Fan Club.

**Scope:** This page allows visitors to:
1. Submit a join request with their contact information
2. Opt into the mailing list
3. Receive a welcome email with membership instructions
4. Enable future member area access when authentication is implemented

## Cross-Reference to Authoritative Documentation

**This specification aligns with:**
- `/docs/LGFC-Production-Design-and-Standards.md` — See "6) JOIN — Behavior Lock" for authoritative field definitions and duplicate handling
- `/docs/NAVIGATION-INVARIANTS.md` — Join button placement in header

The authoritative design doc defines:
- Required fields: first_name, last_name, email
- Optional field: screen_name
- Duplicate email handling: 409 response with guidance to use Login
- Welcome email behavior on successful submission

## Route

**Path:** `/join`  
**Accessibility:** Public (no authentication required)  
**Header Button:** "Join" (visitor header, desktop/tablet/mobile)

## Implementation Status

### Current Phase: LGFC-Lite (Cloudflare Pages)
- **Join page**: ✅ IMPLEMENTED at `/src/app/join/page.tsx`
- **Backend API**: ✅ IMPLEMENTED at `/functions/api/join.ts`
- **Database**: ✅ D1 table `join_requests` with required schema
- **Email**: ✅ Welcome email via MailChannels
- **Session creation**: ❌ Deferred to Auth Phase (join creates record only)

## How Join Works

The `/join` page implements a simple contact intake flow:

1. **User fills form** with first name, last name, screen name (optional), email
2. **Client validation** ensures all required fields are present
3. **POST to `/api/join`** (proxied to Cloudflare Function)
   - Validates required fields server-side
   - Checks for duplicate email (case-insensitive)
   - Inserts new record into `join_requests` table
   - Sends welcome email to member
   - Sends notification to admin
4. **On success:**
   - Shows success message: "You're in. Check your inbox for a welcome message."
   - Clears form fields
   - User can submit another join request (e.g., for family member)
5. **On failure (duplicate email):**
   - Shows error: "That email is already registered. Use Login instead."
   - Provides link to `/login`
6. **On failure (other errors):**
   - Shows user-friendly error message
   - Does not crash or expose stack traces

## Required Fields

Per `/docs/LGFC-Production-Design-and-Standards.md` "6) JOIN — Behavior Lock":

### Client-side Required
- **First name** (`first_name`): Text, must be non-empty after trim
- **Last name** (`last_name`): Text, must be non-empty after trim
- **Email** (`email`): Text, must contain "@" and be at least 3 characters

### Optional
- **Screen name** (`screen_name`): Text, optional display name for member interactions

### Hidden (set by server)
- `email_opt_in`: Defaults to `true` (1 in D1)
- `created_at`: Set to `datetime('now')` by D1
- `name`: Computed from `first_name last_name (screen_name)` for legacy compatibility

## Validation Rules

### Client-side Validation
- First name: `first.trim().length > 0`
- Last name: `last.trim().length > 0`
- Email: `email.trim().includes('@') && email.trim().length > 3`
- Submit button disabled until all required fields valid

### Server-side Validation
Implemented in `/functions/api/join.ts`:
- Email required (400 if missing)
- First name and last name required (400 if missing)
- Email normalized to lowercase
- Whitespace trimmed from all fields
- Screen name set to `null` if empty string

## Submission Behavior

### Database Write
- **Table:** `join_requests` (D1)
- **Schema:** See `/migrations/0001_join_requests.sql` and `/migrations/0020_join_requests_profile_fields.sql`
- **Insert Method:** `INSERT...SELECT...WHERE NOT EXISTS` pattern ensures idempotency
- **Duplicate Detection:** Case-insensitive email match via `lower(email) = lower(?)`

### Success Response (200)
```json
{
  "ok": true,
  "status": "joined",
  "requestId": "req_1234567890_abc123",
  "email": {
    "welcome": { "sent": true, "provider": "mailchannels" },
    "admin": { "sent": true, "provider": "mailchannels" }
  }
}
```

### Duplicate Response (409)
```json
{
  "ok": false,
  "status": "already_joined",
  "requestId": "req_1234567890_abc123"
}
```

### Error Response (400/500)
```json
{
  "ok": false,
  "error": "First name and last name are required.",
  "requestId": "req_1234567890_abc123"
}
```

## What Happens on Success

Per `/docs/LGFC-Production-Design-and-Standards.md` "6) JOIN — Behavior Lock":

1. **Database Record Created**
   - New row inserted into `join_requests` table
   - Fields: `first_name`, `last_name`, `screen_name`, `email`, `email_opt_in`, `created_at`
   - Legacy `name` field computed for backward compatibility

2. **Welcome Email Sent** (if email is enabled)
   - **To:** Member email address
   - **Subject:** "Welcome to the Lou Gehrig Fan Club"
   - **Body:** Composed from `/docs/WelcomeEmail.MD` + `/docs/MembershipCard.MD`
   - **CTA:** CONFIRM button (routes to `/login` for validation)
   - Email result logged to `join_email_log` table

3. **Admin Notification Sent** (if email is enabled)
   - **To:** Admin email(s) from `MAIL_ADMIN_TO` env var
   - **Subject:** "New member joined"
   - **Body:** Member name, email, request ID
   - Email result logged to `join_email_log` table

4. **UI Feedback**
   - Success message displayed on page
   - Form fields cleared
   - User can submit another join request

## What Happens on Failure

### Duplicate Email (409)
- **UI Message:** "That email is already registered. Use Login instead."
- **Action:** Provide link to `/login`
- **Database:** No write occurs
- **Email:** No emails sent

### Validation Error (400)
- **UI Message:** Specific error (e.g., "Email is required.")
- **Action:** User corrects form and resubmits
- **Database:** No write occurs
- **Email:** No emails sent

### Server Error (500)
- **UI Message:** "Join request failed. Please try again."
- **Action:** User can retry or contact support
- **Database:** May or may not have written (defensive error handling)
- **Email:** May or may not have sent

## Header/Footer/Navigation State

Per `/docs/NAVIGATION-INVARIANTS.md`:

### Header
- **Visitor header** applies (user is not logged in on `/join`)
- **Desktop/Tablet Buttons:**
  1. Join (current page)
  2. Search
  3. Store (external)
  4. Login
  5. Hamburger
- **Mobile:** Logo + Hamburger only

### Footer
- Same footer as all other pages
- Rotating quote, copyright, links to Terms/Privacy/Contact/Contact

### Navigation Invariants
- `/join` does NOT change header or footer structure
- Hamburger menu does NOT include Join or Login
- Store button opens in new tab

## Rate Limiting / Anti-Spam

**Current Implementation:**
- Duplicate email detection prevents multiple join requests with same email
- Email audit logging via `join_email_log` table for monitoring
- **ZIP 4:** Cloudflare-native rate limiting enforced on write methods for `/api/join` (via `functions/api/_middleware.ts`)

**Not Yet Implemented:**
- CAPTCHA or bot protection (deferred to future phase)

**Defensive Behavior:**
- Join succeeds even if email sending fails (logged but not blocking)
- Duplicate submissions return 409 without error (idempotent)

## Contact Access

Per `/docs/LGFC-Production-Design-and-Standards.md` "7) Contact Access Lock":

- **Contact Button** visible on form
- **Link:** `mailto:Contact@LouGehrigFanClub.com?subject=Contact%20Needed%20JOIN`
- **Subject:** "Contact Needed JOIN" (distinguishes from Login support)

## Technical Implementation

### File Location
- **Page Component:** `/src/app/join/page.tsx`
- **API Function:** `/functions/api/join.ts`
- **Database Migrations:**
  - `/migrations/0001_join_requests.sql` (base table)
  - `/migrations/0020_join_requests_profile_fields.sql` (profile fields)

### Component Type
- **Next.js:** Client Component (`'use client'`)
- **State Management:** React `useState` for form fields and submission state
- **Validation:** `useMemo` for canSubmit calculation

### API Integration
- **Endpoint:** `POST /api/join`
- **Request Body:**
  ```json
  {
    "first_name": "Lou",
    "last_name": "Gehrig",
    "screen_name": "Iron Horse",
    "email": "lou@example.com"
  }
  ```
- **Response:** See "Submission Behavior" section above

### Styling Approach
- **Inline Styles:** Consistent with existing pages
- **CSS Variables:** Uses `var(--lgfc-blue)` for links
- **Responsive:** Mobile-friendly layout via flexbox
- **Form Layout:** CSS Grid with 12px gap

### Cloudflare Runtime Compatibility
- No Node.js-specific APIs used
- Compatible with Cloudflare Pages static export
- D1 database accessed via Cloudflare Workers binding
- Email sent via MailChannels (Cloudflare-compatible)

## Routing Requirements

### Public Accessibility
- ✅ `/join` is publicly accessible
- ❌ No authentication required
- ❌ No middleware redirects

### Navigation Flow
- **From header "Join" button:** Routes to `/join`
- **From `/join` on success:** User remains on `/join` (can submit another)
- **From `/join` on duplicate:** Link to `/login` shown in error message
- **From `/join` "Contact" link:** Opens email draft to support

## Future Phase: Authentication Integration

When member authentication is implemented:

1. **Session Creation on Join:**
   - Successful join may automatically create session
   - User redirected to `/fanclub` (Member Home)
   - No separate login required for first-time access

2. **Email Confirmation:**
   - CONFIRM button in welcome email validates member
   - May require email verification before full member access

3. **Migration Path:**
   - Existing `join_requests` records become member accounts
   - Profile fields already captured for smooth migration

See `/docs/design/phases.md` and `/docs/design/login.md` for phase boundaries.

## Related Documentation

- **Design Standards:** `/docs/LGFC-Production-Design-and-Standards.md` (Section 6)
- **Navigation:** `/docs/NAVIGATION-INVARIANTS.md`
- **Login Spec:** `/docs/design/login.md`
- **Phase Definitions:** `/docs/design/phases.md`
- **Email Content:** `/docs/WelcomeEmail.MD`, `/docs/MembershipCard.MD`
- **API Implementation:** `/functions/api/join.ts`

## Verification Checklist

Before accepting any changes to the join page:

- [x] Page renders at `/join` route
- [x] Form displays first_name, last_name, screen_name, email fields
- [x] Required fields validated client-side
- [x] Submit button disabled until required fields valid
- [x] POST to `/api/join` on form submission
- [x] Success message shown on 200 response
- [x] Duplicate message shown on 409 response
- [x] Error message shown on 400/500 response
- [x] Form fields cleared on success
- [x] Contact link present with correct subject line
- [x] Client component with 'use client' directive
- [x] No Node.js-specific APIs used
- [x] Builds successfully with `npm run build:cf`
- [x] Styling consistent with site design
- [x] Header/footer unchanged from other public pages

## Testing Requirements

### Manual Testing
1. **Success Case:**
   - Fill form with new email
   - Submit
   - Verify success message
   - Check email inbox for welcome message

2. **Duplicate Case:**
   - Fill form with existing email
   - Submit
   - Verify 409 error message
   - Verify link to `/login` appears

3. **Validation Cases:**
   - Submit with missing first name → button disabled
   - Submit with missing last name → button disabled
   - Submit with invalid email (no @) → button disabled
   - Submit with empty email → button disabled

4. **Optional Field:**
   - Submit without screen_name → should succeed

### Automated Testing
- See `/tests/api/join-duplicate-test.mjs` for duplicate email test
- Add E2E tests for form validation (future)
- Add E2E tests for submission flow (future)

## Governance

This specification is **authoritative** for the LGFC-Lite phase.

Any deviation from this spec requires:
1. Explicit discussion and approval
2. Update to `/docs/LGFC-Production-Design-and-Standards.md` if design changes
3. Documentation update in this file
4. PR review and acceptance criteria verification

## Change Log

- **2026-01-22:** Initial specification created for PR implementation
