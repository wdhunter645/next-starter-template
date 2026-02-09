'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import MemberHeader from './MemberHeader';

/**
 * Route-based header selection ONLY.
 * - /fanclub and /fanclub/** => MemberHeader
 * - everything else (including /admin/**) => Header
 */
export default function SiteHeader() {
  const pathname = usePathname() || '/';
  const isFanClub = pathname === '/fanclub' || pathname.startsWith('/fanclub/');

  if (isFanClub) return <MemberHeader showLogo />;

  return <Header showLogo />;
}
