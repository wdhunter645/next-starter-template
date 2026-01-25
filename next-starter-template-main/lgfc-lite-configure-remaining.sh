#!/usr/bin/env bash
set -euo pipefail

# LGFC-Lite: Remaining Tasks Configurator
# - Fix JOIN UX copy (no "verification code emailed" claim)
# - Fix Library UI to match D1 schema + CF function contract
# - Add Library listing API + page section to view recent approved entries (or all entries until moderation is added)
# - Add Photos + Memorabilia pages + APIs (list + get)
# - Update hamburger menu to include Join/Library/Photos/Memorabilia/Events/Charities/Privacy/Terms
#
# Safe to re-run (idempotent overwrites).

ROOT="$(pwd)"

die() { echo "ERROR: $*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }

need git
need node
need npm

echo "== LGFC-Lite configurator starting in: $ROOT =="
test -f package.json || die "Run this from repo root (package.json not found)."

# -------------------------
# 1) JOIN page UX copy fix
# -------------------------
JOIN_PAGE="src/app/join/page.tsx"
if [ -f "$JOIN_PAGE" ]; then
  echo "== Update JOIN page copy =="
  # Normalize indentation and replace status message
  perl -0777 -i -pe 's/setStatus\("Thanks[^"]*"\);/setStatus("Thanks — your request has been received. We\'ll email you updates as the club launches.");/g' "$JOIN_PAGE"
else
  echo "WARN: $JOIN_PAGE not found; skipping JOIN copy update."
fi

# ----------------------------------------
# 2) Library UI: add name/email + content
# ----------------------------------------
LIB_PAGE="src/app/library/page.tsx"
if [ -f "$LIB_PAGE" ]; then
  echo "== Overwrite Library page to match backend contract =="
  cat > "$LIB_PAGE" <<'EOF'
"use client";

import React, { useMemo, useState } from "react";

type LibraryListItem = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

export default function LibraryPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [items, setItems] = useState<LibraryListItem[]>([]);

  const canSubmit = useMemo(() => {
    return name.trim() && email.trim() && title.trim() && content.trim();
  }, [name, email, title, content]);

  async function refreshList() {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await fetch("/api/library/list?limit=10", { method: "GET" });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setListError(typeof data?.error === "string" ? data.error : "Could not load entries.");
      } else {
        setItems(Array.isArray(data.items) ? data.items : []);
      }
    } catch (e) {
      console.error(e);
      setListError("Network error while loading entries.");
    } finally {
      setLoadingList(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      title: title.trim(),
      content: content.trim(),
    };

    if (!payload.name || !payload.email || !payload.title || !payload.content) {
      setError("Name, email, title, and story are required.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/library/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        const msg =
          typeof data?.error === "string" ? data.error : "We couldn’t save your entry. Please try again.";
        setError(msg);
      } else {
        setMessage("Thanks — your entry has been saved.");
        setTitle("");
        setContent("");
        // Keep name/email for convenience; refresh list
        refreshList().catch(() => null);
      }
    } catch (err) {
      console.error("Library submit failed:", err);
      setError("Network error. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Library</h1>
      <p>
        Share your favorite Lou Gehrig story or memory. Submissions are stored immediately. (Moderation/approval can be
        added later.)
      </p>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Submit a story</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label htmlFor="name" style={{ display: "block", fontWeight: 600 }}>
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label htmlFor="email" style={{ display: "block", fontWeight: 600 }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label htmlFor="title" style={{ display: "block", fontWeight: 600 }}>
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              required
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <label htmlFor="content" style={{ display: "block", fontWeight: 600 }}>
              Story
            </label>
            <textarea
              id="content"
              value={content}
              required
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            style={{ marginTop: 12, padding: "10px 16px", fontWeight: 700, cursor: submitting ? "default" : "pointer" }}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>

        {message && <p style={{ marginTop: 12, color: "green", fontWeight: 700 }}>{message}</p>}
        {error && <p style={{ marginTop: 12, color: "red", fontWeight: 700 }}>{error}</p>}
      </section>

      <section style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Recent entries</h2>
          <button onClick={refreshList} disabled={loadingList} style={{ padding: "8px 12px", cursor: "pointer" }}>
            {loadingList ? "Loading..." : "Refresh"}
          </button>
        </div>
        {listError && <p style={{ color: "red", fontWeight: 700 }}>{listError}</p>}
        {items.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No entries loaded yet.</p>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {items.map((it) => (
              <article key={it.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
                <h3 style={{ marginTop: 0 }}>{it.title}</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{it.content}</p>
                <p style={{ marginBottom: 0, opacity: 0.7, fontSize: 12 }}>{it.created_at}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
EOF
else
  echo "WARN: $LIB_PAGE not found; skipping Library page update."
fi

# ---------------------------------------
# 3) Add CF Pages Function: library/list
# ---------------------------------------
echo "== Add/overwrite CF Pages Function: /api/library/list =="
mkdir -p functions/api/library
cat > functions/api/library/list.ts <<'EOF'
export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") || "10")));

    const rows = await env.DB.prepare(
      "SELECT id, title, content, created_at FROM library_entries ORDER BY created_at DESC LIMIT ?;"
    )
      .bind(limit)
      .all();

    return new Response(
      JSON.stringify(
        {
          ok: true,
          items: rows.results ?? [],
        },
        null,
        2
      ),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message ?? err) }, null, 2),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
EOF

# -------------------------------------------------
# 4) Photos + Memorabilia APIs + pages (basic v1)
# -------------------------------------------------
echo "== Add/overwrite CF Pages Functions: /api/photos/list and /api/photos/get =="
mkdir -p functions/api/photos

cat > functions/api/photos/list.ts <<'EOF'
export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || "20")));
    const offset = Math.max(0, Number(url.searchParams.get("offset") || "0"));
    const memorabilia = url.searchParams.get("memorabilia");

    let sql = "SELECT id, url, is_memorabilia, description, created_at FROM photos";
    const args: any[] = [];

    if (memorabilia === "1") {
      sql += " WHERE is_memorabilia = 1";
    }

    sql += " ORDER BY id ASC LIMIT ? OFFSET ?;";
    args.push(limit, offset);

    const rows = await env.DB.prepare(sql).bind(...args).all();

    return new Response(
      JSON.stringify({ ok: true, items: rows.results ?? [], limit, offset }, null, 2),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message ?? err) }, null, 2),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
EOF

cat > functions/api/photos/get.ts <<'EOF'
export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, params } = context;

  try {
    const id = Number((params as any)?.id);
    if (!id || Number.isNaN(id)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid id" }, null, 2), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const row = await env.DB.prepare(
      "SELECT id, url, is_memorabilia, description, created_at FROM photos WHERE id = ? LIMIT 1;"
    )
      .bind(id)
      .first();

    if (!row) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }, null, 2), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, item: row }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
