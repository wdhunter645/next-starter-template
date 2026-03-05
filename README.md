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
- `/docs/reference/design/master_design.md`
- `/docs/reference/design/visitor-header.md`
- `/docs/reference/design/fanclub-subpages.md`
- `/docs/reference/design/auth-and-logout.md`
- `/docs/reference/design/home.md`

### Tier-2 governance / standards (must reference MASTER files; must not restate specifics)
- `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- `/docs/reference/design/NAVIGATION-INVARIANTS.md`
- `/docs/reference/design/RECONCILIATION-NOTES.md`
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
