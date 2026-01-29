# CI Preview Invariants (Cloudflare Pages)

## Purpose
Repo-only checks (lint/build/path allowlists) do not prevent drift between implementation and the deployed website.
This workflow validates the *deployed preview* for every PR.

## What CI Enforces (Preview)
- Core public routes load (no 404/blank)
- /health responds OK
- Auth-gated routes (/fanclub, /admin) do not expose protected content when logged out
- Header/footer contain required navigation targets (logged-out baseline)

## What CI Does Not Enforce
- Pixel-perfect layout
- Content completeness beyond smoke/invariants
- Production URL correctness (this job targets PR preview deployments)

## Extending Invariants
Add checks in:
- tests/e2e/invariants.spec.ts

Keep tests:
- High-signal
- Low-brittleness
- Focused on regressions and omissions
