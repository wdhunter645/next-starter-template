---
Doc Type: Reference
Audience: Internal
Authority Level: Supporting
Owns: Join/Login page UI, behavior, and auth flow
Does Not Own: Global navigation rules, header/footer standards
Canonical Reference: docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-18
---
# Join / Login Page Design

This document defines the **combined Join/Login page** used for member authentication and account creation.

The page uses a **single route and component** with **two tabs** to avoid duplicated logic and UI drift.

---

# Route

Primary route:

/join

Legacy route:

/login → redirect to /join#login

---

# Page Purpose

Provide a single entry point for:

1. New member registration
2. Existing member authentication

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

Purpose: create a new member account.

Required fields:

- Screen Name (Alias)
- Email
- Password
- Confirm Password

Validation rules:

- Screen Name must be unique
- Email must be valid format
- Password must meet minimum length requirements
- Password and Confirm Password must match

---

# Login Form

Purpose: authenticate existing members.

Required fields:

- Email
- Password

Validation rules:

- Email must exist in member database
- Password must match stored credentials

---

# Authentication Flow

Authentication is handled by **Supabase Auth**.

Join flow:

1. User submits Join form
2. Account created in Supabase
3. Session established
4. Redirect to Fan Club dashboard

Login flow:

1. User submits Login form
2. Supabase validates credentials
3. Session established
4. Redirect to Fan Club dashboard

---

# Redirect Behavior

Successful authentication redirects to:

/fanclub

Unauthenticated access to protected routes redirects to:

/join#login

---

# Error Handling

Errors appear inside the form container.

Typical errors:

- Invalid email
- Password mismatch
- Account already exists
- Invalid login credentials

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
