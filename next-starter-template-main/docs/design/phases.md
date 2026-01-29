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
- **Member login** (email validation with local session via localStorage)
- **Member area access** (gated by lgfc_member_email localStorage key)
- D1 database queries (read-only or write for public forms)
- B2 image serving
- Email sending (via Cloudflare Email Workers or external service)

#### ❌ NOT Supported in LGFC-Lite
- **Password-based authentication** (no passwords stored or validated)
- **Magic link authentication** (no email-based token authentication)
- **OAuth/social login** (no Google, Facebook, etc. authentication)
- **Server-side session management** (local browser sessions only)
- **Cryptographically secure authentication** (localStorage is not secure)
- **Cross-device session sync** (sessions are browser-specific)
- **User accounts with passwords** (no password storage or management)
- **Authorization/role-based access control** (basic member/visitor distinction only)
- **Member profiles with sensitive data** (no password-protected data)
- **Protected API routes requiring secure auth** (APIs rely on localStorage email)

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

The "Join the Fan Club" flow in LGFC-Lite collects visitor information and creates a membership record:
- Collects visitor information (first name, last name, screen name, email)
- Stores in D1 `join_requests` table
- Sends confirmation email
- Creates a membership record for future login access
- Members can then use the login page to access member features

### Login Flow in LGFC-Lite

The `/login` page provides email-based member access:
- Validates email exists in D1 `join_requests` table (via `/api/login`)
- On success: stores `lgfc_member_email` in `localStorage` and redirects to `/member`
- On failure: shows error and directs to `/join` for new members
- Rate limits failed attempts (3 per IP per hour)
- **Note**: This is a local browser session, NOT cryptographically secure authentication

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

### Rule 1: No Premature Enterprise Auth Implementation
**Enterprise-grade authentication (passwords, OAuth, magic links) MUST NOT be implemented before the Auth Phase is explicitly activated.**

Any PR that introduces password-based authentication, OAuth, or other enterprise auth features during LGFC-Lite phase **must be rejected**.

However, LGFC-Lite **does support** a lightweight local-session login mechanism:
- Email validation via `/api/login`
- Local browser session via `localStorage` (lgfc_member_email)
- Member area access gated by localStorage key
- NOT cryptographically secure (suitable for LGFC-Lite only)

This rule prevents:
- Scope creep into enterprise authentication
- Architectural drift toward complex auth systems
- Deployment complexity
- Broken builds (static export incompatibility with secure auth)

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
