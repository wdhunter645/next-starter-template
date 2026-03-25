'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import FanClubHeader from './FanClubHeader';

/**
 * Route-based header selection ONLY.
 * - /fanclub and /fanclub/** => FanClubHeader
 * - everything else => Header
 *
 * Classic/locked behavior:
 * - Sticky header always present.
 * - Floating logo mounts from `page.tsx` and `fanclub/page.tsx` only.
 * - When floating logo is active, we hide the small header logo to avoid duplication.
 */
export default function SiteHeader() {
  const pathname = usePathname() || '/';

  const isHome = pathname === '/';
  const isFanClubRoot = pathname === '/fanclub' || pathname === '/fanclub/';
  const isFanClub = pathname === '/fanclub' || pathname.startsWith('/fanclub/');

  const showFloatingLogo = isHome || isFanClubRoot;

  return (
    <>
      {isFanClub ? (
        <FanClubHeader showLogo={!showFloatingLogo} />
      ) : (
        <Header showLogo={!showFloatingLogo} />
      )}
    </>
  );
}
