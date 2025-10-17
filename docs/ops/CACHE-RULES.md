# Cloudflare Pages Cache Rules

This document describes recommended cache configuration for optimal performance with Cloudflare Pages and Next.js.

## Overview

Proper caching improves application performance, reduces origin requests, and provides a better user experience. This guide covers:

1. Cloudflare Pages Cache Rules configuration
2. Next.js static asset headers
3. Cache behavior for different content types

## Cloudflare Pages Cache Rules

Configure these rules in your Cloudflare dashboard under **Pages** > **Your Project** > **Cache Rules**.

### Rule 1: Cache Static Assets (Highest Priority)

**Pattern:** `/_next/static/*`

**Actions:**
- **Cache Level:** Cache Everything
- **Edge TTL:** 31536000 seconds (1 year)
- **Browser TTL:** 31536000 seconds (1 year)
- **Cache on Cookie:** Yes

**Rationale:** Next.js static assets are content-hashed and immutable. They can be cached indefinitely.

**Example URL:** `https://yourdomain.com/_next/static/chunks/main-abc123.js`

### Rule 2: Cache Images and Media

**Pattern:** `/images/*` or `*.{jpg,jpeg,png,gif,webp,svg,ico}`

**Actions:**
- **Cache Level:** Cache Everything
- **Edge TTL:** 86400 seconds (1 day)
- **Browser TTL:** 3600 seconds (1 hour)
- **Cache on Cookie:** Yes

**Rationale:** Media files change infrequently but may be updated. Shorter browser cache allows faster updates.

### Rule 3: Bypass API Routes

**Pattern:** `/api/*`

**Actions:**
- **Cache Level:** Bypass
- **Edge TTL:** N/A
- **Browser TTL:** 0 seconds

**Rationale:** API responses are dynamic and should not be cached by Cloudflare edge. This includes:
- `/api/admin/*` - Admin endpoints
- `/api/supabase/*` - Integration status endpoints
- `/api/auth/*` - Authentication callbacks

**Important:** Individual API routes can still use browser cache headers if needed.

### Rule 4: Short TTL for HTML Pages

**Pattern:** `/*.html` or all other requests (default)

**Actions:**
- **Cache Level:** Cache Everything
- **Edge TTL:** 300 seconds (5 minutes)
- **Browser TTL:** 60 seconds (1 minute)
- **Cache on Cookie:** No (respect Vary header)

**Rationale:** HTML pages may change frequently. Short TTL ensures users see recent content while still benefiting from edge caching.

## Configuration via Cloudflare Dashboard

### Step-by-Step Setup

1. **Navigate to Cache Rules**
   ```
   Cloudflare Dashboard > Pages > [Your Project] > Settings > Cache Rules
   ```

2. **Add Rule for Static Assets**
   - Click "Create Rule"
   - Name: "Cache Next.js Static Assets"
   - If: Request URL matches `/_next/static/*`
   - Then:
     - Cache eligibility: Eligible for cache
     - Edge TTL: 1 year
     - Browser TTL: 1 year

3. **Add Rule for API Bypass**
   - Click "Create Rule"
   - Name: "Bypass API Routes"
   - If: Request URL matches `/api/*`
   - Then:
     - Cache eligibility: Bypass cache

4. **Add Rule for HTML**
   - Click "Create Rule"
   - Name: "Short TTL for HTML"
   - If: File extension matches `html`
   - Then:
     - Cache eligibility: Eligible for cache
     - Edge TTL: 5 minutes
     - Browser TTL: 1 minute

5. **Order Rules by Priority**
   - Drag to reorder (most specific first)
   - Priority order:
     1. Static Assets
     2. API Bypass
     3. HTML/Default

## Next.js Configuration

