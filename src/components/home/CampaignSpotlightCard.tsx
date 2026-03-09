import type { CampaignSpotlightConfig } from '@/lib/campaignSpotlight';
import styles from './CampaignSpotlightCard.module.css';

type Props = {
  config: CampaignSpotlightConfig;
  previewLabel?: string;
};

export default function CampaignSpotlightCard({ config, previewLabel }: Props) {
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

          <div className={styles.actions}>
            <a className={styles.primary} href={config.primaryCtaHref}>{config.primaryCtaLabel}</a>
            {config.secondaryCtaLabel && config.secondaryCtaHref ? (
              <a className={styles.secondary} href={config.secondaryCtaHref}>{config.secondaryCtaLabel}</a>
            ) : null}
          </div>
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
