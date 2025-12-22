import React from "react";

export default function Page() {
  return (
    <main style={{...styles.main}}>
      <h1 style={{...styles.h1}}>News & Q&A</h1>
      <p style={{...styles.lead}}>News & Q&A is where the club posts updates, answers common questions, and shares announcements.</p>
      <p style={{...styles.p}}>Expect content like:</p>
      <p style={{...styles.p}}>This page will evolve as the community grows.</p>
      <ul style={{...styles.ul}}>
        <li style={{...styles.li}}>Site updates and new features</li>
        <li style={{...styles.li}}>“Lou Gehrig Today” — short historical notes</li>
        <li style={{...styles.li}}>Charity spotlights</li>
        <li style={{...styles.li}}>Community Q&A and clarifications</li>
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
