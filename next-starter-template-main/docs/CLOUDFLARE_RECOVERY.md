# Cloudflare Pages Recovery Guide

This guide provides step-by-step procedures to recover or recreate the Cloudflare Pages project using snapshot data from `snapshots/cloudflare/`.

## Prerequisites

- Access to Cloudflare account with Pages permissions
- Latest snapshot files from `snapshots/cloudflare/`
- Access to GitHub repository with deployment permissions
- DNS management access (if custom domains are configured)

## Snapshot Files Location

All Cloudflare Pages snapshots are stored in:
```
snapshots/cloudflare/
├── cf-project-YYYYMMDDTHHMMSSZ.json      # Project configuration
├── cf-domains-YYYYMMDDTHHMMSSZ.json      # Custom domains
├── cf-deployments-YYYYMMDDTHHMMSSZ.json  # Recent deployments
├── _smoketest.txt                         # Snapshot run log
└── README.md                              # Snapshot documentation
```

Use the most recent timestamp for recovery operations.

## Recovery Checklist

### Step 1: Review Current Configuration

Before making changes, review the latest snapshot files:

1. **Open the latest `cf-project-*.json`**
   - Note the `name` field (project name)
   - Note the `production_branch` field
   - Note the `build_config` section (command, output directory)
   - Note any `deployment_configs` (environment variables)

2. **Open the latest `cf-domains-*.json`**
   - List all custom domains
   - Note validation requirements

3. **Open the latest `cf-deployments-*.json`**
   - Check most recent successful deployment
   - Note the commit SHA
   - Verify build configuration

### Step 2: Recreate Pages Project

If the Pages project needs to be recreated from scratch:

1. **Navigate to Cloudflare Dashboard**
   - Go to: `Account Home` → `Workers & Pages` → `Create application` → `Pages`

2. **Connect to Git Repository**
   - Select "Connect to Git"
   - Choose GitHub repository: `wdhunter645/next-starter-template`
   - Authorize Cloudflare GitHub integration if needed

3. **Configure Build Settings**
   - From `cf-project-*.json`, find `build_config`:
     ```json
     {
       "build_command": "npm run build:cf",
       "destination_dir": "out",
       "root_dir": ""
     }
     ```
   - **Project name**: Match the `name` field from snapshot (e.g., `next-starter-template`)
   - **Production branch**: Match `production_branch` from snapshot (typically `main`)
   - **Build command**: Use the `build_command` value (e.g., `npm run build:cf`)
   - **Build output directory**: Use the `destination_dir` value (e.g., `out`)
   - **Root directory**: Leave empty or match `root_dir` value

4. **Environment Variables**
   - From `cf-project-*.json`, check `deployment_configs.production.env_vars`
   - Note: Snapshot contains variable **names only**, not values
   - Add each environment variable in the "Environment variables" section
   - Retrieve actual values from secure storage or documentation
   - Common variables:
     - `NODE_VERSION` (if specified)
     - Any API keys or feature flags

5. **Save and Deploy**
   - Click "Save and Deploy"
   - Wait for initial build to complete

### Step 3: Restore Custom Domains

From `cf-domains-*.json`, restore each custom domain:

1. **Navigate to Domain Settings**
   - Cloudflare Dashboard → Pages → Your Project → `Custom domains`

2. **For Each Domain in Snapshot**
   - Click "Set up a custom domain"
   - Enter domain name (e.g., `example.com` or `www.example.com`)
   - Follow Cloudflare's DNS validation steps

3. **DNS Configuration**
   - For domains managed in Cloudflare:
     - Add `CNAME` record pointing to `<project-name>.pages.dev`
   - For external DNS:
     - Add `CNAME` or update existing record as instructed

4. **Verify Domain Status**
   - Wait for DNS propagation
   - Check "Active" status in custom domains list

### Step 4: Verify Build Configuration

Cross-check settings against snapshot:

1. **Build Settings Path**
   - Dashboard → Pages → Project → `Settings` → `Builds & deployments`

