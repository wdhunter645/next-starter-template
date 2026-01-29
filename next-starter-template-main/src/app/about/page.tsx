import React from "react";
import { fetchPageContent } from "@/lib/pageContent";

export default async function Page() {
  const data = await fetchPageContent("/about");
  const sections = data?.sections;

  const title = sections?.title?.content ?? "About the Lou Gehrig Fan Club";
  const leadHtml = sections?.lead_html?.content ?? null;
  const bodyHtml = sections?.body_html?.content ?? null;

  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>{title}</h1>

      {leadHtml ? (
        <p style={{ ...styles.lead }} dangerouslySetInnerHTML={{ __html: leadHtml }} />
      ) : (
        <p style={{ ...styles.lead }}>
          Henry Louis &ldquo;Lou&rdquo; Gehrig (1903–1941) was one of baseball&rsquo;s greatest players and a symbol of courage in the face of adversity. His legacy extends far beyond the diamond, embodying dignity, perseverance, and the ongoing fight against ALS.
        </p>
      )}

      {bodyHtml ? (
        <div style={{ ...styles.body }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      ) : (
        <>
          <h2 style={{ ...styles.h2 }}>Early Life and Baseball Career</h2>
          <p style={{ ...styles.p }}>
            Born June 19, 1903, in New York City to German immigrant parents, Lou Gehrig attended Columbia University before joining Major League Baseball. He played his entire 17-year career with the New York Yankees (1923–1939), earning the nickname <strong>&ldquo;The Iron Horse&rdquo;</strong> for playing in 2,130 consecutive games—a record that stood until 1995.
          </p>
          <p style={{ ...styles.p }}>
            Gehrig&rsquo;s career achievements include a .340 batting average, 493 home runs, and 1,995 runs batted in. He was a 7-time All-Star, 2-time American League MVP, and 6-time World Series champion, cementing his place among baseball&rsquo;s all-time greats.
          </p>

          <h2 style={{ ...styles.h2 }}>ALS Diagnosis and Legacy</h2>
          <p style={{ ...styles.p }}>
            In 1939, Gehrig experienced a rapid physical decline. On May 2, 1939, he voluntarily removed himself from the Yankees lineup. He was soon diagnosed with amyotrophic lateral sclerosis (ALS).
          </p>
          <p style={{ ...styles.p }}>
            On July 4, 1939, during Lou Gehrig Appreciation Day at Yankee Stadium, he delivered his famous farewell address, expressing gratitude rather than resentment. He died on June 2, 1941, at age 37. His name became synonymous with ALS, now commonly known as &ldquo;Lou Gehrig&rsquo;s disease.&rdquo;
          </p>

          <h2 style={{ ...styles.h2 }}>Lou Gehrig Day and ALS Awareness</h2>
          <p style={{ ...styles.p }}>
            In 2021, Major League Baseball established <strong>Lou Gehrig Day</strong>, observed annually on June 2, to honor his legacy and expand ALS awareness and fundraising. Today, Lou Gehrig remains one of baseball&rsquo;s most revered figures and a central symbol in the fight against ALS.
          </p>
          <p style={{ ...styles.p }}>
            The 2014 Ice Bucket Challenge raised over $115 million globally for ALS research, demonstrating the enduring impact of Gehrig&rsquo;s legacy on public health advocacy.
          </p>

          <h2 style={{ ...styles.h2 }}>About This Fan Club</h2>
          <p style={{ ...styles.p }}>
            This site is a fan-run home for Lou Gehrig&rsquo;s legacy: baseball history, ALS awareness, and a growing archive of stories and media curated by the community. We&rsquo;re building a photo and memorabilia archive, a milestones timeline, news and Q&amp;A updates, and a lightweight membership system to keep fans informed as features roll out.
          </p>

          <h2 style={{ ...styles.h2 }}>How you can help</h2>
          <p style={{ ...styles.p }}>
            If you have photos, memorabilia, clippings, or personal stories connected to Lou Gehrig or the broader ALS awareness effort, you can contribute through the Library and Photo Archive sections. We&rsquo;ll keep improving structure and attribution over time.
          </p>

          <h2 style={{ ...styles.h2 }}>Contact</h2>
          <p style={{ ...styles.p }}>
            The simplest way to reach the club is email: <strong>admin@lougehrigfanclub.com</strong>.
          </p>
        </>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 900, margin: "0 auto" },
  h1: { fontSize: 34, lineHeight: 1.15, margin: "0 0 12px 0" },
  h2: { fontSize: 22, lineHeight: 1.25, margin: "22px 0 10px 0" },
  lead: { fontSize: 18, lineHeight: 1.6, margin: "0 0 18px 0" },
  body: { fontSize: 16, lineHeight: 1.7 },
  p: { fontSize: 16, lineHeight: 1.7, margin: "0 0 14px 0" },
  ul: { paddingLeft: 18, margin: "0 0 14px 0" },
  li: { margin: "0 0 8px 0", lineHeight: 1.6 },
};
