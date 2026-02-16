# Cloudflare Pages Setup

## Build Configuration

This Next.js application is configured for Cloudflare Pages deployment using static export.

### Cloudflare Pages Settings

Configure your Cloudflare Pages project with the following settings:

- **Framework preset**: Next.js
- **Build command**: `npm run build:cf`
- **Build output directory**: `out`
- **Node.js version**: `20.x` (set via `.node-version` file)

### Why Static Export?

All pages in this application are statically generated at build time, so we use Next.js's static export feature (`output: "export"` in `next.config.ts`). This approach:

1. **Eliminates runtime dependencies** - No need for Node.js or Cloudflare Workers at runtime
2. **Maximizes compatibility** - Works with Cloudflare Pages' static hosting without adapter issues
3. **Improves performance** - Static files served directly from Cloudflare's CDN
4. **Simplifies deployment** - No complex build adapters or worker bundles required

### Migration from @cloudflare/next-on-pages

This project previously used `@cloudflare/next-on-pages`, which is now deprecated and has compatibility issues with Next.js 15. The static export approach is simpler and more reliable.

#### Previous Issue

The deprecated adapter generated workers with Node.js imports (`node:buffer`, `node:async_hooks`) that aren't available in Cloudflare Workers runtime, causing blank white screens.

#### Current Solution

Static export generates pure HTML/CSS/JS files in the `out/` directory, which Cloudflare Pages serves directly without any worker runtime.

### Environment Variables

Environment variables should be configured in the Cloudflare Pages dashboard under **Settings > Environment variables**.

Available environment variables:
- `NEXT_PUBLIC_SITE_NAME` - Site name (default: "Lou Gehrig Fan Club")
- `NEXT_PUBLIC_APP_VERSION` - Application version (default: "1.0.0")

### Local Development

```bash
# Development server
npm run dev

# Production build (same as Cloudflare Pages)
npm run build:cf

# Preview the production build locally
npx serve out
```

### Troubleshooting

If you encounter a blank white screen after deployment:

1. Verify the build output directory is set to `out` in Cloudflare Pages settings
2. Check that the build command is `npm run build:cf`
3. Ensure environment variables are properly configured if required
4. Review Cloudflare Pages deployment logs for any errors
