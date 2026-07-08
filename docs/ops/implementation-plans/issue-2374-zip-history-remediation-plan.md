---
Doc Type: Operations Remediation Plan
Audience: Human + AI
Authority Level: Issue-Scoped Evidence
Owns: ZIP history audit inventory and proposed remediation plan for Issue #2374
Does Not Own: Authorization to rewrite repository history, delete branches, delete tags, force-push, or change CI gates
Canonical Reference: /docs/ops/ai/chatgpt-cursor-handoff-workflow.md
Related Issues: #2374, #2369, #2359
Last Reviewed: 2026-07-08
---

# Issue #2374 ZIP History Audit Remediation Plan

## Scope and stop rule

This plan records the investigation requested by Issue #2374. It is evidence and planning only.
It does **not** authorize any destructive repository-history remediation, force-push, branch deletion, tag deletion, or CI-gate change.

Stop before any repository-history remediation unless Bill and ChatGPT explicitly authorize the exact action.

## Documentation source classification

DIATAXIS_ROUTED — issue-scoped operations remediation planning under `docs/ops/implementation-plans/`.

## Headline finding

There are two distinct ZIP-history surfaces in the fetched repository evidence:

1. **Issue #2374 / PR #2373-era artifact:** one recent drive-draft ZIP under `_incoming/drive-drafts/content-collection/` is reachable from two remote branches and is not reachable from `origin/main`.
2. **Legacy closed-PR/ref archive surface:** after fetching GitHub pull-request head refs, additional historical ZIP files are reachable from old `refs/pull/*/head` mirrors. These appear older than the PR #2373-era artifact and are not reachable from `origin/main` in the fetched evidence.

No open pull requests were returned by the GitHub REST open-PR query, and no ZIP files are tracked in the current live tree.

## Artifact inventory

### Issue #2374 / PR #2373-era artifact

| Item | Value |
| --- | --- |
| ZIP path | `_incoming/drive-drafts/content-collection/drive-download-20260708T112039Z-3-001.zip` |
| Blob SHA | `f8b4a97f608ee472e92089036d6dcf02ca15c8c4` |
| Introduced by | `21bb616af2eab3bb98210f2be6b0b036643f8c95` — `PMO program ZIP doc package` |
| Removed by | `dbd98647f509a8864d78a06edaff23f20c87d4fb` — `Delete _incoming/drive-drafts/content-collection/drive-download-20260708T112039Z-3-001.zip` |
| Reachable branches | `origin/atlas/drive-draft-intake-2367`, `origin/cursor/2360-docs-audit-2e48` |
| Reachable tags | none found |
| `origin/main` reachability | not reachable |

### Additional historical ZIP paths found after fetching PR refs

These paths were returned by `git rev-list --objects --all | rg -i '\.zip$'` after fetching all branch, tag, and pull-request head refs. They are full-history audit risks if the audit includes GitHub pull-request refs or any stale remote refs that still point to these histories.

