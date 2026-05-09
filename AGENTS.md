# LGFC Repository Agent Law

This file is mandatory routing law for all agents working in this repository.

## Non-negotiable rules

1. Read this file before changing the repository.
2. Treat repository documentation as the source of truth. Do not invent requirements.
3. Use exactly one primary source Issue for every PR.
4. Keep every PR narrow, reviewable, and file-allowlisted.
5. Do not modify website UX, routes, authentication, data, or runtime behavior unless the source Issue explicitly authorizes it.
6. Do not commit secrets, ZIP files, build output, screenshots, temporary files, or local environment files.
7. Prefer rollback-first fixes. Do not redesign to solve an incident unless the source Issue authorizes redesign.
8. Preserve Cloudflare Pages static export compatibility unless the source Issue explicitly changes hosting architecture.
9. Use the existing Diataxis documentation structure. Do not create a `DIATAXIS` folder.
10. Run the required verification checks before handoff.

## Required skill routing

Use these repository skills when the task matches the trigger:

- PR creation, PR updates, issue linkage, scope control, labels, or acceptance criteria: `.agents/skills/lgfc-pr-governance/SKILL.md`
- Homepage, navigation, footer, Join/Login, FanClub, member, admin, Store, route, or visual/layout changes: `.agents/skills/lgfc-design-compliance/SKILL.md`
- Documentation creation, documentation moves, authority hierarchy, Diataxis routing, or tracker updates: `.agents/skills/lgfc-docs-authority/SKILL.md`
- Next.js build, API, route handler, middleware, Cloudflare Pages, D1, static export, or deployment compatibility changes: `.agents/skills/lgfc-cloudflare-static-export/SKILL.md`
- Final PR handoff, closeout, verification evidence, or post-merge readiness: `.agents/skills/lgfc-verification-closeout/SKILL.md`

## Cross-agent operating references

Long-form cross-agent instructions live in:

- `docs/ops/ai/AGENT-GOVERNANCE.md`
- `docs/ops/ai/CROSS-AGENT-OPERATING-RULES.md`

## Enforcement

Agent governance files are checked by:

- `scripts/ci/agent_governance_check.mjs`
- `.github/workflows/agent-governance.yml`

Agents must not bypass these checks.
