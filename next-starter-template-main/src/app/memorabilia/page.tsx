'use client';

import React, { useEffect, useState } from "react";

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
  btnRow: { display: "flex", gap: 10, marginTop: 14 },
  btn: { padding: "10px 14px", fontSize: 16, borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)", cursor: "pointer" },
};

export default function PhotosPage() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 24;

  async function load(nextOffset: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/photos/list?limit=${limit}&offset=${nextOffset}&memorabilia=1`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        const incoming = Array.isArray(data.items) ? data.items : [];
        if (nextOffset === 0) setItems(incoming);
        else setItems((prev) => [...prev, ...incoming]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(0);
  }, []);

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>Memorabilia</h1>
      <p style={{ ...styles.lead }}>
        A filtered view of the archive focused on items such as cards, programs, tickets, and collectibles.
      </p>
      <p style={{ ...styles.p }}>
        This starts as a simple gallery. As we tag items (year, type, source, and notes), browsing will get faster and more precise.
        If you can help identify an item or provide a better caption/source, email the club.
      </p>

      {loading && items.length === 0 ? (
        <p style={{ ...styles.p }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ ...styles.p }}>No memorabilia items yet. Check back soon as we continue to catalog the collection.</p>
      ) : (
        <>
          <div style={{ ...styles.grid }}>
            {items.map((p) => (
              <div key={p.id} style={{ ...styles.card }}>
                {p.url ? (
                  <img src={p.url} alt={p.description || `Photo ${p.id}`} style={{ ...styles.img }} loading="lazy" />
                ) : (
                  <div style={{ ...styles.img, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, opacity: 0.7 }}>
                    Image URL not configured
                  </div>
                )}
                <div style={{ ...styles.cap }}>{p.description || "—"}</div>
              </div>
            ))}
          </div>

          <div style={{ ...styles.btnRow }}>
            <button
              style={{ ...styles.btn }}
              disabled={loading}
              onClick={() => {
                const next = offset + limit;
                setOffset(next);
                load(next);
              }}
            >
              {loading ? "Loading..." : "Load more"}
            </button>
            <a style={{ ...styles.btn, textDecoration: "none", display: "inline-flex", alignItems: "center" }} href="/photos">
              View photos
            </a>
          </div>
        </>
      )}
    </main>
  );
}
