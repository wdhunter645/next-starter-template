# Website Pull Request Governance

**All PR prompts must follow this structure:**
1) Reference: `/docs/website-PR-process.md`
2) Change Summary: exact edits with file paths + (when applicable) line ranges from `/docs/homepage.html`
3) Governance Reference: `/docs/website-PR-governance.md`

---

## Runtime & Platform Policy
- Cloudflare Pages build: Next.js static export; no server functions.
- Node runtime: do not change Cloudflare’s Node runtime in PRs unless explicitly requested. (Current production build logs show Node 20; upgrade to 22 will be handled separately.)
- No Tailwind/PostCSS/framework swaps. Keep global CSS approach.

---

## Rollback Protocol
- If any PR causes a white-screen or layout regression, stop forward changes immediately.
- Roll back to last-known-good:
  - Cite the Cloudflare “Successful deploy” build and its commit hash (from Pages logs).
  - Re-deploy that commit and confirm live recovery.
- Record rollback in PR thread with:
  - Failure type (A/B/C/D)
  - Commit/PR that introduced regression
  - Commit/Deploy ID restored

---

## Drift Control
- Structural edits must copy from `/docs/homepage.html` or `/docs/memberpage.html` via explicit line ranges.
- No paraphrasing or freehand rewrites of canonical HTML/CSS.
- If canonical file missing or outdated, mark PR **Blocked** and request correction.
- Legacy snapshots are preserved at `/docs/lgfc-homepage-legacy-v6.html`, `/docs/lgfc-homepage-legacy-v7.html`, etc.
- MemberPage versioning follows the same pattern: `/docs/memberpage.html` (current standard) with versioned snapshots at `/docs/memberpage-v1.html`, future `/docs/memberpage-v2.html`, etc.
- **Automated drift guard:** All PRs must pass `npm run test:homepage-structure` to prevent structural violations.
- **Historical drift incidents:** See `/docs/drift-log.md` for documented cases and remediation guidance.

---

## Acceptance Checks
- Text locks match exactly (see “Canonical strings” in process doc).
- Visual alignment matches v6 (logo left, hamburger right, shared top offset; non-sticky header).
- Computed styles:
  - Weekly title color == `rgb(0, 51, 204)`
  - `.joinBanner` background-color == `rgb(0, 51, 204)`
- Section rhythm: `.section-gap` applied to Weekly, Join banner, Social Wall, FAQ, Milestones.
- Social Wall placeholder remains present and unchanged.
---

## Snapshot Review Cadence
- Automated repository snapshots are generated daily at 07:00 UTC via GitHub Actions.
- **Weekly Review**: Compare latest snapshot with previous week to detect drift.
- **Pre-Deployment**: Reference snapshots before major releases to establish rollback points.
- **Post-Incident**: After any rollback, review snapshots to identify when issues were introduced.
- **Maintenance**: Archive or remove snapshots older than 90 days to manage repository size.
- See `/docs/RECOVERY.md` for detailed snapshot usage and rollback procedures.
- See `/snapshots/README.md` for snapshot structure and contents.
