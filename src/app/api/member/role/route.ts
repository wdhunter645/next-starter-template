import { NextResponse } from "next/server";

// Mark as dynamic to skip static generation (these routes are for dev only)
export const dynamic = "force-dynamic";

function getUpstreamBase(): string {
  // Used during `next dev` so API calls still reach the deployed Cloudflare Pages Functions.
  // In production (Cloudflare Pages build), these Next.js API routes may not be used.
  return (
    process.env.PAGES_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://next-starter-template-6yr.pages.dev"
  ).replace(/\/$/, "");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
    }

    const res = await fetch(`${getUpstreamBase()}/api/member/role?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const text = await res.text();
    let data: unknown = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { ok: false, error: text || "Upstream returned non-JSON response." };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("API /api/member/role error:", err);
    return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 });
  }
}
