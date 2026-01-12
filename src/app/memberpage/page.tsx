import React from "react";

// Note: This page exists at /memberpage to meet the requirement for a /memberpage route.
// There's also a /member page with identical content. Both routes are intentionally maintained.
export default function MemberPage() {
  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>Member Area</h1>

      <p style={{ ...styles.lead }}>
        Member features are under active development. For now, the public site content and the Join mailing list are the
        priority so we can publish reliably before adding more moving parts.
      </p>

      <p style={{ ...styles.p }}>Planned member experience:</p>
      <ul style={{ ...styles.ul }}>
        <li style={{ ...styles.li }}>A welcome landing page after login with recent activity and upcoming events.</li>
        <li style={{ ...styles.li }}>Member posts and discussions (with simple moderation and reporting).</li>
        <li style={{ ...styles.li }}>A personal profile page (screen name, email management, contribution history).</li>
        <li style={{ ...styles.li }}>Media submissions with tagging to improve search over time.</li>
      </ul>

      <hr style={{ ...styles.hr }} />

      <p style={{ ...styles.p }}>
        If you&apos;re here early: thank you. Join the mailing list so you&apos;ll get a note when member access opens.
      </p>
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
