---
Doc Type: How-To
Audience: Bill, ChatGPT, Cursor, LGFC maintainers
Authority Level: Operational Authority
Owns: Local Cursor GitHub poll-wake loop operation, watch rules, wake semantics, and known reliability limits
Does Not Own: Poller script implementation in `~/.cursor/github-poller/`, merge authority, GitHub webhook configuration, or cloud agent billing
Canonical Reference: /docs/how-to/cursor/agent-session-bootstrap.md
Related Issues: #2398
Last Reviewed: 2026-07-08
---

# Cursor local GitHub poll-wake loop

## Goal

Keep an **open Cursor agent chat** aware of qualifying GitHub activity on `wdhunter645/next-starter-template` without cloud agents or usage credits. Wake the agent **only** when new qualifying activity is detected.

This how-to documents operator behavior for the **local poller** installed at `~/.cursor/github-poller/`. Those scripts are user-local tooling; they are not part of the repository tree.

## Components

| Path | Role |
| --- | --- |
| `~/.cursor/github-poller/poll-github.mjs` | Single poll via `gh` CLI; writes JSON to stdout |
| `~/.cursor/github-poller/poll-wake-loop.sh` | Loop wrapper: poll immediately, then every *N* minutes |
| `~/.cursor/github-poller/poll-loop.sh` | Alert-only loop (terminal output; no agent wake) |
| `~/.cursor/github-poller/state.json` | Baseline `since` timestamp and seen event keys |
| `~/.cursor/github-poller/README.md` | Local operator quick reference |

## What the poller watches

`poll-github.mjs` treats activity as **new** only when `updatedAt` (or equivalent) is later than `state.since` **and** the item matches one of these rules:

| Trigger | Rule |
| --- | --- |
| Cursor handoff queue | Open issues labeled **`agent:cursor`** and **`handoff:ready`** |
| Assigned issues | Open issues **assigned to** `GITHUB_POLL_LOGIN` (default: `wdhunter645`) |
| Assigned PRs | Open PRs **assigned to** `GITHUB_POLL_LOGIN` |

### What the poller does not watch

- Issues with only `agent:cursor` (missing `handoff:ready`)
- `QUEUE UNBLOCK — CURSOR START` or `CHATGPT HANDOFF` comments alone
- Issues labeled `agent:ChatGPT` without matching assignee/handoff rules
- PR/issue comments unless the parent issue/PR matches a watch rule and its `updatedAt` moved

**Operational implication:** a queue-unblocked issue (for example `#2361` after `#2360` closed) is **human-actionable** in the issue thread but **not machine-actionable** for the poller until labels/assignment match the table above.

## Loop behavior

`poll-wake-loop.sh [minutes]` (allowed interval: **2–12**, default **5**):

1. Run `node poll-github.mjs`.
2. On success with **`fresh: 0`** — **silent** in the loop log (no agent wake, no credits).
3. On success with **`fresh > 0`** — print:

   ```text
   AGENT_LOOP_TICK_github_poll {"fresh":N,"prompt":"..."}
   ```

   Monitored Cursor agent chat may react to this line.

4. On failure (no JSON on stdout) — print:

   ```text
   [timestamp] poll failed
   ```

   The underlying `gh` error is discarded (`2>/dev/null` in the loop script).

### Poll failure vs idle success vs new activity

| Outcome | Meaning |
| --- | --- |
| `poll failed` | Poll did not complete; **not** “no GitHub actions found” |
| Success, `fresh: 0` | Connected; no qualifying **new** activity since last baseline |
| Success, `fresh > 0` | New qualifying activity; agent wake line emitted |

## How to start the loop

### Terminal (operator)

```bash
~/.cursor/github-poller/poll-wake-loop.sh 5
```

Requires `gh auth status` OK and one agent chat left open in the workspace.

### Chat (Cursor agent)

Ask the agent:

```text
Start poll-wake-loop.sh 5 as a monitored background loop with full permissions (required_permissions: all).
```

`required_permissions: ["all"]` is an **agent tool** setting when the agent spawns the background job. It is not bash syntax.

**Reliability note:** agent-spawned background shells may still run under Cursor sandbox wrappers. Manual `gh` polls from fresh agent Shell calls can succeed while scheduled background ticks intermittently log `poll failed`. Treat the loop as **best-effort**, not a guaranteed notification bus.

## Environment overrides

```bash
export GITHUB_POLL_REPO=wdhunter645/next-starter-template
export GITHUB_POLL_LOGIN=wdhunter645
export GITHUB_POLL_INTERVAL_MINUTES=5
```

## Reset poll baseline

```bash
rm ~/.cursor/github-poller/state.json
```

## Recommended pairing with issue handoff

GitHub does not push notifications to Cursor. Durable issue comments remain the primary control plane.

| Intent | Recommended signal |
| --- | --- |
| Cursor should start work | `agent:cursor` + **`handoff:ready`** + issue comment with start/handoff block |
| ChatGPT should review | **`agent:ChatGPT`** + **`CHATGPT HANDOFF`** comment on the issue |
| Queue unblock after predecessor closes | Issue comment (for example `QUEUE UNBLOCK — CURSOR START`) **and** add `handoff:ready` if the poller should detect it |

Cursor does not automatically begin the next queue issue from poll connectivity alone. Read the issue thread or act on an explicit chat instruction.

## Stop conditions

- Stop the loop with **Ctrl+C** in the terminal running `poll-wake-loop.sh`.
- Kill duplicate loops before starting a clean restart (`pgrep -af poll-wake-loop`).
- Do not treat poller wake as merge authorization or scope approval.

## Verification

```bash
gh auth status
node ~/.cursor/github-poller/poll-github.mjs
```

Expect JSON with `"ok":true` and either `"fresh":0` or `"fresh":N`.
