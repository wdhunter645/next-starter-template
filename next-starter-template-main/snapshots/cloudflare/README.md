# Cloudflare Pages Snapshots

This directory contains read-only snapshots of the Cloudflare Pages project configuration and deployment metadata. These snapshots enable reproducible recovery of the Pages project settings.

## Files Generated

Each run creates timestamped JSON files:

- **`cf-project-YYYYMMDDTHHMMSSZ.json`** — Pages project configuration including build settings, environment variables (names only, not values), and project metadata
- **`cf-domains-YYYYMMDDTHHMMSSZ.json`** — Custom domain configurations
- **`cf-deployments-YYYYMMDDTHHMMSSZ.json`** — Latest 3 deployment records with build logs and metadata
- **`_smoketest.txt`** — Append-only log of successful snapshot runs (one timestamp per line)

## Data Captured

### Project Configuration (`cf-project-*.json`)
- Project name
- Production branch
- Build configuration (command, output directory)
- Environment variable names (values are NOT exported for security)
- Project creation date and metadata

### Domains (`cf-domains-*.json`)
- Custom domain names
- Domain validation status
- DNS configuration requirements

### Deployments (`cf-deployments-*.json`)
- Latest 3 deployment IDs
- Deployment status and timestamps
- Source commit SHA
- Build configuration used
- Deployment URLs

## How to Use

These snapshots are **read-only references** to assist with:

1. **Documentation** — Understanding current production configuration
2. **Recovery** — Rebuilding the Pages project if needed (see `/docs/CLOUDFLARE_RECOVERY.md`)
3. **Audit** — Tracking configuration changes over time
4. **Troubleshooting** — Comparing current settings with historical state

**Important:** These files do NOT contain:
- Cloudflare API tokens or secrets
- Environment variable values
- DNS zone records (only Pages-specific domain config)

## Security

- All files are safe to commit to the repository
- No secrets or API tokens are written to disk
- The snapshot script validates responses and redacts sensitive data
- Environment variable values are never exported

## Automation

Snapshots are created:
- **Daily** via GitHub Actions (scheduled at 07:00 UTC)
- **On-demand** via workflow_dispatch in GitHub Actions UI

See `.github/workflows/cf_pages_snapshot.yml` for the automation workflow.

## Recovery

For step-by-step recovery procedures using these snapshots, see:
**`/docs/CLOUDFLARE_RECOVERY.md`**
