# Troubleshooting Guide

This comprehensive guide covers common issues and solutions for the Next.js Starter Template.

## Table of Contents

- [Development Issues](#development-issues)
- [Build Issues](#build-issues)
- [Deployment Issues](#deployment-issues)
- [Git and GitHub Issues](#git-and-github-issues)
- [Environment Variable Issues](#environment-variable-issues)
- [Performance Issues](#performance-issues)
- [Cloudflare Specific Issues](#cloudflare-specific-issues)
- [Getting Additional Help](#getting-additional-help)

## Development Issues

### Issue: Development Server Won't Start

**Symptoms**:
```
Error: EADDRINUSE: address already in use :::3000
```

**Solution**:

**Option 1**: Kill process on port 3000
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Option 2**: Use different port
```bash
npm run dev -- -p 3001
```

---

### Issue: Hot Reload Not Working

**Symptoms**: Changes don't appear after saving files

**Solutions**:

1. **Hard refresh browser**:
   ```
   Cmd/Ctrl + Shift + R
   ```

2. **Restart dev server**:
   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```

3. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

4. **Check file watchers limit** (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

---

### Issue: Module Not Found

**Symptoms**:
```
Module not found: Can't resolve '@/components/Header'
```

**Solutions**:

1. **Verify import path**:
   ```typescript
   // ✅ Correct
   import Header from "@/components/Header";
   
   // ❌ Wrong
   import Header from "@/components/header";
   ```

2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check tsconfig.json paths**:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

---

### Issue: TypeScript Errors

**Symptoms**: Red squiggly lines, type errors

**Solutions**:

1. **Restart TypeScript server** (VS Code):
   ```
   Cmd/Ctrl + Shift + P → TypeScript: Restart TS Server
   ```

2. **Check type definitions**:
   ```bash
   npm run cf-typegen
   ```

3. **Verify types are installed**:
   ```bash
   npm install --save-dev @types/node @types/react @types/react-dom
   ```

4. **Clear TypeScript cache**:
   ```bash
   rm -rf .next node_modules/.cache
   ```

---

### Issue: Styles Not Applying

**Symptoms**: CSS changes don't show up

**Solutions**:

1. **Check Tailwind class names**:
   ```tsx
   // ✅ Correct
   <div className="flex items-center">
   
   // ❌ Wrong (string not classes)
   <div className="flex: true; items: center;">
   ```

2. **Verify CSS Module import**:
   ```typescript
   import styles from "./Component.module.css";
   ```

3. **Hard refresh**:
   ```
   Cmd/Ctrl + Shift + R
   ```

4. **Check PostCSS config** (`postcss.config.mjs`):
   ```javascript
   export default {
     plugins: {
       tailwindcss: {},
     },
   };
   ```

---

## Build Issues

### Issue: Build Fails with TypeScript Errors

**Symptoms**:
```
Type error: Property 'X' does not exist on type 'Y'
```

**Solutions**:

1. **Fix type errors**:
   ```bash
   npm run check
   # Review errors and fix
   ```

2. **Temporary workaround** (not recommended):
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "skipLibCheck": true
     }
   }
   ```

3. **Check for implicit any**:
   ```typescript
   // ❌ Bad
   function example(param) { }
   
   // ✅ Good
   function example(param: string) { }
   ```

---

### Issue: Build Fails with Memory Error

**Symptoms**:
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed
```

**Solutions**:

1. **Increase Node memory**:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build
   ```

2. **Add to package.json**:
   ```json
   {
     "scripts": {
       "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
     }
   }
   ```

3. **Clear caches**:
   ```bash
   rm -rf .next node_modules/.cache
   npm install
   npm run build
   ```

---

### Issue: Build Succeeds But Pages Missing

**Symptoms**: Some pages show 404 in production

**Solutions**:

1. **Check page file names**:
   ```
   ✅ src/app/about/page.tsx
   ❌ src/app/about/index.tsx
   ```

2. **Verify build output**:
   ```bash
   npm run build
   # Check the route list in output
   ```

3. **Check dynamic routes**:
   ```
   ✅ src/app/posts/[id]/page.tsx
   ❌ src/app/posts/:id/page.tsx
   ```

---

## Deployment Issues

### Issue: Wrangler Authentication Failed

**Symptoms**:
```
Error: Authentication error
```

**Solutions**:

1. **Re-authenticate**:
   ```bash
   npx wrangler login
   ```

2. **Use API token**:
   ```bash
   export CLOUDFLARE_API_TOKEN=your_token
   npm run deploy
   ```

3. **Check token permissions**:
   - Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Verify "Workers Scripts:Edit" permission

---

### Issue: Deployment Timeout

**Symptoms**:
```
Error: Request timed out
```

**Solutions**:

1. **Check bundle size**:
   ```bash
   npm run build
   # Review bundle sizes in output
   ```

2. **Optimize dependencies**:
   ```bash
   # Remove unused packages
   npm uninstall unused-package
   ```

3. **Split code**:
   ```typescript
   // Use dynamic imports
   const Component = dynamic(() => import('./Component'));
   ```

4. **Try again**:
   ```bash
   # Network issues may resolve
   npm run deploy
   ```

---

### Issue: 404 on Deployed Site

**Symptoms**: All routes return 404 after deployment

**Solutions**:

1. **Check wrangler.jsonc routes**:
   ```jsonc
   {
     "routes": [
       {
         "pattern": "your-domain.com/*",
         "zone_name": "your-domain.com"
       }
     ]
   }
   ```

2. **Verify Worker is deployed**:
   - Check Cloudflare Dashboard
   - Workers & Pages section
   - Verify Worker shows as "Active"

3. **Check DNS settings**:
   ```bash
   dig your-domain.com
   # Should point to Cloudflare
   ```

---

### Issue: Environment Variables Not Working in Production

**Symptoms**: Features work locally but fail in production

**Solutions**:

1. **Check variable naming**:
   ```
   ✅ Client: NEXT_PUBLIC_API_URL
   ❌ Client: API_URL (won't work)
   ```

2. **Set production variables**:
   ```bash
   # For sensitive data
   npx wrangler secret put API_KEY
   
   # For non-sensitive data (wrangler.jsonc)
   {
     "vars": {
       "API_URL": "https://api.example.com"
     }
   }
   ```

3. **Re-deploy after adding variables**:
   ```bash
   npm run deploy
   ```

---

## Git and GitHub Issues

### Issue: Git Push Authentication Failed

**Symptoms**:
```
remote: Permission to repository denied
fatal: Authentication failed
```

**Solutions**:

1. **Use Personal Access Token**:
   ```bash
   # Create token at: https://github.com/settings/tokens
   # Use token as password when prompted
   git push
   ```

2. **Configure credential helper**:
   ```bash
   # macOS
   git config --global credential.helper osxkeychain
   
   # Linux
   git config --global credential.helper store
   
   # Windows
   git config --global credential.helper wincred
   ```

3. **Use SSH instead of HTTPS**:
   ```bash
   # Change remote URL
   git remote set-url origin git@github.com:wdhunter645/next-starter-template.git
   ```

**For Codespaces**: See [docs/CODESPACES_TOKEN_SETUP.md](./CODESPACES_TOKEN_SETUP.md)

---

### Issue: Merge Conflicts

**Symptoms**:
```
CONFLICT (content): Merge conflict in src/app/page.tsx
```

**Solutions**:

1. **View conflicts**:
   ```bash
   git status
   # Lists files with conflicts
   ```

2. **Resolve manually**:
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Their changes
   >>>>>>> branch-name
   ```
   
   Keep the code you want, remove markers.

3. **Use merge tool**:
   ```bash
   git mergetool
   ```

4. **Abort merge**:
   ```bash
   git merge --abort
   ```

5. **Complete resolution**:
   ```bash
   git add .
   git commit -m "Resolve merge conflicts"
   ```

---

## Environment Variable Issues

### Issue: Environment Variable Undefined

**Symptoms**: `process.env.VARIABLE` returns `undefined`

**Solutions**:

1. **Check .env file exists**:
   ```bash
   ls -la .env
   ```

2. **Verify naming convention**:
   ```env
   # Client-side (must have NEXT_PUBLIC_ prefix)
   NEXT_PUBLIC_API_URL=https://api.example.com
   
   # Server-side (no prefix needed)
   DATABASE_URL=postgresql://localhost:5432/db
   ```

3. **Restart dev server**:
   ```bash
   # Environment variables are loaded at startup
   npm run dev
   ```

4. **Check .env is not commented**:
   ```env
   # ❌ This is commented
   # API_KEY=abc123
   
   # ✅ This works
   API_KEY=abc123
   ```

---

### Issue: Environment Variable in Browser Shows Undefined

**Symptoms**: Works on server, undefined in browser

**Solution**:

Add `NEXT_PUBLIC_` prefix:
```env
# ❌ Wrong (server-only)
API_URL=https://api.example.com

# ✅ Correct (available in browser)
NEXT_PUBLIC_API_URL=https://api.example.com
```

**Usage**:
```typescript
// ✅ In browser components
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ This won't work in browser
const apiUrl = process.env.API_URL;
```

---

## Performance Issues

### Issue: Slow Page Load

**Symptoms**: Pages take long to load

**Solutions**:

1. **Check bundle size**:
   ```bash
   npm run build
   # Review size warnings in output
   ```

2. **Optimize images**:
   ```tsx
   // ✅ Use Next.js Image
   import Image from "next/image";
   <Image src="/large-image.jpg" alt="..." width={800} height={600} />
   
   // ❌ Don't use regular img
   <img src="/large-image.jpg" />
   ```

3. **Lazy load components**:
   ```typescript
   import dynamic from 'next/dynamic';
   
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <p>Loading...</p>
   });
   ```

4. **Enable static generation**:
   ```typescript
   // Force static generation
   export const dynamic = 'force-static';
   ```

---

### Issue: High Memory Usage in Development

**Symptoms**: Dev server consumes lots of RAM

**Solutions**:

1. **Reduce file watchers**:
   ```bash
   # Only watch src directory
   npm run dev
   ```

2. **Close unused files** in editor

3. **Disable source maps** (temporary):
   ```javascript
   // next.config.ts
   const nextConfig = {
     productionBrowserSourceMaps: false,
   };
   ```

4. **Restart dev server** periodically

---

## Cloudflare Specific Issues

### Issue: Worker Exceeds CPU Limit

**Symptoms**:
```
Error: Worker exceeded CPU time limit
```

**Solutions**:

1. **Optimize server components**:
   - Reduce computation in render
   - Cache expensive operations
   - Use static generation where possible

2. **Check for infinite loops**:
   ```typescript
   // ❌ Dangerous
   while (true) { /* ... */ }
   
   // ✅ Use for loop with limit
   for (let i = 0; i < 100; i++) { /* ... */ }
   ```

3. **Profile code**:
   ```bash
   npx wrangler tail
   # Monitor CPU time in logs
   ```

---

### Issue: Worker Exceeds Memory Limit

**Symptoms**:
```
Error: Worker exceeded memory limit
```

**Solutions**:

1. **Reduce bundle size**:
   ```bash
   # Remove unused dependencies
   npm uninstall large-unused-library
   ```

2. **Use streaming for large responses**:
   ```typescript
   // Stream instead of buffering
   return new Response(stream);
   ```

3. **Optimize data structures**:
   - Use arrays instead of objects where possible
   - Clear variables after use

---

### Issue: KV/D1 Binding Not Found

**Symptoms**:
```
Error: KV namespace not found
```

**Solutions**:

1. **Check wrangler.jsonc**:
   ```jsonc
   {
     "kv_namespaces": [
       {
         "binding": "MY_KV",
         "id": "your_namespace_id"
       }
     ]
   }
   ```

2. **Create KV namespace**:
   ```bash
   npx wrangler kv:namespace create "MY_KV"
   # Copy the ID to wrangler.jsonc
   ```

3. **Re-deploy**:
   ```bash
   npm run deploy
   ```

---

## Getting Additional Help

### Before Asking for Help

1. **Search existing issues**: [GitHub Issues](https://github.com/wdhunter645/next-starter-template/issues)

2. **Check documentation**:
   - [README.md](../README.md)
   - [CONTRIBUTING.md](../CONTRIBUTING.md)
   - [docs/](../docs/) directory

3. **Try the basics**:
   ```bash
   # Clean slate
   rm -rf .next node_modules package-lock.json
   npm install
   npm run build
   ```

### When Opening an Issue

Include the following information:

1. **Environment**:
   - OS (Windows, macOS, Linux)
   - Node version: `node --version`
   - npm version: `npm --version`

2. **Steps to reproduce**:
   - Exact commands run
   - Expected behavior
   - Actual behavior

3. **Error messages**:
   - Full error output
   - Screenshots if applicable

4. **Attempted solutions**:
   - What you've tried
   - Results of those attempts

### Useful Debugging Commands

```bash
# Check versions
node --version
npm --version
npx next --version

# Check installation
npm list --depth=0

# View logs
npx wrangler tail

# Check Git status
git status
git log --oneline -5

# View environment
printenv | grep NEXT_PUBLIC
```

### Community Resources

- **Next.js Discord**: [nextjs.org/discord](https://nextjs.org/discord)
- **Cloudflare Community**: [community.cloudflare.com](https://community.cloudflare.com)
- **Stack Overflow**: Tag `next.js` or `cloudflare-workers`

### Emergency Recovery

**If everything is broken**:

```bash
# 1. Stash changes
git stash save "Emergency backup"

# 2. Return to last known good state
git checkout main
git pull origin main

# 3. Clean install
rm -rf .next node_modules package-lock.json
npm install

# 4. Test
npm run dev

# 5. Restore changes (if needed)
git stash pop
```

---

## Quick Reference

### Most Common Fixes

```bash
# Fix 1: Restart dev server
# Stop with Ctrl+C, then:
npm run dev

# Fix 2: Clear caches
rm -rf .next node_modules/.cache

# Fix 3: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Fix 4: Hard refresh browser
# Cmd/Ctrl + Shift + R

# Fix 5: Check for errors
npm run lint
npm run build
```

### Diagnostic Commands

```bash
# Check project health
npm run lint && npm run build && npm run preview

# View detailed error
npm run build 2>&1 | tee build.log

# Check network requests
npx wrangler tail --format=pretty
```

---

## Still Stuck?

If you've tried everything in this guide and still have issues:

1. Open a [GitHub Issue](https://github.com/wdhunter645/next-starter-template/issues/new)
2. Include all information from "When Opening an Issue" section
3. Be patient - the maintainers will respond
4. Consider joining the [Next.js Discord](https://nextjs.org/discord) for real-time help

Remember: Every developer faces these issues. Don't give up! 💪
