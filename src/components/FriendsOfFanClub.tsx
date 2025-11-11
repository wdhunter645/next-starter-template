'use client';
import styles from './FriendsOfFanClub.module.css';

export default function FriendsOfFanClub() {
  const sponsors = [
    { id: 1, name: 'Sponsor 1', logo: '🏆' },
    { id: 2, name: 'Sponsor 2', logo: '⚾' },
    { id: 3, name: 'Sponsor 3', logo: '🎯' },
    { id: 4, name: 'Sponsor 4', logo: '⭐' },
  ];

  return (
    <section className={styles.friends} aria-labelledby="friends-title">
      <h2 id="friends-title" className={styles.title}>Friends of the Fan Club</h2>
      <div className={styles.grid}>
        {sponsors.map((sponsor) => (
          <div key={sponsor.id} className={styles.card}>
            <div className={styles.logo}>{sponsor.logo}</div>
            <p className={styles.label}>{sponsor.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
