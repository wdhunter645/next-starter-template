'use client';

import React from 'react';
import AdminNav from './AdminNav';

export default function AdminDashboard() {
  const tile: React.CSSProperties = {
    border: '1px solid #e6e6e6',
    borderRadius: 14,
    padding: 14,
    textDecoration: 'none',
    display: 'block',
  };

  const title: React.CSSProperties = { fontWeight: 800, marginBottom: 6 };
  const sub: React.CSSProperties = { opacity: 0.8, fontSize: 13 };

  return (
    <div>
      <AdminNav />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 14 }}>
        <a href="/admin/faq" style={tile}>
          <div style={title}>FAQ</div>
          <div style={sub}>Moderate and publish FAQ entries</div>
        </a>
        <a href="/admin/join-requests" style={tile}>
          <div style={title}>Join Requests</div>
          <div style={sub}>View inbound membership requests</div>
        </a>
        <a href="/admin/media-assets" style={tile}>
          <div style={title}>Media Assets</div>
          <div style={sub}>View indexed Backblaze assets</div>
        </a>
        <a href="/admin/cms" style={tile}>
          <div style={title}>CMS</div>
          <div style={sub}>Edit page content blocks</div>
        </a>
      </div>
    </div>
  );
}
