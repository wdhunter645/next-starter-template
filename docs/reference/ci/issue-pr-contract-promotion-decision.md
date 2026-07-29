---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: The #2622 promotion recommendation for the Issue-PR-contract mechanism (#2615/#2618-#2622) — advisory, limited enablement, repo-wide enablement, or halt
Does Not Own: The evidence itself (`docs/ops/reports/issue-pr-contract-pilot-evidence.md`), the contract design (`docs/reference/ci/issue-pr-contract.md`), the #2294 controller contract (`docs/reference/ci/agent-routing-controller-contract.md`), or actual enactment of the decision (a separate authorized change)
Canonical Reference: /docs/ops/reports/issue-pr-contract-pilot-evidence.md
Related Issues: #2622, #2615, #2618, #2619, #2620, #2621, #2592
Last Reviewed: 2026-07-29
---

# Issue-PR-Contract Promotion Decision (#2622)

## Decision authority

Per #2622's own text: *"Future Execution Agent: Cursor Local for technical evidence; ChatGPT / Bill for promotion decision."* This document is the **recommendation package** built from that technical evidence (`docs/ops/reports/issue-pr-contract-pilot-evidence.md`). It does not itself enact a decision — the four options below are presented for ChatGPT/Bill's selection, consistent with #2622's acceptance criterion *"the final recommendation explicitly selects advisory, limited enablement, repo-wide enablement, or halt."*

## Recommendation: remain advisory (option 1) — now backed by a real, executed Phase 3 pilot, not just the theoretical case

**Update (2026-07-29, post-pilot):** the Phase 3 live exercise authorized by Bill on #2622 executed successfully (pilot Issue #2948 → draft PR #2949; full results in the pilot evidence report). The mechanism works correctly end-to-end. But the pilot's own results — not just documentation — now confirm two of this recommendation's original concerns and surface one new one, all strengthening rather than weakening the case to remain advisory for now.

### Why not "enable draft-PR creation" yet (options 2/3)

1. **The downstream-workflow gap is no longer theoretical — it is confirmed.** The pilot's draft PR #2949 triggered **zero** of the 8 `pull_request`-gated checks that fire on every other PR in this program (`pr-hygiene`, `diff-scope`, `gitleaks`, `quality`, `component-child-integration`, `cursor-review`, `check-design-authority`, `validate-diataxis-authority`, `reviewer-response-completion`). This was previously a documented risk from #2621; it is now a directly observed fact. Enabling any automatic/repo-wide trigger before this is resolved (via a GitHub App installation token, per #2621 requirement 10, still unevaluated) would silently ship PRs that skip every quality gate this repository otherwise enforces.
2. **A newly discovered, more fundamental gap: the workflows were never promoted to `main`.** GitHub only evaluates non-PR-event triggers (`issues: [labeled]`, and the filename-addressed `workflow_dispatch` REST endpoint) from the workflow file version on the *default branch*. Neither `issue-pr-contract-validate.yml` nor `ops-agent-routing-controller.yml` exists on `main`, so `status:pr-ready` has never actually triggered #2620's validator automatically at any point since it merged, and the documented `workflow_dispatch` operator path (`docs/how-to/agents/operate-agent-routing.md` §7) 404s today for anyone following it literally — the pilot only worked because it used a less-discoverable numeric-workflow-ID dispatch path. This is a precondition gap, not a design flaw, but it means "promote to automatic" isn't a single decision — it first requires a separate `main`-promotion decision with its own risk profile, since `main` is production-protected.
3. **A real field-format defect was found and had to be corrected live.** The pilot's first attempt failed because `Delivery model: Model B child` (the phrasing real Issues #2495/#2500/#2593 already use) doesn't match the classifier's strict `B-child` literal. This is fixable (documentation or classifier normalization), but it is exactly the kind of adoption friction Phase 2's "false negatives" metric exists to catch, discovered from n=1.
4. **Partial overlap with the #2592 baseline**, unchanged from the original recommendation: this contract targets a narrower failure surface than #2592's dominant post-merge exception classes.

### Why not halt (option 4)

Unchanged: the mechanism behaves exactly as designed under both synthetic tests (129 targeted unit/integration tests) and now real live conditions (n=1 pilot: correct reject, correct accept after correction, correct single PR, correct comment upsert, correct `main`-boundary non-approach). Every finding above is a *precondition or environment* gap (promotion, token type, one wording mismatch), not a defect in the mechanism's own logic. Halting would discard working, verified infrastructure over fixable preconditions.

### Recommended next concrete steps (not authorized by this document — requires separate sign-off)

1. Decide whether to promote `issue-pr-contract-validate.yml` and `ops-agent-routing-controller.yml` to `main` — a prerequisite for any genuine automatic operation, and its own risk decision independent of the draft-PR-creation question.
2. Resolve the `GITHUB_TOKEN` downstream-workflow gap (adopt a GitHub App installation token, or formally accept the manual-retrigger workaround) before any option beyond "advisory."
3. Either normalize `delivery_profile.mjs`'s classifier to accept the `Model B child`-style phrasing already used throughout real Issues, or update `docs/reference/ci/issue-pr-contract.md` §2 to explicitly instruct authors to use the strict `B-child` literal.
4. If more Phase 2/3 confidence is wanted before revisiting this decision, run one or two more authorized live pilot cycles against different real, low-stakes tasks — n=1 is a real signal, not yet a rate.

## Decision matrix (for ChatGPT/Bill)

| Option | Recommended? | Condition to select instead |
| --- | --- | --- |
| 1. Remain advisory | **Yes — current recommendation, now evidence-backed by a real pilot** | — |
| 2. Enable draft-PR creation for approved classes only | Not yet | After the `main`-promotion decision, the `GITHUB_TOKEN`/installation-token gap, and the `delivery_model` format mismatch are all resolved |
| 3. Enable repo-wide draft-PR creation | Not yet | After option 2 has run for a measurable period with a low false-positive rate, per #2622 Phase 4's own sequencing |
| 4. Halt and remediate | No — no defect found, only fixable preconditions | Only if a future finding shows an actual safety gap, not a precondition gap |

## Stricter pre-gate enforcement

Out of scope for this decision. #2622's own text and this document agree: *"Stricter PR gates require their own evidence-backed promotion decision under `docs/governance/PR_PROCESS.md`"* — not addressed here.
