/**
 * useAuthRedirect
 * 
 * Client-side authentication check hook for member-only pages.
 * Redirects to visitor home (/) if user is not authenticated.
 * 
 * Authentication is determined by presence of 'lgfc_member_email' in localStorage.
 * 
 * Usage:
 * ```tsx
 * 'use client';
 * import { useAuthRedirect } from '@/hooks/useAuthRedirect';
 * 
 * export default function MemberOnlyPage() {
 *   const { isAuthenticated, isChecking } = useAuthRedirect();
 * 
 *   if (isChecking || !isAuthenticated) {
 *     return null;
 *   }
 * 
 *   return <main>Member content</main>;
 * }
 * ```
 */

import { useEffect, useState } from 'react';

export function useAuthRedirect() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    try {
      const email = window.localStorage.getItem('lgfc_member_email');
      if (!email) {
        window.location.href = '/';
        return;
      }
      setIsAuthenticated(true);
      setIsChecking(false);
    } catch {
      window.location.href = '/';
    }
  }, []);

  return { isAuthenticated, isChecking };
}
