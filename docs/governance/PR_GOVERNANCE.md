---
Doc Type: Governance
Audience: Human + AI
Authority Level: Canonical
Owns: Governance rules, PR process, enforcement, AI guardrails
Does Not Own: Design/architecture/platform specifications; step-by-step ops procedures
Canonical Reference: /docs/governance/standards/document-authority-hierarchy_MASTER.md
Last Reviewed: 2026-02-20
---

# Website Pull Request Governance

**All PR prompts must follow this structure:**
1) Reference: `/docs/governance/PR_PROCESS.md`
2) Change Summary: exact edits with file paths + (when applicable) line ranges from `/docs/reference/design/Reference/homepage.html`
3) Governance Reference: `/docs/governance/PR_GOVERNANCE.md`

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
- Structural edits must copy from `/docs/reference/design/Reference/homepage.html` or `/docs/reference/design/fanclub.md` via explicit line ranges.
- No paraphrasing or freehand rewrites of canonical HTML/CSS.
- If canonical file missing or outdated, mark PR **Blocked** and request correction.
- Legacy snapshots are preserved at `/docs/lgfc-homepage-legacy-v6.html`, `/docs/lgfc-homepage-legacy-v7.html`, etc.
- FanClub versioning follows the same pattern: `/docs/reference/design/fanclub.md` (current standard) with versioned snapshots at `/docsfanclub-v1.html`, future `/docsfanclub-v2.html`, etc.
- **Automated drift guard:** All PRs must pass `npm run test:homepage-structure` to prevent structural violations.
- **Historical drift incidents:** See `/docs/drift-log.md` for documented cases and remediation guidance.

### As-Built Documentation Requirement

**Any change to Cloudflare-rendered pages must update `/docs/as-built/cloudflare-frontend.md` in the same PR.**

This requirement applies to changes affecting:
- Public route structure (new pages, removed pages, route modifications)
- Page-level layouts (section order, major component additions/removals)
- Header/footer navigation structure
- Major section additions/removals on homepage or other public pages
- Global styling baseline (color tokens, typography scale, layout variables)

**Enforcement**:
- Manual code review checks for as-built doc updates
- Future: Sentinel-Write Bot will automatically validate as-built doc changes (PR #311)
- PRs missing required as-built doc updates will be rejected

**Purpose**:
- Maintains authoritative baseline for Cloudflare static frontend
- Enables Sentinel-Write Bot drift detection
- Supports Supabase/Vercel integration planning
- Provides reference for Codex, Copilot Agent, and automated tooling

### Social Wall Drift & Regressions
**Historical Context:**
- Social Wall has had **multiple regressions** historically due to undocumented changes
- Common issues:
  - Wrong Elfsight script URL (static.elfsight.com vs elfsightcdn.com)
  - Missing `data-elfsight-app-lazy` attribute
  - Complete removal of widget code
  - "Cleanup" or "simplification" PRs that broke the working implementation

**Prevention Requirements:**
All Social Wall changes must:
1. **Review** the canonical configuration in `docs/lgfc-homepage-legacy-v6.html` (Social Wall subsection)
2. **Update** both `SocialWall.tsx` and the configuration documentation if making changes
3. **Test** on the deployed site to confirm the feed renders (not just fallback text)
4. **Document** the change reason and verification steps in PR description

**Never:**
- Remove the Elfsight widget container without explicit authorization
- Change script URLs without updating documentation
- "Clean up" Social Wall without verifying against canonical configuration

---

## Acceptance Checks
- Text locks match exactly (see “Canonical strings” in process doc).
- Visual alignment matches v6 (logo left, hamburger right, shared top offset; non-sticky header).
- Computed styles:
  - Weekly title color == `rgb(0, 51, 204)`
  - `.joinBanner` background-color == `rgb(0, 51, 204)`
- Section rhythm: `.section-gap` applied to Weekly, Join banner, Social Wall, FAQ, Milestones.
- **Social Wall configuration matches canonical spec:**
  - Script URL: `https://elfsightcdn.com/platform.js`
  - Widget container class: `elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8`
  - `data-elfsight-app-lazy` attribute present
  - Fallback text present
- **If PR touches Cloudflare page layout**: `/docs/as-built/cloudflare-frontend.md` is updated in the same PR
---

## Snapshot Review Cadence
- Automated repository snapshots are generated daily at 07:00 UTC via GitHub Actions.
- **Weekly Review**: Compare latest snapshot with previous week to detect drift.
- **Pre-Deployment**: Reference snapshots before major releases to establish rollback points.
- **Post-Incident**: After any rollback, review snapshots to identify when issues were introduced.
- **Maintenance**: Archive or remove snapshots older than 90 days to manage repository size.
- See `/docs/RECOVERY.md` for detailed snapshot usage and rollback procedures.
- See `/snapshots/README.md` for snapshot structure and contents.
