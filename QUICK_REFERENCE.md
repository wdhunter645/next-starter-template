# ⚡ Quick Reference: Cloudflare Pages Settings

## Current PR Status
- ✅ Code changes: Complete
- ✅ CI workflow: Added and working
- ⚠️ Cloudflare Pages: Needs dashboard update
- ⚠️ Preview builds: Will fail until dashboard is updated

## Settings to Update in Cloudflare Dashboard

Navigate to: **Cloudflare Dashboard** → **Workers & Pages** → **next-starter-template** → **Settings** → **Builds & deployments**

### Build Configuration

| Setting | Value |
|---------|-------|
| Framework preset | Next.js |
| Build command | `npm run cf:build` (or `npm run build:cf`) |
| Build output directory | `.vercel/output/static` |
| Root directory | (empty) |
| Node version | 20 |

**Note**: Both `npm run cf:build` and `npm run build:cf` work as aliases.

### Before vs After

| Setting | OLD ❌ | NEW ✅ |
|---------|-------|-------|
| Build command | `npx opennextjs-cloudflare build` | `npm run cf:build` |
| Output directory | `.open-next/worker` | `.vercel/output/static` |
| Adapter | OpenNext | @cloudflare/next-on-pages |

## After Updating

1. Save settings in Cloudflare dashboard
2. Trigger new deployment (push to PR or retry deployment)
3. Verify build succeeds in Cloudflare logs
4. Check preview URL works

---

📖 For detailed instructions, see: **CLOUDFLARE_DASHBOARD_UPDATE.md**
