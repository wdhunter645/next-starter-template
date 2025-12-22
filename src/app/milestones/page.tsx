import React from "react";

export default function Page() {
  return (
    <main style={{...styles.main}}>
      <h1 style={{...styles.h1}}>Milestones</h1>
      <p style={{...styles.lead}}>Lou Gehrig’s story is bigger than a stat line. This page highlights major moments across his life, career, and legacy — baseball achievements, personal milestones, and the lasting impact of his name.</p>
      <p style={{...styles.p}}>Over time, we’ll expand this into:</p>
      <p style={{...styles.p}}>If you spot an error or have a source we should add, contact us.</p>
      <ul style={{...styles.ul}}>
        <li style={{...styles.li}}>A chronological timeline</li>
        <li style={{...styles.li}}>Cross‑links to photos and library entries</li>
        <li style={{...styles.li}}>Key quotes and primary sources</li>
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
