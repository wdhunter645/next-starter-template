---
name: Agent Task
about: Small, serialized task for Copilot Agent (1 active PR at a time)
title: '[Agent]: <short title>'
labels: ['agent', 'copilot:run', 'spec-locked']
assignees: []
---

## Context

<!-- Why are we doing this? Link prior issues/PRs. -->

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
Runtime: local
```

Classify before implementation per `docs/how-to/pmo/classify-work-and-select-delivery-model.md`.

## Classification evidence

- Work-size contract row or rationale:
- Model A/B decision evidence (if Medium):
- Protected-change paths touched (if any):

## Task

<!-- Exact change. Keep it small; UI-only unless stated otherwise. -->

## Acceptance Criteria

- [ ] Matches `docs/HOMEPAGE_SPEC.md` (if applicable)
- [ ] Passes spec-guard CI
- [ ] Cloudflare Pages preview ✅
- [ ] Screenshots attached in PR
- [ ] No dependency or lockfile changes

## Pacing Rules

- Create exactly **one** PR for this issue.
- If other PRs touch same section/file, mark them **Draft** until this merges.
- Do not touch `Header.tsx` or `app/page.tsx` unless this issue explicitly says so.
