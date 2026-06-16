---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Program #1259 Task 003 auth-state validation evidence for Website QA / Production Validation
Does Not Own: Application code changes unless gap-only fix authorized, issue closure, or workflow YAML
Canonical Reference: /docs/ops/implementation-plans/website-qa-production-validation.md
Related issues: #1255, #1259, #1013, #1110
Last Reviewed: 2026-06-15
---

# Website QA / Production Validation — Auth-State Validation

## Purpose

Task 003 deliverable for Program #1255 child project `#1259`. Verify guest,
member, and admin auth behavior across layout gates, session hook redirects,
public header variants, and logout flow. Gaps are classified with severity for
downstream tasks.

## Boundary

- Auth-state scoped tests and documentation only
- No auth provider redesign
- Responsive viewport checklist deferred to Task 004

Assessment date: **2026-06-15** (`main` after Task 002 PR `#1662` merge `2e811a6`).

## Executive summary

Auth-state validation **passes** with two documented pass-with-note items.
Layout gates fail closed for guests and non-admin members. Public header and
hamburger variants align with session state. No code fixes required in this task.

| Result | Count |
| --- | --- |
| Pass | 16 |
| Pass with note | 2 |
| Fail | 0 |

Automated evidence: `tests/public-auth-state-validation.test.tsx` (9 cases),
`tests/use-member-session.test.tsx` (5 cases), plus existing
`tests/join-login-auth.test.tsx` and `tests/admin-operations.test.tsx`.

## Auth-state matrix

| State | Session API (`/api/session/me`) | Public routes | `/fanclub/**` | `/admin/**` | Public header |
| --- | --- | --- | --- | --- | --- |
| **Guest** | non-ok / no email | Allowed | Redirect → `/` | Redirect → `/` | Join + Login |
| **Member** | ok + email, role `member` | Allowed | Allowed | Redirect → `/` | Club Home + Logout |
| **Admin** | ok + email, role `admin` | Allowed | Allowed | Allowed | Club Home + Logout on public pages |

**Architectural note:** Route protection is client-side via `useMemberSession` in
layout files. Brief `null` render may occur before redirect on gated routes.

## Checklist

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Fanclub layout blocks loading state | **Pass** | `public-auth-state-validation.test.tsx` |
| 2 | Fanclub layout blocks guests | **Pass** | same |
| 3 | Fanclub layout allows authenticated members | **Pass** | same |
| 4 | Admin layout blocks guests | **Pass** | same |
| 5 | Admin layout blocks non-admin members | **Pass** | same |
| 6 | Admin layout allows admins | **Pass** | same + `admin-operations.test.tsx` |
| 7 | Fanclub layout uses member session gate (behavioral) | **Pass** | layout gate tests |
| 8 | Admin layout uses admin-only gate (behavioral) | **Pass** | layout gate tests |
| 9 | `useMemberSession` redirects guests | **Pass** | `use-member-session.test.tsx` |
| 10 | `useMemberSession` allows members on fanclub gate | **Pass** | same |
| 11 | `useMemberSession` redirects members from admin gate | **Pass** | same |
| 12 | `useMemberSession` allows admins on admin gate | **Pass** | same |
| 13 | `useMemberSession` redirects on fetch failure | **Pass** | same |
| 14 | Public header guest controls (Join/Login) | **Pass** | `public-auth-state-validation.test.tsx` |
| 15 | Public header member controls (Club Home/Logout) | **Pass** | same |
| 16 | Logout posts to `/api/logout` and returns home | **Pass** | logout behavior test |
| 17 | Fanclub e2e uses mocked session | **Pass with note** | `launch-readiness-fanclub-routes.spec.ts` — not true unauth redirect |
| 18 | Client-side gate flash before redirect | **Pass with note** | Documented; no `middleware.ts` |

## Gap disposition

| Gap | Severity | Task 003 disposition |
| --- | --- | --- |
| Fanclub layout redirect untested (Task 001) | Medium | **Closed** — layout gate tests added |
| Fanclub e2e mocked session only | Low | Documented; production smoke deferred |
| Client-only gates (brief flash) | Low | Documented in matrix |
| Membercard API gated paths | Low | Deferred to Task 006 surface validation |

No Task 003 code fixes required.

## Validation commands

```bash
npm test -- tests/public-auth-state-validation.test.tsx tests/use-member-session.test.tsx tests/join-login-auth.test.tsx tests/admin-operations.test.tsx

printf '%s\n' \
  docs/ops/reports/website-qa-production-validation-auth-state-validation.md \
  docs/ops/implementation-plans/website-qa-production-validation.md \
  > /tmp/task003-docs-header-list.txt
DOCS_HEADER_FILE_LIST=/tmp/task003-docs-header-list.txt ./scripts/ci/docs_check_headers.sh .
```
