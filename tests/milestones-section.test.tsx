import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import MilestonesSection from '@/components/MilestonesSection';
import { apiGet } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  apiGet: vi.fn(),
}));

const mockedApiGet = vi.mocked(apiGet);

describe('MilestonesSection', () => {
  beforeEach(() => {
    mockedApiGet.mockReset();
  });

  it('renders milestones in chronological order (oldest to newest)', async () => {
    mockedApiGet.mockResolvedValue({
      ok: true,
      items: [
        { id: 3, year: 1939, title: 'Later milestone' },
        { id: 1, year: 1923, title: 'First milestone' },
        { id: 2, year: 1939, title: 'Same date, lower id' },
      ],
    } as never);

    render(<MilestonesSection />);

    await waitFor(() => {
      expect(screen.getByText(/1923: First milestone/i)).toBeInTheDocument();
    });

    const cards = Array.from(document.querySelectorAll('#milestones .card strong, .grid .card strong'));
    const texts = cards.map((node) => node.textContent?.trim());
    expect(texts).toEqual([
      '1923: First milestone',
      '1939: Same date, lower id',
      '1939: Later milestone',
    ]);
  });

  it('shows clean empty state when no milestone rows are returned', async () => {
    mockedApiGet.mockResolvedValue({ ok: true, items: [] } as never);

    render(<MilestonesSection />);

    await waitFor(() => {
      expect(screen.getByText(/no milestones are available yet/i)).toBeInTheDocument();
    });
  });
});
