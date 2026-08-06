// Core library for #2899 member photo intake: validation, quarantine-key
// generation, rate limiting, and B2 quarantine storage I/O.
//
// Schema note: the pending/non-public persistence model (photos.status,
// quarantine_key, etc.) and the photo_upload_attempts rate-limit table are
// owned by #3119, not this task. Everything here that touches those columns
// detects their presence at request time and fails closed/open as documented
// per-function, rather than assuming a migration has landed.

import { AwsClient } from './aws4fetch';
import { requireB2, type B2Bindings } from './b2';

export { requireB2, type B2Bindings };

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type ImageKind = 'jpeg' | 'png' | 'webp';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 20000;

const MIME_TO_KIND: Record<string, ImageKind> = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export type ValidationFailureCode =
  | 'EMPTY'
  | 'OVERSIZED'
  | 'UNSUPPORTED_TYPE'
  | 'SIGNATURE_MISMATCH'
  | 'MALFORMED'
  | 'SUSPECT_POLYGLOT';

export type ValidationResult =
  | { ok: true; kind: ImageKind; width: number | null; height: number | null }
  | { ok: false; code: ValidationFailureCode; error: string };

export function detectImageKind(bytes: Uint8Array): ImageKind | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpeg';
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png';
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 && // RIFF
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50 // WEBP
  ) {
    return 'webp';
  }
  return null;
}

const POLYGLOT_MARKERS = ['<svg', '<?xml', '<script', '<?php', '<!doctype html', '<html'];

/**
 * Best-effort defense against text/markup payloads smuggled behind a spoofed
 * declared MIME type (e.g. an SVG or HTML polyglot). Scans only the leading
 * bytes of the file as printable ASCII; not a substitute for signature
 * detection, which remains the primary type check.
 */
export function containsPolyglotMarker(bytes: Uint8Array): boolean {
  const scanLen = Math.min(bytes.length, 1024);
  let text = '';
  for (let i = 0; i < scanLen; i++) {
    const c = bytes[i];
    text += c >= 0x20 && c < 0x7f ? String.fromCharCode(c) : ' ';
  }
  const lower = text.toLowerCase();
  return POLYGLOT_MARKERS.some((marker) => lower.includes(marker));
}

function parsePngDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24) return null;
  const isIhdr = bytes[12] === 0x49 && bytes[13] === 0x48 && bytes[14] === 0x44 && bytes[15] === 0x52;
  if (!isIhdr) return null;
  const width = ((bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19]) >>> 0;
  const height = ((bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23]) >>> 0;
  if (!width || !height) return null;
  return { width, height };
}

function parseJpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  let offset = 2; // skip SOI (FF D8)
  const len = bytes.length;
  while (offset + 4 <= len) {
    if (bytes[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = bytes[offset + 1];
    // Standalone markers carry no length field.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }
    if (offset + 4 > len) break;
    const segLen = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      if (offset + 9 > len) return null;
      const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
      const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
      if (!width || !height) return null;
      return { width, height };
    }
    if (marker === 0xda) break; // start of scan — no SOF found before entropy-coded data
    offset += 2 + segLen;
  }
  return null;
}

/**
 * WebP dimension parsing is complete for the VP8X (extended) chunk format.
 * VP8 (lossy) and VP8L (lossless) bitstream dimension parsing is out of
 * scope here; those chunk types are still validated structurally (a
 * recognized FourCC with a plausible chunk size) so decodeability of the
 * *container* is checked even where pixel dimensions are not extracted.
 */
function parseWebpDimensions(bytes: Uint8Array): { recognized: boolean; width: number | null; height: number | null } {
  if (bytes.length < 16) return { recognized: false, width: null, height: null };
  const fourCc = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);

  if (fourCc === 'VP8X') {
    if (bytes.length < 30) return { recognized: false, width: null, height: null };
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return { recognized: true, width, height };
  }

  if (fourCc === 'VP8 ' || fourCc === 'VP8L') {
    if (bytes.length < 20) return { recognized: false, width: null, height: null };
    return { recognized: true, width: null, height: null };
  }

  return { recognized: false, width: null, height: null };
}

