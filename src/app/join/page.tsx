'use client';

import React, { useMemo, useState } from 'react';

const styles: Record<string, React.CSSProperties> = {
  main: { padding: '40px 16px', maxWidth: 900, margin: '0 auto' },
  h1: { fontSize: 34, lineHeight: 1.15, margin: '0 0 12px 0' },
  lead: { fontSize: 18, lineHeight: 1.6, margin: '0 0 18px 0' },
  p: { fontSize: 16, lineHeight: 1.7, margin: '0 0 14px 0' },
  form: { display: 'grid', gap: 12, marginTop: 18, maxWidth: 520 },
  label: { display: 'grid', gap: 6, fontSize: 14 },
  input: { padding: '10px 12px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.2)' },
  btn: { padding: '10px 14px', fontSize: 16, borderRadius: 12, border: '1px solid rgba(0,0,0,0.2)', cursor: 'pointer' },
  msg: { marginTop: 12, padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.15)' },
  row: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  link: { color: 'var(--lgfc-blue)', textDecoration: 'none', fontWeight: 700 },
};

export default function JoinPage() {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [screen, setScreen] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const canSubmit = useMemo(() => {
    const e = email.trim();
    return first.trim().length > 0 && last.trim().length > 0 && e.includes('@') && e.length > 3;
  }, [first, last, email]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;

    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: first.trim(),
          last_name: last.trim(),
          screen_name: screen.trim() || null,
          email: email.trim().toLowerCase(),
        }),
      });

      const text = await res.text();
      let data: { ok?: boolean; error?: string; email?: { error?: string } } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { ok: false, error: text || 'Non-JSON response' };
      }

      if (res.ok && data?.ok) {
        setResult({ ok: true, message: 'You’re in. Check your inbox for a welcome message.' });
        setFirst('');
        setLast('');
        setScreen('');
        setEmail('');
      } else if (res.status === 409) {
        setResult({ ok: false, message: 'That email is already registered. Use Login instead.' });
      } else {
        const msg = data?.error || data?.email?.error || 'Join request failed. Please try again.';
        setResult({ ok: false, message: msg });
      }
    } catch (err: unknown) {
      setResult({ ok: false, message: String((err as Error)?.message || err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Join</h1>
      <p style={styles.lead}>
        Join the Lou Gehrig Fan Club mailing list. You’ll receive occasional updates about new site content, weekly photo voting,
        and upcoming fan club events.
      </p>
      <p style={styles.p}>
        This join form creates a mailing list record and enables member access once the member system is turned on.
      </p>

      <form style={styles.form} onSubmit={submit}>
        <label style={styles.label}>
          First name
          <input style={styles.input} value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First" />
        </label>
        <label style={styles.label}>
          Last name
          <input style={styles.input} value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last" />
        </label>
        <label style={styles.label}>
          Screen name
          <input style={styles.input} value={screen} onChange={(e) => setScreen(e.target.value)} placeholder="How you’ll appear to others" />
        </label>
        <label style={styles.label}>
          Email
          <input
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            inputMode="email"
            autoCapitalize="none"
          />
        </label>

        <div style={styles.row}>
          <button style={styles.btn} disabled={!canSubmit || busy} type="submit">
            {busy ? 'Submitting...' : 'Join'}
          </button>
          <a
            href="mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed%20JOIN"
            style={styles.link}
            aria-label="Contact support via email"
          >
            Support
          </a>
        </div>
      </form>

      {result && (
        <div style={styles.msg}>
          <strong>{result.ok ? 'Success' : 'Error'}:</strong> {result.message}
          {!result.ok && result.message.toLowerCase().includes('login') && (
            <>
              <br />
              <a href="/login" style={styles.link}>
                Go to Login
              </a>
            </>
          )}
        </div>
      )}
    </main>
  );
}
