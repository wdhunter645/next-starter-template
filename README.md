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

### Prerequisites

Before you begin, ensure you have Git configured with your credentials:

```bash
# Configure your Git username and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

For authentication with GitHub, you have two options:

**Option 1: HTTPS with Personal Access Token (Recommended)**

1. Create a [Personal Access Token](https://github.com/settings/tokens) with `repo` scope
2. Configure Git to use the token:
   ```bash
   # Store credentials (will prompt for username and token on first push)
   git config --global credential.helper store
   ```
3. When prompted for credentials:
   - Username: Your GitHub username
   - Password: Your Personal Access Token (not your GitHub password)

**Option 2: SSH Authentication**

1. [Generate an SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
2. [Add the SSH key to your GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
3. Update the remote URL:
   ```bash
   git remote set-url origin git@github.com:wdhunter645/next-starter-template.git
   ```

### Installation

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

Interested in contributing? Check out our [Contributing Guide](CONTRIBUTING.md) for detailed information on:
- Setting up your development environment
- Configuring Git authentication (HTTPS or SSH)
- Development workflow and best practices
- Troubleshooting common Git issues

## Troubleshooting

### Git Push Issues

If you encounter errors when pushing to the repository:

**"Authentication failed" or "Permission denied"**

1. Verify your credentials are configured:
   ```bash
   git config --list | grep user
   ```

2. If using HTTPS, ensure you're using a Personal Access Token:
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Generate a new token with `repo` scope
   - Use the token as your password when prompted

3. If the credential helper isn't prompting for credentials:
   ```bash
   # Clear stored credentials
   git credential reject
   # Or unset the credential helper temporarily
   git config --unset credential.helper
   ```

4. If using SSH, verify your key is added:
   ```bash
   ssh -T git@github.com
   ```

**"fatal: could not read Username"**

This means Git isn't configured to prompt for credentials. Fix it with:
```bash
# Enable credential prompting
git config --global credential.helper cache
# Or for macOS
git config --global credential.helper osxkeychain
# Or for Windows
git config --global credential.helper wincred
```

For more help, see the [GitHub authentication documentation](https://docs.github.com/en/authentication).
