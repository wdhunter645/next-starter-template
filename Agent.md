# Agent.md — Rules for Agent/Codex Work in This Repository

Effective Date: 2026-01-21

This file defines **mandatory** rules for any automated agent (Copilot Agent, Codex, or similar) making changes in this repo.

If you cannot comply, stop and request guidance rather than guessing.

---

## 1) Sources of Truth (non-negotiable)

Before any change, read:
- `/docs/LGFC-Production-Design-and-Standards.md`
- `/docs/NAVIGATION-INVARIANTS.md`
- `/docs/fanclub.md`

These documents are the design law. Do not invent routes, labels, or layouts.

---

## 2) Route + IA Guardrails

- Do not create new top-level routes without explicit instruction.
- FanClub content lives under `/fanclub/**` only.
- Do not reintroduce deleted aliases (e.g. `/member*`, `/photos`, `/ask`, `/news`).
- Store is external only (no `/store` route).
- Weekly vote routes are in transition; do not delete weekly-related routes unless explicitly instructed.

---

## 3) Header / Footer Invariants

Follow `/docs/NAVIGATION-INVARIANTS.md` exactly.

Highlights:
- Public header (logged out): Join / Search / Store / Login
- Public header (logged in): add Club Home + Logout (6 total)
- FanClub header: Club Home / My Profile / Search / Store / Logout
- Logo always links to `/`
- Footer: left quote + legal, center logo scroll-to-top, right links Contact/Support/Terms/Privacy, no email displayed

---

## 4) File-Touch Discipline

- Make the smallest change set required to satisfy the task.
- Do not “refactor for cleanliness” unless explicitly instructed.
- Do not add new libraries, new frameworks, or new build systems without explicit instruction.

---

## 5) No Wildcard Hacking

Prohibited:
- Renaming large folders, mass reformatting, mass linting, or “sweeping” edits not required for the task
- Introducing new routes/components because “it seems useful”
- Rewriting docs without aligning to the explicit design requirements

---

## 6) ZIP Safety

If a ZIP file is present in the repo root during PR work:
- Delete it first (before any other changes)
- Acceptance criteria must confirm it is removed and not committed

**ZIP taint is permanent:**
- ZIPs introduced anywhere in PR commit history (`BASE..HEAD`) permanently taint the PR
- Deleting ZIPs in later commits does NOT fix the PR
- If a ZIP is committed: close PR, create fresh branch, open new PR
- NEVER run purge-zip-history workflow (break-glass only, manual decision by maintainer)

---

## 7) PR Intent Selection (Deterministic)

Every PR MUST have exactly ONE intent label. Select based on file-touch analysis:

**Decision tree (in order):**

1. **`docs-only`** — If ALL changed files start with `docs/`
   - Allowed: `docs/**`
   - Denied: Everything else

2. **`platform`** — If ALL changed files are `wrangler.toml` or `functions/**`
   - Allowed: `wrangler.toml`, `functions/**`
   - Denied: `docs/`, `src/`, `.github/workflows/`, `package.json`, `migrations/`

3. **`infra`** — If ALL changed files are CI/build config
   - Allowed: `.github/**`, `scripts/**`, `package.json`, `wrangler.toml`, config files
   - Denied: `docs/` (use `docs-only`)

4. **`feature`** — If ALL changed files are app code/UI/API/migrations
   - Allowed: `src/**`, `functions/**`, `migrations/**`, `public/**`, `package.json`
   - Denied: `.github/workflows/`, `docs/`

5. **`recovery`** — Break-glass only (all paths allowed)
   - Use ONLY when explicitly instructed for emergency fixes

**If file-touch spans multiple intents → MUST split into separate PRs**

Examples:
- `wrangler.toml` + `src/app/page.tsx` → Split into 2 PRs (platform + feature)
- `functions/api/join.ts` + `docs/website.md` → Split into 2 PRs (platform + docs-only)
- `.github/workflows/ci.yml` + `docs/CI_GUARDRAILS_MAP.md` → Split into 2 PRs (infra + docs-only)

**Enforcement:** `drift-gate` CI workflow validates intent allowlists and BLOCKS merge if violations detected.

See `/docs/governance/platform-intent-and-zip-governance.md` for full governance rules.

---

## 8) Every change must include verification

When you change routing, headers, or footer:
- Verify the route exists and renders
- Verify redirects work for `/fanclub/**`
- Verify header variants and footer layout match the invariants