| ZIP path | Blob SHA |
| --- | --- |
| `LGFC-source-of-truth-recovery.zip` | `53bfff7d8cd1f236d60cb68a697c6b20833d0294` |
| `next-starter-template-main (400).zip` | `a6113f50f3d11284c629e470d59bcea1faba34cf` |
| `next-starter-template-main 31.zip` | `b74e269f2b1ba5862f3d2eff39d50e567f8d5fe9` |
| `repo33_build_fanclub_routing.zip` | `257a62af46abdfd8369ad65fa44e8c1d4022f34f` |
| `repo33_build_fanclub_routing_v3.zip` | `a99e9155727b8c3df180676dbc1ea4ef5a0e594e` |
| `repo32_with_governance.zip` | `c107e2a4604083f7a18d9888d5f572ba7c6695c1` |
| `repo31-updated-corrected.zip` | `94d46df12cf06bd4f511e8905e98a7032c1fcf2d` |
| `next-starter-template-main30-updated.zip` | `8313bbd0f147881f93a5af2473acb1acf5dbc756` |
| `next-starter-template-main-29-updated.zip` | `1b3cb4eda2bcaf99bb3e812ed7790ff5d0a1a38e` |
| `repo27-implemented.zip` | `7ddcf0563b9c60825140521c1204d7ab147e4ccd` |
| `repo26-implemented.zip` | `0105d00dbe0ae1eeca0e1967bd1f2ea9066a6078` |
| `lgfc-docs-governance-pack.zip` | `76bd793a64ffda441d456c79586fd98caae44535` |
| `next-starter-template-main-24-docs-consolidated.zip` | `d3dde8094a92913a53342cf40e5daec0b6f5f452` |
| `LGFC-Repo-Cleaned-Design-Standards.zip` | `4a937a9c02525f44e826278c5395c4c8347cd2ef` |
| `next-starter-template-main-21_LOCKED_DOCS.zip` | `2b3037f87749c7ba84378b6fcc46bd4a227e0272` |
| `LGFC-Docs-Updated.zip` | `5fa21903e9c9d5a23aff26d720923e5b9e856359` |
| `next-starter-template-main-design-locks-v4.zip` | `f6f7a5ea41bb9d134ac5a2cab85f0e655baa081d` |
| `next-starter-template-main-design-locks-v2.zip` | `929193b2b7d49db3f07fa6e8210a06f5b3f0f644` |
| `next-starter-template-main-updated-design-locks.zip` | `7bac6cef2c554bec75abfb5ae9b0663756d1b419` |
| `next-starter-template-main-2026-01-13-shadow.zip` | `c55ceec4ef519d5d6fef4964f85ff0ddcf467309` |
| `next-starter-template-fixed-b2-d1.zip` | `035cdc28855580489bb4d3b56c9c1114cedf9b9d` |
| `next-starter-template-updated-cms-2026-01-11.zip` | `903bc1fa47116b3a6c56ce36ee5c8b95844ec9fc` |
| `next-starter-template-main_updated_steps1-5_FIXED.zip` | `4109e2955ac6a4fef7a2edd7e04b6dc522473c13` |
| `next-starter-template-main_updated_steps1-5.zip` | `da2512570ccd61522f05133c803aee9e2a26b860` |
| `next-starter-template-post347-content-pass.zip` | `d2ca196ba6a73f9635a72bf05b48dd34358948c8` |
| `next-starter-template-phase7-clean.zip` | `714f3eb56d123554b7e6713c8f8d6e2cb0c045e7` |
| `next-starter-template-phase7-content-updated.zip` | `07b1d4a2637034ca06c19db5edcabf34f88914bf` |
| `next-starter-template-main (10)-updated.zip` | `635949c7197c21d19f9f4ea9512dd57466aab1b2` |
| `next-starter-template-main-updated.zip` | `d40e314cf430bef70859517b6672f138395a3923` |
| `next-starter-template-main_UPDATED_v5.zip` | `1fdfc5a3ea6b41b2118699f4b6d92ccd751aa33d` |
| `next-starter-template-updated-phase6-7.zip` | `ec2b2e9f76231f489edc162adb3fe763ada1f26c` |
| `next-starter-template-main_step6-close.zip` | `2f7ee0e6d5d0c9f957e66edf1d5b5f9644fecb70` |
| `LGFC-Lite-CF-FixPack-v1.zip` | `461994798c28e7c90e3aae4cb7e83d08b6901965` |

## Reachability findings

- Current live tree: no tracked ZIP files.
- `origin/main`: no ZIP paths were returned by `git rev-list --objects origin/main | rg -i '\.zip$'`.
- Open PRs: GitHub REST query for open PRs returned `0`.
- Tags: the recent Issue #2374 artifact is not contained in any tag. A tag scan for ZIP objects was started and produced no tag names before the branch scan continued; a final pre-remediation validation should repeat this with a bounded script and saved output before any destructive action.
- Recent affected branches: `origin/atlas/drive-draft-intake-2367` and `origin/cursor/2360-docs-audit-2e48` contain the Issue #2374 introduction commit. Only `origin/atlas/drive-draft-intake-2367` contains the deletion commit.
- Pull-request refs: fetching `refs/pull/*/head` surfaced the additional legacy ZIP paths listed above. These refs are not open PRs per the REST query, but they can affect an overly broad local `--all` audit.

