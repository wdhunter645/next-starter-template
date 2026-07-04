---
Doc Type: Governance
Audience: Human + AI
Authority Level: Controlled
Owns: PR intent-label taxonomy reference
Does Not Own: Canonical PR-process policy, PR class routing, active workflow enforcement state
Canonical Reference: /docs/governance/PR_PROCESS.md
Last Reviewed: 2026-07-04
---

# PR Intent Labels

This document is a controlled reference for PR intent labels. The canonical pull request process is `/docs/governance/PR_PROCESS.md`.

## Current transition status

During #2175 / #2208 rebuild, intent-label automation is manual-only. This file must not be read as proof that intent labeling is currently automatic or blocking.

Intent taxonomy remains useful, but enforcement must be rebuilt advisory-first before any required-check promotion.

## Current stable PR template fields

The active PR template asks for both:

- intent label;
- PR class.

Intent label describes the reason/category of work. PR class describes verification depth and CI routing.

## Legacy label model

Older labels such as `infra`, `feature`, `docs-only`, `platform`, `change-ops`, `codex`, and `recovery` may still exist historically. They do not override the active PR template or the canonical process.

## Active guidance

1. Use the active PR template.
2. Declare the intended label/category clearly.
3. Keep PRs focused.
4. Split mixed work unless explicitly approved.
5. Do not rely on automatic label mutation while the intent labeler is manual-only.

## References

- `/docs/governance/PR_PROCESS.md` — canonical PR process.
- `/docs/reference/ci/pr-process-current-state.md` — current safe-mode state.
- `.github/intent-labeler.json` — implementation configuration, if retained.
- `scripts/ci/pr_intent_allowlists.json` — implementation configuration, if retained.
