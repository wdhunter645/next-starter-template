<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1614

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #1614`.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read or update `.github/CI_GUARDRAILS_MAP.md` when workflow behavior is unclear or changed. (N/A — no workflow changes.)
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.
- [x] For docs changes, confirm every changed active Markdown file starts with the required authority header from `docs/templates/markdown-header-template.md`.
- [x] For `docs/how-to/**`, confirm every changed file includes `## Steps`, `## Procedure`, or `## Execution`. (`agent-session-bootstrap.md` retains `## Procedure` and `## Execution`.)
- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: not-applicable — one-off bootstrap hardening task
- Next queue item: not-applicable
- Continue/halt decision: not-applicable — standalone ops(cursor) hardening

## PROGRESS + READINESS (MANDATORY)
- Phase: Cloud Agent bootstrap hardening
- Task: #1614
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none
- Notes: Merged on `main` as PR #1615 at `a29bf59`. Post-merge closeout body remediation applied.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- `AGENTS.md`
- `docs/how-to/cursor/agent-session-bootstrap.md`
- `Agent.md`
- `docs/ops/ai/SHARED-AGENT-RULES.md`
- `docs/ops/ai/CORE-RULES.md`
- `docs/ops/ai/CURSOR-RULES.md`

## LABEL
- Intent label for this PR: infra

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Additional design/reference docs used for this PR:
  - `docs/how-to/cursor/agent-session-bootstrap.md`
  - `Agent.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `AGENTS.md`
- `.agents/checks/agent-governance-check.mjs`
- `tests/agent-governance-bootstrap.test.mjs`
- `docs/how-to/cursor/agent-session-bootstrap.md`

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied (`infra`)
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [ ] This PR contains documentation-only changes
- [x] No application code, config, or runtime behavior modified

## CHANGE SUMMARY
- Harden `AGENTS.md` so Cloud Agent bootstrap is incomplete until the canonical doc chain is read, not merely listed.
- Declare bootstrap reports that say "required but not yet read" noncompliant.
- Define the required first bootstrap report contract (`AGENTS.md: read`, canonical chain files, and PR-work extras).
- Extend `agent-governance-check.mjs` and bootstrap tests to enforce the new `AGENTS.md` contract.
- Update Cloud Agent verification steps in `docs/how-to/cursor/agent-session-bootstrap.md`.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `node .agents/checks/agent-governance-check.mjs .` — PASS
  - `npm test -- tests/agent-governance-bootstrap.test.mjs` — PASS (9 tests)
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: N/A
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary: PASS

### Cloud Agent bootstrap verification
- Agent Governance workflow passed on PR #1615 (run 27466998082).
- Cloud Agent bootstrap report verified on `main` after merge; canonical chain files reported as **read**.

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded (`a29bf59beeb2284aa81f2cf05fea7f0ba96d1994`)
- [x] Source issue state inspected after merge
- [x] Post-merge validation gates inspected when applicable
- [x] Post-merge closeout body remediation applied for merged PR governance

## ACCEPTANCE CRITERIA
- [x] `AGENTS.md` requires reading the canonical chain before first repo-work response
- [x] `AGENTS.md` declares "required but not yet read" bootstrap reports noncompliant
- [x] First bootstrap report contract defined for canonical chain files
- [x] PR-work bootstrap report contract includes PR governance skill, PR template, and `open-task-pr.md`
- [x] `node .agents/checks/agent-governance-check.mjs .` passes locally
- [x] `npm test -- tests/agent-governance-bootstrap.test.mjs` passes locally
- [x] CI Agent Governance workflow passes on PR head (run 27466998082)
- [x] New Cloud Agent session bootstrap report verified on branch (`main` after merge)

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] Source issue #1614 is the sole authority
- [x] Allowlist matches diff exactly
- [x] No runtime or workflow changes
- [x] Verification commands recorded
- [x] Post-merge closeout body remediation applied for merged PR governance
<!-- CURSOR_AGENT_PR_BODY_END -->
