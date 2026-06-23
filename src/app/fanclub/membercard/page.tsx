'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMemberSession } from '@/hooks/useMemberSession';

export default function MemberCardRedirectPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useMemberSession({ redirectTo: '/' });

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    router.replace('/fanclub/myprofile#membership-card');
  }, [isLoading, isAuthenticated, router]);

  return null;
}
