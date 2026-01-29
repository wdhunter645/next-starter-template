'use client';

import React, { useEffect } from "react";

// FanClub auth gate (LGFC-Lite): redirect unauthenticated users to public home.
function requireFanclubAuth(): string | null {
  if (typeof window === 'undefined') return null;
  const email = window.localStorage.getItem('lgfc_member_email');
  return email && email.trim() ? email.trim() : null;
}


const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 1000, margin: "0 auto" },
  h1: { fontSize: 34, lineHeight: 1.15, margin: "0 0 12px 0" },
  p: { fontSize: 16, lineHeight: 1.7, margin: "0 0 14px 0" },
};

export default function PhotoPage() {

  useEffect(() => {
    const email = requireFanclubAuth();
    if (!email) {
      window.location.href = '/';
    }
  }, []);
  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>Photo</h1>
      <p style={{ ...styles.p }}>
        This page will be populated from the D1 database later. Photo archive content will be integrated here.
      </p>
    </main>
  );
}