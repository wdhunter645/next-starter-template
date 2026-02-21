---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Live operating procedures, incident response, monitoring, operator workflows
Does Not Own: Redefining design/architecture/platform specs; historical records
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
Last Reviewed: 2026-02-20
---

# IMPLEMENTATION-WORKLIST_Master.md
Location (authoritative): /docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md
Purpose: Day-1 execution map (1 task = 1 thread) + zero-drift guardrails.

> This file was **previously overwritten** during thread turnover. This version restores the canonical tasklist structure and the thread-closeout workflow.

---

## Operating Rules (non-negotiable)

- **One Task = One Thread.** Close the thread when the task is DONE / PARTIAL / BLOCKED.
- **Fresh ZIP per thread.** Start each thread with the latest repo ZIP attached (authoritative snapshot).
- **Thread must end with a Closeout Record** appended to `/docs/ops/trackers/THREAD-LOG_Master.md` (append-only; newest at bottom).
- **No mixed intent.** A task may touch shared foundations (Header/PageShell/global CSS/auth gate) OR page/content features, not both, unless explicitly stated in that task.
- **No regressions allowed.** Any task that touches shared UI must run the regression checklist below.
- **Case-sensitive file safety.** Do not create duplicate “same name, different casing” files (Cloudflare/Linux and macOS behave differently).

---

## Regression Checklist (run for any shared UI / routing change)

- Header buttons: hover/click works on Home + at least 3 other public pages.
- Logo link: routes correctly to `/`.
- Footer links: route correctly and match NAVIGATION invariants.
- Auth gating: `/fanclub/**` redirects to `/` when logged out.
- Cloudflare build: succeeds.
- Production smoke: Home loads; no obvious broken layout.

---

## Thread Template (use for every task)

### Task Card
- **Objective**
- **Scope (files/areas allowed)**
- **Execution Steps (Codespaces commands)**
- **Verification Steps**
- **Exit Criteria**
- **Closeout Record Required** → append to `/docs/ops/trackers/THREAD-LOG_Master.md`

---

# CURRENT STATUS SNAPSHOT (best-known as of 2026-02-20)

## Documentation model (Phases 1–3)
- Status: COMPLETE in this ZIP (Diátaxis buckets + authority headers + path normalization + docs guardrails workflow).
- Guardrails: `docs_check_headers`, `docs_check_paths`, `docs_canonical_hashes_verify` are present and PASS locally.

## Build / Deploy (needs confirmation)
- Status: NOT DETERMINABLE from ZIP alone.
- Required verification (run in Codespaces):
  - `npm ci`
  - `npm run build`
  - `npx wrangler --version`
  - Confirm latest Cloudflare Pages build log for `main` deploy.

## Day‑1 website readiness (needs confirmation)
- Status: NOT DETERMINABLE from ZIP alone.
- Required verification (run in Codespaces / production check):

## Known active design compliance gaps (must reconcile before claiming “Day 1 complete”)
- **Footer link order/content currently does not match NAVIGATION-INVARIANTS** (must be Contact, Support, Terms, Privacy in that order; no “About” in footer). Confirm against production before closing T02/T19.

---

  - Route smoke: `/`, `/about`, `/contact`, `/support`, `/terms`, `/privacy`, `/search`, `/join`, `/login`, `/logout`, `/faq`, `/health`
  - Auth gating: `/fanclub/**` redirects to `/` when logged out; renders when logged in.
  - Admin gating: `/admin/**` requires session + `ADMIN_EMAILS`.

---

# PHASE 0 — Continuity Spine (must exist before anything else)

✅ COMPLETED
## T00 — Create logs + tasklist structure (repo hygiene)
Scope: folders/docs only; no app behavior change.
Exit: `/docs/ops/trackers/THREAD-LOG_Master.md` exists; this file exists under `/docs/tasklists/`.

---

# PHASE 1 — Foundation Stabilization (stop regressions)

⚠️ OPEN
## T01 — Lock Header + PageShell ownership (stop recurring header breakage)
Scope: Header component(s), PageShell/layout, global CSS only.
Exit: Header links work on Home/About/FAQ/Join; verified in production.
Closeout: list exact files that define header + shell; add “do not change” note.

