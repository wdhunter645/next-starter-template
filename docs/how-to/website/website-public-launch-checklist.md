---
Doc Type: How-To
Audience: Human + AI
Authority Level: Operational
Owns: Program #2039 public launch operator checklist
Does Not Own: Production merge authorization or live campaign launch
Canonical Reference: /docs/ops/pmo/website-public-launch-relaunch-readiness.md
Related issues: #2039, #2047
Last Reviewed: 2026-07-01
---

# Website Public Launch Checklist

## Purpose

Operator checklist for Program #2039 public relaunch readiness before production promotion.

## Scope

Preview validation, production promotion gates, and post-deploy verification handoff to smoke tests.

## Checklist

- [ ] Tasks #2041–#2046 merged and closed with `status:complete`
- [ ] Bill/Atlas authorize production promotion
- [ ] Cloudflare Pages production deploy green
- [ ] `NEXT_PUBLIC_GA_ID` set only when analytics launch is authorized
- [ ] No live fundraiser campaign enabled without separate authorization
- [ ] Run `website-production-smoke-test.md`
- [ ] Capture evidence using `website-public-launch-evidence-template.md`
