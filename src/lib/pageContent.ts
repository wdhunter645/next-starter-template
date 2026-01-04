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

    const data = (await res.json()) as unknown;
    if (!data || typeof data !== "object") return null;
    const obj = data as Record<string, unknown>;
    if (obj.ok !== true || typeof obj.slug !== "string" || !obj.sections || typeof obj.sections !== "object") return null;

    return obj as PageContentResponse;
  } catch {
    return null;
  }
}
