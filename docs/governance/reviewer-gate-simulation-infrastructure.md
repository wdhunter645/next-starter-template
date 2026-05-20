---
Doc Type: Governance
Audience: CI maintainers, governance operators, AI agents
Authority Level: Controlled
Owns: Executable reviewer-gate simulation fixture and test inventory
Does Not Own: Production reviewer-gate workflow behavior or branch protection settings
Canonical Reference: /docs/explanation/reviewer-gate-simulation-harness.md
Last Reviewed: 2026-05-20
---

# Reviewer Gate Simulation Infrastructure

## Purpose

Issue #1069 establishes the first executable governance simulation layer for reviewer-gate behavior.

The simulation layer is local and deterministic. It does not call GitHub APIs and does not depend on live pull requests.

## Executable Surfaces

- `scripts/ci/reviewer-gate-simulation.mjs`
- `tests/reviewer-gate-simulation.test.mjs`
- `tests/fixtures/reviewer-gate/events/*.json`
- `tests/fixtures/reviewer-gate/cases.json`

## Covered Behavior

The first simulation layer covers:

- PR lifecycle fixture payloads for opened, synchronize, ready-for-review, review-submitted, labeled, and unlabeled events
- source-Issue accounting outcomes for valid, malformed, missing, multiple, and cross-repository references
- intent allowlist outcomes for valid and violating file sets
- protected-scope routing for `.github/workflows/**` and `scripts/ci/**`
- advisory-first routing for docs-only and website-only PRs
- remediation-label advisory downgrade behavior

## Enforcement Boundary

These tests validate expected governance decisions. They do not replace production workflows and do not change branch protection.

Production workflow behavior remains owned by the workflow files and required-check configuration.
