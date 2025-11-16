'use client';

import { useEffect } from 'react';
import styles from './social-wall.module.css';

export default function SocialWall() {
  useEffect(() => {
    const scriptId = 'elfsight-platform-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://static.elfsight.com/platform/platform.js';
    script.defer = true;
    script.setAttribute('data-use-service-core', '');
    document.body.appendChild(script);
  }, []);

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
    </section>
  );
}
