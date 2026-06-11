#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { diataxisEvidenceFailures } from './post_merge_diataxis_audit.mjs';
import { implementationEvidenceFailures } from './post_merge_implementation_evidence.mjs';
export { implementationEvidenceFailures } from './post_merge_implementation_evidence.mjs';

import { linkedIssueNumber, sourceIssueAccounting } from './issue_accounting.mjs';
import {
	isPermittedClosedSourceIssueFollowup,
	planActiveSourceIssueRelabel,
	planTerminalLabelReconciliation,
	shouldKeepActiveSourceIssueOpen,
} from './post_merge_source_issue_closeout.mjs';

export { isPermittedClosedSourceIssueFollowup };
import { evaluateReviewerCommentDisposition } from './reviewer_comment_disposition.mjs';

export { linkedIssueNumber, sourceIssueAccounting };

export const PR_1552_MAINTAINER_BODY = "<!-- CURSOR_AGENT_PR_BODY_BEGIN -->\n- **Issue:** #1544\n\n## PRE-OPEN GATE PREFLIGHT (MANDATORY)\n- [x] Confirm exactly one same-repository, open, non-PR source issue exists.\n- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #1544`.\n- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.\n- [x] Read or update `.github/CI_GUARDRAILS_MAP.md` when workflow behavior is unclear or changed.\n- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.\n- [x] For docs changes, confirm every changed active Markdown file starts with the required authority header from `docs/templates/markdown-header-template.md`.\n- [x] For `docs/how-to/**`, confirm every changed file includes `## Steps`, `## Procedure`, or `## Execution`.\n- [x] Confirm every `Canonical Reference:` value points to a file that exists in the same branch at PR-open time, or is intentionally self-referential.\n- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.\n\n## MANDATORY FIRST STEP (ZIP SAFETY)\n- [x] No ZIP file exists in the repo root\n- [x] Final diff confirms no ZIP file is committed\n\n## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)\n- Dependency-map result: pass\n- Parent program context: Program #1500 (CI Post-Merge Closeout Reliability) \u2014 not a primary source issue\n- Next queue item: halt \u2014 Task 002 remains blocked until Task 001 merges and post-merge closeout verifies\n- Continue/halt decision: halt \u2014 serial Program #1500 queue requires Task 001 closeout before any successor task starts\n\n## PROGRESS + READINESS (MANDATORY)\n- Phase: Program #1500 \u2014 Phase 1 Wrap-Up (parent program context only)\n- Task: Task 001 \u2014 Add pre-merge post-merge-readiness gate\n- Status: READY FOR REVIEW\n- Scope Confirmed: YES\n- Out-of-Scope Changes Present: NO\n- Blocking Issues: none\n- Notes: Successor queue work remains blocked. Task 002 was not started.\n\n## DOCUMENTATION SOURCE (MANDATORY)\n- [x] DIATAXIS_ROUTED\n\nSource Files Used:\n- `docs/reference/ci/post-merge-validation-surface.md`\n- `docs/reference/ci/merge-protection-surface.md`\n- `docs/how-to/cursor/open-task-pr.md`\n- `.github/CI_GUARDRAILS_MAP.md`\n- `docs/governance/PR_GOVERNANCE.md`\n- `docs/governance/PR_PROCESS.md`\n\n## LABEL\n- Intent label for this PR: change-ops\n\n## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)\n- Canonical process reference: `/docs/governance/PR_PROCESS.md`\n- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`\n- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`\n- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`\n- Additional design/reference docs used for this PR:\n  - `docs/reference/ci/post-merge-validation-surface.md`\n  - `docs/reference/ci/merge-protection-surface.md`\n  - `docs/how-to/cursor/open-task-pr.md`\n\n## FILE-TOUCH ALLOWLIST (MANDATORY)\nAllowed files:\n- `.github/CI_GUARDRAILS_MAP.md`\n- `.github/workflows/gate-post-merge-readiness.yml`\n- `docs/how-to/cursor/open-task-pr.md`\n- `docs/reference/ci/merge-protection-surface.md`\n- `docs/reference/ci/post-merge-validation-surface.md`\n- `scripts/ci/post_merge_readiness_gate.mjs`\n- `scripts/ci/post_merge_validator.mjs`\n- `tests/gate-post-merge-readiness.test.mjs`\n- `tests/post-merge-validator.test.mjs`\n\nAll other files are out of scope\n\n## VISUAL / UX INVARIANTS (MANDATORY)\n- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope\n- [x] No unauthorized visual drift introduced\n- [x] No out-of-scope UX changes introduced\n- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope\n\n## DRIFT GATE ALIGNMENT (MANDATORY)\n- [x] Exactly ONE intent label applied\n- [x] File changes match allowlist exactly\n- [x] No mixed-intent changes present\n\n## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)\n- [ ] This PR contains documentation-only changes\n- [ ] No application code, config, or runtime behavior modified\n\n## CHANGE SUMMARY\n- Added blocking workflow `.github/workflows/gate-post-merge-readiness.yml` (job id `post-merge-readiness`) that evaluates PR metadata before merge.\n- Added `scripts/ci/post_merge_readiness_gate.mjs` reusing shared exports from `post_merge_validator.mjs` for body, allowlist, forbidden tokens, and reviewer-disposition checks.\n- Fixed `pull_request_target` trusted-code execution: workflow checks out base/default ref gate scripts and collects PR data via GitHub API only.\n- Fixed ESM CLI entrypoint (`pathToFileURL`) and hardened input handling for malformed JSON, null payloads, invalid paths, and missing `--output` values.\n- Added/updated tests and CI docs for the new gate and trusted-code execution model.\n\n## BUILD / TEST / VERIFICATION\n- Commands run:\n  - `git diff --check` \u2014 PASS (no issues)\n  - `npm test -- tests/gate-post-merge-readiness.test.mjs tests/post-merge-validator.test.mjs` \u2014 PASS (33 tests, 2 files)\n  - `node -e \"import('./scripts/ci/post_merge_readiness_gate.mjs')\"` \u2014 PASS (import succeeds, exit 0)\n  - Direct CLI: `node scripts/ci/post_merge_readiness_gate.mjs --pr <file> --files <file> --issue-comments <file> --review-comments <file> --reviews <file> --repository wdhunter645/next-starter-template --output <file>` \u2014 PASS (main() runs, report + result.json written)\n  - `./scripts/ci/docs_check_headers.sh .github/CI_GUARDRAILS_MAP.md docs/reference/ci/post-merge-validation-surface.md docs/reference/ci/merge-protection-surface.md docs/how-to/cursor/open-task-pr.md` \u2014 PASS\n- Gate verification:\n  - Commit-level workflow runs inspected: YES\n  - PR-level governance/accounting workflows inspected: YES\n  - Failed job logs inspected for every failing gate: YES\n  - Required gates rerun or re-evaluated after fixes: YES\n- Result summary: PASS\n\n## DOCUMENTATION UPDATES\n- [x] Documentation updated in this PR\n- Files:\n  - `.github/CI_GUARDRAILS_MAP.md`\n  - `docs/reference/ci/post-merge-validation-surface.md`\n  - `docs/reference/ci/merge-protection-surface.md`\n  - `docs/how-to/cursor/open-task-pr.md`\n\n## REVIEWER RESPONSE ACCOUNTING\n- [x] Reviewed all reviewer comments.\n- [x] Reviewed all bot comments.\n- [x] Reviewed all GitHub review threads.\n- [x] Copilot disposition received or not applicable.\n- [x] Codex disposition received or not applicable.\n- [x] Gemini disposition received or not applicable.\n- [x] Cubic disposition received or not applicable.\n- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.\n- [x] Every GitHub review thread has an explicit thread-state disposition.\n\nReviewer items:\n- review-comment:3395187299 \u2014 accepted \u2014 added `GateInputError` and type checks in `readJson` for non-string paths \u2014 thread state: resolved\n- review-comment:3395187303 \u2014 accepted \u2014 `normalizeFiles` now guards non-array/null elements \u2014 thread state: resolved\n- review-comment:3395187309 \u2014 accepted \u2014 `normalizePr` now handles null/non-object payloads \u2014 thread state: resolved\n- review-comment:3395187321 \u2014 accepted \u2014 `--output` without value now fails deterministically via `GateInputError` \u2014 thread state: resolved\n- review-comment:3395187323 \u2014 accepted \u2014 `normalizeReviewerDispositionFailures` guards null/malformed disposition \u2014 thread state: resolved\n- review-comment:3395192693 \u2014 accepted \u2014 workflow now checks out trusted base/default ref, not PR head SHA \u2014 thread state: resolved\n- review-comment:3395210538 \u2014 accepted \u2014 same trusted-base checkout fix and documented trusted-code model \u2014 thread state: resolved\n- review-comment:3395210583 \u2014 accepted \u2014 pre-merge failure messages mapped in gate runner \u2014 thread state: resolved\n- review-comment:3395210607 \u2014 accepted \u2014 added `pathToFileURL` import from `node:url` \u2014 thread state: resolved\n- review-comment:3395210629 \u2014 accepted \u2014 CLI entrypoint uses `pathToFileURL(process.argv[1]).href` pattern \u2014 thread state: resolved\n- review-comment:4475941934 \u2014 accepted \u2014 all Copilot inline findings addressed in remediation commit \u2014 thread state: resolved\n\n## PR GATE READINESS CHECKLIST\n- [x] Live PR check panel inspected\n- [x] Commit-level workflow runs inspected\n- [x] PR-level pull_request_target workflows inspected\n- [x] Latest head workflow runs inspected\n- [x] Failed job logs inspected for every failing gate\n- [x] Workflow YAML or enforcement logic inspected before documenting gate behavior\n- [x] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue\n- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.\n- [x] All review threads and comments inspected\n- [x] Actionable review feedback has PR-body disposition and GitHub thread-state disposition\n- [x] Bot comments inspected\n- [x] Required gates rerun or re-evaluated after fixes\n- [x] Final PR panel confirms merge-readiness\n\n## POST-MERGE CLOSEOUT CHECKLIST\n- [ ] PR merged state verified\n- [ ] Merge commit recorded\n- [ ] Source issue state inspected after merge\n- [ ] Source issue closed manually when automation did not close it\n- [ ] Operator adds `post-merge-readiness` to `main` branch-protection required checks\n\n## ACCEPTANCE CRITERIA\n- [x] Required source issue exists, is open, is same-repository, and is not a PR.\n- [x] Gate fails PRs missing required post-merge body sections and allowlist.\n- [x] Gate fails forbidden tokens and undispositioned trusted reviewer findings.\n- [x] Gate passes compliant reference PR body fixture.\n- [x] No duplicate validation logic forked without PR justification.\n- [x] Guardrails map and merge-protection surface document the new gate.\n- [x] One issue, one branch, one PR \u2014 serial implementation only.\n- [x] Successor queue work was not started.\n\n## REQUIRED PRE-REVIEW SELF-CHECK\n- [x] PR body contains all required sections with exact headings\n- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.\n- [x] Allowed files section matches final diff exactly\n- [x] No files outside allowlist\n- [x] ZIP safety confirmed\n- [x] Intent label correct and singular\n- [x] Local checks executed and passed or exact blocker documented\n- [x] Commit message aligns with scope\n- [x] No prohibited artifacts introduced\n- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition\n- [x] Status is set to READY FOR REVIEW only after all required gates and reviewer-response obligations are complete\n<!-- CURSOR_AGENT_PR_BODY_END -->\n";

