---
Doc Type: How-To
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Operational Procedure
Owns: Operator procedure for preparing leaderboard snapshots, calculating winners, obtaining approval, and publishing privacy-safe results
Does Not Own: Runtime scorers, Givebutter configuration, privacy field schema finalization, or campaign launch authorization
Canonical Reference: /docs/reference/website/fundraiser-leaderboard-winner-rules.md
Related Issues: #1700, #1703, #1702
Last Reviewed: 2026-07-23
---

# Fundraiser Leaderboard and Winner Operations

## Purpose

Operate LGFC fundraiser leaderboard and winner workflows using approved snapshots
only, with deterministic calculation and privacy-safe publication.

## Scope

In scope:

- snapshot preparation and acceptance;
- ranking and winner calculation steps;
- tiebreaker application;
- approval and publication checks;
- evidence capture.

Out of scope:

- configuring Givebutter;
- storing secrets;
- publishing raw donor exports;
- implementing website runtime (Task 006).

## Current known truth

- Rules authority:
  [`fundraiser-leaderboard-winner-rules.md`](/docs/reference/website/fundraiser-leaderboard-winner-rules.md)
- Vendor boundary:
  [`givebutter-integration-boundary-model.md`](/docs/reference/website/givebutter-integration-boundary-model.md)
- Launch states:
  [`fundraiser-launch-state-model.md`](/docs/reference/website/fundraiser-launch-state-model.md)
- Live vendor donor feeds are not public source of truth.

## Steps

1. Confirm campaign identity and launch state.
2. Prepare or obtain an operator snapshot/import package.
3. Get snapshot acceptance recorded.
4. Calculate ranks and winner using documented rules.
5. Obtain Product Authority publication approval for winner (when publishing).
6. Publish only privacy-safe fields; capture evidence.

## Procedure

### 1. Prepare snapshot

1. Export or assemble contribution rows offline from the approved vendor source.
2. Map each row to a privacy-safe `display_label` and eligible amount.
3. Mark eligibility (`eligible=true/false`) with reasons for exclusions.
4. Assign `snapshot_id`, timestamp, preparer, and checksum/hash when available.
5. Store raw export privately outside public website/repo surfaces.

### 2. Accept snapshot

1. Review eligibility exclusions and label safety.
2. Confirm currency and campaign window match the active campaign package.
3. Record acceptance (who/when/`snapshot_id`) on the controlling Issue or evidence report.

### 3. Calculate leaderboard

1. Filter eligible rows.
2. Sort by amount descending.
3. Apply tiebreakers from the rules document.
4. Produce ranked list for internal review and, if authorized, public display fields only.

### 4. Calculate winner

1. Use the approved closeout snapshot.
2. Select top eligible row after tiebreakers, or escalate true ties.
3. Draft winner publication packet: `display_label`, `snapshot_id`, calculation notes.

### 5. Publish (gated)

1. Confirm campaign is `ended` or an authorized announcement window exists.
2. Confirm Product Authority approval for the public winner label.
3. Confirm no prohibited PII in the publication payload.
4. Publish to approved website surfaces only.
5. If approval is missing, keep public winner module fail-closed.

### 6. Capture evidence

Complete
[`fundraiser-task-003-leaderboard-checklist.md`](/docs/ops/reports/fundraiser-task-003-leaderboard-checklist.md)
for the campaign instance.

## Verification

- Calculation can be replayed from the frozen snapshot to the same winner.
- Public payload excludes prohibited PII.
- Missing snapshot or missing approval fails closed.

## Stop conditions

Stop and escalate when:

- only live vendor UI ranking is available (no snapshot);
- tie remains after documented tiebreakers without Product Authority decision;
- requested public fields include prohibited PII;
- launch-state gate for winner publication is not met.
