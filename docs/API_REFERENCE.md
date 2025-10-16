# API Reference

This document provides a comprehensive reference for the components, pages, and APIs in the Next.js Starter Template.

## Table of Contents

- [Components](#components)
  - [Header](#header)
  - [Footer](#footer)
  - [SocialWall](#socialwall)
- [Pages](#pages)
  - [Home](#home)
  - [Member](#member)
  - [News](#news)
  - [Calendar](#calendar)
  - [Milestones](#milestones)
  - [Charities](#charities)
  - [Weekly](#weekly)
  - [Admin](#admin)
- [Environment Variables](#environment-variables)
- [Metadata Configuration](#metadata-configuration)

## Components

### Header

**Location**: `src/components/Header.tsx`

The main navigation header component for the application.

**Features**:
- Fixed position navigation bar
- Responsive design
- Accessible navigation with ARIA labels
- Logo link to home page
- Navigation links to all main sections

**Props**: None (stateless component)

**Usage**:
```tsx
import Header from "@/components/Header";

<Header />
```

**Navigation Links**:
- `/` - Home
- `/weekly` - Weekly Matchup
- `/milestones` - Milestones
- `/charities` - Charities
- `/news` - News & Q&A
- `/calendar` - Calendar
- `/member` - Join

**Styling**: 
- Styles defined in `Header.module.css`
- Fixed header with `pt-16` main content offset in layout

---

### Footer

**Location**: `src/components/Footer.tsx`

The application footer component.

**Features**:
- Sticky footer design
- Copyright information
- Social media links (if configured)
- Additional footer navigation

**Props**: None

**Usage**:
```tsx
import Footer from "@/components/Footer";

<Footer />
```

**Styling**: Styles defined in `Footer.module.css`

---

### SocialWall

**Location**: `src/components/SocialWall.tsx`

Embeds a social media wall or community feed.

**Features**:
- Displays social media content
- Responsive iframe embedding
- Configurable via environment variables

**Props**: None

**Usage**:
```tsx
import SocialWall from "@/components/SocialWall";

<SocialWall />
```

**Configuration**:
Requires `SOCIAL_WALL_EMBED_URL` environment variable to be set in `.env`:
```env
SOCIAL_WALL_EMBED_URL=https://your-social-wall.elf.site
```

---

## Pages

### Home

**Route**: `/`  
**File**: `src/app/page.tsx`

The landing page for the Lou Gehrig Fan Club.

**Features**:
- Hero section with mission statement
- Call-to-action buttons
- Clean, centered layout

**Metadata**:
- Title: Uses `NEXT_PUBLIC_SITE_NAME` (default: "Lou Gehrig Fan Club")
- Description: Mission statement about honoring Lou Gehrig's legacy

---

### Member

**Route**: `/member`  
**File**: `src/app/member/page.tsx`

Membership registration page.

**Status**: 🚧 Under Development  
**TODO**: Add membership form and registration logic

**Current Features**:
- Basic page structure
- Call-to-action messaging

**Planned Features**:
- Membership registration form
- Payment integration (if applicable)
- Email verification
- Member profile creation

---

### News

**Route**: `/news`  
**File**: `src/app/news/page.tsx`

News feed and Q&A section.

**Status**: 🚧 Under Development  
**TODO**: Add news feed and Q&A data hooks

**Current Features**:
- SocialWall component integration
- Basic page structure

**Planned Features**:
- News feed with article listings
- Q&A functionality
- Comments section
- Social media integration

---

### Calendar

**Route**: `/calendar`  
**File**: `src/app/calendar/page.tsx`

Events calendar page.

**Status**: 🚧 Under Development

**Planned Features**:
- Event calendar display
- Event details
- RSVP functionality
- Calendar sync options

---

### Milestones

**Route**: `/milestones`  
**File**: `src/app/milestones/page.tsx`

Historical milestones and achievements.

**Status**: 🚧 Under Development

**Planned Features**:
- Timeline of Lou Gehrig's achievements
- Interactive milestone viewer
- Historical photos and documentation

---

### Charities

**Route**: `/charities`  
**File**: `src/app/charities/page.tsx`

ALS research and charity information.

**Status**: 🚧 Under Development

**Planned Features**:
- List of supported charities
- Donation links
- Impact metrics
- Charity partner information

---

### Weekly

**Route**: `/weekly`  
**File**: `src/app/weekly/page.tsx`

Weekly matchup or feature content.

**Status**: 🚧 Under Development

**Planned Features**:
- Weekly content updates
- Interactive elements
- Vote or poll functionality

---

### Admin

**Route**: `/admin`  
**File**: `src/app/admin/page.tsx`

Administrative dashboard.

**Status**: 🚧 Under Development  
**Access**: Restricted to admin users

**Planned Features**:
- Content management
- User management
- Analytics dashboard
- Site configuration

**Security**:
Admin access controlled by `ADMIN_EMAILS` environment variable.

---

## Environment Variables

### Required Variables

#### Cloudflare Configuration
```env
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
```

**Purpose**: Required for deployment to Cloudflare Workers.

**How to obtain**:
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to Workers & Pages
3. Copy your Account ID
4. Create API token with Workers permissions

---

#### Site Configuration
```env
NEXT_PUBLIC_SITE_URL=https://your-site.workers.dev
NEXT_PUBLIC_SITE_NAME=Your Site Name
```

**Purpose**: 
- `NEXT_PUBLIC_SITE_URL`: Base URL for your deployed site (used in metadata and OpenGraph tags)
- `NEXT_PUBLIC_SITE_NAME`: Display name for your site (used in page titles and metadata)

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

### Optional Variables

#### Web Analytics
```env
NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN=your_web_analytics_token_here
```

**Purpose**: Enables Cloudflare Web Analytics tracking.

**How to enable**:
1. Go to Cloudflare Dashboard → Analytics → Web Analytics
2. Create a site
3. Copy the token

---

#### Admin Configuration
```env
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

**Purpose**: Comma-separated list of email addresses with admin access.

---

#### Supabase Integration
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_API_KEY=your_publishable_key_here
SUPABASE_ACCESS_TOKEN=your_access_token_here
SUPABASE_PROJECT_ID=your_project_id_here
SUPABASE_DB_PASSWORD=your_db_password_here
```

**Purpose**: Database and authentication backend (if using Supabase).

---

#### Backblaze B2 Storage
```env
B2_KEY_ID=your_key_id_here
B2_APP_KEY=your_app_key_here
B2_BUCKET=your_bucket_id_here
B2_ENDPOINT=s3.us-east-005.backblazeb2.com
PUBLIC_B2_BASE_URL=https://your-bucket-url.backblazeb2.com
```

**Purpose**: Object storage for media and file uploads.

---

#### Social Wall
```env
SOCIAL_WALL_EMBED_URL=https://your-social-wall.elf.site
```

**Purpose**: Embed URL for social media wall component.

---

#### Worker Configuration
```env
WORKER_BASE_URL=https://your-worker.workers.dev
NEXT_PUBLIC_WORKER_BASE_URL=https://your-worker.workers.dev
```

**Purpose**: Base URL for Cloudflare Workers API endpoints.

---

## Metadata Configuration

The application uses Next.js App Router metadata for SEO optimization.

**Location**: `src/app/layout.tsx`

**Default Metadata**:
```typescript
{
  title: "Lou Gehrig Fan Club",
  description: "Honoring the legacy of baseball's Iron Horse through community, education, and support for ALS research and awareness.",
  openGraph: {
    title: "Lou Gehrig Fan Club",
    description: "Honoring the legacy...",
    url: "https://www.lougehrigfanclub.com",
    siteName: "Lou Gehrig Fan Club",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
}
```

**Customization**:
Override values using environment variables:
- `NEXT_PUBLIC_SITE_NAME` - Changes the site name
- `NEXT_PUBLIC_SITE_URL` - Changes the OpenGraph URL

---

## API Routes

Currently, this application uses static page generation and does not include API routes. Future versions may include:

- `/api/members` - Member management
- `/api/news` - News feed data
- `/api/events` - Calendar events
- `/api/admin` - Administrative operations

---

## Utility Functions

### getCloudflareContext()

**Purpose**: Access Cloudflare Workers context in Next.js development mode.

**Enabled by**: `@opennextjs/cloudflare` in `next.config.ts`

**Usage**:
```typescript
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  // Access Cloudflare bindings
}
```

---

## Static Assets

### Public Directory

**Location**: `/public`

Static assets served from the root URL:
- `/favicon.ico` - Site favicon
- Additional images and assets

**Usage**:
```tsx
<Image src="/logo.png" alt="Logo" />
```

---

## Type Definitions

### CloudflareEnv

**Location**: `env.d.ts`

TypeScript definitions for Cloudflare Workers environment variables and bindings.

**Generate Types**:
```bash
npm run cf-typegen
```

This creates type definitions based on your `wrangler.jsonc` configuration.

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
- [React Documentation](https://react.dev)

---

## Getting Help

If you encounter issues or need clarification on any API:

1. Check the [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
2. Review [GitHub Issues](https://github.com/wdhunter645/next-starter-template/issues)
3. Consult the [Contributing Guide](../CONTRIBUTING.md)
