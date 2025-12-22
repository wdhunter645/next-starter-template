import React from "react";

export default function Page() {
  return (
    <main style={{...styles.main}}>
      <h1 style={{...styles.h1}}>Terms & Conditions</h1>
      <p style={{...styles.lead}}>By using this site, you agree to the following:</p>
      <p style={{...styles.p}}>1) Respectful use</p>
      <p style={{...styles.p}}>This is a legacy community site. Harassment, hate, and abusive behavior are not welcome.</p>
      <p style={{...styles.p}}>2) User submissions</p>
      <p style={{...styles.p}}>If you submit content (text or media), you confirm you have the right to share it and you grant the site permission to display and use it on the Lou Gehrig Fan Club website and related club communications.</p>
      <p style={{...styles.p}}>3) Copyright / trademark</p>
      <p style={{...styles.p}}>If we receive a credible infringement notice, we will remove content while we review it. If you believe something here infringes your rights, contact: Admin@LouGehrigFanClub.com</p>
      <p style={{...styles.p}}>4) No guarantees</p>
      <p style={{...styles.p}}>Content is provided as-is. We aim for accuracy but errors can happen; please report corrections.</p>
      <p style={{...styles.p}}>5) Charitable intent</p>
      <p style={{...styles.p}}>The club is operated with a zero-profit intent. Any proceeds, if they ever occur, are intended solely for ALS charitable support.</p>
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
