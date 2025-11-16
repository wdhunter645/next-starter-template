'use client';

import Script from 'next/script';
import styles from './social-wall.module.css';

export default function SocialWall() {
  return (
    <section id="social-wall" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Social Wall</h2>
        <p className={styles.sectionSubtitle}>
          Live fan posts from Facebook, Instagram, X, and Pinterest.
        </p>

        <div className={styles.embed}>
          <div
            className="elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8"
            data-elfsight-app-lazy
          />
          <p className={styles.fallback}>Loading social wall content…</p>
        </div>
      </div>

      <Script
        src="https://apps.elfsight.com/p/platform.js"
        strategy="lazyOnload"
      />
    </section>
  );
}
