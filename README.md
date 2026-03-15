# Lou Gehrig Fan Club (LGFC) — Website Repository

This repo contains the **LGFC public website** and the **FanClub (authenticated)** area.

Hosting: Cloudflare Pages (static export)  
Framework: Next.js (App Router) + TypeScript

---

## Start Here

- **`/context.md`** — high-level repository + architecture summary (read first)
- **`/Agent.md`** — rules for Agent/Codex work in this repo (mandatory)
- **`/active_tasklist.md`** — daily work list (ephemeral; open vs completed)

---

## Design Authority (Day 1)

### MASTER design (implementation-level detail)
- `/docs/archive/superseded/master_design.md`
- `/docs/design/master/Header_Design.md`
- `/docs/design/master/Footer_Design.md`
- `/docs/design/master/Auth_Design.md`
- `/docs/design/master/Home_Design.md`

### Tier-2 governance / standards (must reference MASTER files; must not restate specifics)
- `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- `/docs/archive/superseded/NAVIGATION-INVARIANTS.md`
- `/docs/as-built/RECONCILIATION-NOTES_2026-02.md`
- `/docs/reference/design/fanclub.md`

If code or docs conflict, **MASTER design wins**.

---

## Day 1 Canonical Routes (summary)

Public:
- `/`, `/about`, `/contact`, `/terms`, `/privacy`, `/search`, `/auth`, `/logout`, `/faq`, `/health`

FanClub (auth required; unauth redirects to `/`):
- `/fanclub`, `/fanclub/myprofile`, `/fanclub/photo`, `/fanclub/library`, `/fanclub/memorabilia`

Admin (admin gate):
- `/admin/**`

Store:
- External Bonfire link (no `/store` route)

Weekly vote:
- In transition; do not delete weekly-related routes until the hidden-results behavior is finalized.

---

## Local Development

```bash
npm install
npm run dev
```

---

## CI / Governance

This repo enforces design and safety gates (including ZIP artifact blocking).  
Follow `/Agent.md` for required workflow and file-touch rules.

## License

This repository is published as source-available for transparency and reference.
Reuse, redistribution, or creation of derivative works from this codebase is prohibited without explicit written permission from the Lou Gehrig Fan Club.
See the LICENSE file for full terms.

