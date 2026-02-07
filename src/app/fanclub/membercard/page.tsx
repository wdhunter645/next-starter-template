'use client';

import React, { useEffect, useState } from 'react';

// FanClub auth gate (LGFC-Lite): redirect unauthenticated users to public home.
function requireFanclubAuth(): string | null {
  if (typeof window === 'undefined') return null;
  const email = window.localStorage.getItem('lgfc_member_email');
  return email && email.trim() ? email.trim() : null;
}

type Content = { title: string; body_md: string } | null;

export default function MembershipCardPage() {
  const [content, setContent] = useState<Content>(null);

  useEffect(() => {
    const email = requireFanclubAuth();
    if (!email) window.location.href = '/';
  }, []);

  useEffect(() => {
    async function load() {
      try {
        // FIX: correct endpoint name
        const res = await fetch('/api/fanclub-membership-card', { cache: 'no-store' });

        // Guard: avoid trying to parse HTML (404/login pages) as JSON
        const ct = res.headers.get('content-type') || '';
        if (!res.ok || !ct.includes('application/json')) {
          const text = await res.text();
          console.error('Membership card API non-JSON/failed response:', res.status, ct, text.slice(0, 300));
          return;
        }

        const data = await res.json();
        if (data?.ok && data?.content?.body_md) {
          setContent({
            title: String(data.content.title || 'Membership Card'),
            body_md: String(data.content.body_md),
          });
        }
      } catch (e: unknown) {
        console.error('Membership card API error:', e);
      }
    }
    load();
  }, []);

  return (
    <main style={{ padding: '44px 16px', maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ fontSize: 40, margin: '0 0 10px 0', color: '#0033cc' }}>
        {content?.title || 'Obtain Membership Card'}
      </h1>

      <div style={{ marginTop: 14, padding: 20, borderRadius: 16, border: '1px solid rgba(0,0,0,0.12)' }}>
        <p style={{ margin: 0, lineHeight: 1.7, fontSize: 16, opacity: 0.92 }}>
          Instructions to obtain your <strong>FREE</strong> Fan Club Membership Card.
        </p>

        <ol style={{ margin: '14px 0 0 20px', padding: 0, lineHeight: 1.7 }}>
          <li>Prepare a self-addressed stamped envelope (SASE).</li>
          <li>Mail the SASE to the address below.</li>
          <li>We’ll fill out your card and return it using the provided stamped envelope.</li>
        </ol>

        <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.03)' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Mail To</div>
          <address style={{ fontStyle: 'normal', lineHeight: 1.6, margin: 0 }}>
            Lou Gehrig Fan Club
            <br />
            <span style={{ whiteSpace: 'nowrap' }}>PO Box 145</span>
            <br />
            Glendora, NJ 08029
          </address>
        </div>

        <ul style={{ margin: '16px 0 0 20px', padding: 0, lineHeight: 1.7, opacity: 0.92 }}>
          <li>No information is retained.</li>
          <li>Membership cards are always free.</li>
        </ul>
      </div>

      {/* If you want admin link visible, make it explicit and clean */}
      {/* <p style={{ marginTop: 14, opacity: 0.75 }}><a href="/admin">Admin</a></p> */}
    </main>
  );
}
