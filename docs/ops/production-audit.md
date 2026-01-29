# Production Audit (Playwright Invariants)

## What it does
Runs Playwright invariants against the public production website URL on a schedule and manual dispatch.

## What it is for
- Catch regressions that pass build/lint
- Detect missing pages/routes, broken header/footer/nav, auth gating regressions
- Provide an objective “as-built behavior” signal without relying on visual review

## What it does NOT do
- It does not auto-fix main.
- It does not revert production.
- It opens/updates a GitHub Issue and provides an HTML report artifact in the Actions run.

## Where to find results
- GitHub Actions → "Production Audit (Playwright Invariants)"
- If failed: issue titled "Production Audit Failed (Playwright Invariants)" and artifact "playwright-report-production"

## How to change the target URL
Edit:
- scripts/ci/production_base_url.txt
