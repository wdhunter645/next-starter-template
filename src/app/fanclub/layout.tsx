'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * FanClub Layout - Hard-gates /fanclub/** routes
 * 
 * Unauthenticated users are redirected to / (home)
 * This provides server-side route protection per design specs
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

  // Don't render children until authorization check is complete
  if (!isAuthorized) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Checking authorization...</p>
      </div>
    );
  }

  return <>{children}</>;
}
