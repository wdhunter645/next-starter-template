'use client';

import { useEffect } from 'react';

export default function LogoutPage() {
  useEffect(() => {
    (async () => {
      try {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      } catch {}

      try {
        // Cleanup stale workaround data from older builds.
        window.localStorage.removeItem('lgfc_member_email');
      } catch {}

      window.location.href = '/';
    })();
  }, []);

  return <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>Logging out...</main>;
}
