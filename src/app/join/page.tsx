'use client';

import React, { useMemo, useState } from "react";

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 900, margin: "0 auto" },
  h1: { fontSize: 34, lineHeight: 1.15, margin: "0 0 12px 0" },
  lead: { fontSize: 18, lineHeight: 1.6, margin: "0 0 18px 0" },
  p: { fontSize: 16, lineHeight: 1.7, margin: "0 0 14px 0" },
  form: { display: "grid", gap: 12, marginTop: 18, maxWidth: 520 },
  label: { display: "grid", gap: 6, fontSize: 14 },
  input: { padding: "10px 12px", fontSize: 16, borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" },
  btn: { padding: "10px 14px", fontSize: 16, borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)", cursor: "pointer" },
  msg: { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" },
};

export default function JoinPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const canSubmit = useMemo(() => name.trim().length > 0 && email.trim().includes('@') && email.trim().length > 3, [name, email]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;

    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase() }),
      });

      const text = await res.text();
      let data: { ok?: boolean; status?: string; error?: string; email?: { error?: string } } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { ok: false, error: text || "Non-JSON response" };
      }

      // Handle 409 Conflict (duplicate email)
      if (res.status === 409) {
        setResult({ ok: true, message: "You're already on the list for this email address." });
        setName("");
        setEmail("");
      } else if (res.ok && data?.ok) {
        setResult({ ok: true, message: "You're in. Check your inbox for a welcome message." });
        setName("");
        setEmail("");
      } else {
        const msg = data?.error || data?.email?.error || "Join request failed. Please try again.";
        setResult({ ok: false, message: msg });
      }
    } catch (err: unknown) {
      setResult({ ok: false, message: String((err as Error)?.message || err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>Join</h1>
      <p style={{ ...styles.lead }}>
        Joining the Lou Gehrig Fan Club starts with our mailing list. You&apos;ll receive occasional updates about new site content,
        upcoming events, and community highlights.
      </p>
      <p style={{ ...styles.p }}>
        What you can expect: a welcome email after you submit the form, periodic announcements (not daily spam), and easy opt‑out.
      </p>

      <form style={{ ...styles.form }} onSubmit={submit}>
        <label style={{ ...styles.label }}>
          Name
          <input style={{ ...styles.input }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>
        <label style={{ ...styles.label }}>
          Email
          <input
            style={{ ...styles.input }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            inputMode="email"
            autoCapitalize="none"
          />
        </label>
        <button style={{ ...styles.btn }} disabled={!canSubmit || busy} type="submit">
          {busy ? "Submitting..." : "Join the mailing list"}
        </button>
      </form>

      {result && (
        <div style={{ ...styles.msg }}>
          <strong>{result.ok ? "Success" : "Error"}:</strong> {result.message}
        </div>
      )}
    </main>
  );
}
