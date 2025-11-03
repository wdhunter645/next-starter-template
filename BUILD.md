# Build Guide

This document describes how to build and deploy this Next.js application for Cloudflare Pages.

## Build System

This project uses **@cloudflare/next-on-pages** to adapt Next.js builds for Cloudflare Pages deployment.

### Build Commands

```bash
# Standard Next.js build
npm run build

# Cloudflare Pages build (includes adaptation)
npm run cf:build
# or alternatively
npm run build:cf
```

Both `cf:build` and `build:cf` produce the same result - they're aliases for compatibility.

## Build Process

The `cf:build` command performs two steps:

1. **Next.js Build**: Runs `next build` to create an optimized production build
2. **Cloudflare Adaptation**: Runs `@cloudflare/next-on-pages` to transform the output for Cloudflare Pages

### Build Output

After running `npm run cf:build`, the following output is created:

```
.vercel/output/static/
├── _worker.js/          # Cloudflare Worker code
│   └── index.js         # Worker entry point
├── _next/               # Next.js assets
├── *.html               # Prerendered pages
└── ...                  # Static assets
```

**Important**: The build output directory is `.vercel/output/static` (not `.next` or `.open-next`).

## Cloudflare Pages Configuration

### Dashboard Settings

Configure these settings in your Cloudflare Pages project:

- **Build command**: `npm run build:cf` (or `npm run cf:build`)
- **Build output directory**: `.vercel/output/static`
- **Node version**: `20` (or leave blank to auto-detect from `.nvmrc`)

### Environment Variables

The build respects standard Next.js environment variables:

- `NODE_ENV` - Set to `production` for production builds
- `NEXT_PUBLIC_*` - Public environment variables bundled into the build

## Local Development

For local development, use:

```bash
npm run dev
```

This starts the Next.js development server on port 3000.

## CI/CD

The `.github/workflows/ci.yml` workflow automatically validates:

- ✅ Dependencies install correctly
- ✅ Linting passes (`npm run lint`)
- ✅ Build completes successfully (`npm run cf:build`)
- ✅ Build output structure is correct

## Troubleshooting

### Build fails with "Missing script"

If you see errors about missing scripts, ensure you're using one of:
- `npm run cf:build`
- `npm run build:cf`

Both commands are aliases and produce identical results.

### Node version mismatch

This project requires Node.js 20.x. The `.nvmrc` file specifies this version.

If you see engine warnings, ensure:
- Your local Node version is 20.x
- Cloudflare Pages is set to use Node 20

### Build output not found

If deployment fails with "output directory not found":
- Verify the output directory is set to `.vercel/output/static`
- Check that the build completed successfully
- Ensure `@cloudflare/next-on-pages` is installed in devDependencies

## Build Expectations

A successful build should:

1. Complete without errors
2. Generate `.vercel/output/static/_worker.js/index.js`
3. Prerender all static routes
4. Complete in under 2 minutes (typical)

## Dependencies

Build-time dependencies:
- `@cloudflare/next-on-pages` - Cloudflare Pages adapter
- `next` - Next.js framework
- `typescript` - TypeScript compiler
- `tailwindcss` - CSS framework

See `package.json` for the complete dependency list.

## Version History

- **0.2.0**: Migrated to next-on-pages, removed OpenNext
- **1.0.0**: Initial release with OpenNext (legacy)
