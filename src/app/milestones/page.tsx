import React from "react";

export default function Page() {
  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>Milestones</h1>

      <p style={{ ...styles.lead }}>
        Lou Gehrig’s story spans baseball greatness, a historic farewell, and the modern ALS awareness movement. This is a draft
        timeline we’ll keep tightening as sources and media are linked in.
      </p>

      <h2 style={{ ...styles.h2 }}>Draft timeline</h2>
      <ul style={{ ...styles.ul }}>
        <li style={{ ...styles.li }}>
          <strong>1903</strong> — Born in New York City (June 19).
        </li>
        <li style={{ ...styles.li }}>
          <strong>1923</strong> — Debuts with the New York Yankees.
        </li>
        <li style={{ ...styles.li }}>
          <strong>1925–1939</strong> — Iron Man streak era; plays 2,130 consecutive games.
        </li>
        <li style={{ ...styles.li }}>
          <strong>1939</strong> — Diagnosed with ALS; delivers the “Luckiest Man” speech at Yankee Stadium (July 4).
        </li>
        <li style={{ ...styles.li }}>
          <strong>1941</strong> — Dies from ALS (June 2). His name becomes widely associated with the disease.
        </li>
        <li style={{ ...styles.li }}>
          <strong>20th century</strong> — Gehrig’s legacy grows as a symbol of dignity, sportsmanship, and perseverance.
        </li>
        <li style={{ ...styles.li }}>
          <strong>2021–present</strong> — MLB’s annual Lou Gehrig Day expands ALS awareness and fundraising.
        </li>
      </ul>

      <hr style={{ ...styles.hr }} />

      <p style={{ ...styles.p }}>
        Over time, we’ll expand this into a fully cross‑linked timeline (photos, quotes, primary sources, and club notes). If you
        spot an error or have a source we should add, contact us.
      </p>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 900, margin: "0 auto" },
  h1: { fontSize: 34, lineHeight: 1.15, margin: "0 0 12px 0" },
  h2: { fontSize: 22, lineHeight: 1.25, margin: "22px 0 10px 0" },
  lead: { fontSize: 18, lineHeight: 1.6, margin: "0 0 18px 0" },
  p: { fontSize: 16, lineHeight: 1.7, margin: "0 0 14px 0" },
  ul: { paddingLeft: 18, margin: "0 0 14px 0" },
  li: { margin: "0 0 8px 0", lineHeight: 1.6 },
  hr: { margin: "26px 0", opacity: 0.25 },
};
