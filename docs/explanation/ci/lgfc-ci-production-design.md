---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Controlled
Owns: CI lifecycle philosophy, production-grade CI design rationale, LGFC workflow domain model
Does Not Own: Individual workflow implementation, branch protection configuration, runtime secrets
Canonical Reference: /docs/reference/ci/lgfc-ci-ci-domain-reference.md
Related Issues: #1199, #1058
Last Reviewed: 2026-06-03
---

# LGFC Production CI Design

## Purpose

This document defines the production-grade CI/CD design direction for the Lou Gehrig Fan Club repository.

The repository keeps an enterprise-grade operating mindset while reducing brittle PR approval behavior. The design separates deterministic merge safety, corrective branch hygiene, post-merge governance validation, and live production operations into distinct lifecycle domains.

## Scope

This document governs CI lifecycle philosophy, workflow-domain placement, reviewer-governance direction, corrective CI strategy, and operational CI architecture.

It does not define individual GitHub Actions implementation details or repository runtime configuration.

## Current Known Truth

As of 2026-06-03 on `main`, Tasks 001 and 002 of the `#1075` CI redesign are
merged. Task 003 through Task 005 remain in open implementation PRs. The
authoritative reconciliation record is
`docs/reference/ci/lgfc-ci-as-built-reconciliation.md`.

Merged changes include PR hygiene advisories, consolidated merge protection
(`gate-zip-safety.yml` retired), and canonical merge-protection documentation in
`docs/reference/ci/merge-protection-surface.md`.

Remaining architectural debt on `main` includes synchronous reviewer lifecycle
blocking, placeholder DIATAXIS post-merge validation, legacy ZIP checks inside
`gate-drift.yml`, and a workflow inventory table that still reflects the 2026-05-19
baseline in several rows.

## Intended Final State

The repository will evolve toward four stable CI lifecycle domains:

- deterministic merge protection
- corrective PR hygiene
- retrospective post-merge validation
- OPS runtime monitoring and self-healing

The final architecture will preserve governance rigor while reducing false-positive failures and reviewer deadlocks.

As-built reconciliation and deferred items are tracked in
`docs/reference/ci/lgfc-ci-as-built-reconciliation.md`.

## Core Principle

Pre-merge protects `main`; post-merge verifies reality; OPS protects production.

The repository should not attempt to prove every governance, reviewer, and design outcome before merge. Pre-merge gates must answer one narrow question: is this PR safe to merge into `main`?

More variable analysis belongs before PR setup as corrective automation or after merge as fact-driven validation against what actually landed on `main`.

## Problem with the Previous Model

The previous workflow inventory mixed deterministic production safety with organizational process enforcement. This created false failures and workflow deadlocks, especially when checks depended on asynchronous reviewers, labels, PR metadata timing, or third-party bot execution.

The reviewer-response-completion gate demonstrated the defect clearly. It required a current-head trusted reviewer artifact even when reviewer comments had already been resolved, reviewer accounting was present, and the only remaining condition was reviewer bot timing. That is not deterministic merge safety; it is asynchronous process state.

## Final CI Domains

### 1. Pre-Merge Gate: LGFC Merge Protection

This is the strict binary gate. It exists to protect `main` from deterministic and immediate risk.

It should block only on conditions that are directly machine-provable, such as build failure, test failure, type failure, secret exposure, invalid migrations, ZIP artifact exposure, malformed workflow syntax, or catastrophic protected-file violations.

It should not depend on reviewer-bot timing, label race conditions, subjective design interpretation, or asynchronous orchestration state.

### 2. PR Branch Correction: LGFC PR Hygiene

This layer improves branch quality before merge gates become noisy.

It should auto-fix deterministic defects such as missing documentation headers, PR body formatting, source issue line normalization, labels, allowlist formatting, and simple Diátaxis metadata errors.

When the correct fix is uncertain, it should comment, label, or return the issue to the agent instead of blocking merge approval.

### 3. Post-Merge Validation: LGFC Main Verification

This layer inspects what actually landed on `main`.

It should validate implementation completeness, design alignment, documentation completeness, reviewer audit results, route behavior, architectural drift, and omissions from accepted PR scope.

Its primary outputs are evidence reports, issues, corrective PRs, and rollback recommendations for severe failures.

### 4. OPS Runtime: LGFC Production Operations

This layer protects the live Cloudflare-hosted site.

It validates deployment success, uptime, route health, D1/B2 connectivity, broken assets, performance regressions, traffic anomalies, and recovery evidence.

It may auto-retry safe failures, create incident issues, open remediation PRs, and preserve snapshot or rollback evidence.

## Enforcement Rule

A workflow may be blocking pre-merge only if the failed condition is deterministic, locally attributable to the PR, and directly related to merge safety.

If a check depends on asynchronous third-party timing, subjective interpretation, retrospective completeness analysis, or runtime observation, it belongs in PR Branch Correction, Post-Merge Validation, or OPS Runtime.

## Design Outcome

The repository keeps CI rigor but moves each control to the correct lifecycle layer.

The result is a stronger system:

- fewer PR deadlocks
- clearer branch protection
- fewer false failures
- better AI agent usability
- better post-merge evidence
- stronger operational recovery
- cleaner long-term maintenance
