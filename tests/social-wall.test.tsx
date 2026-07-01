import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SocialWall from '@/components/SocialWall';

describe('SocialWall (#2044)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows loading copy before the widget resolves', () => {
    render(<SocialWall />);
    expect(screen.getByText('Loading social wall content...')).toBeInTheDocument();
  });

  it('shows platform fallback links when the widget fails to load', () => {
    render(<SocialWall />);

    act(() => {
      vi.advanceTimersByTime(8000);
    });

    expect(screen.getByRole('region', { name: /Follow the Lou Gehrig Fan Club/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Facebook/i })).toHaveAttribute('href', 'https://www.facebook.com/');
    expect(screen.getByRole('link', { name: /Instagram/i })).toHaveAttribute('href', 'https://www.instagram.com/');
    expect(screen.getByRole('link', { name: /X \(Twitter\)/i })).toHaveAttribute('href', 'https://x.com/');
    expect(screen.getByRole('link', { name: /Pinterest/i })).toHaveAttribute('href', 'https://www.pinterest.com/');
  });
});
