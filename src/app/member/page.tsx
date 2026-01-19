'use client';

import React, { useEffect, useState } from 'react';

export default function MemberHomePage() {
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    try {
      setEmail(window.localStorage.getItem('lgfc_member_email') || '');
    } catch {
      setEmail('');
    }
  }, []);

  return (
    <main style={{ padding: '40px 16px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, margin: '0 0 12px 0' }}>Member Home</h1>
      {!email ? (
        <div style={{ padding: 16, borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}>
          <p style={{ marginTop: 0, opacity: 0.85 }}>
            You’re not signed in yet. Use Login to continue.
          </p>
          <a href="/login" style={{ color: 'var(--lgfc-blue)', fontWeight: 700, textDecoration: 'none' }}>
            Go to Login
          </a>
        </div>
      ) : (
        <p style={{ marginTop: 0, opacity: 0.85 }}>Signed in as: <strong>{email}</strong></p>
      )}

      <section style={{ marginTop: 22 }}>
        <h2 style={{ textAlign: 'center', color: 'var(--lgfc-blue)', margin: '0 0 10px 0' }}>What’s New</h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div style={{ padding: 16, borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}>
            <strong>Member Posts</strong>
            <p style={{ margin: '8px 0 0 0', opacity: 0.85 }}>Coming next: last 5 member discussions, with moderation flags.</p>
          </div>
          <div style={{ padding: 16, borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}>
            <strong>Library Submissions</strong>
            <p style={{ margin: '8px 0 0 0', opacity: 0.85 }}>Members can submit Gehrig stories and research notes.</p>
          </div>
          <div style={{ padding: 16, borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}>
            <strong>Media & Memorabilia</strong>
            <p style={{ margin: '8px 0 0 0', opacity: 0.85 }}>In progress: photos and memorabilia archive browsing + submission.</p>
          </div>
          <div style={{ padding: 16, borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}>
            <strong>Events</strong>
            <p style={{ margin: '8px 0 0 0', opacity: 0.85 }}>Upcoming fan club events will appear here once entered via CMS.</p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 28, padding: 16, borderRadius: 14, background: 'var(--lgfc-blue)', color: '#fff' }}>
        <h2 style={{ margin: '0 0 6px 0' }}>Member Quick Links</h2>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <a href="/member/profile" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>My Profile</a>
          <a href="/member/card" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>Membership Card</a>
          <a href="/library" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>Gehrig Library</a>
          <a href="/photos" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>Photo Gallery</a>
          <a href="/memorabilia" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>Memorabilia Archive</a>
        </div>
      </section>

      <section style={{ marginTop: 28, textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Need help?</h2>
        <a
          href="mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed%20MEMBER"
          style={{ color: 'var(--lgfc-blue)', fontWeight: 700, textDecoration: 'none' }}
        >
          Support
        </a>
      </section>
    </main>
  );
}
