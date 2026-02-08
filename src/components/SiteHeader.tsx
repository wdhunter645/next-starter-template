'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import MemberHeader from './MemberHeader';

/**
 * Route-based header selection ONLY.
 * - /fanclub and /fanclub/** => MemberHeader
 * - everything else (including /admin/**) => Header
 *
 * Do NOT read/write localStorage here. Header-mode flips from storage were
 * causing unexpected “member mode” and breaking navigation after /admin visits.
 */
export default function SiteHeader() {
  const pathname = usePathname() || '/';
  const isFanClub = pathname === '/fanclub' || pathname.startsWith('/fanclub/');

  if (isFanClub) return <MemberHeader showLogo />;

  return <Header showLogo />;
}


FILE: src/app/calendar/page.tsx
import React from "react";
import EventsMonth from "@/components/calendar/EventsMonth";

export default function Page() {
  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>Calendar</h1>

      <p style={{ ...styles.lead }}>
        Upcoming events, commemorations, and club notes. This page is wired to D1 via <code>/api/events/month</code>.
      </p>

      <EventsMonth />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 900, margin: "0 auto" },
  h1: { fontSize: 34, lineHeight: 1.15, margin: "0 0 12px 0" },
  lead: { fontSize: 18, lineHeight: 1.6, margin: "0 0 18px 0" },
};


FILE: src/app/news/page.tsx
import React from "react";
import RecentDiscussions from "@/components/news/RecentDiscussions";

export default function Page() {
  return (
    <main style={{ ...styles.main }}>
      <h1 style={{ ...styles.h1 }}>News &amp; Q&amp;A</h1>

      <p style={{ ...styles.lead }}>
        Latest discussions and Q&amp;A. This page is wired to D1 via <code>/api/discussions/list</code>.
      </p>

      <RecentDiscussions limit={10} />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "40px 16px", maxWidth: 900, margin: "0 auto" },
  h1: { fontSize: 34, lineHeight: 1.15, margin: "0 0 12px 0" },
  lead: { fontSize: 18, lineHeight: 1.6, margin: "0 0 18px 0" },
};
