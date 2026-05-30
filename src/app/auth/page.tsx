'use client';

import { useEffect } from 'react';
import { JOIN_ROUTE } from '@/lib/auth-routes';

export default function AuthLegacyRedirectPage() {
  useEffect(() => {
    window.location.replace(JOIN_ROUTE);
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      Redirecting…
    </main>
  );
}
