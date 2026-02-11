# IMPLEMENTATION-WORKLIST_Master.md
Location (recommended): /docs/tasklists/IMPLEMENTATION-WORKLIST_Master.md  
Status: MASTER — thread-sized execution map (1 task = 1 thread = 1 ZIP snapshot)

---

# Operating Rules (non-negotiable)

- **One Task = One Thread.** Close the thread when the task is DONE/PARTIAL/BLOCKED.
- **Fresh ZIP per thread.** Start each thread with the latest repo ZIP attached (authoritative snapshot).
- **Thread must end with a Closeout Record** appended to `/logs/THREAD-LOG_Master.md` (newest at bottom).
- **No mixed intent.** A task may touch shared foundations (Header/PageShell/CSS) OR page content, not both unless explicitly stated in that task.
- **No regressions allowed.** Any task that touches shared UI must include a regression check list (below).

---

# Regression Check List (run for any shared UI / routing change)

- Header buttons: hover/click works on Home + at least 3 other pages.
- Logo link: routes correctly.
- Footer links: all route correctly.
- Auth gating: `/fanclub/**` redirects when logged out.
- Cloudflare build: succeeds.
- Production smoke: Home loads, no obvious broken layout.

---

# Thread Template (use for every task)

## Task Card
- **Objective**
- **Scope (files/areas allowed)**
- **Execution Steps (Codespaces commands)**
- **Verification Steps**
- **Exit Criteria**
- **Closeout Record Required** → append to `/logs/THREAD-LOG_Master.md`

---

# PHASE 0 — Continuity Spine (must exist before anything else)

## T00 — Create logs + tasklist structure (repo hygiene)
Scope: create folders; no app behavior change.
Exit: `/logs/THREAD-LOG_Master.md` exists; this file exists under `/docs/tasklists/`.
Closeout: record paths created and commit hash.

---

# PHASE 1 — Foundation Stabilization (stop regressions)

## T01 — Lock Header + PageShell ownership (stop recurring header breakage)
Status: PARTIAL (prod validation pending until logout verified)
Scope: Header component(s), PageShell, global CSS only.
Exit: Header links work on Home/About/FAQ/Join; Join+Login+Logout verified in Cloudflare Production.
Closeout: list exact files that define header + shell; add “do not change” note.

## T02 — Routing verification sweep (public pages)
Scope: route config + page link targets only (no styling).
Exit: All nav buttons and footer links route correctly; no 404/redirect surprises.
Closeout: record route map + any redirects observed.

## T03 — Auth gating verification (fanclub + admin)
Scope: middleware/auth gate only.
Exit: logged-out access to `/fanclub/**` redirects; logged-in access works.
Closeout: record exact rule and test URLs.

## T04 — Production smoke harness (repeatable checklist + commands)
Scope: docs/scripts only (no app change).
Exit: a short “smoke commands” section exists in repo docs.
Closeout: record commands + expected outputs.

---

# PHASE 2 — Public Homepage Integrity (section-by-section, no regressions)

## T10 — Hero banner: lock structure + style invariants
Scope: hero section only; no header/footer edits.
Exit: hero renders correctly; no shadow/border regressions vs design lock.
Closeout: screenshot notes + file ownership.

## T11 — Weekly Photo Matchup: UI wiring verification
Scope: weekly matchup components + API endpoints used by Home.
Exit: Home shows 2 photos; vote submits; results behave as designed.
Closeout: record endpoints, DB/D1 tables involved, and success criteria.

## T12 — Join section: CTA correctness
Scope: Join section only.
Exit: Join button routes to Join/Login; copy is correct; no dead buttons.
Closeout: record exact destination URLs.

## T13 — About Lou Gehrig section: content source + rendering
Scope: about section only.
Exit: renders with correct layout; no broken images; admin-managed source noted.
Closeout: record content source mechanism.

## T14 — Social wall (Elfsight): embed stability
Scope: Elfsight embed only.
Exit: widget loads; CSP does not break it; no console hard-fail.
Closeout: record domains required + where configured.

## T15 — Weekly Article #1 (Home) wiring
Scope: home article block only.
Exit: renders a single item reliably; empty-state is acceptable.
Closeout: record data source and fallback behavior.

## T16 — Friends tiles (6) stability
Scope: friends section only.
Exit: 6 tiles render; links open external URLs; layout stable.
Closeout: record where links are stored.

## T17 — Events (next 10) wiring
Scope: events section + endpoint only.
Exit: shows next 10 events; empty-state acceptable; no runtime errors.
Closeout: record query logic.

## T18 — FAQ preview (top viewed) wiring
Scope: FAQ preview only.
Exit: preview renders; links route to FAQ page.
Closeout: record ranking logic.

