---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Live operating procedures, incident response, monitoring, operator workflows
Does Not Own: Redefining design/architecture/platform specs; historical records
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
Last Reviewed: 2026-02-20
---

# Production Audit (Playwright Invariants)

## What it does
Runs Playwright invariants against the public production website URL on a schedule and on manual dispatch.

## What it is for
- Catch regressions that pass build/lint
- Detect missing pages/routes, broken nav/header/footer, auth-gating regressions
- Provide objective “as-built behavior” signal without relying on visual review

## What it does NOT do
- It does not auto-fix main.
- It does not revert production automatically.
- It creates/updates a GitHub Issue and attaches an HTML report artifact in the Actions run.

## Where to find results
- GitHub Actions → "Production Audit (Playwright Invariants)"
- If failed: open issue titled "Production Audit Failed (Playwright Invariants)" and download artifact "playwright-report-production"

## How to change the target URL
Edit:
- scripts/ci/production_base_url.txt
