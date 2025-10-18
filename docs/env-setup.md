# Environment Variables Setup Guide

This guide describes all environment variables used in the application, where to set them, and security considerations.

## ⚠️ Security Warning

**NEVER commit secrets to source code.** The `.env` file is private and gitignored. Only the `.env.example` template (with empty values) should be committed to the repository.

## Setting Environment Variables

### Development (Local)
1. Copy `.env.example` to `.env` in the project root
2. Fill in your actual values
3. The `.env` file is automatically loaded by Next.js

### Production (Cloudflare Pages)
1. Navigate to your Cloudflare Pages project dashboard
2. Go to **Settings → Environment variables**
3. Add each variable name and value
4. Choose the appropriate environment (Production, Preview, or both)
5. Save changes

## Environment Variables Reference

### Site Configuration

#### `NEXT_PUBLIC_SITE_URL`
- **Description**: The base URL of your deployed site
- **Example**: `https://yoursite.pages.dev`
- **Required**: Yes
- **Public**: Yes (accessible in browser)
- **Used for**: OAuth callbacks, absolute URLs, sitemap generation

### Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Description**: Your Supabase project URL
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Required**: Optional (only if using Supabase)
- **Public**: Yes (accessible in browser)
- **Where to find**: Supabase Dashboard → Settings → API → Project URL

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Description**: Your Supabase anonymous/public API key (anon key)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Required**: Optional (only if using Supabase)
- **Public**: Yes (accessible in browser)
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
- **Security**: Safe to expose in browser; respects Row Level Security (RLS) policies

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Description**: Your Supabase service role key (server-only, bypasses RLS)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Required**: Optional (only for server-side admin operations)
- **Public**: NO - Server-side only
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`
- **Security**: ⚠️ **CRITICAL** - This key bypasses all Row Level Security. Only use in server-side code that checks admin permissions first.
- **Note**: Current implementation does NOT require this key; it uses the anon key by default for read-only patterns. Only add if you need server-side admin write operations.

### Admin Configuration

#### `ADMIN_EMAILS`
- **Description**: Comma-separated list of email addresses with admin privileges
- **Example**: `admin@example.com,owner@example.com`
- **Required**: Yes (for admin features)
- **Public**: NO - Server-side only
- **Used for**: Authorizing access to admin-only API endpoints and UI

### Backblaze B2 Configuration

All B2 variables are optional. If not configured, B2-related endpoints will return a 503 status with a clear message.

#### `B2_KEY_ID`
- **Description**: Your Backblaze B2 application key ID
- **Example**: `0123456789abcdef0123456789abcdef0123456789`
- **Required**: Optional (only if using B2 storage)
- **Public**: NO - Server-side only
- **Where to find**: Backblaze Dashboard → App Keys → Create App Key

#### `B2_APP_KEY`
- **Description**: Your Backblaze B2 application key secret
- **Example**: `K001abcdefghijklmnopqrstuvwxyz1234567890`
- **Required**: Optional (only if using B2 storage)
- **Public**: NO - Server-side only
- **Security**: ⚠️ Keep this secret; it provides write access to your bucket

#### `B2_BUCKET`
- **Description**: Your Backblaze B2 bucket name or ID
- **Example**: `my-app-media` or `abc123def456`
- **Required**: Optional (only if using B2 storage)
- **Public**: NO - Server-side only

#### `B2_ENDPOINT`
- **Description**: S3-compatible endpoint for your B2 region
- **Example**: `https://s3.us-west-000.backblazeb2.com`
- **Required**: Optional (only if using B2 storage)
- **Public**: NO - Server-side only
- **Where to find**: Backblaze Dashboard → Buckets → Your Bucket → Endpoint
- **Note**: Use the S3-compatible endpoint (not the native B2 API endpoint)

#### `PUBLIC_B2_BASE_URL`
- **Description**: Public CDN or base URL for reading uploaded files
- **Example**: `https://f000.backblazeb2.com/file/my-bucket` or `https://cdn.example.com`
- **Required**: Optional (only if using B2 storage)
- **Public**: Yes (used in browser for file URLs)
- **Note**: No secrets in this URL; it's for public read access only

## Graceful Degradation

The application is designed to work without all environment variables configured:

- **Missing Supabase vars**: `/api/supabase/status` returns status flags but doesn't fail
- **Missing B2 vars**: Admin B2 endpoints return `503` with `{ok: false, reason: "B2 not configured"}`
- **Missing admin emails**: Admin-only endpoints return `401/403` unauthorized

This ensures that:
- CI/CD builds succeed even without secrets
- Preview deployments work without full configuration
- Development can proceed incrementally

## Verification Checklist

After setting environment variables in Cloudflare Pages:

1. ✅ Verify `.env` is gitignored (never committed)
2. ✅ Check `.env.example` has empty values only (no secrets)
3. ✅ Build passes: `npm run build`
4. ✅ Lint passes: `npm run lint`
5. ✅ Test `/api/supabase/status` returns expected flags
6. ✅ Test admin endpoints respond appropriately (401/403/503)

## Troubleshooting

### "Server configuration error"
- Check that required environment variables are set in Cloudflare Pages
- Verify variable names match exactly (case-sensitive)
- Redeploy after changing environment variables

### B2 endpoints return 503
- This is expected if B2 variables are not configured
- Only configure B2 if you need upload functionality
- All B2 variables must be set together (KEY_ID, APP_KEY, BUCKET, ENDPOINT)

### Admin endpoints return 403
- Verify your email is in the `ADMIN_EMAILS` list
- Check that you're authenticated (have a valid session)
- Ensure `ADMIN_EMAILS` is comma-separated with no spaces

## Next Steps

After configuring environment variables:
1. Deploy to Cloudflare Pages
2. Test the deployment at your preview URL
3. Verify API endpoints respond correctly
4. See `docs/staging-runbook.md` for operational procedures
