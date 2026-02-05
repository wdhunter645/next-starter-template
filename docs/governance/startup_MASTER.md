# Governance — Startup Procedure

Status: _MASTER (Operations authoritative)
Last Updated: 2026-02-05

## Purpose
Define the Day-2 startup procedure for an operator beginning work on this repository.

## Startup checklist (Day-2)
1) Confirm source of truth
- The repository state is authoritative.
- Any uploaded ZIP is a working copy only if explicitly declared as source-of-truth for that session.

2) Read the authority layer (required)
- `/docs/governance/document-authority-hierarchy_MASTER.md`
- `/docs/governance/document-status-and-naming_MASTER.md`
- `/docs/LGFC-Production-Design-and-Standards.md`
- `/docs/NAVIGATION_INVARIANTS.md` or `/docs/NAVIGATION-INVARIANTS.md` (use the actual filename in repo)

3) Verify production health (minimum)
- Fetch the home page and `/health`.
- Confirm Cloudflare Pages is deploying from the expected branch.
- Confirm GitHub Actions checks are green.

4) Load current operational work
- `active_tasklist.md` (canonical tasklist file).
- `/docs/ops/deploy-log.md` for recent deployments.

5) Choose a mode and record it
- Control → Execute → Verify, explicitly.

## Session rules
- No assumptions. If data is missing, first establish it from repo docs or direct verification commands.
- No drifting scope. Every change must have a bounded file list and one intent label.

## Tooling notes
- PR prompts must follow `/docs/website-process.md`.
- Use line-range anchors only when the referenced file exists in repo and line numbers are stable.