export function validateUploadedImage(input: {
  bytes: Uint8Array;
  declaredMimeType: string;
  maxBytes?: number;
}): ValidationResult {
  const maxBytes = input.maxBytes ?? MAX_UPLOAD_BYTES;
  const bytes = input.bytes;

  if (!bytes || bytes.length === 0) {
    return { ok: false, code: 'EMPTY', error: 'Uploaded file is empty.' };
  }
  if (bytes.length > maxBytes) {
    return { ok: false, code: 'OVERSIZED', error: `File exceeds maximum allowed size of ${maxBytes} bytes.` };
  }

  const declaredKind = MIME_TO_KIND[String(input.declaredMimeType || '').toLowerCase()];
  if (!declaredKind) {
    return { ok: false, code: 'UNSUPPORTED_TYPE', error: 'Only JPEG, PNG, and WebP images are accepted.' };
  }

  if (containsPolyglotMarker(bytes)) {
    return { ok: false, code: 'SUSPECT_POLYGLOT', error: 'File contains disallowed embedded markup and was rejected.' };
  }

  const detectedKind = detectImageKind(bytes);
  if (!detectedKind) {
    return { ok: false, code: 'MALFORMED', error: 'File signature does not match a supported image format.' };
  }
  if (detectedKind !== declaredKind) {
    return {
      ok: false,
      code: 'SIGNATURE_MISMATCH',
      error: `Declared type ${declaredKind} does not match detected file signature ${detectedKind}.`,
    };
  }

  let width: number | null = null;
  let height: number | null = null;

  if (detectedKind === 'png') {
    const dims = parsePngDimensions(bytes);
    if (!dims) return { ok: false, code: 'MALFORMED', error: 'PNG file is malformed or truncated (missing/invalid IHDR chunk).' };
    width = dims.width;
    height = dims.height;
  } else if (detectedKind === 'jpeg') {
    const dims = parseJpegDimensions(bytes);
    if (!dims) return { ok: false, code: 'MALFORMED', error: 'JPEG file is malformed or truncated (no valid SOF marker found).' };
    width = dims.width;
    height = dims.height;
  } else {
    const webp = parseWebpDimensions(bytes);
    if (!webp.recognized) return { ok: false, code: 'MALFORMED', error: 'WebP file has an unrecognized or truncated chunk.' };
    width = webp.width;
    height = webp.height;
  }

  if ((width !== null && width <= 0) || (height !== null && height <= 0)) {
    return { ok: false, code: 'MALFORMED', error: 'Image dimensions are invalid.' };
  }
  if ((width !== null && width > MAX_IMAGE_DIMENSION) || (height !== null && height > MAX_IMAGE_DIMENSION)) {
    return { ok: false, code: 'MALFORMED', error: 'Image dimensions exceed the maximum allowed bound.' };
  }

  return { ok: true, kind: detectedKind, width, height };
}

// ---------------------------------------------------------------------------
// Quarantine key generation
// ---------------------------------------------------------------------------

/**
 * Randomized, unguessable quarantine object key. Deliberately not derived
 * from filename, member email, or any other user-supplied value.
 */
export function generateQuarantineKey(kind: ImageKind): string {
  const ext = kind === 'jpeg' ? 'jpg' : kind;
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const hex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `member-photos/quarantine/${yyyy}/${mm}/${hex}.${ext}`;
}

// ---------------------------------------------------------------------------
// Rate limiting (schema-gated — see module header)
// ---------------------------------------------------------------------------

export const MAX_UPLOAD_ATTEMPTS_PER_HOUR = 10;

export type RateLimitCheck = {
  allowed: boolean;
  retryAfterSeconds?: number;
  schemaAvailable: boolean;
};

