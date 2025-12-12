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
