function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  // RFC4180-ish: quote if contains comma, quote, newline
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.map(csvEscape).join(",");
  const body = rows
    .map((r) => columns.map((c) => csvEscape((r as any)[c])).join(","))
    .join("\n");
  return header + (body ? "\n" + body : "\n");
}