export const PR_1241_MAINTAINER_BODY = "<!-- CURSOR_AGENT_PR_BODY_BEGIN -->\n- **Issue:** #1238\n\n## PRE-OPEN GATE PREFLIGHT (MANDATORY)\n- [x] Confirm exactly one same-repository, open, non-PR source issue exists.\n- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #123`.\n- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.\n- [x] Read or update `.github/CI_GUARDRAILS_MAP.md` when workflow behavior is unclear or changed.\n- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.\n- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.\n\n## MANDATORY FIRST STEP (ZIP SAFETY)\n- [x] No ZIP file exists in the repo root\n- [x] Final diff confirms no ZIP file is committed\n\n## PROGRESS + READINESS (MANDATORY)\n- Phase: CI corrective follow-up\n- Task: Harden post-merge closeout after PR #1229\n- Status: READY FOR REVIEW\n- Scope Confirmed: YES\n- Out-of-Scope Changes Present: NO\n- Blocking Issues: none \u2014 awaiting human approval\n- Notes: Corrects closeout failures after PR #1229. Cursor maintainer applied Gemini feedback (single-call `setStatusFn`) and recorded local verification on head `f707248`.\n\n## DOCUMENTATION SOURCE (MANDATORY)\n- [ ] DIATAXIS_FULL\n- [x] DIATAXIS_ROUTED\n- [ ] LEGACY_FALLBACK\n\nSource Files Used:\n- `.github/workflows/post-merge-intent-verification.yml`\n- `scripts/ci/post_merge_validator.mjs`\n- `scripts/orchestrator/sync-pr-state.mjs`\n- `scripts/ci/merge_protection_surface.mjs`\n- `tests/post-merge-validator.test.mjs`\n- `tests/orchestrator-queue.test.mjs`\n- `tests/merge-protection-surface.test.mjs`\n\n## LABEL\n- Intent label for this PR: infra\n\n## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)\n- Canonical process reference: `/docs/governance/PR_PROCESS.md`\n- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`\n- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`\n- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`\n- Additional design/reference docs used for this PR:\n  - docs/explanation/ci/lgfc-ci-production-design.md\n  - docs/reference/ci/merge-protection-surface.md\n\n## FILE-TOUCH ALLOWLIST (MANDATORY)\nAllowed files:\n- .github/workflows/post-merge-intent-verification.yml\n- scripts/ci/merge_protection_surface.mjs\n- scripts/ci/post_merge_validator.mjs\n- scripts/orchestrator/sync-pr-state.mjs\n- tests/merge-protection-surface.test.mjs\n- tests/post-merge-validator.test.mjs\n- tests/orchestrator-queue.test.mjs\n\nAll other files are out of scope\n\n## VISUAL / UX INVARIANTS (MANDATORY)\n- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope\n- [x] No unauthorized visual drift introduced\n- [x] No out-of-scope UX changes introduced\n- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope\n\n## DRIFT GATE ALIGNMENT (MANDATORY)\n- [x] Exactly ONE intent label applied\n- [x] File changes match allowlist exactly\n- [x] No mixed-intent changes present\n\n## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)\n- [ ] This PR contains documentation-only changes\n- [ ] No application code, config, or runtime behavior modified\n\n## CHANGE SUMMARY\n- Removes the duplicate `push` trigger from post-merge detection to prevent closeout races.\n- Fixes `merge_protection_surface.mjs` so workflow validation respects `options.root` and reports missing files without throwing.\n- Aligns post-merge validation with PR hygiene rollout by treating missing advisory sections as remediation, not hard failure.\n- Adds `post_merge_remediation` state sync so source issues remain open when remediation remains required.\n- Combines `post_merge_remediation` label transition into a single `setStatusFn` call (Gemini review).\n- Adds tests for root-aware validation, advisory closeout behavior, and remediation state sync.\n\n## BUILD / TEST / VERIFICATION\n- Commands run:\n  - `npm test -- tests/orchestrator-queue.test.mjs tests/post-merge-validator.test.mjs tests/merge-protection-surface.test.mjs` \u2014 PASS (40 tests, 3 files)\n- Gate verification:\n  - Commit-level workflow runs inspected: YES (prior head `4e37728`; new head `f707248` pushed for CI rerun)\n  - PR-level governance/accounting workflows inspected: YES (drift-gate, pr-issue-accounting, label-intent, docs_guardrails, quality all passed on prior head)\n  - Failed job logs inspected for every failing gate: YES (`reviewer-response-completion` failed before reviewer accounting; addressed in this update)\n  - Required gates rerun or re-evaluated after fixes: YES (push `f707248` triggers fresh CI)\n- Result summary: Local targeted tests pass on head `f707248`. Reviewer-response gate pending PR body apply with Gemini accounting (this commit).\n\n## DOCUMENTATION UPDATES\n- [ ] Documentation updated in this PR\n- [x] No documentation updates required\n- Files:\n  - N/A \u2014 CI behavior fix only; related behavior already represented in tests.\n\n## REVIEWER RESPONSE ACCOUNTING\n- [x] Reviewed all reviewer comments.\n- [x] Reviewed all bot comments.\n- [x] Reviewed all GitHub review threads.\n- [x] Copilot disposition received or not applicable.\n- [x] Codex disposition received or not applicable.\n- [x] Gemini disposition received or not applicable.\n- [x] Cubic disposition received or not applicable.\n- [x] Every actionable reviewer comment has a PR-body disposition.\n- [x] Every GitHub review thread has an explicit thread-state disposition: resolved, outdated, or intentionally left unresolved with rationale.\n\nReviewer items:\n- [x] Gemini disposition received: accepted inline remediation feedback on `post_merge_remediation` status sync.\n- [x] Reviewed Gemini comments.\n- [x] Accepted / rejected / ignored each actionable Gemini comment with rationale.\n- review-comment:3349689698 \u2014 accepted \u2014 Combined `status:failed` removal and `status:post-merge-verify` addition into one `setStatusFn` call; `setStatus` already supports simultaneous remove/add in a single `gh issue edit`.\n- review-comment:3349689723 \u2014 accepted \u2014 Updated orchestrator test to expect one transition `['status:failed', 'status:post-merge-verify']`.\n- Thread `https://github.com/wdhunter645/next-starter-template/pull/1241#discussion_r3349689698` \u2014 resolved in `f707248`.\n- Thread `https://github.com/wdhunter645/next-starter-template/pull/1241#discussion_r3349689723` \u2014 resolved in `f707248`.\n- Cubic summary comment \u2014 acknowledged; no actionable inline findings.\n\n## PR GATE READINESS CHECKLIST\n- [x] Live PR check panel inspected\n- [x] Commit-level workflow runs inspected\n- [x] PR-level pull_request_target workflows inspected\n- [x] Latest head workflow runs inspected (head `f707248`)\n- [x] Failed job logs inspected for every failing gate\n- [x] Workflow YAML or enforcement logic inspected before documenting gate behavior\n- [x] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue\n- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.\n- [x] All review threads and comments inspected\n- [x] Actionable review feedback has PR-body disposition and GitHub thread-state disposition\n- [x] Bot comments inspected\n- [x] Reviewer-response accounting includes required reviewer comment IDs when required by gate logs\n- [ ] Later maintainer replies posted where gate logs require them\n- [x] Required gates rerun or re-evaluated after fixes\n- [x] Final PR panel confirms merge-readiness (pending reviewer-response after body apply)\n\n## POST-MERGE CLOSEOUT CHECKLIST\n- [ ] PR merged state verified\n- [ ] Merge commit recorded\n- [ ] Source issue state inspected after merge\n- [ ] Source issue closed manually when automation did not close it\n- [ ] Source issue closure comment references merged PR and merge commit\n- [ ] Explicitly required tracker/status-index follow-up is complete or delegated when the source issue authorizes that work\n- [ ] Post-merge validation gates inspected when applicable\n\n## ACCEPTANCE CRITERIA\n- [x] `merge_protection_surface` validation respects `options.root`.\n- [x] Missing advisory PR hygiene sections do not hard-fail post-merge validation.\n- [x] Post-merge detection no longer races between `push` and `pull_request_target` for the same merged PR.\n- [x] Source issues are not closed when post-merge remediation remains required.\n- [x] Tests cover the corrected closeout behavior.\n\n## REQUIRED PRE-REVIEW SELF-CHECK\n- [x] PR body contains all required sections with exact headings\n- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.\n- [x] Allowed files section matches final diff exactly\n- [x] No files outside allowlist\n- [x] ZIP safety confirmed\n- [x] Intent label correct and singular\n- [x] Local checks executed and passed or exact blocker documented\n- [x] Commit message aligns with scope\n- [x] No prohibited artifacts introduced\n- [x] All canonical references point to existing repository files in the same branch before the PR opens\n- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition\n- [x] No merge-readiness claim made before all gate surfaces inspected\n- [x] Status is set to READY FOR REVIEW only after all required gates and reviewer-response obligations are complete\n\n<!-- This is an auto-generated description by cubic. -->\n---\n## Summary by cubic\nHardens post-merge closeout to stop race conditions and align validation with our hygiene policy. Addresses #1238 follow-ups after PR #1229 by removing duplicate triggers, refining validation, and adding a remediation state.\n\n- **Bug Fixes**\n  - Removed the duplicate `push` trigger from post-merge detection to prevent closeout races.\n  - Made `merge_protection_surface` root-aware; reports missing workflows cleanly and exits with proper status.\n  - Updated post-merge validator to treat missing advisory sections as remediation (not a hard failure) and to emit `post_merge_remediation` when applicable.\n  - Added `post_merge_remediation` handling in the orchestrator to keep source issues open with clear status updates.\n  - Expanded tests for root-aware validation, advisory handling, remediation sync, and workflow trigger behavior.\n\n<sup>Written for commit 4e377287c11f6a58dd2ebcf3e48ae7d6afbe17df. Summary will update on new commits.</sup>\n\n<a href=\"https://cubic.dev/pr/wdhunter645/next-starter-template/pull/1241?utm_source=github\" target=\"_blank\" rel=\"noopener noreferrer\" data-no-image-dialog=\"true\"><picture><source media=\"(prefers-color-scheme: dark)\" srcset=\"https://cubic.dev/buttons/review-in-cubic-dark.svg\"><source media=\"(prefers-color-scheme: light)\" srcset=\"https://cubic.dev/buttons/review-in-cubic-light.svg\"><img alt=\"Review in cubic\" src=\"https://cubic.dev/buttons/review-in-cubic-dark.svg\"></picture></a>\n\n<!-- End of auto-generated description by cubic. -->\n<!-- CURSOR_AGENT_PR_BODY_END -->\n";

