import { clubHomeMutedText, clubHomeSectionCard, clubHomeSectionTitle } from './clubHomeStyles';

type ClubHomeStaticStoryProps = {
  title: string;
  headline: string;
  summary: string;
  ariaLabel: string;
  compact?: boolean;
  credit?: string | null;
  sourceName?: string | null;
};

export default function ClubHomeStaticStory({
  title,
  headline,
  summary,
  ariaLabel,
  compact = false,
  credit,
  sourceName,
}: ClubHomeStaticStoryProps) {
  return (
    <article aria-label={ariaLabel} style={clubHomeSectionCard}>
      <h2 style={{ ...clubHomeSectionTitle, fontSize: compact ? 18 : 22 }}>{title}</h2>
      <h3 style={{ margin: '0 0 8px 0', fontSize: compact ? 17 : 20, lineHeight: 1.35 }}>{headline}</h3>
      <p style={clubHomeMutedText}>{summary}</p>
      {(credit || sourceName) && (
        <p style={{ ...clubHomeMutedText, marginTop: 8, fontSize: 13 }}>
          {credit ? `Credit: ${credit}` : null}
          {credit && sourceName ? ' · ' : null}
          {sourceName ? `Source: ${sourceName}` : null}
        </p>
      )}
    </article>
  );
}
