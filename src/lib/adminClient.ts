'use client';

export const ADMIN_TOKEN_STORAGE_KEY = 'lgfc_admin_token';

export type AdminJsonResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getStoredAdminToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || '';
}

export function setStoredAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  const normalized = token.trim();
  if (normalized) {
    window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, normalized);
  } else {
    window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  }
}

export async function adminJson<T>(path: string, init: RequestInit = {}): Promise<AdminJsonResult<T>> {
  const token = getStoredAdminToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('x-admin-token', token);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  try {
    const response = await fetch(path, {
      ...init,
      headers,
      cache: init.cache ?? 'no-store',
    });
    const data: unknown = await response.json().catch(() => ({}));
    const ok = isRecord(data) && data.ok === true;
    const error = isRecord(data) && typeof data.error === 'string' ? data.error : `HTTP ${response.status}`;

    return {
      ok,
      status: response.status,
      data: ok ? (data as T) : null,
      error,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: 'Request failed.',
    };
  }
}
