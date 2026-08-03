---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Project #2779 Task 001 (#2894) recovery inventory, owners, RPO/RTO targets, credential boundaries, and isolated test plans
Does Not Own: Live restore execution (#2895–#2896), Production recovery activation, secret values, paid backup products, or Day-2 incident closeout
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2779, #2894, #2778, #2890
Last Reviewed: 2026-08-03
---

# Platform recovery readiness — inventory, owners, and targets (#2894)

## Purpose

Task **#2779-001 / #2894** deliverable: consume the #2778 / #2890 platform
inventory and map every launch-critical source, configuration, deployment, D1,
B2, and evidence asset to backup method, retention, RPO/RTO, credential
boundary, owner, tested/untested status, and an isolated non-Production test
plan.

This report defines recoverability targets. It does **not** execute restore,
rollback, or Production recovery.

## Scope

- Consume #2778 inventory evidence (primarily #2890 matrix; #2891–#2893 for
  validation and ownership context).
- Apply #2779 launch-package recovery design decisions and zero-added-cost
  baseline.
- No secret values (names and presence boundaries only).
- No Cloudflare, D1, or B2 writes; no destructive restore; no Production
  mutation; no paid backup product introduction.
- Successor restore proofs remain serial: #2895 (D1/B2), #2896
  (source/config/deploy + integrated DR), #2897 (qualification/handoff).

Assessment identity:

| Field | Value |
| --- | --- |
| Observed at (UTC) | 2026-08-03T17:16:07Z |
| Actor role | Implementation / Operations (Cursor Local) |
| Source issue | #2894 |
| Parent project | #2779 |
| Component branch | `component/platform-recovery-readiness` |
| Base SHA inspected | `5287b4656bfc2a6b46d2ba2e16d01ae30133f077` (`origin/main` at branch creation) |
| #2778 inventory source | `docs/ops/reports/platform-production-validation-repository-live-inventory.md` on `component/platform-production-validation` @ `83043d8ca721115e109f66981deb24ab2387419c` (#2890) |
| #2778 integrated tip (context) | `component/platform-production-validation` @ `72e0943661dfe4dc2e0dafdb286630f159e8f5cc` (post-#2893) |

## Executive summary

Launch-critical recoverability is inventoriable from existing repository and
provider capabilities under a **zero-added-cost** baseline. Provider durability
and #2778 read-only validation are **not** restore proofs.

