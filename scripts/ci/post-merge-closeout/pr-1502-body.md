- **Issue:** #1501

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #1501`.
- [x] For docs changes, confirm every changed active Markdown file starts with the required authority header from `docs/templates/markdown-header-template.md`.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: not-applicable
- Next queue item: not-applicable
- Continue/halt decision: not-applicable — documentation-only PMO governance update with no launched-program queue execution

## PROGRESS + READINESS (MANDATORY)
- Phase: PMO v3 documentation migration
- Task: Convert PMO model to program issue numbers and PMO backlog
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge body remediation applied)
- Notes: Merged as PR #1502 (merge SHA `5c7128206261848464b9cbb2ff301713269fdf0d`). Post-merge closeout body remediation applied for reviewer disposition and issue closeout.

## DOCUMENTATION SOURCE (MANDATORY)
- [x] DIATAXIS_ROUTED

Source Files Used:
- docs/ops/pmo/PMO-V2-OPERATING-MODEL.md (superseded)
- docs/ops/pmo/program-5-ideas-and-project-drafts.md (superseded)
- docs/ops/pmo/program-registry.md
- docs/reference/pmo/lgfc-program-portfolio-model.md
- docs/reference/pmo/lgfc-cursor-execution-contract.md
- docs/reference/pmo/lgfc-program-queue-and-dependency-map.md
- docs/ops/pmo/workflow-automation.md
- docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md

## LABEL
- Intent label for this PR: change-ops

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- PMO v3 operating model: `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`
- PMO Backlog: `/docs/ops/pmo/pmo-backlog.md`
- PMO program issue registry: `/docs/ops/pmo/program-registry.md`
- Cursor execution contract: `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
- Queue/dependency map: `/docs/reference/pmo/lgfc-program-queue-and-dependency-map.md`
- Workflow automation: `/docs/ops/pmo/workflow-automation.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- docs/ops/pmo/PMO-V2-OPERATING-MODEL.md
- docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
- docs/ops/pmo/program-registry.md
- docs/ops/pmo/program-5-ideas-and-project-drafts.md
- docs/ops/pmo/pmo-backlog.md
- docs/reference/pmo/lgfc-program-portfolio-model.md
- docs/reference/pmo/lgfc-cursor-execution-contract.md
- docs/reference/pmo/lgfc-program-queue-and-dependency-map.md
- docs/ops/pmo/workflow-automation.md
- docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Documentation-only PR.
- [x] No runtime UI changes.
- [x] No route/layout/header/footer changes.
- [x] No D1/schema changes.
- [x] No workflow YAML changes.

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [x] This PR contains documentation-only changes
- [x] No application code, config, or runtime behavior modified

## CHANGE SUMMARY
- Retired fixed Program 1–5 nomenclature for future PMO operation; program issue numbers become program identifiers.
- Added `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md` as canonical PMO authority with PMO meeting issue model and program issue rules.
- Reframed former Program 1 as Program #1411 (staged/blocked until Program #1255 completion and signoff).
- Preserved Program #1255 as active with historical Program 2 continuity; no disruption to #1255.
- Replaced former Program 5 with PMO Backlog document (`/docs/ops/pmo/pmo-backlog.md`) preserving full inventory.
- Left PMO v2 and Program 5 docs as historical supersession stubs with pointers to PMO v3.
- Updated program registry, portfolio model, cursor execution contract, queue/dependency map, workflow automation, and Program #1411 implementation plan.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `ls -la *.zip` — PASS (no ZIP in repo root)
  - `git diff --name-only origin/main...HEAD` — PASS (10 allowlisted files at merge)
  - `DOCS_HEADER_FILE_LIST=<changed-files> ./scripts/ci/docs_check_headers.sh .` — PASS
  - `./scripts/ci/docs_canonical_hashes_verify.sh .` — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES (merge commit `5c71282`)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (post-merge reviewer disposition remediation applied)
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary: PASS (all required gates green at merge; post-merge closeout body remediation applied)

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received or not applicable.
- [x] Gemini disposition received or not applicable.
- [x] Cubic disposition received or not applicable.
- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [x] Every outdated review thread has explicit PR-body disposition with comment ID and thread state.