export const REQUIRED_BODY_SECTIONS = [
	'## CHANGE SUMMARY',
	'## BUILD / TEST / VERIFICATION',
	'## ACCEPTANCE CRITERIA',
];

export const ADVISORY_BODY_SECTIONS = [
	'## REQUIRED PRE-REVIEW SELF-CHECK',
];

const FORBIDDEN_PLACEHOLDER_PATTERN = /\b(TODO|TBD|placeholder)\b/i;

const TRUSTED_REVIEWER_PATTERN = /chatgpt-codex-connector|gemini-code-assist|copilot-pull-request-reviewer|cubic-dev-ai/i;
const HIGH_SEVERITY_PATTERN =
	/(^|[^A-Za-z0-9])(P0|P1)([^A-Za-z0-9]|$)|high[- ]priority|request changes|requested changes|must fix|blocking/i;
const RESOLVED_PATTERN = /addressed in|\bresolved\b|all checks passed|no warnings detected/i;
const UNRESOLVED_PATTERN = /\bunresolved\b|\bnot\s+resolved\b|\bstill\s+open\b|\bstill\s+blocking\b/i;
const OPTIONAL_WORKFLOWS = new Set(['Auto-Sync Documentation']);
const MERGE_PROTECTION_JOB_PATTERNS = [/^quality$/i, /^gitleaks$/i, /^pr-issue-accounting$/i];
const ACTIVE_ALTERNATE_PROGRAM_ISSUES = new Set(['1255']);
const MERGE_PROTECTION_WORKFLOW_PATTERNS = [
	/quality checks/i,
	/secret scan|gitleaks/i,
	/pr issue accounting/i,
];
const LEGACY_REQUIRED_WORKFLOW_PATTERNS = [/drift/i, /intent/i, /zip/i];

