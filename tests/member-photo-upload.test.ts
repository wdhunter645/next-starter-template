import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';

import {
  containsPolyglotMarker,
  detectImageKind,
  generateQuarantineKey,
  canonicalMimeTypeForKind,
  validateUploadedImage,
  checkUploadRateLimit,
  recordUploadAttempt,
  hasPendingPhotoSchema,
  insertPendingPhotoRecord,
  MAX_UPLOAD_BYTES,
} from '../functions/_lib/member-photo-upload';

// ---------------------------------------------------------------------------
// Fixture builders — minimal-but-valid byte sequences for each format.
// ---------------------------------------------------------------------------

function validPng(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(33);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0); // signature
  bytes.set([0x00, 0x00, 0x00, 0x0d], 8); // IHDR length = 13
  bytes.set([0x49, 0x48, 0x44, 0x52], 12); // 'IHDR'
  bytes[16] = (width >>> 24) & 0xff;
  bytes[17] = (width >>> 16) & 0xff;
  bytes[18] = (width >>> 8) & 0xff;
  bytes[19] = width & 0xff;
  bytes[20] = (height >>> 24) & 0xff;
  bytes[21] = (height >>> 16) & 0xff;
  bytes[22] = (height >>> 8) & 0xff;
  bytes[23] = height & 0xff;
  // bytes[24..33) bit depth/color type/compression/filter/interlace + CRC placeholder
  return bytes;
}

function validJpeg(width: number, height: number): Uint8Array {
  // SOI, APP0 (JFIF, len 16), SOF0 (len 17: precision, height, width, 1 component)
  const bytes: number[] = [0xff, 0xd8];
  bytes.push(0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00);
  bytes.push(0xff, 0xc0, 0x00, 0x0b);
  bytes.push(0x08); // precision
  bytes.push((height >> 8) & 0xff, height & 0xff);
  bytes.push((width >> 8) & 0xff, width & 0xff);
  bytes.push(0x01, 0x01, 0x11, 0x00); // 1 component
  bytes.push(0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00); // SOS (truncated scan)
  bytes.push(0xff, 0xd9); // EOI
  return new Uint8Array(bytes);
}

function validWebpVp8x(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(30);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
  bytes.set([22, 0, 0, 0], 4); // chunk size (not validated)
  bytes.set([0x57, 0x45, 0x42, 0x50], 8); // WEBP
  bytes.set([0x56, 0x50, 0x38, 0x58], 12); // VP8X
  bytes.set([10, 0, 0, 0], 16); // VP8X chunk size = 10
  bytes[20] = 0x00; // flags
  // bytes[21..24) reserved = 0
  const w1 = width - 1;
  const h1 = height - 1;
  bytes[24] = w1 & 0xff;
  bytes[25] = (w1 >> 8) & 0xff;
  bytes[26] = (w1 >> 16) & 0xff;
  bytes[27] = h1 & 0xff;
  bytes[28] = (h1 >> 8) & 0xff;
  bytes[29] = (h1 >> 16) & 0xff;
  return bytes;
}

function validWebpVp8Lossy(): Uint8Array {
  const bytes = new Uint8Array(20);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  bytes.set([12, 0, 0, 0], 4);
  bytes.set([0x57, 0x45, 0x42, 0x50], 8);
  bytes.set([0x56, 0x50, 0x38, 0x20], 12); // 'VP8 '
  return bytes;
}

// ---------------------------------------------------------------------------
// detectImageKind / containsPolyglotMarker
// ---------------------------------------------------------------------------

describe('detectImageKind', () => {
  it('identifies JPEG, PNG, and WebP by signature', () => {
    expect(detectImageKind(validJpeg(10, 10))).toBe('jpeg');
    expect(detectImageKind(validPng(10, 10))).toBe('png');
    expect(detectImageKind(validWebpVp8x(10, 10))).toBe('webp');
  });

  it('returns null for unrecognized bytes', () => {
    expect(detectImageKind(new Uint8Array([0x00, 0x01, 0x02, 0x03]))).toBeNull();
  });
});

