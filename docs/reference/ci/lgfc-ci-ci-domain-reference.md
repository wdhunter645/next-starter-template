---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: LGFC CI domain definitions and workflow responsibilities
Does Not Own: Workflow implementation details
Canonical Reference: /docs/explanation/ci/lgfc-ci-production-design.md
Related Issues: #1058
Last Reviewed: 2026-05-21
---

# LGFC CI Domain Reference

## Pre-Merge Gate Domain

Purpose:
- protect `main`
- prevent deterministic production risk
- enforce catastrophic repository safety

Characteristics:
- binary pass/fail
- deterministic only
- merge blocking
- no asynchronous reviewer timing dependencies

Examples:
- build validation
- type validation
- test execution
- secret scan
- ZIP protection
- migration validation

## PR Hygiene Domain

Purpose:
- improve branch quality before merge approval
- auto-correct deterministic formatting/governance defects

Characteristics:
- corrective
- advisory when uncertain
- non-blocking by default

Examples:
- docs header insertion
- PR metadata normalization
- issue-line normalization
- Diataxis correction
- label normalization

## Post-Merge Validation Domain

Purpose:
- validate what actually landed on `main`
- compare implementation against repository design intent

Characteristics:
- retrospective
- evidence-driven
- remediation-focused

Examples:
- reviewer audit
- design audit
- implementation completeness verification
- drift analysis
- remediation issue generation

## OPS Runtime Domain

Purpose:
- protect production operations
- detect and heal runtime degradation

Characteristics:
- operational
- runtime-aware
- self-healing where safe

Examples:
- Cloudflare deployment verification
- D1/B2 health validation
- smoke tests
- performance monitoring
- retry/recovery workflows
