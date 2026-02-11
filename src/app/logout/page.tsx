'use client';

import { useEffect } from 'react';

export default function LogoutPage() {
  useEffect(() => {
    (async () => {
      try {
        // Clear server cookie session
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      } catch {}

      try {
        // Clear any client hints
        window.localStorage.removeItem('lgfc_member_email');
      } catch {}

      // Force full page reload to reset header state
      window.location.href = '/';
    })();
  }, []);

  return <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>Logging out...</main>;
}
