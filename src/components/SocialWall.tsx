'use client';

import { useEffect } from 'react';
import styles from './social-wall.module.css';

const PLATFORM_SRC = 'https://elfsightcdn.com/platform.js';
const WIDGET_ID = 'elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8';

declare global {
  interface Window {
    elfsight?: {
      reload?: () => void;
    };
  }
}

export default function SocialWall() {
  useEffect(() => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${PLATFORM_SRC}"]`
    );

    const init = () => {
      window.elfsight?.reload?.();
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = PLATFORM_SRC;
      script.async = true;
      script.onload = init;
      document.body.appendChild(script);
    } else {
      init();
    }
  }, []);

  return (
    <section id="social-wall" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Social Wall</h2>
        <p className={styles.subtitle}>Live fan posts from Facebook.</p>
        <div className={styles.embed}>
          <p className={styles.fallback}>Loading social wall content...</p>
          <div className={WIDGET_ID} data-elfsight-app-lazy />
        </div>
      </div>
    </section>
  );
}