## T19 — Footer: lock invariants
Scope: footer only.
Exit: legal + navigation stable; links work; no layout regressions.
Closeout: record exact footer ownership files.

---

# PHASE 3 — Public Core Features (complete end-to-end)

## T20 — FAQ page: search + view count + pinned
Scope: FAQ page + its API/DB only.
Exit: search works; pinned works; view count increments; ask-a-question form works.
Closeout: record schema + endpoints.

## T21 — Ask-a-question intake: persistence + basic validation
Scope: ask form + storage only.
Exit: email + question stored; rate-limits (basic) if already defined.
Closeout: record storage location and admin visibility.

## T22 — Events page: month view + list view (if present)
Scope: events page + its data only.
Exit: renders correctly; links stable; no broken month navigation.
Closeout: record month param rules.

---

# PHASE 4 — Fan Club (auth required) Core

## T30 — Fanclub home shell + navigation
Scope: fanclub layout + nav only.
Exit: fanclub loads post-login; header rules preserved.
Closeout: record fanclub header invariants.

## T31 — Member Profile: identity + membership card panel
Scope: profile page only.
Exit: profile renders; identity fields render; membership card instructions render.
Closeout: record fields + data source.

## T32 — Member Chat: post + list + report flow (Day 1)
Scope: chat components + storage only.
Exit: submit works; newest first; report works; admin moderation hook noted.
Closeout: record tables + endpoints.

## T33 — Library: read path + Article #2 display
Scope: library read only.
Exit: article displays reliably; empty-state acceptable.
Closeout: record source + selection rules.

## T34 — Member submissions: article upload (PDF) pipeline
Scope: upload endpoint + storage + metadata only.
Exit: PDF allowlist enforced; stored to B2; metadata stored; UI confirms success.
Closeout: record limits + allowlist.

## T35 — Photo Gallery: browse + report incorrect tags (Day 1)
Scope: gallery browse + report flow.
Exit: browse works; report works; admin review hook noted.
Closeout: record tag model + report target.

## T36 — Memorabilia: browse + long description render
Scope: memorabilia browse only.
Exit: images render; long descriptions render correctly below image.
Closeout: record storage + metadata.

---

# PHASE 5 — Admin (moderation + management)

## T40 — Admin access gate (fail closed)
Scope: admin auth only.
Exit: only admins access `/admin/**`; non-admin blocked.
Closeout: record gate logic and admin roster source.

## T41 — Admin moderation: reported items queue (posts/photos/tags)
Scope: moderation UI + endpoints.
Exit: admin can view reports; hide/remove; audit trail preserved.
Closeout: record actions and audit entries.

## T42 — Admin content tools: FAQ management
Scope: FAQ admin only.
Exit: create/edit/pin/unpin works; changes visible on public FAQ.
Closeout: record workflow and schema.

## T43 — Admin events tools: create/edit events
Scope: events admin only.
Exit: admin can create/edit; public views update.
Closeout: record validation rules.

## T44 — Admin media tools: upload/tag for photos + memorabilia
Scope: admin media only.
Exit: admin upload works; tagging stored; public browse reflects.
Closeout: record allowlists and filename policy.

---

# PHASE 6 — Hardening (after core stability)

## T50 — Rate limiting on sensitive endpoints (Cloudflare-native)
Scope: runtime config only.
Exit: limits applied; no false positives; documented.
Closeout: record rules + endpoints covered.

## T51 — Env validation fail-fast (build/runtime)
Scope: env checks only.
Exit: missing env fails clearly; no secret logging.
Closeout: record required vars + check location.

## T52 — Security sweep: upload limits + MIME enforcement
Scope: upload endpoints only.
Exit: allowlists enforced; size limits enforced; daily limits enforced.
Closeout: record enforcement points.

## T53 — CSP implementation (ZIP 5 target per plan)
Scope: headers config only.
Exit: CSP enabled; Elfsight + B2 still work.
Closeout: record CSP and required domains.

---

# PHASE 7 — Release Readiness

## T60 — Full production smoke pass + no-regression signoff
Scope: verification only.
Exit: all core flows pass; no broken headers; no dead links.
Closeout: record pass/fail per section and remaining defects.

---

# Closeout Record (append to /logs/THREAD-LOG_Master.md)

Use this exact structure:

## THREAD CLOSEOUT RECORD — YYYY-MM-DD — T## — <short title>

STARTING STATE
- ZIP/commit baseline:
- Known issues at start:

INTENDED OBJECTIVE
- <one sentence>

CHANGES MADE
- Files touched:
- Key changes:

WHAT WORKED
- <bullets>

WHAT BROKE (and fix status)
- <bullets>

OBSERVATIONS
- <bullets>

NEXT START POINT
- Next task ID:
- Exact next action:
