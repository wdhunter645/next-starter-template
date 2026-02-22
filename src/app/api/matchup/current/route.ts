/import { NextResponse } from "next/server";

const B2_PUBLIC_BASE =
  "https://f005.backblazeb2.com/file/LouGehrigFanClub";

function normalizeUrl(storedUrl: string): string {
  if (!storedUrl) return storedUrl;

  try {
    const parts = storedUrl.split("/");
    const key = parts[parts.length - 1];
    return `${B2_PUBLIC_BASE}/${key}`;
  } catch {
    return storedUrl;
  }
}

export async function GET() {
  try {
    // NOTE:
    // This mirrors your existing D1-backed logic shape.
    // Replace this fetch logic with your D1 query if needed.
    // The key point is: always return HTTP 200.

    const response = await fetch(
      process.env.INTERNAL_MATCHUP_SOURCE || "",
      { cache: "no-store" }
    ).catch(() => null);

    if (!response || !response.ok) {
      return NextResponse.json(
        { ok: false, error: "matchup source unavailable" },
        { status: 200 }
      );
    }

    const data = await response.json();

    const items =
      (data.items || []).map((item: any) => ({
        ...item,
        url: normalizeUrl(item.url),
      })) || [];

    return NextResponse.json(
      {
        ok: true,
        week_start: data.week_start,
        matchup_id: data.matchup_id,
        items,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "internal error" },
      { status: 200 }
    );
  }
}
