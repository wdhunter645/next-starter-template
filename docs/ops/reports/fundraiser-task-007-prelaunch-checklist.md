---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Operational Evidence
Owns: Task 007 pre-launch testing package evidence mapping implementation-plan checklist areas to operator verification
Does Not Own: Product Authority launch authorization, Givebutter configuration, runtime changes, or Task 008 program closeout
Canonical Reference: /docs/how-to/website/fundraiser-pre-launch-testing.md
Related Issues: #1700, #1707, #1706
Last Reviewed: 2026-07-24
---

# Fundraiser Task 007 — Pre-Launch Testing Checklist

## Purpose

Provide the Task 007 evidence artifact that converts the implementation-plan
pre-launch testing checklist into a completable operator package for Task 008
closeout citation.

Assessment date: **2026-07-24**  
Source Issue: **#1707**  
Parent program: **#1700**  
Predecessor: **#1706** (PR #2853)

## Scope

In scope: documentation of the pre-launch verification package and coverage map.  
Out of scope: authorizing a live campaign; runtime feature work; vendor config.

## Current known truth

- Task 006 integrated launch-status + recognition privacy display gates.
- Automated coverage for fail-closed/status/privacy exists in
  `tests/campaignSpotlight.test.tsx`.
- Product Authority launch GO remains a separate human gate.

## Intended final state

Operators and Task 008 can cite this report plus the how-to procedure as the
pre-launch verification package without inventing checklist items.

## Deliverable map

| Artifact | Path |
| --- | --- |
| Operator how-to | `docs/how-to/website/fundraiser-pre-launch-testing.md` |
| This evidence checklist | `docs/ops/reports/fundraiser-task-007-prelaunch-checklist.md` |
| Task 006 as-built | `docs/ops/reports/fundraiser-task-006-campaign-display.md` |

## Implementation-plan checklist coverage

| Check area | Package coverage | Operator evidence to attach before live GO |
| --- | --- | --- |
| Campaign state | How-to §2; Task 001/006 status gates | Screenshot or note of admin launch status + public visibility result per state |
| Approved public links | How-to §3; Task 002 boundary | Approved public URL list; no admin URLs |
| Fail-closed behavior | How-to §4; Task 006 tests | Confirm hidden when missing/invalid/disabled/unpublished/non-public status |
| Homepage spotlight | How-to §5; Task 004 design | Confirm core homepage intact when spotlight absent |
| Leaderboard snapshot | How-to §6; Task 003 rules | Snapshot source + acceptance note |
| Winner rule | How-to §7; Task 003 docs | Confirm no winner label published pre-launch |
| Recognition privacy | How-to §8; Task 005 model | Consent sheet / field allowlist review |
| Accessibility and viewport | How-to §9 | Keyboard + mobile smoke notes |
| Archive behavior | How-to §10 | Ended/archived hide live claims |
| Operator handoff | How-to §11 | External vs LGFC ownership split recorded |

## Package completeness (Task 007 acceptance)

| Item | Status |
| --- | --- |
| How-to procedure with Steps/Procedure | Present |
| Checklist maps all implementation-plan rows | Present |
| Task 006 automated tests cited (no redundant test file required) | Present |
| Explicit non-authorization of live launch | Present |
| Task 008 citation path identified | Present |

## Automated verification pointers (not launch GO)

```bash
npx vitest run tests/campaignSpotlight.test.tsx tests/admin-fundraiser-preview.test.tsx
```

These prove website fail-closed/status/privacy behavior from Task 006. They do
**not** replace Product Authority launch authorization.

## Handoff to Task 008

Task 008 must cite:

1. this checklist report;
2. `docs/how-to/website/fundraiser-pre-launch-testing.md`;
3. Task 001–006 evidence reports;
4. any remaining deferred work (winner UI, live campaign GO, main promotion).

## Non-goals

- Closing parent #1700
- Configuring Givebutter
- Promoting to production
