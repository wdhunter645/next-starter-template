---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor
Authority Level: Operational Plan (non-authoritative; supplements PR lifecycle and parallel-agent rules)
Owns: Review throttle and PR queue rules for Content Collection parallel Cursor work under #2359
Does Not Own: PR lifecycle state machine, merge authorization, gate implementation, or reviewer assignment automation
Canonical Reference: /docs/governance/PR_LIFECYCLE_STATE_MACHINE.md
Related Issues: #2364, #2359, #2360, #2391, #2396
Last Reviewed: 2026-07-10
---

# Review Throttle and PR Queue Standard — Content Collection

## Purpose

Prevent parallel Content Collection Cursor work from overwhelming ChatGPT/Bill review, merge authorization, or post-merge validation capacity. This standard operationalizes throttle rules without weakening parser-safe PR discipline or mandatory gates.

## Scope

**In scope:**

- Default PR queue limits for #2359 Phase 0 and downstream implementation waves.
- PR queue states aligned with `PR_LIFECYCLE_STATE_MACHINE.md`.
- Throttle, merge-order, and pause conditions.
- Integration with `docs/ops/pmo/parallel-agent-rules.md` and queue-watch protocol.

**Out of scope:**

- Bypassing required CI/governance gates for throughput.
- Auto-merge or agent merge authorization.
- Creating labels for queue states (use PR lifecycle + issue comments).

## Current known truth

| Authority | Rule |
| --- | --- |
| PR lifecycle | `docs/governance/PR_LIFECYCLE_STATE_MACHINE.md` — DRAFT → READY FOR REVIEW → READY FOR MERGE → human merge |
| Parallel agents | `docs/ops/pmo/parallel-agent-rules.md` — one implementation PR per active task |
| Queue watch | `docs/ops/pmo/queue-watch-and-dispatch-protocol.md` — dispatcher must not leave silent stalls |
| Handoff | `docs/ops/ai/chatgpt-cursor-handoff-workflow.md` — `CHATGPT HANDOFF` at PR open |
| Phase 0 playbook | `docs/how-to/ops/content-collection-phase0-launch-playbook.md` — issue-first before PR |

