import React from "react";

export default function Page() {
  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>Weekly Matchup</h1>

      <p style={{ ...styles.lead }}>
        Weekly Matchup is a simple, repeatable feature: we pick two photos (or moments), and the community votes.
        It’s a fun way to keep the archive moving while we build richer browsing and tagging.
      </p>

      <p style={{ ...styles.p }}>
        LGFC‑Lite starts with a lightweight version so we can keep the site stable. The voting mechanics and results
        display will expand later as we harden the content pipeline.
      </p>

      <p style={{ ...styles.p }}>For now: enjoy the featured matchup and check back each week.</p>
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
