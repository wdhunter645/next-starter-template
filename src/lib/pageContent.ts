export type PageContentSection = {
  content: string | null;
  asset_url?: string | null;
  updated_at?: string | null;
};

export type PageContentSections = Record<string, PageContentSection>;

export type PageContentResponse = {
  ok: boolean;
  slug: string;
  sections: PageContentSections;
};

type UnknownRecord = Record<string, unknown>;

function isUnknownRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}

function isPageContentResponse(v: unknown): v is PageContentResponse {
  if (!isUnknownRecord(v)) return false;

  if (v.ok !== true) return false;
  if (typeof v.slug !== "string") return false;
  if (!isUnknownRecord(v.sections)) return false;

  // sections is a map of sectionName -> { content, asset_url?, updated_at? }
  for (const section of Object.values(v.sections)) {
    if (!isUnknownRecord(section)) return false;
    if (!(section.content === null || typeof section.content === "string")) return false;

    const assetUrl = section.asset_url;
    if (!(assetUrl === undefined || assetUrl === null || typeof assetUrl === "string")) return false;

    const updatedAt = section.updated_at;
    if (!(updatedAt === undefined || updatedAt === null || typeof updatedAt === "string")) return false;
  }

  return true;
}

function buildContentUrl(slug: string): string {
  const qs = new URLSearchParams({ slug });
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  return base ? `${base}/api/content/get?${qs.toString()}` : `/api/content/get?${qs.toString()}`;
}

/**
 * Fetches live page content blocks from D1 via the existing Pages Function endpoint.
 * - Never throws (returns null on failure).
 * - Uses no-store caching so updates are visible immediately.
 */
export async function fetchPageContent(slug: string): Promise<PageContentResponse | null> {
  try {
    const res = await fetch(buildContentUrl(slug), { cache: "no-store" });
    if (!res.ok) return null;

    const data: unknown = await res.json();
    if (!isPageContentResponse(data)) return null;
    return data;
  } catch {
    return null;
  }
}
