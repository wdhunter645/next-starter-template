'use client';

import { useMemberSession } from '@/hooks/useMemberSession';

/**
 * Admin Layout - session-backed admin-only protection for /admin/** routes.
 * Non-admin or unauthenticated users are redirected to the public homepage.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, role } = useMemberSession({ redirectTo: '/', requireAdmin: true });

  if (isLoading || !isAuthenticated || role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
