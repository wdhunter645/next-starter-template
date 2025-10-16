# Cloudflare Web Analytics Setup

This document provides instructions for enabling Cloudflare Web Analytics for the Lou Gehrig Fan Club website.

## Prerequisites

- Cloudflare account with access to the domain
- Domain configured in Cloudflare

## Setup Instructions

### 1. Enable Web Analytics in Cloudflare Dashboard

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account
3. Navigate to **Analytics & Logs** > **Web Analytics**
4. Click **"Add a Site"**
5. Enter your site information:
   - **Site name**: Lou Gehrig Fan Club
   - **Hostname**: www.lougehrigfanclub.com
6. Click **"Save"**
7. Copy the generated **Beacon Token** (you'll need this in the next step)

### 2. Add Analytics Script to the Site (Optional)

Cloudflare Web Analytics can work in two ways:

**Option A: Automatic (Recommended for Cloudflare Pages)**
- If your site is hosted on Cloudflare Pages, analytics are automatically collected
- No code changes required

**Option B: Manual Script Injection**
If you need to manually add the script:

1. Add the script to `src/app/layout.tsx` in the `<head>` section:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Cloudflare Web Analytics */}
        <script 
          defer 
          src='https://static.cloudflareinsights.com/beacon.min.js' 
          data-cf-beacon='{"token": "YOUR_BEACON_TOKEN_HERE"}'
        />
      </head>
      <body className="antialiased">
        <Header />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

Replace `YOUR_BEACON_TOKEN_HERE` with the token from step 1.

### 3. Configure Cache Rules

To optimize performance, configure a cache rule for static assets:

1. In Cloudflare Dashboard, navigate to **Rules** > **Page Rules** or **Cache Rules**
2. Click **"Create Rule"**
3. Configure the rule:
   - **Rule name**: Cache Static Assets
   - **When incoming requests match**: Custom filter expression
   - **Field**: URI Path
   - **Operator**: matches regex
   - **Value**: `/_next/static/.*|/favicon.*|/icons/.*`
4. **Then**:
   - **Cache Status**: Eligible for cache
   - **Edge TTL**: 1 month (2592000 seconds)
   - **Browser TTL**: 1 month (2592000 seconds)
5. Click **"Deploy"**

### 4. Verify Analytics

After deployment:

1. Visit your site: https://www.lougehrigfanclub.com
2. Navigate to multiple pages
3. Return to Cloudflare Dashboard > Analytics & Logs > Web Analytics
4. Verify that pageviews are being recorded (may take a few minutes to appear)

### 5. Verify Cache Performance

To verify that static assets are being cached:

1. Open browser DevTools (F12)
2. Go to the **Network** tab
3. Reload the page
4. Look for static assets (e.g., `/_next/static/*`)
5. Check the response headers for `cf-cache-status: HIT` on subsequent page loads

## Expected Results

### Analytics Dashboard
- Pageviews should appear within 5-10 minutes
- Metrics include:
  - Page views
  - Unique visitors
  - Top pages
  - Referrers
  - Countries
  - Devices/Browsers

### Cache Performance
- First load: `cf-cache-status: MISS` or `DYNAMIC`
- Subsequent loads: `cf-cache-status: HIT`
- Faster load times for cached resources

## Troubleshooting

### Analytics Not Showing Data

1. **Check if script is loaded**: Open DevTools > Network tab, look for `beacon.min.js`
2. **Verify beacon token**: Ensure the token matches the one in Cloudflare Dashboard
3. **Check browser privacy settings**: Some ad blockers may block analytics scripts
4. **Wait longer**: Initial data may take up to 1 hour to appear

### Cache Not Working

1. **Verify rule is active**: Check Cloudflare Dashboard > Rules > Cache Rules
2. **Clear browser cache**: Force a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check URL patterns**: Ensure the regex pattern matches your static asset paths
4. **Review cache headers**: Use DevTools to inspect response headers

## Security Considerations

- Web Analytics beacon does not collect personally identifiable information (PII)
- No cookies are set
- All data is anonymized
- Analytics comply with privacy regulations (GDPR, CCPA)
- The `/admin` route is disallowed in robots.txt for additional privacy

## Additional Resources

- [Cloudflare Web Analytics Documentation](https://developers.cloudflare.com/analytics/web-analytics/)
- [Cache Rules Documentation](https://developers.cloudflare.com/cache/how-to/cache-rules/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
