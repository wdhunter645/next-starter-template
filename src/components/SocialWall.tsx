'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import styles from './social-wall.module.css';

const ELFSIGHT_WIDGET_CLASS = 'elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8';

export default function SocialWall() {
  // Elfsight embeds can render partially in SPA/CSR environments if the platform script
  // runs before the widget div exists. Ensure the script loads after hydration, then
  // nudge layout once the widget has had a moment to paint.
  useEffect(() => {
    const timers: number[] = [];
    const nudge = () => {
      try {
        window.dispatchEvent(new Event('resize'));
      } catch {
        // no-op
      }
    };

    timers.push(window.setTimeout(nudge, 750));
    timers.push(window.setTimeout(nudge, 1750));
    timers.push(window.setTimeout(nudge, 3000));

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <section id="social-wall" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Social Wall</h2>

        {/* Elfsight platform loader (official install pattern) */}
        <Script
          src="https://elfsightcdn.com/platform.js"
          strategy="afterInteractive"
          data-use-service-core="true"
        />

        <div className={styles.embed}>
          <div className={ELFSIGHT_WIDGET_CLASS} data-elfsight-app-lazy />
        </div>
      </div>
    </section>
  );
}