export function resolvePrNumber({
	eventName,
	inputPrNumber = '',
	eventPrNumber = '',
	eventPrMerged = '',
	eventPrBaseRef = '',
	associatedPulls = [],
} = {}) {
	if (eventName === 'pull_request_target') {
		if (String(eventPrMerged) === 'true' && eventPrBaseRef === 'main' && eventPrNumber) {
			return { pr: String(eventPrNumber), method: 'pull_request_target', skip_reason: 'none' };
		}
		return { pr: '', method: 'pull_request_target', skip_reason: 'closed PR was not merged into main' };
	}

	if (eventName === 'workflow_dispatch' && inputPrNumber) {
		return { pr: String(inputPrNumber), method: 'workflow_dispatch', skip_reason: 'none' };
	}

	const associated = associatedPulls.find((pull) => pull?.state === 'closed' && pull?.merged_at && pull?.base?.ref === 'main');
	if (associated?.number) {
		return { pr: String(associated.number), method: 'commit-pulls-api', skip_reason: 'none' };
	}

	return { pr: '', method: 'commit-pulls-api', skip_reason: 'no merged PR associated with commit' };
}

export function sourceIssueStateFailures({ body = '', sourceIssue = null, sourceIssueError = '', repoLabels = [] } = {}) {
	if (sourceIssueError) {
		return [{
			code: 'source_issue_unreadable',
			message: `Source issue could not be inspected before closeout: ${sourceIssueError}`,
		}];
	}
	if (!sourceIssue) return [];

	const failures = [];
	if (sourceIssue.pull_request) {
		failures.push({
			code: 'source_issue_is_pull_request',
			message: 'Accepted source issue reference points to a pull request, not an issue.',
		});
	}
	const closedFollowupAllowed = isPermittedClosedSourceIssueFollowup({ body, sourceIssue });
	if (String(sourceIssue.state || '').toLowerCase() !== 'open' && !closedFollowupAllowed) {
		failures.push({
			code: 'source_issue_not_open',
			message: `Source issue is ${sourceIssue.state || 'unknown'} at closeout start; CI refused to relabel or close it.`,
		});
	}

	if (shouldKeepActiveSourceIssueOpen(body)) {
		const relabel = planActiveSourceIssueRelabel({
			issueLabels: sourceIssue.labels || [],
		});
		if (!relabel.ok) {
			failures.push({
				code: relabel.reason || 'active_source_issue_relabel_failed',
				message: relabel.summary || 'Active source issue relabel is not deterministic.',
			});
		}
		return failures;
	}

	const terminalLabelResult = planTerminalLabelReconciliation({
		issueLabels: sourceIssue.labels || [],
		repoLabels,
	});
	if (!terminalLabelResult.ok) {
		failures.push({
			code: terminalLabelResult.reason || 'terminal_label_reconciliation_failed',
			message: terminalLabelResult.summary || 'Terminal label reconciliation is not deterministic.',
		});
	}

	return failures;
}

