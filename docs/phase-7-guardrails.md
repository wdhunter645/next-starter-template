# Phase 7 — Guardrails & Drift Prevention (LGFC-Lite)

## Goal
Prevent repeat regressions and CI / deployment drift. Make the repo predictable.

## Guardrails in scope
1) **Single authoritative build path**
   - Cloudflare Pages build command: `npm run build:cf`
   - Output directory: `out`
   - Next.js export via `output: "export"` in `next.config.ts`

2) **Environment enforcement**
   - Runtime (Pages Functions) fails fast on missing required email vars when email is enabled.

3) **Secret scanning**
   - Gitleaks workflow runs on PR/push.
   - Custom config ignores known safe templates and documentation paths.
   - Real secrets still fail CI.

4) **Rollback anchor**
   - Always keep a known-good commit SHA.
   - Rolling back is: revert PR or reset to the SHA and redeploy Cloudflare Pages.

## What “done” looks like
- No duplicate / stale workflow definitions.
- CI is quiet when repo is clean.
- CI is loud only when something is actually wrong (lint/typecheck/tests/secrets).
- Cloudflare deploys stop surprising you.

5) **Dependency security**
   - Regular `npm audit` checks to identify vulnerabilities.
   - Critical vulnerabilities must be addressed immediately with minimal, targeted updates.

## Security Audit History

### PR 330 — Critical npm audit Fix (December 2025)
**Vulnerability Identified:**
- Package: `next`
- Vulnerable versions: `15.5.0 - 15.5.7`
- Severity: Critical (CVSS 10.0)
- CVEs:
  - GHSA-9qr9-h5gf-34mp: Next.js RCE in React flight protocol
  - GHSA-w37m-7fhw-fmv9: Next Server Actions Source Code Exposure (Moderate)
  - GHSA-mwv6-3258-q52c: Next DoS with Server Components (High)

**Resolution:**
- Updated `next` from `^15.5.6` to `^15.5.8` in package.json
- Ran `npm install` to update package-lock.json
- Verified: `npm audit` now shows 0 vulnerabilities
- Verified: `npm run build:cf` succeeds with Next.js 15.5.9

**Current Status:**
- ✅ 0 critical vulnerabilities
- ✅ 0 high vulnerabilities
- ✅ 0 moderate vulnerabilities
- ✅ Build passing on Next.js 15.5.9
