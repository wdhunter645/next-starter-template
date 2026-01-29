# LGFC — Post-Implementation Test Plan (Repo-Authoritative)

This test plan exists to verify **design compliance** and **D1 connectivity** across all placeholder-driven sections.

## Preconditions
- Cloudflare Pages deploy succeeded for the commit under test.
- D1 database binding `DB` exists and is attached to the Pages project.
- B2→D1 sync (if used) has inserted rows into `photos` (at minimum).

## A. Build + Routing Smoke
1. `/` loads with no runtime errors in console.
2. `/about`, `/contact`, `/privacy`, `/terms` load.
3. 404 route returns the expected not-found page.
4. Verify header links do not 404:
   - Visitor: Join, Search, Login
   - Hamburger: Home (mobile-only), About, Contact, Support
5. Verify footer links do not 404.

## B. Header + Hamburger Design Compliance
### Visitor header
- Desktop/tablet order: Logo → Join → Search → Login → Hamburger
- Hamburger contains **only**: Home (mobile-only), About, Contact, Support
- Hamburger contains **no** page sections/anchors and **no** Join/Login.

### Member header
- Desktop/tablet order: Logo → My Profile → Membership Card → Search → Logout → Hamburger
- Hamburger (desktop/tablet): My Profile, Membership Card, About, Contact, Support
- Hamburger (mobile): Search, Home, Member Home, My Profile, Membership Card, About, Contact, Support, Login, Logout

## C. D1 Connectivity Proof (Must show real data on-page)
The goal is not “pretty UI” — it is to prove each page is pulling from D1 via `/api/*` endpoints.

### C1. Photos
1. Open `/photos`.
2. Confirm at least 1 thumbnail renders from a `photos.url` value.
3. Open `/memorabilia`.
4. Confirm items render (if `is_memorabilia=1` exists in data; otherwise table shows empty but endpoint works).

### C2. Weekly Matchup
1. On `/`, confirm “Weekly Photo Matchup” shows two images.
2. If fewer than 2 render, run B2→D1 sync and re-check.

### C3. FAQ / Ask a Question
1. On `/`, confirm FAQ list loads (approved items from D1 `faq_entries`).
2. Submit a question; confirm success banner.
3. Verify the submission was stored by querying D1:
   - `SELECT id, question, status, created_at FROM faq_entries ORDER BY id DESC LIMIT 5;`
4. Open `/ask` and confirm the same behavior.

### C4. Milestones
1. Open `/milestones`.
2. Confirm items render from D1 `milestones`.
3. If empty, seed a row and confirm it appears:
   - `INSERT INTO milestones (year, title, description) VALUES (1939, 'Luckiest Man Speech', 'Speech at Yankee Stadium');`

### C5. Friends / Charities
1. Open `/charities`.
2. Confirm “Charity tiles” render from D1 `friends` where `kind='charity'`.
3. If empty, seed a row:
   - `INSERT INTO friends (name, kind, blurb, url) VALUES ('ALS Association', 'charity', 'Support and research.', 'https://www.alsa.org');`

### C6. Events Calendar
1. Open `/calendar`.
2. Confirm events list loads from D1 `events` for the current month.
3. If empty, seed a row for the current month:
   - `INSERT INTO events (title, start_date, location, description) VALUES ('Lou Gehrig Day', 'YYYY-MM-02', 'MLB', 'Annual awareness day.');`

### C7. Discussions Teaser
1. On `/`, confirm “Recent Club discussions” renders from D1 `discussions`.
2. If empty, seed a row:
   - `INSERT INTO discussions (title, body, author_email) VALUES ('Welcome!', 'First post in the club discussions.', 'admin@example.com');`

## D. Functions Health
1. Open `/health`.
2. Confirm it returns ok and (if included) D1 connectivity status.
3. Curl endpoints:
   - `/api/photos/list?limit=1`
   - `/api/matchup/current`
   - `/api/faq/list`
   - `/api/events/month`
   - `/api/milestones/list`
   - `/api/friends/list`
   - `/api/discussions/list`

## E. Regression Checklist
- No ZIP is committed in repo root.
- Preview deploy passes.
- Production deploy passes.
- No new TypeScript build errors.
