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

**In progress — Phases 1 and 2 evidence collected; Phase 3 (controlled draft-PR pilot) awaits explicit per-trigger human/ChatGPT authorization, per #2622's own required work item 3.** This report does not authorize enabling draft-PR creation beyond what #2621 already shipped (explicit `workflow_dispatch` only). The promotion decision itself is a separate document: `docs/reference/ci/issue-pr-contract-promotion-decision.md`.

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

`issue-pr-contract-validate.yml` (#2620) has been live and automatic on `status:pr-ready` since it merged. As of this report, **zero real-world label-triggered evaluations have occurred** (confirmed by the same zero-adoption finding in Phase 1 — no Issue has applied the marker, so none has applied `status:pr-ready` with a contract block present either). This is an honest, expected limitation, not a gap in the pilot's execution: live advisory evidence accumulates only as real Issues opt in, which requires either an authoring convention change (out of #2622's scope) or a deliberate pilot trigger.

No false positives or false negatives can yet be measured from real traffic. The 41-test suite in `tests/issue-pr-contract-workflow.test.mjs` plus the fixture-based dry run above are the only current evidence for validator correctness; both are synthetic/historical, not live.

## Phase 3 — Controlled draft-PR pilot

**Not executed in this pass.** #2622's own text requires *"human/ChatGPT authorization for each pilot trigger"* for this phase, and #2621's `CREATE_DRAFT_PR` action is reachable only via explicit, authorized `workflow_dispatch` — by design, nothing in this pilot may fire it without that per-trigger sign-off. Firing a live, authorized `CREATE_DRAFT_PR` run against a real bounded non-production task is the next concrete step once Bill/ChatGPT selects a candidate task and authorizes the trigger; this report does not select one unilaterally.

`docs/how-to/agents/operate-agent-routing.md` §7 (added by #2621) already documents the exact operator steps for running this trigger when authorized.

## Required metrics (from #2622) — current values

| Metric | Value | Source |
| --- | --- | --- |
| Issues evaluated (historical dry run) | 12 | Phase 1 |
| Contracts complete on first attempt | 0 | Phase 1 (no real Issue has a contract block yet) |
| Contracts requiring correction | not applicable | no live contract exists to correct |
| Missing-field frequency by field | see Finding 3 | Phase 1 (retrospective heuristic, not literal contract parsing) |
| Unauthorized/ambiguous contract attempts | 0 | Phase 1/2 (none observed) |
| Branch missing / no-diff frequency | not measured | no `liveState` gathered for historical dry run (no real branches to check against) |
| Duplicate PR attempts prevented | 0 observed | no live trigger has occurred yet; guard logic itself is unit-tested in #2621 (`tests/agent-routing/create-draft-pr-action.test.mjs`) |
| Generated PR bodies passing hygiene on first render | not applicable | no PR generated yet |
| Generated PRs whose actual diff exceeds allowlist | not applicable | no PR generated yet |
| Validation false positives | 0 observed (12/12 correctly `contract_missing`, including the #2615 hard case) | Phase 1 |
| Validation false negatives discovered later | none discovered — nothing has been marked valid yet to falsify | Phase 1/2 |
| Mean number of Issue correction cycles | not applicable | no live contract has been authored and iterated yet |
| Post-merge clerical exceptions attributable to fields covered by the new contract | see comparison below | Phase 1 vs. #2592 |
| Comparison against the #2592 post-merge audit baseline | see below | #2592 (closed 2026-07-22) |

## Comparison against the #2592 baseline

#2592's accepted final report (issue comments, 2026-07-22) found, for the 27 `main` PRs merged after cutoff PR #2538: **19/27 (70.4%) produced at least one post-merge closeout exception**, dominated by `unchecked_acceptance_criterion` (≥5 PRs), `multiple_source_issues` (4 PRs), `undispositioned_reviewer_comment` (3+ PRs), `missing_allowlist` (3 PRs), `diataxis_required_structure_missing` (3 PRs), `missing_verification_commands` (2 PRs), and `forbidden_placeholder_token` (2+ PRs).

**Honest assessment of overlap — partial, not comprehensive:** the Issue-side contract (#2618–#2622) validates a *different* surface than most of #2592's dominant failure classes. It runs **before a PR exists**, checking Issue-side facts (contract completeness, branch/diff state, actor authorization). Most of #2592's top failure classes are **PR-body-side** facts discovered by the existing `pr-hygiene`/`post_merge_implementation_evidence` surfaces *after* a PR is already open — a different pipeline stage this contract does not touch.

Mapping the two field sets:

- **Plausibly reduced by this contract, if adopted:** `missing_allowlist` (maps to the contract's required `allowed_paths`), `missing_verification_commands` (maps to `verification_commands`) — 5 of #2592's 19 affected PRs cite one of these two codes as a primary or secondary factor.
- **Not addressed by this contract at all:** `multiple_source_issues`, `undispositioned_reviewer_comment`, `diataxis_required_structure_missing`, `forbidden_placeholder_token`, `unchecked_acceptance_criterion` (the single largest class) — these are PR-body/reviewer/docs-structure facts with no analog in the Issue-side contract's field list.

**Conclusion:** even at 100% hypothetical adoption, this contract would not have prevented the majority of #2592's observed exceptions. It targets a real but narrower slice (Issue-side pre-flight, roughly 2 of 11 normalized error codes from #2592's taxonomy) than the full post-merge exception surface. This bounds expectations for Phase 4's promotion decision — the contract's value case rests on the Issue-side failure modes it uniquely prevents (`contract_missing`, `contract_marker_version_unsupported`, `contract_unauthorized_trigger`, `branch_missing`, `diff_empty`, `pr_already_exists`, `base_head_invalid`), not on reducing #2592's headline 70.4% rate broadly.

## Evidence limitations

- All Phase 1/2 numbers come from a manually curated 12-Issue sample plus one repository-wide marker search, not an exhaustive census of every open/closed Issue.
- No live, authorized Phase 3 trigger has occurred; Phase 3 metrics are all "not applicable — not yet executed," not zero-with-confidence.
- The retrospective field-completeness review (Finding 3) is a heuristic manual read, not machine-verified against a formal schema — a future pass could formalize it as an additional dry-run harness mode if more rigor is wanted.

<!-- lgfc-issue-pr-contract-pilot-marker: this line is the deliberate one-line diff for #2622's authorized Phase 3 CREATE_DRAFT_PR live exercise. Safe to remove after the pilot artifacts (Issue, branch, draft PR) are closed and their results are recorded above. -->
