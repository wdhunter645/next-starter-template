# RUNBOOK - Operations Manual

This runbook provides comprehensive operational procedures for deploying, monitoring, and maintaining the LGFC application on Cloudflare Pages.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Deployment](#deployment)
- [Rollback](#rollback)
- [Smoke Testing](#smoke-testing)
- [Incident Response](#incident-response)
- [Environment Variables](#environment-variables)
- [Contact Information](#contact-information)

## Quick Reference

### Essential URLs

- **Production:** https://lgfc-prod.pages.dev (or custom domain when configured)
- **Staging:** https://lgfc-staging.pages.dev
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **GitHub Repository:** https://github.com/wdhunter645/next-starter-template

### Key Commands

```bash
# Build locally
npm ci
npm run build

# Cloudflare Pages build
npm run cf:build

# Manual deploy to staging
npm run cf:deploy:staging

# Manual deploy to production
npm run cf:deploy:prod

# Health check
curl https://lgfc-staging.pages.dev/api/healthz
```

## Deployment

### Automated Deployment (CI/CD)

The application automatically deploys via GitHub Actions when changes are pushed:

1. **Staging:** Deploys on push to any branch (preview deployments)
2. **Production:** Deploys on push to `main` branch

Monitor deployment status:
- GitHub Actions: Repository → Actions tab
- Cloudflare: Dashboard → Workers & Pages → lgfc-staging/lgfc-prod

### Manual Deployment

Use manual deployment when:
- CI/CD is broken or unavailable
- Emergency hotfix needed
- Testing deployment process

**Prerequisites:**
```bash
# Ensure you're authenticated with Cloudflare
npx wrangler login

# Or set environment variable
export CLOUDFLARE_API_TOKEN=<your-token>
```

**Deploy to Staging:**
```bash
cd /path/to/next-starter-template
npm ci
npm run build
npx @cloudflare/next-on-pages@latest
test -d .vercel/output/static || { echo "no build output"; exit 1; }
npx wrangler pages deploy .vercel/output/static --project-name lgfc-staging
```

**Deploy to Production:**
```bash
# Same build process as staging
npm ci
npm run build
npx @cloudflare/next-on-pages@latest
test -d .vercel/output/static || { echo "no build output"; exit 1; }

# Deploy with production settings
npx wrangler pages deploy .vercel/output/static \
  --project-name lgfc-prod \
  --branch main \
  --commit-dirty=true
```

**Record Deployment:**
After deployment, note the deployment URL and ID for rollback purposes:
```bash
# Save to a local file or secure notes
echo "$(date): Deployed to production - <deployment-url>" >> deployment-log.txt
```

## Rollback

### Quick Rollback (Cloudflare Dashboard)

1. Navigate to Cloudflare Dashboard
2. Go to Workers & Pages → lgfc-prod → Deployments
3. Find the last known good deployment
4. Click "..." menu → "Rollback to this deployment"
5. Confirm rollback

### CLI Rollback

```bash
# List recent deployments
npx wrangler pages deployment list --project-name lgfc-prod

# Rollback to specific deployment
npx wrangler pages deployment rollback \
  --project-name lgfc-prod \
  <deployment-id>
```

### Post-Rollback Verification

After rollback, verify the site is working:
```bash
# Health check
curl https://lgfc-prod.pages.dev/api/healthz

# Manual verification
# - Visit the homepage
# - Test critical user flows
# - Check error logs in Cloudflare
```

## Smoke Testing

### Automated Smoke Tests

Uptime monitoring runs every 5 minutes via GitHub Actions. Check status:
- Repository → Actions → "Uptime check" workflow

### Manual Smoke Test Checklist

Run these tests after deployment:

**1. Health Endpoint**
```bash
# Staging
curl https://lgfc-staging.pages.dev/api/healthz
# Expected: {"ok":true,"ts":1234567890}

# Production
curl https://lgfc-prod.pages.dev/api/healthz
# Expected: {"ok":true,"ts":1234567890}
```

**2. Homepage**
```bash
# Should return 200
curl -I https://lgfc-prod.pages.dev/
```

**3. Critical User Flows**
- [ ] Homepage loads
- [ ] Navigation works
- [ ] No console errors (check browser dev tools)
- [ ] Authentication flow (if applicable)
- [ ] Key API endpoints respond

**4. Admin Features (if applicable)**
- [ ] Admin pages accessible
- [ ] API endpoints return expected responses
- [ ] No unauthorized access allowed

### Performance Check

```bash
# Response time should be < 500ms
curl -w "\nTime: %{time_total}s\n" -o /dev/null -s https://lgfc-prod.pages.dev/
```

## Incident Response

### Severity Levels

- **P0 (Critical):** Site down, all users affected
- **P1 (High):** Major feature broken, many users affected
- **P2 (Medium):** Minor feature issue, some users affected
- **P3 (Low):** Cosmetic issue, minimal impact

### Incident Response Process

**1. Detection**
- Uptime monitor alerts (GitHub Actions failure)
- User reports
- Cloudflare error rate spike
- Manual monitoring

**2. Initial Assessment (< 5 min)**
- Confirm the issue
- Determine severity
- Check recent deployments
- Review error logs

**3. Immediate Mitigation (< 15 min)**
For P0/P1 incidents:
```bash
# Quick rollback to last known good
npx wrangler pages deployment rollback \
  --project-name lgfc-prod \
  <last-good-deployment-id>
```

**4. Create Incident Issue**
- Go to GitHub repository
- Issues → New Issue → "Incident" template
- Fill in impact, timeline, and mitigation steps
- Assign to appropriate team members

**5. Investigation**
- Check Cloudflare function logs
- Review recent code changes
- Test locally to reproduce
- Identify root cause

**6. Resolution**
- Develop fix
- Test thoroughly in staging
- Deploy fix to production
- Verify resolution

**7. Post-Incident**
- Update incident issue with resolution
- Document lessons learned
- Create follow-up tasks to prevent recurrence

### Emergency Contacts

See [Contact Information](#contact-information) section below.

## Environment Variables

### Required Variables

All environments need these variables set in Cloudflare Pages dashboard:

```bash
NEXT_PUBLIC_SITE_URL=https://lgfc-prod.pages.dev
```

### Optional Variables

**Admin Access:**
```bash
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

**Supabase:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Backblaze B2:**
```bash
B2_KEY_ID=xxxxxxxxxxxxx
B2_APP_KEY=xxxxxxxxxxxxx
B2_BUCKET=bucket-name
B2_ENDPOINT=https://s3.us-west-000.backblazeb2.com
PUBLIC_B2_BASE_URL=https://f000.backblazeb2.com/file/bucket-name
```

**OpenAI (if using AI features):**
```bash
OPENAI_API_KEY=sk-...
```

### Setting Variables

**Via Cloudflare Dashboard:**
1. Navigate to Workers & Pages → lgfc-staging or lgfc-prod
2. Settings → Environment variables
3. Add variable for Production/Preview/Both
4. Save and redeploy

**Via Wrangler CLI:**
```bash
# Set secret (prompted for value)
echo -n "$OPENAI_API_KEY" | npx wrangler pages secret put OPENAI_API_KEY --project-name lgfc-staging

# For multiple secrets
echo -n "$VAR1" | npx wrangler pages secret put VAR1 --project-name lgfc-staging
echo -n "$VAR2" | npx wrangler pages secret put VAR2 --project-name lgfc-staging
```

### Variable Audit Checklist

Run quarterly or after incidents:
- [ ] All required variables are set
- [ ] No secrets committed to git
- [ ] Staging uses non-production credentials
- [ ] Production credentials are current
- [ ] Unused variables are removed
- [ ] Variables documented in `.env.example`

## Monitoring & Logging

### Cloudflare Dashboard

**Function Logs:**
1. Dashboard → Workers & Pages → lgfc-prod
2. Logs tab
3. Real-time logs for debugging

**Analytics:**
1. Analytics & Logs tab
2. Monitor:
   - Request volume
   - Status codes
   - Response times
   - Geographic distribution

**Uptime Monitoring:**
- GitHub Actions → "Uptime check" workflow
- Runs every 5 minutes
- Checks `/api/healthz` endpoint
- Alerts via GitHub notifications

### Log Retention

Cloudflare free tier logs are retained for 24 hours. For longer retention:
- Enable Logpush to R2 (if available)
- Export critical logs manually
- Use third-party log aggregation service

## Security

### WAF & Rate Limiting

Configure in Cloudflare Dashboard → Security:

**WAF Managed Rules:**
- Enable default rule set
- Monitor false positives

**Rate Limiting:**
- API routes: 300 requests/minute/IP
- Action: Managed Challenge or Block
- Adjust based on usage patterns

**Bot Fight Mode:**
- Enable in Security → Bots
- May need tuning for legitimate APIs

### Security Headers

Security headers are configured in `public/_headers`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: no-referrer-when-downgrade
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

### HTTPS & HSTS

Enabled in Cloudflare → SSL/TLS:
- Always Use HTTPS: ON
- HSTS: max-age=31536000
- Consider HSTS preload after testing

## Performance

### Cache Rules

Configure in Cloudflare Dashboard → Speed → Cache Rules:

**Static Assets (cache):**
- Path matches: `*.css`, `*.js`, `*.png`, `*.jpg`, `*.svg`
- Cache TTL: 1 year
- Browser TTL: 1 year

**API Routes (bypass):**
- Path matches: `/api/*`, `/admin/*`
- Cache: Bypass

### Optimization

**Enabled in Speed → Optimization:**
- Early Hints: ON
- HTTP/3: ON
- Auto Minify: CSS, JS, HTML
- Brotli compression: ON

**Image Optimization:**
- Polish: Lossless (if acceptable)
- Mirage: ON (lazy loading)

## DNS & Custom Domain

### Adding Custom Domain (Production)

1. Cloudflare Dashboard → Workers & Pages → lgfc-prod
2. Custom domains → Add domain
3. Enter domain (e.g., www.lgfc.org)
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (< 15 min)

**Keep staging on pages.dev** (no custom domain for non-production)

### Verification

```bash
# After DNS propagation (5-30 min)
curl -I https://www.lgfc.org/api/healthz
# Should return 200 OK
```

## Backup & Data Services

### D1 Database (if using)

**Quick provision:**
```bash
npx wrangler d1 create lgfc-db
npx wrangler d1 execute lgfc-db --command="CREATE TABLE IF NOT EXISTS health(id INTEGER PRIMARY KEY);"
```

**Backup:**
```bash
# Export database
npx wrangler d1 export lgfc-db --output backup-$(date +%Y%m%d).sql
```

### KV Namespace (if using)

**Create:**
```bash
npx wrangler kv:namespace create lgfc-flags
```

**Bind to Pages project in Cloudflare UI**

## Contact Information

### Repository Owner
- GitHub: @wdhunter645
- Role: Primary contact for all operational issues

### Escalation Path

**P0/P1 Incidents:**
1. Create incident issue in GitHub
2. Notify repository owner
3. If no response in 1 hour, escalate per team protocol

**P2/P3 Issues:**
1. Create standard issue in GitHub
2. Assign to appropriate team member
3. Follow normal workflow

### Support Channels

- **GitHub Issues:** For bugs and feature requests
- **GitHub Discussions:** For questions and community support
- **Direct Contact:** For urgent production issues (see above)

## Maintenance Schedule

### Weekly
- [ ] Review error logs in Cloudflare dashboard
- [ ] Check uptime monitoring status
- [ ] Verify no failed deployments

### Monthly
- [ ] Audit environment variables
- [ ] Review and rotate credentials (if needed)
- [ ] Update documentation
- [ ] Dependency updates check

### Quarterly
- [ ] Security audit
- [ ] Performance review
- [ ] Update runbook based on incidents
- [ ] Team training on new procedures

## Troubleshooting

### Build Failures

**Symptom:** Deployment fails during build

**Check:**
```bash
# Test build locally
npm ci
npm run build

# Check logs in Cloudflare Dashboard
```

**Common Causes:**
- Missing dependencies in `package.json`
- TypeScript errors
- Linting failures
- Out of memory (increase build resources)

### Environment Variable Issues

**Symptom:** 503 errors, "not configured" messages

**Fix:**
1. Verify variables set in correct environment (Production/Preview)
2. Redeploy after adding/changing variables
3. Check variable names (case-sensitive)
4. Verify no extra spaces

### Uptime Monitor False Positives

**If uptime check fails but site works:**
1. Check `LGFC_STAGING_URL` and `LGFC_PROD_URL` secrets in GitHub
2. Verify URLs are correct and accessible
3. Test endpoint manually: `curl <url>/api/healthz`
4. Check for rate limiting or WAF blocks

## Appendix

### Useful Links

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Staging Runbook](./staging-runbook.md) - Detailed staging operations
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture

### Change History

| Date | Author | Changes |
|------|--------|---------|
| 2025-10-19 | System | Initial runbook creation for LGFC parallel track |

---

**Last Updated:** 2025-10-19  
**Maintained By:** Development Team  
**Version:** 1.0  
**Next Review:** 2026-01-19