2. **Verify**
   - Production branch matches snapshot
   - Build command matches snapshot
   - Output directory matches snapshot
   - Environment variables are present (names match)

### Step 5: Restore Headers and Redirects (If Applicable)

If the project uses custom headers or redirects:

1. **Check Repository for Configuration**
   - Look for `_headers` or `_redirects` files in the repository
   - These are typically in the build output directory

2. **Verify in Build Output**
   - After a deployment, check build logs
   - Confirm headers/redirects are processed

### Step 6: Test Deployment

1. **Trigger a Manual Deployment**
   - Dashboard → Pages → Project → `Deployments` → `Create deployment`
   - Or push to production branch

2. **Verify Deployment Success**
   - Check build logs for errors
   - Visit `<project-name>.pages.dev` URL
   - Test custom domains (if configured)
   - Check page functionality

3. **Compare with Snapshot**
   - Review `cf-deployments-*.json` for expected deployment structure
   - Verify similar build times and success status

## Cloudflare Dashboard Quick Reference

Key paths in Cloudflare Dashboard:

- **Pages Project List**: `Account Home` → `Workers & Pages` → `Pages` tab
- **Project Settings**: `Pages` → `[Project Name]` → `Settings`
- **Build Configuration**: `Settings` → `Builds & deployments`
- **Environment Variables**: `Settings` → `Environment variables`
- **Custom Domains**: `[Project Name]` → `Custom domains`
- **Deployments History**: `[Project Name]` → `Deployments`

## Troubleshooting

### Build Failures

If builds fail after recreation:

1. Compare build command and output directory with snapshot
2. Check environment variables are set correctly
3. Verify Node.js version (check `cf-deployments-*.json` for build environment)
4. Review build logs for missing dependencies

### Domain Validation Issues

If custom domains won't validate:

1. Verify DNS records are correctly pointed to Cloudflare Pages
2. Wait for DNS propagation (can take up to 48 hours, typically much faster)
3. Check domain ownership in Cloudflare DNS settings
4. Ensure CNAME record points to `<project-name>.pages.dev`

### Missing Environment Variables

If the application doesn't work correctly:

1. Review snapshot for environment variable names
2. Check secure documentation or credential store for actual values
3. Add missing variables in Pages project settings
4. Redeploy to apply changes

## Important Notes

### What This Guide Covers
- ✅ Cloudflare Pages project configuration
- ✅ Build settings and commands
- ✅ Custom domain configuration
- ✅ Deployment history for reference

### What This Guide Does NOT Cover
- ❌ DNS zone records (beyond Pages domain setup)
- ❌ Cloudflare infrastructure-as-code (Terraform, etc.)
- ❌ Full DNS recovery (use Cloudflare DNS tools separately)
- ❌ Environment variable values (must be retrieved from secure storage)

### Security Reminders

- **Never commit** environment variable values to snapshots
- **Always verify** you're using read-only snapshots (no write operations)
- **Store secrets** in GitHub Secrets and Cloudflare environment variables
- **Review permissions** before granting access to team members

## Related Documentation

- **Snapshot README**: `snapshots/cloudflare/README.md` — What's captured in snapshots
- **Deployment Guide**: `docs/DEPLOYMENT_GUIDE.md` — Standard deployment procedures
- **Cloudflare Setup**: `docs/CLOUDFLARE_PAGES_SETUP.md` — Initial setup documentation

## Snapshot Automation

Snapshots are created automatically:
- **Daily**: 07:00 UTC via GitHub Actions
- **Manual**: Triggered via GitHub Actions UI (`workflow_dispatch`)

See `.github/workflows/cf_pages_snapshot.yml` for automation details.

## Support

For issues with recovery:
1. Check latest snapshot timestamp in `_smoketest.txt`
2. Verify snapshot files are valid JSON
3. Compare current configuration with snapshot using `jq` or JSON viewer
4. Consult Cloudflare Pages documentation: https://developers.cloudflare.com/pages/

---

**Last Updated**: Generated by `cf_pages_snapshot.sh` script
