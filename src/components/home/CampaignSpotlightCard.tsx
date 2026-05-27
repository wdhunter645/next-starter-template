import {
  formatCampaignSpotlightFunds,
  getCampaignSpotlightLeaderboardForDisplay,
  getCampaignSpotlightLinkProps,
  getCampaignSpotlightPrimaryCtaForDisplay,
  getCampaignSpotlightSecondaryCtaForDisplay,
  validateCampaignSpotlightLeaderboard,
  type CampaignSpotlightConfig,
} from '@/lib/campaignSpotlight';
import styles from './CampaignSpotlightCard.module.css';

type Props = {
  config: CampaignSpotlightConfig;
  previewLabel?: string;
};

export default function CampaignSpotlightCard({ config, previewLabel }: Props) {
  const primaryCta = getCampaignSpotlightPrimaryCtaForDisplay(config);
  const secondaryCta = getCampaignSpotlightSecondaryCtaForDisplay(config);
  const leaderboardErrors = validateCampaignSpotlightLeaderboard(config.leaderboard);
  const leaderboard = leaderboardErrors.length === 0 ? getCampaignSpotlightLeaderboardForDisplay(config) : [];

  return (
    <section aria-label="Campaign spotlight" className={styles.wrap}>
      <div className={styles.inner}>
        <div>
          <div className={styles.eyebrowRow}>
            <div className={styles.eyebrow}>{config.eyebrow}</div>
            {config.badge ? <div className={styles.badge}>{config.badge}</div> : null}
            {previewLabel ? <div className={styles.badge}>{previewLabel}</div> : null}
          </div>

          <h2 className={styles.title}>{config.title}</h2>
          <p className={styles.description}>{config.description}</p>
          <div className={styles.meta}>{config.deadlineLabel}</div>
          <p className={styles.note}>{config.note}</p>

          {primaryCta || secondaryCta ? (
            <div className={styles.actions}>
              {primaryCta ? (
                <a
                  className={styles.primary}
                  data-testid="campaign-spotlight-primary-cta"
                  href={primaryCta.href}
                  {...getCampaignSpotlightLinkProps(primaryCta.href, primaryCta.label)}
                >
                  {primaryCta.label}
                </a>
              ) : null}
              {secondaryCta ? (
                <a
                  className={styles.secondary}
                  data-testid="campaign-spotlight-secondary-cta"
                  href={secondaryCta.href}
                  {...getCampaignSpotlightLinkProps(secondaryCta.href, secondaryCta.label)}
                >
                  {secondaryCta.label}
                </a>
              ) : null}
            </div>
          ) : null}

          {leaderboard.length > 0 ? (
            <div className={styles.leaderboard} data-testid="campaign-spotlight-leaderboard">
              <h3 className={styles.leaderboardTitle}>Top Teams</h3>
              <ol className={styles.leaderboardList}>
                {leaderboard.map((entry, index) => (
                  <li key={`${entry.name}-${index}`} className={styles.leaderboardItem}>
                    <span className={styles.leaderboardRank}>{index + 1}</span>
                    <div className={styles.leaderboardDetails}>
                      <div className={styles.leaderboardName}>{entry.name}</div>
                      <div className={styles.leaderboardMetrics}>
                        <span>{formatCampaignSpotlightFunds(entry.funds)} raised</span>
                        <span>{entry.supporters} supporters</span>
                        <span>{entry.points.toLocaleString('en-US')} points</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>

        <aside className={styles.stats}>
          <div className={styles.statsLabel}>{config.progressLabel}</div>
          <div className={styles.amount}>{config.raisedAmount}</div>
          <div className={styles.goal}>Goal: {config.goalAmount}</div>
          <div className={styles.supporters}>{config.supporterCount}</div>
          {config.archiveLabel ? <div className={styles.archive}>{config.archiveLabel}</div> : null}
        </aside>
      </div>
    </section>
  );
}
