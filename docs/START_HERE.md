# Getting Started with Next.js Starter Template

## Quick Start

This repository provides a production-ready Next.js 15 starter template with TypeScript, Tailwind CSS 4, and Cloudflare Pages deployment.

### Prerequisites

- Node.js (version specified in `.node-version`)
- npm, yarn, pnpm, or bun
- GitHub account
- Cloudflare account (for deployment)

## Development Setup

### Option 1: GitHub Codespaces (Recommended)

Click to create a new Codespace:
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/wdhunter645/next-starter-template)

**Important:** Codespaces requires additional Git authentication setup to push changes. See [Authentication Setup](#git-authentication-setup) below.

### Option 2: Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/wdhunter645/next-starter-template.git
   cd next-starter-template
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Git Authentication Setup

### For GitHub Codespaces

Codespaces uses a read-only token by default. To push changes:

1. Create a Personal Access Token (PAT):
   - Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
   - Generate new token (classic) with `repo` scope
   - Copy the token

2. Configure authentication:
   ```bash
   # Quick setup (no browser)
   ./fix-git-auth.sh
   
   # Or manually:
   echo "YOUR_PAT" | gh auth login --with-token
   git config --global credential.helper store
   ```

**Need help?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#git-authentication-issues)

### For Local Development

Configure Git credentials:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global credential.helper store  # or osxkeychain/wincred
```

## Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server with Cloudflare support |
| `npm run dev:wrangler` | Run with full Cloudflare Workers runtime |
| `npm run build` | Build production application |
| `npm run preview` | Build and preview with Cloudflare runtime |
| `npm run deploy:prod` | Deploy to Cloudflare Pages |
| `npm run lint` | Run ESLint code quality checks |

## Project Structure

```
├── src/
│   ├── app/          # Next.js app directory (pages, layouts)
│   └── components/   # React components
├── public/           # Static assets
├── docs/             # Documentation
├── scripts/          # Utility scripts
└── styles/           # Global styles
```

## Deployment

This template automatically deploys to Cloudflare Pages when code is pushed to `main`.

**Setup required:**
1. Configure GitHub secrets (see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md))
2. Verify API token permissions
3. Push to `main` branch to trigger deployment

**Manual deployment:**
```bash
npm run deploy:prod
```

## Next Steps

1. **Customize the template**: Edit `src/app/page.tsx` to modify the homepage
2. **Set up deployment**: Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. **Review documentation**: See `docs/` for detailed guides
4. **Configure metadata**: Update repository description and topics

## Tech Stack

- **Framework**: Next.js 15
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Deployment**: Cloudflare Pages with OpenNext

See [package.json](../package.json) for exact versions of all dependencies.

## Getting Help

- **Troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Deployment Issues**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Cloudflare Pages**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages/)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## Live Demo

A live deployment of this template is available at:
[https://next-starter-template.templates.workers.dev](https://next-starter-template.templates.workers.dev)
