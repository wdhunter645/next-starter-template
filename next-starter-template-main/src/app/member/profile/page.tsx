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
    </main>
  );
}
