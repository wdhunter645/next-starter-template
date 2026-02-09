'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import MemberHeader from './MemberHeader';
import FloatingLogo from './FloatingLogo';

/**
 * Route-based header selection ONLY.
 * - /fanclub and /fanclub/** => MemberHeader
 * - everything else (including /admin/**) => Header
 */
export default function SiteHeader() {
  const pathname = usePathname() || '/';
  const showFloatingLogo = pathname === '/' || pathname === '/fanclub' || pathname === '/fanclub/';
  const isFanClub = pathname === '/fanclub' || pathname.startsWith('/fanclub/');

  if (isFanClub) return <MemberHeader showLogo />;

  return <Header showLogo />;
}
