---
Doc Type: Governance
Audience: Human + AI
Authority Level: Supporting
Owns: Enforcement and drift-detection pointers for product/design supporting specifications
Does Not Own: Product and Design Domain Policy; page/route ownership; agent approval routing
Canonical Reference: /docs/governance/PRODUCT-AND-DESIGN.md
Related Issues: #2687
Last Reviewed: 2026-07-21
---

# Governance — Design Authority

## Status

**Supporting enforcement pointer** under the Product and Design Domain Policy.

Canonical domain policy owner: [`docs/governance/PRODUCT-AND-DESIGN.md`](../PRODUCT-AND-DESIGN.md).

This file does **not** own product or design policy. It routes operators and agents to the domain policy and supporting specifications.

## Purpose

Prevent design drift by pointing to the single Product and Design Domain Policy and the locked supporting specifications for UI/UX, routes, headers/footers, and production behavior expectations.

## Source of truth (Day-2 Ops)

- Domain policy: `/docs/governance/PRODUCT-AND-DESIGN.md`
- Primary production behavior specification: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Topic specs: `/docs/reference/design/**`
- Governance mechanics: `/docs/governance/PR_PROCESS.md`, `/docs/governance/PR_GOVERNANCE.md`
- Repository precedence: `/docs/governance/REPOSITORY-AUTHORITY.md`

## What Operations enforces

- Canonical routes and auth boundaries defined in supporting design specs.
- Header variants and menu ordering rules.
- Footer content and link order.
- “No redesign by accident” rule: any visual change must cite the specific supporting design section that permits it, under the domain policy decision rules.

## What Operations does NOT allow

- “Nice to have” redesign bundled into ops fixes.
- Framework swaps or architectural rewrites outside approved plan.
- Silent changes to navigation, labels, or routes.
- Treating this file or any `docs/reference/design/**` file as a Domain Policy co-owner.

## Design change policy

Design changes are allowed only when they follow `docs/governance/PRODUCT-AND-DESIGN.md`:

- supporting specifications are updated first when locked behavior changes; and
- the implementation PR references the exact updated section(s).

## Drift detection

A change is drift if it:

- Alters a locked invariant without updating the authoritative supporting design docs, or
- Touches files outside the allowed list for the PR’s intent label, or
- Changes header/footer/nav behavior without explicit authority, or
- Claims independent domain-policy ownership outside `PRODUCT-AND-DESIGN.md`.

## Escalation

If ambiguity exists:

- Do not merge.
- Follow Product and Design escalation rules in `docs/governance/PRODUCT-AND-DESIGN.md`.
- Update supporting design specs as required, then implement.

## Required Day-2 checks after UI changes

- Validate canonical routes still resolve.
- Validate auth redirects (`/fanclub/**` unauth redirects to `/`).
- Validate failed-auth redirect target (`/`).
- Validate header variant behavior logged in/out.
- Validate footer link order and content.
