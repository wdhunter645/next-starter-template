---
Doc Type: Reference
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Controlled
Owns: Fundraiser leaderboard scoring rules, snapshot cadence, deterministic winner calculation, tiebreakers, and privacy-safe publication gates
Does Not Own: Runtime scoring implementation, Givebutter live API ingestion, donor privacy field schema (Task 005), or campaign surface UI design (Task 004)
Canonical Reference: /docs/reference/website/givebutter-integration-boundary-model.md
Related Issues: #1700, #1703, #1702, #1701
Last Reviewed: 2026-07-23
---

# Fundraiser Leaderboard and Winner Rules

## Purpose

Define deterministic, privacy-safe leaderboard and winner behavior for LGFC
fundraiser campaigns so website surfaces never treat raw live vendor donor data
as public truth.

## Scope

In scope:

- scoring basis and eligibility;
- snapshot cadence and authority;
- winner calculation and tiebreakers;
- operator approval and privacy-safe publication;
- manual override and evidence requirements.

Out of scope:

- implementing runtime scorers or cron jobs (Task 006+);
- Givebutter account configuration;
- final donor/sponsor recognition field lists (Task 005);
- homepage/spotlight layout (Task 004).

## Current known truth

- Task 002 requires snapshot/import inputs; live Givebutter donor feeds are not
  website source of truth.
- Task 001 launch states gate when public claims are allowed; winner publication
  is an `ended` (or explicitly authorized announcement) gate.
- Default public recognition is anonymous, aggregated, tiered, or consent-based
  until Task 005 finalizes fields.

## Intended final state

Operators can produce an auditable leaderboard snapshot, compute a deterministic
winner with documented tiebreakers, and publish only a privacy-safe label after
Product Authority approval—without scraping or exposing raw donor PII.

## Scoring rules

| Rule | Definition |
| --- | --- |
| Scoring basis | Total eligible contribution amount attributed to a display competitor for the campaign window, as recorded in the approved snapshot |
| Currency | Snapshot amounts must use one declared currency for the campaign |
| Eligibility | Only rows marked `eligible=true` in the approved snapshot participate |
| Ineligible examples | Refunded/voided gifts (when known), operator-disqualified entries, test gifts marked non-scoring |
| Competitor identity | Snapshot uses a privacy-safe `display_label` (not email/phone/address) |
| Ranking order | Descending by eligible amount; ties resolved by tiebreaker rules below |

Scoring inputs come only from an **operator-approved snapshot or import package**.
Website code must not scrape Givebutter admin pages or treat live vendor ranking
UI as LGFC authority.

## Snapshot cadence and authority

| Topic | Rule |
| --- | --- |
| Cadence (default) | Operator-scheduled snapshots at least daily during `active`, plus a final closeout snapshot after entering `ended` |
| Ad-hoc snapshots | Allowed for incident review or pause windows; must be labeled and timed |
| Authority | Human operator prepares snapshot; Product Authority or designated reviewer accepts the snapshot used for public leaderboard/winner |
| Immutability | A snapshot used for winner calculation is frozen and versioned (`snapshot_id`, timestamp, preparer, hash/checksum when available) |
| Missing snapshot | Public leaderboard fails closed (hidden/empty-safe); no invented ranks |

## Deterministic winner calculation

1. Load the approved closeout snapshot (`snapshot_id`).
2. Filter to `eligible=true` rows.
3. Sort by eligible amount descending.
4. Apply tiebreakers until a single winner is selected, or document a shared-win
   outcome if Product Authority authorizes a tie publication.
5. Record winner `display_label`, amount (optional public), `snapshot_id`, and
   calculation notes in the evidence package.
6. Do **not** publish until winner publication gate passes.

## Tiebreakers (ordered)

Apply in order until the tie breaks:

1. Earlier first eligible contribution timestamp in the snapshot (if present).
2. Lexicographic ascending `display_label` (case-insensitive).
3. Operator-recorded deterministic seed documented before campaign `active`
   (optional campaign-specific rule).
4. If still tied: no automatic single winner — escalate to Product Authority for
   shared-win or redraw decision; record the decision.

## Privacy-safe publication

Public leaderboard/winner display may include only:

- approved `display_label`;
- rank and/or approved amount/tier fields when Product Authority allows;
- snapshot as-of timestamp.

Public display must not include:

- email, phone, address;
- payment details or raw transaction IDs;
- unapproved legal names when consent is absent;
- raw vendor export columns.

Winner publication additionally requires:

1. campaign in `ended` (or explicitly authorized announcement window);
2. approved closeout snapshot identity;
3. privacy-safe label review (Task 005 fields when available);
4. Product Authority approval on the controlling Issue.

## Manual override and evidence

Manual overrides are allowed only when:

- recorded on the controlling Issue with authority, reason, and timestamp;
- prior calculation evidence is retained;
- the override does not introduce prohibited PII into public surfaces.

Minimum evidence package:

- `snapshot_id` and acceptance record;
- calculation worksheet or equivalent notes;
- tiebreaker path used;
- winner approval comment;
- publication timestamp and surface checklist.

## Boundaries for Task 004

Campaign surfaces may assume:

- leaderboard is optional and fail-closed without an approved snapshot;
- winner module appears only after approval;
- no live vendor feed dependency for ranking.

Campaign surfaces must not assume continuous real-time donor updates.

## Non-goals

- Live scraping of Givebutter
- Automatic public winner announcement without approval
- Runtime implementation in this task
