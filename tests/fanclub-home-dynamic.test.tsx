import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MemberHomePage from '@/app/fanclub/page';

const mockUseMemberSession = vi.fn();
const mockFetch = vi.fn();

vi.mock('@/hooks/useMemberSession', () => ({
  useMemberSession: (...args: unknown[]) => mockUseMemberSession(...args),
}));

vi.mock('@/components/FloatingLogo', () => ({
  default: () => <div data-testid="floating-logo" />,
}));

vi.mock('@/components/fanclub/AdminLink', () => ({
  default: () => null,
}));

describe('Fan Club home dynamic content (#1690 Task 005)', () => {
  beforeEach(() => {
    mockUseMemberSession.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      email: 'member@example.com',
      role: 'member',
    });
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  it('renders dynamic lead story credit when club home API returns inventory', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        source: 'content_inventory',
        lead_story: {
          id: 9,
          title: 'Dynamic lead',
          headline: 'Dynamic lead',
          summary: 'Published club home lead summary.',
          credit: 'Lou Gehrig Society',
          source_name: 'LGFC Archive',
          year: 1939,
          tag: 'iron-horse',
          perspective_label: null,
          canonical: true,
          story_type: 'primary',
        },
        rail_stories: [],
        archive_spotlight: null,
        media_feature: null,
      }),
    });

    render(<MemberHomePage />);

    await waitFor(() => {
      expect(screen.getByText('Dynamic lead')).toBeInTheDocument();
      expect(screen.getByText(/Credit: Lou Gehrig Society/)).toBeInTheDocument();
      expect(screen.getByText(/Source: LGFC Archive/)).toBeInTheDocument();
    });
  });
});
