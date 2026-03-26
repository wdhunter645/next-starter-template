---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: GitHub Actions hardening follow-up execution
Does Not Own: canonical CI policy or live workflow implementation
Canonical Reference: /docs/reference/ci/github-actions_MASTER.md
Last Reviewed: 2026-03-26
---

# GitHub Actions Hardening Execution Ticket

## Why
PR 719 exposed two unresolved governance gaps: GitHub Actions pinning policy and reviewer automation policy. Leaving them undecided creates inconsistent workflow patterns, repeated review friction, and governance drift.

## Who
Owner: wdhunter645
Execution: ChatGPT and approved repository agents
Reviewer: wdhunter645

## Benefits
- One standard for GitHub Actions usage
- Less workflow drift
- Clear reviewer-routing rules
- Faster PR review
- Better CI governance

## When
- Policy decision: this PR cycle
- Implementation PRs: next PR cycle after this ticket merges
- Full enforcement: before any new workflow PRs are opened on these topics

## Where
- .github/workflows/*
- .github/* governance files
- docs/reference/ci/*
- directly related governance documents

## Objective
Lock and implement:
1. GitHub Actions pinning standard
2. Reviewer automation policy

## Decisions Required
1. Pinning standard: full commit SHA or version tag
2. Reviewer automation: allowed or prohibited

## Required Next PRs
1. GitHub Actions pinning enforcement PR
2. Reviewer automation PR only if reviewer automation is approved

## Constraints
- One PR = one task
- No auto-assignment on PR open unless explicitly approved
- Any workflow change must include rollback and verification

## Exit Criteria
- Pinning policy documented
- Reviewer automation decision documented
- Required implementation PRs opened
- No repeat debate in later PRs
