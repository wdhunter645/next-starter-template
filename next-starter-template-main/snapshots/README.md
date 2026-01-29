# Repository Snapshots

This directory contains automated snapshots of the repository state, organized by date.

## Purpose

Repository snapshots provide:
- **Rollback Audits**: Deterministic, repeatable snapshots of repository state
- **Drift Detection**: Track changes over time to identify unexpected modifications
- **Fast Recovery**: Quick reference points for restoring to known-good states

## Structure

```
snapshots/
├── YYYY-MM-DD/
│   └── repo-snapshot-YYYYMMDDTHHMMSSz.json  # Machine-parseable snapshot
├── _smoketest.txt                            # Workflow execution verification
└── README.md                                 # This file
```

## Snapshot Contents

Each JSON snapshot includes:
- **Commit SHA**: Current repository commit
- **Branch**: Active branch name
- **Author**: Last commit author
- **Timestamp**: ISO 8601 UTC timestamp
- **Changed Files**: Files modified in the last commit
- **Top-Level Tree**: Repository root directory structure
- **Package Info**: Name and version from package.json (if present)

## Usage

### Manual Snapshot Creation

Trigger a snapshot manually via GitHub Actions:
1. Navigate to **Actions** → **Repository Snapshot**
2. Click **Run workflow**
3. Select the `main` branch
4. Click **Run workflow**

### Automated Snapshots

Snapshots are automatically created daily at 07:00 UTC via GitHub Actions scheduled workflow.

### Viewing Snapshots

Browse snapshots by date in the `snapshots/YYYY-MM-DD/` directories. Each snapshot is a JSON file with complete repository metadata at that point in time.

### Verification

Check `_smoketest.txt` to verify the snapshot pipeline is functioning. Each successful run appends a timestamped entry.

## Recovery Procedures

For detailed recovery and rollback procedures, see `/docs/RECOVERY.md`.

## Security Notes

- **No Secrets**: Snapshots contain only public repository metadata
- **Read-Only**: Snapshot collection is non-destructive
- **Size Control**: Only metadata is captured, not file contents or binaries
- **Version Controlled**: Snapshots are committed to the repository for auditability

## Maintenance

Snapshots are kept indefinitely by default. To manage storage:
- Old snapshots can be manually removed if disk space becomes a concern
- Consider archiving snapshots older than 90 days to a separate branch or storage
