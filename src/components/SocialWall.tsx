'use client';

import { useEffect, useState } from 'react';
import styles from './social-wall.module.css';

const PLATFORM_JS = 'https://elfsightcdn.com/platform.js';
const ELFSIGHT_WIDGET_CLASS = 'elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8';

function nudgeResize() {
  try {
    window.dispatchEvent(new Event('resize'));
  } catch {
    // no-op
  }
}

function scheduleResizeSequence(timers: number[]) {
  nudgeResize();
  for (const ms of [500, 1500, 3000]) {
    timers.push(window.setTimeout(nudgeResize, ms));
  }
}

export default function SocialWall() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;
    const timers: number[] = [];

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PLATFORM_JS}"]`);

    if (existing) {
      scheduleResizeSequence(timers);
      return () => {
        cancelled = true;
        timers.forEach((t) => window.clearTimeout(t));
      };
    }

    const script = document.createElement('script');
    script.src = PLATFORM_JS;
    script.async = true;
    script.onload = () => {
      if (cancelled) return;
      scheduleResizeSequence(timers);
    };
    document.body.appendChild(script);

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [mounted]);

  return (
    <section id="social-wall" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Social Wall</h2>
        <p className={styles.subtitle}>Live fan posts from Facebook.</p>

        <div className={styles.embed}>
          <p className={styles.fallback}>Loading social wall content...</p>
          {mounted ? (
            <div
              key={`elfsight-${mounted ? 'ready' : 'idle'}`}
              className={ELFSIGHT_WIDGET_CLASS}
              data-elfsight-app-lazy
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
