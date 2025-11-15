'use client';

import styles from './page.module.css';

import WeeklyMatchup from '@/components/WeeklyMatchup';
import FAQSection from '@/components/FAQSection';
import MilestonesSection from '@/components/MilestonesSection';
import FriendsOfFanClub from '@/components/FriendsOfFanClub';
import CalendarSection from '@/components/CalendarSection';
import SocialWall from '@/components/SocialWall';

export default function HomePage() {
  return (
    <>
      {/* Section: Hero Banner */}
      <header id="banner" className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>Lou Gehrig Fan Club</h1>
          <p className={styles.subtitle}>
            We are proud to be fans of the greatest baseball player ever and are dedicated to honoring his legacy.
          </p>
        </div>
      </header>

      {/* Section: Weekly Photo Matchup */}
      <section id="weekly" className="section-gap">
        <WeeklyMatchup />
      </section>

      {/* Section: Social Wall with Elfsight Embed */}
      <section id="social-wall" className="section-gap">
        <h2 className="section-title">Social Wall</h2>
        <SocialWall />
      </section>

      {/* Section: Recent Club Activity */}
      <section id="recent-club-activity" className="section-gap">
        <h2 className="section-title">Recent Club Activity</h2>
        {/* This section will later be populated by the Members Area, showing the last 5 to 10 posts in read-only mode */}
      </section>

      {/* Section: Friends of the Club */}
      <section id="friends-of-the-club" className="section-gap">
        <FriendsOfFanClub />
      </section>

      {/* Section: Calendar */}
      <section id="calendar" className="section-gap">
        <CalendarSection />
      </section>

      {/* Section: FAQ and Milestones */}
      <section id="faq-milestones" className="section-gap">
        <div className="container two-col" role="region" aria-label="FAQ and Milestones">
          <div className="section--tight">
            <FAQSection />
          </div>
          <div className="section--tight">
            <MilestonesSection />
          </div>
        </div>
      </section>
    </>
  );
}
