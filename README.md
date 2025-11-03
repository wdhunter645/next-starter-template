# Next.js Framework Starter

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/next-starter-template)

## ⚠️ CLOUDFLARE PAGES DASHBOARD UPDATE REQUIRED

**If you're seeing preview build failures**, the Cloudflare Pages dashboard settings need to be updated to use the new build configuration.

**👉 [Update Cloudflare Dashboard Settings →](./CLOUDFLARE_DASHBOARD_UPDATE.md)** | **[Quick Reference →](./QUICK_REFERENCE.md)**

**Time to fix**: ~2 minutes | **Impact**: Preview builds and deployments will work

---

## ⚠️ DEPLOYMENT SETUP REQUIRED

**Automated deployments are currently not working.** The GitHub Actions workflow builds successfully but fails to deploy to Cloudflare Pages due to a missing API token permission.

**👉 Repository Owner Action Required**: [Complete Cloudflare Setup Checklist →](./CLOUDFLARE_SETUP_CHECKLIST.md)

**Time to fix**: ~5 minutes | **Impact**: Automated deployments will work on every push to main

---

## 🔴 SECURITY NOTICE

**If you cloned this repository before October 16, 2025**: The `.env` file with secrets was accidentally committed and has been removed. **You must regenerate ALL credentials** if you use any of the exposed services. See [docs/SECURITY_NOTICE.md](./docs/SECURITY_NOTICE.md) for details and action steps.

<!-- dash-content-start -->

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It's deployed on Cloudflare Pages using [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages).

This template uses the Cloudflare next-on-pages adapter, which transforms the Next.js build output so it can run on Cloudflare Pages.

<!-- dash-content-end -->

## Tech Stack

This starter template uses the following core dependencies:

- **Next.js**: 15.3.3
- **React**: 19.0.0
- **TypeScript**: 5.8.3
- **Tailwind CSS**: 4.1.1
- **@cloudflare/next-on-pages**: 1.13.16

All dependencies are kept minimal and production-ready. See [package.json](./package.json) for the complete dependency list.

## Getting Started with This Template

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/next-starter-template
```

A live public deployment of this template is available at [https://next-starter-template.templates.workers.dev](https://next-starter-template.templates.workers.dev)

## 📋 Repository Metadata

To improve discoverability and clearly communicate the template's value, we recommend adding the following metadata to the GitHub repository:

- **Description**: A modern Next.js 15 starter template with TypeScript, Tailwind CSS 4, React 19, and Cloudflare Pages deployment configuration
- **Website**: https://next-starter-template.templates.workers.dev
- **Topics**: nextjs, typescript, tailwindcss, cloudflare-pages, next-on-pages, starter-template, react, nextjs-template, fullstack, cloudflare, nextjs-15, react-19, tailwind-css-4

**For repository maintainers**: You can apply these settings using the helper script:
```bash
./scripts/update-repository-metadata.sh
```

Or manually via the GitHub web UI (click the gear icon ⚙️ next to "About"). See [.github/REPOSITORY_METADATA.md](./.github/REPOSITORY_METADATA.md) for detailed instructions.

## Getting Started

### Using GitHub Codespaces (Recommended)

This repository is configured for GitHub Codespaces. Click the button below to create a new Codespace:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/wdhunter645/next-starter-template)

When working in Codespaces, dependencies will be installed automatically. The development server will be available on port 3000.

**Important Codespaces Setup:**
- **Git Authentication**: Codespaces uses a read-only token by default. To push changes, you need to configure your personal GitHub token. **[See CODESPACES_TOKEN_SETUP.md for complete setup guide →](./docs/CODESPACES_TOKEN_SETUP.md)**
- **Quick Fix**: If you encounter Git authentication issues, **[see START_HERE.md for immediate fix →](./START_HERE.md)** or the [quick fix below](#git-push-fails-in-codespaces).

### Local Development

First, run:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

#### Git Authentication Setup (Local Development)

Before you can push changes, configure Git credentials:

```bash
# Configure your Git username and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Configure credential helper
git config --global credential.helper store  # Linux
# OR
git config --global credential.helper osxkeychain  # macOS
# OR
git config --global credential.helper wincred  # Windows
```

When you push for the first time, you'll be prompted for:
- **Username**: Your GitHub username
- **Password**: Your [Personal Access Token](https://github.com/settings/tokens) (NOT your GitHub password)

For detailed authentication setup, see [CONTRIBUTING.md](./CONTRIBUTING.md#git-authentication-for-local-development).

Then run the development server (using the package manager of your choice):

```bash
npm run dev
```

This starts the Next.js dev server on port 3000. Open [http://localhost:3000](http://localhost:3000) to see your application.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Available Commands

| Command | Action |
| :------ | :----- |
| `npm run dev` | Start Next.js development server on port 3000 |
| `npm run build` | Build production Next.js site |
| `npm run cf:build` (or `npm run build:cf`) | Build and adapt for Cloudflare Pages |
| `npm run start` | Start production server locally |
| `npm run lint` | Run ESLint to check code quality |

See [BUILD.md](./BUILD.md) for detailed build documentation.

## Deployment to Cloudflare Pages

This template is designed for deployment to Cloudflare Pages using the `@cloudflare/next-on-pages` adapter.

### Cloudflare Pages Configuration

In your Cloudflare Pages project dashboard, set:

- **Build command**: `npm run build:cf` (or `npm run cf:build`)
- **Build output directory**: `.vercel/output/static`
- **Node version**: `20`

See [CLOUDFLARE_PAGES_CONFIG.md](./CLOUDFLARE_PAGES_CONFIG.md) and [BUILD.md](./BUILD.md) for complete deployment documentation.

### CI/CD

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically validates builds on pull requests. Cloudflare Pages handles deployments automatically via its GitHub integration.

The deployment requires the following GitHub repository secrets to be configured:
- `CLOUDFLARE_API_TOKEN` or `CF_API_TOKEN`: Your Cloudflare API token with Pages:Edit permission
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME`: Your Cloudflare Pages project name

