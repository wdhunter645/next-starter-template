---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Issue #1906 Phase 1 post-merge closeout exception inventory, CI parity audit findings, and recommended implementation sequence
Does Not Own: Workflow implementation changes, branch protection settings UI, issue mutation, or post-merge self-healing program #1847
Canonical Reference: /docs/reference/ci/post-merge-validation-surface.md
Related Issues: #1906, #1847
Last Reviewed: 2026-06-21
---

# Post-Merge Exception Parity Audit — Issue #1906

## Purpose

This report records the Phase 1 audit required by source issue #1906. It inventories open post-merge closeout exception issues, classifies deterministic pre-merge blockers, maps current CI coverage, and recommends bounded implementation PRs.

No CI implementation changes are made by this report. Program #1847 remains the downstream post-merge self-healing owner; this report focuses on upstream prevention and parity.

## Scope and method

- Repository: `wdhunter645/next-starter-template`.
- Source issue: #1906.
- Audit generated: 2026-06-21T13:52:31.365Z.
- Data source: `gh issue list --state open --limit 2000` filtered to exact titles beginning `Post-merge closeout exception for PR #`, then each linked PR/source issue was inspected with `gh pr view` / `gh issue view`.
- Branch protection required-check status: unknown from live API; `gh api repos/{owner}/{repo}/branches/main/protection` returned HTTP 403 for this integration. Repository docs list intended required checks, but live protection state could not be verified.

## Current open exception queue totals

- Total open post-merge closeout exception issues: 54.

| Failure class | Count | Percent | Initial classification |
| --- | ---: | ---: | --- |
| `closeout_blocker_declared` | 21 | 38.9% | P1 deterministic pre-merge blocker |
| `source_issue_not_open` | 7 | 13.0% | P1 deterministic pre-merge blocker |
| `missing_required_section` | 3 | 5.6% | P1 deterministic pre-merge blocker |
| `missing_source_issue` | 3 | 5.6% | P1 deterministic pre-merge blocker |
| `active_alternate_program_lane` | 2 | 3.7% | P2 policy/queue decision |
| `closeout_exception` | 2 | 3.7% | P2 scenario/policy-dependent |
| `closeout_runtime_error` | 2 | 3.7% | P2 scenario/policy-dependent |
| `late_reviewer_finding` | 2 | 3.7% | P2 split by timestamp/authority |
| `multiple_source_issues` | 2 | 3.7% | P1 deterministic pre-merge blocker |
| `unchecked_acceptance_criterion` | 2 | 3.7% | P1 deterministic pre-merge blocker |
| `workflow_failure` | 2 | 3.7% | P1 deterministic pre-merge blocker |
| `allowlist_violation` | 1 | 1.9% | P1 deterministic pre-merge blocker |
| `invalid_source_issue_reference` | 1 | 1.9% | P1 deterministic pre-merge blocker |
| `late_undispositioned_reviewer_comment` | 1 | 1.9% | P2 split by timestamp/authority |
| `missing_allowlist` | 1 | 1.9% | P1 deterministic pre-merge blocker |
| `outdated_reviewer_thread_without_disposition` | 1 | 1.9% | P1 deterministic pre-merge blocker |
| `undispositioned_reviewer_comment` | 1 | 1.9% | P1 deterministic pre-merge blocker |

## Source issue state modes

| Source issue state mode | Count |
| --- | ---: |
| closed:COMPLETED | 31 |
| open | 15 |
| none | 8 |

## Repeated PR/source pairs

| PR/source pair | Exception count |
| --- | ---: |
| PR #1635 / source #1634 | 2 |
| PR #1828 / source #1725 | 2 |
| PR #1860 / source #1848 | 2 |
| PR #1889 / source #1853 | 2 |
| PR #1891 / source #1854 | 2 |

## Age buckets

| Age bucket | Count |
| --- | ---: |
| 0-1 days | 19 |
| 8-14 days | 17 |
| 2-3 days | 9 |
| 4-7 days | 9 |

## P1 deterministic blocker classes

The #1906 initial P1 list is confirmed, with two observed source-accounting variants added to the same deterministic family: `multiple_source_issues` and `invalid_source_issue_reference`. These are not scenario-dependent because a PR body with zero, invalid, or multiple primary source issues can be rejected before merge.

