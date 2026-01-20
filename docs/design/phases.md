# LGFC Development Phases

## Overview

The Lou Gehrig Fan Club website is being developed in distinct phases, each with specific capabilities and technology constraints.

This document defines the **phase boundaries** and explicitly documents what is and is not supported in each phase.

## Current Phase: LGFC-Lite

### Status
✅ **Active** — Current deployment phase

### Technology Stack
- **Frontend**: Next.js (App Router) with static export
- **Deployment**: Cloudflare Pages (static hosting)
- **Database**: Cloudflare D1 (SQLite) accessed via Cloudflare Pages Functions
- **Storage**: Backblaze B2 (S3-compatible)
- **Runtime**: Cloudflare Pages Functions (serverless edge functions)

### Capabilities

#### ✅ Supported in LGFC-Lite
- Public information pages (Home, About, Contact, etc.)
- Static content rendering
- Weekly photo voting (public)
- Social wall integration (Elfsight widget)
- Public discussion feed (read-only teaser)
- Photo archive/gallery (public browsing)
- Calendar display
- FAQ display and search
- Join/signup form (email collection for future notification)
- D1 database queries (read-only or write for public forms)
- B2 image serving
- Email sending (via Cloudflare Email Workers or external service)

#### ❌ NOT Supported in LGFC-Lite
- **Authentication** (email/password, magic links, OAuth, etc.)
- **Login functionality** (login page is a stub only)
- **Session management** (cookies, tokens, etc.)
- **Member-only content** (all content is public in LGFC-Lite)
- **Authorization/access control** (no protected routes or data)
- **User accounts** (no persistent user state)
- **Member profiles** (no editable profile pages)
- **Protected API routes** (all APIs are public or unauthenticated)

### Architecture Constraints

#### Static Export
LGFC-Lite uses Next.js `output: "export"` mode, which:
- Pre-renders all pages at build time
- Cannot use server-side rendering (SSR)
- Cannot use API routes in `/app/api/*` (Cloudflare Pages Functions used instead)
- Cannot use middleware for authentication

#### No Authentication Dependencies
LGFC-Lite **must not** include:
- Supabase client libraries (for auth)
- Auth0 or similar authentication SDKs
- NextAuth.js
- Session management libraries
- JWT libraries
- OAuth client libraries

**Rationale**: Authentication requires backend runtime that is deferred to a future phase.

### Join Flow in LGFC-Lite

The "Join the Fan Club" flow in LGFC-Lite is **informational only**:
- Collects visitor information (name, email)
- Stores in D1 for future notification
- Sends confirmation email
- **Does NOT** create authenticated accounts
- **Does NOT** grant access to member features

When authentication is introduced in a future phase, existing join submissions will be migrated to full accounts.

### Login Page in LGFC-Lite

The `/login` page is a **stub/informational page**:
- Clearly states that login is not yet available
- Explains LGFC-Lite does not support authentication
- Directs users to the Join flow
- **Does NOT** accept credentials
- **Does NOT** perform authentication

See `/docs/design/login.md` for full login page specification.

## Future Phase: Authentication & Member Features

### Status
⏳ **Planned** — Not yet started

### Phase Activation Criteria
This phase begins when:
1. LGFC-Lite is stable and deployed
2. Authentication technology is chosen
3. Phase-specific design documentation is complete
4. Team explicitly approves phase transition

### Planned Capabilities

#### Authentication
- Email/password login
- Magic link authentication (passwordless)
- OAuth providers (Google, etc.) — optional
- Session management (cookies or tokens)
- Password reset flow
- Account verification

#### Member Features
- Member-only content areas
- Editable member profiles
- Member discussion participation (posting, replies)
- Member photo uploads (to gallery)
- Member event RSVPs
- Personalized dashboard

#### Technology Options (TBD)
- **Supabase Auth** (managed authentication service)
- **Auth0** (enterprise auth platform)
- **Custom implementation** (Cloudflare Workers + D1)
- **Other** (to be determined)

### Migration Path
When transitioning from LGFC-Lite to Auth Phase:
1. Existing join submissions migrate to full accounts
2. Login page replaced with functional implementation
3. Member-only routes protected with middleware
4. Public content remains accessible
5. Progressive enhancement (no breaking changes)

## Phase Boundary Rules

### Rule 1: No Premature Auth Implementation
**Authentication MUST NOT be implemented before the Auth Phase is explicitly activated.**

Any PR that introduces authentication code, configuration, or dependencies during LGFC-Lite phase **must be rejected**.

This rule prevents:
- Scope creep
- Architectural drift
- Deployment complexity
- Broken builds (static export incompatibility)

### Rule 2: Phase Transitions Require Explicit Approval
Phase transitions are **major milestones** and require:
1. Written phase plan/specification
2. Architecture review
3. Repository owner approval (@wdhunter645)
4. Update to this document

**No silent phase transitions.**

### Rule 3: Documentation Must Match Phase
All documentation must explicitly state which phase it applies to:
- Design specs must indicate phase compatibility
- Code comments must note phase limitations
- README must reflect current phase capabilities

When phase changes, documentation is updated in the same PR.

## Phase Verification

### How to Verify Current Phase
Check these indicators to confirm LGFC-Lite phase:
- [ ] `next.config.ts` has `output: "export"`
- [ ] No `supabase` packages in `package.json`
- [ ] No authentication middleware in `src/middleware.ts`
- [ ] Login page is informational stub (see `/docs/design/login.md`)
- [ ] No protected routes or auth guards
- [ ] `docs/design/phases.md` (this file) shows LGFC-Lite as active

### How to Verify Auth Phase Readiness
Before transitioning to Auth Phase, verify:
- [ ] Authentication technology chosen and documented
- [ ] Auth architecture designed and reviewed
- [ ] Migration plan written (LGFC-Lite join data → accounts)
- [ ] Phase transition PR approved
- [ ] This document updated with Auth Phase status

## Related Documentation

- **Login Page**: `/docs/design/login.md` — LGFC-Lite login stub specification
- **LGFC-Lite Baseline**: `/docs/lgfc-lite-baseline.md` — Baseline capabilities
- **Architecture Overview**: `/docs/ARCHITECTURE_OVERVIEW.md` — System architecture
- **Deployment Guide**: `/docs/DEPLOYMENT_GUIDE.md` — Cloudflare deployment

## Governance

This document is **authoritative** for phase definitions and boundaries.

Any changes to phase status or boundaries require:
1. Explicit PR describing the phase transition
2. Repository owner approval
3. Update to this file reflecting new phase status
4. Update to related documentation (architecture, deployment, etc.)

---

**Last Updated**: 2026-01-20  
**Current Phase**: LGFC-Lite  
**Next Phase**: Authentication & Member Features (Planned)
