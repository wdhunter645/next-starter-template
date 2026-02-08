import { NextResponse } from "next/server";

/**
 * Dev/Next proxy for Cloudflare Pages Function: /api/join
 * - In production on Pages, the Function handles this route.
 * - Locally (or if Next ever handles /api/join), we forward the request
 *   to the same-origin /api/join endpoint (Cloudflare) preserving the body.
 */
export async function POST(req: Request) {
  const bodyText = await req.text();

  // Forward to same-origin Cloudflare Pages Function endpoint.
  // IMPORTANT: preserve headers (content-type) so JSON parsing works.
  const contentType = req.headers.get("content-type") ?? "application/json";

  const res = await fetch(`${new URL(req.url).origin}/api/join`, {
    method: "POST",
    headers: {
      "content-type": contentType,
    },
    body: bodyText,
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