- PR body closeout readiness: `closeout_blocker_declared`, `missing_required_section`, `unchecked_acceptance_criterion`.
- Source issue accounting/state: `missing_source_issue`, `multiple_source_issues`, `invalid_source_issue_reference`, `source_issue_not_open`.
- File-touch allowlist evidence: `missing_allowlist`, `allowlist_violation`.
- Reviewer lifecycle parity: `undispositioned_reviewer_comment`, `outdated_reviewer_thread_without_disposition`.
- Required workflow parity: `workflow_failure` when the failed workflow is required for merge.

## Scenario-dependent classes for later analysis

- `late_undispositioned_reviewer_comment` and `late_reviewer_finding`: split by whether the trusted reviewer item existed before merge or truly arrived after merge.
- `closeout_runtime_error`: split infrastructure/runtime outage from PR-preparation defect.
- `closeout_exception`: decompose into deterministic subclasses before enforcement.
- `active_alternate_program_lane`: policy/queue ownership decision; do not block as a generic P1 class until governance defines the pre-merge authorization surface.

## CI coverage map

| Failure class | Existing pre-merge CI check | Workflow owner | Blocks merge now | Required by branch protection | Post-merge stricter? | Gap class | Recommended fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `closeout_blocker_declared` | No exact pre-merge blocker found | N/A | No | Unknown | Yes | missing CI | Add `blockerDeclarationFailures` parity to `gate-post-merge-readiness.yml` / `post_merge_readiness_gate.mjs`. |
| `missing_source_issue` | Yes | `ops-pr-issue-accounting.yml` (`pr-issue-accounting`) | Yes when workflow is required | Unknown | No for source accounting, but readiness gate does not include it | existing CI not-required/coverage split | Keep issue-accounting gate, and add source-accounting summary to readiness parity if needed. |
| `multiple_source_issues` | Yes | `ops-pr-issue-accounting.yml` (`pr-issue-accounting`) | Yes when workflow is required | Unknown | No for source accounting | existing CI not-required/coverage split | Treat with missing/invalid source issue in source-accounting implementation PR. |
| `invalid_source_issue_reference` | Yes | `ops-pr-issue-accounting.yml` (`pr-issue-accounting`) | Yes when workflow is required | Unknown | No for source accounting | existing CI not-required/coverage split | Treat with missing/multiple source issue in source-accounting implementation PR. |
| `source_issue_not_open` | Yes | `ops-pr-issue-accounting.yml` (`pr-issue-accounting`) | Yes when workflow is required | Unknown | No, except authorized closed-source remediation follow-up policy is post-merge-aware | existing CI weak/policy gap | Add explicit pre-merge authorized-exception contract for closed-source follow-ups. |
| `missing_allowlist` | Yes | `gate-post-merge-readiness.yml` (`post-merge-readiness`) via `implementationEvidenceFailures` | Yes when workflow is required | Unknown | No | existing CI not-required or stale PR-body timing | Make readiness gate required and add regression fixtures from exception examples. |
| `allowlist_violation` | Yes | `gate-post-merge-readiness.yml` (`post-merge-readiness`) and `gate-drift.yml` prefix gate | Yes when workflow is required | Unknown | No | existing CI not-required or timing gap | Keep in readiness gate; validate changed-file collection on PR events. |
| `missing_required_section` | Yes | `gate-post-merge-readiness.yml` (`post-merge-readiness`) via `preMergeReadinessBodyFailures` | Yes when workflow is required | Unknown | No | existing CI not-required or timing gap | Make readiness gate required and add historical invalid fixture tests. |
| `unchecked_acceptance_criterion` | Yes | `gate-post-merge-readiness.yml` (`post-merge-readiness`) via `acceptanceCriteriaFailures` | Yes when workflow is required | Unknown | No | existing CI not-required or timing gap | Make readiness gate required and add fixtures proving unchecked criteria fail. |
| `undispositioned_reviewer_comment` | Yes | `reviewer-response-completion.yml` and `gate-post-merge-readiness.yml` | Yes when workflow is required | Unknown | Mostly no, but timestamp handling differs | existing CI weak/not-required | Unify reviewer timestamp/head-SHA semantics and require the blocking check. |
| `outdated_reviewer_thread_without_disposition` | Yes | `reviewer-response-completion.yml` and `gate-post-merge-readiness.yml` | Yes when workflow is required | Unknown | Mostly no | existing CI weak/not-required | Add historical fixtures and ensure outdated threads require PR-body disposition before merge. |
| `workflow_failure` | Partial | Individual required workflows plus post-merge validator classification | Only if each workflow is required | Unknown | Yes | required-check audit missing | Create workflow required-check audit that compares post-merge required workflow failures to branch-protection required checks. |

