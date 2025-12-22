import React from "react";

export default function Page() {
  return (
    <main style={{...styles.main}}>
      <h1 style={{...styles.h1}}>Charities</h1>
      <p style={{...styles.lead}}>ALS changed history when Lou Gehrig stood at home plate on July 4, 1939 and delivered one of the most famous speeches in sports. Today, ALS remains a disease that demands research, support, and compassion.</p>
      <p style={{...styles.p}}>The Lou Gehrig Fan Club highlights ALS charities and encourages members to donate directly whenever possible. If the club ever generates proceeds in the future, the intent is that those proceeds exist solely to support ALS‑related charitable giving — not private profit.</p>
      <p style={{...styles.p}}>On this page you’ll find:</p>
      <ul style={{...styles.ul}}>
        <li style={{...styles.li}}>A short list of ALS organizations we recommend starting with</li>
        <li style={{...styles.li}}>Occasional featured fundraisers and events</li>
        <li style={{...styles.li}}>Simple guidance on how to donate and verify charities</li>
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
