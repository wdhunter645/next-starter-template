'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * FanClub Layout - Client-side route protection for /fanclub/** routes
 * 
 * Unauthenticated users (no 'lgfc_member_email' in localStorage) are redirected to / (home)
 * This is client-side only protection - runs after initial page load in the browser
 */
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if member is logged in
    try {
      const memberEmail = window.localStorage.getItem('lgfc_member_email');
      if (!memberEmail) {
        // Not logged in - redirect to home
        router.push('/');
        return;
      }
      setIsAuthorized(true);
    } catch {
      // Error accessing localStorage - redirect to home
      router.push('/');
    }
  }, [router]);

  // Don't render anything until authorization check is complete
  // This prevents flash of content before redirect
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
