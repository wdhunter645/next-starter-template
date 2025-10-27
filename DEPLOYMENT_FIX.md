# Cloudflare Deployment Fix

## Issue
PR #140 introduced static HTML files (`index.html` and `styles.css`) in the repository root, which conflicted with the Next.js application structure and routing system.

## Root Cause
This repository is a **Next.js application** that uses OpenNext for deployment to Cloudflare Pages. The presence of static HTML files in the root directory causes conflicts because:

1. **Routing Conflicts**: Next.js uses file-based routing with `src/app/page.tsx` as the home page. Having `index.html` in the root creates ambiguity about which file should serve the root route.

2. **Build System Conflicts**: The OpenNext build process expects a pure Next.js project structure. Static HTML files in the root can interfere with the build and deployment pipeline.

3. **Cloudflare Pages Deployment**: When deploying to Cloudflare Pages, the platform needs to know whether to serve static files or a Next.js application. Mixed content types cause deployment failures.

## Solution
Removed the conflicting static files:
- Deleted `index.html` from repository root
- Deleted `styles.css` from repository root
- Updated `.gitignore` to prevent future static HTML files in root

## Next.js Application Structure
The application already has a proper Next.js implementation for the Lou Gehrig Fan Club website:
- Home page: `src/app/page.tsx`
- Routing: File-based routing in `src/app/` directory
- Styling: CSS modules and Tailwind CSS
- All routes (/, /member, /milestones, /calendar, etc.) are implemented as Next.js pages

## Static Files in Next.js
If you need to add static files (HTML, CSS, images, etc.), they should be placed in the `public/` directory, NOT in the repository root. 

Files in the `public/` directory are served from the root URL path (e.g., `public/favicon.ico` becomes accessible at `/favicon.ico`). However, they don't conflict with Next.js routing because Next.js gives priority to its file-based routing system (pages/routes) over static files. This means:
- Dynamic routes (like `src/app/page.tsx`) take precedence
- Static files from `public/` are served when no matching route exists
- Build outputs are properly handled by the framework

## Verification
After the fix, both build processes work correctly:
```bash
# Next.js build
npm run build

# OpenNext Cloudflare build
npx opennextjs-cloudflare build
```

## Prevention
Added entries to `.gitignore` to prevent future static HTML files in the root:
```
/index.html
/styles.css
```

## Deployment
The application deploys successfully to Cloudflare Pages using the GitHub Actions workflow in `.github/workflows/deploy.yml`.
