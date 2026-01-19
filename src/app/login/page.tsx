'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const styles: Record<string, React.CSSProperties> = {
  main: { padding: '40px 16px', maxWidth: 900, margin: '0 auto' },
  h1: { fontSize: 34, lineHeight: 1.15, margin: '0 0 12px 0' },
  lead: { fontSize: 18, lineHeight: 1.6, margin: '0 0 18px 0' },
  form: { display: 'grid', gap: 12, marginTop: 18, maxWidth: 520 },
  label: { display: 'grid', gap: 6, fontSize: 14 },
  input: { padding: '10px 12px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.2)' },
  btn: { padding: '10px 14px', fontSize: 16, borderRadius: 12, border: '1px solid rgba(0,0,0,0.2)', cursor: 'pointer' },
  msg: { marginTop: 12, padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.15)' },
  row: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  link: { color: 'var(--lgfc-blue)', textDecoration: 'none', fontWeight: 600 },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const canSubmit = useMemo(() => email.trim().includes('@') && email.trim().length > 3, [email]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;

    setBusy(true);
    setResult(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const text = await res.text();
      let data: { ok?: boolean; error?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { ok: false, error: text || 'Non-JSON response' };
      }

      if (res.ok && data?.ok) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('lgfc_member_email', email.trim().toLowerCase());
        }
        router.push('/member');
        return;
      }

      const msg = data?.error || 'Login failed.';
      setResult({ ok: false, message: msg });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setResult({ ok: false, message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Login</h1>
      <p style={styles.lead}>
        Enter the email you used to join. If it isn’t in our system, no email is sent and you’ll be prompted to join first.
      </p>

      <form style={styles.form} onSubmit={submit}>
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
            {busy ? 'Checking...' : 'Continue'}
          </button>
          <a
            href="mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed%20LOGIN"
            style={styles.link}
            aria-label="Contact support via email"
          >
            Support
          </a>
        </div>
      </form>

      {result && (
        <div style={styles.msg}>
          <strong>Error:</strong> {result.message}{' '}
          {result.message.toLowerCase().includes('email not found') && (
            <>
              <br />
              <a href="/join" style={styles.link}>
                Join instead
              </a>
            </>
          )}
        </div>
      )}
    </main>
  );
}
