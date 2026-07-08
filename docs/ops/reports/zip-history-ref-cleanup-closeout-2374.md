---
Doc Type: Operations Report
Audience: Human + AI
Authority Level: Task Evidence
Owns: Closeout evidence for ZIP history ref cleanup under issue #2374
Does Not Own: Authorization for future repository-history rewrites or general ZIP-policy changes
Canonical Reference: .github/platform-intent-and-zip-governance.md
Related Issues: #2374, #2359
Last Reviewed: 2026-07-08
---

# ZIP History Ref Cleanup Closeout for Issue #2374

## Purpose

This report records the governed cleanup performed for issue #2374 after the ZIP history remediation plan identified two stale remote branch refs as the only known refs keeping the Content Collection ZIP artifact reachable.

The cleanup followed the safest immediate path recommended in `docs/ops/implementation-plans/zip-history-remediation-plan-2374.md`: disposition stale branch refs first, then revalidate before considering any full repository history rewrite.

## Source issue

- Issue: #2374
- Problem: full-history ZIP checks detected `_incoming/drive-drafts/content-collection/drive-download-20260708T112039Z-3-001.zip` in reachable branch history.
- Prior plan PR: #2382
- Prior plan finding: `origin/main` and the live tree were clean; the taint was isolated to stale branch refs.

## Authorized cleanup action

Bill requested ChatGPT resolve the ZIP history problem through the issue/PR process on 2026-07-08.

ChatGPT performed the minimum ref cleanup necessary to remove the known stale branch reachability:

| Ref | Pre-cleanup condition from #2374 plan | Cleanup action |
| --- | --- | --- |
| `atlas/drive-draft-intake-2367` | History contained ZIP introduction commit `21bb616af2eab3bb98210f2be6b0b036643f8c95`; tip had deleted the ZIP but history remained tainted. | Reset branch ref to current clean `main` commit `e4d7d693d8bda9fc890edbe994491a6037328ee9`. |
| `cursor/2360-docs-audit-2e48` | History contained ZIP introduction commit `21bb616af2eab3bb98210f2be6b0b036643f8c95`; tip still contained the ZIP. | Reset branch ref to current clean `main` commit `e4d7d693d8bda9fc890edbe994491a6037328ee9`. |

No repository-wide history rewrite was performed.
No purge workflow was run.
No tags were created.
No in-repository backup branch was created, because an in-repository backup ref would preserve the ZIP reachability and keep the audit failing.

## Validation evidence

Connector-side ref comparison after cleanup:

| Check | Result |
| --- | --- |
| `main` vs `atlas/drive-draft-intake-2367` | Identical; ahead `0`, behind `0`, changed files `0`. |
| `main` vs `cursor/2360-docs-audit-2e48` | Identical; ahead `0`, behind `0`, changed files `0`. |

This confirms both previously tainted stale branch refs now point to the same commit as `main`:

```text
e4d7d693d8bda9fc890edbe994491a6037328ee9
```

The current runtime could not perform an independent local `git clone` validation because DNS resolution to `github.com` failed in the execution environment. This environment limitation did not block connector-side GitHub ref comparison.

## Expected ZIP audit status

Given the prior #2374 inventory identified only these two remote branch refs and no tags as the known cause of ZIP reachability, and both refs now compare identical to clean `main`, the known ZIP history blocker is expected to be resolved.

The final confirmation should be the GitHub Actions ZIP History Audit on this PR or a manual workflow dispatch after this PR is opened.

## Closeout recommendation

If this PR's ZIP History Audit passes:

1. Merge this closeout evidence PR.
2. Comment on #2374 with the merged PR and validation evidence.
3. Remove `status:failed`, `status:post-merge-verify`, and `status:in-progress` from #2374 as appropriate.
4. Close #2374 as completed.
5. Resume Phase 0 documentation-promotion PRs without the #2374 temporary ZIP-history exception.

If this PR's ZIP History Audit fails:

1. Do not close #2374.
2. Inspect the failed run evidence for newly identified refs, paths, or workflow scope.
3. Open a successor remediation issue if the remaining failure is outside the two stale refs cleaned here.
