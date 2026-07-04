type PhotoItem = {
  id: number;
  url: string;
  description?: string;
  title?: string;
};

type EligiblePhoto = {
  id: number;
  url: string;
  is_memorabilia: number;
  is_matchup_eligible: number;
  description?: string;
  title?: string;
};

export const MATCHUP_EXCLUDED_ELIGIBILITY = -1;

/** Atlas curation model — see Backblaze_B2.md § B2 inventory vs club-use curation */
export const MATCHUP_ELIGIBILITY = {
  UNREVIEWED: 0,
  APPROVED: 1,
  EXCLUDED: -1,
} as const;

type MatchupRow = {
  id: number;
  week_start: string;
  photo_a_id: number;
  photo_b_id: number;
  status: string;
};

function isUsablePhoto(item: any): item is PhotoItem {
  return !!item && typeof item.id === "number" && typeof item.url === "string" && item.url.trim().length > 0;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function computeWeekStart(db: any): Promise<string | null> {
  const wsRow = await db.prepare("SELECT date('now','weekday 1','-7 days') AS week_start;").first();
  return wsRow?.week_start ? String(wsRow.week_start) : null;
}

async function readPhotoById(request: Request, id: number): Promise<PhotoItem | null> {
  const endpoint = new URL(`/api/photos/get?id=${id}`, request.url);
  const resp = await fetch(endpoint.toString(), { method: "GET" });
  if (!resp.ok) return null;
  const json = await resp.json().catch(() => null);
  const item = json?.item;
  return isUsablePhoto(item) ? item : null;
}

async function resolveMatchupPhotos(request: Request, photoAId: number, photoBId: number): Promise<PhotoItem[]> {
  const a = await readPhotoById(request, photoAId);
  const b = await readPhotoById(request, photoBId);
  return [a, b].filter(isUsablePhoto);
}

async function getRecentMatchupPhotoIds(db: any, limit = 8): Promise<Set<number>> {
  const rows = await db
    .prepare(
      "SELECT photo_a_id, photo_b_id FROM weekly_matchups ORDER BY week_start DESC LIMIT ?;",
    )
    .bind(limit)
    .all();

  const ids = new Set<number>();
  for (const row of rows?.results ?? []) {
    ids.add(Number(row.photo_a_id));
    ids.add(Number(row.photo_b_id));
  }
  return ids;
}

async function fetchEligiblePhotos(db: any): Promise<EligiblePhoto[]> {
  // Interim: allow 0 (unreviewed) until admin curation marks club photos as 1.
  // Target: MATCHUP_ELIGIBILITY.APPROVED only — see docs/reference/platform/Backblaze_B2.md
  const rows = await db
    .prepare(
      "SELECT id, url, is_memorabilia, is_matchup_eligible, description, title FROM photos WHERE url IS NOT NULL AND TRIM(url) != '' AND is_matchup_eligible >= 0;",
    )
    .all();

  return (rows?.results ?? []).filter(
    (row: any) =>
      row &&
      Number(row.id) > 0 &&
      typeof row.url === "string" &&
      row.url.trim().length > 0 &&
      Number(row.is_matchup_eligible) >= 0,
  );
}

async function isPhotoMatchupEligible(db: any, photoId: number): Promise<boolean> {
  const row = await db.prepare("SELECT is_matchup_eligible FROM photos WHERE id = ? LIMIT 1;").bind(photoId).first();
  if (!row) return false;
  return Number(row.is_matchup_eligible) >= 0;
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function pickTwoDistinctIds(photos: EligiblePhoto[], excludeIds: Set<number>): [number, number] | null {
  const candidates = photos.filter((photo) => !excludeIds.has(Number(photo.id)));
  if (candidates.length < 2) return null;

  const shuffled = shuffleInPlace([...candidates]);
  const first = Number(shuffled[0].id);
  const second = Number(shuffled[1].id);
  if (first === second) return null;
  return [first, second];
}

export function selectTwoPhotoIds(photos: EligiblePhoto[], recentIds: Set<number>): [number, number] | null {
  const nonMemorabilia = photos.filter((photo) => Number(photo.is_memorabilia) === 0);

  const attempts: Array<[EligiblePhoto[], Set<number>]> = [
    [nonMemorabilia, recentIds],
    [nonMemorabilia, new Set<number>()],
    [photos, recentIds],
    [photos, new Set<number>()],
  ];

  for (const [pool, excludeIds] of attempts) {
    const picked = pickTwoDistinctIds(pool, excludeIds);
    if (picked) return picked;
  }

  return null;
}

async function findActiveCurrentWeekMatchup(db: any, weekStart: string): Promise<MatchupRow | null> {
  const row = await db
    .prepare(
      "SELECT id, week_start, photo_a_id, photo_b_id, status FROM weekly_matchups WHERE week_start = ? AND status = 'active' LIMIT 1;",
    )
    .bind(weekStart)
    .first();

  if (!row) return null;
  return {
    id: Number(row.id),
    week_start: String(row.week_start),
    photo_a_id: Number(row.photo_a_id),
    photo_b_id: Number(row.photo_b_id),
    status: String(row.status),
  };
}

async function findCurrentWeekMatchup(db: any, weekStart: string): Promise<MatchupRow | null> {
  const row = await db
    .prepare(
      "SELECT id, week_start, photo_a_id, photo_b_id, status FROM weekly_matchups WHERE week_start = ? LIMIT 1;",
    )
    .bind(weekStart)
    .first();

  if (!row) return null;
  return {
    id: Number(row.id),
    week_start: String(row.week_start),
    photo_a_id: Number(row.photo_a_id),
    photo_b_id: Number(row.photo_b_id),
    status: String(row.status),
  };
}

async function closeStaleActiveMatchups(db: any, weekStart: string): Promise<void> {
  await db
    .prepare("UPDATE weekly_matchups SET status='closed' WHERE status='active' AND week_start != ?;")
    .bind(weekStart)
    .run();
}

async function upsertCurrentWeekMatchup(
  db: any,
  weekStart: string,
  photoAId: number,
  photoBId: number,
): Promise<number> {
  const existing = await findCurrentWeekMatchup(db, weekStart);
  if (existing) {
    await db
      .prepare(
        "UPDATE weekly_matchups SET photo_a_id = ?, photo_b_id = ?, status = 'active' WHERE id = ?;",
      )
      .bind(photoAId, photoBId, existing.id)
      .run();
    return existing.id;
  }

  try {
    const out = await db
      .prepare(
        "INSERT INTO weekly_matchups (week_start, photo_a_id, photo_b_id, status) VALUES (?, ?, ?, 'active');",
      )
      .bind(weekStart, photoAId, photoBId)
      .run();
    return Number(out?.meta?.last_row_id || 0);
  } catch (err: any) {
    const message = String(err?.message || err);
    if (!message.includes("UNIQUE")) throw err;

    const raced = await findCurrentWeekMatchup(db, weekStart);
    if (!raced) throw err;
    return raced.id;
  }
}

async function buildSuccessResponse(
  request: Request,
  weekStart: string,
  matchupId: number,
  photoAId: number,
  photoBId: number,
): Promise<Response> {
  const items = await resolveMatchupPhotos(request, photoAId, photoBId);
  if (items.length < 2) {
    return jsonResponse({ ok: true, week_start: weekStart, matchup_id: null, items: [] });
  }

  return jsonResponse({
    ok: true,
    week_start: weekStart,
    matchup_id: matchupId,
    items: items.slice(0, 2),
  });
}

export const onRequestGet = async (context: any): Promise<Response> => {
  const { env, request } = context;

  try {
    const weekStart = await computeWeekStart(env.DB);
    if (!weekStart) {
      return jsonResponse({ ok: true, week_start: null, matchup_id: null, items: [] });
    }

    const activeCurrentWeek = await findActiveCurrentWeekMatchup(env.DB, weekStart);
    if (activeCurrentWeek) {
      const photoAEligible = await isPhotoMatchupEligible(env.DB, activeCurrentWeek.photo_a_id);
      const photoBEligible = await isPhotoMatchupEligible(env.DB, activeCurrentWeek.photo_b_id);
      const items = await resolveMatchupPhotos(
        request,
        activeCurrentWeek.photo_a_id,
        activeCurrentWeek.photo_b_id,
      );
      if (items.length >= 2 && photoAEligible && photoBEligible) {
        return jsonResponse({
          ok: true,
          week_start: weekStart,
          matchup_id: activeCurrentWeek.id,
          items: items.slice(0, 2),
        });
      }
    }

    await closeStaleActiveMatchups(env.DB, weekStart);

    const eligiblePhotos = await fetchEligiblePhotos(env.DB);
    const recentIds = await getRecentMatchupPhotoIds(env.DB);
    const selected = selectTwoPhotoIds(eligiblePhotos, recentIds);

    if (!selected) {
      return jsonResponse({ ok: true, week_start: weekStart, matchup_id: null, items: [] });
    }

    const [photoAId, photoBId] = selected;
    const matchupId = await upsertCurrentWeekMatchup(env.DB, weekStart, photoAId, photoBId);

    const resolved = await findCurrentWeekMatchup(env.DB, weekStart);
    if (!resolved) {
      return jsonResponse({ ok: true, week_start: weekStart, matchup_id: null, items: [] });
    }

    return buildSuccessResponse(request, weekStart, matchupId || resolved.id, resolved.photo_a_id, resolved.photo_b_id);
  } catch (err: any) {
    return jsonResponse({ ok: false, error: String(err?.message ?? err) }, 500);
  }
};
