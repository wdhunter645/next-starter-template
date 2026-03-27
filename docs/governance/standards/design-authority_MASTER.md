---
Doc Type: Governance
Audience: Human + AI
Authority Level: Canonical
Owns: Governance rules, PR process, enforcement, AI guardrails
Does Not Own: Design/architecture/platform specifications; step-by-step ops procedures
Canonical Reference: /docs/governance/standards/design-authority_MASTER.md
Last Reviewed: 2026-03-27
---

# Governance — Design Authority

Status: _MASTER (Operations authoritative)
Last Updated: 2026-03-27

## Purpose
Prevent design drift by defining the single source of truth for UI/UX, routes, headers/footers, and production behavior expectations.

## Source of truth (Day-2 Ops)
- Primary design authority: `/docs/reference/design/LGFC-Production-Design-and-Standards.md` (explicitly marked AUTHORITATIVE/LOCKED).
- Governance mechanics: `/docs/governance/PR_PROCESS.md`, `/docs/governance/PR_GOVERNANCE.md`.
- Authority conflicts: `/docs/governance/standards/document-authority-hierarchy_MASTER.md`.

## What Operations enforces
- Canonical routes and auth boundaries.
- Header variants and menu ordering rules.
- Footer content and link order.
- “No redesign by accident” rule: any visual change must cite the specific design authority section that permits it.

## What Operations does NOT allow
- “Nice to have” redesign bundled into ops fixes.
- Framework swaps or architectural rewrites outside approved plan.
- Silent changes to navigation, labels, or routes.

## Design change policy
- Design changes are allowed only when:
  - The authoritative design document is updated first (docs-only or change-ops as appropriate), and
  - The implementation PR references the exact updated section(s).

## Drift detection
A change is drift if it:
- Alters a locked invariant without updating the authoritative design docs, or
- Touches files outside the allowed list for the PR’s intent label, or
- Changes header/footer/nav behavior without explicit authority.

## Escalation
If ambiguity exists:
- Do not merge.
- Update design authority docs first, then implement.

## Required Day-2 checks after UI changes
- Validate canonical routes still resolve.
- Validate auth redirects (`/fanclub/**` unauth redirects to `/`).
- Validate failed-auth redirect target (`/join#login`).
- Validate header variant behavior logged in/out.
- Validate footer link order and content.