## Recommended implementation PR sequence

1. Audit/report PR: add this Phase 1 report only. No CI behavior changes.
2. PR body closeout-readiness gate: cover `closeout_blocker_declared`, stale `Status: BLOCKED`, unresolved closeout exception wording, missing sections, and unchecked acceptance criteria in `post-merge-readiness`.
3. Source issue accounting/state gate: cover `missing_source_issue`, `multiple_source_issues`, `invalid_source_issue_reference`, and `source_issue_not_open`, including the explicit authorized closed-source remediation follow-up contract.
4. Reviewer lifecycle parity gate: cover `undispositioned_reviewer_comment`, `outdated_reviewer_thread_without_disposition`, and timestamp split for `late_undispositioned_reviewer_comment`.
5. Workflow required-check audit: compare post-merge `workflow_failure` classifications against intended/live branch-protection required checks; document the 403 API limitation or use a token with protection read permission.
6. Scenario decomposition PR: decompose `closeout_exception`, `closeout_runtime_error`, `late_reviewer_finding`, and `active_alternate_program_lane` into deterministic vs residual classes; keep true residual cases in #1847.
7. Burn-down validation PR/report: rerun this inventory after the P1 gates land and prove new PRs stop creating deterministic closeout exceptions.

## Full inventory

| Exception issue | PR | Source issue | Failure class | Closeout mode | Validator | Remediation | Workflow run | Created | Labels/state | PR merged date/SHA | Source state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#1904](https://github.com/wdhunter645/next-starter-template/issues/1904) | #1828 | #1725 | `late_reviewer_finding` | closed_remediation_followup | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27901792592) | 2026-06-21T10:43:59Z | post-merge-failure / OPEN | 2026-06-19T13:37:03Z / 3a844ae4b4d765c9d5f7dff3472f069d589e7008 | closed:COMPLETED |
| [#1903](https://github.com/wdhunter645/next-starter-template/issues/1903) | #1867 | #1813 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27901792606) | 2026-06-21T10:43:15Z | post-merge-failure / OPEN | 2026-06-21T10:43:02Z / 4c25726cf5fed1b5a57bfaccd2c65a043216331a | closed:COMPLETED |
| [#1902](https://github.com/wdhunter645/next-starter-template/issues/1902) | #1891 | #1854 | `undispositioned_reviewer_comment` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27901792592) | 2026-06-21T10:33:56Z | post-merge-failure / OPEN | 2026-06-20T22:51:16Z / db58bf229ef3a8a7d03cfca6d609e3a6df6b3756 | open |
| [#1901](https://github.com/wdhunter645/next-starter-template/issues/1901) | #1889 | #1853 | `outdated_reviewer_thread_without_disposition` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27901792592) | 2026-06-21T10:33:48Z | post-merge-failure / OPEN | 2026-06-20T22:50:18Z / 810db3262b4e21dd1b9373b629bda7b69599f45f | open |
| [#1900](https://github.com/wdhunter645/next-starter-template/issues/1900) | #1899 | #1847 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27901558394) | 2026-06-21T10:32:57Z | post-merge-failure / OPEN | 2026-06-21T10:32:39Z / 44527e7d536059b810defa8d2726936efd2d85df | open |
| [#1898](https://github.com/wdhunter645/next-starter-template/issues/1898) | #1891 | #1854 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27886326431) | 2026-06-20T22:51:29Z | post-merge-failure / OPEN | 2026-06-20T22:51:16Z / db58bf229ef3a8a7d03cfca6d609e3a6df6b3756 | open |
| [#1897](https://github.com/wdhunter645/next-starter-template/issues/1897) | #1889 | #1853 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27886304975) | 2026-06-20T22:50:30Z | post-merge-failure / OPEN | 2026-06-20T22:50:18Z / 810db3262b4e21dd1b9373b629bda7b69599f45f | open |
| [#1881](https://github.com/wdhunter645/next-starter-template/issues/1881) | #1877 | #1871 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27876835959) | 2026-06-20T16:18:03Z | post-merge-failure / OPEN | 2026-06-20T16:17:49Z / 6c877d0ceabc63a160edf6987124451cce124a84 | closed:COMPLETED |
| [#1879](https://github.com/wdhunter645/next-starter-template/issues/1879) | #1860 | #1848 | `late_undispositioned_reviewer_comment` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27901792592) | 2026-06-20T16:09:04Z | post-merge-failure / OPEN | 2026-06-20T15:26:56Z / 492f2cb8e88679c30e89e46914ded83385a0394b | open |
| [#1878](https://github.com/wdhunter645/next-starter-template/issues/1878) | #1868 | #1863 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27876595981) | 2026-06-20T16:08:43Z | post-merge-failure / OPEN | 2026-06-20T16:08:29Z / eef433fbfc51c7ba5d9dbfa28941a6ca2c578564 | open |
| [#1876](https://github.com/wdhunter645/next-starter-template/issues/1876) | #1875 | #1874 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27876440382) | 2026-06-20T16:02:46Z | post-merge-failure / OPEN | 2026-06-20T16:02:30Z / ccaf3ed3c3ccb71343c2a9fae459cc5051321ed8 | open |
| [#1873](https://github.com/wdhunter645/next-starter-template/issues/1873) | #1870 | #1869 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27876316261) | 2026-06-20T15:58:17Z | post-merge-failure / OPEN | 2026-06-20T15:58:01Z / 9125b4f6df2b1f3ceb619f169d4cb45862edf514 | open |
| [#1872](https://github.com/wdhunter645/next-starter-template/issues/1872) | #1861 | #1859 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27876310846) | 2026-06-20T15:58:05Z | post-merge-failure / OPEN | 2026-06-20T15:57:48Z / 210a03d46f47b9b8a0b1d5b0a7fd70ee8b5e1a23 | closed:COMPLETED |
| [#1866](https://github.com/wdhunter645/next-starter-template/issues/1866) | #1865 | #1864 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27875747171) | 2026-06-20T15:36:23Z | post-merge-failure / OPEN | 2026-06-20T15:36:08Z / 2bded07a9d3ce367314500ca815280787db250d2 | open |
| [#1863](https://github.com/wdhunter645/next-starter-template/issues/1863) | #1860 | #1848 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27875498665) | 2026-06-20T15:27:14Z | status:failed, status:post-merge-verify, post-merge-failure / OPEN | 2026-06-20T15:26:56Z / 492f2cb8e88679c30e89e46914ded83385a0394b | open |
| [#1862](https://github.com/wdhunter645/next-starter-template/issues/1862) | #1857 | #1856 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27875486521) | 2026-06-20T15:26:43Z | post-merge-failure / OPEN | 2026-06-20T15:26:26Z / 7a15ce2d3905683b93c9663a6e00b77309d8d610 | open |
| [#1843](https://github.com/wdhunter645/next-starter-template/issues/1843) | #1842 | #1841 | `source_issue_not_open` | exception_required | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27872640453) | 2026-06-20T13:30:55Z | post-merge-failure / OPEN | 2026-06-20T13:30:38Z / 8e367555ddd13b025daceeec170c9d63b6bc87a8 | closed:COMPLETED |
| [#1840](https://github.com/wdhunter645/next-starter-template/issues/1840) | #1839 | #1836 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27872107707) | 2026-06-20T13:07:54Z | post-merge-failure / OPEN | 2026-06-20T13:07:39Z / 727bfd39d5c10004d9cc831e0914222553c19dcd | closed:COMPLETED |
| [#1837](https://github.com/wdhunter645/next-starter-template/issues/1837) | #1239 | #1196 | `source_issue_not_open` | exception_required | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27870935591) | 2026-06-20T12:17:52Z | post-merge-failure / OPEN | 2026-06-03T16:30:25Z / 63c4ca233035d7b021735dbd3e6eb673f90d9184 | closed:COMPLETED |
| [#1829](https://github.com/wdhunter645/next-starter-template/issues/1829) | #1828 | #1725 | `closeout_blocker_declared` | closed_remediation_followup | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27829023732) | 2026-06-19T13:37:15Z | post-merge-failure / OPEN | 2026-06-19T13:37:03Z / 3a844ae4b4d765c9d5f7dff3472f069d589e7008 | closed:COMPLETED |
| [#1826](https://github.com/wdhunter645/next-starter-template/issues/1826) | #1821 | #1058 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27828767549) | 2026-06-19T13:32:08Z | post-merge-failure / OPEN | 2026-06-19T13:31:53Z / 2c57bfc302aa3b1d5e3e0c2c496d0dad06d9d715 | open |
| [#1824](https://github.com/wdhunter645/next-starter-template/issues/1824) | #1822 | #1058 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27828644676) | 2026-06-19T13:29:46Z | post-merge-failure / OPEN | 2026-06-19T13:29:30Z / 76335abfa5bfc92f352d426877005b7893afd86e | open |
| [#1817](https://github.com/wdhunter645/next-starter-template/issues/1817) | #1778 | #1255 | `active_alternate_program_lane` | closed_remediation_followup | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27871437718) | 2026-06-19T13:13:17Z | post-merge-failure / OPEN | 2026-06-18T10:36:00Z / 17a85b2f3fbb624e38cc19b887900742a66667e8 | closed:COMPLETED |
| [#1816](https://github.com/wdhunter645/next-starter-template/issues/1816) | #1699 | #1255 | `active_alternate_program_lane` | closed_remediation_followup | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27871437718) | 2026-06-19T13:13:08Z | post-merge-failure / OPEN | 2026-06-17T11:39:23Z / 58508f6b01a2e8a91e9997f1c1c7e8b82735fd81 | closed:COMPLETED |
| [#1784](https://github.com/wdhunter645/next-starter-template/issues/1784) | #1783 | #1777 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27726866025) | 2026-06-17T23:42:40Z | post-merge-failure / OPEN | 2026-06-17T23:42:28Z / 88331e01700e79389bd4f5c85cb7cdcf6f02f11b | closed:COMPLETED |
| [#1781](https://github.com/wdhunter645/next-starter-template/issues/1781) | #1779 | #1777 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27726713947) | 2026-06-17T23:38:53Z | post-merge-failure / OPEN | 2026-06-17T23:38:39Z / a68414e1d03ec1b2dc4a5a58e499938b69202b4d | closed:COMPLETED |
| [#1776](https://github.com/wdhunter645/next-starter-template/issues/1776) | #1770 | #1755 | `closeout_blocker_declared` | closed_remediation_followup | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27716799126) | 2026-06-17T20:13:23Z | post-merge-failure / OPEN | 2026-06-17T20:12:48Z / 0c76c3be03c952cd581faff4648a694cc4658c27 | closed:COMPLETED |
| [#1773](https://github.com/wdhunter645/next-starter-template/issues/1773) | #1771 | #1736 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27716567122) | 2026-06-17T20:08:55Z | post-merge-failure / OPEN | 2026-06-17T20:08:38Z / fd3e8ab000e3025c7736f117571292a23ceba10f | closed:COMPLETED |
| [#1718](https://github.com/wdhunter645/next-starter-template/issues/1718) | #1716 | #1715 | `closeout_blocker_declared` | source_issue_open_at_validation | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27690264892) | 2026-06-17T12:51:57Z | post-merge-failure / OPEN | 2026-06-17T12:51:34Z / efd44eb369c258386ab70460768744d744094da4 | closed:COMPLETED |
| [#1717](https://github.com/wdhunter645/next-starter-template/issues/1717) | #1714 | none | `multiple_source_issues` | not evaluated | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27690228342) | 2026-06-17T12:51:20Z | post-merge-failure / OPEN | 2026-06-17T12:50:55Z / 4fe8919bea02b8ed3bf8cecc54abb4d513834551 | none |
| [#1711](https://github.com/wdhunter645/next-starter-template/issues/1711) | #1709 | none | `multiple_source_issues` | not evaluated | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27686346888) | 2026-06-17T11:41:42Z | post-merge-failure / OPEN | 2026-06-17T11:41:19Z / 3ec37f120f648311ea28e478d359d7e6c5faf459 | none |
| [#1698](https://github.com/wdhunter645/next-starter-template/issues/1698) | #1697 | none | `invalid_source_issue_reference` | not evaluated | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27679361781) | 2026-06-17T09:29:47Z | post-merge-failure / OPEN | 2026-06-17T09:29:21Z / 4f197caeac7470bbbc8738e617d893bed1db881c | none |
| [#1655](https://github.com/wdhunter645/next-starter-template/issues/1655) | #1650 | #1649 | `missing_required_section` | open_source_issue | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27574778095) | 2026-06-15T20:37:04Z | post-merge-failure / OPEN | 2026-06-15T20:36:45Z / 7b6589817280631a0e8471d38edc238a41d31fc6 | open |
| [#1641](https://github.com/wdhunter645/next-starter-template/issues/1641) | #1635 | #1634 | `late_reviewer_finding` | closed_remediation_followup | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27502330947) | 2026-06-14T14:46:46Z | post-merge-failure / OPEN | 2026-06-14T14:30:41Z / 0e2e2fbada6e2fb74bed22eac10993eeb7744707 | closed:COMPLETED |
| [#1637](https://github.com/wdhunter645/next-starter-template/issues/1637) | #1635 | #1634 | `unchecked_acceptance_criterion` | open_source_issue | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27501935796) | 2026-06-14T14:30:58Z | post-merge-failure / OPEN | 2026-06-14T14:30:41Z / 0e2e2fbada6e2fb74bed22eac10993eeb7744707 | closed:COMPLETED |
| [#1628](https://github.com/wdhunter645/next-starter-template/issues/1628) | #1627 | #1626 | `unchecked_acceptance_criterion` | open_source_issue | fail | yes | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27497052340) | 2026-06-14T11:14:38Z | post-merge-failure / OPEN | 2026-06-14T11:14:25Z / 3a0a011e5aac94f017f46c81e3b719c542292479 | closed:COMPLETED |
| [#1624](https://github.com/wdhunter645/next-starter-template/issues/1624) | #1473 | #1404 | `workflow_failure` | closed_remediation_followup | pass | no | [run](https://github.com/wdhunter645/next-starter-template/actions/runs/27496674657) | 2026-06-14T10:59:23Z | post-merge-failure / OPEN | 2026-06-09T14:38:31Z / 3b3499a221affd8bb44e29e717a3ea56cf317316 | closed:COMPLETED |
| [#1570](https://github.com/wdhunter645/next-starter-template/issues/1570) | #1566 | none | `closeout_runtime_error` | not evaluated | fail | yes | not recorded | 2026-06-11T15:28:15Z | post-merge-failure / OPEN | 2026-06-11T15:27:55Z / bf49681b8a550b409e458295e81505b0efccb300 | none |
| [#1569](https://github.com/wdhunter645/next-starter-template/issues/1569) | #1568 | none | `missing_source_issue` | not evaluated | fail | yes | not recorded | 2026-06-11T15:08:03Z | post-merge-failure / OPEN | 2026-06-11T15:07:49Z / 061756baa00169d504325f58abfe5ebdcc2dea8f | none |
| [#1525](https://github.com/wdhunter645/next-starter-template/issues/1525) | #1524 | none | `missing_source_issue` | not evaluated | fail | yes | not recorded | 2026-06-09T17:53:18Z | post-merge-failure / OPEN | 2026-06-09T17:53:02Z / f114dbdc4055ea54915c7a35f795556867a75721 | none |
| [#1523](https://github.com/wdhunter645/next-starter-template/issues/1523) | #1513 | #1487 | `source_issue_not_open` | exception_required | fail | yes | not recorded | 2026-06-09T17:48:43Z | post-merge-failure / OPEN | 2026-06-09T17:48:21Z / bf51f5699bfcb51d65e4c96e71ca6f19c878c385 | closed:COMPLETED |
| [#1522](https://github.com/wdhunter645/next-starter-template/issues/1522) | #1521 | #1487 | `missing_required_section` | open_source_issue | fail | yes | not recorded | 2026-06-09T17:40:35Z | post-merge-failure / OPEN | 2026-06-09T17:40:20Z / 6301e7f2805761e0702d2b7610be2b6d75d3ddd7 | closed:COMPLETED |
| [#1519](https://github.com/wdhunter645/next-starter-template/issues/1519) | #1518 | #1487 | `missing_required_section` | open_source_issue | fail | yes | not recorded | 2026-06-09T17:37:39Z | post-merge-failure / OPEN | 2026-06-09T17:37:18Z / f38c860cc0cefe9c14482fe8d2b1fcffec328fdb | closed:COMPLETED |
| [#1509](https://github.com/wdhunter645/next-starter-template/issues/1509) | #1503 | #1487 | `allowlist_violation` | open_source_issue | fail | yes | not recorded | 2026-06-09T17:31:39Z | post-merge-failure / OPEN | 2026-06-09T17:31:25Z / e9a578bd492003ad2bab42724d8814ce55a866a7 | closed:COMPLETED |
| [#1508](https://github.com/wdhunter645/next-starter-template/issues/1508) | #1506 | #1501 | `missing_allowlist` | open_source_issue | fail | yes | not recorded | 2026-06-09T17:23:37Z | change-ops, post-merge-failure / OPEN | 2026-06-09T17:23:19Z / 37a10393c69454d9c31dda8ba27700e315030275 | closed:COMPLETED |
| [#1496](https://github.com/wdhunter645/next-starter-template/issues/1496) | #1491 | #1483 | `source_issue_not_open` | exception_required | fail | yes | not recorded | 2026-06-09T16:49:49Z | post-merge-failure / OPEN | 2026-06-09T16:49:35Z / 6ee2673730faba535c0903a06202e086dbb9dfbc | closed:COMPLETED |
| [#1495](https://github.com/wdhunter645/next-starter-template/issues/1495) | #1494 | #1483 | `closeout_exception` | open_source_issue | fail | yes | not recorded | 2026-06-09T16:27:01Z | post-merge-failure / OPEN | 2026-06-09T16:26:43Z / 7b6ab71269d9c2ef5a72f2b6cd58fe484711085f | closed:COMPLETED |
| [#1477](https://github.com/wdhunter645/next-starter-template/issues/1477) | #1458 | #1403 | `workflow_failure` | closed_remediation_followup | pass | yes | not recorded | 2026-06-09T14:48:52Z | post-merge-failure / OPEN | 2026-06-08T17:28:43Z / 47693785f533f26e02d4961c6a54a05eb69d8829 | closed:COMPLETED |
| [#1467](https://github.com/wdhunter645/next-starter-template/issues/1467) | #1242 | #1198 | `source_issue_not_open` | exception_required | fail | yes | not recorded | 2026-06-08T18:39:11Z | post-merge-failure / OPEN | 2026-06-03T17:35:37Z / 308012d8b4e2e8ae55fa04af621a16e08e01f3d6 | closed:COMPLETED |
| [#1466](https://github.com/wdhunter645/next-starter-template/issues/1466) | #1240 | #1197 | `source_issue_not_open` | exception_required | fail | yes | not recorded | 2026-06-08T18:39:06Z | post-merge-failure / OPEN | 2026-06-03T17:38:20Z / 89c0ebfc1bd40713629fe7161824bbc615365581 | closed:COMPLETED |
| [#1465](https://github.com/wdhunter645/next-starter-template/issues/1465) | #1229 | #1226 | `source_issue_not_open` | exception_required | fail | yes | not recorded | 2026-06-08T18:39:00Z | post-merge-failure / OPEN | 2026-06-03T14:50:56Z / 201a428a08ea495e1d95e89a4208cfde8c9266dc | closed:COMPLETED |
| [#1464](https://github.com/wdhunter645/next-starter-template/issues/1464) | #1463 | none | `missing_source_issue` | not evaluated | fail | yes | not recorded | 2026-06-08T18:38:51Z | post-merge-failure / OPEN | 2026-06-08T18:38:38Z / 00103bd37a40303de6713da30ca393c7a5db4445 | none |
| [#1462](https://github.com/wdhunter645/next-starter-template/issues/1462) | #1458 | none | `closeout_runtime_error` | not evaluated | fail | yes | not recorded | 2026-06-08T18:34:37Z | none / OPEN | 2026-06-08T17:28:43Z / 47693785f533f26e02d4961c6a54a05eb69d8829 | none |
| [#1457](https://github.com/wdhunter645/next-starter-template/issues/1457) | #1456 | #1455 | `closeout_exception` | open_source_issue | fail | yes | not recorded | 2026-06-08T16:09:40Z | change-ops, post-merge-failure / OPEN | 2026-06-08T16:09:22Z / 19740d3bf30a372a952ef0159e9ac283b1784ba1 | closed:COMPLETED |

## Validation evidence

- `gh issue view 1906 --json number,title,state,body,labels,comments,createdAt,updatedAt,url` — PASS; source issue #1906 is open and contains Phase 1 audit requirements.
- `gh issue list --state open --limit 2000 --json number,title,body,labels,createdAt,updatedAt,state,url` — PASS; 236 open issues inspected, 54 exact closeout exception issues matched.
- `gh pr view <linked-pr> --json number,state,mergedAt,mergeCommit,url,title` — PASS for linked PR metadata in the inventory.
- `gh issue view <source-issue> --json number,state,stateReason,labels,title,url` — PASS for linked source issue state modes.
- `gh api repos/{owner}/{repo}/branches/main/protection` — FAIL/blocked by GitHub permission (`Resource not accessible by integration`); live branch-protection required-check status remains unknown.
