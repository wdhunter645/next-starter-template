# LGFC — Required Validation Tests (AUTHORITATIVE)

These tests must be executed after deploying the updated ZIP. They prove that the design pages exist and that D1 connectivity is working for every D1-backed placeholder.

## A) Deployment sanity
1. Cloudflare Pages build is green.
2. `GET /api/health` returns `ok: true`.
3. `GET /api/d1-test` returns `ok: true` (public endpoint; D1 binding check).
4. `GET /admin/d1-test` loads (admin diagnostic page; browser-reachable).
5. `GET /api/admin/stats` requires `x-admin-token` header (returns 403 without token).

## B) Public pages exist + render
- `/` Home loads without console errors.
- `/about`, `/contact`, `/privacy`, `/terms`, `/calendar`, `/charities`, `/news`, `/library`, `/photos`, `/memorabilia`, `/weekly`, `/weekly/current`, `/matchup`, `/search`, `/join`, `/login`, `/faq`, `/ask` all return 200 and render.

## C) Header / nav conformance (smoke)
1. Desktop/tablet visitor header shows Join + Store + Login + Hamburger; hamburger shows About/Contact/Support.
2. Mobile visitor hamburger shows Home/About/Contact/Support/Store.
3. Desktop/tablet member header shows Member Home + Search + Logout + Hamburger.
4. Desktop/tablet member hamburger shows My Profile / Obtain Membership Card / About / Contact / Support.
5. Mobile member hamburger shows Search/Home/Member Home/My Profile/Obtain Membership Card/About/Contact/Support/Login/Logout.

## D) D1 connectivity proof checks (must show live data or empty-state from D1)
> For each check, open DevTools Network and confirm the page triggers the corresponding `/api/...` call.

### Home page
- Weekly matchup triggers: `GET /api/matchup/current` (must return 2 photos or a D1-empty message).
- Recent discussions triggers: `GET /api/discussions/list?limit=10`.
- Friends triggers: `GET /api/friends/list`.
- Milestones triggers: `GET /api/milestones/list`.
- Calendar triggers: `GET /api/events/month?month=YYYY-MM`.
- FAQ triggers: `GET /api/faq/list?status=approved&limit=10`.

### FAQ / Ask
- `/ask` submits: `POST /api/faq/submit`.

### Photos
- `/photos` triggers: `GET /api/photos/list?limit=...`.

## E) Member routing and guard
1. Visit `/member` and `/memberpage` while logged out → page must show "not signed in" state.
2. Login flow works (email exists) and sets session marker, then `/member` shows signed-in banner.
3. Logout clears marker and returns to `/`.