For troubleshooting deployment issues, see [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md).

### Reviewing Cloudflare Build Logs

To review Cloudflare Pages deployment history and identify builds that should be rerun:

```bash
./scripts/review-cloudflare-builds.sh
```

This script analyzes deployments from the last 72 hours and provides:
- Summary of successful, failed, and canceled builds
- Detailed information about problematic deployments
- Recommendations on which builds to rerun

For detailed usage instructions, see [CLOUDFLARE_BUILD_REVIEW.md](./CLOUDFLARE_BUILD_REVIEW.md).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup instructions
- Git authentication troubleshooting (especially for Codespaces)
- Pull request guidelines
- Code style guide

## Troubleshooting

### Git Push Fails in Codespaces

If you're experiencing authentication issues when pushing to GitHub from Codespaces:

**The Issue**: Codespaces provides a read-only ephemeral token by default that doesn't have Git CLI push permissions.

**The Solution**: Configure your personal GitHub token with full repository access.

📖 **[Complete Setup Guide: docs/CODESPACES_TOKEN_SETUP.md](./docs/CODESPACES_TOKEN_SETUP.md)**

This comprehensive guide covers:
- Creating a Personal Access Token (PAT) with proper scopes
- Configuring Codespaces secrets (recommended)
- Manual token configuration for individual Codespaces
- Troubleshooting common authentication issues
- Security best practices

#### Quick Fix (Manual Configuration)

If **Codespaces isn't letting you log out** to sign back in with your account-level token:

👉 **See: [docs/CODESPACES_LOGOUT.md](./docs/CODESPACES_LOGOUT.md)** - Complete guide for forcing logout and re-authentication

Quick fix:
```bash
# Option 1: Use the helper script
./fix-git-auth.sh

# Option 2: Manual commands
gh auth logout --hostname github.com 2>/dev/null || true
rm -f ~/.git-credentials
echo "YOUR_PAT" | gh auth login --with-token
git config --global credential.helper store
git push
# Enter username and PAT when prompted
```

For persistent configuration across all Codespaces, use Codespaces Secrets as described in the [complete setup guide](./docs/CODESPACES_TOKEN_SETUP.md).

#### 🔴 Codespaces Won't Let You Log Out?

### Codespaces Crashed or Extensions Keep Restarting

If your Codespace has crashed or remote extensions are bouncing on/off:

1. See the [Codespaces Crash Recovery Guide](./docs/CODESPACES_CRASH_RECOVERY.md) for comprehensive recovery steps
2. Try stopping and restarting your Codespace from https://github.com/codespaces
3. If you have uncommitted changes, use GitHub's "Export changes to branch" feature

Quick recovery:
```bash
# Save your work immediately
git add . && git commit -m "WIP: saving before recovery"

# Or stash changes
git stash save "Before crash recovery"

# Kill hung processes
pkill -9 node
pkill -9 git
```

### Package.json Merge Conflicts

If you encounter merge conflicts in `package.json` after merging branches:

```bash
./scripts/fix-package-json-conflicts.sh
```

This script automatically:
- Resolves merge conflict markers by keeping the first side (pre-`=======`)
- Validates the resulting JSON
- Creates a timestamped backup before modifications
- Ensures Next-on-Pages adapter is configured
- Installs required dependencies
- Commits and pushes changes to retrigger CI deployments

**Note**: The script keeps the "ours" side (first half) of conflicts. Review the changes before running if you need to preserve specific changes from the "theirs" side.

For more troubleshooting resources:
- [Codespaces Token Setup](./docs/CODESPACES_TOKEN_SETUP.md)
- [Git Authentication Troubleshooting](./docs/GIT_AUTH_TROUBLESHOOTING.md)
- [Codespaces Crash Recovery](./docs/CODESPACES_CRASH_RECOVERY.md)
- [Quick Fix Guide](./docs/QUICK_FIX.md)
