---
Doc Type: Design Authority
Audience: Human + AI
Authority Level: Controlled
Owns: Join/Login page UI structure and form requirements
Does Not Own: Canonical auth/session rules and redirect policy
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-27
---

# Join / Login Page Design

This document defines the combined **Join/Login** page UI used for LGFC member access.

Canonical auth reference: /docs/reference/design/auth-model.md

## Route

Primary route:

`/join`

Legacy route handling:

`/login` → redirect to `/`

## Page Purpose

Provide one entry surface for:

1. New member join
2. Existing member login

## Tabs

- Join tab is default on `/join`
- Login tab is available in-page on `/join`
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

## Auth Behavior Contract

Auth/session and redirect behavior are governed by `auth-model.md`.

Implementation in this page must comply with:
- Successful login target `/fanclub`
- Unauthenticated/invalid member-route redirect `/`
- Logout completion redirect `/`

## Design Constraints

- Must comply with global header/footer standards.
- Must follow canonical auth rules in `auth-model.md`.
- Must not introduce separate standalone Join and Login pages.
