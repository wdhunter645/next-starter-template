---
name: Agent Task
description: Small, serialized task for Copilot Agent (1 active PR at a time)
title: "[Agent]: <short title>"
labels: ["agent","copilot:run","spec-locked"]
assignees: []
---

## Context
<!-- Why are we doing this? Link any prior issues/PRs. -->

## Task
<!-- Exact change requested. Keep it small; UI-only unless stated otherwise. -->

## Acceptance Criteria
- [ ] Matches `docs/HOMEPAGE_SPEC.md` (if applicable)
- [ ] Passes `spec-guard` CI
- [ ] Cloudflare Pages preview ✅
- [ ] Screenshots attached in PR
- [ ] No deps changed; no package-lock changes

## Pacing Rules
- Create exactly **one** PR for this issue.
- If other PRs exist for this file/section, mark them **Draft** until this merges.
- Do not touch `Header.tsx` or `app/page.tsx` unless this issue explicitly says so.
