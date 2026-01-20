import React from "react";

export default function Page() {
  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>Milestones</h1>

      <p style={{ ...styles.lead }}>
        Lou Gehrig&rsquo;s story spans baseball greatness, a historic farewell, and the modern ALS awareness movement. This timeline captures key moments from his life, career, and enduring legacy.
      </p>

      <h2 style={{ ...styles.h2 }}>Life and Career Timeline</h2>
      <ul style={{ ...styles.ul }}>
        <li style={{ ...styles.li }}>
          <strong>June 19, 1903</strong> — Henry Louis &ldquo;Lou&rdquo; Gehrig born in New York City to German immigrant parents.
        </li>
        <li style={{ ...styles.li }}>
          <strong>Early 1920s</strong> — Attends Columbia University before joining professional baseball.
        </li>
        <li style={{ ...styles.li }}>
          <strong>1923</strong> — Debuts with the New York Yankees, beginning a 17-year career with the team.
        </li>
        <li style={{ ...styles.li }}>
          <strong>1925</strong> — Begins his legendary consecutive games streak, earning the nickname &ldquo;The Iron Horse.&rdquo;
        </li>
        <li style={{ ...styles.li }}>
          <strong>1927–1936</strong> — Peak years: contributes to multiple World Series championships (6 total), wins 2 American League MVP awards, and becomes a 7-time All-Star.
        </li>
        <li style={{ ...styles.li }}>
          <strong>1939 (early)</strong> — Experiences rapid physical decline; voluntarily removes himself from Yankees lineup on May 2 after 2,130 consecutive games.
        </li>
        <li style={{ ...styles.li }}>
          <strong>July 4, 1939</strong> — Delivers his famous &ldquo;Luckiest Man&rdquo; farewell speech at Yankee Stadium during Lou Gehrig Appreciation Day.
        </li>
        <li style={{ ...styles.li }}>
          <strong>June 2, 1941</strong> — Dies from ALS at age 37. His name becomes widely associated with the disease.
        </li>
      </ul>

      <h2 style={{ ...styles.h2 }}>Posthumous Legacy</h2>
      <ul style={{ ...styles.ul }}>
        <li style={{ ...styles.li }}>
          <strong>1941</strong> — Yankees retire his uniform number 4; inducted into Baseball Hall of Fame via special election.
        </li>
        <li style={{ ...styles.li }}>
          <strong>1942</strong> — <em>The Pride of the Yankees</em> film starring Gary Cooper introduces Gehrig&rsquo;s story to a national audience.
        </li>
        <li style={{ ...styles.li }}>
          <strong>1995</strong> — Cal Ripken Jr. breaks Gehrig&rsquo;s consecutive games record, bringing renewed attention to his legacy.
        </li>
        <li style={{ ...styles.li }}>
          <strong>2014</strong> — Ice Bucket Challenge raises over $115 million globally for ALS research, with Gehrig&rsquo;s legacy central to the campaign.
        </li>
        <li style={{ ...styles.li }}>
          <strong>June 2, 2021</strong> — Major League Baseball establishes Lou Gehrig Day as an annual observance to honor his legacy and support ALS awareness.
        </li>
        <li style={{ ...styles.li }}>
          <strong>Present day</strong> — Lou Gehrig remains one of baseball&rsquo;s most revered figures and a central symbol in the fight against ALS.
        </li>
      </ul>

      <hr style={{ ...styles.hr }} />

      <p style={{ ...styles.p }}>
        Over time, we&rsquo;ll expand this into a fully cross‑linked timeline with photos, quotes, primary sources, and club notes. If you spot an error or have a source we should add, contact us at <strong>admin@lougehrigfanclub.com</strong>.
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
