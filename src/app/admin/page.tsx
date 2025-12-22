import React from "react";

export default function Page() {
  return (
    <main style={{...styles.main}}>
      <h1 style={{...styles.h1}}>Admin</h1>
      <p style={{...styles.lead}}>This is a placeholder page in LGFC‑Lite.</p>
      <p style={{...styles.p}}>Administrative moderation and advanced tools are intentionally deferred until the public site is stable. For now, operational monitoring is handled through:</p>
      <p style={{...styles.p}}>If you’re an admin and need help, use the Contact page.</p>
      <ul style={{...styles.ul}}>
        <li style={{...styles.li}}>D1 tables (join_requests, library_entries, photos, join_email_log)</li>
        <li style={{...styles.li}}>Cloudflare Pages logs and deploy history</li>
      </ul>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 900, margin: "0 auto" },
  h1: { fontSize: 34, lineHeight: 1.15, margin: "0 0 12px 0" },
  lead: { fontSize: 18, lineHeight: 1.6, margin: "0 0 18px 0" },
  p: { fontSize: 16, lineHeight: 1.7, margin: "0 0 14px 0" },
  ul: { paddingLeft: 18, margin: "0 0 14px 0" },
  li: { margin: "0 0 8px 0", lineHeight: 1.6 },
  hr: { margin: "26px 0", opacity: 0.25 },
};
