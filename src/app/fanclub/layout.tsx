'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Fan Club area guard:
 * - Requires a member session marker in localStorage: lgfc_member_email
 * - If missing, redirect to public home (/)
 *
 * NOTE: This is a lightweight Day-1 guard. Future phases should migrate to
 * real session auth (Supabase) per repo docs.
 */
export default function FanClubLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const email = window.localStorage.getItem('lgfc_member_email') || '';
      if (!email) router.replace('/');
    } catch {
      router.replace('/');
    }
  }, [router, pathname]);

  return <>{children}</>;
}