Add cache-friendly headers in `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Cache Next.js static assets immutably
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache public images for 1 day
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      {
        // Prevent caching of API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Header Explanations

**`public, max-age=31536000, immutable`**
- `public`: Can be cached by CDN and browsers
- `max-age=31536000`: Cache for 1 year (31536000 seconds)
- `immutable`: Content never changes (safe to cache forever)

**`public, max-age=86400, s-maxage=86400`**
- `public`: Can be cached by CDN and browsers
- `max-age=86400`: Browser cache for 1 day
- `s-maxage=86400`: CDN cache for 1 day (takes precedence at edge)

**`no-cache, no-store, must-revalidate`**
- `no-cache`: Revalidate with origin before using cached copy
- `no-store`: Don't cache at all
- `must-revalidate`: Don't use stale cache

## Cache Behavior by Content Type

### Static Assets (Optimal Caching)
- **Pattern:** `/_next/static/*`, `*.js`, `*.css`
- **Edge:** 1 year
- **Browser:** 1 year
- **Rationale:** Content-hashed, never changes

### Images (Long Caching)
- **Pattern:** `*.jpg`, `*.png`, `*.webp`
- **Edge:** 1 day
- **Browser:** 1 hour
- **Rationale:** Change occasionally, update within hours

### HTML Pages (Short Caching)
- **Pattern:** `/*.html`, `/`, `/about`
- **Edge:** 5 minutes
- **Browser:** 1 minute
- **Rationale:** Dynamic content, frequent updates

### API Routes (No Caching)
- **Pattern:** `/api/*`
- **Edge:** Bypass
- **Browser:** No cache
- **Rationale:** Always fresh, user-specific data

## Verification

### Test Cache Headers

```bash
# Check static asset headers
curl -I https://yourdomain.com/_next/static/chunks/main.js

# Expected output:
# cache-control: public, max-age=31536000, immutable
# cf-cache-status: HIT

# Check API route headers
curl -I https://yourdomain.com/api/supabase/status

# Expected output:
# cache-control: no-cache, no-store, must-revalidate
# cf-cache-status: DYNAMIC
```

### Cache Status Headers

Cloudflare adds `cf-cache-status` header:
- `HIT`: Served from edge cache
- `MISS`: Not in cache, fetched from origin
- `EXPIRED`: Was cached, but TTL expired
- `DYNAMIC`: Bypassed cache (API routes)
- `BYPASS`: Explicitly bypassed via cache rule

## Performance Impact

With proper caching, you should see:

### Before Optimization
- Static assets: Origin hit every time
- HTML: Origin hit every time
- API: Origin hit (expected)

### After Optimization
- Static assets: 99%+ edge cache hit rate
- HTML: 80-90% edge cache hit rate
- API: 0% cache hit rate (expected)

### Metrics to Monitor

In Cloudflare Analytics:
1. **Cache Hit Ratio** - Target: >85%
2. **Bandwidth Saved** - Measure CDN offload
3. **Origin Requests** - Should decrease significantly
4. **Edge Response Time** - Faster with cache hits

## Advanced Configuration

### Cache by Device Type

```typescript
// In next.config.ts
{
  source: '/mobile/:path*',
  headers: [
    {
      key: 'Vary',
      value: 'User-Agent',
    },
    {
      key: 'Cache-Control',
      value: 'public, max-age=3600',
    },
  ],
}
```

### Purge Cache

**Selective Purge:**
```bash
# Via Cloudflare API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://yourdomain.com/_next/static/chunks/main.js"]}'
```

**Purge Everything:**
- Cloudflare Dashboard > Caching > Configuration > Purge Everything
- Use sparingly (impacts performance temporarily)

### Cache Tags (Enterprise)

If using Cloudflare Enterprise:
```typescript
// Add cache tags to responses
{
  source: '/blog/:slug',
  headers: [
    {
      key: 'Cache-Tag',
      value: 'blog-post',
    },
  ],
}
```

## Troubleshooting

### Issue: Static assets not caching

**Check:**
1. Verify cache rule is active and matches pattern
2. Check origin response headers don't set `Cache-Control: no-cache`
3. Confirm TTL values are correct

**Solution:**
- Update Next.js config to set appropriate headers
- Verify Cloudflare cache rules are ordered correctly

### Issue: Stale content after deployment

**Check:**
1. Edge TTL may be too long for dynamic content
2. Cache wasn't purged after deployment

**Solution:**
- Reduce Edge TTL for frequently changing content
- Add cache purge to deployment pipeline
- Use versioned URLs for assets

### Issue: API responses being cached

**Check:**
1. Verify bypass rule for `/api/*` is active
2. Check rule priority (should be high)
3. Confirm API doesn't set cache headers explicitly

**Solution:**
- Move API bypass rule higher in priority
- Set explicit `no-cache` headers in API responses

## Best Practices

1. **Use content hashing** - Next.js does this automatically for `/_next/static/*`
2. **Cache immutable content aggressively** - Static assets, versioned files
3. **Cache dynamic content conservatively** - HTML pages, user-specific data
4. **Never cache authenticated responses** - Set appropriate headers
5. **Monitor cache hit rates** - Adjust rules based on metrics
6. **Purge cache on deployments** - For non-versioned assets
7. **Test in incognito mode** - Avoid browser cache confusion

## Resources

- [Cloudflare Pages Cache Documentation](https://developers.cloudflare.com/pages/configuration/cache/)
- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [HTTP Caching Headers Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Cache-Control Header Syntax](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)

---

**Note:** These cache rules are recommendations based on typical Next.js deployments. Adjust TTL values based on your specific needs and content update frequency.
