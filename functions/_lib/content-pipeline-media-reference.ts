// Media asset reference validation and admin serialization (#2286 / #2319).
// Reference strings/keys only — no binary ingest, upload, transform, or public serving.

import { CANDIDATE_ID_PATTERN, CANDIDATE_ID_VALIDATION_MESSAGE } from './content-pipeline-candidate-constants';

export const CONTENT_PIPELINE_MEDIA_REFERENCE_MAX_LENGTH = 512;

const UNSAFE_URI_SCHEME = /^(https?:|javascript:|data:|file:|ftp:)/i;
const CONTROL_CHARACTERS = /[\x00-\x1f\x7f]/;
const SAFE_REFERENCE_BODY = /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/;

export type ContentPipelineMediaReferenceValidation =
  | { ok: true; value: string }
  | { ok: false; error: string };

export type AdminMediaReferenceUpdate = {
  candidate_id: string;
  media_asset_id?: string | null;
  uploaded_media_reference?: string | null;
};

export type AdminMediaReferenceFields = {
  media_asset_id: string | null;
  uploaded_media_reference: string | null;
};

export type ParseAdminMediaReferenceUpdateResult =
  | { ok: true; request: AdminMediaReferenceUpdate }
  | { ok: false; error: string };

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateContentPipelineMediaReference(
  value: unknown,
  fieldLabel: string,
): ContentPipelineMediaReferenceValidation {
  const raw = asTrimmedString(value);
  if (!raw) {
    return { ok: false, error: `${fieldLabel} must be a non-empty string.` };
  }
  if (raw.length > CONTENT_PIPELINE_MEDIA_REFERENCE_MAX_LENGTH) {
    return { ok: false, error: `${fieldLabel} exceeds maximum length.` };
  }
  if (UNSAFE_URI_SCHEME.test(raw) || raw.includes('..') || CONTROL_CHARACTERS.test(raw)) {
    return { ok: false, error: `${fieldLabel} contains an unsafe value.` };
  }

  if (raw.startsWith('b2://')) {
    const objectKey = raw.slice('b2://'.length);
    if (!objectKey || !SAFE_REFERENCE_BODY.test(objectKey)) {
      return { ok: false, error: `${fieldLabel} must use a safe b2:// object key.` };
    }
    return { ok: true, value: raw };
  }

  if (raw.startsWith('media_uid:')) {
    const mediaUid = raw.slice('media_uid:'.length);
    if (!mediaUid || !SAFE_REFERENCE_BODY.test(mediaUid)) {
      return { ok: false, error: `${fieldLabel} must use a safe media_uid: identifier.` };
    }
    return { ok: true, value: raw };
  }

  if (!SAFE_REFERENCE_BODY.test(raw)) {
    return { ok: false, error: `${fieldLabel} must be a safe reference identifier.` };
  }

  return { ok: true, value: raw };
}

export function validateOptionalContentPipelineMediaReference(
  value: unknown,
  fieldLabel: string,
): { ok: true; value: string | undefined } | { ok: false; error: string } {
  if (value === undefined || value === null) {
    return { ok: true, value: undefined };
  }
  const trimmed = asTrimmedString(value);
  if (!trimmed) {
    return { ok: true, value: undefined };
  }
  const validated = validateContentPipelineMediaReference(trimmed, fieldLabel);
  if (!validated.ok) {
    return validated;
  }
  return { ok: true, value: validated.value };
}

export function parseAdminMediaReferenceUpdate(
  body: unknown,
): ParseAdminMediaReferenceUpdateResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }

  const record = body as Record<string, unknown>;
  const candidateId = asTrimmedString(record.candidate_id);
  if (!candidateId || !CANDIDATE_ID_PATTERN.test(candidateId)) {
    return { ok: false, error: CANDIDATE_ID_VALIDATION_MESSAGE };
  }

  const hasMediaAssetId = Object.prototype.hasOwnProperty.call(record, 'media_asset_id');
  const hasUploadedReference = Object.prototype.hasOwnProperty.call(record, 'uploaded_media_reference');
  if (!hasMediaAssetId && !hasUploadedReference) {
    return { ok: false, error: 'At least one of media_asset_id or uploaded_media_reference must be provided.' };
  }

  const request: AdminMediaReferenceUpdate = { candidate_id: candidateId };

  if (hasMediaAssetId) {
    if (record.media_asset_id === null) {
      request.media_asset_id = null;
    } else {
      const validated = validateOptionalContentPipelineMediaReference(record.media_asset_id, 'media_asset_id');
      if (!validated.ok) {
        return validated;
      }
      if (validated.value === undefined) {
        return { ok: false, error: 'media_asset_id must be a non-empty string or null.' };
      }
      request.media_asset_id = validated.value;
    }
  }

  if (hasUploadedReference) {
    if (record.uploaded_media_reference === null) {
      request.uploaded_media_reference = null;
    } else {
      const validated = validateOptionalContentPipelineMediaReference(
        record.uploaded_media_reference,
        'uploaded_media_reference',
      );
      if (!validated.ok) {
        return validated;
      }
      if (validated.value === undefined) {
        return { ok: false, error: 'uploaded_media_reference must be a non-empty string or null.' };
      }
      request.uploaded_media_reference = validated.value;
    }
  }

  return { ok: true, request };
}

export function buildAdminMediaReferenceFields(input: {
  media_asset_id?: string | null;
  uploaded_media_reference?: string | null;
}): AdminMediaReferenceFields {
  return {
    media_asset_id: input.media_asset_id ?? null,
    uploaded_media_reference: input.uploaded_media_reference ?? null,
  };
}

export function serializeAdminMediaReferences(
  candidate: Record<string, unknown>,
  memberSubmissionReference?: string | null,
): AdminMediaReferenceFields {
  const mediaAssetId =
    typeof candidate.media_asset_id === 'string' && candidate.media_asset_id.trim()
      ? candidate.media_asset_id.trim()
      : null;

  const uploadedReference =
    typeof memberSubmissionReference === 'string' && memberSubmissionReference.trim()
      ? memberSubmissionReference.trim()
      : null;

  return buildAdminMediaReferenceFields({
    media_asset_id: mediaAssetId,
    uploaded_media_reference: uploadedReference,
  });
}

export function serializeCandidateForAdminReview(
  candidate: Record<string, unknown>,
  mediaReferences?: AdminMediaReferenceFields,
) {
  const { tags, ...rest } = candidate;
  return {
    ...rest,
    tags: tags ?? { people: [], topics: [], places: [] },
    media_references: mediaReferences ?? serializeAdminMediaReferences(candidate),
  };
}
