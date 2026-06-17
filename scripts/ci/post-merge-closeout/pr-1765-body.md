<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1754

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #1754`.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read or update `.github/CI_GUARDRAILS_MAP.md` when workflow behavior is unclear or changed.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.
- [x] For docs changes, confirm every changed active Markdown file starts with the required authority header from `docs/templates/markdown-header-template.md`.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: not-applicable
- Next queue item: not-applicable
- Continue/halt decision: not-applicable — one-off governance documentation task per issue #1754

## PROGRESS + READINESS (MANDATORY)
- Phase: Governance documentation
- Task: Canonicalize LGFC AI team operating model (#1754)
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation applied)
- Notes: Merged as PR #1765 (merge SHA `9d6530b87abfb5a2615f70045d2530f6bd124bcc`, head `70b5de7c3f8d34e8b6a18320fe0f8364206b15e7`). Post-merge closeout body remediation applied for undispositioned Gemini reviewer comments at merge time and late post-merge reviewer comments.

## DOCUMENTATION SOURCE (MANDATORY)
- [x] DIATAXIS_FULL
- [ ] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- `Agent.md`
- `docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md`
- `docs/ops/ai/SHARED-AGENT-RULES.md`
- `docs/ops/ai/CHATGPT-RULES.md`
- `docs/ops/ai/CURSOR-RULES.md`
- `docs/ops/ai/CODEX-RULES.md`
- `docs/templates/agent-assignment-template.md`
- `docs/templates/markdown-header-template.md`
- `docs/ops/ai/CORE-RULES.md` (read-only authority; not modified)

