'use client';

import React, { useEffect, useState } from 'react';

export default function MemberProfilePage() {
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    try {
      setEmail(window.localStorage.getItem('lgfc_member_email') || '');
    } catch {
      setEmail('');
    }
  }, []);

  return (
    <main style={{ padding: '40px 16px', maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, margin: '0 0 12px 0' }}>My Profile</h1>
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        This is the member profile shell. It will be expanded once member auth and profile storage are enabled.
      </p>

      <div style={{ marginTop: 18, padding: 16, borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div>
            <strong>Signed-in email:</strong> {email || '(not set)'}
          </div>
          <div style={{ opacity: 0.8 }}>
            Planned: screen name, notification preferences, membership card download, contribution history.
          </div>
        </div>
      </div>
    
      {/* Membership card instructions (moved from removed /fanclub/membercard page) */}
      <section style={{ marginTop: 36 }}>
        <h2 style={{ fontSize: 24, margin: '0 0 12px 0' }}>Membership Card</h2>
        <div
          style={{
            display: 'flex',
            gap: 18,
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 420px', minWidth: 280 }}>
            <p style={{ marginTop: 0, opacity: 0.9 }}>
              Your membership card is a digital keepsake. Save the images on the right, or show them on your phone when you want to share that you&apos;re a member of the Lou Gehrig Fan Club.
            </p>
            <ul style={{ marginTop: 10 }}>
              <li>Front and back are provided.</li>
              <li>These images are for personal use and sharing.</li>
              <li>If you need help, use the Contact page.</li>
            </ul>
          </div>

          <div style={{ flex: '0 0 360px', maxWidth: 420, display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <figure style={{ margin: 0 }}>
              <img
                src="/membercard-front.png"
                alt="Membership card - front"
                style={{ width: 170, height: 'auto', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)' }}
              />
              <figcaption style={{ fontSize: 12, opacity: 0.75, marginTop: 6, textAlign: 'center' }}>Front</figcaption>
            </figure>
            <figure style={{ margin: 0 }}>
              <img
                src="/membercard-back.png"
                alt="Membership card - back"
                style={{ width: 170, height: 'auto', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)' }}
              />
              <figcaption style={{ fontSize: 12, opacity: 0.75, marginTop: 6, textAlign: 'center' }}>Back</figcaption>
            </figure>
          </div>
        </div>
      </section>

    </main>
  );
}