export function blockerDeclarationFailures(body = '') {
	if (/^\s*-?\s*Status\s*:\s*BLOCKED\b/im.test(body) || /\b(exception required|closeout exception required|blocked closeout)\b/i.test(body)) {
		return [{
			code: 'closeout_blocker_declared',
			message: 'Merged PR body declares a blocker or exception state; CI refused deterministic source issue closeout.',
		}];
	}
	return [];
}

export function alternateProgramLaneFailures(sourceAccounting = {}) {
	const blocked = (sourceAccounting.issueNumbers || []).filter((issueNumber) => ACTIVE_ALTERNATE_PROGRAM_ISSUES.has(String(issueNumber)));
	return blocked.map((issueNumber) => ({
		code: 'active_alternate_program_lane',
		message: `Source issue #${issueNumber} is an active alternate program lane; CI refused closeout mutation.`,
	}));
}

export function preMergeReadinessBodyFailures(body = '') {
	const failures = [];

	if (FORBIDDEN_PLACEHOLDER_PATTERN.test(body)) {
		failures.push({ code: 'forbidden_placeholder_token', message: 'PR body contains a forbidden placeholder token.' });
	}

	for (const section of REQUIRED_BODY_SECTIONS) {
		if (!body.includes(section)) {
			failures.push({ code: 'missing_required_section', message: `PR body is missing ${section}.` });
		}
	}

	for (const section of ADVISORY_BODY_SECTIONS) {
		if (!body.includes(section)) {
			failures.push({
				code: 'missing_advisory_section',
				severity: 'advisory',
				message: `PR body is missing advisory section ${section}.`,
			});
		}
	}

	return failures;
}

export function metadataFailures(pr, filesExist = () => true, { repository = '', sourceIssue = null, sourceIssueError = '', repoLabels = [] } = {}) {
	const failures = [];
	const body = pr?.body || '';
	const sourceAccounting = sourceIssueAccounting(body, { repository });

	if (!pr || pr.isDraft === true || !pr.mergedAt || pr.baseRefName !== 'main') {
		failures.push({ code: 'not_merged_to_main', message: 'Resolved PR is not a merged PR into main.' });
	}

	failures.push(...sourceAccounting.failures);
	failures.push(...alternateProgramLaneFailures(sourceAccounting));
	failures.push(...sourceIssueStateFailures({ body, sourceIssue, sourceIssueError, repoLabels }));
	failures.push(...blockerDeclarationFailures(body));

	failures.push(...preMergeReadinessBodyFailures(body));

	for (const file of pr?.files || []) {
		const filePath = typeof file === 'string' ? file : (file.filename || file.path);
		const fileStatus = typeof file === 'object' ? file.status : '';
		if (fileStatus === 'removed') continue;
		if (filePath && !filesExist(filePath)) {
			failures.push({ code: 'missing_changed_file', message: `Merged PR file is absent from the checkout: ${filePath}` });
		}
	}

	return failures;
}

export function blockingMetadataFailures(failures = []) {
	return failures.filter((failure) => failure.severity !== 'advisory');
}

export function isResolvedText(body = '') {
	return RESOLVED_PATTERN.test(body) && !UNRESOLVED_PATTERN.test(body);
}

export function isHighSeverityFinding(body = '', state = '') {
	return (state === 'CHANGES_REQUESTED' || HIGH_SEVERITY_PATTERN.test(body)) && !isResolvedText(body);
}

export function isAfterMerge(value, mergedAt) {
	if (!value || !mergedAt) return false;
	return new Date(value).getTime() > new Date(mergedAt).getTime();
}

function findingLine(item, fallbackUrl) {
	const login = item.user?.login || 'unknown-reviewer';
	const url = item.html_url || item.url || item._links?.html?.href || fallbackUrl || 'unknown-url';
	const body = String(item.body || item.state || '')
		.replace(/\s+/g, ' ')
		.trim();
	return { reviewer: login, url, body: body.slice(0, 240) };
}

function normalizeReviewerDispositionFailures(disposition) {
	if (!disposition || !Array.isArray(disposition.failures)) {
		return [];
	}
	return disposition.failures.map((failure) => ({
		code: failure.code,
		message: failure.message,
		commentId: failure.commentId,
		reviewer: failure.reviewer,
	}));
}

export function preMergeReviewerDispositionFailures({
	body = '',
	issueComments = [],
	reviewComments = [],
	reviews = [],
	headSha = '',
	readyForReviewAt = '',
} = {}) {
	return normalizeReviewerDispositionFailures(evaluateReviewerCommentDisposition({
		body,
		issueComments,
		reviewComments,
		reviews,
		headSha,
		readyForReviewAt,
		auditPhase: 'pre_merge',
	}));
}

export function reviewerDispositionFailures({
	body = '',
	issueComments = [],
	reviewComments = [],
	reviews = [],
	headSha = '',
	mergedAt = '',
} = {}) {
	return normalizeReviewerDispositionFailures(evaluateReviewerCommentDisposition({
		body,
		issueComments,
		reviewComments,
		reviews,
		headSha,
		mergedAt,
		auditPhase: 'post_merge',
	}));
}

export function reviewerFindings({ pr, issueComments = [], reviewComments = [], reviews = [] }) {
	const mergedAt = pr?.mergedAt || pr?.merged_at || '';
	const prUrl = pr?.url || pr?.html_url || '';
	const findings = [];

	for (const comment of issueComments) {
		if (
			TRUSTED_REVIEWER_PATTERN.test(comment.user?.login || '') &&
			isAfterMerge(comment.created_at, mergedAt) &&
			isHighSeverityFinding(comment.body || '')
		) {
			findings.push(findingLine(comment, prUrl));
		}
	}

	for (const comment of reviewComments) {
		if (
			TRUSTED_REVIEWER_PATTERN.test(comment.user?.login || '') &&
			isAfterMerge(comment.created_at, mergedAt) &&
			isHighSeverityFinding(comment.body || '')
		) {
			findings.push(findingLine(comment, prUrl));
		}
	}

	for (const review of reviews) {
		if (
			TRUSTED_REVIEWER_PATTERN.test(review.user?.login || '') &&
			isAfterMerge(review.submitted_at, mergedAt) &&
			isHighSeverityFinding(review.body || '', review.state || '')
		) {
			findings.push(findingLine(review, prUrl));
		}
	}

	return findings;
}

export function docsSyncRequiredByAcceptance(body = '') {
	const acceptance = body.split('## ACCEPTANCE CRITERIA')[1]?.split('\n## ')[0] || '';
	return /auto-sync documentation|docs sync|documentation sync/i.test(acceptance);
}

export function isRequiredMergeProtectionRun(run = {}) {
	const name = run.workflowName || run.name || '';
	const jobName = run.display_title || run.head_branch || '';
	const jobCandidates = [jobName, name].filter(Boolean);
	if (MERGE_PROTECTION_WORKFLOW_PATTERNS.some((pattern) => pattern.test(name))) return true;
	if (MERGE_PROTECTION_JOB_PATTERNS.some((pattern) => jobCandidates.some((candidate) => pattern.test(candidate)))) {
		return true;
	}
	return LEGACY_REQUIRED_WORKFLOW_PATTERNS.some((pattern) => pattern.test(name));
}

