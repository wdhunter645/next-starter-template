---
Doc Type: Report
Audience: Bill, ChatGPT, Cursor Local, LGFC maintainers
Authority Level: Pilot Evidence
Owns: Observe-mode fixture and Phase 1 live host pilot evidence for Project #2294
Does Not Own: Production enablement, runner registration, or automatic merge to main
Canonical Reference: /docs/how-to/agents/operate-agent-routing.md
Related Issues: #2294, #2601, #2634, #2635, #2636, #2637, #2638
Last Reviewed: 2026-07-19
---

# Agent Routing Observe Pilot

## Fixture pilot

A deterministic observe-mode fixture pilot passed all 16 scenarios. Candidate selection remained broad without alert labels, an urgent alert increased ranking without creating authority, overlapping claims yielded to the first active lease, an independent lane advanced while a serial lane remained blocked, and repeated input produced stable results.

Configuration remains:

- routing mode: `observe`;
- repository `watchers.enabled`: `false` (ChatGPT scheduler enablement is external to this file);
- local Cursor poller: exercised on Chromebook with isolated state (no persistent service install under Phase 1);
- repository runner: manual-health-only and unregistered;
- automatic `main` merge: false.

## Phase 1 live host evidence (2026-07-18)

Authorized by `#2601` `CHATGPT HANDOFF — OBSERVE PILOT GO`. Runtime: Cursor Local on Chromebook Debian 12 (`penguin`), project tip `67ef5f282e8869af35d1d7bbd452b787e8503c69`.

| Check | Result |
| --- | --- |
| Controller mode `observe` | `apply=false`, `mutations=[]` |
| Kill switch mode `disabled` | `class=noop`, `mutations=[]` |
| Independent lane while blocked | selected taskIssue `3001` |
| Observe plan against `main` PR | `class=human_decision`, `mutations=[]` |
| Watcher claim race (ledger) | first acquired, second refused |
| Dead-letter create/replay/resolve | resolved after one bounded replay |
| Local poller claim + restart | consumed event retained; duplicate → `event_already_consumed` |
| Local poller disable + rollback | disable preserves claims; re-enable retains consumed IDs |
| Live poll while disabled | `eligible=[]` (no GitHub mutation) |
| `acceptance.mjs` | 16/16 PASS |
| `vitest run tests/agent-routing` | 8 files / 31 tests PASS |
| OpenAI API in agent-routing surfaces | none |
| Auto-merge `main` | prohibited |

Host artifacts: `/tmp/lgfc-2601-evidence/`.

Predecessor incorporation:

- `#2597` Chromebook poller evidence accepted and closed;
- `#2600` integrated safety/recovery validation accepted and closed.

## Five-watcher observe cycle (accepted)

Phase 1 initially authorized ChatGPT watchers at minutes **00, 12, 24, 36, and 48** with a read-only observe-pilot prompt. Watcher 36 was re-enabled. The first complete staggered cycle window (America/New_York) was:

| Slot | Planned local time |
| --- | --- |
| 00 | 2026-07-18T11:00:00-04:00 |
| 12 | 2026-07-18T11:12:00-04:00 |
| 24 | 2026-07-18T11:24:00-04:00 |
| 36 | 2026-07-18T11:36:00-04:00 |
| 48 | 2026-07-18T11:48:00-04:00 |

**Status:** accepted. `#2601` `BILL / ATLAS AUTHORIZATION — WATCHERS ENGAGE, NOT REPORT-ONLY` (2026-07-18) records that completed observe cycles demonstrated broad repository visibility and supersedes the report-only restriction.

Live engage-mode sample on `#2601` (`DISPATCHER 00 — broad repository review completed`, 2026-07-18T22:05:10Z):

- sole `handoff:in-progress` Cursor Local claim preserved on `#2601`;
- no competing serial-lane Cursor claim active or wake-eligible;
- prepared successor left inactive pending `#2601` review/closeout;
- no open PR required review, integration, check rerun, or bounded remediation;
- no unanswered `CURSOR QUESTION` or deterministic stale predecessor/label mutation required;
- production and `main` boundaries untouched;
- dispatcher action: preserved the active claim and suppressed duplicate wake/routing mutations.

Post-acceptance watcher role (bounded collaboration-dispatch):

- answer routine Cursor questions and handoffs;
- inspect PR checks, reviews, threads, source-Issue accounting, and current-head evidence;
- request or direct bounded remediation within existing scope;
- rerun failed checks when technically justified;
- integrate technically clean PRs targeting authorized non-`main` project/component branches when the recorded approval profile permits Atlas-controlled component integration;
- reconcile stale routing labels and assignments;
- close verified non-production tasks when existing authority permits;
- activate the next eligible serial successor with correct Cursor assignment, routing labels, and canonical handoff;
- preserve one active Cursor claim per serial lane while permitting explicitly authorized parallel lanes.

Continuing prohibitions: merge/promote to `main` without explicit Bill/Atlas approval; approve builder-owned work on the builder's behalf; change production configuration/secrets/credentials/paid services/external infrastructure; delete branches/tags or perform destructive actions; invent scope, launch unapproved projects, or bypass unresolved product/authority decisions.

## Serial chain posture

`#2601` is the Task 009 observe-pilot/operator-handoff deliverable for Project `#2294`. Bill/Atlas critical-path correction records the authorized serial continuation after verified `#2601` closeout as:

