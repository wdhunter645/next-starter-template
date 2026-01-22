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

## Authoritative Design & Navigation

The source-of-truth documents are:
- `/docs/LGFC-Production-Design-and-Standards.md`
- `/docs/NAVIGATION-INVARIANTS.md`

If code or other docs conflict with the above, the above wins.

---

## Day 1 Canonical Routes (summary)

Public:
- `/`, `/about`, `/contact`, `/support`, `/terms`, `/privacy`, `/search`, `/join`, `/login`, `/logout`, `/faq`, `/health`

Member Home and Sub-pages:
- `/member` (member home), `/member/profile`, `/member/card`, `/memberpage` (alias to `/member`)

Member Content (auth required; unauth redirects to `/`):
- `/photo`, `/photos`, `/library`, `/memorabilia`, `/ask`, `/news`

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
