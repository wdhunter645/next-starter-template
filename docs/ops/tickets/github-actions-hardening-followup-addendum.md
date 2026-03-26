---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: explanatory and execution context omitted from the original GitHub Actions hardening follow-up ticket
Does Not Own: canonical CI policy or live workflow implementation
Canonical Reference: /docs/reference/ci/github-actions_MASTER.md
Last Reviewed: 2026-03-26
---

# GitHub Actions Hardening Follow-Up Ticket — Addendum

## Purpose
This addendum closes the gaps left in `/docs/ops/tickets/github-actions-hardening-followup.md` after PR 745 merged. The original ticket captured scope, constraints, deliverables, and exit criteria, but it did not fully explain why the work is needed, who needs it, what benefits it provides, when it must be completed, where it applies, or what implementation PRs must follow.

## Why this work is needed
PR 719 exposed two unresolved repository-governance gaps:
1. There is no locked repository standard for whether GitHub Actions must use immutable commit SHA pins or may use mutable version tags.
2. There is no locked repository policy for whether reviewer automation is allowed and, if allowed, under what constraints.

Leaving those decisions open invites repeated debate, inconsistent workflow edits, unnecessary review friction, and governance drift.

## Who needs this
- Repository owner and maintainers who approve workflow and governance changes
- Human contributors and AI agents who modify `.github/workflows/*`
- Reviewers who need one clear standard for action references and reviewer-routing behavior

## Benefits
- One standard for GitHub Actions references across the repository
- Lower workflow drift and fewer repeat debates in PR review
- Clear governance boundaries for any future reviewer-routing automation
- Better predictability for CI and repo-operations work

## When this needs to be completed
- Decision-level completion: before any new PR is opened to change GitHub Actions pinning or introduce reviewer automation
- Implementation-level completion: in the next hardening cycle immediately after the decision work is merged

## Where this applies
- `.github/workflows/*`
- other `.github/*` governance/config files tied to workflow behavior
- `docs/reference/ci/*`
- related governance and operations documents as needed

## Required next PRs
1. **GitHub Actions pinning enforcement PR**
   - Scope: standardize action references to the chosen policy across workflow files
   - Outcome: one repository-wide rule applied consistently

2. **Reviewer automation PR**
   - Scope: only if reviewer automation is explicitly approved after policy review
   - Outcome: either a controlled workflow with bounded behavior or explicit documentation that reviewer automation is prohibited

## Expected outcome of the follow-up project
- The repository has a recorded decision on GitHub Actions pinning
- The repository has a recorded decision on reviewer automation
- The resulting implementation PRs are narrow, governed, and non-duplicative

## Relationship to the original ticket
Read this addendum together with `/docs/ops/tickets/github-actions-hardening-followup.md`. The original ticket remains the scope anchor; this addendum supplies the omitted operational context and required next-step framing.
