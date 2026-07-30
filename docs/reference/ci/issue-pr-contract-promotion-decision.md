---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: The #2622 promotion recommendation for the Issue-PR-contract mechanism (#2615/#2618-#2622) — advisory, limited enablement, repo-wide enablement, or halt
Does Not Own: The evidence itself (`docs/ops/reports/issue-pr-contract-pilot-evidence.md`), the contract design (`docs/reference/ci/issue-pr-contract.md`), the #2294 controller contract (`docs/reference/ci/agent-routing-controller-contract.md`), or actual enactment of the decision (a separate authorized change)
Canonical Reference: /docs/ops/reports/issue-pr-contract-pilot-evidence.md
Related Issues: #2622, #2615, #2618, #2619, #2620, #2621, #2592, #2952, #2953, #2948
Last Reviewed: 2026-07-30
---

# Issue-PR-Contract Promotion Decision (#2622)

## Decision authority

Per #2622's own text: *"Future Execution Agent: Cursor Local for technical evidence; ChatGPT / Bill for promotion decision."* This document is the **recommendation package** built from that technical evidence (`docs/ops/reports/issue-pr-contract-pilot-evidence.md`). It does not itself enact a decision — the four options below are presented for ChatGPT/Bill's selection, consistent with #2622's acceptance criterion *"the final recommendation explicitly selects advisory, limited enablement, repo-wide enablement, or halt."*

## Recommendation: remain advisory (option 1) — the original hygiene gap is now fixed; a more fundamental gap replaces it as the reason

**Update (2026-07-30, corrected Phase 3 rerun after PRs #2952/#2953):** PRs #2952 and #2953 fixed the generated-PR-body defect this document originally cited (wired `buildDraftPrPlan` to the canonical `renderPrBody()`/`validateRenderedPrBody()` path, and closed two related fail-closed gaps in changed-file evidence handling). A second, corrected Phase 3 pilot cycle (pilot Issue #2948 rerun → PR #2954) confirms the fix: the generated PR body now passes `pr-hygiene`/`diff-scope` cleanly on first render — acceptance criterion *"every generated PR body passes shared hygiene validation before creation"* is **met** for the first time in this pilot program (`docs/ops/reports/issue-pr-contract-pilot-evidence.md`'s Finding 8).

That same rerun surfaced a new, more fundamental finding that supersedes the fixed hygiene gap as the reason to remain advisory: of 11 `pull_request`-triggered downstream workflow runs created when the PR opened, **9 were blocked at `action_required` and never executed** — only 2 (`pr-hygiene`, `diff-scope`) ran, and only because a third-party bot's incidental PR-body edit happened to match their `edited` trigger from a different, non-gated actor. **#2622 remains not closeable on the present evidence**, now because a hygiene-passing generated PR still would not get most of this repository's quality gates evaluated automatically, not because the generated body itself is broken.

**Update (2026-07-29, post-pilot, corrected same day after a post-merge ADJUSTMENT — historical, superseded by the above):** the Phase 3 live exercise authorized by Bill on #2622 executed (pilot Issue #2948 → PR #2949, titled "Draft: source Issue #2948"; full results in the pilot evidence report). The Issue-side contract validation, branch/diff detection, single-PR guarantee, and comment-upsert behavior all worked correctly end-to-end. But the generated PR body itself did **not** — it failed live `pr-hygiene`/`diff-scope`/component-integration-eligibility validation on real content, a measured acceptance-criterion failure, not an unmeasured or passing result. The pilot's own results — not just documentation — confirmed two of this recommendation's original concerns and surfaced one new one, all strengthening rather than weakening the case to remain advisory for now.

### Why not "enable draft-PR creation" yet (options 2/3)

1. **RESOLVED (2026-07-30): the generated-PR-body hygiene gap is fixed and confirmed fixed by a live rerun.** PRs #2952/#2953 wired `buildDraftPrPlan` to the canonical `renderPrBody()`/`validateRenderedPrBody()` path and closed two related fail-closed changed-file-evidence gaps. The corrected Phase 3 rerun (pilot Issue #2948 → PR #2954) confirms it: `pr-hygiene` and `diff-scope` both reported clean on first render (`docs/ops/reports/issue-pr-contract-pilot-evidence.md`'s Finding 8). This is no longer a blocker for options 2/3.
2. **NEW, and now the primary blocker (2026-07-30): most downstream `pull_request`-gated checks never actually evaluate a `CREATE_DRAFT_PR`-opened PR at all.** Of 11 `pull_request`-triggered workflow runs created when PR #2954 opened, 9 completed with conclusion `action_required` — created but never executed, pending manual "Approve and run." Only `pr-hygiene`/`diff-scope` ran, and only because a third-party bot's incidental PR-body edit happened to match their `edited` trigger from a different, non-gated actor — not because the mechanism reliably produces evaluated PRs. Enabling automatic/repo-wide draft-PR creation today would routinely open PRs that *look* clean (the two gates that do run report no defects) while `gitleaks`, `quality`, `cursor-review`, `reviewer-response-completion`, `component-child-integration`, `design-authority-check`, and `agent-governance` silently never ran at all — a materially riskier failure mode than a visibly-failing PR, because nothing on the PR itself signals that most of its gates were skipped.
3. **Still open: the workflows were never promoted to `main`.** GitHub only evaluates non-PR-event triggers (`issues: [labeled]`, and the filename-addressed `workflow_dispatch` REST endpoint) from the workflow file version on the *default branch*. Neither `issue-pr-contract-validate.yml` nor `ops-agent-routing-controller.yml` exists on `main`, so `status:pr-ready` has never actually triggered #2620's validator automatically at any point since it merged, and the documented `workflow_dispatch` operator path (`docs/how-to/agents/operate-agent-routing.md` §7) 404s today for anyone following it literally — both pilot cycles only worked because they used a less-discoverable numeric-workflow-ID dispatch path. This is a precondition gap, not a design flaw, but it means "promote to automatic" isn't a single decision — it first requires a separate `main`-promotion decision with its own risk profile, since `main` is production-protected.
4. **Still open: a real field-format defect was found and had to be corrected live.** The pilot's first attempt (cycle 1) failed because `Delivery model: Model B child` (the phrasing real Issues #2495/#2500/#2593 already use) doesn't match the classifier's strict `B-child` literal. This is fixable (documentation or classifier normalization), but it is exactly the kind of adoption friction Phase 2's "false negatives" metric exists to catch.
5. **Partial overlap with the #2592 baseline**, unchanged from the original recommendation: this contract targets a narrower failure surface than #2592's dominant post-merge exception classes.

### Why not halt (option 4)

Unchanged, and reinforced: the mechanism's validation, authorization, branch/diff-detection, single-PR-guarantee, and (as of the corrected rerun) body-generation logic all behave exactly as designed under both synthetic tests (135+ targeted unit/integration tests, including the new fail-closed regression tests from PR #2953) and real live conditions across two pilot cycles (correct reject, correct accept after correction, correct single PR each cycle, correct comment upsert each cycle, correct `main`-boundary non-approach, and now a correctly hygiene-passing generated body). No defect remains in content the mechanism itself controls. The one open blocker (Finding 8's `action_required` gating) is, on current evidence, a repository/organization Actions approval policy applied to the `github-actions[bot]` actor — external to this contract's own code, not a defect in `#2618`–`#2622`'s design or implementation. Halting would discard working, verified infrastructure over an external environment gap this pilot cannot itself remediate — but that gap, alongside the `main`-promotion decision and the one wording mismatch, must be resolved or explicitly accepted before any option beyond "advisory" is considered.

