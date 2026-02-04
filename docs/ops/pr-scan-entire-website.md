### a **site-wide assessment harness** (one command) that verifies:
### 1) **Functionality smoke** (build succeeds; key pages render; nav invariants hold)
### 2) **Adherence to locked design & standards** (required routes exist; forbidden links absent; header/footer invariants enforced)
### …and you want this enforced via **CI workflows** as part of CI/CD support.

---

### PR Template

#### Reference
Refer to `/docs/website.md` for required structure and change conventions.

#### Change Summary
**Title:** feat(ci): add site-wide assessment harness + CI gates (design adherence + functionality)

**Goal**
Create a single command `npm run assess` that produces a **pass/fail** result and a **structured report** proving:
- Required pages/routes exist (per locked design standards)
- Forbidden routes/links are absent
- Header/nav/footer invariants hold on representative pages
- Static export build is valid
- Basic rendered-page smoke passes (no crash, required markers exist)

Add CI workflows so every PR is blocked if assessment fails, plus a nightly run for drift detection.

---

## Mandatory Step 0 — ZIP Hygiene (NON-OPTIONAL)
1) If a ZIP is present in repo root (or newly uploaded for this PR), **DELETE IT FIRST** and ensure it is not committed.

**Acceptance Criteria (Step 0)**
- No `*.zip` file exists in repo root at end of PR.
- `git status` / PR “Files changed” confirms ZIP is not added.

---

## Deliverable A — Assessment Manifest (design-to-test mapping)
Create a machine-readable manifest that encodes the **locked invariants** to test.

**Add**
- `docs/assess/manifest.json`

**Contents (minimum)**
- `requiredRoutes`: list of required routes (e.g. `/`, `/weekly`, `/milestones`, `/charities`, `/news`, `/calendar`, `/member`, `/privacy`, `/terms`, `/admin`)
- `forbiddenRoutes`: list of routes that must not exist (legacy/parked/etc if applicable)
- `navInvariants`:
  - visitorHeaderButtons (exact labels/order)
  - memberHeaderButtons (exact labels/order)
  - hamburgerRules (items that must never appear; items that may appear)
- `footerLinks` (required labels/targets)
- `pageMarkers`:
  - For key pages, list required headings/section IDs/text markers that prove the right layout skeleton exists

**Notes**
- Keep this manifest aligned to `/docs/LGFC-Production-Design-and-Standards.md`.
- This manifest is the source of truth for automated checks; it is auditable.

---

## Deliverable B — Assessment Script (single command)
Add a script that:
1) Builds the static export (`next build` → `out/`)
2) Validates required routes exist as HTML files under `out/`
3) Loads key pages’ HTML and checks invariants/markers (header/nav/footer)
4) Emits:
   - `reports/assess/assess-report.json`
   - `reports/assess/assess-summary.md`
5) Exits non-zero on failure

**Add**
- `scripts/assess.mjs` (Node ESM)
- `scripts/lib/html-checks.mjs` (helper functions)
- Ensure `reports/assess/` is created during run (and is gitignored if needed)

**Update**
- `package.json` scripts:
  - `"assess": "node scripts/assess.mjs"`
  - `"assess:ci": "node scripts/assess.mjs --ci"`

**Rules**
- No external network calls.
- No dependence on Cloudflare runtime.
- Deterministic results.
- Use only build output parsing (fast and stable).

**Minimum checks**
- Build completes successfully.
- Every `requiredRoutes` maps to an output HTML file:
  - `/` → `out/index.html`
  - `/weekly` → `out/weekly/index.html` (etc)
- Forbidden routes do not exist in `out/`.
- For representative pages (at least `/` and `/member` if present), validate:
  - Header button labels/order match manifest
  - Forbidden items absent (e.g. Join/Login in hamburger if prohibited)
  - Footer contains required links

**Nice-to-have (if already easy)**
- Write a small “route index” file: `reports/assess/routes-found.json`

---

## Deliverable C — CI Workflow: PR Gate (hard block)
Add a workflow that runs on PRs and blocks merge on failure.

**Add**
- `.github/workflows/assess.yml`

**Workflow Steps**
- Checkout
- Setup Node 20 + npm cache
- `npm ci`
- `npm run assess:ci`
- Upload artifacts:
  - `reports/assess/assess-report.json`
  - `reports/assess/assess-summary.md`

**Triggers**
- `pull_request` (all branches)
- `push` to `main` (optional; recommended)

---

## Deliverable D — CI Workflow: Nightly Drift Detection
Add a scheduled workflow to catch drift that slips in via deps or changes.

**Add**
- `.github/workflows/assess-nightly.yml`

**Schedule**
- Nightly UTC time (pick a stable hour)
- Runs same `npm run assess:ci`
- Upload same artifacts
- (Optional) If failure: open an Issue using `actions/github-script` OR at least mark job failed

---

## Deliverable E — Documentation (REQUIRED)
Update docs so this is operational history and reproducible.

**Update**
- `/docs/website-process.md` (or the repo’s current governance/ops doc set) to include:
  - What `npm run assess` does
  - Where artifacts live
  - How to update `docs/assess/manifest.json` when design standards change (should be rare)
  - CI gating policy (PR cannot merge if assess fails)

**If the repo uses a different doc file for ops governance**
- Put the update there, but explicitly list where it went.

---

## Acceptance Criteria (must all pass)
1) `npm run assess` passes locally with a clean checkout.
2) The script produces:
   - `reports/assess/assess-report.json`
   - `reports/assess/assess-summary.md`
3) PR Gate workflow runs on every PR and fails the PR if assessment fails.
4) Nightly workflow runs on schedule and uploads the same artifacts.
5) Manifest exists and is clearly traceable to `/docs/LGFC-Production-Design-and-Standards.md`.
6) ZIP delete rule: no ZIP committed.

---

## Commit Message
feat(ci): add site-wide assessment harness + CI gates

---

## Verification (copy/paste)
- `npm ci`
- `npm run assess`
- Open `reports/assess/assess-summary.md` and confirm:
  - required routes found
  - forbidden items absent
  - header/footer checks passed
- Confirm Actions:
  - `assess.yml` runs on PR
  - `assess-nightly.yml` is present and scheduled

#### Governance Reference
Follow operational, rollback, and testing standards in `/docs/website-process.md`.
