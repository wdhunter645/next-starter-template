# Smoke Test Documentation

This document describes the smoke test suite used to verify that all critical endpoints are functional.

## Overview

The smoke test script (`scripts/smoke.sh`) performs basic availability checks on all public pages and API endpoints. It's designed to run quickly and catch obvious failures.

## Usage

### Local Testing

```bash
# Start the development server
npm run dev

# In another terminal, run smoke tests
BASE_URL=http://localhost:3000 npm run smoke
```

### Production/Staging Testing

```bash
# Test against a deployed environment
BASE_URL=https://your-site.pages.dev npm run smoke
```

## Endpoints Tested

### Public Pages

All public pages should return HTTP 200:

- **`/`** - Home page
- **`/weekly`** - Weekly updates page
- **`/milestones`** - Milestones page
- **`/charities`** - Charities page
- **`/news`** - News & Q&A page
- **`/calendar`** - Calendar page

### API Endpoints

#### `/api/env/check`

Returns environment variable configuration status (without values).

**Expected Response:**
```json
{
  "CLOUDFLARE_ACCOUNT_ID": true,
  "CLOUDFLARE_API_TOKEN": false,
  ...
}
```

**Verification:**
```bash
curl https://your-site.pages.dev/api/env/check
```

#### `/api/phase2/status`

Returns JSON health summary of Phase 2 integrations.

**Expected Response:**
```json
{
  "ok": true,
  "timestamp": "2025-10-17T15:30:00.000Z",
  "services": {
    "supabase": {
      "configured": true,
      "status": "available"
    },
    "b2": {
      "configured": false,
      "status": "not configured"
    },
    ...
  }
}
```

**Verification:**
```bash
curl https://your-site.pages.dev/api/phase2/status
```

## Exit Codes

- **0** - All tests passed
- **1** - One or more tests failed

## Adding New Endpoints

When adding new pages or APIs, update both:
1. The `scripts/smoke.sh` script
2. This documentation file

### Example

```bash
# In scripts/smoke.sh, add:
test_endpoint "/your-new-page"

# In this file, document the endpoint under the appropriate section
```

## CI Integration

The smoke test can be integrated into CI/CD workflows:

```yaml
- name: Run smoke tests
  run: |
    npm run start &
    sleep 5
    npm run smoke
```

## Troubleshooting

### Connection Timeouts

If tests timeout, ensure:
- The server is running
- The BASE_URL is correct
- Firewall rules allow connections

### Non-200 Status Codes

- **401/403** - Authentication required (expected for admin/member pages)
- **404** - Endpoint doesn't exist (check URL spelling)
- **500** - Server error (check logs)
- **503** - Service unavailable (check environment configuration)

## Env-Absent Behavior

When environment variables are not configured:

- **Supabase/B2 endpoints** should return HTTP 503 with `{reason: "service not configured"}`
- **Admin APIs** without auth should return HTTP 401/403 (never 500)
- **Public pages** should always return HTTP 200

This ensures graceful degradation when services are not configured.
