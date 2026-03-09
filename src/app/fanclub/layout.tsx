'use client';

import { useMemberSession } from '@/hooks/useMemberSession';

/**
 * FanClub Layout - session-backed route protection for /fanclub/** routes.
 * Unauthenticated users are redirected to the public homepage.
 */
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useMemberSession({ redirectTo: '/' });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
