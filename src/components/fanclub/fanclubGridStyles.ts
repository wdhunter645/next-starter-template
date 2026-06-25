import type React from 'react';

/** Three-column desktop grid per fanclub-subpages.md gallery/memorabilia contracts. */
export const fanclubThreeColumnGrid: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
};
