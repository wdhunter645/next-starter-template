'use client';

import React, { useEffect, useState } from 'react';

function getStoredToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('lgfc_admin_token') || '';
}

function setStoredToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('lgfc_admin_token', token);
}

export default function AdminHome() {
  const [token, setToken] = useState('');

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Admin</h1>
      <p style={{ marginTop: 8, opacity: 0.85 }}>
        This area is protected by an <code>x-admin-token</code> header checked by Cloudflare Pages Functions.
        The UI stores the token locally in your browser (localStorage) and sends it on admin API calls.
      </p>

      <section style={{ marginTop: 20, padding: 16, border: '1px solid #ddd', borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Admin Token</h2>
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          Set <code>ADMIN_TOKEN</code> in Cloudflare Pages env vars. Paste the same value here.
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ADMIN_TOKEN"
            style={{ padding: 10, minWidth: 320, borderRadius: 8, border: '1px solid #ccc' }}
          />
          <button
            onClick={() => setStoredToken(token)}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #222', cursor: 'pointer' }}
          >
            Save Token
          </button>
          <button
            onClick={() => { setStoredToken(''); setToken(''); }}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      </section>

      <section style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a href="/admin/cms" style={{ padding: '12px 14px', border: '1px solid #222', borderRadius: 12, textDecoration: 'none' }}>
          CMS Editor (content_blocks)
        </a>
        <a href="/admin/content" style={{ padding: '12px 14px', border: '1px solid #ccc', borderRadius: 12, textDecoration: 'none' }}>
          Legacy Content Editor (page_content)
        </a>
      </section>

      <section style={{ marginTop: 24, opacity: 0.8 }}>
        <p style={{ marginBottom: 6 }}>
          Notes:
        </p>
        <ul style={{ marginTop: 0 }}>
          <li>CMS Editor uses D1 table <code>content_blocks</code> (Phase 2B).</li>
          <li>Legacy Content Editor uses D1 table <code>page_content</code> (older system).</li>
          <li>No admin token is ever logged by the server; do not paste tokens into tickets or screenshots.</li>
        </ul>
      </section>
    </main>
  );
}