describe('containsPolyglotMarker', () => {
  it('flags embedded SVG/HTML/script markers', () => {
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    expect(containsPolyglotMarker(svg)).toBe(true);
  });

  it('does not flag a valid PNG', () => {
    expect(containsPolyglotMarker(validPng(10, 10))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateUploadedImage
// ---------------------------------------------------------------------------

describe('validateUploadedImage', () => {
  it('accepts a valid PNG and reports dimensions', () => {
    const result = validateUploadedImage({ bytes: validPng(640, 480), declaredMimeType: 'image/png' });
    expect(result).toEqual({ ok: true, kind: 'png', width: 640, height: 480 });
  });

  it('accepts a valid JPEG and reports dimensions', () => {
    const result = validateUploadedImage({ bytes: validJpeg(320, 200), declaredMimeType: 'image/jpeg' });
    expect(result).toEqual({ ok: true, kind: 'jpeg', width: 320, height: 200 });
  });

  it('accepts a valid WebP VP8X with dimensions', () => {
    const result = validateUploadedImage({ bytes: validWebpVp8x(100, 50), declaredMimeType: 'image/webp' });
    expect(result).toEqual({ ok: true, kind: 'webp', width: 100, height: 50 });
  });

  it('accepts a structurally valid WebP VP8 (lossy) without pixel dimensions', () => {
    const result = validateUploadedImage({ bytes: validWebpVp8Lossy(), declaredMimeType: 'image/webp' });
    expect(result).toEqual({ ok: true, kind: 'webp', width: null, height: null });
  });

  it('rejects empty files', () => {
    const result = validateUploadedImage({ bytes: new Uint8Array(0), declaredMimeType: 'image/png' });
    expect(result).toEqual({ ok: false, code: 'EMPTY', error: expect.any(String) });
  });

  it('rejects oversized files', () => {
    const bytes = new Uint8Array(MAX_UPLOAD_BYTES + 1);
    bytes.set(validPng(1, 1));
    const result = validateUploadedImage({ bytes, declaredMimeType: 'image/png' });
    expect(result.ok).toBe(false);
    expect((result as any).code).toBe('OVERSIZED');
  });

  it('rejects unsupported declared MIME types (e.g. SVG)', () => {
    const result = validateUploadedImage({ bytes: validPng(10, 10), declaredMimeType: 'image/svg+xml' });
    expect(result).toEqual({ ok: false, code: 'UNSUPPORTED_TYPE', error: expect.any(String) });
  });

  it('rejects a declared/detected signature mismatch', () => {
    const result = validateUploadedImage({ bytes: validJpeg(10, 10), declaredMimeType: 'image/png' });
    expect(result).toEqual({ ok: false, code: 'SIGNATURE_MISMATCH', error: expect.any(String) });
  });

  it('rejects a truncated/malformed PNG', () => {
    const truncated = validPng(10, 10).slice(0, 18);
    const result = validateUploadedImage({ bytes: truncated, declaredMimeType: 'image/png' });
    expect(result).toEqual({ ok: false, code: 'MALFORMED', error: expect.any(String) });
  });

  it('rejects an SVG polyglot even when declared MIME is spoofed as PNG', () => {
    const bytes = new TextEncoder().encode('<svg onload="alert(1)"></svg>');
    const result = validateUploadedImage({ bytes, declaredMimeType: 'image/png' });
    expect(result).toEqual({ ok: false, code: 'SUSPECT_POLYGLOT', error: expect.any(String) });
  });

  it('accepts a valid image with an empty declared MIME type, trusting the signature', () => {
    const result = validateUploadedImage({ bytes: validPng(10, 10), declaredMimeType: '' });
    expect(result).toEqual({ ok: true, kind: 'png', width: 10, height: 10 });
  });

  it('accepts a valid image declared as application/octet-stream, trusting the signature', () => {
    const result = validateUploadedImage({ bytes: validJpeg(10, 10), declaredMimeType: 'application/octet-stream' });
    expect(result).toEqual({ ok: true, kind: 'jpeg', width: 10, height: 10 });
  });

  it('still rejects an unrecognized signature when the declared MIME type is unspecified', () => {
    const result = validateUploadedImage({ bytes: new Uint8Array([0x00, 0x01, 0x02]), declaredMimeType: '' });
    expect(result).toEqual({ ok: false, code: 'MALFORMED', error: expect.any(String) });
  });

  it('still rejects an explicit declared/detected mismatch even though unspecified types are trusted', () => {
    const result = validateUploadedImage({ bytes: validJpeg(10, 10), declaredMimeType: 'image/png' });
    expect(result).toEqual({ ok: false, code: 'SIGNATURE_MISMATCH', error: expect.any(String) });
  });
});

describe('canonicalMimeTypeForKind', () => {
  it('maps each supported kind to its canonical MIME type', () => {
    expect(canonicalMimeTypeForKind('jpeg')).toBe('image/jpeg');
    expect(canonicalMimeTypeForKind('png')).toBe('image/png');
    expect(canonicalMimeTypeForKind('webp')).toBe('image/webp');
  });
});

// ---------------------------------------------------------------------------
// generateQuarantineKey
// ---------------------------------------------------------------------------

describe('generateQuarantineKey', () => {
  it('produces a randomized, correctly-extensioned key under member-photos/quarantine/', () => {
    const key = generateQuarantineKey('jpeg');
    expect(key).toMatch(/^member-photos\/quarantine\/\d{4}\/\d{2}\/[0-9a-f]{32}\.jpg$/);
  });

  it('is unique across calls', () => {
    const a = generateQuarantineKey('png');
    const b = generateQuarantineKey('png');
    expect(a).not.toBe(b);
  });

  it('is not derived from any caller-supplied value', () => {
    const key = generateQuarantineKey('webp');
    expect(key).toMatch(/\.webp$/);
    expect(key).not.toMatch(/example\.com|@/i);
  });
});

// ---------------------------------------------------------------------------
// Schema-gated D1 behavior — real node:sqlite, mirroring the pattern in
// tests/member-photo-schema-contract.test.ts and
// tests/content-pipeline-candidate-repository.test.ts.
// ---------------------------------------------------------------------------

function applyCurrentBranchMigrations(db: DatabaseSync, { excludeFiles = [] as string[] } = {}) {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql') && !excludeFiles.includes(file))
    .sort();
  for (const file of files) {
    db.exec(fs.readFileSync(path.join(migrationsDir, file), 'utf8'));
  }
}

/**
 * #3119's schema contract (photos.status/submitted_by/etc. and
 * photo_upload_attempts) now ships as migrations/0045_...sql. Excluding it
 * reproduces the pre-#3121 schema so the schema-absent/partial code paths
 * stay covered without hand-duplicating the migration's DDL (which would
 * drift from it and double-apply once 0045 exists on this branch).
 */
const PENDING_PHOTO_SCHEMA_MIGRATION = '0045_member_photo_pending_status_and_rate_limit.sql';

function applyMigrationsBeforePendingPhotoSchema(db: DatabaseSync) {
  applyCurrentBranchMigrations(db, { excludeFiles: [PENDING_PHOTO_SCHEMA_MIGRATION] });
}

function wrapSqliteAsD1(sqlite: DatabaseSync) {
  return {
    prepare(sql: string) {
      const stmt = sqlite.prepare(sql);
      return {
        bind: (...args: any[]) => ({
          async first() {
            return stmt.get(...args) ?? null;
          },
          async all() {
            return { results: stmt.all(...args) };
          },
          async run() {
            const result = stmt.run(...args);
            return { success: true, meta: { changes: result.changes, last_row_id: result.lastInsertRowid } };
          },
        }),
        async first() {
          return stmt.get() ?? null;
        },
        async all() {
          return { results: stmt.all() };
        },
        async run() {
          const result = stmt.run();
          return { success: true, meta: { changes: result.changes, last_row_id: result.lastInsertRowid } };
        },
      };
    },
  };
}

describe('hasPendingPhotoSchema', () => {
  it('is false before the #3119 schema contract (migration 0045) is applied', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyMigrationsBeforePendingPhotoSchema(sqlite);
    const db = wrapSqliteAsD1(sqlite);
    expect(await hasPendingPhotoSchema(db)).toBe(false);
    sqlite.close();
  });

  it('is true once the #3119 contract columns are present', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyCurrentBranchMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);
    expect(await hasPendingPhotoSchema(db)).toBe(true);
    sqlite.close();
  });

  it('is false when the migration is only partially applied', async () => {
    // Regression: a partial migration must not pass this gate and then fail
    // at insert time with a generic PERSIST_FAILED instead of a
    // deterministic SCHEMA_UNAVAILABLE.
    const sqlite = new DatabaseSync(':memory:');
    applyMigrationsBeforePendingPhotoSchema(sqlite);
    sqlite.exec(`ALTER TABLE photos ADD COLUMN status TEXT NOT NULL DEFAULT 'published';`);
    sqlite.exec(`ALTER TABLE photos ADD COLUMN quarantine_key TEXT;`);
    // submitted_by, submitted_at, consent_confirmed, credit_line intentionally omitted.
    const db = wrapSqliteAsD1(sqlite);
    expect(await hasPendingPhotoSchema(db)).toBe(false);
    sqlite.close();
  });
});

describe('checkUploadRateLimit', () => {
  it('fails open when photo_upload_attempts does not exist yet', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyMigrationsBeforePendingPhotoSchema(sqlite);
    const db = wrapSqliteAsD1(sqlite);
    const result = await checkUploadRateLimit(db, 'member@example.com');
    expect(result).toEqual({ allowed: true, schemaAvailable: false });
    sqlite.close();
  });

  it('allows uploads under the threshold once the table exists', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyCurrentBranchMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);
    await recordUploadAttempt(db, 'member@example.com', '1.2.3.4', false);
    const result = await checkUploadRateLimit(db, 'member@example.com');
    expect(result).toEqual({ allowed: true, schemaAvailable: true });
    sqlite.close();
  });

  it('blocks uploads at/over the threshold within the 1-hour window', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyCurrentBranchMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);
    for (let i = 0; i < 10; i++) {
      await recordUploadAttempt(db, 'member@example.com', '1.2.3.4', false);
    }
    const result = await checkUploadRateLimit(db, 'member@example.com');
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBe(3600);
    sqlite.close();
  });

  it('does not count a different member toward the same limit', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyCurrentBranchMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);
    for (let i = 0; i < 10; i++) {
      await recordUploadAttempt(db, 'other-member@example.com', '9.9.9.9', false);
    }
    const result = await checkUploadRateLimit(db, 'member@example.com');
    expect(result.allowed).toBe(true);
    sqlite.close();
  });
});

