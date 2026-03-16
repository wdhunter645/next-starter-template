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

Canonical design authority:
- `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- `/docs/reference/design/home.md`
- `/docs/reference/design/fanclub.md`

Historical / superseded material:
- `/docs/archive/superseded/`
- `/docs/as-built/RECONCILIATION-NOTES_2026-02.md`

If code or docs conflict, **`/docs/reference/design/LGFC-Production-Design-and-Standards.md` wins**.

---

## Day 1 Canonical Routes

Do not treat this README as the route source of truth.
Use `/docs/reference/design/LGFC-Production-Design-and-Standards.md` for the canonical route list and navigation behavior.

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

