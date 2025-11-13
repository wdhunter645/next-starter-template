# Website Pull Request Process
*(Standardized PR Prompt Reference — used for every PR in this repository)*

#### Reference
Refer to `/docs/website-PR-process.md` for structure and formatting.  
Follow operational, rollback, and testing standards in `/docs/website-PR-governance.md`.  
Use `/docs/homepage.html` as the canonical markup source for line-range copying.

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

---

### Commit Message Standard
`feat(home): header/logo alignment; weekly title center+blue; join banner exact copy+blue; section-gap`

---

### Notes and Prohibitions
- Do not add new dependencies or frameworks for layout/spacing fixes (no Tailwind, no UI kits, no CSS-in-JS).
- Maintain global CSS styling approach.