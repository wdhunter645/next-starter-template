---
Doc Type: Design Authority
Audience: Human + AI
Authority Level: Canonical
Owns: Authentication model, session model, auth behavior
Canonical Reference: SELF
Last Reviewed: 2026-03-27
---

# Authentication Model

## Day 1 Canonical Model (LOCKED)

LGFC uses a **cookie-backed server session model**.

### Session
- Cookie: `lgfc_session`
- Storage: D1 → `member_sessions`
- Lookup: `/api/session/me`
- Identity/role: D1 → `members`

### Behavior
- Login → create session + cookie → redirect `/fanclub`
- Logout → clear cookie + invalidate session → redirect `/`
- Browser close → session remains active
- Presence → approximate via `last_seen_at`

### Protected Routes
- `/fanclub`
- `/fanclub/**`

### Unauthenticated Rule (LOCKED)
Unauthenticated access → redirect to `/`

---

## PROHIBITED (MUST NOT EXIST IN ANY ACTIVE DOC)

- localStorage as auth source of truth
- Supabase Auth
- magic-link auth
- ADMIN_EMAILS as auth control
- hybrid cookie + localStorage models

These are not Day 1 implementations.

---

## GOVERNANCE (THIS IS THE FIX)

The following files are **NOT allowed to define auth**:

- join-login.md
- auth-and-logout.md
- LGFC-Production-Design-and-Standards.md
- fanclub.md
- cloudflare-frontend.md

They must only reference this file.

---

## REQUIRED LINE (MANDATORY)

Every file that mentions auth MUST include:

Canonical auth reference: /docs/reference/design/auth-model.md
