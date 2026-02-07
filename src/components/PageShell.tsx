'use client';

import React from 'react';
import styles from './PageShell.module.css';

type PageShellProps = {
  /** Required page title (H1). */
  title: string;
  /** Optional subtitle/lede under the H1. */
  subtitle?: string;
  /** Optional actions rendered on the right of the title row (desktop). */
  actions?: React.ReactNode;
  /** Main page content. */
  children: React.ReactNode;
  /** Optional extra className on the outer wrapper. */
  className?: string;
};

/**
 * Desktop-first page wrapper.
 * - Centers content within the global .container max-width.
 * - Standardizes H1/subtitle placement, spacing rhythm, and action-row alignment.
 * - Keeps page logic out; this is structure only.
 */
export default function PageShell({ title, subtitle, actions, children, className }: PageShellProps) {
  return (
    <main className={[styles.shell, className].filter(Boolean).join(' ')}>
      <div className="container">
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>

          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </main>
  );
}
