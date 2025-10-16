# Complete Setup Guide

This guide walks you through setting up the Next.js Starter Template from scratch, whether you're developing locally or using GitHub Codespaces.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Local Development Setup](#local-development-setup)
- [GitHub Codespaces Setup](#github-codespaces-setup)
- [Environment Configuration](#environment-configuration)
- [Cloudflare Setup](#cloudflare-setup)
- [Optional Integrations](#optional-integrations)
- [Verification](#verification)
- [Next Steps](#next-steps)

## Prerequisites

Before you begin, ensure you have:

- [ ] GitHub account
- [ ] Basic knowledge of Git and command line
- [ ] Text editor or IDE (VS Code recommended)
- [ ] For local development: Node.js 18+ and npm 9+

## Initial Setup

### 1. Clone the Repository

**Option A: Using GitHub CLI**
```bash
gh repo clone wdhunter645/next-starter-template
cd next-starter-template
```

**Option B: Using Git**
```bash
git clone https://github.com/wdhunter645/next-starter-template.git
cd next-starter-template
```

**Option C: Using GitHub Codespaces**

Click the green "Code" button → "Codespaces" → "Create codespace on main"

### 2. Choose Your Development Environment

You have two options:

- **[Local Development](#local-development-setup)** - Work on your computer
- **[GitHub Codespaces](#github-codespaces-setup)** - Work in the cloud

## Local Development Setup

### Step 1: Install Node.js

**Check if already installed**:
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

**If not installed**:
- Download from [nodejs.org](https://nodejs.org/)
- Choose LTS version (Long Term Support)
- Restart terminal after installation

### Step 2: Install Dependencies

```bash
cd next-starter-template
npm install
```

**Expected output**:
```
added 1101 packages in 45s
```

**If you see errors**:
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Step 3: Configure Git

```bash
# Set your name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Configure credential helper
# macOS
git config --global credential.helper osxkeychain

# Linux
git config --global credential.helper store

# Windows
git config --global credential.helper wincred
```

### Step 4: Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your preferred editor:

```env
# Minimum required for local development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Lou Gehrig Fan Club (Dev)
```

### Step 5: Start Development Server

```bash
npm run dev
```

**Expected output**:
```
▲ Next.js 15.3.3
- Local:        http://localhost:3000
- Ready in 1.2s
```

**Visit**: [http://localhost:3000](http://localhost:3000)

✅ **Success!** You should see the Lou Gehrig Fan Club homepage.

### Step 6: Install VS Code (Optional but Recommended)

1. Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. Install and open the project:
   ```bash
   code .
   ```
3. Install recommended extensions when prompted

## GitHub Codespaces Setup

### Step 1: Create Codespace

1. Go to the [repository](https://github.com/wdhunter645/next-starter-template)
2. Click green "Code" button
3. Select "Codespaces" tab
4. Click "Create codespace on main"

Wait for the Codespace to initialize (~2-3 minutes).

### Step 2: Verify Installation

Dependencies are automatically installed. Verify with:

```bash
# Check versions
node --version
npm --version

# Check installation
npm list --depth=0
```

### Step 3: Configure Git Authentication

**Important**: Codespaces uses a read-only token by default. To push changes, you need to configure authentication.

**See the complete guide**: [docs/CODESPACES_TOKEN_SETUP.md](./CODESPACES_TOKEN_SETUP.md)

**Quick setup**:

1. Create a Personal Access Token:
   - Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
   - Generate new token (classic)
   - Select `repo` scope
   - Copy the token

2. Authenticate in Codespace:
   ```bash
   echo "YOUR_TOKEN" | gh auth login --with-token
   git config --global credential.helper store
   ```

### Step 4: Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit with code editor
code .env
```

Set development values:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Lou Gehrig Fan Club (Dev)
```

### Step 5: Start Development Server

```bash
npm run dev
```

The Codespace will automatically forward port 3000. Click "Open in Browser" when prompted.

✅ **Success!** Your app is running in Codespaces.

## Environment Configuration

### Required Variables

For **local development**, you only need:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Your Site Name
```

For **deployment**, you also need:

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

### Understanding Environment Variables

**Client-side** (accessible in browser):
- Must start with `NEXT_PUBLIC_`
- Example: `NEXT_PUBLIC_API_URL`
- Embedded in JavaScript bundle
- Safe for non-sensitive data only

**Server-side** (hidden from browser):
- No prefix required
- Example: `DATABASE_URL`
- Only accessible in server code
- Use for API keys, secrets

### Environment Variable Best Practices

```env
# ✅ Good: Clear naming, proper prefix
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=My Site

# ❌ Bad: Missing prefix (won't work in client)
SITE_URL=http://localhost:3000

# ❌ Bad: Sensitive data with NEXT_PUBLIC_ (exposed to client!)
NEXT_PUBLIC_DATABASE_PASSWORD=secret123
```

## Cloudflare Setup

Required for deploying to production.

### Step 1: Create Cloudflare Account

1. Go to [cloudflare.com](https://www.cloudflare.com/)
2. Sign up for free account
3. Verify email

### Step 2: Get Account ID

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select "Workers & Pages" from sidebar
3. Your Account ID is displayed on the right
4. Copy the ID

### Step 3: Generate API Token

1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Or create custom token with permissions:
   - Workers Scripts: Edit
   - Workers KV Storage: Edit (if using KV)
5. Click "Continue to summary"
6. Click "Create Token"
7. **Copy the token immediately** (you won't see it again!)

### Step 4: Add to Environment

```bash
# Edit .env file
code .env
```

Add your credentials:
```env
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
```

### Step 5: Authenticate Wrangler

```bash
# Login with browser
npx wrangler login

# Or use API token
export CLOUDFLARE_API_TOKEN=your_token
```

### Step 6: Configure wrangler.jsonc

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

✅ **Cloudflare setup complete!** Ready to deploy.

## Optional Integrations

### Cloudflare Web Analytics

Track visitors without cookies or privacy concerns.

**Setup**:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Analytics → Web Analytics
3. Click "Add a site"
4. Copy the token
5. Add to `.env`:
   ```env
   NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN=your_token
   ```

### Supabase Database

Add a PostgreSQL database with authentication.

**Setup**:

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get credentials from Settings → API
4. Add to `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_API_KEY=your_publishable_key
   ```

### Backblaze B2 Storage

Store images and files affordably.

**Setup**:

1. Create account at [backblaze.com](https://www.backblaze.com/b2)
2. Create bucket
3. Generate application key
4. Add to `.env`:
   ```env
   B2_KEY_ID=your_key_id
   B2_APP_KEY=your_app_key
   B2_BUCKET=your_bucket_id
   PUBLIC_B2_BASE_URL=https://your-bucket.backblazeb2.com
   ```

### Social Wall

Embed social media feeds.

**Setup**:

1. Create social wall at [elfsight.com](https://elfsight.com) or similar
2. Get embed URL
3. Add to `.env`:
   ```env
   SOCIAL_WALL_EMBED_URL=https://your-social-wall.elf.site
   ```

## Verification

### Check Installation

Run these commands to verify setup:

```bash
# 1. Check Node version
node --version
# Expected: v18.x.x or higher

# 2. Check npm version
npm --version
# Expected: 9.x.x or higher

# 3. Check dependencies installed
npm list --depth=0
# Should list all packages without errors

# 4. Run linter
npm run lint
# Expected: ✔ No ESLint warnings or errors

# 5. Build project
npm run build
# Expected: Build completes successfully

# 6. Start dev server
npm run dev
# Expected: Server starts on http://localhost:3000
```

### Check Configuration

```bash
# Verify .env exists
cat .env

# Check Git config
git config --global --list

# Check Wrangler auth (if configured)
npx wrangler whoami
```

### Test Application

Visit [http://localhost:3000](http://localhost:3000) and verify:

- [ ] Homepage loads without errors
- [ ] Navigation menu works
- [ ] All pages are accessible
- [ ] No console errors (F12 → Console tab)
- [ ] Styles are applied correctly

## Next Steps

Now that you're set up, here's what to do next:

### 1. Explore the Documentation

- **[API Reference](./API_REFERENCE.md)** - Learn about components and APIs
- **[Architecture](./ARCHITECTURE.md)** - Understand the project structure
- **[Development Workflow](./DEVELOPMENT_WORKFLOW.md)** - Learn the development process

### 2. Make Your First Change

Try editing `src/app/page.tsx`:

```typescript
export default function Home() {
  return (
    <div className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.title}>Hello from [Your Name]!</h1>
        {/* ... rest of the code ... */}
      </div>
    </div>
  );
}
```

Save the file and see the change instantly in your browser.

### 3. Deploy to Production

When ready to deploy:

```bash
# Build and deploy to Cloudflare
npm run deploy
```

See [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### 4. Customize the Application

Ideas for customization:
- Update site name and colors
- Add new pages
- Integrate with a database
- Add authentication
- Customize the design

### 5. Learn More

Resources to continue learning:
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

## Troubleshooting Setup

### Issue: npm install fails

```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 3000 already in use

```bash
# Use different port
npm run dev -- -p 3001

# Or kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9
```

### Issue: Git authentication fails

See [Git Authentication Troubleshooting](./GIT_AUTH_TROUBLESHOOTING.md)

### Issue: Build fails

```bash
# Check for errors
npm run lint
npm run build 2>&1 | tee build.log
```

Review `build.log` for specific errors.

### More Issues?

Check the [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md) for comprehensive solutions.

## Getting Help

If you're stuck:

1. **Check documentation** in the `docs/` directory
2. **Search issues** on [GitHub](https://github.com/wdhunter645/next-starter-template/issues)
3. **Open a new issue** with detailed information
4. **Ask in discussions** for general questions

## Checklist

Use this checklist to track your setup progress:

### Basic Setup
- [ ] Node.js and npm installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Development server runs (`npm run dev`)
- [ ] Application loads in browser

### Git Configuration
- [ ] Git user name configured
- [ ] Git email configured
- [ ] Credential helper configured
- [ ] Can push to GitHub

### Cloudflare Setup (for deployment)
- [ ] Cloudflare account created
- [ ] Account ID obtained
- [ ] API token generated
- [ ] Wrangler authenticated
- [ ] `wrangler.jsonc` configured

### Development Environment
- [ ] VS Code installed (optional)
- [ ] Recommended extensions installed
- [ ] Linting works (`npm run lint`)
- [ ] Build succeeds (`npm run build`)

### Optional Integrations
- [ ] Web analytics configured (optional)
- [ ] Database configured (optional)
- [ ] Storage configured (optional)

✅ **Setup Complete!** You're ready to start developing.

---

**Congratulations!** You've successfully set up the Next.js Starter Template. Happy coding! 🚀