### Recommended next concrete steps (not authorized by this document — requires separate sign-off)

1. Investigate and decide on Finding 8's `action_required` gating: confirm the actual repository/organization Actions approval-workflow setting responsible (this pilot inferred it from the pattern but was not authorized to inspect or change repository/organization settings), and decide whether to grant approval-exempt status to the CREATE_DRAFT_PR mutation's actor, change the actor/token used for `pulls.create`, or accept manual approval as a permanent operational step. This is now the primary precondition for options 2/3 — a hygiene-passing generated body is no longer sufficient on its own if most gates never run against it.
2. Decide whether to promote `issue-pr-contract-validate.yml` and `ops-agent-routing-controller.yml` to `main` — a prerequisite for any genuine automatic operation, and its own risk decision independent of the draft-PR-creation question.
3. Either normalize `delivery_profile.mjs`'s classifier to accept the `Model B child`-style phrasing already used throughout real Issues, or update `docs/reference/ci/issue-pr-contract.md` §2 to explicitly instruct authors to use the strict `B-child` literal.
4. If more Phase 2/3 confidence is wanted before revisiting this decision, run one or two more authorized live pilot cycles against a *different* real, low-stakes task — both cycles so far share the same pilot Issue/branch, so Finding 8's generality is still n=1 at the task level.

## Decision matrix (for ChatGPT/Bill)

| Option | Recommended? | Condition to select instead |
| --- | --- | --- |
| 1. Remain advisory | **Yes — current recommendation; the original hygiene-template blocker is fixed, but the `action_required` downstream-gating finding is a new and more fundamental one** | — |
| 2. Enable draft-PR creation for approved classes only | Not yet | After the `action_required` gating is resolved (or a decision is made to accept it), the `main`-promotion decision, and the `delivery_model` format mismatch are all resolved. The body-template fix is already done. |
| 3. Enable repo-wide draft-PR creation | Not yet | After option 2 has run for a measurable period with a low false-positive rate, per #2622 Phase 4's own sequencing |
| 4. Halt and remediate | No — no safety defect found in the contract/controller/renderer's own logic; the remaining blocker is an external Actions approval-gating policy, not a design flaw | Only if a future finding shows an actual safety gap, not a fixable content/precondition/external-policy gap |

## Stricter pre-gate enforcement

Out of scope for this decision. #2622's own text and this document agree: *"Stricter PR gates require their own evidence-backed promotion decision under `docs/governance/PR_PROCESS.md`"* — not addressed here.
