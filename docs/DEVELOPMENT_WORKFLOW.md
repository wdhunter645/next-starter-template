# Development Workflow Guide

This guide covers the complete development workflow for the Next.js Starter Template, from setting up your environment to deploying changes.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Daily Development Workflow](#daily-development-workflow)
- [Code Style and Standards](#code-style-and-standards)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Available Scripts](#available-scripts)
- [Hot Tips](#hot-tips)
- [Common Tasks](#common-tasks)
- [Troubleshooting Development Issues](#troubleshooting-development-issues)

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **npm**: v9 or higher (comes with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))
- **VS Code**: Recommended editor ([Download](https://code.visualstudio.com/))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/wdhunter645/next-starter-template.git
cd next-starter-template

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app.

## Development Environment Setup

### 1. IDE Configuration (VS Code)

The project includes a workspace configuration:

**Open the workspace**:
```bash
code workspaces-main.code-workspace
```

**Recommended Extensions** (auto-suggested when opening):
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

**Install extensions**:
```bash
# From VS Code command palette (Cmd/Ctrl + Shift + P)
> Extensions: Show Recommended Extensions
```

### 2. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your development values:

```env
# Development defaults
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Lou Gehrig Fan Club (Dev)

# Optional: Add other services for development
CLOUDFLARE_ACCOUNT_ID=your_dev_account_id
```

**Note**: The `.env` file is gitignored. Never commit secrets!

### 3. Verify Setup

```bash
# Check Node version
node --version  # Should be 18.x or higher

# Check npm version
npm --version   # Should be 9.x or higher

# Verify installation
npm run lint    # Should pass with no errors
npm run build   # Should build successfully
```

## Daily Development Workflow

### Morning Setup

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start development server
npm run dev
```

### During Development

```bash
# Terminal 1: Development server (keep running)
npm run dev

# Terminal 2: Run linting as you work
npm run lint

# Terminal 3: Run TypeScript checks
npm run check
```

### Before Committing

```bash
# 1. Lint your code
npm run lint

# 2. Build to check for errors
npm run build

# 3. Preview production build
npm run preview

# 4. Stage and commit changes
git add .
git commit -m "feat: add new feature"

# 5. Push to remote
git push origin your-branch-name
```

## Code Style and Standards

### TypeScript

**Strict Mode**: The project uses TypeScript strict mode.

**Type Safety**:
```typescript
// ✅ Good: Properly typed
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com"
};

// ❌ Bad: Using 'any'
const user: any = { /* ... */ };
```

**Import Aliases**:
```typescript
// ✅ Use path aliases
import Header from "@/components/Header";

// ❌ Avoid relative paths when possible
import Header from "../../components/Header";
```

### React Components

**Server Components (Default)**:
```typescript
// src/app/page.tsx
export default function HomePage() {
  return <div>Server Component</div>;
}
```

**Client Components** (when needed):
```typescript
// src/components/InteractiveButton.tsx
"use client";

import { useState } from "react";

export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**When to use Client Components**:
- State management (`useState`, `useReducer`)
- Effects (`useEffect`)
- Event handlers (`onClick`, `onChange`)
- Browser APIs
- Custom hooks

### Styling

**Tailwind Utilities** (preferred):
```tsx
<div className="flex items-center justify-center p-4">
  <h1 className="text-4xl font-bold">Hello</h1>
</div>
```

**CSS Modules** (for complex components):
```tsx
// Component.tsx
import styles from "./Component.module.css";

export default function Component() {
  return <div className={styles.container}>Content</div>;
}
```

**Global Styles** (sparingly):
```css
/* globals.css */
:root {
  --foreground: #000;
  --background: #fff;
}
```

### File Naming

- **Components**: PascalCase - `Header.tsx`, `SocialWall.tsx`
- **Pages**: lowercase - `page.tsx`, `layout.tsx`
- **Utilities**: camelCase - `formatDate.ts`, `apiClient.ts`
- **Styles**: Match component - `Header.module.css`

### Code Organization

```
src/
├── app/              # Pages and routes
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── [feature]/    # Feature directories
├── components/       # Reusable components
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/              # Utility functions (create if needed)
│   └── utils.ts
└── types/            # TypeScript types (create if needed)
    └── index.ts
```

## Testing

### Manual Testing

**Development Mode**:
```bash
npm run dev
# Test at http://localhost:3000
```

**Production Build**:
```bash
npm run build && npm run preview
# Test at http://localhost:3000
```

### Testing Checklist

When testing features:

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari (if available)
- [ ] Test on mobile viewport (Chrome DevTools)
- [ ] Check browser console for errors
- [ ] Verify network requests (DevTools Network tab)
- [ ] Test with slow 3G throttling
- [ ] Verify accessibility (Lighthouse)

### Automated Testing (Future)

The project currently doesn't include automated tests. Consider adding:

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright or Cypress
- **Type Checking**: Already configured with TypeScript

## Git Workflow

### Branch Strategy

**Main Branches**:
- `main` - Production-ready code
- `develop` - Integration branch (if used)

**Feature Branches**:
```bash
# Create feature branch
git checkout -b feature/add-calendar-view

# Work on feature
git add .
git commit -m "feat: implement calendar view"

# Push to remote
git push origin feature/add-calendar-view

# Create Pull Request on GitHub
```

### Commit Messages

Follow conventional commits:

**Format**: `type(scope): description`

**Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples**:
```bash
git commit -m "feat: add membership registration form"
git commit -m "fix: resolve navigation menu alignment issue"
git commit -m "docs: update API reference"
git commit -m "refactor: simplify header component logic"
```

### Pull Request Process

1. **Create PR** with clear description
2. **Link issues**: Use "Fixes #33" in description
3. **Request review** from team members
4. **Address feedback** with new commits
5. **Merge** when approved

## Available Scripts

### Development

```bash
# Start development server
npm run dev
# Starts Next.js dev server on http://localhost:3000
# Hot reload enabled
# OpenNext Cloudflare dev mode active

# Build for production
npm run build
# Compiles TypeScript
# Optimizes assets
# Generates static pages
# Creates .next/ directory

# Preview production build
npm run preview
# Builds with OpenNext
# Starts local preview server
# Test production behavior locally

# Start production server (after build)
npm start
# Runs Next.js in production mode
# Not typically used with Cloudflare deployment
```

### Code Quality

```bash
# Run ESLint
npm run lint
# Checks for code quality issues
# Auto-fix: npm run lint -- --fix

# Type check
npm run check
# Runs build + TypeScript compiler
# Verifies type safety
```

### Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy
# Runs opennextjs-cloudflare build
# Deploys to Cloudflare Workers
# Requires Wrangler authentication

# Generate Cloudflare types
npm run cf-typegen
# Creates TypeScript types for Workers bindings
# Updates env.d.ts
```

### Utilities

```bash
# View Worker logs
npx wrangler tail
# Real-time log streaming from Cloudflare

# Wrangler commands
npx wrangler --help
# Access full Wrangler CLI

# Clean build artifacts
rm -rf .next .open-next
# Fresh start for troubleshooting
```

## Hot Tips

### Development Speed

**Use Fast Refresh**:
- Save file → Instant preview
- Preserves component state
- Shows errors in browser

**Terminal Shortcuts**:
```bash
# Clear console
Ctrl + L (or Cmd + K on Mac)

# Stop server
Ctrl + C

# Previous command
Up Arrow
```

**Browser DevTools**:
```
F12          - Open DevTools
Cmd/Ctrl + R - Reload page
Cmd/Ctrl + Shift + R - Hard reload (clear cache)
```

### VS Code Tips

**Quick Actions**:
```
Cmd/Ctrl + P        - Quick file open
Cmd/Ctrl + Shift + P - Command palette
Cmd/Ctrl + B        - Toggle sidebar
Cmd/Ctrl + J        - Toggle terminal
Cmd/Ctrl + `        - Focus terminal
```

**Multi-cursor Editing**:
```
Alt + Click         - Add cursor
Cmd/Ctrl + D        - Select next occurrence
Cmd/Ctrl + Shift + L - Select all occurrences
```

### Next.js Tips

**Link Navigation**:
```tsx
// ✅ Use Link for client-side navigation
import Link from "next/link";
<Link href="/about">About</Link>

// ❌ Avoid <a> tags for internal links
<a href="/about">About</a>
```

**Image Optimization**:
```tsx
// ✅ Use Next.js Image component
import Image from "next/image";
<Image src="/logo.png" alt="Logo" width={200} height={100} />

// ❌ Avoid plain <img> tags
<img src="/logo.png" alt="Logo" />
```

**Metadata**:
```tsx
// In page.tsx
export const metadata = {
  title: "Page Title",
  description: "Page description"
};
```

## Common Tasks

### Adding a New Page

```bash
# 1. Create directory
mkdir -p src/app/new-page

# 2. Create page.tsx
cat > src/app/new-page/page.tsx << 'EOF'
export default function NewPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold">New Page</h1>
    </div>
  );
}
EOF

# 3. Add to navigation in Header.tsx
```

### Adding a Component

```bash
# 1. Create component file
touch src/components/MyComponent.tsx

# 2. Add component code
# 3. Export and use in pages
```

### Adding Styles

**Option 1: Tailwind Classes**
```tsx
<div className="bg-blue-500 text-white p-4">Content</div>
```

**Option 2: CSS Module**
```bash
# 1. Create CSS module
touch src/components/MyComponent.module.css

# 2. Import in component
import styles from "./MyComponent.module.css";
```

### Environment Variables

**Add Client-Side Variable**:
```env
# .env
NEXT_PUBLIC_API_URL=https://api.example.com
```

**Add Server-Side Variable**:
```env
# .env
DATABASE_URL=postgresql://localhost:5432/db
```

**Access in Code**:
```typescript
// Client or server
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Server-only
const dbUrl = process.env.DATABASE_URL;
```

## Troubleshooting Development Issues

### Port 3000 Already in Use

```bash
# Option 1: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
npm run dev -- -p 3001
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Regenerate types
npm run cf-typegen

# Full type check
npm run check
```

### Styles Not Updating

```bash
# Hard refresh in browser
Cmd/Ctrl + Shift + R

# Restart dev server
# Stop with Ctrl+C, then:
npm run dev
```

### Build Fails

```bash
# Clean and rebuild
rm -rf .next
npm run build

# Check for errors in output
```

### Git Issues

```bash
# Unstage all changes
git reset

# Discard all changes
git checkout .

# View what changed
git status
git diff
```

## Best Practices

### Do's ✅

- **Commit often** with clear messages
- **Test locally** before pushing
- **Run linter** before committing
- **Use TypeScript** for type safety
- **Follow conventions** in existing code
- **Ask questions** when unsure

### Don'ts ❌

- **Don't commit** `.env` file
- **Don't use** `any` type
- **Don't skip** linting
- **Don't commit** broken code
- **Don't push** directly to main
- **Don't ignore** TypeScript errors

## Next Steps

Ready to develop? Here's your roadmap:

1. ✅ Set up development environment
2. ✅ Understand project structure
3. 🔄 Make your first change
4. 🔄 Create a feature branch
5. 🔄 Submit your first PR
6. 🔄 Deploy to staging
7. 🔄 Deploy to production

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [VS Code Tips](https://code.visualstudio.com/docs)

## Getting Help

Need assistance?

1. Check [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Review [docs/](../docs/) directory
3. Search [GitHub Issues](https://github.com/wdhunter645/next-starter-template/issues)
4. Ask in project discussions

Happy coding! 🚀