### T01 Incident Note — 2026-02-20 — Cloudflare Pages build blocker (Next CLI not found)
- Symptom: Cloudflare Pages build fails during `npm run build` with `sh: 1: next: not found`.
- Root cause: npm config `install-links=false` in the build environment prevents `node_modules/.bin` from being created, so `next` is not on PATH for npm scripts.
- Fix (in this thread): Set `install-links=true` and `bin-links=true` in repo `.npmrc` so Next’s CLI link is created in all environments.
- Verification: After upload + redeploy, Cloudflare build should proceed past dependency install and execute `next build` successfully.


⚠️ OPEN
## T02 — Routing verification sweep (public pages)
Scope: routing + link targets only (no styling).
Exit: All header + footer links route correctly; no 404/redirect surprises.
Closeout: record route map + any redirects observed.

⚠️ OPEN
## T03 — Auth gating verification (fanclub + admin)
Scope: middleware/auth gate only.
Exit: logged-out access to `/fanclub/**` redirects; logged-in access works.
Closeout: record exact rule and test URLs.

✅ COMPLETED / EXISTS
## T04 — Production smoke harness (repeatable checklist + commands)
Scope: docs/scripts only (no app change).
Exit: production smoke doc exists and is runnable.

---

# PHASE 2 — Public Homepage Integrity (section-by-section, no regressions)

## T10 — Hero banner: lock structure + style invariants
Scope: hero section only; no header/footer edits.
Exit: hero renders correctly; no shadow/border regressions vs design lock.
Closeout: file ownership recorded.

## T11 — Weekly Photo Matchup: UI wiring verification
Scope: weekly matchup components + API endpoints used by Home.
Exit: Home shows 2 photos; vote submits; results behave as designed.
Closeout: endpoints + tables recorded.

## T12 — Join section: CTA correctness
Scope: Join CTA only.
Exit: Join button routes correctly; copy correct; no dead buttons.
Closeout: destination URLs recorded.

## T14 — Social wall (Elfsight): embed stability
Scope: Elfsight embed only.
Exit: widget loads; no console hard-fail; CSP does not break it.
Closeout: required domains + config location recorded.

## T16 — Friends tiles (6) stability
Scope: friends section only.
Exit: 6 tiles render; links open external URLs; layout stable.

## T17 — Events (next 10) wiring
Scope: events section + endpoint only.
Exit: shows next 10; empty-state acceptable; no runtime errors.

## T18 — FAQ preview wiring
Scope: FAQ preview only.
Exit: preview renders; links route to FAQ page.

## T19 — Footer: lock invariants
Scope: footer only.
Exit: footer matches NAVIGATION invariants; links work; no layout regressions.
Closeout: footer ownership files recorded.

---

# PHASE 3 — Public Core Features (complete end-to-end)

## T20 — FAQ page: search + view count + pinned
Scope: FAQ page + its API/DB only.
Exit: search works; pinned works; view count increments; ask form works.

## T21 — Ask-a-question intake: persistence + basic validation
Scope: ask form + storage only.
Exit: email + question stored; basic rate-limit if defined.

## T22 — Events page: month view + list view
Scope: events page + its data only.
Exit: renders correctly; stable navigation.

---

# PHASE 4 — Fan Club (auth required) Core

## T30 — Fanclub home shell + navigation
Scope: fanclub layout + nav only.
Exit: fanclub loads post-login; header rules preserved.

## T31 — Member Profile: identity + membership card panel
Scope: profile page only.
Exit: identity fields render; membership card panel renders.

## T32 — Member Chat: post + list + report flow (Day 1)
Scope: chat components + storage only.
Exit: post works; newest first; report works.

## T33 — Library: read path + Article #2 display
Scope: library read only.
Exit: article displays reliably; empty-state acceptable.

## T34 — Member submissions: article upload (PDF) pipeline
Scope: upload endpoint + storage + metadata only.
Exit: PDF allowlist + size limits; stored to B2; metadata stored.

## T35 — Photo Gallery: browse + report incorrect tags (Day 1)
Scope: gallery browse + report flow.
Exit: browse works; report works.

## T36 — Memorabilia: browse + long description render
Scope: memorabilia browse only.
Exit: images render; long descriptions render below image.

