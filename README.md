# Next.js Framework Starter

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/next-starter-template)

## 🚀 Quick Start

**New to this template?** Start here: **[docs/START_HERE.md](./docs/START_HERE.md)**

For deployment setup, see: **[docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)**

---

## 🔴 SECURITY NOTICE

**If you cloned this repository before October 16, 2025**: The `.env` file with secrets was accidentally committed and has been removed. **You must regenerate ALL credentials** if you use any of the exposed services.

<!-- dash-content-start -->

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It's deployed on Cloudflare Workers as a [static website](https://developers.cloudflare.com/workers/static-assets/).

This template uses [OpenNext](https://opennext.js.org/) via the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare), which works by taking the Next.js build output and transforming it, so that it can run in Cloudflare Workers.

<!-- dash-content-end -->

## Tech Stack

This starter template uses the following core dependencies:

- **Next.js**: 15.3.3
- **React**: 19.0.0
- **TypeScript**: 5.8.3
- **Tailwind CSS**: 4.1.1
- **OpenNext Cloudflare**: 1.3.0

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
- **Topics**: nextjs, typescript, tailwindcss, cloudflare-pages, cloudflare-workers, starter-template, react, opennext, nextjs-template, fullstack, cloudflare, workers, nextjs-15, react-19, tailwind-css-4

**For repository maintainers**: You can apply these settings using the helper script:
```bash
./scripts/update-repository-metadata.sh
```

Or manually via the GitHub web UI (click the gear icon ⚙️ next to "About"). See [.github/REPOSITORY_METADATA.md](./.github/REPOSITORY_METADATA.md) for detailed instructions.

## Getting Started

**For detailed setup instructions**, see **[docs/START_HERE.md](./docs/START_HERE.md)**

### Quick Start

#### Using GitHub Codespaces (Recommended)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/wdhunter645/next-starter-template)

**Note:** Codespaces requires Git authentication setup. See [docs/START_HERE.md](./docs/START_HERE.md#git-authentication-setup) for details.

#### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file (when using `npm run dev`).

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Available Commands

| Command                           | Action                                       |
| :-------------------------------- | :------------------------------------------- |
| `npm run dev`                     | Run Next.js development server (with Cloudflare support) |
| `npm run dev:wrangler`            | Build and run with Wrangler dev server (full Cloudflare runtime) |
| `npm run build`                   | Build your production Next.js site           |
| `npm run preview`                 | Build and preview with Cloudflare runtime    |
| `npm run deploy`                  | Build and deploy to Cloudflare Pages         |
| `npm run cf-typegen`              | Generate TypeScript types for Cloudflare bindings |
| `npm run lint`                    | Run ESLint to check code quality             |
| `npm run lint:fix`                | Run ESLint and auto-fix issues               |
| `npm run format`                  | Format code with Prettier                    |
| `npm run typecheck`               | Run TypeScript type checking                 |
| `npm run test`                    | Run tests with Vitest                        |
| `npm run test:watch`              | Run tests in watch mode                      |
| `npm run test:coverage`           | Run tests with coverage report               |
| `npx wrangler tail`               | View real-time logs for deployed Workers     |

## Developer Workflow

This project includes a `Makefile` for streamlined development workflows. Using `make` commands provides a convenient, consistent interface for common development tasks.

### Make Commands

All core development tasks can be run using `make`:

```bash
make dev            # Start the Next.js development server
make build          # Build the application for production
make lint           # Run ESLint to check code quality
make format         # Format code with Prettier
make test           # Run tests with Vitest
make test-watch     # Run tests in watch mode
make test-coverage  # Run tests with coverage report
make deploy         # Deploy to Cloudflare Pages (production)
make typecheck      # Run TypeScript type checking
```

**Tip**: Run `make help` to see all available commands.

### Quick Start Workflow

1. **Start development**:
   ```bash
   make dev
   ```

2. **Before committing**:
   ```bash
   make format    # Format your code
   make lint      # Check for linting issues
   make typecheck # Verify TypeScript types
   make test      # Run tests
   ```

3. **Build and deploy**:
   ```bash
   make build     # Build for production
   make deploy    # Deploy to Cloudflare
   ```

### Using npm scripts directly

You can also use npm scripts directly if preferred:
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format all files with Prettier
- `npm run typecheck` - Run TypeScript compiler checks
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Automated Deployment (GitHub Actions)

The repository is configured to automatically build and deploy to Cloudflare Pages when code is pushed to the `main` branch. The deployment workflow:

**For complete deployment setup**, see **[docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)**

**For complete website design specifications**, see **[docs/Design-spec.md](./docs/design-spec.md)**

This template uses GitHub Actions to automatically deploy to Cloudflare Pages when code is pushed to the `main` branch.

**Required GitHub Secrets:**
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages:Edit and User Details:Read permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME` - Your Cloudflare Pages project name

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

**For common issues and solutions**, see **[docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)**

Quick links:
- [Git Authentication Issues](./docs/TROUBLESHOOTING.md#git-authentication-issues)
- [Codespaces Issues](./docs/TROUBLESHOOTING.md#codespaces-issues)
- [Build and Development Issues](./docs/TROUBLESHOOTING.md#build-and-development-issues)

For deployment issues, see [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md#common-deployment-issues)