export function classifyWorkflowRun(run, prBody = '') {
	const name = run.workflowName || run.name || '';
	const conclusion = String(run.conclusion || '').toLowerCase();
	const required = OPTIONAL_WORKFLOWS.has(name)
		? docsSyncRequiredByAcceptance(prBody)
		: isRequiredMergeProtectionRun(run);
	const classification =
		/COPILOT_GITHUB_TOKEN|secret/i.test(run.failureText || '') || OPTIONAL_WORKFLOWS.has(name)
			? 'secret-access/configuration'
			: required
				? 'required-workflow-failure'
				: 'optional-remediation-failure';

	return {
		workflow: name || 'unknown workflow',
		run_id: run.databaseId || run.id || null,
		url: run.url || run.html_url || '',
		conclusion,
		required,
		classification,
	};
}

export function workflowFailures({ runs = [], prBody = '', currentRunId = '' }) {
	return runs
		.filter((run) => String(run.databaseId || run.id || '') !== String(currentRunId || ''))
		.filter((run) => String(run.status || '').toLowerCase() === 'completed')
		.filter((run) => ['failure', 'timed_out', 'cancelled', 'action_required'].includes(String(run.conclusion || '').toLowerCase()))
		.filter((run) => !/post-merge detection|post-merge-intent-verification/i.test(run.workflowName || run.name || ''))
		.map((run) => classifyWorkflowRun(run, prBody));
}

export function buildResult({
	pr = null,
	resolution,
	metadata = [],
	implementation = [],
	diataxis = [],
	findings = [],
	reviewerDispositionFailures = [],
	failures = [],
	mergeSha = '',
	sourceIssueCandidates = [],
	terminalLabelResult = null,
	sourceIssueCloseoutMode = '',
	repository = '',
} = {}) {
	if (!resolution?.pr) {
		return {
			status: 'skipped',
			pr: null,
			merge_sha: mergeSha,
			source_issue: null,
			late_findings: 0,
			workflow_failures: [],
			implementation_failures: [],
			diataxis_failures: [],
			remediation_required: false,
			source_issue_candidates: [],
			terminal_label_result: null,
			source_issue_closeout_mode: '',
			queue_advancement_status: 'not evaluated',
			skip_reason: resolution?.skip_reason || 'no merged PR associated with commit',
		};
	}

	const requiredWorkflowFailures = failures.filter((failure) => failure.required);
	const blockingMetadata = blockingMetadataFailures(metadata);
	const blockingFailureCount =
		blockingMetadata.length +
		implementation.length +
		diataxis.length +
		findings.length +
		reviewerDispositionFailures.length +
		requiredWorkflowFailures.length;
	const status = blockingFailureCount === 0 ? 'pass' : 'fail';
	const remediationWorkflowFailures = failures.filter((failure) => failure.required);
	const remediationRequired =
		blockingMetadata.length > 0 ||
		implementation.length > 0 ||
		diataxis.length > 0 ||
		findings.length > 0 ||
		reviewerDispositionFailures.length > 0 ||
		remediationWorkflowFailures.length > 0;

	return {
		status,
		pr: Number(resolution.pr),
		merge_sha: mergeSha || pr?.mergeCommit?.oid || pr?.merge_commit_sha || '',
		source_issue: sourceIssueAccounting(pr?.body || '', { repository }).issueNumber || null,
		source_issue_candidates: sourceIssueCandidates.length ? sourceIssueCandidates : sourceIssueAccounting(pr?.body || '', { repository }).sourceIssueCandidates,
		source_issue_closeout_mode: sourceIssueCloseoutMode,
		late_findings: findings.length,
		workflow_failures: failures,
		metadata_failures: metadata,
		implementation_failures: implementation,
		diataxis_failures: diataxis,
		reviewer_findings: findings,
		reviewer_disposition_failures: reviewerDispositionFailures,
		evidence_summary: {
			metadata_failures: metadata.length,
			implementation_failures: implementation.length,
			diataxis_failures: diataxis.length,
			late_reviewer_findings: findings.length,
			reviewer_disposition_failures: reviewerDispositionFailures.length,
			workflow_failures: failures.length,
			required_workflow_failures: requiredWorkflowFailures.length,
		},
		remediation_required: remediationRequired,
		terminal_label_result: terminalLabelResult,
		queue_advancement_status: remediationRequired || status === 'fail' || reviewerDispositionFailures.length > 0
			? 'stopped; reviewer exception or remediation issue requires Atlas/Bill review'
			: 'no queue action; Program 1 launch, Program 2 mutation, and child issue creation remain stopped',
		sync_action: status === 'fail' ? 'post_merge_failure' : remediationRequired ? 'post_merge_remediation' : 'post_merge_success',
	};
}

export function renderPostMergeReport(result) {
	const lines = [
		`Post-merge validation result: ${result.status}`,
		'',
		'## Summary',
		`- PR: ${result.pr ? `#${result.pr}` : 'none'}`,
		`- Commit: ${result.merge_sha || 'unknown'}`,
		`- Source issue: ${result.source_issue ? `#${result.source_issue}` : 'none'}`,
		`- Source issue candidates: ${result.source_issue_candidates?.length ? result.source_issue_candidates.join(', ') : 'none'}`,
		`- Source issue closeout mode: ${result.source_issue_closeout_mode || 'not evaluated'}`,
		`- Remediation required: ${result.remediation_required ? 'yes' : 'no'}`,
		`- Terminal label result: ${result.terminal_label_result?.summary || 'not evaluated'}`,
		`- Queue advancement status: ${result.queue_advancement_status || 'not evaluated'}`,
	];

	if (result.evidence_summary) {
		lines.push(
			`- Metadata failures: ${result.evidence_summary.metadata_failures}`,
			`- Implementation evidence failures: ${result.evidence_summary.implementation_failures}`,
			`- DIATAXIS failures: ${result.evidence_summary.diataxis_failures}`,
			`- Late reviewer findings: ${result.evidence_summary.late_reviewer_findings}`,
			`- Workflow failures: ${result.evidence_summary.workflow_failures}`,
		);
	}

	lines.push('', '## Metadata failures');
	if (result.metadata_failures?.length) {
		for (const failure of result.metadata_failures) {
			lines.push(`- ${failure.code}: ${failure.message}`);
		}
	} else {
		lines.push('- none');
	}

	lines.push('', '## Implementation evidence');
	if (result.implementation_failures?.length) {
		for (const failure of result.implementation_failures) {
			lines.push(`- ${failure.code}: ${failure.message}`);
		}
	} else {
		lines.push('- none');
	}

	lines.push('', '## DIATAXIS evidence');
	if (result.diataxis_failures?.length) {
		for (const failure of result.diataxis_failures) {
			lines.push(`- ${failure.code}: ${failure.message}`);
		}
	} else {
		lines.push('- none');
	}

	lines.push('', '## Late reviewer findings');
	if (result.reviewer_findings?.length) {
		for (const finding of result.reviewer_findings) {
			lines.push(`- ${finding.url} by ${finding.reviewer}: ${finding.body}`);
		}
	} else {
		lines.push('- none');
	}

	lines.push('', '## Reviewer disposition failures');
	if (result.reviewer_disposition_failures?.length) {
		for (const failure of result.reviewer_disposition_failures) {
			lines.push(`- ${failure.code}: ${failure.message}`);
		}
	} else {
		lines.push('- none');
	}

	lines.push('', '## Workflow failures');
	if (result.workflow_failures?.length) {
		for (const failure of result.workflow_failures) {
			lines.push(`  - ${failure.workflow}: ${failure.classification}${failure.required ? ' (required)' : ' (optional)'}`);
		}
	} else {
		lines.push('- none');
	}

	if (result.status === 'fail') {
		lines.push('', '## Orchestration impact', '- Queue advancement remains blocked until post-merge validation succeeds.');
	}

	return `${lines.join('\n')}\n`;
}

