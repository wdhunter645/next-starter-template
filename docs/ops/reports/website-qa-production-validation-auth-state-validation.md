---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Program #1259 Task 003 auth-state validation evidence for Website QA / Production Validation
Does Not Own: Auth provider redesign, new admin features, issue closure, or workflow YAML
Canonical Reference: /docs/ops/implementation-plans/website-qa-production-validation.md
Related issues: #1255, #1259, #1666
Last Reviewed: 2026-06-16
---

# Website QA / Production Validation — Auth-State Validation

## Purpose

Task 003 deliverable for Program #1255 child project `#1259`. Verify guest,
member, and admin route-state behavior for public production validation.

## Boundary

- Validation/reporting task only.
- No auth provider redesign.
- No application runtime changes beyond test coverage.
- No issue closure in this PR.

Assessment date: **2026-06-16** (`main` after Program #1500 Task 005 merge `8a0a20d`).

## Executive summary

Auth-state validation **passes with documented fail-closed behavior** for the
current public/member/admin route boundaries.

| Result | Count |
| --- | --- |
| Pass | 9 |
| Pass with note | 1 |
| Fail | 0 |

Automated evidence: `tests/public-auth-state-validation.test.tsx`.

## Guest / member / admin matrix

| Area | Guest | Member | Admin | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Public header | Sees Join/Login entry points | Logged-in state switches to Club Home/Logout | Logged-in state switches to Club Home/Logout; no separate admin header variant | Pass with note | `src/components/Header.tsx`, `LOGIN_TAB_ROUTE` |
| `/fanclub/**` layout | Hidden shell; redirects to `/` | Allowed after session validation | Allowed after session validation | Pass | `src/app/fanclub/layout.tsx`, `useMemberSession({ redirectTo: '/' })` |
| `/admin/**` layout | Hidden shell; redirects to `/` | Hidden shell; redirects to `/` | Allowed after session validation | Pass | `src/app/admin/layout.tsx`, `requireAdmin: true` |
| Session role mapping | `guest` when session is absent or invalid | `member` when session is valid and not admin | `admin` only when API role is `admin` | Pass | `src/hooks/useMemberSession.ts` |

## Fail-closed checklist

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Fanclub layout suppresses children while loading | Pass | `isLoading` branch returns `null` |
| 2 | Fanclub layout suppresses children when not authenticated | Pass | `!isAuthenticated` branch returns `null` |
| 3 | Fanclub layout redirects invalid/guest session to `/` | Pass | `redirectTo: '/'` |
| 4 | Admin layout suppresses children while loading | Pass | `isLoading` branch returns `null` |
| 5 | Admin layout suppresses children for unauthenticated users | Pass | `!isAuthenticated` branch returns `null` |
| 6 | Admin layout suppresses children for non-admin members | Pass | `role !== 'admin'` branch returns `null` |
| 7 | Admin layout requests admin-only validation | Pass | `requireAdmin: true` |
| 8 | Session hook treats invalid session responses as guest | Pass | role normalization fallback to `guest` |
| 9 | Guest header keeps canonical join/login entry points | Pass | `/join`, `LOGIN_TAB_ROUTE` |
| 10 | Logged-in header switches away from join/login CTAs | Pass with note | `src/components/Header.tsx` uses session state for Club Home/Logout; role-specific member/admin header variants are out of scope |

## Notes

- Current header behavior is auth-aware for guest versus logged-in state: guest
  users see Join/Login, while logged-in users see Club Home/Logout.
- Role-specific member versus admin header variants are not implemented in this
  task and should not be inferred as a blocker for Task 003.
- The current member/admin route boundaries use fail-closed rendering: protected
  children are not rendered while session state is unresolved or unauthorized.
- Manual production validation should confirm the same matrix against deployed
  session cookies after environment credentials are available.

## Verification

```bash
npx vitest run tests/public-auth-state-validation.test.tsx
DOCS_HEADER_FILE_LIST="docs/ops/reports/website-qa-production-validation-auth-state-validation.md docs/ops/implementation-plans/website-qa-production-validation.md" \
  ./scripts/ci/docs_check_headers.sh .
git diff --check
```

## Disposition

Task 003 acceptance is satisfied when the scoped test passes and this report is
merged with #1666 linked as the source issue.
