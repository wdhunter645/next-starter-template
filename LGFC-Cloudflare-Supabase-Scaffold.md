# LGFC Cloudflare + Supabase Scaffold (Agent-Ready)

**Purpose:** Single-file runbook for Agents/Codex to stand up the non‑member site on **Cloudflare Pages + Workers**, wire core APIs, and connect to **Supabase** for Auth + data. Uses **R2** for images. **B2 is retired (read-only fallback optional).**

---

## 0) High-Level Assignment (No Debate)
- **Hosting + Edge API:** Cloudflare Pages + Workers (Hono)
- **Auth & Relational Data:** Supabase (Auth + Postgres + RLS)
- **Images:** Cloudflare **R2** (primary). Optional read-only **B2** fallback.
- **Hot counters & anti-abuse:** Durable Objects + Turnstile
- **Background writes & email:** Cloudflare Queues (+ MailChannels)

---

## 1) Repo Layout (create exactly)
```
lgfc/
├─ src/
│  ├─ worker.ts            # Hono app & bindings
│  ├─ do.votes.ts          # Durable Object for counters
│  ├─ queue.consumer.ts    # Queue handler to persist votes
│  ├─ r2.ts                # R2 helpers (signed, content-type, etc.)
│  ├─ auth.ts              # Supabase JWT verify helper
│  ├─ schema.sql           # Supabase DDL
│  └─ public/              # Your Canva HTML/CSS/JS (static Pages)
│     └─ index.html
├─ wrangler.toml
├─ package.json
└─ README.md
```

---

## 2) Environment Variables & Bindings
Set via Wrangler/Pages project dashboard or `wrangler.toml` (non-secrets only).

**Required bindings**
- `R2` (R2 Bucket binding)
- `VOTE_QUEUE` (Queues binding)
- `VOTES_DO` (Durable Object namespace)
- `TURNSTILE_SECRET` (secret)
- `SUPABASE_URL` (string)
- `SUPABASE_JWT_SECRET` (secret; for verifying service-signed JWTs)
- `MAILCHANNELS_DOMAIN` (optional; for outbound email)

**Optional legacy**
- `B2_PUBLIC_BASE` (e.g., `https://f00.bcbucket.com`) — read-only fallback

`wrangler.toml` (template):
```toml
name = "lgfc-worker"
main = "src/worker.ts"
compatibility_date = "2024-12-01"

[observability]
enabled = true

# --- R2 ---
[[r2_buckets]]
binding = "R2"
bucket_name = "lgfc-media"

# --- Durable Objects ---
[[durable_objects.bindings]]
name = "VOTES_DO"
class_name = "VotesDO"

# --- Queues ---
[[queues.producers]]
binding = "VOTE_QUEUE"
queue = "lgfc-vote-queue"

[[queues.consumers]]
queue = "lgfc-vote-queue"
max_batch_size = 128
max_batch_timeout = 2
max_retries = 10
dead_letter_queue = "lgfc-dlq"

# --- Vars (non-secret) ---
[vars]
SUPABASE_URL = "https://<your-project>.supabase.co"

# Secrets to set with `wrangler secret put`:
# - TURNSTILE_SECRET
# - SUPABASE_JWT_SECRET
```

**Commands (serial, with logs)**
```bash
# one-time project init (logs saved)
npm init -y 2>&1 | tee -a ./logs/setup.log
npm i hono 2>&1 | tee -a ./logs/setup.log
npm i -D typescript esbuild wrangler @cloudflare/workers-types 2>&1 | tee -a ./logs/setup.log

# wrangler setup
npx wrangler whoami 2>&1 | tee -a ./logs/setup.log
npx wrangler r2 bucket create lgfc-media 2>&1 | tee -a ./logs/setup.log
npx wrangler queues create lgfc-vote-queue 2>&1 | tee -a ./logs/setup.log
npx wrangler queues create lgfc-dlq 2>&1 | tee -a ./logs/setup.log

# secrets
echo "Add secrets interactively:" 2>&1 | tee -a ./logs/setup.log
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put SUPABASE_JWT_SECRET
```

---

## 3) Supabase DDL (Auth + Members + Photos + Votes + Timeline)
File: `src/schema.sql`
```sql
-- NOTE: auth.users exists (managed by Supabase).

create table if not exists public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  screen_name text unique not null,
  bio text,
  avatar_r2_key text,
  created_at timestamptz default now()
);

create table if not exists public.photos (
  id bigserial primary key,
  title text not null,
  description text,
  r2_key text not null,
  taken_on date,
  source_url text,
  rights text,
  tags text[],
  created_by uuid references public.members(id),
  created_at timestamptz default now()
);
create index if not exists photos_r2_key_idx on public.photos(r2_key);

create table if not exists public.votes (
  photo_id bigint references public.photos(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  voted_at timestamptz default now(),
  constraint votes_pk primary key (photo_id, member_id)
);

create table if not exists public.photo_totals (
  photo_id bigint primary key references public.photos(id),
  total bigint not null default 0
);

create table if not exists public.timeline_events (
  id bigserial primary key,
  happened_on date not null,
  headline text not null,
  body text,
  sources jsonb,
  tags text[],
  created_at timestamptz default now()
);

alter table public.members enable row level security;
create policy if not exists "member can update self"
on public.members for update
to authenticated
using (auth.uid() = id);

alter table public.photos enable row level security;
create policy if not exists "read all photos"
on public.photos for select
to anon, authenticated
using (true);

-- Writes only by admins (extend later as needed)
create policy if not exists "insert photos admin-only"
on public.photos for insert
to authenticated
with check (auth.role() = 'authenticated'); -- tighten via custom role table later

alter table public.votes enable row level security;
create policy if not exists "member votes only for self"
on public.votes for insert
to authenticated
with check (member_id = auth.uid());

-- Totals are service-updated only (no direct user writes)
alter table public.photo_totals enable row level security;
create policy if not exists "read totals"
on public.photo_totals for select
to anon, authenticated
using (true);
```

