---
Doc Type: TBD
Audience: Human + AI
Authority Level: TBD
Owns: TBD
Does Not Own: TBD
Canonical Reference: TBD
Last Reviewed: 2026-02-20
---

# Production Scan Trigger

**Last Updated:** 2026-02-06 11:59:43 UTC

**Reason:** Initial setup — enable on-merge production scan workflow triggers (PR implementation)

**Related PR:** N/A (initial implementation)

---

## Purpose

This file serves as a trigger marker for production scan workflows. Updating this file and merging to `main` will automatically trigger the following Class B operational workflows:

- `production-audit.yml` — Playwright invariants against production
- `ops-assess.yml` — Site assessment and health checks
- `ops-design-compliance-audit.yml` — Design compliance monitoring

## Usage

To run production scans on demand:

1. Update the timestamp and reason in this file
2. Commit and push to a feature branch
3. Create and merge a PR to `main`
4. The workflows will run automatically on merge

Alternatively, use `workflow_dispatch` in GitHub Actions UI for manual runs.
