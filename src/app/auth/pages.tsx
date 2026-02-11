'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Mode = 'login' | 'join';

const styles: Record<string, React.CSSProperties> = {
  main: {
    padding: '40px 16px',
    maxWidth: 900,
    margin: '0 auto',
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  h1: { fontSize: 34, lineHeight: 1.15, margin: '0 0 12px 0', color: 'var(--lgfc-blue)' },
  lead: { fontSize: 16, lineHeight: 1.6, margin: '0 0 18px 0', color: '#555' },
  tabs: { display: 'flex', gap: 10, margin: '10px 0 22px 0', flexWrap: 'wrap' },
  tab: {
    padding: '10px 14px',
    fontSize: 14,
    borderRadius: 999,
    border: '1px solid rgba(0,0,0,0.18)',
    background: 'white',
    cursor: 'pointer',
  },
  tabActive: {
    padding: '10px 14px',
    fontSize: 14,
    borderRadius: 999,
    border: '1px solid rgba(0,0,0,0.28)',
    background: 'rgba(0,0,0,0.04)',
    cursor: 'pointer',
    fontWeight: 700,
  },
  panel: {
    border: '1px solid rgba(0,0,0,0.16)',
    borderRadius: 16,
    padding: 18,
    maxWidth: 560,
    background: 'white',
  },
  form: { display: 'grid', gap: 12, marginTop: 10 },
  label: { display: 'grid', gap: 6, fontSize: 14 },
  input: { padding: '10px 12px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.2)' },
  btn: {
    padding: '10px 14px',
    fontSize: 16,
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.2)',
    cursor: 'pointer',
    background: 'white',
  },
  msg: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.2)',
    background: 'rgba(0,0,0,0.03)',
    whiteSpace: 'pre-wrap',
  },
  fine: { fontSize: 13, color: '#666', lineHeight: 1.5, marginTop: 12 },
};

function safeText(v: unknown): string {
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v); } catch { return String(v); }
}

export default function AuthPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const initialMode = useMemo<Mode>(() => {
    const m = (sp?.get('mode') || '').toLowerCase();
    return m === 'join' ? 'join' : 'login';
  }, [sp]);

  const [mode, setMode] = useState<Mode>(initialMode);

  // Join form
  const [joinEmail, setJoinEmail] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinZip, setJoinZip] = useState('');
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginMsg, setLoginMsg] = useState<string | null>(null);

  async function doJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinMsg(null);

    const email = joinEmail.trim();
    if (!email) { setJoinMsg('Email is required.'); return; }

    setJoinBusy(true);
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          name: joinName.trim() || null,
          zip: joinZip.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        setJoinMsg(`Join failed.\n\n${safeText(data?.error || data)}`);
        return;
      }

      setJoinMsg(data?.message || 'Request received. Check your email if further steps are required.');
      // gently switch to login
      setMode('login');
      setLoginEmail(email);
      setLoginMsg('Now log in using the same email address.');
    } catch (err) {
      setJoinMsg(`Join failed.\n\n${safeText(err)}`);
    } finally {
      setJoinBusy(false);
    }
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginMsg(null);

    const email = loginEmail.trim();
    if (!email) { setLoginMsg('Email is required.'); return; }

    setLoginBusy(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        setLoginMsg(`Login failed.\n\n${safeText(data?.error || data)}`);
        return;
      }

      // Many implementations send magic link; some return redirect.
      if (data?.redirectTo) {
        router.push(String(data.redirectTo));
        return;
      }

      setLoginMsg(data?.message || 'Login request sent. Check your email for the magic link.');
    } catch (err) {
      setLoginMsg(`Login failed.\n\n${safeText(err)}`);
    } finally {
      setLoginBusy(false);
    }
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Join / Login</h1>
      <p style={styles.lead}>
        One page for everything: join the club, then log in using your email.
      </p>

      <div style={styles.tabs} role="tablist" aria-label="Join or Login">
        <button
          type="button"
          onClick={() => setMode('login')}
          style={mode === 'login' ? styles.tabActive : styles.tab}
          aria-selected={mode === 'login'}
          role="tab"
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode('join')}
          style={mode === 'join' ? styles.tabActive : styles.tab}
          aria-selected={mode === 'join'}
          role="tab"
        >
          Join
        </button>
      </div>

      <section style={styles.panel} aria-live="polite">
        {mode === 'login' ? (
          <>
            <h2 style={{ margin: 0, fontSize: 20 }}>Login</h2>
            <form style={styles.form} onSubmit={doLogin}>
              <label style={styles.label}>
                Email
                <input
                  style={styles.input}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <button style={styles.btn} type="submit" disabled={loginBusy}>
                {loginBusy ? 'Sending…' : 'Send login link'}
              </button>
            </form>
            {loginMsg ? <div style={styles.msg}>{loginMsg}</div> : null}
            <div style={styles.fine}>
              If you don’t have an account yet, click <b>Join</b> above.
            </div>
          </>
        ) : (
          <>
            <h2 style={{ margin: 0, fontSize: 20 }}>Join</h2>
            <form style={styles.form} onSubmit={doJoin}>
              <label style={styles.label}>
                Email
                <input
                  style={styles.input}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={joinEmail}
                  onChange={(e) => setJoinEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label style={styles.label}>
                Name (optional)
                <input
                  style={styles.input}
                  type="text"
                  autoComplete="name"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="Your name"
                />
              </label>
              <label style={styles.label}>
                ZIP (optional)
                <input
                  style={styles.input}
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={joinZip}
                  onChange={(e) => setJoinZip(e.target.value)}
                  placeholder="e.g. 10001"
                />
              </label>
              <button style={styles.btn} type="submit" disabled={joinBusy}>
                {joinBusy ? 'Submitting…' : 'Request to join'}
              </button>
            </form>
            {joinMsg ? <div style={styles.msg}>{joinMsg}</div> : null}
            <div style={styles.fine}>
              After you join, switch to <b>Login</b> and sign in with the same email.
            </div>
          </>
        )}
      </section>
    </main>
  );
}
