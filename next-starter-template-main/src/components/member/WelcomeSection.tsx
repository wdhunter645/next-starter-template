'use client';

import { useEffect, useState } from 'react';

type EventRow = {
  id: number;
  title: string;
  start_date: string;
  location?: string | null;
};

type WelcomeSectionProps = {
  email: string;
};

export default function WelcomeSection({ email }: WelcomeSectionProps) {
  const [upcomingEvents, setUpcomingEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch events for the next 30 days
    const fetchUpcomingEvents = async () => {
      try {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        // Fetch events for current and next month
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const nextMonth = `${thirtyDaysFromNow.getFullYear()}-${String(thirtyDaysFromNow.getMonth() + 1).padStart(2, '0')}`;

        const [current, next] = await Promise.all([
          fetch(`/api/events/month?month=${encodeURIComponent(currentMonth)}`).then(r => r.json()),
          fetch(`/api/events/month?month=${encodeURIComponent(nextMonth)}`).then(r => r.json()),
        ]);

        const allEvents = [
          ...(current.items || []),
          ...(next.items || []),
        ];

        // Filter events within the next 30 days
        const now = today.getTime();
        const thirtyDaysLater = thirtyDaysFromNow.getTime();

        const filtered = allEvents.filter((event: EventRow) => {
          const eventDate = new Date(event.start_date).getTime();
          return eventDate >= now && eventDate <= thirtyDaysLater;
        });

        // Sort by date
        filtered.sort((a: EventRow, b: EventRow) => {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        });

        setUpcomingEvents(filtered);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setUpcomingEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  // Extract display name from email (use part before @)
  const displayName = email ? email.split('@')[0] : 'Member';

  return (
    <section style={{
      padding: '32px 20px',
      maxWidth: 900,
      margin: '0 auto',
    }}>
      {/* Heading */}
      <h1 style={{
        fontSize: 28,
        margin: 0,
        marginBottom: 8,
      }}>
        Welcome back, {displayName}
      </h1>

      {/* Subtext */}
      <p style={{
        fontSize: 16,
        color: 'rgba(0,0,0,0.7)',
        margin: '0 0 16px 0',
      }}>
        Here&apos;s what&apos;s new around the club in the last 30 days.
      </p>

      {/* Profile link */}
      <a
        href="/fanclub/myprofile"
        style={{
          display: 'inline-block',
          color: 'var(--lgfc-blue)',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 24,
        }}
      >
        View Profile →
      </a>

      {/* Upcoming events summary */}
      <div style={{
        background: 'rgba(0, 51, 204, 0.05)',
        border: '1px solid rgba(0, 51, 204, 0.2)',
        borderRadius: 12,
        padding: 16,
      }}>
        <h3 style={{
          fontSize: 16,
          margin: '0 0 12px 0',
          fontWeight: 700,
        }}>
          Next 30 days:
        </h3>

        {loading ? (
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
            Loading events...
          </p>
        ) : upcomingEvents.length > 0 ? (
          <ul style={{
            margin: 0,
            padding: '0 0 0 20px',
            listStyle: 'disc',
          }}>
            {upcomingEvents.map((event) => (
              <li key={event.id} style={{ marginBottom: 8, fontSize: 14 }}>
                <strong>
                  {new Date(event.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </strong>{' '}
                — {event.title}
                {event.location && (
                  <span style={{ color: 'rgba(0,0,0,0.6)', fontSize: 13 }}>
                    {' '}({event.location})
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
            No upcoming events in the next 30 days. Check the{' '}
            <a href="/calendar" style={{ color: 'var(--lgfc-blue)' }}>
              Calendar
            </a>
            {' '}for more.
          </p>
        )}
      </div>
    </section>
  );
}
