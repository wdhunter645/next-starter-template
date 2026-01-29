'use client';

import React, { useMemo, useState } from 'react';

export default function SearchPage() {
  const [q, setQ] = useState('');

  const help = useMemo(() => {
    if (!q.trim()) return 'Search will cover Photos, Milestones, Charities, Calendar events, and News once CMS content is loaded.';
    return 'Search results are coming after CMS content is loaded. For now, use navigation links.';
  }, [q]);

  return (
    <main style={{ padding: '40px 16px', maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, margin: '0 0 12px 0' }}>Search</h1>
      <p style={{ opacity: 0.85, marginTop: 0 }}>{help}</p>

      <label style={{ display: 'grid', gap: 8, maxWidth: 640, marginTop: 18 }}>
        <span style={{ fontWeight: 700 }}>Search query</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try: 'World Series', 'bat', 'Yankees', '1934'"
          type="search"
          style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.2)', fontSize: 16 }}
        />
      </label>

      <div style={{ marginTop: 20, padding: 16, borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}>
        <strong>Placeholder:</strong> Search is wired after CMS content upload and indexing.
      </div>
    </main>
  );
}
