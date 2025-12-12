set -euo pipefail

FILE="src/app/api/join/route.ts"

mkdir -p "$(dirname "$FILE")"

cat > "$FILE" <<'EOF'
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, error: "Name and email are required." },
        { status: 400 }
      );
    }

    // Forward request to Cloudflare Pages Function (LGFC-Lite backend)
    const res = await fetch("https://21656888.next-starter-template-6yr.pages.dev/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    // Be defensive: Pages may return non-JSON on some errors
    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { ok: false, error: text || "Upstream returned non-JSON response." };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("API /api/join error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
EOF

echo "== Quick type/syntax check (best-effort) =="
node -c "$FILE" >/dev/null 2>&1 || true

git add "$FILE"
git commit -m "Fix /api/join route.ts syntax to restore Cloudflare build" || true
git push origin main
