'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      window.localStorage.removeItem('lgfc_member_email');
    } catch {}
    router.replace('/');
  }, [router]);

  return <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>Logging out...</main>;
}
