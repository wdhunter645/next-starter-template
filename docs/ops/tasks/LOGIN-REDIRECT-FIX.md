---
Doc Type: Task
Audience: Human + AI
Authority Level: Working Task
Owns: Implementation objective and acceptance criteria for /login redirect alignment
Does Not Own: Canonical routing or auth behavior
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-04-01
---

# `/login` redirect fix

## Problem

Canonical design requires `/login` to be a legacy compatibility route that redirects to `/`.

Current implementation conflict:

- Design requires `/login` → `/`
- Repo currently renders a login UI at `src/app/login/page.tsx`

## Required Change

Replace the current `/login` page implementation with a redirect to `/`.

## Exact replacement

```ts
import { redirect } from 'next/navigation'

export default function LoginPage() {
  redirect('/')
}
```

## Acceptance Criteria

- `/login` no longer renders a login UI
- `/login` redirects to `/`
- `/join` remains the canonical join/login page
- No auth-model drift is introduced

## Verification

- Visit `/login` and confirm redirect to `/`
- Confirm `/join` still provides login/join access
