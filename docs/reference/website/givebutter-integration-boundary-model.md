---
Doc Type: Reference
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Controlled
Owns: Givebutter versus LGFC website ownership boundary, approved public link/embed rules, prohibited public data, and data-ownership expectations for fundraiser campaign surfaces
Does Not Own: Givebutter account configuration, payment processing, leaderboard calculation rules (Task 003), donor privacy field schema (Task 005), or website runtime implementation (Task 006)
Canonical Reference: /docs/reference/website/fundraiser-launch-state-model.md
Related Issues: #1700, #1702, #1701, #1696
Last Reviewed: 2026-07-23
---

# Givebutter Integration Boundary and Data Ownership Model

## Purpose

Separate external Givebutter campaign ownership from LGFC website, config, and
display ownership so later tasks can define leaderboard, recognition, and
runtime behavior without treating vendor systems as LGFC source of truth.

## Scope

In scope:

- external vs LGFC ownership matrix;
- approved public campaign link and embed boundaries;
- prohibited public use of private/admin/vendor URLs and raw exports;
- website-side data ownership and retention expectations;
- explicit assumptions Task 003 may and may not make.

Out of scope:

- creating or configuring Givebutter accounts/campaigns;
- storing Givebutter API tokens, secrets, or payment credentials in the repo;
- donation, refund, tax-receipt, or settlement processing;
- scraping live donor feeds for public display;
- runtime route/component implementation (Task 006).

## Current known truth

- Program #1700 is executing on
  `component/fundraiser-charity-campaign-operations`.
- Task 001 defined canonical launch states and operator flow; this Task 002
  document owns the external/internal boundary used by that flow.
- Givebutter (or equivalent external campaign vendor) owns campaign setup,
  donations, and payment processing.
- LGFC website owns only approved public display, fail-closed campaign state,
  and deterministic snapshot/import display after operator approval.
- Public surfaces must not assume live vendor connectivity.

## Intended final state

Operators and implementers can answer, without inference:

1. what Givebutter owns;
2. what LGFC website/config/display owns;
3. which URLs/fields may appear publicly;
4. which vendor exports remain private;
5. that Task 003 must use snapshot/import rules, not raw live donor data.

## Ownership matrix

| Surface | Owner | LGFC may | LGFC must not |
| --- | --- | --- | --- |
| Vendor account / campaign admin | Human operator + Givebutter | Reference campaign identity in private operator notes | Create/configure campaigns from repo tasks |
| Donations / payments / refunds | Givebutter | Link to approved public donate URL | Process cards, store payment data, issue receipts |
| Auction / raffle mechanics | Givebutter / human operator | Show approved public summary/link | Administer legal rules or settlement |
| Public campaign CTA / spotlight | LGFC after authorization | Display approved public fields by launch state | Claim live status without Product Authority GO |
| Leaderboard display | LGFC after Task 003 rules | Show approved snapshot/import rows | Treat live vendor donor feed as authoritative |
| Winner publication | LGFC after approval + privacy model | Publish privacy-safe label | Publish private donor identity from raw exports |
| Sponsor/donor recognition | LGFC after Task 005 | Show approved public recognition fields | Publish email/phone/address/payment/raw txn IDs |

## Approved public link and embed boundaries

### Link-first rule

Default public integration is an **operator-approved public campaign URL**.

Allowed when all are true:

- URL is the public Givebutter (or vendor) campaign page, not an admin console;
- Product Authority / designated operator recorded approval for public use;
- campaign launch state permits public live claims (`active`) or approved
  non-live messaging for other states;
- link target does not embed secrets, private tokens, or admin query params.

### Embed rule

Embeds are **not default**. An embed is allowed only when:

1. link-first is insufficient for an accepted product decision;
2. embed source is the approved public campaign surface;
3. Task 004 / Product Authority explicitly accepts embed behavior;
4. fail-closed fallback exists if the embed cannot load.

Until that acceptance exists, website work must remain link-first.

## Prohibited public material

Public website surfaces must never display or deep-link:

- Givebutter admin, dashboard, settings, payout, or login URLs;
- private campaign preview URLs intended for operators only;
- raw campaign CSV/JSON exports, transaction dumps, or API payloads;
- donor email, phone, address, payment instrument data, or raw transaction IDs;
- internal operator notes or unapproved recognition lists;
- repository secrets, API tokens, webhook secrets, or environment values.

Private/admin material may exist only in private operator systems outside the
public site. Repository docs may describe the boundary; they must not contain
live credentials.

## Website-side data ownership

LGFC may own and retain:

- campaign display config references (title, approved public URL, dates, state);
- operator-approved spotlight copy and eligibility flags;
- imported/approved leaderboard snapshots (Task 003 schema);
- approved recognition display records (Task 005 schema);
- evidence checklists and launch-state records.

LGFC does not own:

- live Givebutter donation ledger as website truth;
- payment settlement state;
- vendor-side donor account records.

Retention: website-side public config and approved snapshots are retained per
normal LGFC content/ops practice. Raw vendor exports used for internal review
must stay out of public repos and public routes.

## Assumptions for Task 003 (leaderboard / winner)

Task 003 **may** assume:

- leaderboard/winner inputs come from operator-approved snapshot or import;
- public display fields are privacy-filtered before publication;
- website can fail closed when no approved snapshot exists.

Task 003 **must not** assume:

- continuous live Givebutter donor API access from the website;
- raw export columns are safe for public display;
- vendor ranking UI is LGFC’s canonical winner authority.

## Operator actions outside the repository

Human operators remain responsible for:

1. Givebutter account and campaign configuration;
2. payment/payout settings and compliance obligations;
3. approving the public campaign URL used by LGFC;
4. exporting or preparing any snapshot source offline when needed;
5. recording Product Authority launch/pause/end decisions on the controlling Issue.

## Repository secret rule

No Givebutter token, webhook secret, payout credential, or payment key may be
committed to this repository or embedded in public client code. Website tasks
that need a public URL store only the approved public URL string.

## Relationship to later tasks

| Task | Uses this boundary for |
| --- | --- |
| #1703 | Snapshot-based leaderboard/winner rules |
| #1704 | Link-first / embed acceptance for campaign surfaces |
| #1705 | Recognition fields without raw vendor PII |
| #1706 | Fail-closed display of approved public references only |
| #1707 | Pre-launch checks that public links are non-admin |
| #1708 | Operator handoff of external vs website ownership |

## Non-goals

- Authorizing a live campaign
- Implementing Givebutter API clients
- Replacing Task 001 launch-state vocabulary
- Defining final privacy field lists (Task 005)
