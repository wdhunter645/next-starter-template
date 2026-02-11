'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  const canSubmit = useMemo(() => email.trim().length > 3, [email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;

    setBusy(true);
    setMsg(null);
    setOk(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = (await res.json().catch(() => ({}))) as any;

      if (res.ok && data?.ok) {
        setOk(true);
        setMsg('Logged in. Redirecting to the club…');
        window.location.href = '/fanclub';
        return;
      }

      setOk(false);
      setMsg(data?.error || 'Login failed. Please try again.');
    } catch {
      setOk(false);
      setMsg('Login failed. Network error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '28px 16px 48px' }}>
      <h1 style={{ fontSize: 44, lineHeight: '48px', margin: '0 0 10px', color: 'var(--lgfc-blue)' }}>Member Login</h1>
      <p style={{ margin: '0 0 22px', color: 'var(--lgfc-charcoal)' }}>
        Enter your email address to access the member area.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Email</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={inputStyle} />
        </label>

        <button
          type="submit"
          disabled={!canSubmit || busy}
          style={{
            marginTop: 10,
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.15)',
            background: 'var(--lgfc-blue)',
            color: 'white',
            fontWeight: 800,
            cursor: !canSubmit || busy ? 'not-allowed' : 'pointer',
            opacity: !canSubmit || busy ? 0.6 : 1,
          }}
        >
          {busy ? 'Logging in…' : 'Login'}
        </button>

        {msg ? (
          <div
            style={{
              marginTop: 10,
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.12)',
              background: ok ? 'rgba(0, 200, 83, 0.10)' : 'rgba(255, 0, 0, 0.06)',
            }}
          >
            {msg}
          </div>
        ) : null}

        <div style={{ marginTop: 6, display: 'flex', gap: 12 }}>
          <Link href="/join">Join</Link>
          <span aria-hidden="true">•</span>
          <Link href="/">Back to Home</Link>
        </div>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 12px',
  borderRadius: 12,
  border: '1px solid rgba(0,0,0,0.15)',
  outline: 'none',
};
