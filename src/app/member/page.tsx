'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Photo = { id: number; url: string; description?: string | null; title?: string | null };

type Discussion = { id: number; title: string; body: string; created_at: string };

type EventRow = { id: number; title: string; start_date: string; location?: string | null };

function yyyymm(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function MemberHomePage() {
  const [email, setEmail] = useState<string>('');
  const [banner, setBanner] = useState<Photo | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setEmail(window.localStorage.getItem('lgfc_member_email') || '');
    } catch {
      setEmail('');
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const month = yyyymm(new Date());
        const [p, d, e] = await Promise.all([
          apiGet<{ ok: boolean; items: Photo[] }>(`/api/photos/list?limit=1`),
          apiGet<{ ok: boolean; items: Discussion[] }>(`/api/discussions/list?limit=5`),
          apiGet<{ ok: boolean; month: string; items: EventRow[] }>(`/api/events/month?month=${encodeURIComponent(month)}`),
        ]);
        if (!alive) return;
        setBanner((p.items && p.items[0]) ? p.items[0] : null);
        setDiscussions(d.items || []);
        setEvents(e.items || []);
      } catch {
        if (!alive) return;
        setBanner(null);
        setDiscussions([]);
        setEvents([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <main>
      {/* Member Welcome Hero (banner image from D1 photos table) */}
      <section style={{ position: 'relative' }}>
        <div
          style={{
            height: 260,
            background: banner ? `url(${banner.url}) center/cover no-repeat` : 'linear-gradient(135deg, #0033cc, #001a66)',
          }}
          aria-label="Member hero banner"
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'rgba(0,0,0,0.45)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: 14,
            textAlign: 'center',
            maxWidth: 900,
            margin: '0 16px'
          }}>
            <h1 style={{ margin: 0, fontSize: 22, letterSpacing: 0.5 }}>WELCOME LOU GEHRIG FAN CLUB MEMBERS!</h1>
            {email ? <div style={{ marginTop: 8, opacity: 0.9 }}>Signed in as: <strong>{email}</strong></div> : null}
          </div>
        </div>

        {/* Large overlapping logo treatment */}
        <div style={{
          position: 'absolute',
          left: 16,
          bottom: -44,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 16,
          padding: 10,
          boxShadow: '0 2px 14px rgba(0,0,0,0.10)',
          border: '1px solid rgba(0,0,0,0.12)'
        }}>
          <a href="/member" aria-label="Member home">
            <img src="/IMG_1946.png" alt="LGFC" style={{ height: 78, width: 'auto', display: 'block' }} />
          </a>
        </div>
      </section>

      <section style={{ padding: '72px 16px 40px 16px', maxWidth: 1100, margin: '0 auto' }}>
        {!email ? (
          <div className="card" style={{ padding: 16 }}>
            <p className="sub" style={{ marginTop: 0 }}>
              You’re not signed in yet. Use Login to continue.
            </p>
            <a href="/login" className="link">Go to Login</a>
          </div>
        ) : null}

        <h2 className="section-title" style={{ textAlign: 'center' }}>What’s New</h2>
        <p className="sub" style={{ textAlign: 'center' }}>
          Live connectivity proof: discussions + events + banner photo are fetched from D1.
        </p>

        {loading ? (
          <p className="sub" style={{ textAlign: 'center' }}>Loading…</p>
        ) : (
          <div className="grid" style={{ marginTop: 14 }}>
            <div className="card">
              <strong>Recent Discussions (D1)</strong>
              {discussions.length === 0 ? (
                <p className="sub" style={{ marginTop: 10 }}>No posts yet.</p>
              ) : (
                <ul style={{ margin: '10px 0 0 18px' }}>
                  {discussions.slice(0, 5).map((p) => (
                    <li key={p.id} style={{ marginBottom: 8 }}>
                      <span style={{ fontWeight: 700 }}>{p.title}</span>
                      <div className="sub">{p.created_at}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <strong>This Month’s Events (D1)</strong>
              {events.length === 0 ? (
                <p className="sub" style={{ marginTop: 10 }}>No events yet.</p>
              ) : (
                <ul style={{ margin: '10px 0 0 18px' }}>
                  {events.slice(0, 6).map((e) => (
                    <li key={e.id} style={{ marginBottom: 8 }}>
                      <span style={{ fontWeight: 700 }}>{e.start_date}</span> — {e.title}
                      {e.location ? <div className="sub">{e.location}</div> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <strong>Quick Links</strong>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                <a className="link" href="/member/profile">My Profile</a>
                <a className="link" href="/member/card">Membership Card</a>
                <a className="link" href="/library">Gehrig Library</a>
                <a className="link" href="/photo">Photo</a>
                <a className="link" href="/photos">Photo Gallery</a>
                <a className="link" href="/memorabilia">Memorabilia Archive</a>
              </div>
            </div>
          </div>
        )}

        <section style={{ marginTop: 26, textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>Need help?</h2>
          <a href="mailto:Support@LouGehrigFanClub.com?subject=Support%20Needed%20MEMBER" className="link">Support</a>
        </section>
      </section>
    </main>
  );
}
