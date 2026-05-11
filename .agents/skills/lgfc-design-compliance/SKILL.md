# LGFC Design Compliance Skill

Use this skill for homepage, navigation, footer, Join/Login, FanClub, member, admin, Store, route, visual, or layout changes.

## Canonical source

Use the active DIATAXIS transition design authority for the affected page, route, or feature.

Do not rely on memory, old screenshots, old PRs, old thread notes, or superseded assumptions when active documentation conflicts.

## Procedure

1. Read the active design authority before editing.
2. Identify the exact invariant affected by the task.
3. Confirm the source Issue explicitly authorizes the affected UX or route change.
4. Preserve locked public header behavior, footer behavior, Join/Login behavior, FanClub gating, Admin gating, and Store behavior unless explicitly in scope.
5. Preserve Cloudflare Pages static export compatibility.
6. Avoid visual drift. Do not make opportunistic styling changes.
7. Add or update tests only when they directly verify the scoped design change.
8. Document verification evidence in the PR.

## Stop conditions

Stop and request correction when:

- The requested change conflicts with active design authority.
- The task depends on undocumented design assumptions.
- The diff would alter routes, gating, nav, footer, or layout outside the source Issue.
- The change requires runtime architecture beyond the approved hosting model.
