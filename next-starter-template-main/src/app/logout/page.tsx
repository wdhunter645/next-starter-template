'use client';

import { useEffect } from 'react';

export default function LogoutPage() {
  useEffect(() => {
    try {
      window.localStorage.removeItem('lgfc_member_email');
    } catch {}
    // Force full page reload to reset header state
    window.location.href = '/';
  }, []);

  return <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>Logging out...</main>;
}
