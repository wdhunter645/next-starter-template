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
