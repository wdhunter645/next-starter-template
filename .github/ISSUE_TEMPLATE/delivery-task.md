---
name: Delivery Task
about: Model A/B or emergency task with stable delivery metadata
title: 'TASK: <short title>'
labels: ['agent:cursor']
assignees: []
---

## Purpose

<!-- One paragraph: what this task delivers and why. -->

## PMO intake (required before launch)

All work enters as `Size: medium-provisional` until classified. See `docs/how-to/pmo/classify-work-and-select-delivery-model.md`.

```text
Size: medium-provisional
Delivery model:
Change mode:
Target environment:
Approval profile:
Gate profile:
Rollback profile:
Component branch:
Component master:
Promotion PR:
Parent project:
Predecessor:
Successor:
Manifest path:
Production merge: prohibited
Runtime: local
```

## Communication routing

- Executable tasks use `agent:cursor` + `handoff:ready` (claim → `handoff:in-progress`).
- Routine progress uses `CURSOR STATUS` / `CURSOR COMPLETE`.
- Genuine stops use `CHATGPT HANDOFF`.
- See `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`.

## Classification evidence

Record the matrix row or contract outcome used to finalize fields above:

- Work-size contract row or rationale:
- Model A/B decision evidence (if Medium):
- Protected-change paths touched (if any):
- Emergency exit used: NO / YES — rationale if YES

## Scope

### Allowed paths

- `path/to/file`
- `path/to/directory/**`

All other paths are out of scope.

## Acceptance criteria

- [ ] Stable metadata recorded on the issue and matching PR
- [ ] Changed files stay inside the allowlist
- [ ] Verification evidence attached to the PR

## Rollback

<!-- One-step, multi-step, or emergency-stabilization action for this task. -->

## Stop rule

Stop only for authority conflict, missing allowlist, material business/security decision, or production/`main` approval. Routine non-`main` PR readiness on a launched Model B project does not require a ChatGPT stop.
