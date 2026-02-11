import { NextResponse } from "next/server";

type JoinBody = { alias?: string; name?: string; email?: string };

async function readJoinBody(req: Request): Promise<JoinBody> {
  const ct = (req.headers.get('content-type') || '').toLowerCase();
  try {
    if (ct.includes('application/json')) {
      return (await readJoinBody(req)) as JoinBody;
    }
    // Browser <form> posts typically land here
    const fd = await req.formData();
    return {
      alias: String(fd.get('alias') || ''),
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
    };
  } catch {
    return {};
  }
}


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