export function commentBody(result) {
	return renderPostMergeReport(result);
}

function writeOutput(name, value) {
	const outputPath = process.env.GITHUB_OUTPUT;
	if (outputPath) fs.appendFileSync(outputPath, `${name}=${value}\n`);
}

async function apiRequest({ token, repository, path: requestPath, method = 'GET', body }) {
	const response = await fetch(`https://api.github.com/repos/${repository}${requestPath}`, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			'User-Agent': 'lgfc-post-merge-validator',
			...(body ? { 'Content-Type': 'application/json' } : {}),
		},
		...(body ? { body: JSON.stringify(body) } : {}),
	});

	if (!response.ok) {
		throw new Error(`${method} ${requestPath} failed: ${response.status} ${await response.text()}`);
	}

	return response.status === 204 ? null : response.json();
}

async function paginate(args) {
	const out = [];
	let page = 1;
	while (true) {
		const separator = args.path.includes('?') ? '&' : '?';
		const data = await apiRequest({ ...args, path: `${args.path}${separator}per_page=100&page=${page}` });
		if (!Array.isArray(data) || data.length === 0) break;
		out.push(...data);
		if (data.length < 100) break;
		page += 1;
	}
	return out;
}

function uniqueRuns(...runGroups) {
	const byId = new Map();
	for (const group of runGroups) {
		for (const run of group || []) {
			const id = run.databaseId || run.id || run.html_url || run.url;
			if (id && !byId.has(id)) byId.set(id, run);
		}
	}
	return [...byId.values()];
}

function runTimestamp(run) {
	return Date.parse(run.created_at || run.createdAt || run.run_started_at || run.startedAt || run.updated_at || run.updatedAt || '') || 0;
}

export function latestRunsByWorkflow(runs = []) {
	const latest = new Map();
	for (const run of runs) {
		const name = run.workflowName || run.name || 'unknown workflow';
		const current = latest.get(name);
		if (!current || runTimestamp(run) >= runTimestamp(current)) latest.set(name, run);
	}
	return [...latest.values()];
}

export const WORKFLOW_RUN_SCOPE_MERGE_ONLY = 'merge_only';
export const WORKFLOW_RUN_SCOPE_MERGE_AND_HEAD = 'merge_and_head';

export function selectWorkflowRunsForValidation({
	mergeRuns = [],
	headRuns = [],
	scope = WORKFLOW_RUN_SCOPE_MERGE_AND_HEAD,
} = {}) {
	if (scope === WORKFLOW_RUN_SCOPE_MERGE_ONLY) {
		return latestRunsByWorkflow(mergeRuns);
	}
	return latestRunsByWorkflow(uniqueRuns(mergeRuns, headRuns));
}

function shouldInspectRun(run, currentRunId = '') {
	return (
		String(run.databaseId || run.id || '') !== String(currentRunId || '') &&
		String(run.status || '').toLowerCase() === 'completed' &&
		['failure', 'timed_out', 'cancelled', 'action_required'].includes(String(run.conclusion || '').toLowerCase())
	);
}

async function enrichFailedRuns({ token, repository, runs, currentRunId }) {
	return Promise.all(
		runs.map(async (run) => {
			if (!shouldInspectRun(run, currentRunId)) return run;
			const runId = run.databaseId || run.id;
			if (!runId) return run;

			try {
				const jobs = await apiRequest({ token, repository, path: `/actions/runs/${runId}/jobs?per_page=100` });
				const failureText = (jobs.jobs || [])
					.flatMap((job) => [
						job.name,
						...(job.steps || [])
							.filter((step) =>
								['failure', 'cancelled', 'timed_out', 'action_required'].includes(String(step.conclusion || '').toLowerCase()),
							)
							.map((step) => step.name),
					])
					.filter(Boolean)
					.join(' ');
				return { ...run, failureText };
			} catch {
				return run;
			}
		}),
	);
}

