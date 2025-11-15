'use client';
import styles from './CalendarSection.module.css';

export default function CalendarSection() {
  const events = [
    { id: 1, date: 'Dec 15, 2024', title: 'Annual Lou Gehrig Memorial Event' },
    { id: 2, date: 'Jan 8, 2025', title: 'Virtual Q&A with Baseball Historians' },
    { id: 3, date: 'Feb 3, 2025', title: 'Fan Club Meet & Greet' },
  ];

  return (
    <>
      <h2 className="section-title">Calendar</h2>
      <p className="sub" style={{ textAlign: 'center' }}>Browse events month by month.</p>
      <div className={styles.events}>
        {events.map((event) => (
          <div key={event.id} className={styles.eventCard}>
            <div className={styles.date}>{event.date}</div>
            <div className={styles.eventTitle}>{event.title}</div>
            <a href="#" className={styles.viewMore} onClick={(e) => e.preventDefault()}>
              View More
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
