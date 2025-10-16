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

### Using GitHub Codespaces

This repository used to include a Codespaces devcontainer, but the devcontainer configuration has been removed to avoid persistent permission and token issues. If you prefer Codespaces, you can still open one manually:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/wdhunter645/next-starter-template)

Note: The project no longer supplies an automatic devcontainer. You will need to install dependencies yourself and configure authentication. If you encounter Git authentication issues in Codespaces, follow the instructions in `CONTRIBUTING.md` (search for "Git Authentication in Codespaces").

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

- [Git Authentication Troubleshooting](./docs/GIT_AUTH_TROUBLESHOOTING.md)
- [Codespaces Crash Recovery](./docs/CODESPACES_CRASH_RECOVERY.md)
- [Quick Fix Guide](./docs/QUICK_FIX.md)
