---
Doc Type: Operations Report
Audience: Human + AI
Authority Level: Task Evidence
Owns: ZIP history audit inventory and remediation recommendation for issue #2374
Does Not Own: Authorization to rewrite repository history, force-push, delete branches, delete tags, or change CI gates
Canonical Reference: /docs/governance/platform-intent-and-zip-governance.md
Related Issues: #2374, #2369, #2359
Last Reviewed: 2026-07-08
---

# ZIP History Remediation Plan for Issue #2374

## Scope and stop rule

This report documents the ZIP full-history audit investigation requested by issue
#2374. It is an evidence and planning artifact only.

Do **not** perform repository-history remediation, force-push, branch deletion,
tag deletion, or CI-gate changes from this report without explicit Bill/ChatGPT
authorization for the exact action.

## Investigation commands

Commands were run after fetching all remote branches and tags from
`https://github.com/wdhunter645/next-starter-template.git` into local remote refs.

```bash
git fetch origin '+refs/heads/*:refs/remotes/origin/*' '+refs/tags/*:refs/tags/*' --prune
git ls-files '*.zip' '*.ZIP'
git log --all --name-only --pretty=format: -- '*.zip' '*.ZIP' | sed '/^\s*$/d' | sort -u
git rev-list --objects --all | rg -i '\.zip$' | sort -u
git log --all --format='%H%x09%ad%x09%D%x09%s' --date=iso -- '_incoming/drive-drafts/content-collection/drive-download-20260708T112039Z-3-001.zip'
git for-each-ref --contains <commit> --format='%(refname:short)'
git ls-tree -r <ref> --name-only
python - <<'PY'
import json, urllib.request
url='https://api.github.com/repos/wdhunter645/next-starter-template/pulls?state=open&per_page=100'
req=urllib.request.Request(url, headers={'User-Agent':'codex'})
with urllib.request.urlopen(req, timeout=20) as r:
    data=json.load(r)
    print(len(data))
PY
```

## Artifact inventory

| Finding | Evidence |
| --- | --- |
| ZIP path detected in full history | `_incoming/drive-drafts/content-collection/drive-download-20260708T112039Z-3-001.zip` |
| ZIP blob object | `f8b4a97f608ee472e92089036d6dcf02ca15c8c4` |
| ZIP tracked in current `work` / main-equivalent tree | No. `git ls-files '*.zip' '*.ZIP'` returned no tracked ZIP files. |
| Open GitHub PRs | No open PRs were returned by the GitHub REST pulls endpoint during this investigation. |

## Affected commits

| Commit | Date | Subject | Notes |
| --- | --- | --- | --- |
| `21bb616af2eab3bb98210f2be6b0b036643f8c95` | 2026-07-08 07:22:53 -0400 | `PMO program ZIP doc package` | Introduced `_incoming/drive-drafts/content-collection/drive-download-20260708T112039Z-3-001.zip`. |
| `dbd98647f509a8864d78a06edaff23f20c87d4fb` | 2026-07-08 12:19:32 -0400 | `Delete _incoming/drive-drafts/content-collection/drive-download-20260708T112039Z-3-001.zip` | Deletes the ZIP on one affected branch, but does not remove it from branch history. |

## Affected refs

| Ref | Reachability | Current tree status |
| --- | --- | --- |
| `origin/ChatGPT/drive-draft-intake-2367` | Contains both introduction commit `21bb616af2eab3bb98210f2be6b0b036643f8c95` and deletion commit `dbd98647f509a8864d78a06edaff23f20c87d4fb`. | ZIP is not present at the ref tip. History remains tainted. |
| `origin/cursor/2360-docs-audit-2e48` | Contains introduction commit `21bb616af2eab3bb98210f2be6b0b036643f8c95`. | ZIP remains present at the ref tip. |

No tags were found containing the ZIP-introduction commit during the local
`git for-each-ref --contains` inspection.

## Script and workflow review

- `scripts/rewrite_zip_history.sh` is a destructive mirror-rewrite helper. It
  clones the remote as a mirror, installs `git-filter-repo`, creates and pushes a
  remote backup tag named `backup/pre-zip-purge-<timestamp>`, removes paths
  matching `ZIP_GLOB` with `git filter-repo --force --path-glob "$ZIP_GLOB"
  --invert-paths`, verifies no ZIPs remain, and force-pushes the rewritten mirror
  unless `DRY_RUN=1` is set.
- `.github/workflows/purge-zip-history.yml` is also destructive. It creates a
  rollback tag, runs `git filter-repo --path-glob '*.zip' --invert-paths`, and
  force-pushes with `HISTORY_PURGE_PAT`.
- `.github/workflows/zip-history-audit.yml` runs on pull requests to `main` and
  manual dispatch. It scans `git log --all --name-only --pretty=format: --
  "*.zip"`; any path result fails the audit and instructs operators to run the
  purge workflow.

## Recommended disposition

### Safest immediate path

1. Treat issue #2374 as a repository-history remediation gate item, not a normal
   live-tree cleanup.
2. Pause or explicitly exception any future PR that must pass full-history ZIP
   audit until the affected refs are dispositioned. A temporary documented
   exception is acceptable only for urgent unrelated PRs and only if the operator
   acknowledges that the full-history audit is expected to fail for repository
   history reasons unrelated to the PR diff.