---

# PHASE 5 — Admin (moderation + management)

## T40 — Admin access gate (fail closed)
Scope: admin auth only.
Exit: only admins access `/admin/**`; non-admin blocked.

## T41 — Admin moderation: reported items queue
Scope: moderation UI + endpoints.
Exit: admin can view reports; resolve; audit trail preserved.

## T42 — Admin content tools: FAQ management
Scope: FAQ admin only.
Exit: create/edit/pin/unpin works; public reflects changes.

## T43 — Admin events tools: create/edit events
Scope: events admin only.
Exit: admin create/edit works; public reflects.

## T44 — Admin media tools: upload/tag for photos + memorabilia
Scope: admin media only.
Exit: admin upload works; tagging stored; public reflects.

---

# PHASE 6 — Hardening (after core stability)

## T50 — Rate limiting on sensitive endpoints (Cloudflare-native)
## T51 — Env validation fail-fast (build/runtime)
## T52 — Security sweep: upload limits + MIME enforcement
## T53 — CSP implementation

---

# PHASE 7 — Release Readiness

## T60 — Full production smoke pass + no-regression signoff
Scope: verification only.
Exit: all core flows pass; no broken headers; no dead links.

---

## Documentation Freeze (Day-1 Stability Gate)

- Status: ACTIVE (freeze)
- Effective: 2026-02-20
- Scope: docs/** (all documentation)
- Rule: No doc edits unless required to remove drift that blocks builds/ops, or to document an active production incident.
- Canonical baseline: /docs/README.md and /docs/governance/standards/document-authority-hierarchy_MASTER.md
- Rationale: Documentation architecture is now stabilized; focus shifts to production implementation tasks.


---

# PHASE 8 — Documentation Model Redesign (Phases 4–5) (post Day‑1)

## T70 — Phase 4: Rewrite legacy text to match new authority model
Scope:
- Remove/replace legacy intra-doc references that point to pre-reorg paths.
- Ensure each doc’s “Owns / Does Not Own” matches its real content.
- Remove duplicated design specifics from non-design docs (they must point to canonical spec instead).

Exit:
- No references remain to removed paths (grep check passes).
- Each active doc’s header fields are accurate (no “TBD” in Doc Type / Authority / Canonical Reference for active docs).

## T71 — Phase 5: Documentation completeness + maintenance baseline
Scope:
- Review docs coverage vs Day‑1 ops needs; create missing “how-to” pages only if needed.
- Refresh `/docs/README.md` first-read order and map to new buckets.
- Lock a maintenance cadence: “Last Reviewed” updates + canonical hashes refresh process.

Exit:
- `/docs/README.md` accurately points to the canonical design/ops docs.
- `docs-guardrails` workflow remains green on PRs touching docs.
- Canonical hash list is up to date (regenerate + verify passes).

## T72 — Phase 4–5 Addendum — Route Terminology Alignment (FanClub)
Objective: Eliminate legacy /member route terminology from all authoritative documentation and design references.

Scope:
Replace /member with /fanclub in all active design and reference documents.
Replace “Members Area” wording with “Fan Club.”
Preserve historical audit artifacts in docs/as-built/ (do not treat as drift).
Regenerate and store route audit before Phase 5 sign-off.

Verification:
Repo-wide grep audit excluding snapshots and as-built history.
Confirm zero /member UI-route references in active docs.
Confirm Cloudflare build remains green.
Status: In Progress (Documentation Redesign Phase 4–5)


---

# APPENDED UPDATES (do not edit prior content)

## 2026-02-20 — T02 — Routing verification sweep (public pages) — Progress Update

Changes (code only; no styling changes):
- Unify hamburger menu behavior across headers: hamburger menu is **NOT login-aware** and contains only:
  - `/about`
  - `/contact`
- Member header now uses the shared `HamburgerMenu.tsx` (no separate member hamburger).
- `HamburgerMenu.tsx` now provides a stable `id="hamburger-menu"` target for `aria-controls`.

Routing cleanup (member → fanclub):
- Verified `src/**` contains **no UI links** to `/member` routes.
- `/api/member/**` routes are **intentionally preserved** (API surface, not UI routing).

Repo hygiene note:
- `src/components/MemberHamburgerMenu.tsx` is now obsolete by design and should be deleted from the repo to prevent drift.

## - 2026-02-20 — T02 — Routing verification sweep (headers + fanclub naming) — Completion Update
Changes (code only; no styling changes):

Header naming alignment (member → fanclub):
- Renamed src/components/MemberHeader.tsx → src/components/FanClubHeader.tsx
- Renamed src/components/MemberHeader.module.css → src/components/FanClubHeader.module.css
- Updated SiteHeader to reference FanClubHeader (no remaining MemberHeader references in src/**)

Hamburger menu standardization:
- Confirmed single shared src/components/HamburgerMenu.tsx is the standard.
- Removed member-specific hamburger usage from FanClubHeader; FanClubHeader now imports and renders HamburgerMenu.
- Verified: no remaining references to MemberHamburgerMenu in src/**.

Repo hygiene / drift reduction:
- src/components/MemberHamburgerMenu.tsx deleted (completed).
- src/components/SiteHeaderOLD.tsx deleted (completed; file was not referenced in src/** and removed to prevent drift).

Verification:
- grep drift-gate: no “MemberHeader” or “MemberHamburgerMenu” references remain in src/**.
- npm run build: PASS (warnings only for <img> lint rule; no build failures).
---

## T03 Closeout Append — 2026-02-20 — Verified auth model + corrected admin gating statement

This thread verified the **as-built** access model against repository specs (authoritative: `/docs/reference/architecture/access-model.md` and `/docs/reference/design/auth-and-logout.md`).

### Verified behavior (FanClub)
- **Logged out:** visiting any `/fanclub/**` route redirects to `/` (client-side) when `localStorage.lgfc_member_email` is absent.
- **Logged in:** visiting `/fanclub` and child routes renders normally when `localStorage.lgfc_member_email` is present.

**As-built implementation:**
- `src/app/fanclub/layout.tsx` (client-side gate)
- `src/hooks/useAuthRedirect.ts` (shared helper; optional use)
- `docs/reference/design/auth-and-logout.md` (spec)

### Verified behavior (Admin)
- **Admin UI pages (`/admin/**`) are browser-reachable and NOT session-gated server-side.**
- **Admin API endpoints (`/api/admin/**`) are token-gated** (header `x-admin-token`) with token stored in `sessionStorage` (`lgfc_admin_token`) per `/docs/reference/architecture/access-model.md`.

**As-built reference (authoritative):**
- `/docs/reference/architecture/access-model.md`

### Concrete test URLs
- FanClub (logged out): `/fanclub`, `/fanclub/myprofile`, `/fanclub/library` → redirect to `/`
- FanClub (logged in): same URLs → render
- Admin UI: `/admin` loads (UI reachable); API calls require token

### Concrete test steps (browser)
- Logged-out test:
  - `localStorage.removeItem('lgfc_member_email'); location.href='/fanclub';`
- Logged-in test:
  - `localStorage.setItem('lgfc_member_email','test@example.com'); location.href='/fanclub';`
- Admin token test (UI prompts / uses token as designed):
  - `sessionStorage.removeItem('lgfc_admin_token'); location.href='/admin';`

### Correction note (drift prevention)
The earlier “Admin gating requires session + ADMIN_EMAILS” statement in the **CURRENT STATUS SNAPSHOT** section is **not aligned** with the as-built architecture. Use `/docs/reference/architecture/access-model.md` as source of truth.

Status: **T03 VERIFIED (no code changes required in this thread)**.

----------------------------------------------------------------
TASK 04 — Production Smoke Harness
STATUS: CLOSED
DATE CLOSED: 2026-02-21
COMMIT: 9293215

SUMMARY:
• Removed prohibited `set -euo pipefail` from scripts/prod-smoke.sh (Codespaces stability rule).
• Resolved rebase conflict in scripts/prod-smoke.sh.
• Rebased onto origin/main successfully.
• Push to remote main successful.
• Production smoke executed against https://www.lougehrigfanclub.com.
• All checks passed (pages 2xx/3xx, JSON endpoints ok:true, fanclub logged-out redirect).

NO DESIGN OR ROUTE CHANGES INTRODUCED.
----------------------------------------------------------------
