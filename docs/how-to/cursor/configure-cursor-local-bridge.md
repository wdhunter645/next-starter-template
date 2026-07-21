---
Doc Type: How-To
Audience: Bill, Cursor Local, Day-2 Operations
Authority Level: Operational Procedure
Owns: Chromebook install, auth preflight, systemd enablement, heartbeat/watchdog/reconciliation verification, and rollback for Cursor Local Bridge
Does Not Own: Wake workflow gates, runner registration, or Background Agents
Canonical Reference: /docs/reference/ci/cursor-local-bridge-contract.md
Related Issues: #2294, #2667, #2669, #2694
Last Reviewed: 2026-07-21
---

# Configure Cursor Local Bridge

## Purpose

Install the host Bridge that consumes wake packets from the Chromebook Actions runner and either launches an authenticated local `cursor agent` or falls back to notify + unclaimed. Also enable local heartbeat, watchdog recovery, and bounded missed-handoff reconciliation.

Design rationale: `docs/explanation/operations/cursor-local-auto-start-architecture.md`.

## Prerequisite

1. Repository runner `lgfc-chromebook-linux` is online.
2. `cursor agent` / `agent` is installed.
3. CLI auth works: `cursor agent login` **or** `CURSOR_API_KEY` in the systemd user environment (never commit the key).
4. Prove one manual print-mode run before relying on auto-start.

## Procedure

### Authenticate the local CLI

```bash
export PATH="$HOME/.local/bin:$PATH"
cursor agent login
cursor agent status
```

If status is `Not logged in`, Bridge will only deliver **fallback: unclaimed** until auth succeeds.

Optional manual proof:

```bash
cursor agent -p "Respond with the single word OK" --workspace "$PWD" --trust
```

### Install the Bridge service and watchdog timer

From the repository root on `main` (or the approved PR branch during soak):

```bash
bash scripts/cursor-bridge/install.sh
node ~/lgfc-cursor-bridge/scripts/bridge.mjs status
systemctl --user status lgfc-cursor-bridge.service
systemctl --user status lgfc-cursor-bridge-watchdog.timer
```

Confirm:

- `auth` / `cursorCliAuth.ok` is `true`
- Bridge systemd unit is active
- Watchdog timer is active
- After ~a few seconds of watch, `bridge.heartbeat` is present and fresh

### Configuration knobs

Host config lives at `~/lgfc-cursor-bridge/bridge.json` (copied from `config/cursor-bridge/bridge.json`).

| Key | Default | Role |
| --- | --- | --- |
| `reconcileEnabled` | `true` | Master switch for missed-handoff sweep |
| `reconcileIntervalSeconds` | `900` | Bounded recovery cadence |
| `heartbeatPath` | `heartbeat.json` | Local heartbeat file |
| `watchdog.heartbeatStaleSeconds` | `90` | Restart threshold |
| `watchdog.opsFaultIssueNumber` | `null` | Optional Issue for debounced GitHub ops faults |

Schema: `config/cursor-bridge/bridge.schema.json`.

### Verify wake delivery without launching Cursor

```bash
bash scripts/cursor-bridge/write-wake-packet.sh <issue-number> manual-test-1 manual wdhunter645
# Bridge watch loop consumes the packet automatically; or:
node ~/lgfc-cursor-bridge/scripts/bridge.mjs once
```

Expect `CURSOR BRIDGE FALLBACK: unclaimed` when the Issue is not fully eligible.

### Verify heartbeat and watchdog

```bash
# Heartbeat should refresh while Bridge is healthy
node ~/lgfc-cursor-bridge/scripts/bridge.mjs status | jq '.bridge.heartbeat'

# Watchdog check (quiet when healthy)
node ~/lgfc-cursor-bridge/scripts/watchdog.mjs check

# Simulate stale heartbeat recovery (non-production host only):
# stop Bridge, age heartbeat, run watchdog, confirm restart
systemctl --user stop lgfc-cursor-bridge.service
node ~/lgfc-cursor-bridge/scripts/watchdog.mjs check
systemctl --user status lgfc-cursor-bridge.service
```

Healthy intervals must not create GitHub comments.

### Verify reconciliation (recovery only)

```bash
# Manual one-shot sweep (uses live gh; fail-closed on API errors)
node ~/lgfc-cursor-bridge/scripts/bridge.mjs reconcile
```

The sweep queues a `reconcile-recovery` packet only for fully eligible resumes that lack a pending or consumed packet. It does not launch Cursor directly. Duplicate resume ids and active serial claims are handled by the normal Bridge packet path.

### Service control

```bash
systemctl --user status lgfc-cursor-bridge.service
systemctl --user restart lgfc-cursor-bridge.service
systemctl --user status lgfc-cursor-bridge-watchdog.timer
journalctl --user -u lgfc-cursor-bridge.service -n 50 --no-pager
journalctl --user -u lgfc-cursor-bridge-watchdog.service -n 50 --no-pager
```

### Stop, disable, or roll back

Disable watchdog only:

```bash
systemctl --user disable --now lgfc-cursor-bridge-watchdog.timer
```

Disable reconciliation without removing the Bridge:

```bash
# edit ~/lgfc-cursor-bridge/bridge.json
# set "reconcileEnabled": false
systemctl --user restart lgfc-cursor-bridge.service
```

Stop Bridge entirely:

```bash
systemctl --user stop lgfc-cursor-bridge.service
systemctl --user disable lgfc-cursor-bridge.service
```

Preserve `queue/`, `consumed/`, `claim.json`, and heartbeat/watchdog state unless cleanup is proven safe. Confirm ordinary wake delivery still works after rollback.

Do not remove the Actions runner unless also disabling `.github/workflows/cursor-local-wake.yml`.

## Related

- `docs/explanation/operations/cursor-local-auto-start-architecture.md`
- `docs/reference/ci/cursor-local-bridge-contract.md`
- `docs/how-to/ci/configure-lgfc-repository-runner.md`
- `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md`
