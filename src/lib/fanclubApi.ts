export const FANCLUB_PHOTO_LIST_API_PATH = '/api/photos/list';

export function buildFanclubPhotoListApiUrl(options?: {
  limit?: number;
  offset?: number;
  memorabilia?: boolean;
}): string {
  const params = new URLSearchParams();

  if (typeof options?.limit === 'number' && Number.isFinite(options.limit)) {
    params.set('limit', String(options.limit));
  }

  if (typeof options?.offset === 'number' && Number.isFinite(options.offset)) {
    params.set('offset', String(options.offset));
  }

  if (options?.memorabilia) {
    params.set('memorabilia', '1');
  }

  const query = params.toString();
  return query ? `${FANCLUB_PHOTO_LIST_API_PATH}?${query}` : FANCLUB_PHOTO_LIST_API_PATH;
}
