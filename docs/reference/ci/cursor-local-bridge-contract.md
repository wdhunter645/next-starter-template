---
Doc Type: Reference
Audience: Human + AI
Authority Level: Project Contract
Owns: Cursor Local Bridge component inventory, eligibility auto-start gates, wake-packet authority boundary, health/watchdog/reconciliation contract, and fallback taxonomy for Project #2294 Task #2667 and Operations Issue #2694
Does Not Own: Product decisions, PR approval, Background Agents, or unrestricted workflow migration onto the Chromebook runner
Canonical Reference: /docs/explanation/operations/cursor-local-auto-start-architecture.md
Related Issues: #2294, #2667, #2669, #2694
Last Reviewed: 2026-07-21
---

# Cursor Local Bridge Contract

## Purpose

Define the mandatory **Cursor Local Bridge** that turns GitHub eligibility into an authenticated local `cursor agent` launch — or an explicit unclaimed fallback.

The Chromebook GitHub Actions runner is **event delivery only**. Without this Bridge, labels and wake jobs do not start Cursor.

Conceptual architecture and as-built evidence: `docs/explanation/operations/cursor-local-auto-start-architecture.md`.

## Component inventory

Every component has a role. No infrastructure may be introduced without purpose, inputs, outputs, and dependencies.

| Component | Purpose | Inputs | Outputs | Dependencies |
| --- | --- | --- | --- | --- |
| Source Issue | Task authority | Labels, `CHATGPT RESPONSE`, `LOCAL CURSOR RESUME` | Live state Bridge re-reads | Governance handoff contracts |
| Wake workflow (`.github/workflows/cursor-local-wake.yml`) | Near-real-time delivery | Trusted `issues` / `issue_comment` / manual dispatch | Host wake packet JSON | `lgfc-repo-runner` |
| Actions runner service | Host job receiver | Jobs with `lgfc-repo-runner` | Process that can write packets | systemd runner unit |
| Wake packet queue (`~/lgfc-cursor-bridge/queue/`) | Decouple job vs agent lifetime | Packets from wake workflow or reconciliation recovery | Files for Bridge | Host user permissions |
| Cursor Local Bridge (`scripts/cursor-bridge/bridge.mjs`) | Sole Cursor launcher | Packets, live Issue via `gh`, claim store, CLI auth | Claim, CLI run, evidence comments, fallback, local heartbeat | `gh`, `cursor agent`/`agent` |
| Local heartbeat | Prove useful Bridge health without GitHub traffic | Watch-loop state | `heartbeat.json` (atomic, mode `0600`) | Bridge process |
| Local watchdog (`watchdog.mjs` + systemd timer) | Detect hung/stale Bridge and restart or alert | Heartbeat age, service, queue, workspace, `gh`/CLI auth, claim TTL, disk | Local restart/alert; optional debounced GitHub ops fault | systemd user timer |
| Missed-handoff reconciliation | Recover eligible handoffs when wake packet was missed | `reconcileIntervalSeconds` cadence + live Issue eligibility | Recovery packet into normal queue | `gh`, full eligibility contract |
| Eligibility validator | Fail-closed gate | Issue + comments | ok / errors | Full eligibility checklist below |
| Serial claim store | One Implementation stream | Claim requests | Exclusive lease | Local `claim.json` |
| Local Cursor CLI | Execute one bounded action | Bridge prompt + workspace | Exit code + logs | Cursor login or `CURSOR_API_KEY` |
| Notify fallback | Operator-visible failure | Failure class | Desktop/log + Issue comment | `notify-send` optional |
| Status command (`bridge.mjs status`) | Bidirectional readiness view | Local Bridge + auth surfaces | Secret-safe JSON status | Host only |
| Poll-wake loop | Legacy backup detector | GitHub poll | Stdout sentinel only | Open IDE chat — **not primary** |

## Primary, recovery, and health paths

```text
Primary path:
GitHub event -> wake workflow -> repository runner -> local packet -> Bridge

Recovery path:
local slow reconciliation -> detect missed eligible handoff -> local packet -> normal Bridge processing

Health path:
local heartbeat <- Bridge watch loop
local watchdog -> restart or alert (GitHub ops fault only when persistent/actionable)
```

