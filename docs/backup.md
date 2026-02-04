# Backup & Snapshot Strategy

## Purpose

This repository runs a production website. Backups are a **production requirement**.

This document defines a **weekly snapshot** strategy that can restore the repository to a
**known-good moment in time** with high confidence and minimal ambiguity.

## What a Snapshot Is

A snapshot is a point-in-time capture of the repository that:

- Represents a **known-good** state (builds, passes required checks, deployable).
- Is **complete** (entire repo, not a partial export).
- Is **immutable** once created.
- Is **restorable** without relying on tribal knowledge.

Snapshots are not diffs and not “nice to have” archives.

## Cadence and Retention

- **Cadence:** weekly
- **Retention:** keep the most recent **6** snapshots
- **Roll-off rule:** delete the oldest only after the newest snapshot is created and verified

This yields ~6 weeks of deterministic restore points.

## Snapshot Contents

Each snapshot must include:

- All repository tracked files at the snapshot commit
- All documentation
- All CI workflows and governance files
- Any required project metadata files

Snapshots must be sufficient to restore the repo to the exact state it was in at snapshot creation time.

## Storage Requirements

Snapshots must be stored:

- Outside of git history (no ZIP commits)
- As immutable artifacts (e.g., release asset or dedicated storage)
- With human-readable metadata

Minimum metadata:

- Snapshot date (UTC)
- Commit SHA
- Branch/tag reference (if applicable)
- Verification result (pass/fail)

## Verification Requirements

A snapshot run must:

1. Capture repository contents at a specific commit SHA
2. Validate completeness (expected files present, non-empty artifact)
3. Record metadata (date + commit SHA)
4. Upload/store artifact successfully

If any step fails, the snapshot is **invalid** and must not replace the last known good snapshot.

## Restore Expectations

Restoring a snapshot must enable:

- Rebuilding the site
- Re-running CI checks
- Re-deploying production via the normal pipeline

Restore procedure is documented in `docs/RECOVERY.md`.

## Cross-References

- Restore procedures: `docs/RECOVERY.md`
- Incident handling: `docs/TROUBLESHOOTING.md`
- Day-to-day operations: `docs/OPERATING_MANUAL.md`

## Day 1 Completion Requirement

Day 1 is not considered complete until:

- Weekly snapshot automation exists,
- retention is enforced (6 rolling snapshots),
- and restore instructions are documented and usable.
