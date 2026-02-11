'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function InnerAuthClient() {
  const sp = useSearchParams();

  // Optional: support /auth?mode=join or /auth?mode=login
  const initialMode = useMemo(() => {
    const m = (sp.get('mode') || '').toLowerCase();
    return m === 'join' ? 'join' : 'login';
  }, [sp]);

  const [mode, setMode] = useState<'login' | 'join'>(initialMode);

  return (
    <main style={{ maxWidth: 520, margin: '40px auto', padding: 20 }}>
      <h1 style={{ textAlign: 'center' }}>Join / Login</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setMode('login')} style={{ flex: 1 }}>
          Login
        </button>
        <button onClick={() => setMode('join')} style={{ flex: 1 }}>
          Join
        </button>
      </div>

      {mode === 'login' && (
        <form method="POST" action="/api/login">
          <input
            name="email"
            placeholder="Email"
            required
            style={{ width: '100%', marginBottom: 10 }}
            autoComplete="email"
          />
          <button type="submit" style={{ width: '100%' }}>
            Send login link
          </button>
        </form>
      )}

      {mode === 'join' && (
        <form method="POST" action="/api/join">
          <input
            name="alias"
            placeholder="Screen Name / Alias"
            required
            style={{ width: '100%', marginBottom: 10 }}
            autoComplete="nickname"
          />
<input
            name="name"
            placeholder="Full Name"
            required
            style={{ width: '100%', marginBottom: 10 }}
            autoComplete="name"
          />
          <input
            name="email"
            placeholder="Email"
            required
            style={{ width: '100%', marginBottom: 10 }}
            autoComplete="email"
          />
          <button type="submit" style={{ width: '100%' }}>
            Join
          </button>
        </form>
      )}
    </main>
  );
}

export default function AuthClient() {
  // This Suspense is for the hook dependency resolution
  return (
    <Suspense fallback={<div style={{ maxWidth: 520, margin: '40px auto', padding: 20 }}>Loading…</div>}>
      <InnerAuthClient />
    </Suspense>
  );
}
