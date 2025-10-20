# Cloudflare Pages — LGFC

**Do NOT use `wrangler deploy` or any Workers-specific command for this project.**  
This site deploys via GitHub Actions and Cloudflare Pages build output.

## Required repo secrets
- `CF_API_TOKEN`  — Pages Write permission
- `CF_ACCOUNT_ID` — your Cloudflare Account ID

## Optional repo variable
- `CF_PAGES_PROJECT` — project name (defaults to `next-starter-template`)

## Cloudflare Pages (Dashboard → Pages → <project> → Settings → Build & deploy)
- **Build command:**  
  `npx @cloudflare/next-on-pages@latest && npm run build`
- **Output directory:**  
  `.vercel/output/static`
- **Node:** 20 (or "Latest" with Node 20+)
- **Deploy command:** leave **empty** (Pages publishes the output; no `wrangler deploy`)
