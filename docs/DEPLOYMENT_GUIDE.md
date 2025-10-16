# Deployment Guide

This guide covers everything you need to deploy the Next.js Starter Template to Cloudflare Workers.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [First Deployment](#first-deployment)
- [Deployment Methods](#deployment-methods)
- [Configuration](#configuration)
- [Domain Setup](#domain-setup)
- [Environment Variables in Production](#environment-variables-in-production)
- [Monitoring and Logs](#monitoring-and-logs)
- [Rollback and Version Management](#rollback-and-version-management)
- [CI/CD Setup](#cicd-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **Cloudflare Account**
   - Sign up at [cloudflare.com](https://www.cloudflare.com/)
   - Free tier is sufficient for testing

2. **Node.js and npm**
   ```bash
   node --version  # Should be 18.x or higher
   npm --version   # Should be 9.x or higher
   ```

3. **Wrangler CLI**
   - Installed automatically with project dependencies
   - Or install globally: `npm install -g wrangler`

4. **Git**
   - For version control
   - Required for some deployment workflows

## Quick Start

The fastest way to deploy:

```bash
# 1. Install dependencies
npm install

# 2. Configure Wrangler (one-time setup)
npx wrangler login

# 3. Build and deploy
npm run deploy
```

Your site will be live at: `https://next-starter-template.{your-subdomain}.workers.dev`

## Environment Setup

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Edit `.env` File

Open `.env` and configure the required variables:

```env
# Cloudflare Configuration (REQUIRED)
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here

# Site Configuration (REQUIRED)
NEXT_PUBLIC_SITE_URL=https://your-site.workers.dev
NEXT_PUBLIC_SITE_NAME=Your Site Name
```

### 3. Get Cloudflare Credentials

#### Account ID

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **Workers & Pages** from the sidebar
3. Your Account ID is displayed on the right side
4. Or find it in the URL: `dash.cloudflare.com/{ACCOUNT_ID}/workers`

#### API Token

1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the "Edit Cloudflare Workers" template
4. Or create a custom token with these permissions:
   - Account → Workers Scripts → Edit
   - Account → Workers KV Storage → Edit (if using KV)
   - Account → Workers Routes → Edit
5. Copy the token immediately (you won't see it again)

## First Deployment

### Step 1: Authenticate with Wrangler

```bash
npx wrangler login
```

This opens a browser to authenticate with Cloudflare.

**Alternative**: Use API token directly:
```bash
export CLOUDFLARE_API_TOKEN=your_token_here
```

### Step 2: Configure Wrangler

Edit `wrangler.jsonc`:

```jsonc
{
  "name": "next-starter-template",  // Change to your project name
  "account_id": "YOUR_ACCOUNT_ID",  // Add your account ID
  "main": "./.open-next/worker.js",
  "compatibility_date": "2024-01-01",
  "compatibility_flags": ["nodejs_compat"]
}
```

### Step 3: Build for Production

```bash
npm run build
```

**Output**: `.next/` directory with optimized production build

**Verify**: Check for errors in the build output

### Step 4: Deploy

```bash
npm run deploy
```

**This runs**:
1. `opennextjs-cloudflare build` - Transforms Next.js build
2. `opennextjs-cloudflare deploy` - Uploads to Cloudflare

**Expected Output**:
```
✨ Build complete
⬆️  Uploading...
✨ Deployment complete!
🌍 URL: https://next-starter-template.{subdomain}.workers.dev
```

### Step 5: Verify Deployment

Visit the URL provided in the output. You should see your site live!

**Test checklist**:
- [ ] Home page loads
- [ ] Navigation works
- [ ] All pages are accessible
- [ ] Styles are applied correctly
- [ ] Images load properly

## Deployment Methods

### Method 1: npm Scripts (Recommended)

```bash
# Full deployment
npm run deploy

# Preview before deploying
npm run preview

# Build only (no deploy)
npm run build
```

### Method 2: Wrangler CLI

```bash
# Build with OpenNext
npx opennextjs-cloudflare build

# Deploy with Wrangler
npx wrangler deploy

# Or combine
npx opennextjs-cloudflare build && npx wrangler deploy
```

### Method 3: C3 (Create Cloudflare)

For a fresh start:

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/next-starter-template
```

### Method 4: GitHub Actions (CI/CD)

See [CI/CD Setup](#cicd-setup) section below.

## Configuration

### wrangler.jsonc

Main configuration file for Cloudflare Workers:

```jsonc
{
  // Project name (shows in Cloudflare dashboard)
  "name": "next-starter-template",
  
  // Your Cloudflare account ID
  "account_id": "your_account_id",
  
  // Entry point (managed by OpenNext)
  "main": "./.open-next/worker.js",
  
  // Worker compatibility
  "compatibility_date": "2024-01-01",
  "compatibility_flags": ["nodejs_compat"],
  
  // Custom domains (optional)
  "routes": [
    {
      "pattern": "example.com/*",
      "zone_name": "example.com"
    }
  ],
  
  // Environment variables (optional)
  "vars": {
    "ENVIRONMENT": "production"
  },
  
  // KV Namespaces (optional)
  "kv_namespaces": [
    {
      "binding": "MY_KV",
      "id": "your_kv_namespace_id"
    }
  ],
  
  // D1 Databases (optional)
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "your_database",
      "database_id": "your_database_id"
    }
  ],
  
  // R2 Buckets (optional)
  "r2_buckets": [
    {
      "binding": "MY_BUCKET",
      "bucket_name": "your_bucket"
    }
  ]
}
```

### open-next.config.ts

OpenNext adapter configuration:

```typescript
const config = {
  default: {
    // Deployment options
    override: {
      wrapper: "cloudflare-node",
    },
  },
};

export default config;
```

## Domain Setup

### Option 1: Workers.dev Subdomain (Default)

Automatically provided: `your-project.{subdomain}.workers.dev`

**Advantages**:
- Free
- No DNS setup required
- SSL included
- Works immediately

### Option 2: Custom Domain

**Prerequisites**:
- Domain managed by Cloudflare (free to transfer)
- OR DNS pointed to Cloudflare

**Steps**:

1. **Add Domain to Cloudflare**
   - Go to Cloudflare Dashboard
   - Click "Add a Site"
   - Follow the setup wizard

2. **Configure Route in wrangler.jsonc**
   ```jsonc
   {
     "routes": [
       {
         "pattern": "your-domain.com/*",
         "zone_name": "your-domain.com"
       }
     ]
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

4. **Verify DNS**
   - DNS should automatically point to Workers
   - Check with: `dig your-domain.com`
   - May take a few minutes to propagate

**SSL/TLS**:
- Automatic with Cloudflare
- Free SSL certificate
- HTTPS enforced by default

### Option 3: Multiple Domains

```jsonc
{
  "routes": [
    {
      "pattern": "example.com/*",
      "zone_name": "example.com"
    },
    {
      "pattern": "www.example.com/*",
      "zone_name": "example.com"
    },
    {
      "pattern": "staging.example.com/*",
      "zone_name": "example.com"
    }
  ]
}
```

## Environment Variables in Production

### Method 1: Wrangler Secrets (Recommended for Sensitive Data)

```bash
# Set a secret
npx wrangler secret put SECRET_NAME
# You'll be prompted to enter the value

# List secrets
npx wrangler secret list

# Delete a secret
npx wrangler secret delete SECRET_NAME
```

**Secrets are**:
- Encrypted at rest
- Not visible in dashboard
- Accessible at runtime via `env.SECRET_NAME`

### Method 2: wrangler.jsonc vars (For Non-Sensitive Data)

```jsonc
{
  "vars": {
    "ENVIRONMENT": "production",
    "API_URL": "https://api.example.com"
  }
}
```

### Method 3: Cloudflare Dashboard

1. Go to Workers & Pages
2. Select your Worker
3. Click "Settings" → "Variables"
4. Add environment variables
5. Click "Save and Deploy"

### Accessing Variables in Code

```typescript
export async function GET(request: Request) {
  // For Cloudflare context
  const { env } = await getCloudflareContext();
  
  const apiKey = env.API_KEY;
  const dbUrl = env.DATABASE_URL;
  
  // Use in your logic
}
```

## Monitoring and Logs

### View Real-Time Logs

```bash
# Tail logs for all Workers
npm run wrangler tail

# Filter by request method
npx wrangler tail --status=error

# Filter by header
npx wrangler tail --header="user-agent:Chrome"
```

### Cloudflare Dashboard Analytics

1. Go to Workers & Pages
2. Select your Worker
3. View metrics:
   - Requests per second
   - Errors
   - CPU time
   - Duration

### Set Up Alerts

1. Go to Notifications in Cloudflare Dashboard
2. Create alert for:
   - Error rate threshold
   - Request spike
   - Worker failure

## Rollback and Version Management

### Rollback to Previous Version

```bash
# List deployments
npx wrangler deployments list

# Rollback to specific deployment
npx wrangler rollback [deployment-id]
```

### Version Tags

Use Git tags for version tracking:

```bash
# Tag a release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Deploy from tag
git checkout v1.0.0
npm run deploy
```

### Deployment Strategies

**Blue-Green Deployment**:
1. Deploy to staging subdomain first
2. Test thoroughly
3. Switch production route
4. Monitor for issues

**Canary Deployment**:
1. Deploy new version
2. Route 10% of traffic to new version
3. Monitor metrics
4. Gradually increase percentage

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Workers
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: npm run deploy
```

**Setup**:
1. Add secrets in GitHub repository settings:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
2. Push to main branch
3. Workflow runs automatically

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
deploy:
  image: node:18
  stage: deploy
  script:
    - npm ci
    - npm run build
    - npm run deploy
  only:
    - main
  variables:
    CLOUDFLARE_API_TOKEN: $CLOUDFLARE_API_TOKEN
    CLOUDFLARE_ACCOUNT_ID: $CLOUDFLARE_ACCOUNT_ID
```

## Troubleshooting

### Issue: "Authentication Error"

**Solution**:
```bash
# Re-authenticate
npx wrangler login

# Or set API token
export CLOUDFLARE_API_TOKEN=your_token
```

### Issue: "Account ID Missing"

**Solution**: Add to `wrangler.jsonc`:
```jsonc
{
  "account_id": "your_account_id_here"
}
```

### Issue: "Build Failed"

**Check**:
1. TypeScript errors: `npm run build`
2. Linting errors: `npm run lint`
3. Node version: `node --version` (should be 18+)

**Solution**:
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Issue: "Deployment Timeout"

**Solution**:
```bash
# Increase timeout in wrangler.jsonc
{
  "limits": {
    "cpu_ms": 50
  }
}
```

### Issue: "Module Not Found in Production"

**Solution**: Ensure dependencies are in `dependencies`, not `devDependencies`:
```bash
npm install --save package-name
```

### Issue: "Environment Variables Not Available"

**Check**:
1. Variables prefixed with `NEXT_PUBLIC_` for client-side
2. Server-side variables set in Wrangler secrets
3. Re-deploy after adding variables

### Issue: "404 on All Routes"

**Solution**: Verify `routes` configuration in `wrangler.jsonc`:
```jsonc
{
  "routes": [
    {
      "pattern": "your-domain.com/*",
      "zone_name": "your-domain.com"
    }
  ]
}
```

### Issue: "Slow Performance"

**Optimize**:
1. Enable static generation: Check `next.config.ts`
2. Reduce bundle size: Analyze with `npx @next/bundle-analyzer`
3. Enable Cloudflare caching
4. Use Cloudflare Images for optimization

## Best Practices

### Pre-Deployment Checklist

- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run build` - successful
- [ ] Test locally with `npm run dev`
- [ ] Preview deployment: `npm run preview`
- [ ] Review environment variables
- [ ] Check git status: all changes committed
- [ ] Test on staging environment first
- [ ] Update documentation if needed
- [ ] Create git tag for version

### Post-Deployment Checklist

- [ ] Visit production URL
- [ ] Test all major features
- [ ] Check browser console for errors
- [ ] Verify analytics tracking
- [ ] Monitor logs for errors: `npm run wrangler tail`
- [ ] Test on multiple devices/browsers
- [ ] Verify SSL certificate
- [ ] Check page load times

### Security Checklist

- [ ] Never commit `.env` file
- [ ] Use Wrangler secrets for sensitive data
- [ ] Rotate API tokens regularly
- [ ] Enable Cloudflare security features
- [ ] Implement rate limiting if needed
- [ ] Review access logs regularly
- [ ] Keep dependencies updated: `npm audit`

## Next Steps

After successful deployment:

1. **Set up monitoring**: Configure alerts and analytics
2. **Custom domain**: Add your own domain
3. **CI/CD**: Automate deployments with GitHub Actions
4. **Performance**: Optimize with Cloudflare features
5. **Backup**: Implement deployment rollback strategy
6. **Scale**: Upgrade plan if needed for higher limits

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [OpenNext Cloudflare Guide](https://opennext.js.org/cloudflare)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Getting Help

If you encounter issues:

1. Check [GitHub Issues](https://github.com/wdhunter645/next-starter-template/issues)
2. Review [Cloudflare Community](https://community.cloudflare.com/)
3. Consult [Next.js Discord](https://nextjs.org/discord)
4. Open a new issue with detailed error messages
