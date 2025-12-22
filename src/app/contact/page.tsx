import React from "react";

export default function Page() {
  return (
    <main style={{...styles.main}}>
      <h1 style={{...styles.h1}}>Contact</h1>
      <p style={{...styles.lead}}>Contact the Lou Gehrig Fan Club team for:</p>
      <p style={{...styles.p}}>Email: Admin@LouGehrigFanClub.com</p>
      <p style={{...styles.p}}>Mailing Address:</p>
      <p style={{...styles.p}}>Lou Gehrig Fan Club</p>
      <p style={{...styles.p}}>P.O. Box 145</p>
      <p style={{...styles.p}}>Glastonbury, CT 06033</p>
      <p style={{...styles.p}}>We try to respond quickly, but please allow a little time — we’re building this as a long‑term community project.</p>
      <ul style={{...styles.ul}}>
        <li style={{...styles.li}}>General questions about the site</li>
        <li style={{...styles.li}}>Content corrections (errors, attribution, updates)</li>
        <li style={{...styles.li}}>Copyright or trademark concerns</li>
        <li style={{...styles.li}}>Reporting inappropriate user submissions</li>
        <li style={{...styles.li}}>Partnership / charity coordination</li>
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
