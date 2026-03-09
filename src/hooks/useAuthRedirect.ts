/**
 * useAuthRedirect
 *
 * Client-side authentication check hook for member-only pages.
 * Redirects to visitor home (/) if user is not authenticated.
 *
 * Authentication is determined by the cookie-backed /api/session/me endpoint.
 */

import { useMemberSession } from './useMemberSession';

export function useAuthRedirect() {
  const session = useMemberSession({ redirectTo: '/' });
  return {
    isAuthenticated: session.isAuthenticated,
    isChecking: session.isLoading,
    email: session.email,
    role: session.role,
  };
}