EOF

# Next.js pages for photos/memorabilia
echo "== Add/overwrite Next.js pages: /photos, /memorabilia, /photos/[id] =="

mkdir -p src/app/photos src/app/memorabilia src/app/photos/[id]

cat > src/app/photos/page.tsx <<'EOF'
"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

type PhotoItem = {
  id: number;
  url: string;
  is_memorabilia: number;
  description?: string | null;
  created_at: string;
};

export default function PhotosPage() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [offset, setOffset] = useState(0);
  const limit = 20;

  async function load(nextOffset: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/photos/list?limit=${limit}&offset=${nextOffset}`, { method: "GET" });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(typeof data?.error === "string" ? data.error : "Failed to load photos.");
      } else {
        setItems(Array.isArray(data.items) ? data.items : []);
        setOffset(nextOffset);
      }
    } catch (e) {
      console.error(e);
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(0).catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Photo Archive</h1>
      <p>Browse photos. (Seed/import tooling can be added next.)</p>

      {error && <p style={{ color: "red", fontWeight: 700 }}>{error}</p>}

      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "12px 0" }}>
        <button disabled={loading || offset === 0} onClick={() => load(Math.max(0, offset - limit))} style={{ padding: "8px 12px" }}>
          Prev
        </button>
        <button disabled={loading} onClick={() => load(offset + limit)} style={{ padding: "8px 12px" }}>
          Next
        </button>
        <span style={{ opacity: 0.7 }}>Showing {items.length} items (offset {offset})</span>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/photos/${p.id}`}
              style={{ display: "block", border: "1px solid #ddd", borderRadius: 12, padding: 8, textDecoration: "none", color: "inherit" }}
            >
              {/* Keeping <img> for now to avoid Next/Image config on Cloudflare. */}
              <img src={p.url} alt={p.description ?? `Photo ${p.id}`} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10 }} />
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                #{p.id} {p.is_memorabilia ? "• Memorabilia" : ""}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
EOF

cat > src/app/memorabilia/page.tsx <<'EOF'
"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

type PhotoItem = {
  id: number;
  url: string;
  is_memorabilia: number;
  description?: string | null;
  created_at: string;
};

