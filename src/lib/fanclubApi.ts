export function buildFanclubPhotoListApiUrl(options?: {
  limit?: number;
  offset?: number;
  memorabilia?: boolean;
}): string {
  const params = new URLSearchParams();

  if (typeof options?.offset === 'number' && Number.isFinite(options.offset)) {
    const page = Math.floor(options.offset / (options?.limit || 24)) + 1;
    params.set('page', String(Math.max(1, page)));
  }

  const path = options?.memorabilia ? '/api/fanclub/memorabilia' : '/api/fanclub/photos';
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