async function photoUploadAttemptsTableExists(db: any): Promise<boolean> {
  try {
    const row = await db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = 'photo_upload_attempts'`)
      .first();
    return Boolean(row);
  } catch {
    return false;
  }
}

/**
 * Fails open (allowed: true, schemaAvailable: false) when the #3119
 * rate-limit table does not exist yet on this branch/environment — upload
 * must never be blocked solely because rate-limit infrastructure is
 * unavailable. Also fails open on unexpected query errors, matching
 * functions/api/login.ts's best-effort posture for its own attempt log.
 */
export async function checkUploadRateLimit(db: any, memberEmail: string): Promise<RateLimitCheck> {
  const schemaAvailable = await photoUploadAttemptsTableExists(db);
  if (!schemaAvailable) {
    return { allowed: true, schemaAvailable: false };
  }

  try {
    const row = await db
      .prepare(
        `SELECT COUNT(1) AS n FROM photo_upload_attempts
         WHERE member_email = ?1 AND ok = 0 AND datetime(created_at) >= datetime('now','-1 hour')`
      )
      .bind(memberEmail)
      .first();
    const n = Number((row as any)?.n ?? 0) || 0;
    if (n >= MAX_UPLOAD_ATTEMPTS_PER_HOUR) {
      return { allowed: false, retryAfterSeconds: 3600, schemaAvailable: true };
    }
    return { allowed: true, schemaAvailable: true };
  } catch {
    return { allowed: true, schemaAvailable: true };
  }
}

export async function recordUploadAttempt(db: any, memberEmail: string, ip: string, ok: boolean): Promise<void> {
  try {
    await db
      .prepare(`INSERT INTO photo_upload_attempts (member_email, ip, ok, created_at) VALUES (?1, ?2, ?3, datetime('now'))`)
      .bind(memberEmail, ip, ok ? 1 : 0)
      .run();
  } catch {
    // Best-effort logging only, mirrors functions/api/login.ts's logAttempt.
  }
}

// ---------------------------------------------------------------------------
// Pending record persistence (schema-gated — see module header)
// ---------------------------------------------------------------------------

/**
 * True only once #3119's additive columns exist on this environment's
 * `photos` table. The caller must fail closed (not silently accept an
 * upload with nowhere safe to record it) when this returns false.
 */
export async function hasPendingPhotoSchema(db: any): Promise<boolean> {
  try {
    const result = await db.prepare(`PRAGMA table_info(photos)`).all();
    const names = new Set((result?.results || []).map((row: any) => row.name));
    return names.has('status') && names.has('quarantine_key') && names.has('submitted_by');
  } catch {
    return false;
  }
}

export async function insertPendingPhotoRecord(
  db: any,
  params: {
    submittedBy: string;
    quarantineKey: string;
    consentConfirmed: boolean;
    creditLine?: string | null;
    description?: string | null;
  }
): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  try {
    const result = await db
      .prepare(
        `INSERT INTO photos (url, description, status, submitted_by, submitted_at, quarantine_key, consent_confirmed, credit_line)
         VALUES (?1, ?2, 'pending', ?3, datetime('now'), ?4, ?5, ?6)`
      )
      .bind(
        params.quarantineKey,
        params.description || null,
        params.submittedBy,
        params.quarantineKey,
        params.consentConfirmed ? 1 : 0,
        params.creditLine || null
      )
      .run();
    const id = Number((result as any)?.meta?.last_row_id ?? 0);
    return { ok: true, id };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : 'Pending record insert failed' };
  }
}

// ---------------------------------------------------------------------------
// B2 quarantine storage I/O
// ---------------------------------------------------------------------------
//
// functions/_lib/b2.ts is read-only (list-only) and is not in this task's
// writable allowlist. Rather than modify it, this module imports the same
// underlying AwsClient signer it already uses and implements PUT/DELETE
// directly here, within the allowlist.

function b2ObjectUrl(cfg: B2Bindings, key: string): string {
  const pathBucket = cfg.B2_BUCKET.split('/').map(encodeURIComponent).join('/');
  const pathKey = key.split('/').map(encodeURIComponent).join('/');
  return `${cfg.B2_ENDPOINT}/${pathBucket}/${pathKey}`;
}

function makeAwsClient(cfg: B2Bindings): AwsClient {
  return new AwsClient({
    accessKeyId: cfg.B2_KEY_ID,
    secretAccessKey: cfg.B2_APP_KEY,
    sessionToken: undefined,
    service: 's3',
    region: undefined,
    cache: undefined,
    retries: 2,
    initRetryMs: undefined,
  });
}

export async function putQuarantineObject(
  cfg: B2Bindings,
  key: string,
  bytes: Uint8Array,
  contentType: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const aws = makeAwsClient(cfg);
    const res = await aws.fetch(b2ObjectUrl(cfg, key), {
      method: 'PUT',
      body: bytes,
      headers: { 'Content-Type': contentType },
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `B2 PUT failed: HTTP ${res.status} ${text.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : 'B2 PUT failed' };
  }
}

/** Cleanup path for D1-succeeded/B2-orphaned or D1-failed/B2-succeeded races. */
export async function deleteQuarantineObject(cfg: B2Bindings, key: string): Promise<{ ok: boolean }> {
  try {
    const aws = makeAwsClient(cfg);
    const res = await aws.fetch(b2ObjectUrl(cfg, key), { method: 'DELETE' });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
