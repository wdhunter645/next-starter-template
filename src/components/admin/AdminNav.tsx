'use client';

import React from 'react';

export default function AdminNav() {
  const linkStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '8px 10px',
    border: '1px solid #e6e6e6',
    borderRadius: 10,
    textDecoration: 'none',
    fontSize: 13,
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
      <a href="/admin" style={linkStyle}>Dashboard</a>
      <a href="/admin/faq" style={linkStyle}>FAQ</a>
      <a href="/admin/cms" style={linkStyle}>CMS</a>
      <a href="/admin/content" style={linkStyle}>Content</a>
      <a href="/admin/d1-test" style={linkStyle}>D1 Test</a>
      <a href="/admin/join-requests" style={linkStyle}>Join Requests</a>
      <a href="/admin/media-assets" style={linkStyle}>Media Assets</a>
    </div>
  );
}
