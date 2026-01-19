'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import MemberHeader from './MemberHeader';

/**
 * Chooses Visitor vs Member header based on route.
 * - /member and /member/**: member header
 * - /admin**: hide logo (admin UX)
 */
export default function SiteHeader() {
  const pathname = usePathname() || '/';
  const isMember = pathname === '/member' || pathname.startsWith('/member/');
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isMember) return <MemberHeader showLogo={!isAdmin} />;
  return <Header showLogo={!isAdmin} />;
}
