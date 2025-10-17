# Cache Rules for Cloudflare Pages

This document describes the caching strategy for static assets and API responses to optimize performance.

## Overview

Cloudflare Pages automatically caches static assets, but custom cache rules can fine-tune behavior for optimal performance and freshness.

## Recommended Cache Strategy

### Static Assets (Immutable)
**Pattern**: `/_next/static/*`
- **Cache TTL**: Long (1 year)
- **Browser Cache**: Long
- **Reason**: Next.js content-hashes these files, they're immutable

### Public Assets
**Pattern**: `/favicon.ico`, `/robots.txt`, `/*.png`, `/*.jpg`, `/*.svg`
- **Cache TTL**: Medium (1 day - 1 week)
- **Browser Cache**: Medium
- **Reason**: These change infrequently but may need updates

### HTML Pages
**Pattern**: `/*` (HTML)
- **Cache TTL**: Short (5-15 minutes) or None
- **Browser Cache**: Short or None
- **Reason**: Content updates frequently, need freshness

### API Routes
**Pattern**: `/api/**`
- **Cache TTL**: None (bypass cache)
- **Browser Cache**: None
- **Reason**: Dynamic data, always fetch fresh

## Cloudflare Pages Configuration

Cloudflare Pages provides automatic caching, but you can configure custom rules via:

### Option 1: Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Select your domain
   - Go to Rules → Page Rules OR Cache → Configuration

2. **Create Cache Rule for Static Assets**
   - **If URL matches**: `*yourdomain.com/_next/static/*`
   - **Then**:
     - Cache Level: Standard
     - Edge Cache TTL: 1 year
     - Browser Cache TTL: 1 year

3. **Create Cache Rule for API Routes**
   - **If URL matches**: `*yourdomain.com/api/*`
   - **Then**:
     - Cache Level: Bypass
     - Browser Cache TTL: 0

4. **HTML/Dynamic Content** (Optional)
   - **If URL matches**: `*yourdomain.com/*`
   - **And**: Content-Type equals `text/html`
   - **Then**:
     - Cache Level: Standard
     - Edge Cache TTL: 5 minutes
     - Browser Cache TTL: 0 (or 5 minutes)

### Option 2: `_headers` File (Pages-specific)

Create a `public/_headers` file:

```
# Cache static Next.js assets (content-hashed, immutable)
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

# Cache public assets (moderate TTL)
/*.png
  Cache-Control: public, max-age=86400

/*.jpg
  Cache-Control: public, max-age=86400

/*.svg
  Cache-Control: public, max-age=86400

/favicon.ico
  Cache-Control: public, max-age=86400

# Don't cache API routes
/api/*
  Cache-Control: no-cache, no-store, must-revalidate

# HTML pages - short cache or no cache
/*
  Cache-Control: public, max-age=0, must-revalidate
```

### Option 3: Next.js `next.config.js` Headers (Implemented)

Already configured via `next.config.ts` (if added):

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

**Note**: For this project, relying on Cloudflare Pages' automatic caching + Dashboard rules is sufficient. Next.js already sets appropriate cache headers.

## Cache Verification

### Check Cache Headers

Using `curl`:

```bash
# Check static asset caching
curl -I https://www.lougehrigfanclub.com/_next/static/chunks/main.js

# Look for:
# Cache-Control: public, max-age=31536000, immutable
# CF-Cache-Status: HIT (on subsequent requests)

# Check API route (should not be cached)
curl -I https://www.lougehrigfanclub.com/api/env/check

# Look for:
# Cache-Control: private, no-cache, no-store, must-revalidate
# CF-Cache-Status: DYNAMIC

# Check HTML page
curl -I https://www.lougehrigfanclub.com/

# Look for:
# Cache-Control: public, max-age=0, must-revalidate (or similar)
# CF-Cache-Status: MISS or DYNAMIC
```

### Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check response headers for:
   - `Cache-Control`
   - `CF-Cache-Status` (MISS, HIT, DYNAMIC, BYPASS)
   - `Age` (seconds since cached)

### Cloudflare Dashboard

1. **Analytics → Caching**
   - View cache hit ratio
   - Identify frequently requested assets
   - Check cache performance

2. **Cache → Configuration**
   - Review active cache rules
   - Test cache behavior with Cache Purge

## Cache Purge

