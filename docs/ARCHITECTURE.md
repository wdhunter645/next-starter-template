# Architecture Documentation

This document describes the architecture and technical design of the Next.js Starter Template.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Application Architecture](#application-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Data Flow](#data-flow)
- [Build Process](#build-process)
- [Security Considerations](#security-considerations)

## Overview

This is a modern, full-stack web application built with Next.js 15 and deployed to Cloudflare Workers. It uses the App Router for file-based routing and supports both static site generation (SSG) and server-side rendering (SSR) capabilities.

### Key Features

- **Framework**: Next.js 15 with App Router
- **Runtime**: Cloudflare Workers (Edge compute)
- **Styling**: Tailwind CSS 4 with CSS Modules
- **Language**: TypeScript with strict type checking
- **Build Tool**: OpenNext Cloudflare adapter
- **Package Manager**: npm

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.3.3 | React framework with SSR/SSG |
| React | 19.0.0 | UI library |
| TypeScript | 5.8.3 | Type safety |
| Tailwind CSS | 4.1.1 | Utility-first CSS framework |

### Build & Deploy

| Technology | Version | Purpose |
|------------|---------|---------|
| OpenNext Cloudflare | 1.3.0 | Cloudflare Workers adapter |
| Wrangler | 4.21.x | Cloudflare CLI tool |
| ESLint | 9.27.0 | Code linting |

### Development

| Tool | Purpose |
|------|---------|
| VS Code | Recommended IDE with workspace config |
| GitHub Codespaces | Cloud development environment |
| npm scripts | Task automation |

## Project Structure

```
next-starter-template/
├── .github/                  # GitHub configuration
│   └── workflows/            # CI/CD workflows (if configured)
├── docs/                     # Documentation
│   ├── API_REFERENCE.md      # Component and API docs
│   ├── ARCHITECTURE.md       # This file
│   ├── DEPLOYMENT_GUIDE.md   # Deployment instructions
│   └── ...                   # Additional guides
├── public/                   # Static assets
│   └── favicon.ico           # Site favicon
├── src/                      # Source code
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── globals.css       # Global styles
│   │   ├── admin/            # Admin page
│   │   ├── calendar/         # Calendar page
│   │   ├── charities/        # Charities page
│   │   ├── member/           # Membership page
│   │   ├── milestones/       # Milestones page
│   │   ├── news/             # News page
│   │   ├── privacy/          # Privacy policy
│   │   ├── terms/            # Terms of service
│   │   ├── weekly/           # Weekly content
│   │   ├── not-found.tsx     # 404 page
│   │   ├── robots.txt/       # SEO robots.txt
│   │   └── sitemap.ts        # Dynamic sitemap
│   └── components/           # Reusable components
│       ├── Header.tsx        # Navigation header
│       ├── Footer.tsx        # Site footer
│       └── SocialWall.tsx    # Social media embed
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── env.d.ts                  # Environment type definitions
├── eslint.config.mjs         # ESLint configuration
├── next.config.ts            # Next.js configuration
├── open-next.config.ts       # OpenNext adapter config
├── package.json              # Dependencies and scripts
├── postcss.config.mjs        # PostCSS configuration
├── tsconfig.json             # TypeScript configuration
└── wrangler.jsonc            # Cloudflare Workers config
```

## Application Architecture

### Next.js App Router

This application uses the Next.js 15 App Router, which provides:

- **File-based routing**: Pages automatically map to routes based on directory structure
- **Server Components**: Components render on the server by default for better performance
- **Streaming**: Progressive rendering with React Suspense
- **Layouts**: Shared UI that doesn't re-render on navigation

#### Routing Structure

```
/                     → src/app/page.tsx
/member               → src/app/member/page.tsx
/news                 → src/app/news/page.tsx
/calendar             → src/app/calendar/page.tsx
/milestones           → src/app/milestones/page.tsx
/charities            → src/app/charities/page.tsx
/weekly               → src/app/weekly/page.tsx
/admin                → src/app/admin/page.tsx
/privacy              → src/app/privacy/page.tsx
/terms                → src/app/terms/page.tsx
/robots.txt           → src/app/robots.txt/route.ts
/sitemap.xml          → src/app/sitemap.ts
```

### Component Architecture

```
┌─────────────────────────────────────┐
│         Root Layout                 │
│  (src/app/layout.tsx)               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Header Component          │   │
│  │   (Fixed Navigation)        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Page Content              │   │
│  │   (Dynamic based on route)  │   │
│  │                             │   │
│  │   - Home                    │   │
│  │   - Member                  │   │
│  │   - News (+ SocialWall)     │   │
│  │   - Calendar                │   │
│  │   - Milestones              │   │
│  │   - Charities               │   │
│  │   - Weekly                  │   │
│  │   - Admin                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Footer Component          │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Styling Architecture

The application uses a hybrid styling approach:

1. **Global Styles** (`globals.css`)
   - CSS custom properties for theming
   - Tailwind CSS base, components, utilities
   - Reset and normalize styles

2. **CSS Modules** (`.module.css`)
   - Component-scoped styles
   - Used for Header, Footer, and Page components
   - Prevents style conflicts

3. **Tailwind Utility Classes**
   - Rapid UI development
   - Responsive design utilities
   - Used throughout components

## Deployment Architecture

### Cloudflare Workers

```
┌──────────────────────────────────────────────┐
│        Cloudflare Global Network             │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │    Edge Location (nearest to user)     │ │
│  │                                        │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │   Cloudflare Worker             │ │ │
│  │  │   (Next.js SSR/SSG)             │ │ │
│  │  │                                 │ │ │
│  │  │   - Request handling            │ │ │
│  │  │   - Static asset serving        │ │ │
│  │  │   - Dynamic rendering           │ │ │
│  │  └──────────────────────────────────┘ │ │
│  │                                        │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │   Cloudflare KV (if configured)  │ │ │
│  │  │   - Cache storage               │ │ │
│  │  │   - Session storage             │ │ │
│  │  └──────────────────────────────────┘ │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### OpenNext Transformation

OpenNext transforms the Next.js build output for Cloudflare Workers:

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Next.js       │      │    OpenNext      │      │   Cloudflare    │
│   Build Output  │ ───> │   Transformer    │ ───> │   Worker Bundle │
│                 │      │                  │      │                 │
│   - Static HTML │      │   - Adapts SSR   │      │   - Optimized   │
│   - JavaScript  │      │   - Transforms   │      │   - Edge-ready  │
│   - CSS         │      │     assets       │      │   - Deployed    │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

## Data Flow

### Static Pages (SSG)

```
1. Build Time:
   ┌──────────────┐
   │ next build   │ → HTML/CSS/JS generated
   └──────────────┘

2. Deploy Time:
   ┌──────────────┐
   │ OpenNext     │ → Assets uploaded to Workers
   └──────────────┘

3. Request Time:
   User Request → Edge Worker → Serve Static File
```

### Dynamic Pages (SSR)

```
1. Request Time:
   User Request → Edge Worker → Render React → Return HTML
                      ↓
                  [Cache if applicable]
```

### Client-Side Navigation

```
Initial Load:
   User → Full HTML Page

Subsequent Navigation:
   User → JSON Data Only → Client-side Render
```

## Build Process

### Development Build

```bash
npm run dev
```

1. Next.js dev server starts on port 3000
2. Hot Module Replacement (HMR) enabled
3. OpenNext Cloudflare dev mode initialized
4. Fast refresh on file changes

### Production Build

```bash
npm run build
```

**Process**:

1. **Compilation** (TypeScript → JavaScript)
   - Type checking
   - ES module bundling
   - Tree shaking

2. **Optimization**
   - Code splitting
   - Image optimization
   - CSS minification
   - JavaScript minification

3. **Static Generation**
   - Pre-render static pages
   - Generate metadata
   - Create sitemap and robots.txt

4. **Output**
   ```
   .next/
   ├── static/          # Static assets with hashes
   ├── server/          # Server-side code
   └── ...
   ```

### Deployment Build

```bash
npm run deploy
```

**Process**:

1. **OpenNext Build**
   ```bash
   opennextjs-cloudflare build
   ```
   - Transforms Next.js output
   - Creates Worker-compatible bundle
   - Optimizes for edge runtime

2. **OpenNext Deploy**
   ```bash
   opennextjs-cloudflare deploy
   ```
   - Uploads to Cloudflare Workers
   - Configures routes
   - Updates bindings

## Security Considerations

### Environment Variables

**Security Levels**:

1. **Secret** (Server-only):
   - API tokens
   - Database passwords
   - Private keys
   - Example: `CLOUDFLARE_API_TOKEN`

2. **Public** (Client-accessible):
   - Prefixed with `NEXT_PUBLIC_`
   - Embedded in client bundle
   - Example: `NEXT_PUBLIC_SITE_NAME`

**Best Practices**:
- Never commit `.env` file to Git
- Use `.env.example` for documentation
- Rotate secrets regularly
- Use Cloudflare Workers Secrets for production

### Access Control

**Admin Routes**:
- Check `ADMIN_EMAILS` environment variable
- Implement authentication middleware
- Use secure session management

**User Data**:
- Validate all inputs
- Sanitize user content
- Use HTTPS only
- Implement CSRF protection

### Content Security

**Headers** (Recommended):
```typescript
// In middleware or headers config
{
  "Content-Security-Policy": "default-src 'self'",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

## Performance Optimization

### Edge Computing

- **Low Latency**: Served from 200+ Cloudflare locations
- **No Cold Starts**: Unlike traditional serverless
- **Global CDN**: Static assets cached worldwide

### Next.js Optimizations

- **Automatic Code Splitting**: Only load needed JavaScript
- **Image Optimization**: Lazy loading and responsive images
- **Font Optimization**: Automatic font loading optimization
- **Static Generation**: Pre-render where possible

### Caching Strategy

1. **Static Assets**: Immutable cache (1 year)
2. **HTML Pages**: Stale-while-revalidate
3. **API Responses**: Cache-Control headers
4. **Cloudflare KV**: Long-term data storage

## Monitoring and Analytics

### Available Integrations

1. **Cloudflare Web Analytics**
   - Privacy-friendly
   - No performance impact
   - Set `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`

2. **Cloudflare Workers Analytics**
   - Request metrics
   - Error rates
   - Performance data

## Extensibility

### Adding New Pages

1. Create directory in `src/app/`
2. Add `page.tsx` file
3. Implement component
4. Update navigation in `Header.tsx`

### Adding API Routes

```typescript
// src/app/api/example/route.ts
export async function GET(request: Request) {
  return Response.json({ message: "Hello" });
}
```

### Adding Database

1. Configure Supabase or D1 in environment variables
2. Add database client library
3. Implement data access layer
4. Update TypeScript types

### Adding Authentication

Recommended options:
- Clerk
- Auth0
- Supabase Auth
- Custom with JWT

## Development Workflow

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Local Development                              │
│  ↓                                              │
│  Git Commit                                     │
│  ↓                                              │
│  Push to GitHub                                 │
│  ↓                                              │
│  [Optional: CI/CD Pipeline]                     │
│  ↓                                              │
│  Preview Deployment (npm run preview)           │
│  ↓                                              │
│  Manual Deploy (npm run deploy)                 │
│  ↓                                              │
│  Production (Cloudflare Workers)                │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Future Architecture Considerations

### Potential Enhancements

1. **Database Integration**
   - Cloudflare D1 (SQLite)
   - Supabase PostgreSQL
   - Prisma ORM

2. **Authentication**
   - User registration/login
   - OAuth providers
   - Role-based access

3. **API Layer**
   - RESTful endpoints
   - GraphQL API
   - tRPC integration

4. **Real-time Features**
   - WebSockets
   - Server-Sent Events
   - Cloudflare Durable Objects

5. **File Storage**
   - Cloudflare R2
   - Backblaze B2
   - AWS S3 compatible

6. **Email Service**
   - Resend
   - SendGrid
   - Cloudflare Email Workers

## Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
- [React Server Components](https://react.dev/reference/react/use-server)

## Conclusion

This architecture provides a solid foundation for building modern, performant web applications with Next.js and Cloudflare Workers. The combination of static generation, server-side rendering, and edge computing delivers excellent user experience with minimal infrastructure complexity.
