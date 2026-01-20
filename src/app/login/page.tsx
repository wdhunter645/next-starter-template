import React from 'react';
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
  infoBox: {
    background: '#f5f5f5',
    border: '2px solid var(--lgfc-blue)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 600,
    margin: '0 0 12px 0',
    color: '#333',
  },
  infoParagraph: {
    fontSize: 16,
    lineHeight: 1.6,
    margin: '0 0 12px 0',
    color: '#555',
  },
  ctaContainer: {
    display: 'flex',
    gap: 16,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    display: 'inline-block',
    padding: '14px 28px',
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
    background: 'var(--lgfc-blue)',
    border: 'none',
    borderRadius: 12,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  secondaryBtn: {
    display: 'inline-block',
    padding: '14px 28px',
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--lgfc-blue)',
    background: '#fff',
    border: '2px solid var(--lgfc-blue)',
    borderRadius: 12,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

/**
 * Login Page - LGFC-Lite Stub Implementation
 * 
 * This is an informational stub page only.
 * Authentication is NOT implemented in LGFC-Lite phase.
 * 
 * Purpose:
 * - Inform visitors that member login is not yet live
 * - Explain that LGFC-Lite does not support authentication
 * - Direct users to the Join flow to become members
 * 
 * IMPORTANT: This page must NOT implement any authentication logic.
 * See /docs/design/login.md for full specification.
 */
export default function LoginPage() {
  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Member Login</h1>
      
      <div style={styles.infoBox}>
        <h2 style={styles.infoTitle}>Member Login Is Not Yet Available</h2>
        <p style={styles.infoParagraph}>
          We&apos;re building something great! The Lou Gehrig Fan Club member login system is currently in development.
        </p>
        <p style={styles.infoParagraph}>
          LGFC-Lite (our current phase) is a public information site and does not yet support member authentication or login functionality.
        </p>
        <p style={styles.infoParagraph}>
          Interested in joining the Lou Gehrig Fan Club? Click the button below to learn more about membership and get notified when member features become available.
        </p>
      </div>

      <div style={styles.ctaContainer}>
        <Link href="/member" style={styles.primaryBtn}>
          Join the Fan Club
        </Link>
        <Link href="/" style={styles.secondaryBtn}>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
