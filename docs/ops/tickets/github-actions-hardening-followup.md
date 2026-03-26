---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: follow-up hardening scope for GitHub Actions pinning and reviewer automation design
Does Not Own: canonical CI policy or live workflow implementation
Canonical Reference: /docs/reference/ci/github-actions_MASTER.md
Last Reviewed: 2026-03-26
---

# GitHub Actions Hardening Follow-Up Ticket

## Objective
Define and execute a controlled follow-up for two deferred items from PR 719:
1. Standardize GitHub Actions pinning policy (full commit SHA vs version tag)
2. Decide whether reviewer automation should exist in a separate controlled workflow

## Scope
- Review current workflows under `/.github/workflows/`
- Document the preferred pinning rule and rollout approach
- Decide whether reviewer automation is allowed, and if allowed, under what trigger and governance constraints
- Keep PR 719 scope closed; no retroactive expansion into that PR

## Constraints
- One PR = one task
- No unauthorized reviewer auto-assignment on PR open
- Any new workflow must have explicit purpose, rollback path, and verification steps
- Prefer GitHub-native routing (for example `CODEOWNERS`) unless a stronger need is documented

## Deliverables
- Written decision on action pinning policy
- Written decision on reviewer automation policy
- Follow-up implementation PR only after policy is locked

## Exit Criteria
- The repository has a documented standard for GitHub Action references
- The repository has a documented yes/no decision on reviewer automation
- Any later implementation PR has a bounded allowlist and rollback plan
