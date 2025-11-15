import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '../Header';

describe('Header', () => {
  it('renders with default props (logo pointing to /)', () => {
    render(<Header />);
    
    const logo = screen.getByRole('link', { name: /lou gehrig fan club/i });
    expect(logo).toHaveAttribute('href', '/');
    expect(screen.getByAltText('LGFC')).toBeInTheDocument();
  });

  it('renders with custom homeRoute', () => {
    render(<Header homeRoute="/memberpage" />);
    
    const logo = screen.getByRole('link', { name: /lou gehrig fan club/i });
    expect(logo).toHaveAttribute('href', '/memberpage');
  });

  it('hides logo when showLogo is false', () => {
    render(<Header showLogo={false} />);
    
    expect(screen.queryByRole('link', { name: /lou gehrig fan club/i })).not.toBeInTheDocument();
    expect(screen.queryByAltText('LGFC')).not.toBeInTheDocument();
  });

  it('shows hamburger menu button', () => {
    render(<Header />);
    
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });
});
