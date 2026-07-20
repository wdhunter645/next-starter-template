---
Doc Type: Reference
Audience: Human + AI
Authority Level: Project Contract
Owns: Cursor Local Bridge component inventory, eligibility auto-start gates, wake-packet authority boundary, and fallback taxonomy for Project #2294 Task #2667
Does Not Own: Product decisions, PR approval, Background Agents, or unrestricted workflow migration onto the Chromebook runner
Canonical Reference: /docs/explanation/operations/cursor-local-auto-start-architecture.md
Related Issues: #2294, #2667, #2669
Last Reviewed: 2026-07-20
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
| Wake packet queue (`~/lgfc-cursor-bridge/queue/`) | Decouple job vs agent lifetime | Packets from wake workflow | Files for Bridge | Host user permissions |
| Cursor Local Bridge (`scripts/cursor-bridge/bridge.mjs`) | Sole Cursor launcher | Packets, live Issue via `gh`, claim store, CLI auth | Claim, CLI run, evidence comments, fallback | `gh`, `cursor agent`/`agent` |
| Eligibility validator | Fail-closed gate | Issue + comments | ok / errors | Full eligibility checklist below |
| Serial claim store | One Implementation stream | Claim requests | Exclusive lease | Local `claim.json` |
| Local Cursor CLI | Execute one bounded action | Bridge prompt + workspace | Exit code + logs | Cursor login or `CURSOR_API_KEY` |
| Notify fallback | Operator-visible failure | Failure class | Desktop/log + Issue comment | `notify-send` optional |
| Poll-wake loop | Legacy backup detector | GitHub poll | Stdout sentinel only | Open IDE chat — **not primary** |

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

## Cost and prohibited paths

- Idle runner + idle Bridge: no Cursor usage  
- Local `cursor agent -p`: uses existing Cursor account model/agent allowance when a run executes  
- **Prohibited:** Cursor Background Agents, Cloud Agents REST, SDK cloud runtime, paid webhook relays  

## Fallback taxonomy

On auth failure, usage/plan limit, validation failure, claim conflict, or launch failure:

1. Do not claim (or release claim immediately)  
2. Local alert (`alerts.log` / `notify-send`)  
3. Issue comment `CURSOR BRIDGE FALLBACK: unclaimed — <reason>`  
4. Leave Issue eligible for manual pickup  

## Canonical files

- `docs/explanation/operations/cursor-local-auto-start-architecture.md`
- `config/cursor-bridge/bridge.json`
- `config/github-actions/repository-runner.json` (`wakeDelivery`)
- `.github/workflows/cursor-local-wake.yml`
- `scripts/cursor-bridge/**`
- `docs/how-to/cursor/configure-cursor-local-bridge.md`
