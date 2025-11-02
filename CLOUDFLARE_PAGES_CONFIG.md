# Cloudflare Pages Build Configuration

This repository is now standardized on a single build path using @cloudflare/next-on-pages.

## ⚠️ IMPORTANT: Dashboard Settings Must Be Updated

The previous OpenNext configuration has been removed. You **MUST** update your Cloudflare Pages dashboard settings:

### How to Update Settings

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Your project
2. Click on **Settings** → **Builds & deployments**
3. Update the following settings:

### Build Configuration
- **Framework preset**: Next.js
- **Build command**: `npm run cf:build`
- **Build output directory**: `.vercel/output/static`
- **Root directory**: (leave empty - use repository root)
- **Node version**: 20 (or will use the version from `package.json` engines field)

### Environment Variables
- Add any required environment variables in the **Environment variables** section
- The build will use Node 20.x as specified in `package.json` engines field

### Old Configuration (No Longer Valid)
❌ ~~Build command: `npx opennextjs-cloudflare build`~~  
❌ ~~Output directory: `.open-next/worker`~~  
❌ ~~Using wrangler for deployment~~

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Build and adapt for Cloudflare Pages
npm run cf:build
```

## Build Output

The `npm run cf:build` command performs two steps:
1. `npm run build` - Runs Next.js production build
2. `npm run cf:adapt` - Adapts the build output for Cloudflare Pages using @cloudflare/next-on-pages

The final output is in `.vercel/output/static` and includes:
- Static HTML files for all prerendered routes
- A `_worker.js` directory containing the Cloudflare Worker script
- All static assets from Next.js build

## Preview Builds

The `.github/workflows/cf-pages-auto-retry.yml` workflow automatically retries failed preview deployments to handle transient Cloudflare API errors.

## Removed Legacy Configurations

The following have been removed to simplify the build pipeline:
- OpenNext adapter (@opennextjs/cloudflare)
- Direct wrangler deployments
- Multiple deployment workflows (deploy-dev.yml, deploy-prod.yml)
- open-next.config.ts file

All deployments now go through Cloudflare Pages using the native GitHub integration.
