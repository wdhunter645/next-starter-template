'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import MemberHeader from './MemberHeader';
import FloatingLogo from './FloatingLogo';

/**
 * Route-based header selection ONLY.
 * - /fanclub and /fanclub/** => MemberHeader
 * - everything else (including /admin/**) => Header
 *
 * Classic homepage behavior:
 * - FloatingLogo is a separate, non-sticky visual element shown at the very top only.
 * - Header remains sticky on scroll.
 * - When FloatingLogo is present, Header/MemberHeader MUST hide its small logo.
 */
export default function SiteHeader() {
  const pathname = usePathname() || '/';

  const isFanClub = pathname === '/fanclub' || pathname.startsWith('/fanclub/');
  const showFloatingLogo = pathname === '/' || pathname === '/fanclub' || pathname === '/fanclub/';

  return (
    <>
      {showFloatingLogo ? <FloatingLogo homeRoute="/" /> : null}
      {isFanClub ? (
        <MemberHeader showLogo={!showFloatingLogo} />
      ) : (
        <Header showLogo={!showFloatingLogo} />
      )}
    </>
  );
}
