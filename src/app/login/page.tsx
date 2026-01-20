'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const styles: Record<string, React.CSSProperties> = {
  main: { 
    padding: '40px 16px', 
    maxWidth: 700, 
    margin: '0 auto',
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  h1: { 
    fontSize: 34, 
    lineHeight: 1.15, 
    margin: '0 0 20px 0',
    color: 'var(--lgfc-blue)',
  },
  lead: {
    fontSize: 16,
    lineHeight: 1.6,
    margin: '0 0 24px 0',
    color: '#555',
  },
  form: {
    display: 'grid',
    gap: 12,
    maxWidth: 520,
  },
  label: {
    display: 'grid',
    gap: 6,
    fontSize: 14,
  },
  input: {
    padding: '10px 12px',
    fontSize: 16,
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.2)',
  },
  btn: {
    padding: '10px 14px',
    fontSize: 16,
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.2)',
    cursor: 'pointer',
    background: 'var(--lgfc-blue)',
    color: '#fff',
    fontWeight: 600,
  },
  msg: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.15)',
  },
  link: {
    color: 'var(--lgfc-blue)',
    textDecoration: 'none',
    fontWeight: 700,
  },
  secondaryBtn: {
    display: 'inline-block',
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--lgfc-blue)',
    background: '#fff',
    border: '2px solid var(--lgfc-blue)',
    borderRadius: 8,
    textDecoration: 'none',
    cursor: 'pointer',
    marginTop: 16,
  },
};

/**
 * Login Page - Operational Implementation for LGFC-Lite
 * 
 * This page validates member email via /api/login and creates a local member session.
 * 
 * Flow:
 * 1. User enters email
 * 2. POST to /api/login to validate email exists in join_requests
 * 3. If valid: set lgfc_member_email in localStorage and redirect to /member
 * 4. If invalid: show error and provide link to /join
 * 
 * Note: This is a local-session approach for LGFC-Lite, NOT secure authentication.
 * See /docs/design/login.md for full specification.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const e = email.trim();
    return e.includes('@') && e.length > 3;
  }, [email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok && data?.ok) {
        // Success: set member email in localStorage and redirect to /member
        window.localStorage.setItem('lgfc_member_email', email.trim().toLowerCase());
        router.push('/member');
      } else {
        // Failed: show error message
        const errorMsg = data?.error || 'Login failed. Please try again.';
        setError(errorMsg);
      }
    } catch (err: unknown) {
      setError(String((err as Error)?.message || err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Member Login</h1>
      
      <p style={styles.lead}>
        Enter your email address to access the member area.
      </p>

      <form style={styles.form} onSubmit={handleSubmit}>
        <label style={styles.label}>
          Email
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            inputMode="email"
            autoCapitalize="none"
          />
        </label>

        <button style={styles.btn} disabled={!canSubmit || busy} type="submit">
          {busy ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {error && (
        <div style={styles.msg}>
          <strong>Error:</strong> {error}
          <br />
          <br />
          {error.toLowerCase().includes('not found') && (
            <>
              Email not found. Please{' '}
              <Link href="/join" style={styles.link}>
                join the fan club
              </Link>{' '}
              to create an account.
            </>
          )}
        </div>
      )}

      <Link href="/" style={styles.secondaryBtn}>
        Back to Home
      </Link>
    </main>
  );
}