Apply with Supabase CLI or SQL editor.

---

## 4) Worker: Durable Object for Vote Counters
File: `src/do.votes.ts`
```ts
export class VotesDO {
  state: DurableObjectState;
  constructor(state: DurableObjectState, env: any) { this.state = state; }

  async fetch(req: Request) {
    const url = new URL(req.url);
    const store = await this.state.storage.get<{ [k: string]: number }>('tally') ?? {};
    if (req.method === 'POST' && url.pathname === '/vote') {
      const { photoId } = await req.json();
      store[photoId] = (store[photoId] ?? 0) + 1;
      await this.state.storage.put('tally', store);
      return Response.json(store);
    }
    if (req.method === 'GET' && url.pathname === '/snapshot') {
      return Response.json(store);
    }
    return new Response('Not Found', { status: 404 });
  }
}
```

---

## 5) Worker: Hono App (API routes + R2 image serving)
File: `src/worker.ts`
```ts
import { Hono } from 'hono';

type Bindings = {
  R2: R2Bucket;
  VOTES_DO: DurableObjectNamespace;
  VOTE_QUEUE: Queue;
  TURNSTILE_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_JWT_SECRET: string;
  B2_PUBLIC_BASE?: string;
}

const app = new Hono<{ Bindings: Bindings }>();

// --- Utils ---
async function verifyTurnstile(token: string, secret: string) {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token })
  });
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new Error('turnstile_failed');
}

function jsonBadRequest(msg: string) { return new Response(JSON.stringify({ ok: false, error: msg }), { status: 400, headers: { 'Content-Type': 'application/json' } }); }

// --- Vote (POST) ---
app.post('/api/vote', async (c) => {
  const body = await c.req.json().catch(() => null) as { photoId?: string; turnstileToken?: string } | null;
  if (!body?.photoId || !body?.turnstileToken) return jsonBadRequest('missing_fields');

  try { await verifyTurnstile(body.turnstileToken, c.env.TURNSTILE_SECRET); } catch { return jsonBadRequest('turnstile'); }

  const id = c.env.VOTES_DO.idFromName('global');
  const stub = c.env.VOTES_DO.get(id);
  const res = await stub.fetch('https://do/vote', { method: 'POST', body: JSON.stringify({ photoId: body.photoId }) });
  const snapshot = await res.json();

  // Enqueue for persistence to Supabase
  await c.env.VOTE_QUEUE.send({ type: 'vote', photoId: body.photoId, ts: Date.now() });

  return c.json({ ok: true, totals: snapshot });
});

// --- Vote totals (GET) ---
app.get('/api/results', async (c) => {
  const id = c.env.VOTES_DO.idFromName('global');
  const stub = c.env.VOTES_DO.get(id);
  const res = await stub.fetch('https://do/snapshot');
  const snapshot = await res.json();
  return c.json({ ok: true, totals: snapshot }, 200, { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' });
});

// --- R2 Image Serving (simple passthrough; upgrade to Resize later) ---
app.get('/img/*', async (c) => {
  const key = c.req.path.replace(/^\/img\//, '');

  // Try R2 first
  const obj = await c.env.R2.get(key);
  if (obj) {
    const body = await obj.arrayBuffer();
    return new Response(body, {
      headers: {
        'Content-Type': obj.httpMetadata?.contentType ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=31536000',
      }
    });
  }

  // Optional B2 read-only fallback
  if (c.env.B2_PUBLIC_BASE) {
    const proxied = await fetch(`${c.env.B2_PUBLIC_BASE}/${encodeURIComponent(key)}`, { cf: { cacheEverything: true } });
    if (proxied.ok) return proxied;
  }
  return c.notFound();
});

export default app;
```

---

## 6) Queue Consumer (persist to Supabase)
File: `src/queue.consumer.ts`
```ts
export default {
  async queue(batch: MessageBatch<{ type: 'vote', photoId: string, ts: number }>, env: any) {
    // TODO: replace with Supabase REST or pooled pg connection (preferred).
    // Pseudocode: group by photoId and upsert into photo_totals, and insert into votes if member info is present.
    const totals: Record<string, number> = {};
    for (const msg of batch.messages) {
      totals[msg.body.photoId] = (totals[msg.body.photoId] ?? 0) + 1;
    }
    // Example Supabase REST upsert into a 'photo_totals' RPC or endpoint you expose:
    // await fetch(env.SUPABASE_URL + "/functions/v1/photo_totals_upsert", { method: "POST", headers: { "Authorization": `Bearer ${env.SUPABASE_SERVICE_JWT}` }, body: JSON.stringify(totals) });
    await batch.ackAll();
  }
};
```

