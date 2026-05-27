'use client';

import PageShell from '@/components/PageShell';
import EventsMonth from '@/components/calendar/EventsMonth';
import EventsNextTen from '@/components/calendar/EventsNextTen';

export default function EventsPage() {
  return (
    <PageShell title="Upcoming Events" subtitle="Fan Club events and activities">
      <EventsMonth />
      <EventsNextTen />
    </PageShell>
  );
}
