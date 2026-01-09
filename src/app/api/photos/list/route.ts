import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

type InvItem = {
  key: string;
  size?: number;
  last_modified?: string | null;
  etag?: string | null;
  url?: string | null;
  type?: string;
  source?: string;
  era?: string;
  example?: boolean;
};

function readInventory(): { objects: InvItem[] } {
  const repoRoot = process.cwd();
  const p = path.join(repoRoot, "data", "b2", "inventory_enriched.json");
  const pFallback = path.join(repoRoot, "data", "b2", "inventory.json");

  const filePath = fs.existsSync(p) ? p : pFallback;
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  const objects: InvItem[] = Array.isArray(data?.objects) ? data.objects : [];
  return { objects };
}

function ensureUrl(item: InvItem): string | null {
  if (item.url) return item.url;

  const base = process.env.PUBLIC_B2_BASE_URL || "";
  if (!base) return null;

  const normalized = base.endsWith("/") ? base : `${base}/`;
  const key = item.key || "";
  return `${normalized}${encodeURIComponent(key)}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(200, Number(url.searchParams.get("limit") || 24)));
  const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
  const memorabilia = url.searchParams.get("memorabilia") === "1";

  let { objects } = readInventory();

  if (memorabilia) {
    objects = objects.filter((o) => (o.type || "").toLowerCase() === "memorabilia");
  } else {
    // Default: photos (exclude memorabilia when typed)
    objects = objects.filter((o) => {
      const t = (o.type || "").toLowerCase();
      return t !== "memorabilia";
    });
  }

  const page = objects.slice(offset, offset + limit).map((o, idx) => {
    const id = offset + idx + 1;
    return {
      id,
      url: ensureUrl(o),
      is_memorabilia: (o.type || "").toLowerCase() === "memorabilia" ? 1 : 0,
      description: o.key || null,
      created_at: o.last_modified || null,
      example: Boolean(o.example),
      key: o.key,
      source: o.source || null,
      era: o.era || null,
    };
  });

  return NextResponse.json({
    ok: true,
    items: page,
    total: objects.length,
    offset,
    limit,
    note:
      objects.some((o) => o.example) && objects.length === 1
        ? "Inventory contains example placeholder only. Run scripts/b2_inventory_report.sh then scripts/b2_enrich_inventory.sh in CI to populate real items."
        : undefined,
  });
}
