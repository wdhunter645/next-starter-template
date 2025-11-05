# Deployment Guide

## Overview

This Next.js application is designed to be deployed on Cloudflare Pages using GitHub Actions for automated deployment. The application uses the **OpenNext Cloudflare adapter** (`@opennextjs/cloudflare`) for compatibility with Next.js 15 and React 19.

### Build Adapter

This project uses `@opennextjs/cloudflare` instead of the deprecated `@cloudflare/next-on-pages`. The OpenNext adapter provides:
- Full Next.js 15 and React 19 compatibility
- Better runtime performance on Cloudflare Pages
- Active maintenance and support
- Proper server-side rendering (SSR) and static site generation (SSG)

The build process:
1. Runs `next build` to compile the Next.js application
2. Runs `opennextjs-cloudflare build` to transform output for Cloudflare
3. Runs `prepare-pages-deployment.js` script to create Pages-compatible structure
4. Deploys `.open-next/worker/` directory to Cloudflare Pages

## Prerequisites

- Cloudflare account with Pages enabled
- GitHub repository with Actions enabled
- Cloudflare API token with appropriate permissions

## Cloudflare Setup

### 1. Create Cloudflare API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token" or "Create Custom Token"
3. Configure the following permissions:
   - **Account → Cloudflare Pages → Edit**
   - **User → User Details → Read**
4. Set token expiration (recommended: 90 days or custom)
5. Click "Continue to summary" → "Create Token"
6. **Important**: Copy the token immediately - you won't see it again

### 2. Configure GitHub Secrets

Navigate to your repository settings: `Settings → Secrets and variables → Actions`

Add these repository secrets:

- **CLOUDFLARE_API_TOKEN**: Your API token from Step 1
- **CLOUDFLARE_ACCOUNT_ID**: Find in Cloudflare dashboard (right sidebar under "Account ID")
- **CLOUDFLARE_PROJECT_NAME**: Your Cloudflare Pages project name (e.g., `next-starter-template`)

### 3. Automated Deployment

The repository uses GitHub Actions to automatically deploy when code is pushed to the `main` branch.

**Workflow steps:**
1. Builds the Next.js application
2. Transforms build output with OpenNext
3. Deploys to Cloudflare Pages
4. Makes deployment live at your Cloudflare Pages URL

### 4. Manual Deployment

To deploy manually from your local machine:

```bash
# Build the application
npm run cf:build

# Deploy to production
npm run deploy:prod
```

**Note**: Manual deployment requires Wrangler CLI with valid Cloudflare credentials.

## Common Deployment Issues

### Authentication Errors

**Error**: `Authentication error [code: 10000]`

**Solution**: Update your API token with "User Details Read" permission (see Cloudflare Setup above).

### Build Failures

**Error**: Build fails during `next build` or OpenNext transformation

**Solution**: 
- Check build logs for specific errors
- Ensure all dependencies are installed: `npm install`
- Verify Node.js version matches `.node-version` file
- If you see deprecation warnings about `@cloudflare/next-on-pages`, ensure it's not in `package.json`

### White Screen / Blank Page

**Issue**: Cloudflare Pages deployment succeeds but shows a white screen

**Common Causes**:
1. **Wrong adapter**: Using deprecated `@cloudflare/next-on-pages` instead of `@opennextjs/cloudflare`
   - **Solution**: Ensure `package.json` uses `@opennextjs/cloudflare` and `build:cf` script runs OpenNext
2. **Runtime import errors**: Importing Node.js build artifacts (e.g., `package.json`) in runtime code
   - **Solution**: Use environment variables instead of build artifact imports
3. **Missing error boundaries**: Errors fail silently without `error.tsx` or `global-error.tsx`
   - **Solution**: Check browser console for errors; add error boundaries if needed

### Missing Static Assets (404 on /_next/static/*)

**Issue**: Static chunks fail to load with 404 errors

**Common Causes**:
1. **Incorrect deployment directory**: Deploying wrong directory to Pages
   - **Solution**: Ensure workflows deploy `.open-next/worker/` directory
2. **CSP blocking assets**: Content-Security-Policy headers blocking chunks
   - **Solution**: Check and update CSP headers in `_headers` file

### Deployment Not Updating

**Issue**: New code is pushed but live site shows old content

**Solution**:
- Check GitHub Actions workflow status
- Verify secrets are correctly configured
- Manually trigger workflow from Actions tab
- Clear Cloudflare cache if needed

## Monitoring Deployments

### GitHub Actions

View deployment history: `Actions → deploy.yml` in your repository

### Cloudflare Dashboard

View deployment details: [Cloudflare Pages Dashboard](https://dash.cloudflare.com)

### Real-time Logs

View live logs from deployed Workers:

```bash
npx wrangler tail
```

## Rollback

To rollback to a previous deployment:

1. Go to Cloudflare Pages dashboard
2. Select your project
3. Navigate to deployment history
4. Click "Rollback" on the desired deployment

Or deploy a specific commit:

```bash
git checkout <commit-hash>
npm run deploy:prod
```

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Getting Help

If you encounter deployment issues:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common solutions
2. Review GitHub Actions logs for error details
3. Consult Cloudflare Pages documentation
4. Check repository issues for similar problems
