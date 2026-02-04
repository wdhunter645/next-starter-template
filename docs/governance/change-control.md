# Change Control

## Purpose

Change control exists to keep this repository stable, auditable, and production-safe.
It is the mechanism that prevents accidental drift and prevents “just one quick change”
from becoming a long outage.

## Rules

1. **No undocumented changes**
   - Any change that affects behavior must be described in the PR body and backed by updated docs.
2. **One PR = one intent**
   - PR intent labels are mandatory and must match the change scope.
3. **ZIP-first workflow**
   - Material changes are delivered via the ZIP cycle to reduce agent drift and PR sprawl.
4. **Rollback is a first-class option**
   - If uncertain, revert to last known good (see `docs/backup.md` and `docs/RECOVERY.md`).
5. **Production safety over speed**
   - If a change cannot be verified quickly and deterministically, it does not ship.

## Cross-References

- Governance process: `docs/website-process.md`
- PR constraints: `docs/website-PR-governance.md`
- Backup strategy: `docs/backup.md`
- Recovery procedure: `docs/RECOVERY.md`
