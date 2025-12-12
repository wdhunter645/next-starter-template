"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type PhotoItem = {
  id: number;
  url: string;
  is_memorabilia: number;
  description?: string | null;
  created_at: string;
};

export default function PhotoDetailPage() {
  const search = useSearchParams();
  const id = useMemo(() => Number(search.get("id")), [search]);

  const [item, setItem] = useState<PhotoItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      setItem(null);

      if (!id || Number.isNaN(id)) {
        setError("Missing or invalid id. Use /photo?id=123");
        return;
      }

      const res = await fetch(`/api/photos/get/${id}`, { method: "GET" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setError(typeof data?.error === "string" ? data.error : "Not found.");
      } else {
        setItem(data.item ?? null);
      }
    }

    load().catch((e) => {
      console.error(e);
      setError("Network error.");
    });
  }, [id]);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Photo</h1>

      {error && <p style={{ color: "red", fontWeight: 700 }}>{error}</p>}
      {!error && !item && <p>Loading…</p>}

      {item && (
        <>
          <h2 style={{ marginTop: 0 }}>#{item.id}</h2>
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
