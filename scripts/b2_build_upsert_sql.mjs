#!/usr/bin/env node
/**
 * Converts object listing JSON to D1 upsert SQL for the photos table.
 *
 * - photo_id is derived from the object key (stable, deterministic).
 * - url is built from PUBLIC_B2_BASE_URL + "/" + key (no double slashes).
 * - Metadata is stored in D1 (source of truth). B2 object metadata is NOT modified by this script.
 *
 * Optional metadata overlay:
 *   If data/photos_metadata.json exists (same shape as photos_metadata.example.json),
 *   matching items (by photo_id) will be used to populate metadata columns.
 *
 * Usage: node scripts/b2_build_upsert_sql.mjs /path/to/objects.json
 */
import fs from "node:fs";
import path from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("Usage: b2_build_upsert_sql.mjs <objects.json>");
  process.exit(2);
}

const baseUrlRaw = process.env.PUBLIC_B2_BASE_URL;
if (!baseUrlRaw) {
  console.error("Missing PUBLIC_B2_BASE_URL");
  process.exit(2);
}
const baseUrl = baseUrlRaw.replace(/\/+$/, "");

const data = JSON.parse(fs.readFileSync(file, "utf8"));
const keys = data.keys || [];

function esc(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/'/g, "''");
}

function derivePhotoId(key) {
  // Stable ID: use key as primary identifier (safer than hashing without deps).
  // If you later rename keys in B2, you will get new photo_ids; avoid renames.
  return key;
}

function buildUrl(key) {
  return `${baseUrl}/${key.replace(/^\/+/, "")}`;
}

function toInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function nullableText(v) {
  return v === null || v === undefined || v === "" ? "NULL" : `'${esc(v)}'`;
}

function nullableInt(v) {
  return v === null || v === undefined || v === "" ? "NULL" : `${toInt(v, 0)}`;
}

// Load optional overlay metadata map
const overlayPath = path.join(process.cwd(), "data", "photos_metadata.json");
let overlay = new Map();
if (fs.existsSync(overlayPath)) {
  try {
    const o = JSON.parse(fs.readFileSync(overlayPath, "utf8"));
    const items = Array.isArray(o?.items) ? o.items : [];
    for (const it of items) {
      if (it?.photo_id) overlay.set(it.photo_id, it);
    }
  } catch (e) {
    console.error(`Failed to parse ${overlayPath}:`, e?.message ?? e);
    process.exit(2);
  }
}

const lines = [];
lines.push("BEGIN TRANSACTION;");
lines.push("CREATE UNIQUE INDEX IF NOT EXISTS idx_photos_photo_id ON photos(photo_id);");

for (const obj of keys) {
  const key = obj.key;
  if (!key) continue;

  const photo_id = derivePhotoId(key);
  const url = buildUrl(key);

  // Default heuristic: mark memorabilia based on path naming (can be overridden by overlay).
  let is_memorabilia = /memorabilia/i.test(key) ? 1 : 0;

  const meta = overlay.get(photo_id);
  const title = meta?.title ?? null;
  const year = meta?.year ?? null;
  const era = meta?.era ?? null;
  const type = meta?.type ?? null;
  const game_context = meta?.game_context ?? null;
  const location = meta?.location ?? null;
  const people = meta?.people ?? null;
  const teams = meta?.teams ?? null;
  const tags = meta?.tags ?? null;
  const source = meta?.source ?? null;
  const rights_notes = meta?.rights_notes ?? null;
  const is_featured = meta?.is_featured ?? 0;
  const is_matchup_eligible = meta?.is_matchup_eligible ?? 0;
  const description = meta?.description ?? null;
  if (meta?.is_memorabilia !== undefined) is_memorabilia = meta.is_memorabilia ? 1 : 0;

  lines.push(
    `INSERT INTO photos (photo_id, url, is_memorabilia, description, title, year, era, type, game_context, location, people, teams, tags, source, rights_notes, is_featured, is_matchup_eligible)` +
    ` VALUES (` +
    `'${esc(photo_id)}','${esc(url)}',${toInt(is_memorabilia,0)},${nullableText(description)},${nullableText(title)},${nullableInt(year)},${nullableText(era)},${nullableText(type)},${nullableText(game_context)},${nullableText(location)},${nullableText(people)},${nullableText(teams)},${nullableText(tags)},${nullableText(source)},${nullableText(rights_notes)},${toInt(is_featured,0)},${toInt(is_matchup_eligible,0)}` +
    `)` +
    ` ON CONFLICT(photo_id) DO UPDATE SET ` +
    `url=excluded.url, is_memorabilia=excluded.is_memorabilia, description=COALESCE(excluded.description, photos.description), ` +
    `title=COALESCE(excluded.title, photos.title), year=COALESCE(excluded.year, photos.year), era=COALESCE(excluded.era, photos.era), ` +
    `type=COALESCE(excluded.type, photos.type), game_context=COALESCE(excluded.game_context, photos.game_context), location=COALESCE(excluded.location, photos.location), ` +
    `people=COALESCE(excluded.people, photos.people), teams=COALESCE(excluded.teams, photos.teams), tags=COALESCE(excluded.tags, photos.tags), ` +
    `source=COALESCE(excluded.source, photos.source), rights_notes=COALESCE(excluded.rights_notes, photos.rights_notes), ` +
    `is_featured=CASE WHEN excluded.is_featured IS NULL THEN photos.is_featured ELSE excluded.is_featured END, ` +
    `is_matchup_eligible=CASE WHEN excluded.is_matchup_eligible IS NULL THEN photos.is_matchup_eligible ELSE excluded.is_matchup_eligible END;`
  );
}

lines.push("COMMIT;");
process.stdout.write(lines.join("\n") + "\n");
