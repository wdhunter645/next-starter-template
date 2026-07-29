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

## Recommendation: remain advisory (option 1), with Phase 3 pilot authorization as the next concrete step

### Why not "enable draft-PR creation" yet (options 2/3)

1. **Zero live adoption to validate against.** Phase 1/2 evidence (pilot report) found no real Issue has ever used the `lgfc-issue-pr-contract:v1` marker. Enabling automatic draft-PR creation before any real Issue has passed live advisory validation would skip the exact measurement step (Phase 2) #2622 exists to require.
2. **A known, unresolved downstream-workflow gap.** #2621 documented that `CREATE_DRAFT_PR` uses the default `GITHUB_TOKEN`, so PRs it opens do not automatically trigger other `pull_request`-workflows (`pr-hygiene`, `diff-scope`, required checks) — a GitHub anti-recursion behavior, not a bug in this implementation. Enabling any automatic/repo-wide trigger before this is resolved (via a GitHub App installation token, per #2621 requirement 10, still unevaluated) would create draft PRs that silently skip the very gates #2622's acceptance criteria require ("Downstream PR workflows trigger successfully under the selected authentication model").
3. **Partial overlap with the #2592 baseline.** The pilot report's comparison found this contract targets a narrower failure surface than #2592's dominant post-merge exception classes (`unchecked_acceptance_criterion`, `multiple_source_issues`, reviewer-disposition, and docs-structure issues are all out of scope for this contract). The value case is real but bounded — not yet evidence for repo-wide enablement.

### Why not halt (option 4)

1. **The mechanism works correctly on every test performed.** 0 false positives across 12 real historical Issues (including a deliberate marker-ambiguity hard case), 0 false positives/negatives in 129 targeted unit/integration tests (#2618-#2621 combined suites), and the expected-state/fail-closed guards (drift detection, actor re-authorization, existing-PR reconciliation, `main`-boundary enforcement — independently re-checked in three separate places: `evaluateIssuePrContractRequest`, `planCreateDraftPr`, and `validateMutation`) all behave as designed under test.
2. **No safety incident, unauthorized mutation, or `main`-boundary risk has occurred or was found possible** in any review to date (three independent governance/Copilot review rounds on #2618-#2621, all findings resolved).
3. Halting would discard working, tested infrastructure over a measurement gap (no live traffic yet), not a defect.

### Recommended next concrete step (not authorized by this document — requires separate sign-off)

Execute #2622 Phase 3 exactly as scoped: select one bounded, real, non-production task with an existing branch and a real diff; author its Issue with a real `lgfc-issue-pr-contract:v1` block; apply `status:pr-ready` and confirm #2620's live advisory validation passes; then, with Bill/ChatGPT's explicit per-trigger authorization, run `ops-agent-routing-controller.yml`'s `workflow_dispatch` (`mode: advance`, `authorize_mutation: true`, the Issue's number) to exercise `CREATE_DRAFT_PR` end-to-end against a real GitHub API, confirming: no duplicate PR, correct comment update with the PR URL, and (separately) whether downstream `pull_request` workflows do or do not fire, to get a live measurement of the `GITHUB_TOKEN` limitation's actual impact rather than the current theoretical one.

## Decision matrix (for ChatGPT/Bill)

| Option | Recommended? | Condition to select instead |
| --- | --- | --- |
| 1. Remain advisory | **Yes — current recommendation** | — |
| 2. Enable draft-PR creation for approved classes only | Not yet | After a successful, authorized Phase 3 live trigger with downstream-workflow evidence resolved (installation token or accepted manual-retrigger workaround documented) |
| 3. Enable repo-wide draft-PR creation | Not yet | After option 2 has run for a measurable period with a low false-positive rate, per #2622 Phase 4's own sequencing |
| 4. Halt and remediate | No — no defect found | Only if a future finding shows an actual safety gap, not a measurement gap |

## Stricter pre-gate enforcement

Out of scope for this decision. #2622's own text and this document agree: *"Stricter PR gates require their own evidence-backed promotion decision under `docs/governance/PR_PROCESS.md`"* — not addressed here.
