<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1850

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: pass — #1849 merged via PR #1887
- Next queue item: #1851 — escalation issue generator
- Continue/halt decision: continue after #1850 post-merge verification

## PRE-MERGE CLOSEOUT PREDICTION
- Pre-merge closeout prediction: pass
- Source issue state before merge: open
- Expected post-merge source issue action: manual close
- Reviewer disposition parseability: pass
- Queue continuation after closeout: continue to #1851

## PROGRESS + READINESS
- Phase: MERGED
- Task: Safe auto-fix executor (#1850)
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none
- Notes: Merged as PR #1892 at `d8e094576ff74b395cdfac7025b8e3f759845efd`. Post-merge closeout body replay registered.

## DOCUMENTATION SOURCE
- [x] DIATAXIS_FULL

Source Files Used:
- `docs/reference/ci/post-merge-self-healing-classification-contract.md`
- `scripts/ci/post_merge_self_heal_classify.mjs`
- `scripts/ci/post_merge_self_heal_detect.mjs`

## LABEL
- Intent label for this PR: infra

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `scripts/ci/post_merge_self_heal_apply.mjs`
- `tests/post-merge-self-heal-apply.test.mjs`

All other files are out of scope.

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## CHANGE SUMMARY
- Add safe auto-fix executor with dry-run mode for manifest pruning and duplicate remediation planning.
- Preserve skipped/no_change dry-run statuses for accurate planning summaries.
- Skips unsafe findings; no runtime app-code or GitHub mutations unless explicitly authorized in apply mode.

## BUILD / TEST / VERIFICATION
- `npx vitest run --config tests/vitest.node.config.ts tests/post-merge-self-heal-apply.test.mjs` — PASS (13/13)

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments, bot comments, and review threads.
- review-comment:3447589039 — accepted — dry-run preserves skipped/no_change manifest prune statuses — thread state: resolved
- review-comment:3447589041 — not applicable — flattenValidationFailures is not in this PR's allowlist (detector lives in merged #1887) — thread state: outdated
- review-comment:3447589046 — accepted — removed unused parseRemediationIssue import — thread state: resolved
- review-comment:3447589049 — accepted — removed unused RECOMMENDED_ACTIONS import — thread state: resolved
- review-comment:3447589058 — not applicable — detectPostMergeFindings null guard is in merged #1887, not this PR — thread state: outdated

## ACCEPTANCE CRITERIA
- [x] Safe manifest fixture is auto-pruned in dry-run
- [x] Unsafe reviewer-disposition fixture is not auto-fixed
- [x] Dry-run mode exists and is covered by tests
<!-- CURSOR_AGENT_PR_BODY_END -->
