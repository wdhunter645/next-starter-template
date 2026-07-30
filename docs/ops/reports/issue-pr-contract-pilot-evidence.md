---
Doc Type: Report
Audience: Human + AI
Authority Level: Evidence
Owns: #2622 Issue-PR-contract pilot evidence (Phases 1-3), required metrics, and current pilot status
Does Not Own: The promotion decision itself (see `docs/reference/ci/issue-pr-contract-promotion-decision.md`), the contract design (`docs/reference/ci/issue-pr-contract.md`), or the #2294 controller contract (`docs/reference/ci/agent-routing-controller-contract.md`)
Canonical Reference: /docs/reference/ci/issue-pr-contract.md
Related Issues: #2622, #2615, #2618, #2619, #2620, #2621, #2592, #2601
Last Reviewed: 2026-07-29
---

# Issue-PR-Contract Pilot Evidence (#2622)

## Status

**#2622 is not closeable on the present evidence.** Phases 1-3 produced real, live evidence, but corrected Finding 7 below shows a genuine, measured acceptance-criterion failure — not an unmeasured or passing result — so this is interim evidence for Phase 4's recommendation, not a closeout package.

- **Phase 1 (historical dry run): complete.** 12-Issue sample, evidence below.
- **Phase 2 (live advisory validation): executed once, live, on 2026-07-29** via the authorized #2622 Phase 3 pilot exercise (Issue #2948) — see below. One real evaluation is not the "representative sample" #2622 envisions for this phase, but it is genuine live traffic, not a dry run.
- **Phase 3 (controlled draft-PR pilot): executed, authorized, on 2026-07-29 — result: measured failure of one acceptance criterion.** Pilot Issue #2948 → PR #2949 (titled "Draft: source Issue #2948"). One genuine defect was found and fixed live (a `delivery_model` value-format mismatch, Finding 6). Finding 7 (corrected below) shows the generated PR body did **not** pass shared hygiene validation before creation: `pr-hygiene` and `diff-scope` both ran and reported real defects.
- **Phase 4 (promotion decision):** see `docs/reference/ci/issue-pr-contract-promotion-decision.md`. The recommendation (remain advisory) is unchanged and now further reinforced by corrected Finding 7 below.

This report does not authorize enabling draft-PR creation beyond what #2621 already shipped (explicit `workflow_dispatch` only).

### Correction notice (2026-07-29, post-merge of PR #2950)

An ADJUSTMENT from ChatGPT/Atlas (issue comment 5122046082, filed after PR #2950's merge commit `384c4319da1afe99682b8949a09bbc47c134161a`) identified two defects in the version of Finding 7 and the "Required metrics" table merged by PR #2950: (1) an arithmetic error — the claimed "0 of 8" downstream gates actually enumerated 9 items; (2) a self-contradictory metrics-table row that simultaneously claimed PR #2949 "raised no `pr-hygiene` findings" and that the gate "never ran automatically." Re-examining PR #2949's actual, complete check-run and comment history (not just the state immediately after its creation, which is what the original Finding 7 was based on) shows both defects trace back to the same root cause: **the original Finding 7 was factually wrong, not just miscounted.** `pr-hygiene` and `diff-scope` did run against PR #2949, within roughly 35 seconds of its creation, and both posted real advisory findings. The corrected Finding 7 below replaces the original in full.

### Note on this file's location

`docs/ops/reports/**` is outside the four DIATAXIS-classified folders (`docs/tutorials`, `docs/how-to`, `docs/reference`, `docs/explanation`) that `scripts/ci/diataxis_folder_audit.mjs` checks, so this file triggers that check's `OUTSIDE_DIATAXIS_FOLDER` advisory. This is not a defect specific to this file: every point-in-time evidence/pilot report in the repository lives at this same path (e.g. `docs/ops/reports/delivery-system-v1-pilot-evidence.md`, `docs/ops/reports/lou-gehrig-content-seed-pilot-report.md`), and the check itself is explicitly documented as "advisory and non-blocking during PR Hygiene Foundation rollout" (`.github/workflows/diataxis-folder-authority.yml` and `diataxis-folder-authority-check.yml`'s own comment output). Moving this one file out of that established, repo-wide convention would make it the odd one out rather than resolve anything.

## Phase 1 — Historical dry run

### Method

Two independent, complementary analyses, both read-only:

