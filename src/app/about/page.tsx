import React from "react";

export default function Page() {
  return (
    <main style={{...styles.main}}>
      <h1 style={{...styles.h1}}>About the Lou Gehrig Fan Club</h1>
      <p style={{...styles.lead}}>Lou Gehrig wasn’t just an all‑time great ballplayer — he was a symbol of quiet strength, consistency, and character. The Lou Gehrig Fan Club exists to keep his story alive and to build a positive community around it.</p>
      <p style={{...styles.p}}>This site is the club’s public home: a place to learn, share, submit fan content, browse photos and memorabilia, and follow club updates as we grow.</p>
      <p style={{...styles.p}}>We’re also committed to the mission Lou’s name is forever tied to: raising awareness and support for ALS charities. The club is organized as a legacy project — meant to last for decades, not weeks.</p>
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
