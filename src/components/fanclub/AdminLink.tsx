'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type RoleResponse = { ok?: boolean; role?: string; isAdmin?: boolean };

export default function AdminLink() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const email = localStorage.getItem('lgfc_member_email') || '';
      if (!email) return;

      fetch(`/api/member/role?email=${encodeURIComponent(email)}`)
        .then((r) => r.json())
        .then((j: RoleResponse) => {
          const isAdmin = Boolean(j?.isAdmin) || String(j?.role || '').toLowerCase() === 'admin';
          if (isAdmin) setShow(true);
        })
        .catch(() => {});
    } catch {}
  }, []);

  if (!show) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <Link href="/admin" style={{ textDecoration: 'none' }}>
        Admin
      </Link>
    </div>
  );
}