## Script and gate review

Reviewed scripts:

- `scripts/ci/check_no_tracked_zips.sh` checks the live tree for tracked `*.zip` and `*.ZIP` paths and fails if any are present.
- `scripts/ci/verify_zip_history_pr.sh` checks a PR range from `GITHUB_BASE_SHA..GITHUB_HEAD_SHA` and fails if any ZIP path exists anywhere in that PR-range history.
- `scripts/rewrite_zip_history.sh` is a destructive mirror-clone workflow that installs `git-filter-repo`, creates and pushes a backup tag, rewrites all refs with `git filter-repo --path-glob "*.zip" --invert-paths`, verifies no ZIP paths remain, and force-pushes the rewritten mirror unless `DRY_RUN=1` is set.

No destructive script was executed.

## Recommended remediation path

Recommended safest path: use a two-lane remediation decision instead of jumping directly to a full mirror rewrite.

### Lane A — PR #2373-era artifact

1. Confirm with Bill/ChatGPT that these two affected remote branches are no longer needed:
   - `origin/atlas/drive-draft-intake-2367`
   - `origin/cursor/2360-docs-audit-2e48`
2. If both branches are stale and unneeded, authorize deleting only those remote branches.
3. Refetch with prune and re-run full-history ZIP validation against normal branch/tag refs and against PR-range checks for new PRs.

### Lane B — legacy PR-ref archive surface

1. Decide whether repository policy wants to audit GitHub pull-request refs (`refs/pull/*/head`) or only active branch/tag refs.
2. If PR refs remain in audit scope, document that many old closed-PR refs retain ZIP blobs and that branch deletion alone will not clear `git rev-list --objects --all` in a clone that fetched PR refs.
3. Do not rewrite history only to clean closed PR refs unless Bill/ChatGPT explicitly accept the broad blast radius and define the backup/audit-exception policy.

Rationale:

- `origin/main` is clean in the fetched evidence.
- No open PRs were reported by the GitHub REST open-PR query.
- The current live tree has no tracked ZIP files.
- The immediate Issue #2374 artifact appears limited to two stale branches.
- The legacy PR-ref surface is much broader and should be dispositioned as audit-scope policy before destructive remediation is considered.

## Risks and rollback considerations

### Branch deletion path

Risks:

- A stale-looking branch may contain unmerged documentation or operational evidence that someone expects to preserve.
- Deleting a branch does not remove GitHub pull-request refs, local clones, forks, or caches immediately; validation must be based on the intended server-side ref scope after pruning.

Rollback / backup:

- Record each affected branch head SHA before deletion.
- Create an explicit backup branch or tag only if Bill/ChatGPT approve preserving the branch content; do not create a backup ref that keeps the ZIP reachable unless the audit exception is intentional and documented.
- If deletion was mistaken, recreate the branch from the recorded SHA, understanding that doing so will reintroduce the ZIP audit finding.

### Repository-history rewrite path

Risks:

- Force-pushing rewritten history invalidates existing commit SHAs across every rewritten ref.
- Contributors must rebase or recreate local branches.
- Open, closed, and historical PR metadata may become harder to reconcile with old SHAs.
- Any backup tag that points to pre-rewrite history intentionally keeps ZIP blobs reachable and may continue to fail full-ref audits unless excluded or deleted after the retention window.

Rollback / backup:

- Use a mirror clone and record all refs before rewrite.
- Create a clearly named backup ref only with explicit approval and an explicit audit disposition.
- Dry-run and verify in a temporary mirror before any push.
- Prepare operator instructions for recloning or hard-resetting affected working copies.

## Validation plan after authorized remediation

Run these checks after the exact authorized action:

