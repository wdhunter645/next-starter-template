import React from "react";

export default function Page() {
  return (
    <main style={{...styles.main}}>
      <h1 style={{...styles.h1}}>Privacy</h1>
      <p style={{...styles.lead}}>This site collects only the information needed to operate basic features.</p>
      <p style={{...styles.p}}>What we may collect:</p>
      <p style={{...styles.p}}>How we use it:</p>
      <p style={{...styles.p}}>We do not sell personal information.</p>
      <p style={{...styles.p}}>To request removal of your email or a submission, contact: Admin@LouGehrigFanClub.com</p>
      <ul style={{...styles.ul}}>
        <li style={{...styles.li}}>Join form: name + email address</li>
        <li style={{...styles.li}}>Library submissions: name (or display name), content you submit, timestamps</li>
        <li style={{...styles.li}}>Basic technical logs for reliability and security</li>
        <li style={{...styles.li}}>To send mailing list updates (if you join)</li>
        <li style={{...styles.li}}>To publish approved fan submissions</li>
        <li style={{...styles.li}}>To operate and protect the website</li>
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
