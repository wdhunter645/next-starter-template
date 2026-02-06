import React from 'react';

type Props = {
  children: React.ReactNode;
  maxWidth?: number;
  padding?: string;
};

/**
 * Standard page wrapper for non-home routes.
 * - Header + Footer are provided by RootLayout.
 * - This wrapper standardizes main padding + max width.
 */
export default function PageShell({
  children,
  maxWidth = 900,
  padding = '40px 16px',
}: Props) {
  return (
    <main className="container" style={{ padding, maxWidth, margin: '0 auto' }}>
      {children}
    </main>
  );
}
