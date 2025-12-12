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
              href={`/photo?id=${p.id}`}
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
