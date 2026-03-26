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