export default function MemorabiliaPage() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [offset, setOffset] = useState(0);
  const limit = 20;

  async function load(nextOffset: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/photos/list?memorabilia=1&limit=${limit}&offset=${nextOffset}`, { method: "GET" });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(typeof data?.error === "string" ? data.error : "Failed to load memorabilia.");
      } else {
        setItems(Array.isArray(data.items) ? data.items : []);
        setOffset(nextOffset);
      }
    } catch (e) {
      console.error(e);
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(0).catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Memorabilia</h1>
      <p>Items flagged as memorabilia.</p>

      {error && <p style={{ color: "red", fontWeight: 700 }}>{error}</p>}

      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "12px 0" }}>
        <button disabled={loading || offset === 0} onClick={() => load(Math.max(0, offset - limit))} style={{ padding: "8px 12px" }}>
          Prev
        </button>
        <button disabled={loading} onClick={() => load(offset + limit)} style={{ padding: "8px 12px" }}>
          Next
        </button>
        <span style={{ opacity: 0.7 }}>Showing {items.length} items (offset {offset})</span>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/photos/${p.id}`}
              style={{ display: "block", border: "1px solid #ddd", borderRadius: 12, padding: 8, textDecoration: "none", color: "inherit" }}
            >
              <img src={p.url} alt={p.description ?? `Photo ${p.id}`} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10 }} />
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>#{p.id}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
EOF

cat > src/app/photos/[id]/page.tsx <<'EOF'
"use client";

import React, { useEffect, useState } from "react";

type PhotoItem = {
  id: number;
  url: string;
  is_memorabilia: number;
  description?: string | null;
  created_at: string;
};

export default function PhotoDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [item, setItem] = useState<PhotoItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      const res = await fetch(`/api/photos/get/${id}`, { method: "GET" });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(typeof data?.error === "string" ? data.error : "Not found.");
      } else {
        setItem(data.item ?? null);
      }
    }
    if (!id || Number.isNaN(id)) {
      setError("Invalid id.");
      return;
    }
    load().catch((e) => {
      console.error(e);
      setError("Network error.");
    });
  }, [id]);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Photo #{params.id}</h1>
      {error && <p style={{ color: "red", fontWeight: 700 }}>{error}</p>}
      {!error && !item && <p>Loading…</p>}
      {item && (
        <>
          <img src={item.url} alt={item.description ?? `Photo ${item.id}`} style={{ width: "100%", borderRadius: 12 }} />
          <p style={{ marginTop: 12, opacity: 0.9 }}>{item.description ?? "No description yet."}</p>
          <p style={{ fontSize: 12, opacity: 0.7 }}>
            Created: {item.created_at} {item.is_memorabilia ? " • Memorabilia" : ""}
          </p>
        </>
      )}
    </main>
  );
}
EOF

# -------------------------------------------------
# 5) Update Hamburger menu links
# -------------------------------------------------
echo "== Update hamburger menu links =="
MENU="src/components/HamburgerMenu.tsx"
if [ -f "$MENU" ]; then
cat > "$MENU" <<'EOF'
'use client';

import Link from 'next/link';

export default function HamburgerMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="mast-drawer" id="hamburger-menu">
      <button className="mast-drawer-close" onClick={onClose} aria-label="Close menu">
        ×
      </button>
      <ul className="mast-drawer-menu">
        <li><Link href="/" onClick={onClose}>Home</Link></li>
        <li><Link href="/join" onClick={onClose}>Join</Link></li>
        <li><Link href="/library" onClick={onClose}>Library</Link></li>
        <li><Link href="/photos" onClick={onClose}>Photos</Link></li>
        <li><Link href="/memorabilia" onClick={onClose}>Memorabilia</Link></li>
        <li><Link href="/charities" onClick={onClose}>Charities</Link></li>
        <li><Link href="/calendar" onClick={onClose}>Events</Link></li>
        <li><Link href="/about" onClick={onClose}>About</Link></li>
        <li><Link href="/contact" onClick={onClose}>Contact</Link></li>
        <li>
          <a href="https://www.bonfire.com/store/lou-gehrig-fan-club/" target="_blank" rel="noopener noreferrer">
            Store
          </a>
        </li>
        <li><Link href="/privacy" onClick={onClose}>Privacy</Link></li>
        <li><Link href="/terms" onClick={onClose}>Terms</Link></li>
        <li><Link href="/admin" onClick={onClose}>Admin</Link></li>
      </ul>
    </div>
  );
}
EOF
else
  echo "WARN: $MENU not found; skipping menu update."
fi

# -------------------------------------------------
# 6) Stage, commit, push
# -------------------------------------------------
echo "== Git status =="
git status -sb || true

echo "== Commit & push =="
git add \
  "$JOIN_PAGE" \
  "$LIB_PAGE" \
  functions/api/library/list.ts \
  functions/api/photos/list.ts \
  functions/api/photos/get.ts \
  src/app/photos/page.tsx \
  src/app/memorabilia/page.tsx \
  src/app/photos/[id]/page.tsx \
  "$MENU" || true

git commit -m "LGFC-Lite: implement library + photos/memorabilia basics and fix JOIN copy" || true
git push origin main

echo "== Done. Cloudflare will auto-deploy from main. =="
echo "Recommended smoke tests:"
echo "  - /join submit (should 200 + D1 row)"
echo "  - /library submit (should 200 + D1 row, list refresh)"
echo "  - /photos (will show 0 until photos table seeded)"
echo "  - /memorabilia (same)"