---
Doc Type: Operations
Audience: Bill, ChatGPT / Atlas / WORK, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2665 first-increment Phase 0 authority index, Phase 0 acceptance checklist (with advisory-dependent items marked pending), unresolved-decision register, and explicit Phase 1 launch HOLD recommendation
Does Not Own: Grok advisory recommendations (#2464), #2934 advisory-disposition increment, canonical zone/rotation/ops contracts (#2662/#2663/#2664 owners), Phase 1 runtime implementation, or Bill / WORK final Phase 0 acceptance decision
Canonical Reference: /docs/ops/implementation-plans/club-newspaper-phase1.md
Related Issues: #2461, #2463, #2464, #2661, #2662, #2663, #2664, #2934, #2665
Last Reviewed: 2026-08-06
---

# Club Newspaper Phase 0 Acceptance Framework (#2665)

## Purpose

Provide the Phase 0 authority index and acceptance checklist so Bill / WORK can accept Phase 0 against accepted #2661–#2664 plus #2934 increment-1 evidence — without inventing #2464 advisory recommendations or launching Phase 1.

## Scope

In scope: authority index; acceptance checklist with advisory-dependent rows marked **PENDING**; unresolved Product / rights / architecture / cost / Production decisions only; explicit HOLD for Phase 1 launch.

Out of scope: fabricating Grok recommendations or dispositions; editing canonical design/ops authority; runtime UI/API/schema/migration/D1/B2/Production changes; creating Phase 1 Issues or opening Production commitments.

## Current known truth

- Parent project: #2463 on component branch `component/club-newspaper-phase0`.
- Phase 0 children #2661–#2664 are accepted and closed; their reports and contracted canonical docs exist on this tip.
- #2934 increment 1 (advisory evidence packet) is WORK-accepted; merged via PR #3112 at `2780523ec7f3e9174c231378aae8485e1170fbf3`.
- #2464 remains open with **no** recorded Grok recommendation set.
- #2934 advisory-disposition increment and final #2665 incorporation remain separately gated on actual #2464 recommendations.
- Club Newspaper runtime surface is Club Home at `/fanclub` (no separate `/newspaper` route).

## Intended final state

- Bill / WORK can accept or return Phase 0 using this checklist without rediscovering authority from chat.
- Advisory-dependent acceptance rows stay visibly **PENDING** until #2934 disposition is accepted.
- Phase 1 launch remains on HOLD until that disposition and Bill / WORK Phase 0 acceptance complete.
- Companion plan `docs/ops/implementation-plans/club-newspaper-phase1.md` is the executable Phase 1 launch package once gates clear.

## Component identity

| Field | Value |
| --- | --- |
| Component / PR target | `component/club-newspaper-phase0` |
| Starting SHA (this package) | `2780523ec7f3e9174c231378aae8485e1170fbf3` |
| Working branch | `cursor/2463-006-newspaper-phase1-launch-package` |
| Predecessor | #2934 increment 1 WORK-accepted |
| Writable allowlist (this increment) | this file + `docs/ops/implementation-plans/club-newspaper-phase1.md` |

---

## 1. Final Phase 0 authority index

### Accepted task reports (exist on starting SHA)

| Task | Issue | Report | Status |
| --- | --- | --- | --- |
| #2463-001 | #2661 | `docs/ops/reports/club-newspaper-authority-disposition-2661.md` | Accepted / closed |
| #2463-002 | #2662 | `docs/ops/reports/club-newspaper-layout-contract-2662.md` | Accepted / closed |
| #2463-003 | #2663 | `docs/ops/reports/club-newspaper-selection-rotation-2663.md` | Accepted / closed |
| #2463-004 | #2664 | `docs/ops/reports/club-newspaper-technical-map-2664.md` | Accepted / closed |
| #2463-005 inc. 1 | #2934 | `docs/ops/reports/club-newspaper-advisory-verification-2934.md` | WORK-accepted increment 1 (PR #3112) |

### Canonical contracts updated or retained by Phase 0

| Path | Role | Owning task trail |
| --- | --- | --- |
| `docs/reference/design/fanclub-home.md` | Zone / responsive / accessibility contract | #2662 (+ retained by #2661) |
| `docs/reference/design/fanclub.md` | FanClub nav/routes; Club Home section-order pointer hygiene | #2662 (stale subsection fixed per #2661 disposition) |
| `docs/explanation/website/content-strategy.md` | Rotation / media-pairing / edition contract section | #2663 |
| `docs/how-to/website/club-home-content-operations-runbook.md` | Operator publish / verify / troubleshoot | #2664 |
| `docs/reference/website/content-inventory-model.md` | `content_inventory` / media association model | Retained (#2661) |
| `docs/ops/implementation-plans/content-collection/packages/club-001-club-newspaper-design-package.md` | CLUB-001 implementation envelope | Retained (#2661) |
| `docs/ops/pmo/program-3-club-home-page-design.md` | Planning depth for unimplemented newspaper items | Retained as planning source (#2661) |
| `docs/explanation/lgfc-content-collection-strategy.md` | Story-centric archive rationale | Retained |
| `docs/explanation/lgfc-design-evolution.md` | Newspaper presentation rationale | Retained |

### Product / advisory / project Issues

| Issue | Role | Status relative to Phase 0 acceptance |
| --- | --- | --- |
| #2461 | Product visual / rotation / admin requirements source | Authoritative Product input |
| #2463 | Phase 0 project master | Open; sequencing authority |
| #2464 | Grok advisory review | Open; **no recommendations yet** — advisory-dependent |
| #2934 | Advisory verification + later disposition | Increment 1 accepted; disposition increment **PENDING** |
| #2665 | This acceptance / Phase 1 launch-package task | First increment executable now; final incorporation **PENDING** advisories |

### Live runtime anchors (verified in #2934 packet; not re-audited here)

Club Home shell at `src/app/fanclub/page.tsx` + `ClubHome*` components; `GET /api/fanclub/home`; rotation / club-home / media libs; admin editorial APIs under `functions/api/admin/editorial/`; focused tests listed in #2664 / #2934. Absence of `/newspaper` route and edition APIs is intentional current truth.

---

## 2. Phase 0 acceptance checklist

Use **PASS** / **FAIL** / **PENDING**. Only Bill / WORK records acceptance. Cursor does not self-accept.

### A. Authority coherence (executable now)

| ID | Criterion | Expected evidence | Status |
| --- | --- | --- | --- |
| A1 | #2661 disposition map accepted; no open genuine Product-direction contradiction among retained authorities | #2661 report + closed Issue | Ready for WORK judgment |
| A2 | Zone / responsive / a11y contract present in `fanclub-home.md`; evidence report #2662 accepted | Canonical doc + #2662 report | Ready for WORK judgment |
| A3 | Rotation / media / edition contract present in `content-strategy.md`; evidence report #2663 accepted | Canonical doc + #2663 report | Ready for WORK judgment |
| A4 | Editorial as-built map + runbook updates accepted (#2664) | #2664 report + runbook | Ready for WORK judgment |
| A5 | #2934 increment-1 evidence packet present and WORK-accepted | PR #3112 / report path | Ready for WORK judgment (predecessor gate already recorded as accepted) |
| A6 | Diff for this increment contains only the two allowlisted docs | PR file list | Ready at PR time |

### B. Advisory-dependent (must stay PENDING)

| ID | Criterion | Why pending | Status |
| --- | --- | --- | --- |
| B1 | #2464 Grok recommendations recorded | No recommendation set exists | **PENDING** |
| B2 | #2934 disposition increment Accept/Reject/Defer against real recommendations | Blocked on B1 | **PENDING** |
| B3 | Final #2665 incorporation of accepted advisory outcomes into Phase 0 / Phase 1 package | Blocked on B2 | **PENDING** |
| B4 | Any Phase 0 contract amendments required by accepted advisories | Unknown until B2 | **PENDING** |

### C. Launch gate (must stay HOLD until A + B complete)

| ID | Criterion | Status |
| --- | --- | --- |
| C1 | Bill / WORK Phase 0 acceptance recorded | **HOLD** until A judged + B cleared or explicitly waived by Product/WORK with written scope |
| C2 | Phase 1 master Issues created / released from `club-newspaper-phase1.md` | **HOLD** — do not launch |
| C3 | Production merge / Production Go for Club Newspaper Phase 1 | **HOLD** — prohibited by this package |

---

## 3. Unresolved-decision register

Limited to Product, rights/privacy, architecture, cost, or Production authority. No invented advisory content.

| ID | Decision | Class | Owner | Notes |
| --- | --- | --- | --- | --- |
| D1 | Keep `recognition` / `submission-cta` below-the-fold vs move to side-rail (#2461 candidate language) | Product | Product Authority | Open design note from #2662 / `fanclub-home.md` |
| D2 | Which Phase 0 contracts may be amended vs require new Issues when #2464 recommendations arrive | Product / WORK process | WORK after #2464 | Blocked on missing recommendations |
| D3 | Timing of takedown/suppress field reconciliation vs `component/compliance-readiness` (#2919) | Architecture / integration | PMO | Cross-branch; not on this tip |
| D4 | Whether edition persistence implies a cache / precompute layer for `GET /api/fanclub/home` | Architecture | Engineering + Product | Risk noted in #2664; no design chosen |
| D5 | Cost of media-rendition generation/storage (B2, CPU, retention) | Cost | Product + Engineering | Gap documented; no provider commitment |
| D6 | Production Go criteria for first visible Phase 1 slice | Production | Bill / Production authority | Explicitly not granted by this package |

---

## 4. Explicit HOLD recommendation

**HOLD Phase 1 launch** until all of the following are true:

1. Bill / WORK records Phase 0 acceptance against checklist sections A (and any waived B items with written waiver).
2. Actual #2464 recommendations exist and #2934 disposition increment is WORK-accepted — **or** Product/WORK records a written decision that Phase 1 may start without advisory incorporation, with B rows remaining out of scope for that launch wave.
3. The companion plan `docs/ops/implementation-plans/club-newspaper-phase1.md` is used as the only launch package (no chat-inferred child scopes).
4. No Production merge is attempted from this component work without separate Production authority.

This increment prepares the launch package; it does **not** authorize creating Phase 1 runtime Issues, opening runtime PRs, or Production promotion.

---

## 5. Validation (local)

- `bash scripts/ci/docs_check_headers.sh docs/ops/reports/club-newspaper-phase0-acceptance-2665.md docs/ops/implementation-plans/club-newspaper-phase1.md`
- `node scripts/ci/diataxis_folder_audit.mjs`
- `git diff --check`
- Confirm cited authority paths exist at starting SHA `2780523ec7f3e9174c231378aae8485e1170fbf3`
- Confirm PR diff contains only the two allowlisted files

## Rollback

Documentation-only two-file component PR. Revert that PR. No runtime or data recovery.

## Boundaries confirmation

- No #2464 recommendations invented.
- No Accept/Reject dispositions recorded for advisories.
- No canonical design/ops authority edited.
- No runtime / schema / D1 / B2 / credential / Production mutation.
- Phase 1 remains on HOLD per §4.
