'use client';

import { useEffect, useState } from 'react';
import {
  getSocialFallbackPlatforms,
  hasRenderedSocialWidget,
  SOCIAL_FALLBACK_HEADLINE,
  SOCIAL_WALL_WIDGET_ID,
} from '@/lib/socialFallbacks';
import styles from './social-wall.module.css';

const PLATFORM_SRC = 'https://elfsightcdn.com/platform.js';
const LOAD_TIMEOUT_MS = 8000;
const RENDER_CHECK_DELAY_MS = 3000;

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
    let renderCheckId: ReturnType<typeof setTimeout> | null = null;

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${PLATFORM_SRC}"]`,
    );

    const markError = () => {
      if (cancelled) return;
      if (timeoutId) clearTimeout(timeoutId);
      if (renderCheckId) clearTimeout(renderCheckId);
      setStatus('error');
    };

    const verifyWidgetRendered = () => {
      if (cancelled) return;
      if (!hasRenderedSocialWidget()) {
        markError();
      }
    };

    const init = () => {
      if (cancelled) return;
      if (timeoutId) clearTimeout(timeoutId);
      window.elfsight?.reload?.();
      setStatus('ready');
      renderCheckId = setTimeout(verifyWidgetRendered, RENDER_CHECK_DELAY_MS);
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = PLATFORM_SRC;
      script.async = true;
      script.onload = init;
      script.onerror = markError;
      document.body.appendChild(script);
    } else if (window.elfsight) {
      init();
    } else {
      existingScript.addEventListener('load', init, { once: true });
      existingScript.addEventListener('error', markError, { once: true });
    }

    timeoutId = setTimeout(markError, LOAD_TIMEOUT_MS);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (renderCheckId) clearTimeout(renderCheckId);
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
            <p className={styles.fallback} aria-live="polite">
              Loading social wall content...
            </p>
          ) : null}
          {showFallback ? (
            <div className={styles.fallbackPanel} role="region" aria-labelledby="social-wall-fallback-heading">
              <p id="social-wall-fallback-heading" className={styles.fallback}>
                {SOCIAL_FALLBACK_HEADLINE}
              </p>
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
