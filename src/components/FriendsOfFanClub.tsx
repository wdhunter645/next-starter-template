'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import styles from './FriendsOfFanClub.module.css';

type Friend = {
  id: number;
  name: string;
  kind: string;
  url?: string | null;
  blurb?: string | null;
  photo_url?: string | null;
};

const DEFAULT_FRIENDS: Friend[] = [
  {
    id: -1,
    name: 'Live Like Lou Foundation',
    kind: 'Partner',
    url: 'https://www.livelikelou.org',
    blurb: 'Supporting ALS awareness and impact through community action.',
    photo_url: null,
  },
  {
    id: -2,
    name: 'ALS Cure Project',
    kind: 'Partner',
    url: 'https://www.ALSCure.org',
    blurb: 'Accelerating ALS research and funding the path to a cure.',
    photo_url: null,
  },
  {
    id: -3,
    name: 'They Played In Color',
    kind: 'Partner',
    url: 'https://www.theyplayedincolor.com/',
    blurb: 'Preserving and sharing baseball history with depth and accuracy.',
    photo_url: null,
  },
];

export default function FriendsOfFanClub() {
  const [items, setItems] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    let completed = false;

    const timer = setTimeout(() => {
      if (alive && !completed) {
        setLoading(false);
        setItems(DEFAULT_FRIENDS);
      }
    }, 10000); // 10 second timeout

    (async () => {
      try {
        const data = await apiGet<{ ok: boolean; items: Friend[] }>(`/api/friends/list`);
        if (!alive) return;

        const list = Array.isArray(data.items) && data.items.length > 0 ? data.items : DEFAULT_FRIENDS;
        setItems(list);
      } catch {
        if (alive) setItems(DEFAULT_FRIENDS);
      } finally {
        if (alive) {
          setLoading(false);
          completed = true;
        }
      }
    })();

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className={styles.friends}>
      <h2 className="section-title">Friends of the Fan Club</h2>

      {loading ? (
        <p className="sub">Loading friends…</p>
      ) : (
        <div className={styles.grid}>
          {items.map((f) => (
            <article key={f.id} className={styles.card}>
              <div className={`${styles.media} ${f.photo_url ? '' : styles.mediaBare}`}>
                {f.photo_url ? (
                  <img className={styles.logoImg} src={f.photo_url} alt={f.name} />
                ) : (
                  <span aria-hidden="true">Partner</span>
                )}
              </div>

              <div className={styles.cardBody}>
                <p className={styles.kind}>{f.kind}</p>
                <h3 className={styles.name}>{f.name}</h3>
                <p className={styles.blurb}>{f.blurb || `Learn more about our ${f.kind.toLowerCase()} community.`}</p>
              </div>

              <div className={styles.cta}>
                {f.url ? (
                  <a
                    className={styles.ctaLink}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                  >
                    Visit {f.name}
                  </a>
                ) : (
                  <span className={styles.ctaMuted}>Link coming soon</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
