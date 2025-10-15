# Next.js Framework Starter

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/next-starter-template)

<!-- dash-content-start -->

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It's deployed on Cloudflare Workers as a [static website](https://developers.cloudflare.com/workers/static-assets/).

This template uses [OpenNext](https://opennext.js.org/) via the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare), which works by taking the Next.js build output and transforming it, so that it can run in Cloudflare Workers.

<!-- dash-content-end -->

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/next-starter-template
```

A live public deployment of this template is available at [https://next-starter-template.templates.workers.dev](https://next-starter-template.templates.workers.dev)

## Getting Started

### Using GitHub Codespaces (Recommended)

This repository is configured for GitHub Codespaces. Click the button below to create a new Codespace:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/wdhunter645/next-starter-template)

When working in Codespaces, dependencies will be installed automatically. The development server will be available on port 3000.

**Note**: If you encounter Git authentication issues in Codespaces, see the [CONTRIBUTING.md](./CONTRIBUTING.md#git-authentication-in-codespaces) guide for solutions.

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

Then run the development server (using the package manager of your choice):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Deploying To Production

| Command                           | Action                                       |
| :-------------------------------- | :------------------------------------------- |
| `npm run build`                   | Build your production site                   |
| `npm run preview`                 | Preview your build locally, before deploying |
| `npm run build && npm run deploy` | Deploy your production site to Cloudflare    |
| `npm wrangler tail`               | View real-time logs for all Workers          |

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

### Codespaces Won't Start or "Nothing Works"

If your Codespace fails to start, crashes immediately, or displays errors about the devcontainer configuration:

1. **The devcontainer.json file may be corrupted** - This was previously an issue with malformed JSON syntax
2. **Solution**: Delete your existing Codespace and create a new one
3. **See**: [docs/DEVCONTAINER_FIX.md](./docs/DEVCONTAINER_FIX.md) for details about the fix that was applied

The latest version of this repository has a corrected `.devcontainer/devcontainer.json` file. If you created your Codespace before this fix, you'll need to rebuild or recreate it.

### Git Push Fails in Codespaces

If you're experiencing authentication issues when pushing to GitHub from Codespaces:

1. The Codespaces implicit token may not have Git CLI permissions
2. You'll need to authenticate using a Personal Access Token (PAT)
3. See the detailed solution in [CONTRIBUTING.md - Git Authentication](./CONTRIBUTING.md#git-authentication-in-codespaces)

#### 🔴 Codespaces Won't Let You Log Out?

If **Codespaces isn't letting you log out** to sign back in with your account-level token:

👉 **See: [docs/CODESPACES_LOGOUT.md](./docs/CODESPACES_LOGOUT.md)** - Complete guide for forcing logout and re-authentication

Quick fix:
```bash
# Authenticate using GitHub CLI (recommended)
gh auth login

# Or configure Git with a PAT
git config --global credential.helper store
# Then push - you'll be prompted for your GitHub username and PAT
```

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

For more troubleshooting resources:
- [Devcontainer Configuration Fix](./docs/DEVCONTAINER_FIX.md) - Fix for "nothing works" issue
- [Git Authentication Troubleshooting](./docs/GIT_AUTH_TROUBLESHOOTING.md)
- [Codespaces Crash Recovery](./docs/CODESPACES_CRASH_RECOVERY.md)
- [Quick Fix Guide](./docs/QUICK_FIX.md)
