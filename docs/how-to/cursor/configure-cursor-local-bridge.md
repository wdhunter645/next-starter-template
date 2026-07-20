---
Doc Type: How-To
Audience: Bill, Cursor Local, Day-2 Operations
Authority Level: Operational Procedure
Owns: Chromebook install, auth preflight, systemd enablement, and verification for Cursor Local Bridge
Does Not Own: Wake workflow gates, runner registration, or Background Agents
Canonical Reference: /docs/reference/ci/cursor-local-bridge-contract.md
Related Issues: #2294, #2667, #2669
Last Reviewed: 2026-07-20
---

# Configure Cursor Local Bridge

## Purpose

Install the host Bridge that consumes wake packets from the Chromebook Actions runner and either launches an authenticated local `cursor agent` or falls back to notify + unclaimed.

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

### Install the Bridge service

From the repository root on `main`:

```bash
bash scripts/cursor-bridge/install.sh
node ~/lgfc-cursor-bridge/scripts/bridge.mjs status
```

Confirm `auth.ok` is `true` and the systemd user unit is active.

### Verify wake delivery without launching Cursor

```bash
bash scripts/cursor-bridge/write-wake-packet.sh <issue-number> manual-test-1 manual wdhunter645
# Bridge watch loop consumes the packet automatically; or:
node ~/lgfc-cursor-bridge/scripts/bridge.mjs once
```

Expect `CURSOR BRIDGE FALLBACK: unclaimed` when the Issue is not fully eligible.

### Service control

```bash
systemctl --user status lgfc-cursor-bridge.service
systemctl --user restart lgfc-cursor-bridge.service
journalctl --user -u lgfc-cursor-bridge.service -n 50 --no-pager
```

### Stop or disable

```bash
systemctl --user stop lgfc-cursor-bridge.service
systemctl --user disable lgfc-cursor-bridge.service
```

Do not remove the Actions runner unless also disabling `.github/workflows/cursor-local-wake.yml`.

## Related

- `docs/explanation/operations/cursor-local-auto-start-architecture.md`
- `docs/reference/ci/cursor-local-bridge-contract.md`
- `docs/how-to/ci/configure-lgfc-repository-runner.md`
- `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md`
