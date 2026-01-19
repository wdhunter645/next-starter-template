# Website Pull Request Process
*(Standardized PR Prompt Reference — used for every PR in this repository)*

#### Reference
Refer to `/docs/website-PR-process.md` for structure and formatting.  
Follow operational, rollback, and testing standards in `/docs/website-PR-governance.md`.  
Use `/docs/homepage.html` as the canonical markup source for line-range copying.  
Use `/docs/memberpage.html` as the canonical MemberPage specification (versioned snapshots: `memberpage-v1.html`, etc.).  
Use `/docs/as-built/cloudflare-frontend.md` as the authoritative baseline for the Cloudflare static frontend.

---

### Structural Rules
- Canonical strings (must match exactly):
  - Weekly section title: “Weekly Photo Matchup. Vote for your favorite!”
  - Join banner sentence: “Become a member. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more.”
- Canonical color token:
  - `--lgfc-blue: #0033cc` (computed value must equal `rgb(0, 51, 204)` in tests)

---

### Testing Guardrails
- Add devDeps and install: `@playwright/test` (CI must run `npx playwright install --with-deps`)
- Assertions required:
  - Text present exactly once:
    - Weekly: “Weekly Photo Matchup. Vote for your favorite!”
    - Join banner sentence (full line as above)
  - Style checks:
    - Weekly title computed color == `rgb(0, 51, 204)`
    - `.joinBanner` background-color == `rgb(0, 51, 204)`

#### Regression Test Requirements
For any PR affecting the homepage or Social Wall:
- Developer **must** run `npm run test:homepage-sections` locally before submitting PR
- Developer **must** run existing Playwright tests: `npm run test:e2e`
- Any failing regression test must be fixed before PR approval
- If a test failure is legitimate (due to intentional changes), update the test accordingly and document the change in the PR description

**Critical Tests:**
- Homepage section visibility tests (`tests/e2e/homepage-sections.spec.ts`)
- V6 token compliance tests (`tests/homepage.spec.ts`)
- Social Wall regression guard (ensures widget container is present and section is not empty)

#### Social Wall Specific Rules
**When modifying homepage sections:**
- If a PR touches the Social Wall section or `src/components/SocialWall.tsx`:
  - Developer **must** review the Social Wall configuration description in `docs/lgfc-homepage-legacy-v6.html` (Social Wall subsection)
  - Developer **must** confirm that the Elfsight script URL and app container class remain correct, or update them deliberately and document the change
  - Developer **must** verify that:
    - Script URL is `https://elfsightcdn.com/platform.js` (NOT static.elfsight.com)
    - Widget container class is `elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8`
    - `data-elfsight-app-lazy` attribute is present on the widget container
    - Fallback text remains in the component
  - Developer **must** test the deployed site to confirm the social feed renders (not just fallback text)
  - Any configuration change must update both:
    1. `src/components/SocialWall.tsx`
    2. The Social Wall subsection in `docs/lgfc-homepage-legacy-v6.html`

---

### Commit Message Standard
`feat(home): header/logo alignment; weekly title center+blue; join banner exact copy+blue; section-gap`

---

### CI Enforcement Policy
- **All PRs to `main` must have green `lgfc-validate` status checks before merge.**
- The `lgfc-validate` workflow runs on every PR and validates:
  1. `npm run lint` — ESLint passes without errors
  2. `npm test` — Unit/component tests pass
  3. `npm run build:cf` — Cloudflare static build succeeds
- **Manual merges that bypass CI checks are forbidden** except under explicit "emergency hotfix" protocol.
- Emergency hotfix protocol:
  - Must be approved by repository owner (@wdhunter645).
  - Must include post-merge follow-up PR to restore compliance.
  - Must be documented in PR thread with justification.
- CI failures must be resolved **before** Cloudflare deployment, preventing production issues.

---

### ZIP File Policy (CRITICAL)
**ZIP files are strictly prohibited from being committed to this repository.**

- **Transport only**: ZIP files may be used for local transport of changes (e.g., uploaded to agent context), but must **never** be committed.
- **Enforcement**: Any PR containing a tracked ZIP file (`.zip` or `.ZIP`) is **invalid** and **must be rejected**.
- **Cleanup required**: If a ZIP file is uploaded for work purposes, it must be deleted before creating commits.
- **CI enforcement**: Automated workflows will fail any PR that contains tracked ZIP files.

**Process:**
1. If using a ZIP for transport: Extract contents to appropriate paths
2. Delete the ZIP file immediately
3. Commit only the extracted/modified files
4. Verify with `git ls-files '*.zip'` before pushing

---

### Notes and Prohibitions
- Do not add new dependencies or frameworks for layout/spacing fixes (no Tailwind, no UI kits, no CSS-in-JS).
- Maintain global CSS styling approach.

---

## Cloudflare As-Built Frontend

The canonical baseline for the **Cloudflare Pages-hosted public frontend** is documented in:

**`/docs/as-built/cloudflare-frontend.md`**

### Cloudflare vs. Vercel Responsibilities

- **Cloudflare Pages** = Static public site (homepage, weekly matchup, milestones, charities, calendar, news, static member stub, legal pages)
- **Vercel** = Members/admin app + dynamic content (authentication, database-backed features, real-time interactions)

### When to Update As-Built Documentation

Any PR that changes the following on the **Cloudflare side** must update `/docs/as-built/cloudflare-frontend.md`:

1. **Route structure** (new pages, removed pages, route changes)
2. **Page-level layouts** (section order, major component additions/removals)
3. **Header/footer structure** (navigation items, layout changes)
4. **Major section changes** (homepage sections, memberpage sections)
5. **Styling baseline** (color tokens, typography scale, global layout variables)

Future contributors must consult and update the as-built doc whenever making visual or structural changes to the Cloudflare frontend. This is required for Sentinel-Write Bot enforcement and long-term maintainability.