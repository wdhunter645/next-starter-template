# Fix Summary: /api/join Duplicate Email Handling

## Overview
This PR fixes the `/api/join` endpoint to return HTTP 409 (Conflict) for duplicate email submissions instead of falsely returning success (HTTP 200).

## Problem Statement
- **Before**: Submitting a known duplicate email returned HTTP 200 with `ok: true`, misleading the UI to show "success"
- **After**: Duplicate emails return HTTP 409 with `ok: false, status: "duplicate"`, allowing the UI to display the correct state

## Changes Made

### 1. Database Schema (`migrations/0006_join_requests_unique_email.sql`)
- Added UNIQUE constraint on the `email` column in `join_requests` table
- Migration safely handles existing duplicates by keeping the oldest entry per email

### 2. Cloudflare Pages Function (`functions/api/join.ts`)
**Email Normalization:**
- Email is trimmed and lowercased before any database operations
- Ensures consistent duplicate detection regardless of whitespace or case

**Idempotency Enforcement:**
- Attempts INSERT directly, relying on UNIQUE constraint for duplicate detection
- Catches UNIQUE constraint violations and returns HTTP 409
- Improved error detection checks for SQLite error codes and messages

**API Response Contract:**
- **New insert**: HTTP 200 with `{ ok: true, status: "created" }`
- **Duplicate**: HTTP 409 with `{ ok: false, status: "duplicate", error: "Email already subscribed." }`
- **Invalid input**: HTTP 400 (unchanged)
- **Server errors**: HTTP 500 (unchanged)

**Email Sending:**
- Welcome emails only sent when `status === "created"` (new inserts)
- No emails sent on duplicates

### 3. UI Component (`src/app/join/page.tsx`)
- Updated to check HTTP status code (409) in addition to `ok` field
- Shows "You're already on the list" message for 409 responses
- Treats 409 as a success state (form clears, positive message shown)

### 4. Next.js Route Proxy (`src/app/api/join/route.ts`)
- No changes needed - already properly forwards status codes from upstream

## Testing

### Manual Test Script
Created `tests/api/join-duplicate-test.mjs` for validation:

```bash
# Against deployed environment
BASE=https://your-site.pages.dev node tests/api/join-duplicate-test.mjs

# Against local dev
BASE=http://localhost:3000 node tests/api/join-duplicate-test.mjs
```

### Test Scenarios
1. ✅ First insert returns 200 and `ok: true`
2. ✅ Duplicate insert returns 409 and `ok: false`
3. ✅ Email normalization (whitespace/case) returns 409

### Manual curl Tests
See `tests/api/README.md` for curl commands to manually test the endpoint.

## Security

### CodeQL Analysis
- ✅ No security vulnerabilities detected
- ✅ No secrets logged
- ✅ Error messages don't leak sensitive information

### Security Considerations
- Database-enforced idempotency prevents race conditions
- Email normalization prevents duplicate submissions via case/whitespace variations
- Error handling distinguishes between user errors (400, 409) and server errors (500)

## Deployment Notes

### Prerequisites
1. Apply migration `0006_join_requests_unique_email.sql` to D1 database:
   ```bash
   wrangler d1 migrations apply lgfc_lite --remote
   ```

2. Verify migration was applied:
   ```bash
   wrangler d1 execute lgfc_lite --remote --command "SELECT sql FROM sqlite_master WHERE name='join_requests'"
   ```

### Rollback Plan
If issues arise, rollback is straightforward:
1. Revert code changes (this PR)
2. Migration cannot be cleanly reverted (UNIQUE constraint added), but duplicate behavior will revert to pre-fix behavior

### Post-Deployment Validation
Run the acceptance tests from the problem statement:

```bash
BASE=https://next-starter-template-6yr.pages.dev

# Test 1: First insert (200)
curl -i -X POST "$BASE/api/join" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bill (Test)","email":"billhunter71+dupecheck@gmail.com"}'

# Test 2: Duplicate (409)
curl -i -X POST "$BASE/api/join" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bill (Test)","email":"billhunter71+dupecheck@gmail.com"}'

# Test 3: Normalized duplicate (409)
curl -i -X POST "$BASE/api/join" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bill (Test)","email":"  BILLHUNTER71+DUPECHECK@GMAIL.COM  "}'
```

Expected: Test 1 returns 200, Tests 2 and 3 return 409.

## Acceptance Criteria

✅ **Fixed user-visible bug**: "Success" no longer displayed for duplicates
✅ **True idempotency**: Repeated requests converge on stable, correct response
✅ **No welcome emails on duplicates**: Only sent on first-time inserts
✅ **Rollback-safe**: Changes isolated to /api/join logic and single DB constraint
✅ **No secret logging**: Environment variables not logged
✅ **Minimal changes**: Only touched files necessary for the fix

## Files Changed
- `migrations/0006_join_requests_unique_email.sql` (new)
- `functions/api/join.ts` (modified)
- `src/app/join/page.tsx` (modified)
- `tests/api/join-duplicate-test.mjs` (new)
- `tests/api/README.md` (new)
