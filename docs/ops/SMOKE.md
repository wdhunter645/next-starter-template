# Smoke Test Procedures

This document describes the smoke testing procedures for the Next.js Starter Template application.

## Quick Start

Run the automated smoke test script against any deployment:

```bash
# Against production/preview
BASE_URL=https://your-deployment.pages.dev bash scripts/smoke.sh

# Against local dev server
BASE_URL=http://localhost:3000 bash scripts/smoke.sh
```

## Manual Smoke Test Checklist

### Public Pages (All should return 200 OK)

- [ ] `/` - Home page
- [ ] `/weekly` - Weekly content page
- [ ] `/milestones` - Milestones page
- [ ] `/charities` - Charities page
- [ ] `/news` - News page
- [ ] `/calendar` - Calendar page
- [ ] `/social` - Social wall (Elfsight embed)

### API Endpoints

#### Public Endpoints

- [ ] `/api/supabase/status` - Should return 200 with configuration status:
  ```json
  {
    "ok": true,
    "urlSet": <boolean>,
    "anonSet": <boolean>
  }
  ```

#### Admin Endpoints (Auth Required)

These endpoints require authentication and will return specific error codes based on the state:

- [ ] `/api/admin/b2/presign` (POST) - Should return:
  - `401` if not authenticated
  - `403` if authenticated but not authorized
  - `503` if B2 environment variables not configured
  - `400` if missing required fields
  - `200` if authenticated as admin and B2 configured

- [ ] `/api/admin/b2/sync` (GET) - Should return:
  - `401` if not authenticated
  - `403` if authenticated but not authorized
  - `503` if B2 environment variables not configured
  - `200` if authenticated as admin and B2 configured

## Environment Variable Requirements

### Required for Basic Operation

None - the application gracefully degrades when optional services are not configured.

### Required for Full Features

#### Supabase (Optional)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

#### Admin Features
- `ADMIN_EMAILS` - Comma-separated list of admin email addresses

#### Backblaze B2 Storage (Optional)
- `B2_KEY_ID` - B2 application key ID
- `B2_APP_KEY` - B2 application key
- `B2_BUCKET` - B2 bucket name
- `B2_ENDPOINT` - B2 S3-compatible endpoint URL
- `PUBLIC_B2_BASE_URL` - Public base URL for B2 assets

#### GitHub OAuth (Optional)
- `GITHUB_APP_CLIENT_ID` - GitHub App client ID
- `GITHUB_APP_CLIENT_SECRET` - GitHub App client secret
- `GITHUB_APP_ID` - GitHub App ID
- `GITHUB_APP_INSTALLATION_ID` - GitHub App installation ID

## Expected Behaviors

### Graceful Degradation

When environment variables are not configured, the application should:

1. **Admin endpoints without ADMIN_EMAILS**: Return `503 Service Unavailable` with `{"ok": false, "reason": "Admin configuration missing"}`

2. **B2 endpoints without B2 configuration**: Return `503 Service Unavailable` with `{"ok": false, "reason": "B2 not configured"}`

3. **Unauthenticated requests to admin endpoints**: Return `401 Unauthorized` with `{"ok": false, "error": "Not authenticated"}`

4. **Authenticated non-admin requests**: Return `403 Forbidden` with `{"ok": false, "error": "Insufficient permissions"}`

### Security Guardrails

- **Never expose secrets** in API responses
- **Never return 500** for missing configuration (use 503 instead)
- **Never bypass auth** checks even if services are configured
- **Always validate** request bodies before processing

## Troubleshooting

### Smoke Tests Failing

1. **Connection refused**: Is the server running?
   ```bash
   # Start local dev server
   npm run dev
   ```

2. **404 Not Found**: Route may not exist yet. Check the route list in build output.

3. **500 Internal Server Error**: Check server logs for details. This should NOT occur for missing environment variables.

4. **503 Service Unavailable**: Expected when optional services are not configured. Verify environment variables if feature should be available.

### API Endpoints Not Working

1. Check environment variables are set correctly
2. Verify `.env.example` has the required variable names
3. Check server logs for error details
4. For admin endpoints, verify `ADMIN_EMAILS` is set and includes test user's email

## Adding New Routes/APIs

When adding new pages or API endpoints:

1. Add the route to the smoke test script (`scripts/smoke.sh`)
2. Add manual test checklist item to this document
3. Document required environment variables
4. Document expected error behavior when env vars are missing
5. Update `.env.example` with any new environment variable names