Rules:

- Event-driven wake delivery remains primary.
- Reconciliation is recovery only, rate-limited (`reconcileIntervalSeconds`, default `900`), and fail-closed on API/ambiguity.
- Reconciliation must not launch Cursor, bypass the packet path, reinterpret authority, or claim beyond the serial lane.
- Routine healthy checks stay local and quiet — no synthetic GitHub keepalive traffic.

## Eligibility (auto-start only when all true)

1. Source Issue is open  
2. `agent:cursor` present  
3. `handoff:ready` present  
4. Latest canonical `CHATGPT RESPONSE` (or `CHATGPT CLOSEOUT`) exists  
5. Separate `LOCAL CURSOR RESUME` references that response  
6. Resume contains exactly one bounded action  
7. Serial lane has no active conflicting claim  
8. Resume comment id not already consumed  
9. Repository matches `wdhunter645/next-starter-template`  

Reconciliation applies this same contract before writing a recovery packet. Deduplication keys are resume comment id and delivery identity.

## Heartbeat and watchdog

Heartbeat fields (local only): timestamp, process identity, service mode, queue depth, active claim summary, last drain/reconcile result, last inbound packet time, last outbound GitHub acknowledgment time.

Watchdog checks:

- Bridge systemd unit active
- Heartbeat age within threshold (`watchdog.heartbeatStaleSeconds`, default `90`)
- Packet queue readable/writable
- Workspace present
- `gh` authentication available
- Cursor CLI authentication observable
- Claim not stale beyond configured TTL (report only; clear only under existing claim TTL contract)
- Adequate local disk (`watchdog.minDiskMb`)

Restart when the service is inactive or the heartbeat is missing/stale. Local alert on recovery failure. Optional GitHub ops fault comment only when `watchdog.opsFaultIssueNumber` is set and the restart budget is exceeded (debounced).

## Status surface

`node ~/lgfc-cursor-bridge/scripts/bridge.mjs status` reports runner/transport observation (best-effort), Bridge service/heartbeat, queue depth and oldest packet age, claim state, GitHub and Cursor CLI auth (secret-redacted), last inbound/outbound times, last reconciliation result, and disk headroom. It must not print tokens, API keys, prompts, or private logs.

## Cost and prohibited paths

- Idle runner + idle Bridge: no Cursor usage  
- Local `cursor agent -p`: uses existing Cursor account model/agent allowance when a run executes  
- **Prohibited:** Cursor Background Agents, Cloud Agents REST, SDK cloud runtime, paid webhook relays, scheduled GitHub keepalive, synthetic Issue comments used only to create traffic, public inbound host tunnels, runner-held Cursor credentials, concurrent Implementation claims  

## Fallback taxonomy

On auth failure, usage/plan limit, validation failure, claim conflict, or launch failure:

1. Do not claim (or release claim immediately)  
2. Local alert (`alerts.log` / `notify-send`)  
3. Issue comment `CURSOR BRIDGE FALLBACK: unclaimed — <reason>`  
4. Leave Issue eligible for manual pickup  

## Rollback

1. Set `reconcileEnabled` to `false` and/or raise `reconcileIntervalSeconds`.  
2. `systemctl --user disable --now lgfc-cursor-bridge-watchdog.timer`  
3. Restore prior `bridge.json` / Bridge scripts from the previous `main` revision if needed.  
4. Preserve queue, consumed-resume, and claim evidence unless a rollback procedure proves safe cleanup.  
5. Confirm ordinary wake-packet delivery still works.

## Canonical files

- `docs/explanation/operations/cursor-local-auto-start-architecture.md`
- `config/cursor-bridge/bridge.json`
- `config/cursor-bridge/bridge.schema.json`
- `config/github-actions/repository-runner.json` (`wakeDelivery`)
- `.github/workflows/cursor-local-wake.yml`
- `scripts/cursor-bridge/**`
- `docs/how-to/cursor/configure-cursor-local-bridge.md`
