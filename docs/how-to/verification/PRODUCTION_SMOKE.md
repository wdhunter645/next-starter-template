---
Doc Type: TBD
Audience: Human + AI
Authority Level: TBD
Owns: TBD
Does Not Own: TBD
Canonical Reference: TBD
Last Reviewed: 2026-02-20
---

# Production Smoke Test (read-only)

This is a lightweight, **read-only** smoke test for the public LGFC site.  
It does **not** require auth and it does **not** mutate data.

## Run (Codespaces)

```bash
bash scripts/prod-smoke.sh https://www.lougehrigfanclub.com
```

## What it checks

- Public pages respond (2xx/3xx): `/`, `/about`, `/contact`, `/terms`, `/privacy`, `/join`, `/login`, `/faq`, `/health`
- Public JSON endpoints return `ok:true`
- `/fanclub` is not directly accessible when logged out (redirect or client-side gating marker)

## Expected output

- A list of HTTP status codes per page
- Short JSON snippets for key endpoints
- Final `OK: production smoke passed`