```bash
git fetch --all --tags --prune
git rev-list --objects origin/main | rg -i '\.zip$'
git rev-list --objects --branches --tags | rg -i '\.zip$'
git rev-list --objects --all | rg -i '\.zip$'
git log --all --full-history --name-status -- '*.zip' '*.ZIP'
git for-each-ref --contains 21bb616af2eab3bb98210f2be6b0b036643f8c95 --format='%(refname:short)' refs/remotes refs/tags
git for-each-ref --contains dbd98647f509a8864d78a06edaff23f20c87d4fb --format='%(refname:short)' refs/remotes refs/tags
bash scripts/ci/check_no_tracked_zips.sh
```

Expected pass condition depends on the approved audit scope:

- branch/tag scope: no ZIP paths from `git rev-list --objects --branches --tags | rg -i '\.zip$'`;
- PR-ref-inclusive local `--all` scope: no ZIP paths from `git rev-list --objects --all | rg -i '\.zip$'`, which may require a broader policy decision because closed PR refs retain historical ZIPs;
- live-tree check passes;
- PR-range ZIP history audit passes on future PRs that branch from clean `origin/main`.

## PR impact and temporary exception recommendation

Future PR-heavy Phase 0 promotion work should pause only if the required CI gate is configured to scan all fetched refs including stale branch or closed PR refs.

If immediate stale-branch cleanup cannot be authorized, a temporary documented exception is acceptable only for PRs that are created from clean `origin/main` and pass PR-range ZIP history validation. The exception should be narrow, time-boxed, and tied to Issue #2374; it should not weaken live-tree ZIP checks or permit new ZIP artifacts.

## CHATGPT HANDOFF

Issue: #2374
Status: disposition-proposed
Summary:
- Recent artifact: `_incoming/drive-drafts/content-collection/drive-download-20260708T112039Z-3-001.zip` (`f8b4a97f608ee472e92089036d6dcf02ca15c8c4`) was introduced by `21bb616af2eab3bb98210f2be6b0b036643f8c95` and deleted by `dbd98647f509a8864d78a06edaff23f20c87d4fb`.
- `origin/main` is clean in fetched evidence; no open PRs were returned by the GitHub REST open-PR query; current live tree has no tracked ZIP files.
- Recent artifact reachability is limited to `origin/atlas/drive-draft-intake-2367` and `origin/cursor/2360-docs-audit-2e48`.
- After fetching `refs/pull/*/head`, 33 additional legacy ZIP paths are reachable from old closed-PR refs. This means a local `git rev-list --objects --all` audit can continue to fail even after the two recent stale branches are handled, unless audit scope excludes closed PR refs or a broader rewrite is authorized.
- Safest proposed remediation is stale-branch cleanup for the recent artifact plus an explicit ChatGPT/Bill policy decision on whether closed PR refs are in audit scope. Full mirror rewrite should remain authorization-gated and last-resort.

ChatGPT action requested:
- Review and approve/disapprove the two-lane disposition.
- Confirm whether Bill should authorize deletion of `origin/atlas/drive-draft-intake-2367` and `origin/cursor/2360-docs-audit-2e48`, or whether either branch must be preserved.
- Decide whether ZIP history audit scope should include closed `refs/pull/*/head` refs; if yes, determine whether a broad rewrite is justified and define backup-ref retention/audit exception policy.

Evidence / paths:
- Recent ZIP path: `_incoming/drive-drafts/content-collection/drive-download-20260708T112039Z-3-001.zip`
- Recent blob SHA: `f8b4a97f608ee472e92089036d6dcf02ca15c8c4`
- Recent introduced by: `21bb616af2eab3bb98210f2be6b0b036643f8c95`
- Recent deleted by: `dbd98647f509a8864d78a06edaff23f20c87d4fb`
- Recent affected remote refs: `origin/atlas/drive-draft-intake-2367`, `origin/cursor/2360-docs-audit-2e48`
- Additional legacy ZIP paths: listed in this plan's artifact inventory.
- Open PRs: GitHub REST open-PR query returned `0`
- Scripts reviewed: `scripts/ci/check_no_tracked_zips.sh`, `scripts/ci/verify_zip_history_pr.sh`, `scripts/rewrite_zip_history.sh`
- Validation notes: live-tree ZIP check passes; `origin/main` ZIP scan is clean; PR-ref-inclusive `--all` scan detects the recent artifact plus legacy closed-PR ZIP objects.
