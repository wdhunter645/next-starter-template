import React from "react";

export default function Page() {
  return (
    <main style={{...styles.main}}>
      <h1 style={{...styles.h1}}>Calendar</h1>
      <p style={{...styles.lead}}>This calendar tracks upcoming club‑related items and ALS/community events we think members may want to follow.</p>
      <p style={{...styles.p}}>Over time, this page will include:</p>
      <p style={{...styles.p}}>For now, consider this the home base for “what’s next.”</p>
      <ul style={{...styles.ul}}>
        <li style={{...styles.li}}>Fan Club meetups (in‑person and virtual)</li>
        <li style={{...styles.li}}>Museum/Cooperstown‑adjacent trips and baseball history events</li>
        <li style={{...styles.li}}>ALS awareness and fundraising events</li>
        <li style={{...styles.li}}>Posting schedules (club “day in review” and major content drops)</li>
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
