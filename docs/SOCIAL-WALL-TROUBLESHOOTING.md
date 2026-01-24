# Social Wall Troubleshooting Guide

## Issue: Text-Only Display (No Images)

The Elfsight social wall widget displays text content from posts but images are not showing.

---

## Diagnostic Steps

### Step 1: Check Browser Console for CSP Violations

1. Open the preview site in a browser
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Look for errors containing "Content Security Policy" or "CSP"

**If you see CSP violations:**
- Note the exact error message
- Identify which resource is being blocked (URL)
- Share this information so we can add the domain to CSP

**If no CSP violations:**
- Move to Step 2

---

### Step 2: Check Network Activity

1. In DevTools, go to the **Network** tab
2. Reload the page (Ctrl+R or Cmd+R)
3. Filter by **Img** to see only image requests

**What to check:**
- Are image requests appearing at all?
- What status codes do they have?
  - **200 (green)** = Success
  - **403/404 (red)** = Blocked or not found
  - **CORS errors** = Cross-origin issue
- What are the URLs of any failed requests?

**Also check JavaScript:**
- Filter by **JS** or **All**
- Verify `https://elfsightcdn.com/platform.js` loads with status 200
- Check if widget scripts are executing

---

### Step 3: Inspect Widget HTML

1. In DevTools, go to the **Elements** or **Inspector** tab
2. Find the div with class `elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8`
3. Expand it to see the widget's generated HTML

**What to check:**
- Are `<img>` tags present in the DOM?
  - **Yes, but not visible**: CSS/styling issue
  - **No**: Widget not generating images (data issue or script issue)
- If images exist, check their `src` attributes - what domains are they loading from?
- Are there any `<iframe>` elements? (Widget might load in iframe)

---

### Step 4: Check CSS/Styling

If images exist in DOM but aren't visible:

1. In Elements tab, select an `<img>` element
2. In the Styles panel (right side), check for:
   - `display: none`
   - `visibility: hidden`
   - `opacity: 0`
   - `width: 0` or `height: 0`
   - Incorrect z-index

---

## Current CSP Configuration

The Content Security Policy includes support for:

### Images (`img-src`)
- Elfsight CDN: `https://*.elfsight.com`
- Instagram: `https://scontent.cdninstagram.com`, `https://scontent-*.cdninstagram.com`, `https://*.cdninstagram.com`
- Facebook: `https://platform-lookaside.fbsbx.com`, `https://*.fbcdn.net`, `https://instagram.*.fbcdn.net`
- X/Twitter: `https://pbs.twimg.com`, `https://*.twimg.com`
- Pinterest: `https://i.pinimg.com`, `https://*.pinimg.com`
- Data URIs: `data:`, `blob:`

### Scripts (`script-src`)
- `'self'`, `'unsafe-inline'`
- `https://static.elfsight.com`, `https://elfsightcdn.com`

### Styles (`style-src`)
- `'self'`, `'unsafe-inline'`
- `https://elfsightcdn.com`

### Frames (`frame-src`)
- `https://*.elfsight.com`

### Connections (`connect-src`)
- `'self'`, `https://*.elfsight.com`

---

## Common Issues & Solutions

### Issue: Images blocked by CSP
**Symptoms**: Console shows CSP violation errors
**Solution**: Add the blocked domain to `img-src` in `public/_headers`

### Issue: Widget not initializing
**Symptoms**: No errors, but widget div is empty
**Solutions**:
- Check if `platform.js` loaded successfully
- Verify widget ID is correct: `805f3c5c-67cd-4edf-bde6-2d5978e386a8`
- Check Elfsight dashboard to ensure widget is published and active

### Issue: CSS not loading
**Symptoms**: Images in DOM but invisible, broken layout
**Solution**: Already fixed - `https://elfsightcdn.com` added to `style-src`

### Issue: CORS errors
**Symptoms**: "Access-Control-Allow-Origin" errors in console
**Solution**: May need to add CORS headers or use Elfsight's official Next.js wrapper

### Issue: Widget displays "This widget is not available"
**Symptoms**: Widget shows error message instead of content
**Solutions**:
- Widget might be expired or unpublished in Elfsight dashboard
- Check Elfsight account status
- Verify widget ID is correct

---

## Alternative: Using Official Next.js Wrapper

If manual script loading continues to have issues, consider migrating to the official `next-elfsight-widget` package (as attempted in PR#276 but rolled back due to CSP issues):

```bash
npm install next-elfsight-widget
```

```tsx
// src/components/SocialWall.tsx
"use client";
import { ElfsightWidget } from "next-elfsight-widget";

export default function SocialWall() {
  return (
    <ElfsightWidget widgetId="805f3c5c-67cd-4edf-bde6-2d5978e386a8" />
  );
}
```

**Requires**: Same CSP configuration as current implementation

---

## Next Steps

Based on diagnostic findings:

1. **If CSP violations found**: Add missing domains to `public/_headers`
2. **If widget not initializing**: Check Elfsight widget configuration
3. **If images exist but hidden**: Debug CSS/styling issues
4. **If specific image URLs failing**: Investigate those specific domains

Please run through the diagnostic steps and share findings in the PR comments.
