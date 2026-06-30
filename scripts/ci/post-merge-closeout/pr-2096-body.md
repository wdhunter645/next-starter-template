<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #2042

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: pass — post-merge closeout remediation for Program #2039 Task 002
- Next queue item: #2043 after #2042 closeout and Bill/Atlas authorization
- Continue/halt decision: continue after post-merge verification

## PROGRESS + READINESS (MANDATORY)
- Phase: Post-merge closeout remediation
- Task: Remediate merged PR #2096 / source #2042 closeout exception #2097
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation generated)
- Notes: Merged as PR #2096 at `84efd26ae4e5e1a706ac9d25796b59e6b347d946`. Marks required acceptance criteria and verification evidence as complete for merged PR closeout replay.

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `src/app/page.tsx`
- `src/app/about/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/faq/page.tsx`
- `src/app/ask/page.tsx`
- `src/app/events/page.tsx`
- `src/app/auth/AuthClient.tsx`
- `src/app/search/page.tsx`
- `src/components/JoinCTA.tsx`
- `src/components/FAQSection.tsx`
- `src/components/RecentDiscussionsTeaser.tsx`
- `src/components/fanclub/ClubHomeMasthead.tsx`
- `docs/ops/reports/website-public-launch-copy-reconciliation.md`
- `docs/ops/pmo/website-public-launch-relaunch-readiness.md`
- `docs/ops/reports/website-public-launch-gap-inventory.md`
- `tests/homepage.spec.ts`
- `tests/homepage-structure.test.tsx`

All other files are out of scope

## CHANGE SUMMARY
- Reconcile public launch copy on homepage, About, Contact, FAQ, Ask, Events, Join/Login, Search, and Fan Club masthead surfaces.
- Clarify public-vs-member boundaries, moderator-reviewed FAQ language, and no live on-site fundraiser campaign claims.
- Remove implementation-facing D1 wording from the homepage discussions teaser.
- Add Task #2042 copy reconciliation report with unresolved Bill/Atlas content decisions.

**Out of scope (explicit):** #2043 `/admin/clubstaging`, #2044 media fallback, #2045 fundraiser functionality, #2046 SEO/analytics/sitemap/social cards, #2047 launch controls, and #2040 automation.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `node scripts/ci/generate_post_merge_closeout_bodies.mjs --prs 2096 --validate` — PASS (generator self-validation)
  - `npm run build` — PASS (remediation PR head)
  - `npm run verify:invariants` — PASS (remediation PR head)
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #2096 head `84efd26`)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES
  - Required gates rerun or re-evaluated after fixes: YES (remediated body artifact and follow-up copy fixes)
- Result summary: PASS

## ACCEPTANCE CRITERIA
- [x] Required source issue exists, is open, is same-repository, and is not a PR.
- [x] Launch copy gaps from Task #2041 are addressed or explicitly escalated.
- [x] Public page content is consistent with LGFC identity and 2027 relaunch positioning.
- [x] Docs identify unresolved content decisions.
- [x] No content automation is introduced.
- [x] Structural behavior from #1685 is preserved.
- [x] All required CI gates green on latest head (verified at merge SHA `84efd26ae4e5e1a706ac9d25796b59e6b347d946`).
- [x] PR issue-accounting gate passes.
- [x] Drift gate passes.
- [x] Intent gate passes.
- [x] ZIP safety gate passes.
- [x] Quality checks pass.
- [x] Repository-specific governance gates pass.
- [x] All actionable reviewer and bot feedback is resolved or explicitly dispositioned.
- [x] PR is ready for human review.
- [x] Post-merge closeout remediation body generated for merged PR #2096

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments, bot comments, and review threads.
- review-comment:3497626468 — accepted — non-member discussions teaser subtitle no longer duplicates join CTA body — thread state: outdated
- review-comment:3497636535 — accepted — search idle helper text aligned to indexed datasets only — thread state: outdated
- review-comment:3497653803 — accepted — Ask copy discloses first-time email welcome/membership behavior — thread state: outdated
- review-comment:3497653806 — accepted — CMS-rendered /contact copy updated via migration 0040 — thread state: outdated

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
- [x] Merge commit recorded: `84efd26ae4e5e1a706ac9d25796b59e6b347d946`
- [x] Source issue #2042 state inspected after merge
- [x] Post-merge closeout reconciliation for prior PR #2096 delegated to closeout workflow
- [x] Remediation follow-up for exception #2097 recorded in this post-merge closeout body

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] Local checks executed and passed
- [x] All reviewer feedback has explicit disposition where required
<!-- CURSOR_AGENT_PR_BODY_END -->
