---
Doc Type: Design Authority
Audience: Human + AI
Authority Level: Controlled
Owns: Canonical authentication and redirect behavior definitions
Does Not Own: Join/Login UI composition; FanClub content layout; admin feature requirements
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-27
---

# Authentication Model (Canonical Auth Source)

This file is the **single source of truth** for authentication/session behavior and auth-related redirects.

Canonical auth reference: /docs/reference/design/auth-model.md

## Day 1 Canonical Model (LOCKED)

LGFC Day 1 member access uses a **local browser session marker** model.

### Session Marker
- Key: `lgfc_member_email`
- Storage: browser `localStorage`
- Session validity: marker presence + member validation checks

### Behavior
- Login success: write `lgfc_member_email` → redirect `/fanclub`
- Logout: clear `lgfc_member_email` (and stale compatibility artifacts) → redirect `/`
- Unauthenticated or invalid member session on protected routes → redirect `/`

### Protected Routes
- `/fanclub`
- `/fanclub/**`

## Redirect Policy (LOCKED)

Use this redirect matrix for auth-related routes and flows:

1. `/fanclub` or `/fanclub/**` when unauthenticated → `/`
2. Failed login/session validation → `/`
3. `/logout` completion (or already logged out) → `/`
4. `/login` legacy compatibility route → `/`

## Prohibited in Active Docs

- Supabase Auth
- magic-link auth
- cookie-backed auth as Day 1 canonical model
- hybrid cookie + localStorage auth definitions
- defining conflicting redirect targets for auth paths

## Enforcement

Any file that mentions authentication/session/redirect behavior must include:

Canonical auth reference: /docs/reference/design/auth-model.md

Those files may summarize auth behavior but must not conflict with this document.