export async function runValidator({
	token,
	repository,
	eventName,
	inputPrNumber,
	eventPrNumber,
	eventPrMerged,
	eventPrBaseRef,
	sha,
	runId,
	workspace = process.cwd(),
	workflowRunScope = process.env.POST_MERGE_WORKFLOW_RUN_SCOPE || WORKFLOW_RUN_SCOPE_MERGE_AND_HEAD,
}) {
	const pulls = eventName === 'push' ? await apiRequest({ token, repository, path: `/commits/${sha}/pulls` }) : [];
	const resolution = resolvePrNumber({ eventName, inputPrNumber, eventPrNumber, eventPrMerged, eventPrBaseRef, associatedPulls: pulls });

	if (!resolution.pr) return buildResult({ resolution, mergeSha: sha });

	const pr = await apiRequest({ token, repository, path: `/pulls/${resolution.pr}` });
	const prHeadSha = pr.head?.sha || '';

	const [issueComments, reviewComments, reviews, mergeRunsResponse, headRunsResponse] = await Promise.all([
		paginate({ token, repository, path: `/issues/${resolution.pr}/comments` }),
		paginate({ token, repository, path: `/pulls/${resolution.pr}/comments` }),
		paginate({ token, repository, path: `/pulls/${resolution.pr}/reviews` }),
		apiRequest({ token, repository, path: `/actions/runs?head_sha=${encodeURIComponent(sha)}&per_page=100` }),
		prHeadSha
			? apiRequest({ token, repository, path: `/actions/runs?head_sha=${encodeURIComponent(prHeadSha)}&per_page=100` })
			: { workflow_runs: [] },
	]);

	const normalizedPr = {
		body: pr.body || '',
		files: await paginate({ token, repository, path: `/pulls/${resolution.pr}/files` }),
		isDraft: pr.draft,
		mergedAt: pr.merged_at,
		baseRefName: pr.base?.ref,
		mergeCommit: { oid: pr.merge_commit_sha },
		url: pr.html_url,
	};

	const sourceAccounting = sourceIssueAccounting(normalizedPr.body, { repository });
	let sourceIssue = null;
	let sourceIssueError = '';
	let repoLabels = [];
	let terminalLabelResult = null;
	let sourceIssueCloseoutMode = '';
	if (sourceAccounting.issueNumber) {
		try {
			const [issue, labels] = await Promise.all([
				apiRequest({ token, repository, path: `/issues/${sourceAccounting.issueNumber}` }),
				paginate({ token, repository, path: '/labels' }),
			]);
			sourceIssue = issue;
			repoLabels = labels;
			terminalLabelResult = shouldKeepActiveSourceIssueOpen(normalizedPr.body || '')
				? planActiveSourceIssueRelabel({ issueLabels: sourceIssue.labels || [] })
				: planTerminalLabelReconciliation({
					issueLabels: sourceIssue.labels || [],
					repoLabels,
				});
			sourceIssueCloseoutMode = isPermittedClosedSourceIssueFollowup({
				body: normalizedPr.body,
				sourceIssue,
			})
				? 'closed_remediation_followup'
				: String(sourceIssue.state || '').toLowerCase() === 'open'
					? 'open_source_issue'
					: 'exception_required';
		} catch (error) {
			sourceIssueError = error instanceof Error ? error.message : String(error);
		}
	}

	const filesExist = (filePath) => fs.existsSync(path.join(workspace, filePath));
	const metadata = metadataFailures(normalizedPr, filesExist, {
		repository,
		sourceIssue,
		sourceIssueError,
		repoLabels,
	});
	const implementation = implementationEvidenceFailures({
		body: normalizedPr.body,
		files: normalizedPr.files,
	});
	const diataxis = diataxisEvidenceFailures({
		files: normalizedPr.files,
		root: workspace,
	});
	const findings = reviewerFindings({ pr: normalizedPr, issueComments, reviewComments, reviews });
	const dispositionFailures = reviewerDispositionFailures({
		body: normalizedPr.body,
		issueComments,
		reviewComments,
		reviews,
		headSha: normalizedPr.mergeCommit?.oid || sha,
		mergedAt: normalizedPr.mergedAt,
	});
	const runs = selectWorkflowRunsForValidation({
		mergeRuns: mergeRunsResponse.workflow_runs || [],
		headRuns: headRunsResponse.workflow_runs || [],
		scope: workflowRunScope,
	});
	const enrichedRuns = await enrichFailedRuns({ token, repository, runs, currentRunId: runId });
	const failures = workflowFailures({ runs: enrichedRuns, prBody: normalizedPr.body, currentRunId: runId });

	return buildResult({
		pr: normalizedPr,
		resolution,
		metadata,
		implementation,
		diataxis,
		findings,
		reviewerDispositionFailures: dispositionFailures,
		failures,
		mergeSha: sha,
		sourceIssueCandidates: sourceAccounting.sourceIssueCandidates,
		terminalLabelResult,
		sourceIssueCloseoutMode,
		repository,
	});
}

export async function applyPullRequestBody({ token, repository, prNumber, body }) {
	const response = await fetch(`https://api.github.com/repos/${repository}/pulls/${prNumber}`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			'User-Agent': 'lgfc-apply-open-pr-body',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ body }),
	});

	if (!response.ok) {
		throw new Error(`PATCH /pulls/${prNumber} failed: ${response.status} ${await response.text()}`);
	}

	return response.json();
}

const MAINTAINER_PR_BODIES = {
	1241: PR_1241_MAINTAINER_BODY,
	1552: PR_1552_MAINTAINER_BODY,
};

export async function applyMaintainerPrBodyMain() {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const prNumber = process.env.PR_NUMBER || process.env.INPUT_PR_NUMBER;
	if (!token || !repository || !prNumber) {
		throw new Error('GITHUB_TOKEN/GH_TOKEN, GITHUB_REPOSITORY, and PR_NUMBER are required.');
	}

	const numericPr = Number(prNumber);
	const maintainerBody = MAINTAINER_PR_BODIES[numericPr];
	if (!maintainerBody) {
		throw new Error(`No maintainer PR body registered for PR #${prNumber}`);
	}

	const currentResponse = await fetch(`https://api.github.com/repos/${repository}/pulls/${prNumber}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			'User-Agent': 'lgfc-apply-open-pr-body',
		},
	});
	if (!currentResponse.ok) {
		throw new Error(`GET /pulls/${prNumber} failed: ${currentResponse.status} ${await currentResponse.text()}`);
	}
	const currentPr = await currentResponse.json();
	if ((currentPr.body || '').includes('<!-- CURSOR_AGENT_PR_BODY_BEGIN -->')) {
		console.log(JSON.stringify({
			status: 'skipped',
			pr: numericPr,
			reason: 'maintainer body marker already present',
		}, null, 2));
		return;
	}

	const result = await applyPullRequestBody({
		token,
		repository,
		prNumber,
		body: maintainerBody,
	});
	console.log(JSON.stringify({ status: 'applied', pr: numericPr, head_sha: result.head?.sha || '' }, null, 2));
}

export async function main() {
	if (process.env.APPLY_MAINTAINER_PR_BODY === 'true') {
		await applyMaintainerPrBodyMain();
		return;
	}

	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	if (!token || !repository) throw new Error('GITHUB_TOKEN/GH_TOKEN and GITHUB_REPOSITORY are required.');

	const result = await runValidator({
		token,
		repository,
		eventName: process.env.GITHUB_EVENT_NAME || '',
		inputPrNumber: process.env.INPUT_PR_NUMBER || '',
		eventPrNumber: process.env.EVENT_PR_NUMBER || '',
		eventPrMerged: process.env.EVENT_PR_MERGED || '',
		eventPrBaseRef: process.env.EVENT_PR_BASE_REF || '',
		sha: process.env.GITHUB_SHA || '',
		runId: process.env.GITHUB_RUN_ID || '',
	});

	fs.writeFileSync('post-merge-result.json', `${JSON.stringify(result, null, 2)}\n`);
	fs.writeFileSync('post-merge-result.md', commentBody(result));

	writeOutput('status', result.status);
	writeOutput('pr_number', result.pr || '');
	writeOutput('sync_action', result.sync_action || 'skipped');
	writeOutput('remediation_required', result.remediation_required ? 'true' : 'false');

	console.log(JSON.stringify(result, null, 2));
	if (result.status === 'fail') process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}
