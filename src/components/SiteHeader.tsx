'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import FanClubHeader from './FanClubHeader';
import FloatingLogo from './FloatingLogo';

/**
 * Route-based header selection ONLY.
 * - /fanclub and /fanclub/** => FanClubHeader
 * - everything else => Header
 *
 * Classic/locked behavior:
 * - Sticky header always present.
 * - FloatingLogo is a separate overlay on "/" and "/fanclub" only.
 * - When FloatingLogo is present, we hide the small header logo to avoid duplication.
 */
export default function SiteHeader() {
  const pathname = usePathname() || '/';

  const isHome = pathname === '/';
  const isFanClubRoot = pathname === '/fanclub' || pathname === '/fanclub/';
  const isFanClub = pathname === '/fanclub' || pathname.startsWith('/fanclub/');

  const showFloatingLogo = isHome || isFanClubRoot;

  return (
    <>
      {showFloatingLogo ? <FloatingLogo homeRoute="/" /> : null}
      {isFanClub ? (
        <FanClubHeader showLogo={!showFloatingLogo} />
      ) : (
        <Header showLogo={!showFloatingLogo} />
      )}
    </>
  );
}
