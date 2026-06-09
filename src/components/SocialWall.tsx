'use client';

import { useEffect, useState } from 'react';
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
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${PLATFORM_SRC}"]`
    );

    const init = () => {
      if (cancelled) return;
      if (timeoutId) clearTimeout(timeoutId);
      window.elfsight?.reload?.();
      setStatus('ready');
    };

    const fail = () => {
      if (cancelled) return;
      if (timeoutId) clearTimeout(timeoutId);
      setStatus('error');
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = PLATFORM_SRC;
      script.async = true;
      script.onload = init;
      script.onerror = fail;
      document.body.appendChild(script);
    } else {
      if (window.elfsight) {
        init();
      } else {
        existingScript.addEventListener('load', init, { once: true });
        existingScript.addEventListener('error', fail, { once: true });
      }
    }

    timeoutId = setTimeout(fail, 8000);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section id="social-wall" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Social Wall</h2>
        <div className={styles.embed}>
          {status === 'loading' ? (
            <p className={styles.fallback}>Loading social wall content...</p>
          ) : null}
          {status === 'error' ? (
            <p className={styles.fallback}>
              Social wall is temporarily unavailable. Please check back soon.
            </p>
          ) : null}
          <div className={WIDGET_ID} data-elfsight-app-lazy />
        </div>
      </div>
    </section>
  );
}
