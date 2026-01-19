'use client';

import styles from './page.module.css';

import WeeklyMatchup from '@/components/WeeklyMatchup';
import FAQSection from '@/components/FAQSection';
import MilestonesSection from '@/components/MilestonesSection';
import FriendsOfFanClub from '@/components/FriendsOfFanClub';
import CalendarSection from '@/components/CalendarSection';
import JoinCTA from '@/components/JoinCTA';
import RecentDiscussionsTeaser from '@/components/RecentDiscussionsTeaser';
import SocialWall from '@/components/SocialWall';

export default function HomePage() {
  return (
    <>
      {/* Section: Hero Banner */}
      <header id="banner" className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>Welcome to the Lou Gehrig Fan Club!</h1>
          <p className={styles.subtitle}>
            Celebrating the Iron Horse — his record-setting career, his character, and the stories that keep his legacy alive.
          </p>
        </div>
      </header>

      {/* Section: Weekly Photo Matchup */}
      <section id="weekly" className="section-gap">
        <WeeklyMatchup />
      </section>

      {/* Section: Membership CTA */}
      <section id="join-cta" className="container section-gap">
        <JoinCTA />
      </section>

      {/* Section: Social Wall */}
      <SocialWall />

      <RecentDiscussionsTeaser />

      {/* Section: Friends of the Fan Club */}
      <section id="friends-of-the-club" className="container section-gap-moderate">
        <FriendsOfFanClub />
      </section>

      {/* Section: Milestones */}
      <section id="milestones" className="container section-gap-tight">
        <MilestonesSection />
      </section>

      {/* Section: Calendar */}
      <section id="calendar" className="container section-gap-tight">
        <CalendarSection />
      </section>

      {/* Section: FAQ */}
      <section id="faq" className="section-gap-tight">
        <div className="container">
          <FAQSection />
        </div>
      </section>
    </>
  );
}
