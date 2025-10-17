# LGFC Parallel **TEST** Environment — Cloudflare **Workers** (optional Pages)

**Objective:** Stand up a disposable **TEST** deployment alongside PROD using Cloudflare **Workers** (and optionally **Pages**), with **isolated bindings** (R2/Queues/DO) and **per‑env secrets**. No DNS changes. Verify on `*.workers.dev` / `*.pages.dev`, then promote to PROD.

---

## 1) Topology

- **PROD:** Existing site (`lougehrigfanclub.com`) — current Workers/Pages project + prod bindings.
- **TEST:** Cloudflare-owned subdomains — `lgfc-test.workers.dev` (Workers) and/or `lgfc-test.pages.dev` (Pages). **No DNS advertising.**

**Why this:** Zero risk to PROD, repeatable, easy rollback (redeploy prior PROD build).

---

## 2) Multi-Environment `wrangler.toml` (Workers-first)

> Merge or replace your `wrangler.toml` with the template below (adjust names). Secrets are set **per env**.

```toml
name = "lgfc"
main = "src/worker.ts"
compatibility_date = "2024-12-01"

# ---------- PROD (default) ----------
# Uses your existing custom domain routing; do not set workers_dev here.
[vars]
SUPABASE_URL = "https://<prod>.supabase.co"
FEATURE_R2_IMAGES = "false"
FEATURE_VOTE_API = "false"

[[r2_buckets]]
binding = "R2"
bucket_name = "lgfc-media"

[[durable_objects.bindings]]
name = "VOTES_DO"
class_name = "VotesDO"

[[queues.producers]]
binding = "VOTE_QUEUE"
queue = "lgfc-vote-queue"

[observability]
enabled = true

# ---------- TEST ENV (workers.dev) ----------
[env.test]
workers_dev = true          # deploys to *.workers.dev, no custom DNS route
vars = { 
  SUPABASE_URL = "https://<test>.supabase.co",
  FEATURE_R2_IMAGES = "false",
  FEATURE_VOTE_API = "false"
}

[[env.test.r2_buckets]]
binding = "R2"
bucket_name = "lgfc-media-test"

[[env.test.durable_objects.bindings]]
name = "VOTES_DO"
class_name = "VotesDO"

[[env.test.queues.producers]]
binding = "VOTE_QUEUE"
queue = "lgfc-vote-queue-test"
```

> **Secrets per env:**  
> - PROD: `wrangler secret put TURNSTILE_SECRET` + `SUPABASE_JWT_SECRET`  
> - TEST: `wrangler secret put TURNSTILE_SECRET --env test` + `wrangler secret put SUPABASE_JWT_SECRET --env test`

---

## 3) Minimal Worker: `/healthz` route (add to `src/worker.ts`)

```ts
import { Hono } from 'hono';

type Bindings = {
  R2: R2Bucket;
  VOTES_DO: DurableObjectNamespace;
  VOTE_QUEUE: Queue;
  TURNSTILE_SECRET: string;
  SUPABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/healthz', async (c) => {
  try {
    // R2 quick check (non-fatal if missing)
    await c.env.R2.head('healthz.txt').catch(() => null);
    // DO quick check
    const id = c.env.VOTES_DO.idFromName('global');
    const res = await c.env.VOTES_DO.get(id).fetch('https://do/snapshot').catch(() => null);
    const doOK = !!res && res.status === 200;
    return c.json({ ok: true, doOK, supabase: c.env.SUPABASE_URL });
  } catch (e) {
    return c.json({ ok: false, err: String(e) }, 500);
  }
});

export default app;
```

> Keep your existing routes; this adds a cheap health endpoint for smoke tests.

---

## 4) One-Window Commands (TEST resources → deploy → verify)

```bash
set -euo pipefail
mkdir -p logs

# Show who we're authenticated as
npx wrangler whoami 2>&1 | tee -a logs/test-setup.log

# Create TEST-only resources (idempotent)
npx wrangler r2 bucket create lgfc-media-test 2>&1 | tee -a logs/test-setup.log || true
npx wrangler queues create lgfc-vote-queue-test 2>&1 | tee -a logs/test-setup.log || true

# Set TEST secrets (safe to repeat)
npx wrangler secret put TURNSTILE_SECRET --env test
npx wrangler secret put SUPABASE_JWT_SECRET --env test

# Deploy TEST to *.workers.dev
npx wrangler deploy --env test 2>&1 | tee -a logs/test-deploy.log

echo ">>> TEST deploy complete. Check the printed *.workers.dev URL"
echo ">>> Verify: curl -s https://<printed-test-url>/healthz | jq"
```

**Promote to PROD (after validation):**
```bash
# Optional: flip feature flags via wrangler vars or dashboard first
npx wrangler deploy 2>&1 | tee -a logs/prod-deploy.log
```

---

## 5) Optional: Pages (static site) parallel

If you also use **Cloudflare Pages** for your Canva export (static):
- Create a second Pages project: **`lgfc-test`** pointing at your `src/public` output.
- Do **not** add a custom domain; Pages gives you `lgfc-test.pages.dev`.
- Keep **Workers** and **Pages** separated (Pages for static assets, Worker for APIs).

**Pages preview checks:**
- Verify `200 /index.html` and that JS fetches point to the TEST Worker domain.
- Do **not** wire `lougehrigfanclub.com` in the test project.

---

## 6) Feature Flags (toggle without redeploying code)

- `FEATURE_R2_IMAGES` — controls `/img/:key` route usage in UI.
- `FEATURE_VOTE_API` — controls whether vote buttons call `/api/vote`.

Use **Wrangler “vars”** per env or the Dashboard to toggle:
- TEST: turn on flags first → validate → keep PROD off until ready.

---

## 7) Acceptance Criteria

- TEST URL (Workers) responds `200` at `/healthz` with `{ ok: true }`.
- TEST env uses **`lgfc-media-test`** + `lgfc-vote-queue-test` + DO namespace.
- No requests from TEST hit PROD resources.
- PROD deploy unmodified during TEST runs.
- Promotion to PROD is a single `wrangler deploy` (or Pages Promote) after smoke tests.

---

## 8) Rollback & Cleanup (safe to blow up)

- **Rollback PROD:** redeploy previous build (`wrangler versions list` → `wrangler rollback <id>` if enabled, or re-deploy prior commit).
- **Nuke TEST env:** delete `lgfc-media-test` bucket and `lgfc-vote-queue-test` queue; remove `env.test` from `wrangler.toml`. Recreate later in minutes.

---

## 9) PR Template (guardrails)

Add `.github/pull_request_template.md`:

```md
### What changed
- [ ] TEST-only changes
- [ ] No PROD routing/vars modified

### Verification
- [ ] Deployed to TEST (*.workers.dev)
- [ ] `/healthz` returns 200
- [ ] Flags set: FEATURE_R2_IMAGES=?, FEATURE_VOTE_API=?

### Links
- Issue:
- Test URL:
- Logs:
```

---

## 10) Hand-off to Agent/Codex (single task)

> **Task:** Create a parallel **TEST** environment for LGFC on Cloudflare **Workers** (and optional Pages).  
> **Deliverables:** Updated `wrangler.toml` with `[env.test]`, new TEST resources, per-env secrets, `/healthz` route, and deployment logs.  
> **Definition of Done:** TEST URL online with `200 /healthz`, isolated bindings, PROD untouched.

---

**End of file.**
