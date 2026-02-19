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
- `/docs/design/master_design.md`
- `/docs/design/master/Header_Design.md`
- `/docs/design/master/Footer_Design.md`
- `/docs/design/master/Auth_Design.md`
- `/docs/design/master/Home_Design.md`

### Tier-2 governance / standards (must reference MASTER files; must not restate specifics)
- `/docs/LGFC-Production-Design-and-Standards.md`
- `/docs/NAVIGATION-INVARIANTS.md`
- `/docs/design/RECONCILIATION-NOTES.md`
- `/docs/fanclub.md`

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
