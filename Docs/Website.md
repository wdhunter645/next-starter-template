# PR: Fix Header/Logo/Hamburger, Weekly Title, Join Banner (blue + exact copy), and Add Section Spacing — lock to v6 spec

## Context (single source of truth)
- Canonical markup reference must live in-repo: add **`/docs/lgfc-homepage-legacy-v6.html`**.  
- This PR brings the homepage back to the v6 structure and styling and prevents future drift.

---

## Implementation (one pass, exact files)

1) **Add canonical HTML (for line-range prompts and copy freeze)**
- Create: `docs/lgfc-homepage-legacy-v6.html`  
- Paste the approved v6 HTML (Bill’s canonical).  
- Why: subsequent edits will reference exact line ranges; no more paraphrasing.

2) **Global tokens + spacing utilities**
- Edit: `src/app/globals.css`  
- Append at end:

  - `:root { --lgfc-blue:#0033cc; --section-gap:2.5rem; }`
  - `.section-gap { margin-block: var(--section-gap); }`
  - `.title-lgfc { color: var(--lgfc-blue); text-align: center; font-weight: 700; }`
  - `.joinBanner { background: var(--lgfc-blue); color:#fff; border-radius: 14px; padding: 20px; }`
  - `.topWhitespace { height: 72px; } /* whitespace between logo+hero */`

3) **Header + logo + hamburger (drop sticky; align on same horizontal line)**
- Edit (or create if missing): `src/components/Header.tsx`
- Replace content with:

  - A non-sticky header container (`position: relative`) that **does not** use `position: sticky`.
  - **Logo**: absolutely positioned at `top: 12px; left: 16px;`  
    (image `alt="LGFC logo"`; height ~40–48px)
  - **Hamburger**: absolutely positioned at `top: 12px; right: 16px;`  
    (same `top` value as logo → visually aligned on the **same horizontal line**)
  - Below the header, render `<div className="topWhitespace" />` to create the requested gap before the hero.

  Example (keep your image imports as-is):
  - Wrapper `<header style={{ position:'relative', height:64 }}>`
  - `<img ... style={{ position:'absolute', top:12, left:16 }} />`
  - `<button aria-label="Menu" style={{ position:'absolute', top:12, right:16 }}>☰</button>`
  - `</header>`
  - `<div className="topWhitespace" />`

4) **Weekly title: centered + blue**
- File: `src/components/WeeklyMatchup.tsx`
- Find the section title (e.g., `h2` near top of component).  
- Ensure:

  - Element has class `title-lgfc`
  - Text stays **exactly**: `Weekly Photo Matchup. Vote for your favorite!`

  Example:
  - `<h2 className="title-lgfc">Weekly Photo Matchup. Vote for your favorite!</h2>`

5) **Join banner: restore exact v6 copy + blue background**
- File: `src/app/page.tsx` (or the component where Join banner lives)
- **Exact copy to restore** (from v6; this is the required text lock):

  > `Become a member. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more.`

- Ensure the banner wrapper uses `className="joinBanner section-gap"`.
- Buttons: `Join` (links to `/join`) and `Login` (links to `/member` or `/admin` depending on app rules).  
- Remove any prior placeholder or alternate sentence (“Become part of the Lou Gehrig Fan Club community.”).

6) **Global vertical rhythm between sections**
- File: `src/app/page.tsx`
- Add `className="section-gap"` to the wrappers for:
  - Weekly Matchup block
  - Join banner block
  - Social Wall block
  - FAQ block
  - Milestones block

7) **Keep Social Wall placeholder intact**
- Ensure the placeholder div remains exactly as scaffolded (no accidental removal):
  - `<div className="elfsight-app-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"></div>`
  - Plus nearby instruction comment.

8) **(Optional but recommended) Next/Image lint appeasement**
- If feasible in this PR, where `<img>` renders unoptimized thumbnail(s) in `WeeklyMatchup.tsx`, wrap with Next `<Image>` (static assets only).  
- If not trivial, leave as-is and open a follow-up PR.

---

## Tests / Guardrails (prevent regressions)

1) **String asserts (Playwright)**
- Add devDeps: `@playwright/test`
- New test: `tests/homepage.spec.ts`
  - Visit `/`
  - Expect the Weekly title **exact text** appears once:
    - `Weekly Photo Matchup. Vote for your favorite!`
  - Expect the Join banner **exact text** appears once:
    - `Become a member. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more.`
  - Expect computed color of Weekly title is `rgb(0, 51, 204)` (the value of `--lgfc-blue`) via `getComputedStyle`.
  - Expect `.joinBanner` to have `background-color` equal to `rgb(0, 51, 204)`.

2) **Basic visual snapshot (optional)**
- Add one snapshot of the region containing header/logo/hamburger to catch accidental sticky/position changes.

3) **CI wiring**
- If GitHub Actions is present, add a job `test-homepage.yml`:
  - Install deps, run `npx playwright install --with-deps`
  - Run `npx playwright test`
  - Fail the PR if any of the above assertions fail.

---

## Acceptance Criteria (must pass)

- Header no longer sticky; **logo** and **hamburger** share the **same top offset** (visually aligned).  
- A visible gap exists between header and hero (via `.topWhitespace`).  
- Weekly title **centered** and **LGFC blue** (`#0033cc`), exact text as specified.  
- Join banner **blue background**, white text, exact copy restored (as above), with `Join` and `Login` buttons present.  
- Consistent vertical spacing between **all** homepage sections using `.section-gap`.  
- Social Wall placeholder remains in place.  
- Playwright tests pass in CI.  
- Cloudflare Pages deploy shows all of the above live.

---

## Notes for Review
- Do not introduce Tailwind; use existing CSS.  
- Keep CSS specificity low (class selectors only).  
- No inline styles except for the small header absolute positions (OK to move to CSS class if preferred).

---

## Commit Message (squash on merge)
`feat(home): v6 lock — header/logo/hamburger alignment (non-sticky), weekly title centered + blue, join banner exact copy + blue, global .section-gap; add tokens; add Playwright assertions`

## Post-merge
- Trigger Cloudflare Pages build (standard push to `main`).  
- Purge cache if needed via Pages UI to avoid stale CSS.

- 
