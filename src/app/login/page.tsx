'use client';

import { useEffect } from 'react';
import { POST_LOGOUT_ROUTE } from '@/lib/auth-routes';

export default function LoginLegacyRedirectPage() {
  useEffect(() => {
    window.location.replace(POST_LOGOUT_ROUTE);
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      Redirecting…
    </main>
  );
}