| Class | Target RPO | Target RTO | Proven restore? |
| --- | --- | --- | --- |
| Source / configuration | Last accepted Git commit | 4 hours | **Untested** (procedure exists; no #2896 exercise yet) |
| Deployment / runtime | Last accepted immutable Pages candidate | 2 hours | **Untested** (rollback runbook exists; no measured exercise yet) |
| D1 operational data | 24 hours | 8 hours | **Untested** (export/isolated restore deferred to #2895) |
| B2 media objects | 24 hours (catalog/index); provider-retained object durability | 24 hours | **Untested** (version keep-all declared; isolated recovery deferred to #2895) |
| Operational evidence | Last accepted Issue/PR/report commit or GitHub record | 4 hours (reconstruct documentation) | **Partial** (Git/GitHub retention assumed; not disaster-tested) |

Primary gaps handed to successors:

1. No measured D1 export → isolated restore → application-compat evidence.
2. No measured B2 object/catalog recovery with D1 reference reconciliation.
3. No timed source/config/deployment rollback exercise against an immutable
   candidate.
4. Live Cloudflare API inventory remains an authorized-operator follow-up from
   #2890 D-006 (does not block this inventory definition).

## Authority and design inputs

| Input | Role |
| --- | --- |
| #2779 launch package recovery design decisions | Binding RPO/RTO classes, isolation, unproven-until-tested rule, Production activation boundary, zero-cost baseline |
| #2890 inventory matrix + drift register | Asset identity, owners, production-shared truth, secret **names** |
| `docs/governance/OPERATIONS-AND-RECOVERY.md` | Day-2 recovery activation and hold policy |
| `docs/how-to/website/website-production-rollback.md` | Pages redeploy of last known-good commit |
| `docs/how-to/ops/run-emergency-recovery.md` | Stabilization-first emergency path |
| `docs/reference/delivery/delivery-and-rollback-profiles.md` | Rollback profile metadata |
| `docs/reference/platform/Backblaze_B2.md` | Bucket `LouGehrigFanClub`; keep-all versions; no replication |
| `docs/reference/platform/CLOUDFLARE.md` / `wrangler.toml` | Pages/D1 declared identity |
| #2893 ownership / qualification (component) | Platform validation ownership context; not recovery proof |

## Zero-cost baseline (explicit)

Baseline recovery design uses only capabilities already authorized or free at
current plan levels:

- GitHub Git history and repository contents for source/config.
- Cloudflare Pages deployment history / redeploy of a known-good candidate.
- Cloudflare D1 export/restore tooling available to the account without a new
  paid backup product (exact export procedure proven in #2895).
- Backblaze B2 keep-all versions and existing object listing/sync scripts
  (`scripts/b2_*`) without enabling paid replication or third-party backup
  SaaS.
- Existing GitHub Issues/PRs/reports as evidence retention.

Any requirement for paid backup tiers, paid retention extensions, paid
replication, or paid disaster-recovery tooling is a **protected Product
Authority** decision and is out of scope for this baseline.

## Recovery class targets (#2779)

| Recovery class | RPO target | RTO target | Test environment rule |
| --- | --- | --- | --- |
| Source / configuration | Last accepted Git commit on the authoritative branch | 4 hours | Clone/checkout to isolated workstation or throwaway branch; no Production write |
| D1 operational data | 24 hours until measured evidence supports tighter values | 8 hours | Isolated non-Production D1 (or local/ephemeral) with synthetic/redacted data |
| B2 media | 24 hours for catalog/index state; provider-retained object durability for blobs | 24 hours | Isolated prefix/bucket or sampled read-only recovery into non-Production catalog |
| Deployment / runtime | Last accepted immutable candidate (commit SHA / Pages deployment id) | 2 hours | Prefer preview/candidate redeploy verification before any Production rollback authorization |

Rule from launch package: every backup is **unproven** until a restore exercise
verifies readability, integrity, application compatibility, and ownership.

## Launch-critical asset inventory

Status legend:

- **Untested** — no successful restore/rollback exercise recorded for recovery
  acceptance.
- **Validation-only** — #2778 read-only checks proved presence/health, not
  recoverability.
- **Procedure-only** — runbook exists; timed exercise not yet recorded.
- **Partial** — durable store exists; disaster reconstruction not exercised.

### A. Source and configuration

| ID | Asset | Owner | Backup method | Retention | RPO / RTO | Credential boundary | Tested? | Isolated test plan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-SRC-001 | Git repository (`wdhunter645/next-starter-template`) | Implementation / Operations (maintain); Product Authority (repo admin) | GitHub remote + local clones; branch/tag history | GitHub default retention for commits/PRs; tags preserved by policy | RPO: last accepted commit; RTO: 4h | GitHub auth for push/admin; read via public/private clone rules | Untested (disaster) / Procedure-only (normal clone) | #2896: clone at known SHA on clean workstation; verify build scripts and docs headers without pushing to `main` |
| R-CFG-001 | `wrangler.toml` Pages/D1 declarations | PMO / Engineering (contract); Implementation (edits) | Git history of file | Same as R-SRC-001 | Same as source/config class | No secrets in file; account ids are non-secret identifiers | Procedure-only | #2896: reconstruct config from accepted SHA; compare to #2890 matrix; do not apply live binding changes |
| R-CFG-002 | `.env.example` + secret **name** inventory | Platform/Operations (names); Product Authority (credential values) | Git for example file; secret values only in provider/GitHub secret stores | Example: Git; values: provider secret-store retention | RPO: last accepted name list; values: last authorized rotation | **Values never in repo, Issues, PRs, logs, or this report** | Partial (names inventoried #2890) | Presence-only checks; rotation/recovery of values requires Product Authority; #2896 does not print values |
| R-CFG-003 | GitHub Actions workflows / CI deploy paths | Deterministic CI + Implementation | Git history under `.github/workflows/**` | Same as R-SRC-001 | Source/config class | `GITHUB_TOKEN` / Actions secrets by name only | Procedure-only | #2896: restore workflow files from SHA; run non-mutating validation jobs only |
| R-CFG-004 | Preview isolation manifest `scripts/ci/preview-isolation-manifest.json` | PMO / Engineering | Git history | Same as R-SRC-001 | Source/config class | None beyond repo access | Procedure-only | Diff manifest at candidate SHA vs #2890 classification; no live rebind |

### B. Deployment and runtime

| ID | Asset | Owner | Backup method | Retention | RPO / RTO | Credential boundary | Tested? | Isolated test plan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-DEP-001 | Cloudflare Pages project (declared `next-starter-template` / wrangler name `lgfc-lite`) | Platform/Operations health; Product Authority for project/domain changes | Pages deployment history; redeploy last known-good commit (`docs/how-to/website/website-production-rollback.md`) | Provider deployment history (account default); Git SHA is authoritative immutable candidate | RPO: last accepted immutable candidate; RTO: 2h | `CLOUDFLARE_API_TOKEN` + account id for deploy/rollback; no token values in evidence | Untested / Procedure-only | #2896: select exact candidate SHA/deployment id; verify on non-Production/pages preview first; Production rollback only with Day-2 + required approvals |
| R-DEP-002 | Pages Functions `/api/**` + static `out/` artifact | Implementation / Operations | Rebuild from Git SHA (`build:cf` / static export); redeploy artifact | Artifact ephemeral; recover by rebuild | Deployment/runtime class | Same as R-DEP-001 | Untested | #2896: rebuild `out/` from candidate SHA; smoke `/` and `/api/health` on isolated/preview target |
| R-DEP-003 | Custom domains `www.lougehrigfanclub.com` / apex | Product Authority (domain); Platform/Operations (DNS/health) | DNS at registrar/Cloudflare; documented domain list in #2890 | DNS change history per provider | RPO: last accepted DNS config; RTO: often <2h if DNS-only, else escalate | Cloudflare/DNS credentials; no zone-file secrets in repo | Validation-only (public DNS/HTTP #2890) | Read-only DNS/HTTP checks; domain cutover or zone mutation is protected stop |
| R-DEP-004 | `API_RATE_LIMITER` KV/namespace `1001` | Platform/Operations | Provider namespace durability; redeclare binding from `wrangler.toml` | Provider default | Treat as deployment/runtime companion; loss may degrade API abuse controls | Cloudflare API token | Untested | Confirm binding declaration from Git; do not recreate Production namespace without authority |

### C. D1 operational data

| ID | Asset | Owner | Backup method | Retention | RPO / RTO | Credential boundary | Tested? | Isolated test plan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-D1-001 | D1 database `lgfc_lite` / id `22d0dc3e-ad34-43af-8e6a-2063df1a1e04` binding `DB` | Platform/Operations (runtime); Product Authority (destructive ops) | Account-native D1 export/dump via authorized Wrangler/API; store export artifact outside Production write path | Retain latest successful export ≥ 24h (zero-cost local or already-authorized object location selected in #2895); do not rely on untested provider internals alone | RPO 24h / RTO 8h | `CLOUDFLARE_API_TOKEN`, account id, D1 id/name; never log SQL payloads with PII beyond redaction policy | Untested | #2895: export → integrity hash → restore into **isolated** D1 or local SQLite → schema + app read-path checks → cleanup named test DB/objects |
| R-D1-002 | Migration set under `migrations/` (incl. known duplicate prefixes `0020`/`0028`/`0044`) | Implementation / Operations | Git history of SQL files | Same as R-SRC-001 | Source/config for files; apply-order risk is operational | No secrets in migrations | Validation-only (#2891 non-destructive) | #2895: apply migrations only to isolated target; record collision handling; never apply experimental repair to Production in this project |
| R-D1-003 | Application catalog tables referencing B2 keys | Platform/Operations + Implementation | Included in R-D1-001 export; cross-check with B2 inventory scripts | Same as R-D1-001 | D1 class; media usability also needs R-B2-* | Same as R-D1-001 | Untested | #2895: after isolated restore, sample join of D1 media rows to B2 object keys without writing Production |

### D. B2 media and catalog tooling

| ID | Asset | Owner | Backup method | Retention | RPO / RTO | Credential boundary | Tested? | Isolated test plan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-B2-001 | Bucket `LouGehrigFanClub` (public, encryption on, object lock off, replication none) | Platform/Operations; Product Authority for lifecycle/cost | Provider **keep all versions**; existing `scripts/b2_*` inventory/list tooling | Keep-all versions (declared); no paid replication in baseline | RPO 24h catalog/index; object durability per provider versions; RTO 24h | `B2_KEY_ID` / `B2_APP_KEY` / endpoint / bucket names; fail-closed without keys (#2892) | Untested (recovery) / Validation-only (read paths #2892) | #2895: sample version list + restore-to-isolated-prefix or download-verify hashes; no Production overwrite |
| R-B2-002 | D1↔B2 sync jobs (`scripts/b2_d1_*`, `.github/workflows/b2-d1-daily-sync.yml`) | Implementation / Operations | Git for scripts/workflows; sync outputs are regenerable from B2+D1 state | Script: Git; sync artifacts per job retention | Supports catalog RPO; not a substitute for R-D1-001 / R-B2-001 | B2 + Cloudflare secrets by name | Validation-only (tooling present) | #2895: run read-only inventory/reconcile against isolated fixtures; disable path must not mutate Production |
| R-B2-003 | Public base URL / object URL scheme | Platform/Operations | Documented in `.env.example` / B2 reference; recoverable from Git + bucket listing | Same as config | B2 class for URL rebuild | `PUBLIC_B2_BASE_URL` name only in evidence | Procedure-only | Reconstruct URLs from bucket + base URL in isolated report; no credential print |

### E. Credentials and evidence

| ID | Asset | Owner | Backup method | Retention | RPO / RTO | Credential boundary | Tested? | Isolated test plan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-SEC-001 | Cloudflare / B2 / admin secret **stores** (GitHub Actions + Pages env) | Product Authority (values); Operations (presence/rotation execution when authorized) | Provider secret stores; documented **names** in #2890; escrow/rotation runbooks only when authorized | Provider secret-store retention; names in Git docs | Loss of values is immediate Production risk; recovery is rotation + authorized inject, not Git restore | **Never export raw secret values into repo, Issues, PRs, CI logs, or recovery evidence** | Untested (rotation drill) | Presence-only drills; value recovery is protected Product Authority work outside #2894–#2896 baseline proofs |
| R-EVD-001 | Recovery and validation evidence (Issues, PRs, `docs/ops/reports/**`) | Administration & Communications (record); Implementation (author) | GitHub + Git | GitHub/Git retention | Reconstruct docs RTO 4h from Git | GitHub auth | Partial | Verify required reports exist at candidate SHAs; no secret content |
| R-EVD-002 | #2778 platform validation tooling/disable path | Implementation / Operations | Git + `LGFC_PLATFORM_VALIDATION_DISABLED` | Git | N/A (control plane) | None beyond repo | Validation-only (#2893) | Confirm disable does not mutate Production; unrelated to data restore but required stop/rollback for tooling |

## Owner summary (durable roles)

| Concern | Primary owner | Escalation |
| --- | --- | --- |
| Recovery activation in Production | Day-2 Operations | Product Authority for destructive, cost, credential, outage decisions |
| Inventory/design changes to RPO/RTO or asset list | PMO / Engineering | Product Authority for material product/cost impact |
| Development restore tooling and exercises | Implementation / Operations (Cursor Local on this serial path) | PR Approver / Engineering for independent review |
| Evidence reconciliation and routing | Administration & Communications | — |
| Secret values, paid tiers, domain, vendor | Product Authority | — |
| Binding/service health monitoring | Platform/Operations (Day-2) | Day-2 incident classification |

## Protected decisions (stop / do not invent)

- Destructive Production D1 restore, overwrite, or drop.
- Intentional public outage or Production failover test without explicit authority.
- Printing or committing credential values, private object contents with PII, or unredacted exports.
- Introducing paid backup, replication, or retention products.
- Claiming provider durability or #2778 health checks equal tested recoverability.
- Starting #2895 before #2894 closes; touching #2775; Production/`main` merge from this child.
- Treating preview/component as isolated (production-shared D1/B2 remain protected truth from #2890 D-007).

## Drift and open follow-ups consumed from #2778

| ID | Relevance to recovery | Disposition for #2779 |
| --- | --- | --- |
| D-001 Pages name `next-starter-template` vs wrangler `lgfc-lite` | Candidate selection ambiguity | Record both identities on every restore/rollback evidence row; align later under bounded docs/platform task |
| D-002 `CLOUDFLARE_PAGES_PROJECT` secret name missing | Deploy/retry automation | Non-blocking for inventory; fix under CI/ops task if rollback automation depends on it |
| D-003 `ADMIN_TOKEN` not in GitHub secret names | Admin recovery path | Presence confirm is credentialed follow-up; value never inventoried here |
| D-005 Migration prefix collisions | Isolated restore apply-order risk | #2895 must exercise collisions only on isolated targets |
| D-006 Live API inventory incomplete | Asset confirmation gap | Does not block target definition; close when authorized credentials available |
| D-007 Production-shared preview | Isolated test design constraint | #2895/#2896 must provision or use explicitly non-Production targets; shared preview is not a safe restore sink |

## Acceptance mapping (#2894)

| Criterion | Evidence |
| --- | --- |
| Every launch-critical asset accounted with tested/untested status and owner | Tables R-SRC-* through R-EVD-*; owner summary |
| Zero-cost baseline and protected decisions explicit | Sections above |
| Changes remain within this task / parent launch package | Single report allowlist; no #2895/#2896 execution |
| Required tests and evidence attached to task PR | This report + local verification commands in PR |
| Builder does not self-approve or merge protected work | Draft PR for independent review |
| Rollback and protected-stop behavior verified | Docs-only revert; no live mutation; protected-stop list recorded |

## Downstream handoff

- **#2895** — Prove D1 export/isolated restore and B2/catalog recovery against R-D1-* and R-B2-*; measure RPO/RTO; cleanup synthetic resources.
- **#2896** — Prove source/config/deployment rollback (R-SRC-*, R-CFG-*, R-DEP-*) and integrated DR scenario using this inventory.
- **#2897** — Qualify recovery package and Day-2 handoff; do not claim Production recovery authorization from Development evidence alone.

## Rollback

Revert or delete this report via the component-branch PR. No live platform
rollback applies. Authoritative Issues, PRs, #2778 evidence, and Production
state remain unchanged.
