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

export type AdminDownloadResult = {
  ok: boolean;
  status: number;
  error: string;
  filename: string;
  blob: Blob | null;
};

export async function adminDownload(path: string): Promise<AdminDownloadResult> {
  const token = getStoredAdminToken();
  const headers = new Headers();
  if (token) headers.set('x-admin-token', token);

  try {
    const response = await fetch(path, { headers, cache: 'no-store' });
    const contentType = response.headers.get('Content-Type') || '';
    const disposition = response.headers.get('Content-Disposition') || '';
    const filenameMatch = disposition.match(/filename="([^"]+)"/);
    const filename = filenameMatch?.[1] || 'export.csv';

    if (!response.ok) {
      const data: unknown = await response.json().catch(() => ({}));
      const error = isRecord(data) && typeof data.error === 'string' ? data.error : `HTTP ${response.status}`;
      return { ok: false, status: response.status, error, filename, blob: null };
    }

    if (!contentType.includes('text/csv')) {
      return {
        ok: false,
        status: response.status,
        error: 'Export did not return CSV.',
        filename,
        blob: null,
      };
    }

    const blob = await response.blob();
    return { ok: true, status: response.status, error: '', filename, blob };
  } catch {
    return { ok: false, status: 0, error: 'Download failed.', filename: 'export.csv', blob: null };
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
