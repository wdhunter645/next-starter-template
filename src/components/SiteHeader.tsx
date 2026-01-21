'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from './Header';
import MemberHeader from './MemberHeader';

/**
 * Chooses Visitor vs Member header based on route and login state.
 * - /member and /member/**: member header
 * - /admin**: member header if logged in, visitor header otherwise
 */
export default function SiteHeader() {
  const pathname = usePathname() || '/';
  const isMember = pathname === '/member' || pathname === '/memberpage' || pathname.startsWith('/member/') || pathname.startsWith('/memberpage/');
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if member is logged in
    try {
      const memberEmail = window.localStorage.getItem('lgfc_member_email');
      setIsLoggedIn(!!memberEmail);
    } catch {
      setIsLoggedIn(false);
    }
  }, [pathname]);

  // For member routes, always use MemberHeader
  if (isMember) return <MemberHeader showLogo={!isAdmin} />;
  
  // For admin routes, use MemberHeader if logged in
  if (isAdmin && isLoggedIn) return <MemberHeader showLogo={!isAdmin} homeRoute="/member" />;
  
  // Otherwise use visitor Header
  return <Header showLogo={!isAdmin} />;
}