> Replace the TODO with your chosen Supabase insert method (Direct PostgREST, Edge Function, or pg-wire via Database Connect). Keep writes idempotent.

---

## 7) Public Site (Canva HTML)
- Place your Canva-exported `index.html` and assets in `src/public/`.
- If using Cloudflare Pages: set build to **None** and **Output directory** to `src/public` or copy on build via a script.

Optional `package.json` build step (copy public):
```json
{
  "scripts": {
    "build": "esbuild src/worker.ts --bundle --platform=browser --format=esm --outfile=dist/worker.js && cp -r src/public dist/",
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  }
}
```

---

## 8) Endpoint Contract (front-end expectations)
- `POST /api/vote` `{ photoId, turnstileToken }` → `{ ok, totals }`
- `GET /api/results` → `{ ok, totals: { [photoId]: number } }`
- `GET /img/:key?w=&h=&fit=` → serves image (resize support can be added later)
- Future:
  - `POST /api/question` `{ body, email? }` → `{ ok, id }`
  - `POST /api/event` `{ title, date, body, sources[] }` → `{ ok, id }`
  - `GET /api/photos?tag=&q=&page=` → list with signed URLs
  - `GET /api/timeline?from=&to=&tag=` → list

---

## 9) Agent/Codex Task List (do in order)

1. **Scaffold repo**
   - Create the folder layout above.
   - Add `wrangler.toml`, `package.json` dev deps, and TypeScript config if needed.

2. **Provision Cloudflare resources**
   - `r2 bucket create lgfc-media`
   - `queues create lgfc-vote-queue` & `lgfc-dlq`
   - Add DO binding `VOTES_DO` and map to class `VotesDO`.

3. **Secrets**
   - `wrangler secret put TURNSTILE_SECRET`
   - `wrangler secret put SUPABASE_JWT_SECRET`

4. **Implement & build**
   - Add `src/do.votes.ts`, `src/worker.ts`, `src/queue.consumer.ts`, `src/schema.sql`.
   - `npm run build`

5. **Deploy**
   - `wrangler deploy` (log output to `./logs/deploy.log`).

6. **Supabase**
   - Apply `src/schema.sql` (SQL editor or CLI).
   - Ensure RLS policies exist and Auth is enabled for email magic-link.

7. **Wire Front-End**
   - Update the Canva page’s vote buttons to call `POST /api/vote` with Turnstile token.
   - Leaderboard pulls from `GET /api/results`.
   - Images reference `/img/<r2_key>`.

8. **(Optional) B2 Fallback**
   - Set `B2_PUBLIC_BASE` var if legacy objects remain.
   - Confirm `/img/<missing-key>` proxies from B2 and caches at edge.

9. **Logs & Telemetry**
   - Enable Workers Observability in `wrangler.toml`.
   - Add simple console logs for queue batches and DO writes.

---

## 10) Acceptance Criteria
- `/img/<known-key>` returns `200` with long cache headers.
- `POST /api/vote` returns `{ ok: true }` and totals update on refresh.
- Queue consumer persists batches without loss (mock until Supabase RPC wired).
- Supabase tables exist; RLS allows reads for public data; member writes gated.
- Front-end no longer references B2; all images via `/img/:key`.
- Deploy is reproducible with **one** `wrangler deploy` command.

---

## 11) Notes on Turnstile & Abuse Protection
- Add `<div class="cf-turnstile" data-sitekey="SITEKEY"></div>` to vote form and pass the token to `POST /api/vote`.
- Rate-limit by IP/user-agent in DO if needed (KV counters or durable state).

---

## 12) Where to Extend Next
- Replace image passthrough with **Images/Resize** for w/h/fit params.
- Add Supabase Edge Function to upsert `photo_totals` atomically.
- Add `/api/photos` with pagination and tag filters from Postgres.
- Build member profile page (screen alias + avatar upload to R2).

---

## 13) One-Window Command Block (serial with logs)
```bash
set -euo pipefail
mkdir -p logs

# deps
npm init -y 2>&1 | tee -a logs/setup.log
npm i hono 2>&1 | tee -a logs/setup.log
npm i -D typescript esbuild wrangler @cloudflare/workers-types 2>&1 | tee -a logs/setup.log

# cf resources
npx wrangler r2 bucket create lgfc-media 2>&1 | tee -a logs/setup.log || true
npx wrangler queues create lgfc-vote-queue 2>&1 | tee -a logs/setup.log || true
npx wrangler queues create lgfc-dlq 2>&1 | tee -a logs/setup.log || true

# secrets (interactive)
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put SUPABASE_JWT_SECRET

# build & deploy
npm run build 2>&1 | tee -a logs/build.log || true
npx wrangler deploy 2>&1 | tee -a logs/deploy.log
```

---

**End of file.**