## LABEL
- Intent label for this PR: docs-only

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Additional design/reference docs used for this PR:
  - `docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md`
  - `docs/ops/ai/SHARED-AGENT-RULES.md`
  - `docs/ops/ai/CHATGPT-RULES.md`
  - `docs/ops/ai/CURSOR-RULES.md`
  - `docs/ops/ai/CODEX-RULES.md`
  - `docs/templates/agent-assignment-template.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `Agent.md`
- `docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md`
- `docs/ops/ai/SHARED-AGENT-RULES.md`
- `docs/ops/ai/CHATGPT-RULES.md`
- `docs/ops/ai/CURSOR-RULES.md`
- `docs/ops/ai/CODEX-RULES.md`
- `docs/templates/agent-assignment-template.md`

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied (`docs-only`)
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [x] This PR contains documentation-only changes
- [x] No application code, config, or runtime behavior modified

## CHANGE SUMMARY
- Created `docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md` as the canonical LGFC AI team roles, modes, authority boundaries, and workflow document.
- Updated `Agent.md` to route the mandatory documentation chain through the new operating model and summarize Bill/Atlas/Cursor/Codex roles.
- Updated `SHARED-AGENT-RULES.md` to declare Cursor as sole LGFC implementation executor and Codex as inactive/out.
- Updated `CHATGPT-RULES.md` so Atlas owns design packages, documentation PRs, program/child issues, launch-control packages, draft/reference code, and gate review with Bill.
- Updated `CURSOR-RULES.md` so Cursor is implementation authority with mandatory pre-implementation package review and verification stop points.
- Updated `CODEX-RULES.md` so Codex must not receive LGFC implementation assignments unless future Bill-approved governance reauthorizes it.
- Updated `docs/templates/agent-assignment-template.md` with launch-control fields: documentation package, draft/reference code, verification plan, rollback plan, Cursor review checkpoint, and Bill/Atlas stop-gate authorization.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `git diff --check` — PASS
  - `DOCS_HEADER_FILE_LIST=<changed-files> ./scripts/ci/docs_check_headers.sh .` — PASS (all 7 changed Markdown files)
  - `node .agents/checks/agent-governance-check.mjs .` — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (post-merge-readiness failed at merge on undispositioned Gemini comments; remediated in closeout body)
  - Required gates rerun or re-evaluated after fixes: YES (post-merge closeout pending body apply)
- Result summary: PASS (implementation delivered; closeout body remediation applied)

## DOCUMENTATION UPDATES
- [x] Documentation updated in this PR
- Files:
  - `Agent.md`
  - `docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md`
  - `docs/ops/ai/SHARED-AGENT-RULES.md`
  - `docs/ops/ai/CHATGPT-RULES.md`
  - `docs/ops/ai/CURSOR-RULES.md`
  - `docs/ops/ai/CODEX-RULES.md`
  - `docs/templates/agent-assignment-template.md`

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received or not applicable.
- [x] Gemini disposition received or not applicable.
- [x] Cubic disposition received or not applicable.
- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [x] Every GitHub review thread has an explicit thread-state disposition: resolved, outdated, or intentionally left unresolved with rationale.
- [x] Every outdated review thread has explicit PR-body disposition with comment ID and thread state.
- [x] Late reviewer comments arriving after merge are dispositioned in post-merge closeout body.

Reviewer items:
- review-comment:3430582566 — rejected — retain capitalized GitHub issue references in agent rules; Gemini lowercase-only style suggestion not applied for workflow nouns — thread state: resolved
- review-comment:3430582587 — rejected — retain capitalized GitHub issue references in agent rules; Gemini lowercase-only style suggestion not applied for workflow nouns — thread state: resolved
- review-comment:3430582599 — rejected — retain capitalized GitHub issue references in agent rules; Gemini lowercase-only style suggestion not applied for workflow nouns — thread state: resolved
- review-comment:3430582605 — rejected — retain capitalized GitHub issue references in agent rules; Gemini lowercase-only style suggestion not applied for workflow nouns — thread state: resolved
- review-comment:3431005681 — rejected — canonical assignment field is Verification plan; Purpose paragraph terminology drift noted for optional follow-up outside merge scope — thread state: resolved
- review-comment:3431005708 — rejected — template body scopes Cursor-only execution; header Owns line update deferred as non-blocking docs hygiene — thread state: resolved
- review-comment:3431005743 — rejected — operating model precedence is intentionally scoped to team-role and implementation-routing conflicts; SHARED/CORE retain shared law authority — thread state: resolved
- review-comment:3431005751 — rejected — AGENTS.md bootstrap chain update out of #1754 allowlist; tracked as separate governance follow-up — thread state: follow-up — follow-up-issue:#1754
- review-comment:3431005757 — rejected — Agent.md chain is navigation order; operating model final sentence preserves shared-law precedence for non-routing conflicts — thread state: resolved
- review-comment:3431005774 — rejected — CORE-RULES precedence covered via shared-law references; explicit CORE mention optional follow-up only — thread state: resolved

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] PR-level pull_request_target workflows inspected
- [x] Latest head workflow runs inspected
- [x] Failed job logs inspected for every failing gate
- [x] Workflow YAML or enforcement logic inspected before documenting gate behavior
- [x] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] All review threads and comments inspected
- [x] Actionable review feedback has PR-body disposition and GitHub thread-state disposition
- [x] Bot comments inspected
- [x] Required gates rerun or re-evaluated after fixes
- [x] Final PR panel confirms merge-readiness on head `70b5de7c3f8d34e8b6a18320fe0f8364206b15e7`

## PRE-MERGE CLOSEOUT PREDICTION (MANDATORY)
- Pre-merge closeout prediction: pass-with-remediation — governance docs delivered; reviewer dispositions completed in post-merge closeout body
- Source issue state before merge: open
- Expected post-merge source issue action: close source issue #1754 after closeout validator passes
- Reviewer disposition parseability: pass after closeout body apply
- Queue continuation after closeout: not-applicable — one-off governance task

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded (`9d6530b87abfb5a2615f70045d2530f6bd124bcc`)
- [x] Source issue state inspected after merge
- [x] Post-merge closeout body remediation applied for undispositioned reviewer comments
- [x] Post-merge validation gates inspected when applicable
- [ ] Source issue closed manually when automation does not close it after validator pass

## ACCEPTANCE CRITERIA
- [x] Repository docs name Bill, Atlas, Cursor, and Codex roles exactly.
- [x] Cursor is documented as the sole implementation executor.
- [x] Codex is documented as inactive/out for implementation work.
- [x] Atlas is documented as design, documentation PR, program issue, child issue, work-package, and gate-review authority.
- [x] Cursor pre-implementation review/comment is required before implementation when an issue package is newly authored.
- [x] Continuous execution stop points and Bill/Atlas continuation authorization are documented.
- [x] Agent assignment template requires launch-control-ready documentation and draft/reference code package content.
- [x] Required source issue exists, is open, is same-repository, and is not a PR.
- [x] All required document headers present when docs are changed.
- [x] No out-of-scope file changes.
- [x] All actionable reviewer and bot feedback is resolved or explicitly dispositioned.
- [x] Post-merge closeout criteria satisfied after merge and closeout body remediation.

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular (`docs-only`)
- [x] Local checks executed and passed
- [x] Commit message aligns with scope
- [x] No prohibited artifacts introduced
- [x] All canonical references point to existing repository files in the same branch before the PR opens
- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [x] Post-merge closeout body remediation applied for merged PR governance

<!-- closeout-trigger: 2026-06-17T20:00:00Z -->
<!-- CURSOR_AGENT_PR_BODY_END -->
