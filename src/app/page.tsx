'use client';

import styles from './page.module.css';

import WeeklyMatchup from '@/components/WeeklyMatchup';
import FAQSection from '@/components/FAQSection';
import MilestonesSection from '@/components/MilestonesSection';
import FriendsOfFanClub from '@/components/FriendsOfFanClub';
import CalendarSection from '@/components/CalendarSection';

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

      {/* Section: Join Banner */}
      <section id="join" className="section-gap">
        <div className="joinBanner section-gap">
          <div className="join-banner__container">
            <p className="join-banner__text">
              Become a member. Get access to the Gehrig library, media archive, memorabilia, and more.
            </p>
            <div className="join-banner__actions">
              <a className="join-banner__btn" href="/join">Join</a>
              <a className="join-banner__btn" href="/member">Login</a>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Social Wall with Elfsight Embed */}
      <section id="social-wall" className="section-gap">
        <h2 className="section-title">Social Wall</h2>
        <div style={{ width: '100%', minHeight: '600px' }}>
          <iframe
            src="https://805f3c5c67cd4edfbde62d5978e386a8.elf.site"
            width="100%"
            height="600"
            style={{ border: 'none', overflow: 'hidden' }}
            loading="lazy"
            allowFullScreen
          ></iframe>
        </div>
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
