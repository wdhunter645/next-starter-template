# Platform — GitHub Actions Operations

Status: _MASTER (Operations authoritative)
Last Updated: 2026-02-05

## Purpose
Define how GitHub Actions is used operationally to enforce governance and to validate production readiness.

## What Actions must enforce (Day-2)
- One-PR one-intent label policy.
- File-touch allowlists per intent label (drift gates).
- ZIP safety (no ZIPs committed; history purge policy if relevant).
- Required tests and build checks.

## Where rules live
- `.github/` governance docs (maps, intent labeler config).
- Repo governance docs:
  - `/docs/website-process.md`
  - `/docs/governance/pr-intent-labels.md`
  - `/docs/governance/ci-preview-invariants.md`

## Operator workflow
1) Before opening a PR:
- Choose the correct intent label.
- Confirm intended file list is allowed.

2) When checks fail:
- Read the failing job output.
- Determine whether:
  - The PR is mislabeled, or
  - The PR touches forbidden files, or
  - The workflow logic needs correction.

3) Fix strategy
- Prefer adjusting the PR content/label over weakening drift gates.
- Drift gates are guardrails; bypassing them must be treated as a governance incident.

## Re-running checks
- Re-run checks only after correcting the underlying cause.
- If Cloudflare preview is stuck/spinning:
  - Cancel and re-run once.
  - If persists, treat as platform incident and capture evidence.

## Required documentation on changes to CI
Any CI change must include:
- What governance rule it enforces
- What files it is expected to touch
- How to verify it works
- Rollback plan (revert PR)

## References
- `/docs/website-process.md`
- `.github/CI_GUARDRAILS_MAP.md`