### Purge Everything (Use Sparingly)
```bash
# Via Cloudflare API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### Purge Specific Files
```bash
# Purge specific URLs
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://www.lougehrigfanclub.com/favicon.ico"]}'
```

### Purge by Tag or Prefix
For fine-grained control, use Cache-Tag headers (requires Enterprise plan).

## Best Practices

### 1. Long Cache for Immutable Assets
- Next.js `/_next/static/*` files are content-hashed
- Safe to cache for a year (31536000 seconds)
- Browser and CDN can serve without revalidation

### 2. Short or No Cache for Dynamic Content
- HTML pages: Short cache (5-15 min) or no cache
- API routes: Always bypass cache
- User-specific content: Never cache

### 3. Appropriate Browser Cache
- Static assets: Long browser cache
- HTML: Short or no browser cache (revalidate with CDN)
- API: No browser cache

### 4. Cache Purging Strategy
- Deploy: Purge HTML and API cache (leave static assets)
- Content update: Purge affected pages
- Emergency: Purge everything (last resort)

### 5. Monitor Cache Performance
- Check cache hit ratio in Cloudflare Analytics
- Aim for >80% cache hit ratio
- Identify frequently requested uncached resources

## Common Cache Scenarios

### Scenario 1: Deploy New Version
**Problem**: Users see old HTML with new JS chunks (mismatch)

**Solution**:
- Purge HTML pages after deploy
- Static assets remain cached (content-hashed, no conflict)
- Next.js handles chunk loading correctly

### Scenario 2: API Returns Stale Data
**Problem**: API response cached when it shouldn't be

**Solution**:
- Ensure `/api/**` has `Cache-Control: no-cache`
- Check Cloudflare rules don't override API headers
- Use `CF-Cache-Status: DYNAMIC` to verify

### Scenario 3: Image Not Updating
**Problem**: Updated image still shows old version

**Solution**:
- Change filename or add query param: `image.png?v=2`
- Purge specific file via Cloudflare Dashboard
- Or set shorter cache TTL for images

### Scenario 4: Staging vs Production Caching
**Problem**: Staging needs shorter cache for testing

**Solution**:
- Set different cache rules per environment
- Use subdomain-specific rules in Cloudflare
- Or use query param to bypass: `?nocache=true`

## Cache Headers Reference

### Cache-Control Values

```
public             - Can be cached by CDN and browser
private            - Can be cached by browser only (not CDN)
no-cache           - Must revalidate before use
no-store           - Don't cache at all
must-revalidate    - Must check with origin when stale
max-age=3600       - Cache for 3600 seconds
immutable          - Never revalidate (file won't change)
```

### Cloudflare-Specific Headers

```
CF-Cache-Status
- HIT        - Served from Cloudflare cache
- MISS       - Not in cache, fetched from origin
- EXPIRED    - In cache but expired, revalidated
- BYPASS     - Cache explicitly bypassed
- DYNAMIC    - Not cacheable (e.g., API routes)
- REVALIDATED - Cache hit but revalidated with origin

CF-RAY       - Cloudflare request ID (for debugging)
Age          - Seconds since cached
```

## Troubleshooting

### Cache Not Working
1. Check `Cache-Control` headers in response
2. Verify Cloudflare cache rules in dashboard
3. Check for cookies (may prevent caching)
4. Verify content-type is cacheable

### Wrong Content Cached
1. Purge cache for affected URLs
2. Review cache rules (ensure correct patterns)
3. Add `Vary` header if content varies by request header

### Performance Not Improved
1. Check cache hit ratio in analytics
2. Identify frequently requested uncached resources
3. Adjust cache rules to increase hit ratio
4. Consider longer TTLs for static content

## Related Documentation

- [Cloudflare Cache Documentation](https://developers.cloudflare.com/cache/)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [Staging Mirror](./STAGING-MIRROR.md)

## Maintenance

### Regular Review
- **Weekly**: Check cache hit ratio
- **Monthly**: Review cache rules effectiveness
- **After Deploy**: Verify cache purge worked correctly
- **After Issues**: Investigate cache-related problems

### Adjustments
- Tweak TTLs based on update frequency
- Add new patterns as site evolves
- Monitor cache size and invalidation patterns
- Optimize for actual usage patterns

## Notes

- Cloudflare Pages handles most caching automatically
- Dashboard rules provide fine-grained control when needed
- Start conservative (shorter TTLs), increase as confidence grows
- Monitor and adjust based on real-world usage
- Document any custom cache rules for team awareness
