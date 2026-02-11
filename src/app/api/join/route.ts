import { NextResponse } from "next/server";

/**
 * Dev/Next proxy for Cloudflare Pages Function: /api/join
 * - Production on Pages uses functions/api/join.ts
 * - In dev (and any Next-handled environment), we forward to same-origin /api/join
 *   preserving the raw body + content-type.
 * - We also set redirect:"manual" so a trailing-slash redirect doesn't turn into a browser 308 loop.
 */
export async function POST(req: Request) {
  const bodyText = await req.text();
  const contentType = req.headers.get("content-type") ?? "application/json";

  const res = await fetch(`${new URL(req.url).origin}/api/join`, {
    method: "POST",
    headers: { "content-type": contentType },
    body: bodyText,
    redirect: "manual",
  });

  const outText = await res.text();

  return new NextResponse(outText, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });
}
