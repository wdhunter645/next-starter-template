import React from "react";

export default function Page() {
  return (
    <main style={{...styles.main}}>
      <h1 style={{...styles.h1}}>Member Area</h1>
      <p style={{...styles.lead}}>Member features are being built in stages. Right now, the public site and mailing list are the priority.</p>
      <p style={{...styles.p}}>Future member experience goals:</p>
      <p style={{...styles.p}}>If you’re here early: thank you. Join the mailing list to stay in the loop.</p>
      <ul style={{...styles.ul}}>
        <li style={{...styles.li}}>A welcome landing page after login</li>
        <li style={{...styles.li}}>Member posts and discussions</li>
        <li style={{...styles.li}}>Personal profile page</li>
        <li style={{...styles.li}}>Media submissions with tagging</li>
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
