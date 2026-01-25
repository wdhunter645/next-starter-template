'use client';

import React, { useEffect, useMemo, useState } from "react";

type LibraryItem = { id: number; title: string; content: string; created_at: string };

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 1000, margin: "0 auto" },
  h1: { fontSize: 34, lineHeight: 1.15, margin: "0 0 12px 0" },
  lead: { fontSize: 18, lineHeight: 1.6, margin: "0 0 18px 0" },
  p: { fontSize: 16, lineHeight: 1.7, margin: "0 0 14px 0" },
  grid: { display: "grid", gridTemplateColumns: "1fr", gap: 18 },
  card: { border: "1px solid rgba(0,0,0,0.15)", borderRadius: 16, padding: 16 },
  form: { display: "grid", gap: 10 },
  label: { display: "grid", gap: 6, fontSize: 14 },
  input: { padding: "10px 12px", fontSize: 16, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" },
  textarea: { padding: "10px 12px", fontSize: 16, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)", minHeight: 120 },
  btn: { padding: "10px 14px", fontSize: 16, borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)", cursor: "pointer" },
  msg: { marginTop: 10, padding: 12, borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" },
  meta: { opacity: 0.75, fontSize: 13, marginTop: 6 },
  hr: { margin: "18px 0", opacity: 0.25 },
};

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const canSubmit = useMemo(() => {
    return name.trim() && email.includes("@") && title.trim().length >= 3 && content.trim().length >= 10;
  }, [name, email, title, content]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/library/list?limit=20");
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) setItems(Array.isArray(data.items) ? data.items : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitBusy) return;

    setSubmitBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/library/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          title: title.trim(),
          content: content.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setResult({ ok: true, message: "Submitted. Thank you — entries appear publicly once approved." });
        setTitle("");
        setContent("");
        await load();
      } else {
        setResult({ ok: false, message: data?.error || "Submission failed." });
      }
    } catch (err: unknown) {
      setResult({ ok: false, message: String((err as Error)?.message || err) });
    } finally {
      setSubmitBusy(false);
    }
  }

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>Library</h1>
      <p style={{ ...styles.lead }}>
        Submit short, source‑aware entries about Lou Gehrig and the surrounding history: stories, quotes, timelines, book notes, and links to trustworthy resources.
      </p>
      <p style={{ ...styles.p }}>
        Guidelines: be respectful, don’t upload copyrighted material you don’t own, cite sources when you can, and keep it focused. Depth comes from cross‑referencing (multiple sources that agree), not from a single link.
      </p>

      <div style={{ ...styles.grid }}>
        <section style={{ ...styles.card }}>
          <h2 style={{ margin: 0 }}>Submit an entry</h2>
          <hr style={{ ...styles.hr }} />
          <form style={{ ...styles.form }} onSubmit={submit}>
            <label style={{ ...styles.label }}>
              Name
              <input style={{ ...styles.input }} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label style={{ ...styles.label }}>
              Email
              <input style={{ ...styles.input }} value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" autoCapitalize="none" />
            </label>
            <label style={{ ...styles.label }}>
              Title
              <input style={{ ...styles.input }} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label style={{ ...styles.label }}>
              Entry
              <textarea style={{ ...styles.textarea }} value={content} onChange={(e) => setContent(e.target.value)} />
            </label>
            <button style={{ ...styles.btn }} disabled={!canSubmit || submitBusy} type="submit">
              {submitBusy ? "Submitting..." : "Submit"}
            </button>
          </form>
          {result && (
            <div style={{ ...styles.msg }}>
              <strong>{result.ok ? "Success" : "Error"}:</strong> {result.message}
            </div>
          )}
        </section>

        <section style={{ ...styles.card }}>
          <h2 style={{ margin: 0 }}>Recent entries</h2>
          <hr style={{ ...styles.hr }} />
          {loading ? (
            <p style={{ ...styles.p }}>Loading…</p>
          ) : items.length === 0 ? (
            <p style={{ ...styles.p }}>No entries yet.</p>
          ) : (
            items.map((it) => (
              <article key={it.id} style={{ marginBottom: 14 }}>
                <h3 style={{ margin: "0 0 6px 0" }}>{it.title}</h3>
                <div style={{ ...styles.meta }}>{new Date(it.created_at).toLocaleString()}</div>
                <p style={{ ...styles.p, marginTop: 8, whiteSpace: "pre-wrap" }}>{it.content}</p>
                <hr style={{ ...styles.hr }} />
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
