'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Mode = 'join' | 'login';

type Props = {
  forcedMode?: Mode; // used by /join and /login pages
  hideModeToggle?: boolean;
};

function normalizeEmail(v: string) {
  return v.trim().toLowerCase();
}

export default function AuthClient({ forcedMode, hideModeToggle }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const initialMode = useMemo<Mode>(() => {
    if (forcedMode) return forcedMode;
    const m = (sp.get('mode') || '').toLowerCase();
    return m === 'join' ? 'join' : 'login';
  }, [forcedMode, sp]);

  const [mode, setMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Join fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [screenName, setScreenName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [emailOptIn, setEmailOptIn] = useState(true);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setMsg(null);
  }, [initialMode]);

  async function doJoin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          screen_name: screenName.trim(),
          email: normalizeEmail(joinEmail),
          email_opt_in: !!emailOptIn,
        }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || !data?.ok) {
        setMsg(data?.error || `Join failed (HTTP ${res.status})`);
        return;
      }
      setMsg('You’re on the list. Now log in to enter the Fan Club.');
      // Switch to login mode and prefill
      setMode('login');
      setLoginEmail(normalizeEmail(joinEmail));
    } catch (err: any) {
      setMsg(String(err?.message || err));
    } finally {
      setBusy(false);
    }
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: normalizeEmail(loginEmail) }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || !data?.ok) {
        setMsg(data?.error || `Login failed (HTTP ${res.status})`);
        return;
      }
      router.push('/fanclub');
      router.refresh();
    } catch (err: any) {
      setMsg(String(err?.message || err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: '42px auto', padding: 20 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 12 }}>Join / Login</h1>

      {!hideModeToggle ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => setMode('login')}
            disabled={busy}
            style={{ flex: 1, padding: '10px 12px' }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            disabled={busy}
            style={{ flex: 1, padding: '10px 12px' }}
          >
            Join
          </button>
        </div>
      ) : null}

      {msg ? (
        <div
          role="status"
          style={{
            marginBottom: 16,
            padding: '10px 12px',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 10,
            background: 'rgba(0,0,0,0.03)',
          }}
        >
          {msg}
        </div>
      ) : null}

      {mode === 'login' ? (
        <form onSubmit={doLogin}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Email</label>
          <input
            name="email"
            placeholder="you@example.com"
            required
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            style={{ width: '100%', marginBottom: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.18)' }}
            autoComplete="email"
          />
          <button type="submit" disabled={busy} style={{ width: '100%', padding: '10px 12px' }}>
            {busy ? 'Working…' : 'Login'}
          </button>
        </form>
      ) : (
        <form onSubmit={doJoin}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>First Name</label>
          <input
            name="first_name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{ width: '100%', marginBottom: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.18)' }}
            autoComplete="given-name"
          />

          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Last Name</label>
          <input
            name="last_name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{ width: '100%', marginBottom: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.18)' }}
            autoComplete="family-name"
          />

          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Screen Name / Alias</label>
          <input
            name="screen_name"
            required
            value={screenName}
            onChange={(e) => setScreenName(e.target.value)}
            style={{ width: '100%', marginBottom: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.18)' }}
            autoComplete="nickname"
          />

          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Email</label>
          <input
            name="email"
            placeholder="you@example.com"
            required
            value={joinEmail}
            onChange={(e) => setJoinEmail(e.target.value)}
            style={{ width: '100%', marginBottom: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.18)' }}
            autoComplete="email"
          />

          <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <input type="checkbox" checked={emailOptIn} onChange={(e) => setEmailOptIn(e.target.checked)} />
            <span>Send me fan club updates</span>
          </label>

          <button type="submit" disabled={busy} style={{ width: '100%', padding: '10px 12px' }}>
            {busy ? 'Working…' : 'Join'}
          </button>
        </form>
      )}

      {hideModeToggle ? (
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <button type="button" disabled={busy} onClick={() => router.push(mode === 'join' ? '/login' : '/join')}>
            {mode === 'join' ? 'Go to Login' : 'Go to Join'}
          </button>
        </div>
      ) : null}
    </main>
  );
}
