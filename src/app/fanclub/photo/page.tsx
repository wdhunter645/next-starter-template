'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";

type PhotoItem = { id: number; url: string; is_memorabilia: number; description?: string | null; created_at: string };

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 1100, margin: "0 auto" },
  h1: { fontSize: 34, lineHeight: 1.15, margin: "0 0 12px 0" },
  lead: { fontSize: 18, lineHeight: 1.6, margin: "0 0 18px 0" },
  p: { fontSize: 16, lineHeight: 1.7, margin: "0 0 14px 0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 },
  card: { border: "1px solid rgba(0,0,0,0.15)", borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.6)" },
  img: { width: "100%", height: 160, objectFit: "cover", display: "block" },
  cap: { padding: 10, fontSize: 13, lineHeight: 1.4, opacity: 0.9 },
  row: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  btn: { display: "inline-flex", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)", textDecoration: "none" },
};

export default function PhotoPage() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/photos/list?limit=60&offset=0");
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load photos.");
      const all = (data.items || []) as PhotoItem[];
      setItems(all.filter((x) => Number(x.is_memorabilia) !== 1));
    } catch (e: unknown) {
      setErr(String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <main style={styles.main}>
      <div style={styles.row}>
        <h1 style={styles.h1}>Photo Archive</h1>
        <Link style={styles.btn} href="/fanclub/memorabilia">Go to Memorabilia</Link>
      </div>

      <p style={styles.lead}>
        Photos are pulled live from the D1 <code>photos</code> table.
      </p>

      {loading ? <p style={styles.p}>Loading…</p> : null}
      {err ? <p style={styles.p}>Error: {err}</p> : null}

      {!loading && !err && items.length === 0 ? (
        <p style={styles.p}>No photos found yet.</p>
      ) : null}

      <div style={styles.grid}>
        {items.map((it) => (
          <div key={it.id} style={styles.card}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.url} alt={it.description || `Photo ${it.id}`} style={styles.img} />
            <div style={styles.cap}>
              <div style={{ fontWeight: 600 }}>#{it.id}</div>
              <div>{it.description || "—"}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
