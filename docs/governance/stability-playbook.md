# Stability Playbook

This playbook is used when the repo or production behavior becomes unstable.

## 1) Pause

- Stop adding new change scope.
- Preserve evidence: logs, failing checks, URLs, timestamps.

## 2) Restore a Known-Good Baseline

- Prefer restoring from the most recent verified snapshot (see `docs/backup.md`).
- If snapshot restore is not required, revert the last PR(s) causing regression.

## 3) Isolate Root Cause

- Identify the smallest change set that introduced failure.
- Reproduce locally or via CI logs.

## 4) Fix With Minimal Blast Radius

- Apply the smallest safe fix.
- Avoid “cleanup” changes during incident response.

## 5) Verify and Document

- Verify checks green.
- Update docs so the incident class is not repeated.

Cross-reference: `docs/TROUBLESHOOTING.md` and `docs/RECOVERY.md`.