Reviewer items:
- review-comment:3382471489 — acknowledged — PMO v3 migration retained title-case table headers consistent with existing PMO ops docs; lowercase normalization is a follow-up style pass outside this source issue scope — thread state: outdated
- review-comment:3382471509 — acknowledged — section heading `## Project drafts` retained; PMO backlog uses operational section titles aligned with sibling PMO docs — thread state: outdated
- review-comment:3382471514 — acknowledged — registry title retained as `# PMO Program Issue Registry`; issue-number model is explicit in body — thread state: outdated
- review-comment:3382471524 — acknowledged — `## Program #1411 project areas` retained; program issue number is the v3 identifier — thread state: outdated
- review-comment:3382471529 — acknowledged — `## Active Program Issue Child-Task Continuation` retained as descriptive section title — thread state: outdated
- review-comment:3382471537 — acknowledged — `## Program Issue Portfolio Model` retained; portfolio content reflects v3 issue-number model — thread state: outdated
- review-comment:3382471540 — acknowledged — project-level map heading retained; Program #1255 / #1256 relationship documented in section body — thread state: outdated
- review-comment:3382471546 — acknowledged — issue-level fields heading retained; required queue fields unchanged from v2 contract — thread state: outdated
- review-comment:3382481016 — acknowledged — launch-state table `unless Bill/Atlas explicitly reopen/reactivate or launch` applies only after Program #1255 completion/signoff per controlling launch-state statement; not a bypass of #1255 gate — thread state: outdated
- review-comment:3382481026 — acknowledged — linked `program-5-admin-page-and-tools-design-readiness.md` is legacy filename/path; v3 alignment of that doc is a separate backlog follow-up before promotion — thread state: outdated
- review-comment:3382487102 — acknowledged — issue title format (`Program:`) vs doc reference format (`Program #<n> — <name>`) distinction noted; both appear in PMO-V3-OPERATING-MODEL terminology and program issue rules — thread state: outdated
- review-comment:3382487165 — acknowledged — Program #1255 child project `#1256` relationship is explicit in queue map project-level section; heading clarity acceptable on merge head — thread state: outdated
- review-comment:3382487204 — acknowledged — legacy `program-5-*` filename noted in backlog entry; PMO v3 migration scope preserved path for continuity; not a current Program 5 lane — thread state: outdated
- review-comment:3382487234 — acknowledged — registry uses Purpose-led ops structure; full Scope/Current known truth/Intended final state expansion deferred to focused registry follow-up — thread state: outdated
- review-comment:3382487266 — acknowledged — backlog doc includes Purpose-equivalent intro and Current backlog status; minimum section expansion deferred to follow-up — thread state: outdated
- review-comment:3382487293 — acknowledged — PMO-V3 authority includes Purpose, terminology, hierarchy, and current program tables; explicit Scope/Intended final state section headers deferred to follow-up alignment pass — thread state: outdated

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] PR-level pull_request_target workflows inspected
- [x] Latest head workflow runs inspected
- [x] Failed job logs inspected for every failing gate
- [x] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] All review threads and comments inspected
- [x] Actionable review feedback has PR-body disposition and GitHub thread-state disposition
- [x] Required gates rerun or re-evaluated after fixes
- [x] Final PR panel confirms merge-readiness at review time

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded (`5c7128206261848464b9cbb2ff301713269fdf0d`)
- [x] Source issue state inspected after merge
- [x] Post-merge validation gates inspected when applicable
- [x] Post-merge closeout body remediation applied for parser alignment and reviewer disposition

## ACCEPTANCE CRITERIA
- [x] PMO v3 authority document exists (`PMO-V3-OPERATING-MODEL.md`)
- [x] Fixed Program 1–5 language removed or clearly superseded
- [x] Program issue-number model documented
- [x] PMO meeting issue model documented
- [x] PMO Backlog replaces former Program 5
- [x] Current backlog inventory preserved
- [x] Former Program 1 reframed as Program #1411
- [x] Program #1411 documented as staged / blocked
- [x] Program #1411 launch blocked until Program #1255 completion and signoff
- [x] Program #1255 remains active and is not disrupted
- [x] Historical Program 1 / Program 2 references preserved where needed
- [x] Future PMO programs use program issue-number format
- [x] PR body uses exactly one source issue line (#1501)
- [x] PR is docs-only
- [x] All reviewer comments actioned or explicitly dispositioned

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular
- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [x] Post-merge closeout body remediation applied for merged PR governance

## POST-MERGE ISSUE DISPOSITION
- Close **#1501** after post-merge verification passes following body apply with `state_reason: completed` and terminal label reconciliation (`status:complete` only)

<!-- closeout-trigger: 2026-06-09 -->
