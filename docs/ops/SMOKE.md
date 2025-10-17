# Smoke Tests

This document provides smoke test commands for validating the application's health and API endpoints.

## Overview

Smoke tests are quick validation checks to ensure critical features are working. Run these after:
- Deployments to production or staging
- Environment configuration changes
- Major code updates

## Prerequisites

```bash
# Set your base URL
export BASE_URL="http://localhost:3000"
# or for production
export BASE_URL="https://your-domain.com"
```

## API Endpoints

### Environment Check

**Endpoint:** `GET /api/env/check`

**Purpose:** Verify which environment variables are configured

**Test:**
```bash
curl -X GET "${BASE_URL}/api/env/check" | jq
```

**Expected Response:**
```json
{
  "status": "ok",
  "variables": [
    { "name": "NEXT_PUBLIC_SUPABASE_URL", "present": true },
    { "name": "NEXT_PUBLIC_SUPABASE_ANON_KEY", "present": true },
    { "name": "SUPABASE_SERVICE_ROLE_KEY", "present": true },
    { "name": "ADMIN_EMAILS", "present": true },
    { "name": "B2_APPLICATION_KEY_ID", "present": true },
    { "name": "B2_APPLICATION_KEY", "present": true },
    { "name": "B2_BUCKET_NAME", "present": true },
    { "name": "B2_ENDPOINT", "present": true }
  ],
  "summary": {
    "total": 8,
    "present": 8,
    "missing": 0
  }
}
```

**Success Criteria:**
- Status code: `200`
- `status`: `"ok"` (all vars present) or `"incomplete"` (some missing)
- No environment variable values are exposed (only presence flags)

### Phase 2 Status

**Endpoint:** `GET /api/phase2/status`

**Purpose:** Overall health check for Phase 2 features

**Test:**
```bash
curl -X GET "${BASE_URL}/api/phase2/status" | jq
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-17T15:30:00.000Z",
  "checks": {
    "supabase": {
      "configured": true,
      "serviceRole": true,
      "status": "ok"
    },
    "admin": {
      "configured": true,
      "status": "ok"
    },
    "storage": {
      "configured": true,
      "status": "ok",
      "optional": true
    }
  },
  "features": {
    "authentication": "available",
    "adminPanel": "available",
    "fileUploads": "available"
  },
  "message": "Phase 2 is operational"
}
```

**Success Criteria:**
- Status code: `200`
- `status`: `"healthy"` (core services configured) or `"degraded"` (missing required services)
- All required features are "available"

### Supabase Status

**Endpoint:** `GET /api/supabase/status`

**Purpose:** Check Supabase configuration

**Test:**
```bash
curl -X GET "${BASE_URL}/api/supabase/status" | jq
```

**Expected Response:**
```json
{
  "status": "configured",
  "hasUrl": true,
  "hasAnonKey": true,
  "hasServiceRoleKey": true
}
```

**Success Criteria:**
- Status code: `200`
- All values are `true`

## Public Pages

Test that all public pages return 200 status codes:

```bash
# Home page
curl -I "${BASE_URL}/" | head -1

# Public feature pages
curl -I "${BASE_URL}/weekly" | head -1
curl -I "${BASE_URL}/milestones" | head -1
curl -I "${BASE_URL}/charities" | head -1
curl -I "${BASE_URL}/news" | head -1
curl -I "${BASE_URL}/calendar" | head -1

# Legal pages
curl -I "${BASE_URL}/privacy" | head -1
curl -I "${BASE_URL}/terms" | head -1

# Member/Admin pages (accessible but may show auth prompts)
curl -I "${BASE_URL}/member" | head -1
curl -I "${BASE_URL}/admin" | head -1
```

**Expected:** All should return `HTTP/... 200 OK`

## Admin API Endpoints (Protected)

These endpoints require authentication. Test with proper credentials:

### B2 Presign (Admin only)

**Endpoint:** `POST /api/admin/b2/presign`

**Test (will return 401 without auth):**
```bash
curl -X POST "${BASE_URL}/api/admin/b2/presign" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test.txt"}' | jq
```

**Expected (without auth):**
```json
{
  "error": "Not authenticated"
}
```

**Status code:** `401` or `503` (if B2 not configured)

### B2 Sync (Admin only)

**Endpoint:** `GET /api/admin/b2/sync`

**Test (will return 401 without auth):**
```bash
curl -X GET "${BASE_URL}/api/admin/b2/sync" | jq
```

**Expected (without auth):**
```json
{
  "error": "Not authenticated"
}
```

**Status code:** `401` or `503` (if B2 not configured)

## Complete Smoke Test Script

Run all smoke tests at once:

```bash
#!/bin/bash
set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
echo "Running smoke tests against: $BASE_URL"

echo "✓ Testing /api/env/check"
curl -sf "${BASE_URL}/api/env/check" > /dev/null

echo "✓ Testing /api/phase2/status"
curl -sf "${BASE_URL}/api/phase2/status" > /dev/null

echo "✓ Testing /api/supabase/status"
curl -sf "${BASE_URL}/api/supabase/status" > /dev/null

echo "✓ Testing public pages"
for page in "/" "/weekly" "/milestones" "/charities" "/news" "/calendar" "/privacy" "/terms"; do
  curl -sf "${BASE_URL}${page}" > /dev/null
  echo "  - ${page}"
done

echo "✓ All smoke tests passed!"
```

Save as `scripts/smoke-test.sh` and run:
```bash
chmod +x scripts/smoke-test.sh
./scripts/smoke-test.sh
```

## Skipping Tests

If some tests cannot be run (e.g., service not configured), document the reason:

**Example:**
```
SKIPPED: B2 storage tests - B2_APPLICATION_KEY_ID not configured in this environment
REASON: Storage is optional for Phase 2, proceeding with core features only
```

## Rollback Plan

All API endpoints are additive:
```bash
git revert <commit-sha>
```

Endpoints can be safely removed without affecting existing functionality.

## Related Documentation

- [Website Buildout Plan](../../README.md) - Parent planning document
- [Auth Gates](./AUTH-GATES.md) - Authentication documentation
- API routes: `src/app/api/`
