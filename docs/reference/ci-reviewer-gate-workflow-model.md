---
Doc Type: Reference
Audience: Repository operators, CI maintainers, AI agents
Authority Level: Canonical Draft
Owns: Reviewer workflow role definitions and tier classifications
Does Not Own: Step-by-step implementation procedures or operational runbooks
Canonical Reference: Issue #1058
Last Reviewed: 2026-05-19
---

# CI Reviewer Gate Workflow Model

## Workflow Classification

| Workflow | Classification | Blocking | Purpose |
|---|---|---|---|
| GATE — Merge Safety | Merge protection | Yes | Required approvals and protected review enforcement |
| OPS — Reviewer Advisory | Advisory | No | Review visibility and governance reminders |
| GOV — PR Accounting | Governance | Conditional | Source issue mapping and allowlist governance |

## Tier Definitions

### Tier 1 — Hard Blocking
Reserved for:
- required approvals
- unresolved security reviews
- protected review thread violations
- branch protection violations

### Tier 2 — Governance Enforcement
Conditional blockers for:
- missing issue mapping
- allowlist violations
- unsafe operational changes

### Tier 3 — Advisory
Non-blocking workflows providing:
- review reminders
- stale-review visibility
- governance guidance
- operational summaries

## Protected Scope
Hard reviewer enforcement applies to:
- .github/workflows/**
- scripts/ci/**
- deployment/security-sensitive configuration

## Remediation Handling
Governance remediation PRs downgrade reviewer advisory workflows to warning-only behavior.
