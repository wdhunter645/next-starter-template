# Cloudflare Pages Dashboard Update Guide

## 🚨 IMMEDIATE ACTION REQUIRED

The PR build failures will continue until you update the Cloudflare Pages dashboard settings. This is a **manual step** that must be done through the Cloudflare web interface.

## Why This Is Needed

Your Cloudflare Pages project is still configured to use the old OpenNext adapter:
- ❌ Old build command: `npx opennextjs-cloudflare build`
- ❌ Old output directory: `.open-next/worker`

But this PR has changed the build system to use next-on-pages:
- ✅ New build command: `npm run cf:build`
- ✅ New output directory: `.vercel/output/static`

## Step-by-Step Instructions

### 1. Access Cloudflare Dashboard
1. Go to https://dash.cloudflare.com/
2. Log in with your Cloudflare account
3. Click on **Workers & Pages** in the left sidebar

### 2. Select Your Project
1. Find and click on your **next-starter-template** project
2. Click on the **Settings** tab at the top

### 3. Navigate to Build Settings
1. In the Settings page, find **Builds & deployments** section
2. Scroll down to **Build configuration**

### 4. Update Build Settings

Click **Edit** or **Configure** and update these fields:

```
Framework preset: Next.js
Build command: npm run cf:build
Build output directory: .vercel/output/static
Root directory: (leave blank or /)
Node version: 20
```

**Important Notes:**
- Make sure to type **exactly**: `npm run cf:build` (no extra spaces)
- Make sure to type **exactly**: `.vercel/output/static` (no trailing slash)
- Node version should be **20** or **20.x**

### 5. Save Changes
1. Click **Save** or **Save and Deploy**
2. If prompted, confirm the changes

### 6. Trigger a New Deployment

Option A - Automatic (Recommended):
1. Go back to this GitHub PR
2. Make a trivial change (e.g., add a space to README)
3. Push the change - this will trigger a new build with new settings

Option B - Manual:
1. In Cloudflare Pages dashboard, go to **Deployments** tab
2. Find the latest deployment
3. Click the **...** menu → **Retry deployment**

## Verification

After updating and triggering a new deployment:

1. **Check Build Logs** in Cloudflare Pages:
   - Should show: `Running "npm run cf:build"`
   - Should complete successfully
   - Should show: `Build completed in .vercel/output`

2. **Check CI Workflow** in GitHub:
   - The CI workflow should pass ✅
   - All checks should be green

3. **Check Preview URL**:
   - Visit the preview URL provided by Cloudflare
   - Verify the site loads correctly

## Troubleshooting

### Build still fails with "command not found"
- Double-check the build command is exactly: `npm run cf:build`
- Make sure you saved the settings
- Clear browser cache and refresh the page

### Build succeeds but site doesn't work
- Check the output directory is exactly: `.vercel/output/static`
- Verify in the build logs that files are in the correct location

### Changes don't seem to take effect
- Wait 1-2 minutes for settings to propagate
- Try a hard refresh of the Cloudflare dashboard
- Trigger a new deployment (see step 6 above)

## What Happens After Update

Once the dashboard is updated:
- ✅ All future preview builds will use the new build command
- ✅ The CI workflow will pass
- ✅ Preview URLs will work correctly
- ✅ Production deployments will use the new build path

## Need Help?

If you encounter issues:
1. Take a screenshot of your Cloudflare build settings
2. Share the build log from a failed deployment
3. Comment on this PR with the details
