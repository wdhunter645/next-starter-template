'use client';

import { useEffect, useState } from 'react';
import {
  getSocialFallbackPlatforms,
  SOCIAL_FALLBACK_HEADLINE,
  SOCIAL_WALL_WIDGET_ID,
} from '@/lib/socialFallbacks';
import styles from './social-wall.module.css';

const PLATFORM_SRC = 'https://elfsightcdn.com/platform.js';

declare global {
  interface Window {
    elfsight?: {
      reload?: () => void;
    };
  }
}

export default function SocialWall() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const fallbackPlatforms = getSocialFallbackPlatforms();

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${PLATFORM_SRC}"]`,
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
    } else if (window.elfsight) {
      init();
    } else {
      existingScript.addEventListener('load', init, { once: true });
      existingScript.addEventListener('error', fail, { once: true });
    }

    timeoutId = setTimeout(fail, 8000);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const showFallback = status === 'error';

  return (
    <section id="social-wall" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Social Wall</h2>
        <p className={styles.subtitle}>Live fan posts from Facebook, Instagram, X, and Pinterest when available.</p>
        <div className={styles.embed}>
          {status === 'loading' ? (
            <p className={styles.fallback}>Loading social wall content...</p>
          ) : null}
          {showFallback ? (
            <div className={styles.fallbackPanel} role="status" aria-live="polite">
              <p className={styles.fallback}>{SOCIAL_FALLBACK_HEADLINE}</p>
              <ul className={styles.fallbackList}>
                {fallbackPlatforms.map((platform) => (
                  <li key={platform.id}>
                    <a href={platform.href} target="_blank" rel="noopener noreferrer">
                      Visit Lou Gehrig Fan Club on {platform.label}
                    </a>
                    <span className={styles.fallbackNote}>{platform.reliabilityNote}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className={SOCIAL_WALL_WIDGET_ID} data-elfsight-app-lazy />
        </div>
      </div>
    </section>
  );
}
