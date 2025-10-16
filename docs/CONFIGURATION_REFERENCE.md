# Configuration Reference

This document provides a comprehensive reference for all configuration files in the Next.js Starter Template.

## Table of Contents

- [package.json](#packagejson)
- [next.config.ts](#nextconfigts)
- [tsconfig.json](#tsconfigjson)
- [eslint.config.mjs](#eslintconfigmjs)
- [postcss.config.mjs](#postcssconfigmjs)
- [wrangler.jsonc](#wrangle rjsonc)
- [open-next.config.ts](#open-nextconfigts)
- [.env](#env)
- [.gitignore](#gitignore)

## package.json

**Location**: `/package.json`

**Purpose**: Defines project dependencies, scripts, and metadata.

### Key Sections

#### Project Information
```json
{
  "name": "next-starter-template",
  "version": "1.0.0",
  "description": "Build a full-stack web application with Next.js.",
  "private": true
}
```

#### Dependencies
```json
{
  "dependencies": {
    "@opennextjs/cloudflare": "1.3.0",  // OpenNext adapter for Cloudflare
    "next": "15.3.3",                    // Next.js framework
    "react": "19.0.0",                   // React library
    "react-dom": "19.0.0"                // React DOM bindings
  }
}
```

#### Dev Dependencies
```json
{
  "devDependencies": {
    "@eslint/eslintrc": "3",             // ESLint configuration
    "@tailwindcss/postcss": "4.1.4",     // Tailwind CSS PostCSS plugin
    "@types/node": "24.0.4",             // Node.js type definitions
    "@types/react": "19.0.10",           // React type definitions
    "@types/react-dom": "19.0.4",        // React DOM type definitions
    "eslint": "9.27.0",                  // ESLint linter
    "eslint-config-next": "15.3.3",      // Next.js ESLint config
    "tailwindcss": "4.1.1",              // Tailwind CSS framework
    "typescript": "5.8.3",               // TypeScript compiler
    "wrangler": "4.21.x"                 // Cloudflare CLI
  }
}
```

#### Scripts
```json
{
  "scripts": {
    "build": "next build",                           // Production build
    "cf-typegen": "wrangler types --env-interface CloudflareEnv env.d.ts",  // Generate Cloudflare types
    "check": "npm run build && tsc",                 // Full type check
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",  // Deploy to Cloudflare
    "dev": "next dev",                               // Development server
    "lint": "next lint",                             // Run ESLint
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",  // Preview production build
    "start": "next start"                            // Start production server
  }
}
```

### Cloudflare Configuration
```json
{
  "cloudflare": {
    "label": "Next.js Framework Starter",
    "products": ["Workers"],
    "categories": [],
    "publish": true
  }
}
```

## next.config.ts

**Location**: `/next.config.ts`

**Purpose**: Next.js framework configuration.

### Full Configuration

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Enable Cloudflare dev mode
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
```

### Common Options

```typescript
const nextConfig: NextConfig = {
  // Output configuration
  output: 'standalone',  // For Docker/serverless
  
  // Image optimization
  images: {
    domains: ['example.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'my-value',
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },
  
  // Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
  
  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};
```

## tsconfig.json

**Location**: `/tsconfig.json`

**Purpose**: TypeScript compiler configuration.

### Full Configuration

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Key Options Explained

- `target`: ECMAScript version to compile to
- `lib`: Standard library type definitions
- `strict`: Enable all strict type-checking options
- `paths`: Path aliases (e.g., `@/components`)
- `jsx`: JSX compilation mode
- `moduleResolution`: How modules are resolved

## eslint.config.mjs

**Location**: `/eslint.config.mjs`

**Purpose**: ESLint code quality configuration.

### Configuration

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

### Rules Included

- **next/core-web-vitals**: Core Web Vitals rules
- **next/typescript**: TypeScript-specific rules

### Custom Rules (Optional)

```javascript
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Custom rules
      '@typescript-eslint/no-unused-vars': 'error',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
```

## postcss.config.mjs

**Location**: `/postcss.config.mjs`

**Purpose**: PostCSS configuration for CSS processing.

### Configuration

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### With Additional Plugins

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},  // Add vendor prefixes
    'cssnano': {         // Minify CSS in production
      preset: 'default',
    },
  },
};
```

## wrangler.jsonc

**Location**: `/wrangler.jsonc`

**Purpose**: Cloudflare Workers configuration.

### Basic Configuration

```jsonc
{
  // Project name (shows in Cloudflare dashboard)
  "name": "next-starter-template",
  
  // Cloudflare account ID
  "account_id": "YOUR_ACCOUNT_ID",
  
  // Entry point (managed by OpenNext)
  "main": "./.open-next/worker.js",
  
  // Node.js compatibility
  "compatibility_date": "2024-01-01",
  "compatibility_flags": ["nodejs_compat"]
}
```

### Advanced Configuration

```jsonc
{
  "name": "next-starter-template",
  "account_id": "YOUR_ACCOUNT_ID",
  "main": "./.open-next/worker.js",
  "compatibility_date": "2024-01-01",
  "compatibility_flags": ["nodejs_compat"],
  
  // Custom routes
  "routes": [
    {
      "pattern": "example.com/*",
      "zone_name": "example.com"
    }
  ],
  
  // Environment variables
  "vars": {
    "ENVIRONMENT": "production"
  },
  
  // KV Namespaces
  "kv_namespaces": [
    {
      "binding": "MY_KV",
      "id": "your_kv_namespace_id",
      "preview_id": "your_preview_namespace_id"
    }
  ],
  
  // D1 Databases
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "your_database",
      "database_id": "your_database_id"
    }
  ],
  
  // R2 Buckets
  "r2_buckets": [
    {
      "binding": "MY_BUCKET",
      "bucket_name": "your_bucket",
      "preview_bucket_name": "your_preview_bucket"
    }
  ],
  
  // Resource limits
  "limits": {
    "cpu_ms": 50
  },
  
  // Cron triggers
  "triggers": {
    "crons": ["0 0 * * *"]
  }
}
```

### Bindings Explained

- **KV Namespaces**: Key-value storage
- **D1 Databases**: SQLite databases
- **R2 Buckets**: Object storage
- **Durable Objects**: Stateful objects
- **Service Bindings**: Call other Workers

## open-next.config.ts

**Location**: `/open-next.config.ts`

**Purpose**: OpenNext adapter configuration.

### Configuration

```typescript
const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
    },
  },
};

export default config;
```

### Advanced Configuration

```typescript
const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      incrementalCache: "cloudflare-kv",
      tagCache: "cloudflare-kv",
      queue: "cloudflare-queue",
    },
  },
  
  // Function-specific overrides
  functions: {
    ssr: {
      routes: ["app/api/*"],
    },
  },
};

export default config;
```

## .env

**Location**: `/.env` (create from `.env.example`)

**Purpose**: Environment variables for local development.

**⚠️ Never commit this file!**

### Structure

```env
# Comments start with #

# Client-side (accessible in browser)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=My Site

# Server-side only (hidden from browser)
DATABASE_URL=postgresql://localhost:5432/db
API_SECRET=your_secret_key
```

### Variable Types

**Public Variables** (client-side):
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ANALYTICS_ID=UA-123456-1
```

**Private Variables** (server-side):
```env
DATABASE_PASSWORD=secret123
STRIPE_SECRET_KEY=sk_test_123
ADMIN_EMAILS=admin@example.com
```

### Best Practices

```env
# ✅ Good: Descriptive names
NEXT_PUBLIC_API_BASE_URL=https://api.example.com

# ❌ Bad: Unclear names
API=https://api.example.com

# ✅ Good: Grouped logically
# Database
DATABASE_URL=...
DATABASE_NAME=...

# API Keys
API_KEY=...
API_SECRET=...

# ❌ Bad: Exposing secrets
NEXT_PUBLIC_DATABASE_PASSWORD=secret123
```

## .gitignore

**Location**: `/.gitignore`

**Purpose**: Files and directories to exclude from Git.

### Key Sections

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js
.yarn/

# Next.js
.next/
out/
build
dist

# Environment variables
.env
.env*.local

# Testing
coverage/
.nyc_output

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Cloudflare
.wrangler/
.dev.vars
.open-next/

# TypeScript
*.tsbuildinfo
```

## Environment-Specific Configuration

### Development

```bash
# .env.development (optional)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DEBUG=true
```

### Production

```bash
# Set in Cloudflare Workers secrets
npx wrangler secret put DATABASE_URL
npx wrangler secret put API_KEY
```

### Staging

```bash
# .env.staging (optional)
NEXT_PUBLIC_API_URL=https://staging-api.example.com
```

## Configuration Hierarchy

### Loading Order

1. Environment variables in shell
2. `.env.local` (all environments, git-ignored)
3. `.env.[mode].local` (mode-specific, git-ignored)
4. `.env.[mode]` (mode-specific)
5. `.env` (all environments)

### Priority

Higher number = higher priority:
1. `.env`
2. `.env.development` or `.env.production`
3. `.env.local`
4. Shell environment variables

## Common Configuration Tasks

### Change Site Name

1. Update `.env`:
   ```env
   NEXT_PUBLIC_SITE_NAME=New Name
   ```

2. Update `src/app/layout.tsx`:
   ```typescript
   const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "New Name";
   ```

### Add Custom Domain

1. Update `wrangler.jsonc`:
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

2. Deploy:
   ```bash
   npm run deploy
   ```

### Configure Database

1. Add to `.env`:
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/db
   ```

2. Install client:
   ```bash
   npm install pg
   ```

3. Use in API routes:
   ```typescript
   const dbUrl = process.env.DATABASE_URL;
   ```

### Enable TypeScript Strict Mode

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}
```

### Add Custom ESLint Rule

Update `eslint.config.mjs`:
```javascript
const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      'no-console': 'warn',
      'prefer-const': 'error',
    },
  },
];
```

## Validation

### Check Configuration

```bash
# Validate TypeScript config
npx tsc --showConfig

# Validate Next.js config
npm run build

# Validate ESLint config
npm run lint

# Validate Wrangler config
npx wrangler deploy --dry-run
```

## Troubleshooting

### Configuration Not Working

1. **Environment variables not loaded**:
   - Restart dev server
   - Check variable name (NEXT_PUBLIC_ prefix for client-side)
   - Verify `.env` file exists

2. **TypeScript errors**:
   - Run `npm run check`
   - Check `tsconfig.json` is valid JSON
   - Restart IDE/TypeScript server

3. **ESLint not running**:
   - Check `eslint.config.mjs` syntax
   - Verify ESLint extension installed
   - Run manually: `npm run lint`

4. **Wrangler deploy fails**:
   - Validate JSON: `npx wrangler deploy --dry-run`
   - Check account ID is set
   - Verify authentication: `npx wrangler whoami`

## Additional Resources

- [Next.js Configuration](https://nextjs.org/docs/app/api-reference/next-config-js)
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [PostCSS Plugins](https://github.com/postcss/postcss/blob/main/docs/plugins.md)

## Related Documentation

- [API Reference](./API_REFERENCE.md) - Environment variables usage
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production configuration
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md) - Development setup
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md) - Configuration issues

---

**Need help with configuration?** Check the [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md) or open an issue!
