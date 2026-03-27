---
Doc Type: Design Authority
Audience: Human + AI
Authority Level: Controlled
Owns: Join/Login page UI, behavior, and auth flow
Does Not Own: Global navigation rules, header/footer standards
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-27
---

# Join / Login Page Design

This document defines the **combined Join/Login page** used for LGFC-Lite member session entry.

The page uses a **single route and component** with **two tabs** to avoid duplicated logic and UI drift.

---

# Route

Primary route:

`/join`

Legacy route handling:

`/login` → redirect to `/join#login`

---

# Page Purpose

Provide a single entry point for:

1. Member join (session creation)
2. Existing member login (session restoration)

The interface uses tab navigation to switch between Join and Login forms.

---

# Page Layout

Page sections:

1. Page Header
2. Tab Selector
3. Form Container
4. Submit Actions
5. Error / Status Messages

---

# Tabs

Two tabs control which form is visible.

TAB 1 — Join  
TAB 2 — Login

Behavior:

- Join tab is default when visiting `/join`
- Login tab activates when URL hash is `/join#login`
- Switching tabs does not reload the page

---

# Join Form

Purpose: create a local LGFC-Lite member session identity.

Required fields:

- Screen Name (Alias)
- Email

Validation rules:

- Screen Name is required
- Email must be valid format
- Alias/email conflicts must return an inline error

---

# Login Form

Purpose: restore a local LGFC-Lite member session.

Required fields:

- Email

Validation rules:

- Email must be valid format
- Email must match an existing member record

---

# Authentication Flow

Authentication follows the LGFC-Lite local session model.

Join flow:

1. User submits Join form
2. System validates input and creates/updates member record
3. Client stores `lgfc_member_email` in localStorage
4. Redirect to `/fanclub`

Login flow:

1. User submits Login form
2. System validates member identity
3. Client stores `lgfc_member_email` in localStorage
4. Redirect to `/fanclub`

---

# Redirect Behavior

Successful authentication redirects to:

`/fanclub`

Unauthenticated access to protected FanClub routes (`/fanclub` and `/fanclub/**`) redirects to:

`/`

Failed authentication or invalid auth callback redirects to:

`/join#login`

---

# Error Handling

Errors appear inside the form container.

Typical errors:

- Invalid email format
- Member not found
- Alias/email conflict
- Session creation failure

---

# Component Structure

Recommended component layout:

JoinLoginPage  
 ├── TabSelector  
 ├── JoinForm  
 └── LoginForm

State management controls which form is visible.

---

# UI Behavior Rules

- Only one form visible at a time
- Tab switch must be instant
- No page reload during tab switch
- Form validation occurs before submission

---

# Design Constraints

- Must comply with global header/footer standards
- Must follow navigation rules defined in LGFC Production Design and Standards
- Must not introduce separate Join or Login pages
