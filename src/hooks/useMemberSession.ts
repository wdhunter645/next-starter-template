'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type MemberRole = 'admin' | 'member' | 'guest';

type MemberSessionState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  email: string;
  role: MemberRole;
};

type SessionResponse = {
  ok?: boolean;
  email?: string;
  role?: string;
};

type UseMemberSessionOptions = {
  redirectTo?: string;
  requireAdmin?: boolean;
};

export function useMemberSession(options: UseMemberSessionOptions = {}): MemberSessionState {
  const router = useRouter();
  const [state, setState] = useState<MemberSessionState>({
    isLoading: true,
    isAuthenticated: false,
    email: '',
    role: 'guest',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/session/me', {
          credentials: 'include',
          cache: 'no-store',
          headers: { accept: 'application/json' },
        });

        const json = (await res.json().catch(() => null)) as SessionResponse | null;
        const ok = Boolean(json?.ok);
        const email = typeof json?.email === 'string' ? json.email.trim().toLowerCase() : '';
        const role: MemberRole = json?.role === 'admin' ? 'admin' : ok && email ? 'member' : 'guest';
        const isAuthenticated = ok && !!email;
        const shouldRedirect =
          !!options.redirectTo && (!isAuthenticated || (options.requireAdmin && role !== 'admin'));

        if (cancelled) return;

        setState({
          isLoading: false,
          isAuthenticated,
          email,
          role,
        });

        if (shouldRedirect) {
          router.replace(options.redirectTo!);
        }
      } catch {
        if (cancelled) return;

        setState({
          isLoading: false,
          isAuthenticated: false,
          email: '',
          role: 'guest',
        });

        if (options.redirectTo) {
          router.replace(options.redirectTo);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [options.redirectTo, options.requireAdmin, router]);

  return state;
}
