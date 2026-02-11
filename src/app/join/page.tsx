'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type JoinPayload = {
  first_name: string;
  last_name: string;
  screen_name: string;
  email: string;
  email_opt_in: boolean;
};

export default function JoinPage() {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [screen, setScreen] = useState('');
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(true);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  const canSubmit = useMemo(() => {
    return first.trim() && last.trim() && screen.trim() && email.trim();
  }, [first, last, screen, email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;

    setBusy(true);
    setMsg(null);
    setOk(null);

    const payload: JoinPayload = {
      first_name: first.trim(),
      last_name: last.trim(),
      screen_name: screen.trim(),
      email: email.trim(),
      email_opt_in: !!optIn,
    };

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as any;

      if (res.ok && data?.ok) {
        setOk(true);
        setMsg('Joined. You can log in now.');
        return;
      }

      if (res.status === 409) {
        setOk(true);
        setMsg('You are already joined. You can log in now.');
        return;
      }

      setOk(false);
      setMsg(data?.error || 'Join failed. Please try again.');
    } catch {
      setOk(false);
      setMsg('Join failed. Network error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '28px 16px 48px' }}>
      <h1 style={{ fontSize: 44, lineHeight: '48px', margin: '0 0 10px', color: 'var(--lgfc-blue)' }}>Join</h1>
      <p style={{ margin: '0 0 22px', color: 'var(--lgfc-charcoal)' }}>
        Join the Lou Gehrig Fan Club mailing list. You&apos;ll receive occasional updates about new site content, weekly photo voting, and upcoming fan club events.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>First name</div>
          <input value={first} onChange={(e) => setFirst(e.target.value)} required style={inputStyle} />
        </label>

        <label>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Last name</div>
          <input value={last} onChange={(e) => setLast(e.target.value)} required style={inputStyle} />
        </label>

        <label>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Screen name (required)</div>
          <input value={screen} onChange={(e) => setScreen(e.target.value)} required style={inputStyle} />
        </label>

        <label>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Email</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={inputStyle} />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <input checked={optIn} onChange={(e) => setOptIn(e.target.checked)} type="checkbox" />
          <span>Send me occasional fan club updates</span>
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
          {busy ? 'Joining…' : 'Join'}
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
            {msg} {ok ? <Link href="/login">Go to Login</Link> : null}
          </div>
        ) : null}

        <div style={{ marginTop: 6 }}>
          <Link href="/support">Support</Link>
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