**C8 warning (#2360):** Raw promotion of accelerated/continuous-execution language could weaken gate posture. This standard preserves full gate and parser requirements.

## Default queue limits

| Limit | Default | Exception |
| --- | --- | --- |
| Ready-for-review PRs (awaiting ChatGPT/Bill) | **2–3 max** | Bill/ChatGPT may raise temporarily with explicit authorization |
| Implementation PRs in progress (draft + active) | **3 max** after content model freeze | **4 max** only with clean allowlists and explicit parallel authorization |
| Six simultaneous full implementation PRs | **Not authorized** | — |
| Phase 0 docs-only wave (#2360–#2365) | **Serial preferred** | Parallel only when Bill/ChatGPT authorize (e.g. #2366 lessons register) |

## PR queue states (mapped to lifecycle)

Use GitHub PR state + PR body/lifecycle language. Do not invent parallel issue labels for PR queue position.

| Practical queue state | PR lifecycle mapping | Cursor action |
| --- | --- | --- |
| Draft / in progress | DRAFT | Continue implementation; do not demand review |
| Ready for review | READY FOR REVIEW | Post `CHATGPT HANDOFF`; wait for review |
| Review requested | READY FOR REVIEW | Address threads; do not open competing PR for same task |
| Changes requested | READY FOR REVIEW (blocked) | Remediate before new same-lane PR |
| Ready for merge authorization | READY FOR MERGE | Wait for Bill merge decision |
| Merged pending validation | MERGED (post-merge) | Follow closeout protocol |
| Validation failed | MERGED + remediation | Halt queue advance; follow post-merge runbook |
| Validated / complete | CLOSEOUT VERIFIED | Record successor disposition |

## Throttle rules

1. **Do not** move more than **3 PRs** to READY FOR REVIEW simultaneously (pause at 3).
2. **CI/admin PRs** should not crowd out product verification PRs unless they unblock implementation (e.g. gate fix).
3. **Same-lane remediation:** A lane with changes requested must be remediated before starting a new same-lane PR.
4. **Hot-zone rule:** A hot-zone PR must merge or close before another hot-zone PR starts (see parallel execution / worktree standard when promoted).
5. **Draft staging:** Draft PRs may exist for parallel prep but must not demand review until capacity exists.
6. **One task → one PR:** No competing implementation PRs for the same source issue without program owner exception (`parallel-agent-rules.md` Rule 1).
7. **Issue-first (#2364):** Post enrichment findings in issue thread before opening PR when Bill/ChatGPT collaboration rule applies.

## Merge order guidance (Content Collection program)

Recommended merge order after foundation freeze:

| Order | Lane | Dependency |
| ---: | --- | --- |
| 1 | CC-001 / CC-002 content model and rights contracts | #2361 packages; CONTRACT-FROZEN marker |
| 2 | CI Stage 0 / CI-001 / CI-002 support | If needed to unblock gates — serialize with feature lanes |
| 3 | Gallery, Library, Memorabilia | After CONTRACT-FROZEN |
| 4 | Club newspaper | After shared shell risk controlled |
| 5 | VAL-001 program validation / as-built closeout | Terminal |

Phase 0 docs promotion (#2360–#2365) follows serial child chain in launch playbook regardless of feature merge order.

## Pause conditions (stop new PR creation)

Pause and post `CHATGPT HANDOFF` when:

| Condition | Action |
| --- | --- |
| 3 or more PRs waiting for review | Hold new READY FOR REVIEW transitions |
| Shared contract changes after dependent work started | Halt dependent lanes; assess rework |
| Hot-zone path collision | Pause affected lane (risk R-003) |
| Validation backlog blocks reliable closeout | Halt queue advance per closeout protocol |
| ChatGPT/Bill review capacity exceeded | Keep new work in draft; document in issue |
| Required gate failure on PR head | Fix or document blocker — do not claim ready |
| Post-merge failure without disposition | Follow `docs/how-to/ci/merged-pr-failed-pre-gate-followup.md` |

## Dispatcher integration

When throttle pause triggers:

1. Record halt reason on source issue or parent #2359.
2. Request `agent:ChatGPT` if governance decision needed.
3. Do not advance Cursor wake labels to next task until pause clears or Bill authorizes parallel exception.
4. Apply `docs/ops/pmo/queue-watch-and-dispatch-protocol.md` checklist.

## Procedure

### Before opening a PR

1. Check open PR count in ready-for-review state.
2. Confirm no same-task competing PR.
3. Confirm issue-thread collaboration complete (Phase 0 child issues).
4. Seed PR body from `.github/pull_request_template.md`.

### When marking ready for review

1. Run task-relevant local validation.
2. Update PR body allowlist to match final diff.
3. Post `CHATGPT HANDOFF` on source issue with PR link and evidence.
4. If queue at limit, keep PR draft and note in handoff.

### After merge

1. Follow `docs/ops/pmo/github-issue-closeout-protocol.md`.
2. Record successor unblock/halt on predecessor or parent issue.
3. Set Cursor wake labels on next task only when throttle allows.

## Acceptance criteria

- [ ] Each parallel wave has defined PR ceiling, review order, and pause conditions.
- [ ] Rules align with PR lifecycle — no gate bypass language.
- [ ] Draft vs ready-for-review behavior is explicit.
- [ ] Integration with queue-watch and handoff workflows documented.
- [ ] C8 conflict avoided — procedural preclearance only, not merge authorization drift.

## Source intake mapping

| Intake draft | Enriched doc |
| --- | --- |
| `LGFC Review Throttle and PR Queue Standard — Content Collection Draft.docx` | This file |

Disposition per #2360: conditional merge — enriched here with repo authority links. Deferred raw promote until conflict review (C8) — addressed by explicit gate preservation above.
