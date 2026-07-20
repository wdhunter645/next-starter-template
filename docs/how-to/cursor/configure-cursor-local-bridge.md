---
Doc Type: How-To
Audience: Bill, Cursor Local, Day-2 Operations
Authority Level: Operational Procedure
Owns: Chromebook install, auth preflight, systemd enablement, and verification for Cursor Local Bridge
Does Not Own: Wake workflow gates, runner registration, or Background Agents
Canonical Reference: /docs/reference/ci/cursor-local-bridge-contract.md
Related Issues: #2294, #2667
Last Reviewed: 2026-07-20
---

# Configure Cursor Local Bridge

## Purpose

Install the host Bridge that consumes wake packets from the Chromebook Actions runner and either launches an authenticated local `cursor agent` or falls back to notify + unclaimed.

## Prerequisite

1. Repository runner `lgfc-chromebook-linux` is online.  
2. `cursor agent` / `agent` is installed.  
3. CLI auth works: `cursor agent login` **or** `CURSOR_API_KEY` in the systemd user environment (never commit the key).  
4. Prove one manual print-mode run before relying on auto-start:

```bash
export PATH="$HOME/.local/bin:$PATH"
cursor agent status
# After login:
# cursor agent -p "Respond with the single word OK" --workspace "$PWD" --trust
```

If status is `Not logged in`, Bridge will only deliver **fallback: unclaimed** until auth succeeds.

## Install

From the repository root:

```bash
bash scripts/cursor-bridge/install.sh
node ~/lgfc-cursor-bridge/scripts/bridge.mjs status
```

## Verify wake delivery without launching Cursor

```bash
bash scripts/cursor-bridge/write-wake-packet.sh 2667 manual-test-1 manual wdhunter645
node ~/lgfc-cursor-bridge/scripts/bridge.mjs once
# Expect FALLBACK if Issue #2667 is not fully eligible or CLI is unauthenticated
```

## Service control

```bash
systemctl --user status lgfc-cursor-bridge.service
systemctl --user restart lgfc-cursor-bridge.service
journalctl --user -u lgfc-cursor-bridge.service -n 50 --no-pager
```

## Stop / disable

```bash
systemctl --user stop lgfc-cursor-bridge.service
systemctl --user disable lgfc-cursor-bridge.service
```

Do not remove the Actions runner unless also disabling `.github/workflows/cursor-local-wake.yml`.

## Related

- `docs/reference/ci/cursor-local-bridge-contract.md`
- `docs/how-to/ci/configure-lgfc-repository-runner.md`
- `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md`
