type NormalizePhotoUrlInput = {
  rawUrl: unknown;
  request: Request;
  publicB2BaseUrl?: unknown;
};

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

export function normalizePhotoUrl({ rawUrl, request, publicB2BaseUrl }: NormalizePhotoUrlInput): string {
  if (typeof rawUrl !== "string") return "";
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  const normalizedBase =
    typeof publicB2BaseUrl === "string" && publicB2BaseUrl.trim().length > 0 ? publicB2BaseUrl.trim() : "";

  // 🔴 CRITICAL FIX — handle broken B2 URLs already stored in DB
  const match = trimmed.match(/^https:\/\/s3\.([^./]+)\.backblazeb2\.com\/(.+)$/);
  if (match) {
    const region = match[1];
    const rest = match[2];
    const bucket = "LouGehrigFanClub";

    if (!rest.startsWith(`${bucket}/`) && !rest.startsWith(`${bucket}%2F`)) {
      return `https://s3.${region}.backblazeb2.com/${bucket}/${rest.replace(/^\/+/, "")}`;
    }

    return encodeURI(trimmed);
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return encodeURI(trimmed);
  }

  if (trimmed.startsWith("//")) {
    const protocol = new URL(request.url).protocol || "https:";
    return encodeURI(`${protocol}${trimmed}`);
  }

  if (trimmed.startsWith("/")) {
    return new URL(trimmed, request.url).toString();
  }

  if (normalizedBase) {
    return new URL(trimmed.replace(/^\/+/, ""), ensureTrailingSlash(normalizedBase)).toString();
  }

  return new URL(`/${trimmed.replace(/^\/+/, "")}`, request.url).toString();
}
