import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useMemberSession } from '@/hooks/useMemberSession';

const mockRouterReplace = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
}));

function mockSessionFetch(payload: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: async () => payload,
    }),
  );
}

describe('useMemberSession fail-closed redirects (#1259 Task 003)', () => {
  beforeEach(() => {
    mockRouterReplace.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('redirects guests when redirectTo is configured', async () => {
    mockSessionFetch({ ok: false });

    renderHook(() => useMemberSession({ redirectTo: '/' }));

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/');
    });
  });

  it('allows authenticated members without admin requirement', async () => {
    mockSessionFetch({ ok: true, email: 'fan@example.com', role: 'member' });

    const { result } = renderHook(() => useMemberSession({ redirectTo: '/' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('member');
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('redirects authenticated members when admin is required', async () => {
    mockSessionFetch({ ok: true, email: 'fan@example.com', role: 'member' });

    renderHook(() => useMemberSession({ redirectTo: '/', requireAdmin: true }));

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/');
    });
  });

  it('allows authenticated admins when admin is required', async () => {
    mockSessionFetch({ ok: true, email: 'admin@example.com', role: 'admin' });

    const { result } = renderHook(() => useMemberSession({ redirectTo: '/', requireAdmin: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('admin');
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('redirects on session fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    renderHook(() => useMemberSession({ redirectTo: '/' }));

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/');
    });
  });
});
