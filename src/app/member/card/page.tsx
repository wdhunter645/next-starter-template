'use client';

import React from 'react';

export default function MembershipCardPage() {
  return (
    <main style={{ padding: '40px 16px', maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, margin: '0 0 12px 0' }}>Obtain Membership Card</h1>
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        Placeholder: membership cards are generated after member auth and profile data are enabled.
      </p>

      <div style={{ marginTop: 18, padding: 16, borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}>
        <strong>Next:</strong> generate a printable/downloadable card with name, screen name, join date, and member ID.
      </div>
    </main>
  );
}