`#2601 → #2634 → #2635 → #2636 → #2637 → #2638`

| Issue | Role |
| --- | --- |
| `#2634` | Prepare inert runner-health workflow promotion package for protected `main` review |
| `#2635` | Register Chromebook runner and install persistent service after promotion merges |
| `#2636` | Validate health, persistence, disable, rollback, and recovery |
| `#2637` | Run bounded mutation-capable dispatcher pilot |
| `#2638` | ChatGPT/Bill terminal closeout and production-routing decision |

`#2466` remains deferred and must not activate while this runner-service chain is incomplete. Only `#2601` is wake-eligible until verified closeout; `#2634` stays queued without `handoff:ready` until then.

## Known exceptions

- `ops-agent-routing-reconcile.yml` / controller workflows are present on `component/agent-issue-polling-handoff-routing` but are not yet registered on the default branch, so `gh workflow run` returns 404 until production promotion.
- Chromebook GitHub runner registration and persistent runner service installation remain out of Phase 1 / `#2601` scope.
- Threshold tuning was not changed; current `scripts/agent-routing/config.json` thresholds remain the pilot baseline (no latency evidence required a change).
- Repository Automations list returned zero watcher records via Cursor backend API; live watcher enablement remains ChatGPT/Atlas scheduler-side authority.

## Final acceptance gate (predecessor unblocked)

Host observe evidence and watcher engage samples on `#2601` are recorded above.

Predecessor blockers cleared (2026-07-19):

- `#2640` / PR `#2642` authority integrated to `main` and closed complete;
- `#2639` / PR `#2646` four-lane controller runtime merged into `component/agent-issue-polling-handoff-routing` at `79400f428a0c60ccdb3e566c45b2560ca59463e2`;
- ChatGPT authorized `#2601` resume after that integration ([CHATGPT RESPONSE](https://github.com/wdhunter645/next-starter-template/issues/2601#issuecomment-5017413036)).

## Four-lane runtime validation (2026-07-19 resume)

Validated against component head `79400f428a0c60ccdb3e566c45b2560ca59463e2` without enabling production `fourLaneRuntime` or runner registration.

| Check | Result |
| --- | --- |
| `fourLaneRuntime.enabled` default | `false` (conservative observe planner authoritative) |
| Observe plan mutations | `[]` |
| `acceptance.mjs` | 20/20 PASS (includes four-lane scenarios 17–20) |
| `vitest run tests/agent-routing` | 9 files / 45 tests PASS (13 four-lane) |
| `pmo:project:validate` (project manifest) | PASS |
| PROBLEM FOUND → GUIDANCE path | nested review `remediation-required`; Administration does not block delivery |
| Independent work while review pending | administrative-only successor eligible; reconciler selected task `2634` in fixture |
| Day-2 assessment hold | plan class `operational_assessment`; preserve + false-positive release OK |
| Local poller claim / disable / duplicate | claim consumed; disable → `poller_disabled`; duplicate → `event_already_consumed` |
| Auto-merge `main` under four-lane | still `human_decision` / no mutations |

Host artifacts: `/tmp/lgfc-2601-resume-evidence/` (plus retained `/tmp/lgfc-2601-evidence/`).

## Promotion-profile matrix reconciliation (2026-07-20)

After `#2639` closeout and PR `#2655` merge, reconciled Task 009 evidence against component head `f5bc9f14c2533def302a8cd2cfa79237e8403406`.

| Check | Result |
| --- | --- |
| Integrated module | `scripts/agent-routing/promotion-profile-matrix.mjs` |
| `acceptance.mjs` | 21/21 PASS (scenario 21: Development→Production bypass rejected) |
| `vitest run tests/agent-routing` | 10 files / 56 tests PASS (11 promotion-profile) |
| `pmo:project:validate` (project manifest) | PASS |
| Eight prohibited bypasses | all `allowed=false` / fail-closed |
| Allowed transitions | all `allowed=true` |
| In-memory four-lane observe (config unchanged) | Development→Production → `halt` / `prohibited_bypass`; unknown profile → `halt` / `unknown_profile`; `mutations=[]` |
| Repository `fourLaneRuntime.enabled` | remains `false` |
| Config-gated observe plan | `class=observe`, `mutations=[]` |

Host artifacts: `/tmp/lgfc-2601-promotion-gates-evidence/observe-promotion-gates.json`.

LIVE-PILOT ACCEPTANCE AMENDMENT item **1** (executable promotion-profile transition / bypass gates) is **satisfied** by the integrated `#2655` matrix plus the observe validation above. It is no longer a residual `#2601` gap.

## Residual acceptance gaps (disclosed)

The following LIVE-PILOT ACCEPTANCE AMENDMENT items remain **not claimed as complete** in this package and need ChatGPT disposition:

1. Live end-to-end Sandbox scaled-gates demo and deliberate Sandbox→Development adoption on a throwaway sandbox surface (not executed in this resume).
2. Enabling `fourLaneRuntime.enabled=true` in repository config for a live observe window (still deliberately `false` pending ChatGPT Go).

## Live-pilot boundary

No fabricated live watcher evidence is accepted. Runner registration and any PR to `main` remain Bill/ChatGPT controlled. Watcher collaboration-dispatch mutations must stay inside the Bill/Atlas engage authorization and must not auto-merge `main`. Do not wake `#2634` until ChatGPT records verified `#2601` closeout.
