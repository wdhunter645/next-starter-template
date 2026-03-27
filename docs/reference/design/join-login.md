---
Doc Type: Design Authority
Audience: Human + AI
Authority Level: Controlled
Owns: Join/Login page UI, behavior, and member access flow
Does Not Own: Global navigation rules, header/footer standards
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-27
---

# Join / Login Page Design

This document defines the combined **Join/Login** experience used for the LGFC-lite member access model.

## Route

Primary route:

`/join`

Legacy route handling:

`/login` → redirect to `/join#login`

## Page Purpose

Provide one entry surface for:

1. New member join
2. Existing member login

## Tabs

- Join tab is default on `/join`
- Login tab activates on `/join#login`
- Switching tabs does not reload the page

## Join Form

Required fields:

- Screen Name (Alias)
- Email

Validation:

- Screen Name required
- Valid email format
- Alias/email conflicts return inline error

## Login Form

Required fields:

- Email

Validation:

- Valid email format
- Email must match an existing member record

## Authentication Model (Day 1 LGFC-lite)

Day 1 member access uses a **local browser session marker** model.

- Successful login writes `lgfc_member_email` in localStorage.
- Member-access checks read `lgfc_member_email` client-side.
- No Supabase Auth or magic-link flow is part of the current model.
- Session invalidation/log out clears `lgfc_member_email` and returns user to `/`.

## Redirect Behavior (Canonical)

- Successful login redirects to `/fanclub`.
- Any unauthenticated member-route access (`/fanclub` and `/fanclub/**`) redirects to `/`.
- Failed login/session validation redirects to `/`.

## Error Handling

Typical errors:

- Invalid email format
- Member not found
- Alias/email conflict
- Session initialization failure

## Design Constraints

- Must comply with global header/footer standards.
- Must follow route and redirect rules in `LGFC-Production-Design-and-Standards.md`.
- Must not introduce separate standalone Join and Login pages.
