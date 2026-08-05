---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: F3 live-state evidence for the Production `NEXT_PUBLIC_GA_ID` configuration, per the #2919 approved Product Decision Record item 2
Does Not Own: Production configuration changes, disclosure/consent-UI implementation (owned by #2920)
Canonical Reference: /docs/ops/reports/compliance-product-decision-register-2919.md
Related Issues: #2784, #2918, #2919, #2920
Last Reviewed: 2026-08-05
---

# Production `NEXT_PUBLIC_GA_ID` State — Evidence (#2919)

## Purpose

Record what can and cannot be confirmed about whether Google Analytics is active in Production, per Product Decision Record item 2 ("verify the Production `NEXT_PUBLIC_GA_ID` state through an authorized read-only check... if GA is active, report the protected stop immediately"). This is read-only evidence gathering; it makes no Production configuration change.

## Scope

In scope: repository-only, read-only evidence about the `GoogleAnalytics` component's gating logic and whether any committed repository file sets `NEXT_PUBLIC_GA_ID`, plus an explicit statement of what cannot be confirmed without live Cloudflare Pages Production access. Out of scope: Production environment-variable changes, and the disclosure/consent-UI implementation owned by #2920.

## Current known truth

`src/components/GoogleAnalytics.tsx` renders `null` (a complete no-op — no script tag, no network request) whenever `process.env.NEXT_PUBLIC_GA_ID` is unset or empty. It is included unconditionally in `src/app/layout.tsx`, so whether GA actually loads on any page depends entirely on whether `NEXT_PUBLIC_GA_ID` is set in the Production environment at build/deploy time. There is no consent gate, no `/privacy` disclosure mentioning GA, and no DNT handling in the current code regardless of whether the variable is set.

## What this evidence step could confirm from the repository alone

- The exact conditional logic that gates GA's behavior (confirmed by reading the component source).
- No repository file sets `NEXT_PUBLIC_GA_ID` to a non-empty value (it is not present in `wrangler.toml`, `.env*`, or any committed config file — Next.js `NEXT_PUBLIC_*` variables are build-time, so a value would have to come from the Cloudflare Pages build environment, not from this repository).

## What this evidence step could not confirm

**Whether `NEXT_PUBLIC_GA_ID` is actually set in the live Cloudflare Pages Production build/deploy environment.**

This requires authorized access to the Cloudflare Pages dashboard's Production environment-variable configuration for this project, or an authenticated `wrangler pages deployment` / `wrangler pages secret list`-equivalent read. This session/environment has no Cloudflare authentication (`wrangler whoami` reports "You are not authenticated") — there is no credential-free way to check this from here, and none is authorized to be added under this task's envelope.

## Protected stop

Per Product Decision Record item 2's explicit instruction ("if GA is active, report the protected stop immediately") and the executable package's stop conditions ("credential/Production mutation"): **this verification is blocked on authorized read-only Cloudflare Pages Production access that this implementation session does not have.** Because the state is unconfirmed, no action is taken on GA — it is left exactly as configured today, and no Production configuration is touched by this task.

## Recommended next step

An operator or agent with authenticated access to the Cloudflare Pages dashboard for this project should confirm the Production value of `NEXT_PUBLIC_GA_ID` and record the result here (or in a follow-up comment on #2919). If it is found set, per the approved decision it should be disabled through the authorized Production configuration path until #2920 implements the required disclosure/consent control — that disabling action itself is Production configuration and is out of this task's envelope regardless of the result.

## Intended final state

The live Production `NEXT_PUBLIC_GA_ID` value is confirmed and recorded here (or in a linked #2919 follow-up comment). If GA is active, it is disabled through the authorized Production configuration path — not by this report — until #2920 implements the required disclosure/consent control. This report does not itself reach that state — it records what remains unconfirmed and exactly why.

## Rollback

This document can be removed or revised without any other repository impact — it makes no code, schema, or Production configuration change.
