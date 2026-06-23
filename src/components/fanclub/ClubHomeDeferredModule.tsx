import { clubHomeMutedText, clubHomeSectionCard, clubHomeSectionTitle } from './clubHomeStyles';

type ClubHomeDeferredModuleProps = {
  title: string;
  ariaLabel: string;
  reason: string;
};

export default function ClubHomeDeferredModule({ title, ariaLabel, reason }: ClubHomeDeferredModuleProps) {
  return (
    <section aria-label={ariaLabel} style={{ ...clubHomeSectionCard, opacity: 0.92 }}>
      <h2 style={clubHomeSectionTitle}>{title}</h2>
      <p style={clubHomeMutedText}>{reason}</p>
    </section>
  );
}
