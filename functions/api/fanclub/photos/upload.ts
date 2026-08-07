// POST /api/fanclub/photos/upload
// #2899: authenticated, fail-closed member photo intake into private
// quarantine storage. Persists a pending, non-public record only once
// #3119's schema contract is present on this environment; otherwise fails
// closed with a deterministic SCHEMA_UNAVAILABLE response rather than
// accepting an upload with nowhere safe to record it.

import { requireMember } from '../../../_lib/session';
import { jsonResponse } from '../../../_lib/d1';
import {
  requireB2,
  validateUploadedImage,
  generateQuarantineKey,
  canonicalMimeTypeForKind,
  checkUploadRateLimit,
  recordUploadAttempt,
  putQuarantineObject,
  deleteQuarantineObject,
  hasPendingPhotoSchema,
  insertPendingPhotoRecord,
  MAX_UPLOAD_BYTES,
} from '../../../_lib/member-photo-upload';

function getIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    request.headers.get('X-Real-IP') ||
    'unknown'
  );
}

function newRequestId(): string {
  return `photo_upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const onRequestGet = async (): Promise<Response> => {
  return jsonResponse({ ok: false, error: 'Method not allowed. Use POST.' }, 405);
};

export const onRequestPost = async (context: any): Promise<Response> => {
  const { request, env } = context;
  const requestId = newRequestId();
  const ip = getIp(request);

  const auth = await requireMember(context);
  if (!auth.ok) {
    return jsonResponse({ ...auth.body, requestId }, auth.status);
  }
  const db = auth.db;
  const memberEmail = auth.email;

  const b2 = requireB2(env as Record<string, unknown>);
  if (!b2.ok) {
    return jsonResponse(
      { ok: false, error: 'Photo storage is not configured for this environment.', requestId, code: 'STORAGE_UNAVAILABLE' },
      503
    );
  }

  const rateCheck = await checkUploadRateLimit(db, memberEmail);
  if (!rateCheck.allowed) {
    return jsonResponse(
      {
        ok: false,
        error: 'Too many upload attempts. Please wait before trying again.',
        requestId,
        code: 'RATE_LIMITED',
        retryAfterSeconds: rateCheck.retryAfterSeconds,
      },
      429
    );
  }

  let form: FormData;
  try {
    const ct = (request.headers.get('content-type') || '').toLowerCase();
    if (!ct.includes('multipart/form-data')) {
      return jsonResponse({ ok: false, error: 'Expected multipart/form-data upload.', requestId, code: 'BAD_REQUEST' }, 400);
    }
    form = await request.formData();
  } catch {
    return jsonResponse({ ok: false, error: 'Could not parse upload request.', requestId, code: 'BAD_REQUEST' }, 400);
  }

  const fileField = form.get('photo');
  const hasArrayBuffer = fileField != null && typeof (fileField as any).arrayBuffer === 'function';
  if (!hasArrayBuffer) {
    return jsonResponse({ ok: false, error: 'A "photo" file field is required.', requestId, code: 'BAD_REQUEST' }, 400);
  }
  const fileLike = fileField as File;
  const declaredMimeType = fileLike.type || '';

  const consentConfirmedRaw = String(form.get('consent_confirmed') || '').toLowerCase();
  const consentConfirmed = ['true', '1', 'on', 'yes'].includes(consentConfirmedRaw);
  const creditLineRaw = form.get('credit_line');
  const creditLine = creditLineRaw ? String(creditLineRaw).slice(0, 300) : null;
  const descriptionRaw = form.get('description');
  const description = descriptionRaw ? String(descriptionRaw).slice(0, 2000) : null;

  if (!consentConfirmed) {
    await recordUploadAttempt(db, memberEmail, ip, false);
    return jsonResponse(
      { ok: false, error: 'Rights/consent confirmation is required to submit a photo.', requestId, code: 'CONSENT_REQUIRED' },
      400
    );
  }

  // Fail fast on the reported size before allocating a full in-memory buffer
  // for an oversized upload. File.size is advisory (a client could lie), so
  // the post-read byteLength check below remains as the authoritative guard.
  if (typeof fileLike.size === 'number' && fileLike.size > MAX_UPLOAD_BYTES) {
    await recordUploadAttempt(db, memberEmail, ip, false);
    return jsonResponse(
      { ok: false, error: `File exceeds maximum allowed size of ${MAX_UPLOAD_BYTES} bytes.`, requestId, code: 'OVERSIZED' },
      413
    );
  }

  let bytes: Uint8Array;
  try {
    const buf: ArrayBuffer = await fileLike.arrayBuffer();
    if (buf.byteLength > MAX_UPLOAD_BYTES) {
      await recordUploadAttempt(db, memberEmail, ip, false);
      return jsonResponse(
        { ok: false, error: `File exceeds maximum allowed size of ${MAX_UPLOAD_BYTES} bytes.`, requestId, code: 'OVERSIZED' },
        413
      );
    }
    bytes = new Uint8Array(buf);
  } catch {
    await recordUploadAttempt(db, memberEmail, ip, false);
    return jsonResponse({ ok: false, error: 'Could not read uploaded file.', requestId, code: 'BAD_REQUEST' }, 400);
  }

  const validation = validateUploadedImage({ bytes, declaredMimeType });
  if (!validation.ok) {
    await recordUploadAttempt(db, memberEmail, ip, false);
    const status = validation.code === 'OVERSIZED' ? 413 : 400;
    return jsonResponse({ ok: false, error: validation.error, requestId, code: validation.code }, status);
  }

  const schemaAvailable = await hasPendingPhotoSchema(db);
  if (!schemaAvailable) {
    return jsonResponse(
      {
        ok: false,
        error: 'Photo intake is not yet fully available on this environment.',
        requestId,
        code: 'SCHEMA_UNAVAILABLE',
      },
      503
    );
  }

  const quarantineKey = generateQuarantineKey(validation.kind);
  const contentType = canonicalMimeTypeForKind(validation.kind);

  const putResult = await putQuarantineObject(b2.cfg, quarantineKey, bytes, contentType);
  if (!putResult.ok) {
    await recordUploadAttempt(db, memberEmail, ip, false);
    return jsonResponse({ ok: false, error: 'Upload storage failed. Please try again.', requestId, code: 'STORAGE_UNAVAILABLE' }, 502);
  }

  const insertResult = await insertPendingPhotoRecord(db, {
    submittedBy: memberEmail,
    quarantineKey,
    consentConfirmed,
    creditLine,
    description,
  });

  if (!insertResult.ok) {
    // D1 failed after B2 succeeded — clean up the orphaned quarantine object
    // rather than leaving an unrecorded private file behind.
    await deleteQuarantineObject(b2.cfg, quarantineKey);
    await recordUploadAttempt(db, memberEmail, ip, false);
    return jsonResponse({ ok: false, error: 'Could not save photo submission. Please try again.', requestId, code: 'PERSIST_FAILED' }, 500);
  }

  await recordUploadAttempt(db, memberEmail, ip, true);

  return jsonResponse(
    {
      ok: true,
      status: 'pending',
      id: insertResult.id,
      requestId,
    },
    202
  );
};
