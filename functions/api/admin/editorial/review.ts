// POST /api/admin/editorial/review
// Approves or rejects submission_queue rows. Approved submissions become draft content_inventory records.

import { requireAdmin } from "../../../_lib/auth";
import { jsonResponse, requireD1, requireTables } from "../../../_lib/d1";

type ReviewBody = {
  submission_id?: unknown;
  action?: unknown;
  tag?: unknown;
  source_name?: unknown;
  source_url?: unknown;
  credit_line?: unknown;
  story_type?: unknown;
  allowed_sections?: unknown;
  priority?: unknown;
  canonical?: unknown;
  media?: unknown;
  event_date?: unknown;
  rotation_group?: unknown;
  feature_weight?: unknown;
  review_notes?: unknown;
  reviewer?: unknown;
};

const STORY_TYPES = new Set(["primary", "secondary", "brief"]);

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asInt(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function slugifyTag(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function jsonText(value: unknown, fallback: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return JSON.stringify(fallback);
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch {
      return JSON.stringify(fallback);
    }
  }
  if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
    return JSON.stringify(value);
  }
  return JSON.stringify(fallback);
}

export const onRequestPost = async (context: any): Promise<Response> => {
  const { request, env } = context;

  const deny = requireAdmin(request, env);
  if (deny) return deny;

  const d1 = requireD1(env);
  if (!d1.ok) return jsonResponse(d1.body, d1.status);

  const tables = await requireTables(d1.db, ["submission_queue", "content_inventory"]);
  if (!tables.ok) return jsonResponse(tables.body, tables.status);

  try {
    const body = (await request.json().catch(() => null)) as ReviewBody | null;
    const submissionId = asInt(body?.submission_id, 0);
    const action = asString(body?.action);

    if (!submissionId || !["approve", "reject"].includes(action)) {
      return jsonResponse({ ok: false, error: "submission_id and action are required." }, 400);
    }

    const submission = await d1.db
      .prepare(
        `SELECT submission_id, submitted_by, title, description, source_url, proposed_tag, media_url, status
           FROM submission_queue
          WHERE submission_id = ?`,
      )
      .bind(submissionId)
      .first();

    if (!submission) {
      return jsonResponse({ ok: false, error: "Submission not found." }, 404);
    }

    if ((submission as any).status !== "pending") {
      return jsonResponse({ ok: false, error: "Submission has already been reviewed." }, 409);
    }

    const nowRow = await d1.db.prepare("SELECT datetime('now') AS now").first();
    const now = String((nowRow as any)?.now || new Date().toISOString());
    const reviewNotes = asString(body?.review_notes) || null;
    const reviewer = asString(body?.reviewer) || "admin-ui";

    if (action === "reject") {
      await d1.db
        .prepare(
          `UPDATE submission_queue
              SET status = 'rejected_manual', review_notes = ?, updated_at = ?, reviewed_at = ?, reviewer = ?
            WHERE submission_id = ?`,
        )
        .bind(reviewNotes, now, now, reviewer, submissionId)
        .run();

      return jsonResponse({ ok: true, action: "reject", submission_id: submissionId }, 200);
    }

    const title = String((submission as any).title || "").trim();
    const text = String((submission as any).description || "").trim();
    const tag = slugifyTag(asString(body?.tag) || String((submission as any).proposed_tag || "") || title);
    const storyType = STORY_TYPES.has(asString(body?.story_type)) ? asString(body?.story_type) : "brief";
    const sourceUrl = asString(body?.source_url) || String((submission as any).source_url || "").trim() || null;
    const sourceName = asString(body?.source_name) || "Member submission";
    const creditLine = asString(body?.credit_line) || String((submission as any).submitted_by || "").trim();
    const allowedSections = jsonText(body?.allowed_sections, ["library"]);
    const media = jsonText(body?.media, (submission as any).media_url ? [{ url: (submission as any).media_url }] : []);
    const priority = asInt(body?.priority, 0);
    const canonical = body?.canonical === false || body?.canonical === 0 ? 0 : 1;
    const eventDate = asString(body?.event_date) || null;
    const rotationGroup = asString(body?.rotation_group) || null;
    const featureWeight = Math.max(1, asInt(body?.feature_weight, 1));
    const searchText = [title, text, tag, sourceName, creditLine].filter(Boolean).join(" ");

    if (!title || !text || !tag || !creditLine) {
      return jsonResponse({ ok: false, error: "Approved records require title, text, tag, and credit_line." }, 400);
    }

    const insert = await d1.db
      .prepare(
        `INSERT INTO content_inventory
          (tag, title, text, media, story_type, allowed_sections, priority, search_text, canonical,
           source_name, source_url, credit_line, event_date, rotation_group, feature_weight,
           status, review_notes, submitted_by, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)`,
      )
      .bind(
        tag,
        title,
        text,
        media,
        storyType,
        allowedSections,
        priority,
        searchText,
        canonical,
        sourceName,
        sourceUrl,
        creditLine,
        eventDate,
        rotationGroup,
        featureWeight,
        reviewNotes,
        (submission as any).submitted_by || null,
        now,
      )
      .run();

    await d1.db
      .prepare(
        `UPDATE submission_queue
            SET status = 'approved', review_notes = ?, updated_at = ?, reviewed_at = ?, reviewer = ?
          WHERE submission_id = ?`,
      )
      .bind(reviewNotes, now, now, reviewer, submissionId)
      .run();

    const inventoryId = (insert as any)?.meta?.last_row_id ?? (insert as any)?.meta?.lastRowId ?? null;

    return jsonResponse(
      { ok: true, action: "approve", submission_id: submissionId, inventory_id: inventoryId },
      200,
    );
  } catch (err: any) {
    const message = String(err?.message || err);
    if (message.toLowerCase().includes("unique")) {
      return jsonResponse({ ok: false, error: "A canonical content record already exists for that tag." }, 409);
    }
    console.error("admin editorial review error:", err);
    return jsonResponse({ ok: false, error: "Editorial review failed." }, 500);
  }
};
