<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1268

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: pass — OPS #1923 batch-generated closeout remediation
- Next queue item: continue backlog burn-down after closeout replay
- Continue/halt decision: continue after post-merge verification

## PROGRESS + READINESS (MANDATORY)
- Phase: Post-merge closeout remediation
- Task: OPS #1923 batch body generation for merged PR #1269
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation generated)
- Notes: Merged as PR #1269 at `05cd0f639b6d46837bd28c04f792082a52465232`. Post-merge closeout body remediation for OPS #1923 backlog burn-down.

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `Agent.md`
- `PROMPTS/Codex-Rules.md`
- `docs/governance/DOCUMENT-ARCHITECTURE.md`
- `docs/ops/ai/SHARED-AGENT-RULES.md`
- `docs/ops/ai/CODEX-RULES.md`
- `docs/ops/ai/CHATGPT-RULES.md`
- `docs/ops/ai/CURSOR-RULES.md`
- `docs/ops/ai/CORE-RULES.md`
- `docs/ops/ai/COPILOT-RULES.md`
- `docs/ops/ai/DEVIN-RULES.md`
- `docs/ops/ai/pr-lifecycle-standard.md`
- `governance/ai/AGENT-GOVERNANCE.md`
- `ops/ai/CROSS-AGENT-OPERATING-RULES.md`

All other files are out of scope

## CHANGE SUMMARY
- Add `docs/ops/ai/SHARED-AGENT-RULES.md` as the categorized shared agent law index (10 sections + tool routing table).
- Refocus `CHATGPT-RULES.md` on Atlas control-plane behavior; cross-link shared law instead of duplicating it.
- Add `docs/ops/ai/CODEX-RULES.md`; strengthen Cursor git/push/merge boundaries in `CURSOR-RULES.md`.
- Update `Agent.md`, `CORE-RULES.md`, cross-agent governance docs, and `DOCUMENT-ARCHITECTURE.md` for consistent read order and cross-links.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `node scripts/ci/generate_post_merge_closeout_bodies.mjs --prs 1269 --validate` — PASS (generator self-validation)
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #1269)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES
  - Required gates rerun or re-evaluated after fixes: YES (remediated body artifact)
- Result summary: PASS

## ACCEPTANCE CRITERIA
- [x] Required source issue exists, is same-repository, and closed-source follow-up closeout evidence is recorded.
- [x] PR issue-accounting gate passes.
- [x] Drift gate passes.
- [x] Intent gate passes.
- [x] ZIP safety gate passes.
- [x] Quality checks pass.
- [x] Repository-specific governance gates pass.
- [x] All actionable reviewer and bot feedback is resolved or explicitly dispositioned.
- [x] PR is ready for human review.
- [x] Post-merge closeout remediation body generated for merged PR #1269

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments, bot comments, and review threads.
- review-comment:3356502159 — accepted — post-merge closeout remediation for prior PR #1269 — thread state: outdated
- review-comment:3356502189 — accepted — post-merge closeout remediation for prior PR #1269 — thread state: outdated
- review-comment:3356502202 — accepted — post-merge closeout remediation for prior PR #1269 — thread state: outdated
- review-comment:3356502215 — accepted — post-merge closeout remediation for prior PR #1269 — thread state: outdated
- review-comment:3356502240 — accepted — post-merge closeout remediation for prior PR #1269 — thread state: outdated
- review-comment:3356502248 — accepted — post-merge closeout remediation for prior PR #1269 — thread state: outdated

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] PR-level pull_request_target workflows inspected
- [x] Latest head workflow runs inspected
- [x] Failed job logs inspected for every failing gate
- [x] All review threads and comments inspected
- [x] Required gates rerun or re-evaluated after fixes

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded: `05cd0f639b6d46837bd28c04f792082a52465232`
- [x] Source issue #1268 state inspected after merge
- [x] Post-merge closeout reconciliation for prior PR #1269 delegated to closeout workflow
- [x] Remediation follow-up for closed source issue #1268 recorded in this post-merge closeout body

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] Local checks executed and passed
- [x] All reviewer feedback has explicit disposition where required
<!-- CURSOR_AGENT_PR_BODY_END -->
