'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Mode = 'login' | 'join';

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

function InnerAuthClient({ defaultMode }: { defaultMode?: Mode }) {
  const sp = useSearchParams();

  const initialMode = useMemo<Mode>(() => {
    if (defaultMode) return defaultMode;
    const m = (sp.get('mode') || '').toLowerCase();
    return m === 'join' ? 'join' : 'login';
  }, [sp, defaultMode]);

  const [mode, setMode] = useState<Mode>(initialMode);

  // join fields
  const [screenName, setScreenName] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailJoin, setEmailJoin] = useState('');
  const [emailOptIn, setEmailOptIn] = useState(true);

  // login field
  const [emailLogin, setEmailLogin] = useState('');

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function doJoin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const { first, last } = splitName(fullName);
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          first_name: first,
          last_name: last,
          screen_name: screenName,
          email: emailJoin,
          email_opt_in: emailOptIn,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || data?.status || 'Join failed.');
        return;
      }
      // If already joined, still allow login.
      setMsg('Joined. Logging you in…');

      // Auto-login (requires join request to exist; OK either way)
      const res2 = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: emailJoin }),
      });
      const data2 = await res2.json().catch(() => ({}));
      if (!res2.ok) {
        setMsg(data2?.error || 'Joined, but login failed. Try the Login tab.');
        setMode('login');
        setEmailLogin(emailJoin);
        return;
      }

      window.location.href = '/fanclub';
    } catch (err: any) {
      setMsg(err?.message || 'Join failed.');
    } finally {
      setBusy(false);
    }
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: emailLogin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || 'Login failed.');
        return;
      }
      window.location.href = '/fanclub';
    } catch (err: any) {
      setMsg(err?.message || 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: '40px auto', padding: 20 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Join / Login</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button type="button" onClick={() => { setMode('login'); setMsg(null); }} style={{ flex: 1 }}>
          Login
        </button>
        <button type="button" onClick={() => { setMode('join'); setMsg(null); }} style={{ flex: 1 }}>
          Join
        </button>
      </div>

      {msg && (
        <div style={{ marginBottom: 14, padding: 10, border: '1px solid #ccc', borderRadius: 8 }}>
          {msg}
        </div>
      )}

      {mode === 'login' && (
        <form onSubmit={doLogin}>
          <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
          <input
            value={emailLogin}
            onChange={(e) => setEmailLogin(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ width: '100%', marginBottom: 12, padding: 10 }}
            autoComplete="email"
            inputMode="email"
          />
          <button type="submit" disabled={busy} style={{ width: '100%', padding: 10 }}>
            {busy ? 'Working…' : 'Login'}
          </button>
        </form>
      )}

      {mode === 'join' && (
        <form onSubmit={doJoin}>
          <label style={{ display: 'block', marginBottom: 6 }}>Screen name / alias</label>
          <input
            value={screenName}
            onChange={(e) => setScreenName(e.target.value)}
            placeholder="Your public name"
            required
            style={{ width: '100%', marginBottom: 12, padding: 10 }}
            autoComplete="nickname"
          />

          <label style={{ display: 'block', marginBottom: 6 }}>Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="First Last"
            required
            style={{ width: '100%', marginBottom: 12, padding: 10 }}
            autoComplete="name"
          />

          <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
          <input
            value={emailJoin}
            onChange={(e) => setEmailJoin(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ width: '100%', marginBottom: 10, padding: 10 }}
            autoComplete="email"
            inputMode="email"
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={emailOptIn}
              onChange={(e) => setEmailOptIn(e.target.checked)}
            />
            Receive emails about updates (optional)
          </label>

          <button type="submit" disabled={busy} style={{ width: '100%', padding: 10 }}>
            {busy ? 'Working…' : 'Join'}
          </button>
        </form>
      )}
    </main>
  );
}

export default function AuthClient(props: { defaultMode?: Mode }) {
  return (
    <Suspense fallback={<div style={{ maxWidth: 560, margin: '40px auto', padding: 20 }}>Loading…</div>}>
      <InnerAuthClient defaultMode={props.defaultMode} />
    </Suspense>
  );
}