1. **Literal validator dry run.** `scripts/ci/issue_pr_contract_dry_run.mjs` runs the real, unmodified `findVersionedContractMarkers` + `evaluateIssuePrContractRequest` (#2619/#2620) against a fixture set of 12 real historical Issue bodies (`tests/issue-pr-contract-pilot/dry-run-sample/historical-issues.json`), collected by direct GitHub API read on 2026-07-29. Reproduce with `node scripts/ci/issue_pr_contract_dry_run.mjs`.
2. **Retrospective field-completeness review.** A manual read of the same 12 Issues (plus a targeted marker-usage search across the whole repository) against the contract's 12 required contract-source fields (`purpose`, `intent_label`, `pr_class`, `allowed_paths`, `out_of_scope_changes_present`, `change_summary`, `verification_commands`, `verification_results`, `follow_up_required`, `rollback_summary`, `head_branch`, `base_branch` — `scripts/ci/pr_contract.mjs`'s `CONTRACT_FIELDS`). This is explicitly a heuristic estimate of "how much of this Issue's existing content maps onto a required contract field," not a claim that these Issues contain an actual contract block — none do (see below).

### Sample

12 real Issues, spanning Model A (#2734), Model B promotion (#2690), Model B child (#2495, #2593, #2500), Issues with no stated Delivery Model at all — a legacy/gap class (#2101, #2047, #1706, #2805, #2806), one Issue with a conditional/ambiguous Delivery Model string (#2694: *"Model A unless implementation proves materially larger than one reviewable PR"*), and one deliberate marker-ambiguity hard case (#2615, which contains five other `lgfc-*`-prefixed marker-style blocks but no `lgfc-issue-pr-contract:v1` block).

### Finding 1 — Zero real-world adoption yet (expected)

A repository-wide search (`search_issues`, `search_code`) for `lgfc-issue-pr-contract` and `lgfc-issue-pr-contract:v1` found no real Issue with a filled contract block. The only matches were: the design/spec Issues that *define* the marker (#2615, #2618, #2619) and unrelated PMO task-tracking markers (`lgfc-project-task:issue-pr-contract-automation:00X`) that merely contain the substring "issue-pr-contract" in a different marker name. This is expected — the feature shipped days ago and nothing has driven adoption yet — and is confirmed programmatically: the dry-run harness found `versionedMarkersFound: 0` for all 12 fixture Issues, including #2615 itself.

### Finding 2 — The validator correctly reports `contract_missing`, never a false positive, on every sample

```
issuesEvaluated: 12
issuesWithAnyMarker: 0
issuesPassingValidation: 0
errorCodeFrequency: { contract_missing: 12 }
```

Notably, #2615's five *other* `lgfc-*` marker-style blocks (`lgfc-current-project-state`, `lgfc-project-launch-package`, `lgfc-project-child-map`, plus two more referenced in its real body) do **not** get misidentified as the contract block — `findVersionedContractMarkers` correctly reports zero versioned contract markers there. This is a genuine, useful negative-control result: the marker-scoping fix from #2620's Copilot-review remediation (scoping head/base extraction to inside the exact `lgfc-issue-pr-contract:v1` block) generalizes correctly to a real Issue body with adjacent, similarly-named-but-different markers.

### Finding 3 — Retrospective field-completeness is naturally low, and splits into two distinct causes

Across the 10 non-hard-case sample Issues, existing content maps onto roughly **2–5 of the 12 required contract fields** per Issue, never more. Two distinct, non-overlapping reasons explain this — worth separating so a future false-positive/false-negative discussion doesn't conflate them:

1. **Fields no prior template ever asked for.** `intent_label`, `pr_class`, `head_branch`, and `base_branch` are present in essentially none of the sample (one partial exception: #2593 states an explicit `Pull Request Base`). This is not a defect in historical Issues — these are genuinely new concepts the contract introduces. Every Issue written before the contract shipped will show 0% completeness on these fields by construction.
2. **Fields that describe post-implementation facts, not pre-work facts.** `verification_results` and `follow_up_required` describe what actually happened, which cannot exist in an Issue written *before* implementation starts. These fields are structurally unfillable at Issue-authoring time regardless of how complete the Issue otherwise is — a limitation of retrofitting the contract onto Issues written for the old workflow, not a defect in the contract or the historical Issues.

Fields with comparatively higher historical presence (`purpose`/objective, `allowed_paths`/allowlist, `rollback_summary`) are the ones that already existed as PMO-intake concepts under different section names before #2618.

Two clear gap-class Issues (#2101, #2047, and their sibling #1706) — pre-#2495/#2500 legacy-template Issues with no Delivery Model field at all — score lowest (~2/12), consistent with #2500's own premise that Delivery System v1 (closed #2495–#2500) is what introduced most of the stable-field vocabulary the contract now formalizes.

### Finding 4 — One real ambiguous-value hard case found

#2694's `Delivery Model` field reads *"Model A unless implementation proves materially larger than one reviewable PR"* — a conditional English sentence, not one of the enum values `delivery_profile.mjs`'s classifier expects. This is a genuine edge case for a future author trying to write a real contract block from this kind of Issue, not a parser defect (the contract's `delivery_model` field is `source: 'reuse'`, sourced from the Issue's own PMO-intake block by `delivery_profile.mjs`, not written fresh inside the contract block itself).

## Phase 2 — Live advisory validation

### Finding 5 — `issues: [labeled]` and other non-PR-event triggers never fired automatically, because the workflow files were never promoted to `main`

Applying `status:pr-ready` to a real Issue (#2948) produced **no comment and no workflow run** — confirmed by checking `actions_list.list_workflow_runs` and `actions_list.list_workflows`: `issue-pr-contract-validate.yml` and `ops-agent-routing-controller.yml` do not exist on `main` (`git ls-tree origin/main` returns nothing for either path), and GitHub only evaluates non-PR-event triggers (`issues`, `issue_comment`, `workflow_run`, and — critically — the REST `workflows/{id}/dispatches` **filename**-addressed endpoint) from the workflow file version on the repository's **default branch**. `pull_request`-triggered jobs on these same workflows (e.g. `Evaluate routing state`) run fine from a component branch because GitHub evaluates `pull_request` workflow definitions from the PR's own branch — a different, PR-specific resolution path.

Practical consequence discovered live: dispatching `issue-pr-contract-validate.yml` or `ops-agent-routing-controller.yml` by **filename** via the REST API 404s (`POST .../workflows/issue-pr-contract-validate.yml/dispatches` → `404 Not Found`) for the same reason, even though `workflow_dispatch` is exactly the mechanism #2620/#2621 built as the safe, explicit-only trigger path. Dispatching by the workflow's **numeric ID** instead (resolved from any prior run, e.g. `315553856` for `ops-agent-routing-controller.yml`) works once the workflow has any run history — this is how the Phase 3 exercise below was actually fired. This is a real, previously-undocumented operability gap: an operator following `docs/how-to/agents/operate-agent-routing.md` §7 literally (`gh workflow run ops-agent-routing-controller.yml` or the GitHub web UI's "Run workflow" dropdown, both filename/default-branch-resolved) would hit the same 404 today.

**This means #2620 has *not* actually been "live and automatic" on `status:pr-ready` at any point since it merged** — a correction to what this report and `docs/reference/ci/issue-pr-contract.md` previously claimed. It has only ever been reachable via numeric-ID `workflow_dispatch`. Promoting these workflow files to `main` (a decision with its own, separate risk profile, since `main` is production-protected) is a precondition for genuine automatic operation, not merely a nice-to-have.

### Live evaluation result (Phase 2 real evidence)

One real, live evaluation occurred as part of the Phase 3 exercise below (the `create-draft-pr` job's "Evaluate #2620 contract request" step runs the same validator #2620 uses). First attempt (contract rev 1) reported `delivery_profile_invalid` (see Finding 6). Second attempt (contract rev 2, corrected) reported **`valid`** — confirmed by the upserted `lgfc-issue-pr-contract-status:v1:valid:rev=2` comment on Issue #2948. Zero false positives, one true positive (correctly caught a real field-format defect), one true negative (correctly validated the corrected contract).

## Phase 3 — Controlled draft-PR pilot

**Executed, authorized by Bill on #2622, on 2026-07-29.** Candidate: pilot Issue #2948 (`cursor/2622-phase3-pilot` → `component/issue-contract-draft-pr`, a self-contained one-line diff to this report), proposed on #2622 and confirmed before any mutation.

### Finding 6 — Real Issues' common `Delivery model: Model B child` phrasing fails `delivery_profile.mjs`'s strict classifier

The first live dispatch (contract rev 1) failed with `delivery_profile_invalid`: `Delivery model must be one of: A, B-child, B-promotion, emergency-recovery` — because the PMO intake block read `Delivery model: Model B child`, not the literal `B-child` the classifier (`scripts/ci/delivery_profile.mjs`'s `DELIVERY_MODELS`) requires exactly. This is not a one-off authoring mistake: **real Issues #2495, #2500, and #2593 in this report's own Phase 1 sample all write `Delivery Model: Model B child` the same way.** Any of them, used as a real contract's `reuse` source today, would hit the identical failure. Fixed live by correcting the pilot Issue's PMO intake to the literal `B-child` (contract rev 2) — the same convention already used correctly throughout every PR body in this program (`docs/governance/PR_PROCESS.md`'s stable-facts template). This is a genuine false-negative-shaped risk for real-world adoption: authors following the Issue-side PMO-intake convention they already know will predictably fail delivery-profile classification on a wording mismatch that has nothing to do with the actual delivery model being wrong.

### Finding 7 (the headline finding, corrected 2026-07-29 post-merge) — downstream `pull_request` gates DID fire, and found the generated PR body genuinely fails shared hygiene validation

**This finding replaces the version merged in PR #2950, which incorrectly claimed zero downstream gates fired. That claim was factually wrong, not merely miscounted — see the correction notice above.**

The corrected rev-2 dispatch succeeded end-to-end: `ops-agent-routing-controller.yml`'s `create-draft-pr` job (run [30479476694](https://github.com/wdhunter645/next-starter-template/actions/runs/30479476694)) evaluated the contract as `valid`, planned `create_draft_pr`, re-validated live state immediately before mutating, and opened **PR #2949** (titled `Draft: source Issue #2948`, created `2026-07-29T18:22:00Z`, head `cursor/2622-phase3-pilot`) — exactly one PR, and it correctly updated the existing `lgfc-issue-pr-contract-status:v1` comment on #2948 with the PR URL rather than creating a second comment (requirement 7 confirmed). GitHub's API reports `draft: false` on this PR in its final (closed) state; this report does not have evidence the object was ever in GitHub's native draft state, and describes it only as "PR #2949" (its "Draft: …" prefix is title text, not a claim about the `draft` flag).

**PR #2949's actual, complete check-run history — re-pulled after the ADJUSTMENT, not just the state immediately after creation — shows two distinct waves of activity:**

1. **An initial wave, ~18:22:03–18:22:46Z (3–46 seconds after creation):** `semgrep-cloud-platform/scan` (third-party App integration), plus `pr-hygiene` and `diff-scope` (both `pull_request`-triggered, both concluded `success` at the check-run level per this repo's advisory/non-blocking convention, but **both posted real findings**, at `2026-07-29T18:22:42Z`):
   - `pr-hygiene` (comment [5121876059](https://github.com/wdhunter645/next-starter-template/pull/2949#issuecomment-5121876059)): missing stable `Intent label:` and `PR class:` values; missing every required stable PR-template section (`PR Summary`, `Scope`, `Change Summary`, `Verification`, `Acceptance Criteria`, `Reviewer / Bot Review Attestation`); missing/empty `Allowed paths:` list; and the one changed file (`docs/ops/reports/issue-pr-contract-pilot-evidence.md`) not covered by any declared allowlist.
   - `diff-scope` (comment [5121876172](https://github.com/wdhunter645/next-starter-template/pull/2949#issuecomment-5121876172)): same missing/empty `Allowed paths:` list and the same changed file flagged as outside declared scope.
   - (`quality` and `Cloudflare Pages` check runs that appear in the run list predate PR creation — `18:13:46Z` and `18:15:15Z` respectively — and were triggered by the earlier branch `push`, not by this PR's `pull_request` event.)
2. **A second, broader wave, ~18:24:15–18:24:33Z (roughly two minutes later):** `component-child-integration`, `cursor-review`, `check-design-authority`, `validate-diataxis-authority`, `reviewer-response-completion`, `quality` (PR-triggered rerun), `gitleaks`, `copilot-pull-request-reviewer`, and reruns of `pr-hygiene`/`diff-scope`, all concluding `success`. A DIATAXIS folder-hygiene advisory also fired in this wave (comment [5121894664](https://github.com/wdhunter645/next-starter-template/pull/2949#issuecomment-5121894664)), flagging the same changed report path as outside the four approved DIATAXIS content folders — the same standing, repo-wide, non-blocking advisory this file's own location note (above) already documents.
   - One check in this wave, native GitHub check **"Component Integration Eligibility"** (`component-child-integration`'s underlying eligibility check), concluded **`failure`** — the only hard failure observed anywhere in the pilot. Its output lists the generated PR body as missing essentially every stable metadata field auto-integration requires: `invalid_delivery_model`, `invalid_gate_profile`, `missing_component_branch`, `missing_component_master`, `missing_size`, `missing_deliveryModel`, `missing_changeMode`, `missing_targetEnvironment`, `missing_approvalProfile`, `missing_gateProfile`, `missing_rollbackProfile`, plus two `pending_check` entries for `gitleaks`/`quality` (timing artifacts of the check racing its own prerequisites, not separate defects).

**Corrected conclusion:** the earlier claim that the `GITHUB_TOKEN`-authored draft suppressed downstream `pull_request` workflows is not supported by this PR's actual history — `pr-hygiene`, `diff-scope`, and the rest of the suite ran, in two waves, well within minutes of creation. What the evidence *does* show, directly and for the first time with real findings rather than a documented risk: the **CREATE_DRAFT_PR-generated PR body itself does not satisfy #2622's acceptance criterion "every generated PR body passes shared hygiene validation before creation."** It is missing every stable template section and metadata field the repository's PR-process convention (`docs/governance/PR_PROCESS.md`) requires, and its one changed file falls outside its own (missing) declared allowlist. Acceptance criterion *"Downstream PR workflows trigger successfully under the selected authentication model"* — **met** (they did trigger); acceptance criterion on generated-body hygiene — **not met**, a measured pilot failure, not an unmeasured or passing result.

### Other Phase 3 acceptance-criteria evidence

- No duplicate PR was created across the two dispatch attempts (confirmed via `search_pull_requests` for `head:cursor/2622-phase3-pilot` — exactly one result, #2949).
- No unauthorized mutation, automatic approval, or path toward `main` occurred at any point (`base_branch: component/issue-contract-draft-pr` throughout; `production_main_boundary` guard never triggered because it was never approached).
- Pilot cleanup: Issue #2948 and PR #2949 closed. Branch `cursor/2622-phase3-pilot` remains on origin as of this correction (2026-07-29) — this session's git credentials received a `403` on `git push origin --delete`, so it was left for manual deletion rather than actually removed, correcting an earlier claim in this same report that it had already been deleted. No shared or production state was touched by leaving it in place.

`docs/how-to/agents/operate-agent-routing.md` §7 needs a follow-up correction: its `gh workflow run` / web-UI instructions will 404 today per Finding 5, until either the workflow is promoted to `main` or the guidance is updated to the numeric-workflow-ID dispatch path actually used here.

## Required metrics (from #2622) — current values

| Metric | Value | Source |
| --- | --- | --- |
| Issues evaluated (historical dry run) | 12 | Phase 1 |
| Issues evaluated (live) | 1 (#2948, 2 attempts: rev 1 invalid, rev 2 valid) | Phase 2/3 |
| Contracts complete on first attempt | 0 of 1 live attempt (rev 1 failed `delivery_profile_invalid`; rev 2 corrected and passed) | Phase 3, Finding 6 |
| Contracts requiring correction | 1 of 1 live contract (the pilot's own, corrected live) | Phase 3, Finding 6 |
| Missing-field frequency by field | see Finding 3 (historical); Finding 6 (live: `delivery_model` value-format mismatch) | Phase 1/3 |
| Unauthorized/ambiguous contract attempts | 0 | Phase 1/2/3 (none observed) |
| Branch missing / no-diff frequency | 0/1 live attempt — real branch, real diff, correctly detected both | Phase 3 |
| Duplicate PR attempts prevented | 0 needed — exactly one PR (#2949) resulted from two dispatch attempts against the same Issue; guard logic additionally unit-tested in #2621 | Phase 3 |
| Generated PR bodies passing hygiene on first render | **0/1 — PR #2949 failed `pr-hygiene`/`diff-scope`/component-integration-eligibility validation** (missing template sections, missing intent/class fields, missing/empty Allowed paths, changed file outside allowlist) | Phase 3, corrected Finding 7 |
| Generated PRs whose actual diff exceeds allowlist | 0/1 — diff was exactly the declared one-line change | Phase 3 |
| Validation false positives | 0 observed (12/12 historical `contract_missing` correct; live rev 1's `delivery_profile_invalid` was a true positive, not a false one) | Phase 1/3 |
| Validation false negatives discovered later | none discovered | Phase 1/2/3 |
| Mean number of Issue correction cycles | 1 (the live pilot contract needed exactly one correction: rev 1 → rev 2) | Phase 3 |
| Post-merge clerical exceptions attributable to fields covered by the new contract | see comparison below | Phase 1 vs. #2592 |
| Comparison against the #2592 post-merge audit baseline | see below | #2592 (closed 2026-07-22) |
| Downstream PR-triggered workflows firing on a `CREATE_DRAFT_PR`-opened PR | **All of the observed gates fired, in two waves** (`pr-hygiene`, `diff-scope`, `gitleaks`, `quality`, `component-child-integration`, `cursor-review`, `check-design-authority`, `validate-diataxis-authority`, `reviewer-response-completion`, plus the native `Component Integration Eligibility` check, which failed) — corrected from PR #2950's erroneous "0 of 8" claim | Phase 3, corrected Finding 7 |

## Comparison against the #2592 baseline

#2592's accepted final report (issue comments, 2026-07-22) found, for the 27 `main` PRs merged after cutoff PR #2538: **19/27 (70.4%) produced at least one post-merge closeout exception**, dominated by `unchecked_acceptance_criterion` (≥5 PRs), `multiple_source_issues` (4 PRs), `undispositioned_reviewer_comment` (3+ PRs), `missing_allowlist` (3 PRs), `diataxis_required_structure_missing` (3 PRs), `missing_verification_commands` (2 PRs), and `forbidden_placeholder_token` (2+ PRs).

**Honest assessment of overlap — partial, not comprehensive:** the Issue-side contract (#2618–#2622) validates a *different* surface than most of #2592's dominant failure classes. It runs **before a PR exists**, checking Issue-side facts (contract completeness, branch/diff state, actor authorization). Most of #2592's top failure classes are **PR-body-side** facts discovered by the existing `pr-hygiene`/`post_merge_implementation_evidence` surfaces *after* a PR is already open — a different pipeline stage this contract does not touch.

Mapping the two field sets:

- **Plausibly reduced by this contract, if adopted:** `missing_allowlist` (maps to the contract's required `allowed_paths`), `missing_verification_commands` (maps to `verification_commands`) — 5 of #2592's 19 affected PRs cite one of these two codes as a primary or secondary factor.
- **Not addressed by this contract at all:** `multiple_source_issues`, `undispositioned_reviewer_comment`, `diataxis_required_structure_missing`, `forbidden_placeholder_token`, `unchecked_acceptance_criterion` (the single largest class) — these are PR-body/reviewer/docs-structure facts with no analog in the Issue-side contract's field list.

**Conclusion:** even at 100% hypothetical adoption, this contract would not have prevented the majority of #2592's observed exceptions. It targets a real but narrower slice (Issue-side pre-flight, roughly 2 of 11 normalized error codes from #2592's taxonomy) than the full post-merge exception surface. This bounds expectations for Phase 4's promotion decision — the contract's value case rests on the Issue-side failure modes it uniquely prevents (`contract_missing`, `contract_marker_version_unsupported`, `contract_unauthorized_trigger`, `branch_missing`, `diff_empty`, `pr_already_exists`, `base_head_invalid`), not on reducing #2592's headline 70.4% rate broadly.

## Evidence limitations

- All Phase 1 numbers come from a manually curated 12-Issue sample plus one repository-wide marker search, not an exhaustive census of every open/closed Issue.
- Phase 2/3's live evidence is from exactly **one** pilot Issue/branch/PR cycle, not the "representative sample" or "bounded set of non-production tasks" (plural) #2622 envisions. It is real, not synthetic, but it is a single data point — a false-positive/false-negative rate cannot be statistically estimated from n=1. A second or third pilot cycle against a different real, low-stakes task would materially strengthen Phase 4 confidence.
- The retrospective field-completeness review (Finding 3) is a heuristic manual read, not machine-verified against a formal schema — a future pass could formalize it as an additional dry-run harness mode if more rigor is wanted.
- Finding 5 (workflow files absent from `main`) was discovered as a side effect of running Phase 3, not from a systematic audit of every OPS workflow's default-branch presence — other component-branch-only workflows in this repository may have the same latent gap.

<!-- lgfc-issue-pr-contract-pilot-marker: this line is the deliberate one-line diff for #2622's corrected Phase 3 CREATE_DRAFT_PR live exercise rerun (rev 2, post PR #2952/#2953), on pilot Issue #2948. Safe to remove after the pilot artifacts (Issue, branch, draft PR) are closed and their results are recorded above. -->
