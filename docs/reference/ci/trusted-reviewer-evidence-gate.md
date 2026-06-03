---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Trusted reviewer evidence gate contract, reviewer registry model, selected reviewer accounting rules
Does Not Own: Individual third-party reviewer service availability, branch protection settings, reviewer bot implementation details
Canonical Reference: /docs/explanation/ci/lgfc-ci-production-design.md
Related Issues: #1247, #1196, #1075, #1058
Last Reviewed: 2026-06-03
---

# Trusted Reviewer Evidence Gate

## Purpose

The trusted reviewer evidence gate replaces brittle reviewer-response-completion behavior with a generic reviewer evidence model.

The gate answers one narrow pre-merge question: has at least one trusted reviewer path produced usable evidence for the current pull request head?

It must not make any individual reviewer service a permanent single point of failure.

## Trusted Reviewer Registry

Trusted reviewers are configured through a registry.

The registry may include:

- Cubic
- Copilot
- Gemini while available
- future approved review agents

Adding or removing a reviewer must be a registry/configuration change, not a workflow redesign.

## Qualifying Evidence

A trusted reviewer path may satisfy the gate when it produces current-head evidence such as:

- a pull request review submission tied to the current head SHA
- an inline review comment tied to the current head SHA
- another approved review artifact that can be attributed to the current pull request head

Top-level comments without head attribution may provide context, but they do not satisfy current-head evidence by themselves.

## Gate Rule

The gate passes when at least one trusted reviewer path has qualifying current-head evidence and all actionable inline comments from that selected reviewer path are accounted for.

The gate must not require every trusted reviewer to respond.

The gate must not fail merely because a non-selected trusted reviewer is unavailable, delayed, removed, or advisory-only.

## Selected Reviewer Path

When multiple trusted reviewers provide qualifying evidence, the gate selects one reviewer path deterministically.

The selected reviewer path becomes the only reviewer path required for pre-merge accounting.

Reviewer accounting must include every actionable inline comment from the selected path.

Reviewer artifacts from non-selected paths remain available for advisory review and post-merge audit.

## Reviewer Accounting

When the selected reviewer path includes actionable inline comments, the pull request body must account for those comments in reviewer-response accounting.

Each actionable selected-reviewer comment must be marked as accepted, rejected, or ignored with rationale.

The gate should not require accounting for comments outside the selected reviewer path before merge.

## Post-Merge Audit

Post-merge reviewer audit remains responsible for late, additional, or non-selected reviewer findings.

Late or unaccounted serious reviewer findings should create remediation evidence, pause queue advancement when appropriate, and avoid silently closing source issues.

## Service Retirement Rule

Reviewer service availability is external to the repository.

If a reviewer service is retired or removed, CI should remove that reviewer from the registry and continue operating with the remaining trusted reviewers.

No reviewer retirement should require redesigning the CI lifecycle model.
