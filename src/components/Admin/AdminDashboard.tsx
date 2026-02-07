'use client';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  return (
    <div className={styles.grid}>
      <section className={styles.card}>
        <h2>Content</h2>
        <p>Manage posts, photos, and library items.</p>
        <div className={styles.actions}>
          <button>Posts</button>
          <button>Photos</button>
          <button>Library</button>
        </div>
      </section>

      <section className={styles.card}>
        <h2>Members</h2>
        <p>View and manage member profiles and requests.</p>
        <div className={styles.actions}>
          <button>Profiles</button>
          <button>Join Requests</button>
        </div>
      </section>

      <section className={styles.card}>
        <h2>FanClub</h2>
        <p>Update FanClub content areas.</p>
        <div className={styles.actions}>
          <button>Memorabilia</button>
          <button>Photo Matchups</button>
        </div>
      </section>

      <section className={styles.card}>
        <h2>System</h2>
        <p>Diagnostics, logs, and maintenance tools.</p>
        <div className={styles.actions}>
          <button>Logs</button>
          <button>Health</button>
        </div>
      </section>
    </div>
  );
}