3. Prefer branch/ref cleanup first if these refs are stale and unneeded:
   - delete or archive `origin/cursor/2360-docs-audit-2e48`, because the ZIP is
     still present at the branch tip;
   - delete or archive `origin/ChatGPT/drive-draft-intake-2367`, because its branch
     history remains tainted even though its tip deleted the ZIP.
4. Re-run the full-history audit after ref cleanup. If no protected branch or
   tag still reaches the ZIP object, no full repository rewrite is needed.
5. If protected/main history or required retained refs still reach the ZIP object,
   request explicit Bill/ChatGPT authorization for a targeted repository-history
   rewrite and force-push, including the exact refs to rewrite and the rollback
   tag naming plan.

### Why branch/ref cleanup is preferred first

The currently identified taint is reachable from two remote branches and no
identified tags. There is no evidence from this investigation that the ZIP is
reachable from the local `work` head, `origin/main`, or any open PR. Removing or
archiving stale tainted refs is lower-risk than rewriting the full repository
history because it avoids changing commit SHAs on active branches.

## Risks

- Deleting a remote branch can disrupt anyone still using that branch as active
  work. Confirm ownership before deletion.
- Full mirror history rewrite changes commit SHAs for rewritten refs and requires
  all contributors and automation to resynchronize.
- Existing workflow references, PR discussions, or issue comments that cite old
  SHAs may become harder to follow after rewrite.
- Backup tags preserve rollback ability, but if they remain in the same remote
  namespace and still point to pre-purge history, they can also keep ZIP objects
  reachable by `git log --all` unless excluded or removed after validation.
- The current purge workflow removes all `*.zip` paths, not only the identified
  `_incoming/...` artifact. That broad scope is acceptable only if explicitly
  authorized as an all-ZIP purge.

## Rollback and backup considerations

- Before any destructive action, capture `git show-ref` output and the exact
  affected refs.
- For branch deletion, record the pre-delete commit SHA for each branch and use a
  temporary backup namespace only if the backup namespace will not keep the ZIP
  reachable during the audit window.
- For history rewrite, create an operator-approved rollback tag or external
  mirror backup, then validate whether that backup is intentionally excluded from
  the full-history audit. A remote rollback tag inside the audited repository can
  preserve the failing ZIP reachability.
- Do not remove backup material until Bill/ChatGPT explicitly authorizes cleanup
  after validation.

## Validation plan after authorized remediation

1. Fetch all branches and tags from origin.
2. Confirm no tracked ZIP files in the target live tree:
   `git ls-files '*.zip' '*.ZIP'`.
3. Confirm no ZIP paths are reachable from all audited refs:
   `git log --all --name-only --pretty=format: -- '*.zip' '*.ZIP' | sed '/^\s*$/d' | sort -u`.
4. Confirm no ZIP blobs remain reachable:
   `git rev-list --objects --all | rg -i '\.zip$'`.
5. Run or manually dispatch `.github/workflows/zip-history-audit.yml` and record
   the run result.
6. Re-check open PRs after remediation, because newly opened PRs or recreated
   refs can reintroduce reachability.

## PR blocking recommendation

Future PR-heavy Phase 0 promotion work should pause until this issue is either
resolved or has an explicit temporary exception. The exception should state that
full-history ZIP audit failures are caused by issue #2374's known historical refs
and not by the candidate PR's live tree or PR commit range.

## CHATGPT HANDOFF

```text
CHATGPT HANDOFF
Issue: #2374
Status: disposition-proposed
Summary:
- One ZIP artifact is reachable in full history: _incoming/drive-drafts/content-collection/drive-download-20260708T112039Z-3-001.zip (blob f8b4a97f608ee472e92089036d6dcf02ca15c8c4).
- The artifact was introduced by commit 21bb616af2eab3bb98210f2be6b0b036643f8c95 and deleted on origin/ChatGPT/drive-draft-intake-2367 by dbd98647f509a8864d78a06edaff23f20c87d4fb.
- Affected refs identified: origin/ChatGPT/drive-draft-intake-2367 (history tainted, tip clean) and origin/cursor/2360-docs-audit-2e48 (tip still contains ZIP).
- No open PRs were returned by the GitHub REST pulls endpoint during this investigation; no tags were found containing the introduction commit.
- Recommended safest path is operator-confirmed stale branch/ref cleanup first, then re-run full-history audit; reserve full repository history rewrite for the case where protected/required refs still reach the ZIP.

ChatGPT action requested:
- Review and approve, revise, or reject the proposed disposition.
- Confirm whether the two affected remote branches are stale and may be deleted/archived, or request Bill authorization for a targeted history rewrite.
- Decide whether future Phase 0 PRs must pause until ZIP audit resolution or may proceed under a documented temporary exception.

Evidence / paths:
- ZIP path: _incoming/drive-drafts/content-collection/drive-download-20260708T112039Z-3-001.zip
- ZIP blob: f8b4a97f608ee472e92089036d6dcf02ca15c8c4
- Introduction commit: 21bb616af2eab3bb98210f2be6b0b036643f8c95
- Deletion commit: dbd98647f509a8864d78a06edaff23f20c87d4fb
- Affected refs: origin/ChatGPT/drive-draft-intake-2367; origin/cursor/2360-docs-audit-2e48
- Scripts/workflows reviewed: scripts/rewrite_zip_history.sh; .github/workflows/purge-zip-history.yml; .github/workflows/zip-history-audit.yml
- Validation notes: tracked ZIP check on current work tree returned none; full-history checks after fetching all branches/tags found the single ZIP path above; open PR REST query returned zero open PRs.
```
