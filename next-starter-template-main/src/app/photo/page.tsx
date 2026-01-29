'use client';

import React from "react";

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 1000, margin: "0 auto" },
  h1: { fontSize: 34, lineHeight: 1.15, margin: "0 0 12px 0" },
  p: { fontSize: 16, lineHeight: 1.7, margin: "0 0 14px 0" },
};

export default function PhotoPage() {
  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>Photo</h1>
      <p style={{ ...styles.p }}>
        This page will be populated from the D1 database later. Photo archive content will be integrated here.
      </p>
    </main>
  );
}
