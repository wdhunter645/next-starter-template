'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Admin guard (Day-1):
 * - Requires lgfc_member_email in localStorage
 * - Confirms role via GET /api/member/role?email=<email>
 * - If role !== 'admin', redirect to public home (/)
 *
 * NOTE: Server-side enforcement for /api/admin/* is handled by Pages Functions middleware.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const email = (window.localStorage.getItem('lgfc_member_email') || '').trim().toLowerCase();
        if (!email) {
          router.replace('/');
          return;
        }

        const res = await fetch(`/api/member/role?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        const role = String(data?.role || 'visitor').toLowerCase();

        if (!res.ok || role !== 'admin') {
          router.replace('/');
          return;
        }

        if (!alive) return;
        setOk(true);
      } catch {
        router.replace('/');
      }
    })();

    return () => { alive = false; };
  }, [router, pathname]);

  if (!ok) return null;
  return <>{children}</>;
}