describe('insertPendingPhotoRecord', () => {
  it('inserts a pending row once the schema contract is present', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyCurrentBranchMigrations(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    const result = await insertPendingPhotoRecord(db, {
      submittedBy: 'member@example.com',
      quarantineKey: 'member-photos/quarantine/2026/08/deadbeef.jpg',
      consentConfirmed: true,
      creditLine: 'Photo by member@example.com',
      description: 'Test upload',
    });

    expect(result.ok).toBe(true);
    const row = sqlite
      .prepare(`SELECT status, submitted_by, quarantine_key, consent_confirmed FROM photos WHERE id = ?`)
      .get((result as any).id) as any;
    expect(row.status).toBe('pending');
    expect(row.submitted_by).toBe('member@example.com');
    expect(row.quarantine_key).toBe('member-photos/quarantine/2026/08/deadbeef.jpg');
    expect(row.consent_confirmed).toBe(1);
    sqlite.close();
  });

  it('fails closed (returns ok:false) when the schema contract is absent', async () => {
    const sqlite = new DatabaseSync(':memory:');
    applyMigrationsBeforePendingPhotoSchema(sqlite);
    const db = wrapSqliteAsD1(sqlite);

    const result = await insertPendingPhotoRecord(db, {
      submittedBy: 'member@example.com',
      quarantineKey: 'member-photos/quarantine/2026/08/deadbeef.jpg',
      consentConfirmed: true,
    });

    expect(result.ok).toBe(false);
    sqlite.close();
  });
});
