import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from '@/app/page';

/**
 * Homepage Structure Drift Guard Test
 * 
 * This test enforces the v6 homepage specification defined in:
 * - /docs/lgfc-homepage-legacy-v6.html
 * - /docs/Design-spec.md
 * - /docs/HOMEPAGE_SPEC.md
 * 
 * Any changes to homepage section order or structure must:
 * 1. Update the specification documents
 * 2. Update this test
 * 3. Be explicitly approved
 */

describe('Homepage Structure - V6 Specification Enforcement', () => {
  it('should render all required v6 sections in the correct order', () => {
    const { container } = render(<HomePage />);
    
    // Get all sections and headings to verify order
    const sections = container.querySelectorAll('section, header');
    
    // Assert we have the expected number of major sections
    expect(sections.length).toBeGreaterThanOrEqual(7);
  });

  it('should have Hero/Banner section first', () => {
    render(<HomePage />);
    
    // Hero should contain the welcome heading
    const heroHeading = screen.getByRole('heading', { 
      name: /welcome to the lou gehrig fan club/i,
      level: 1 
    });
    expect(heroHeading).toBeInTheDocument();
  });

  it('should have Weekly Matchup section second', () => {
    render(<HomePage />);
    
    // Weekly Matchup should have its specific heading
    const weeklyHeading = screen.getByRole('heading', { 
      name: /weekly photo matchup.*vote for your favorite/i,
      level: 2 
    });
    expect(weeklyHeading).toBeInTheDocument();
  });

  it('should have Join/Login CTA section (Membership CTA)', () => {
    render(<HomePage />);
    
    // Join CTA should be present with member-related content
    const joinSection = screen.getByText(/become a member.*get access/i);
    expect(joinSection).toBeInTheDocument();
  });

  it('should have Social Wall section', () => {
    render(<HomePage />);
    
    // Social Wall should have its heading
    const socialWallHeading = screen.getByRole('heading', { 
      name: /social wall/i,
      level: 2 
    });
    expect(socialWallHeading).toBeInTheDocument();
    
    // Should mention the social platforms
    const socialWallDescription = screen.getByText(/live fan posts from facebook, instagram, x, and pinterest/i);
    expect(socialWallDescription).toBeInTheDocument();
  });

  it('should have Recent Club discussions section (Member Posts Preview)', () => {
    render(<HomePage />);
    
    // Recent Club discussions heading
    const discussionsHeading = screen.getByRole('heading', { 
      name: /recent club discussions/i,
      level: 2 
    });
    expect(discussionsHeading).toBeInTheDocument();
  });

  it('should have Friends of the Fan Club section', () => {
    render(<HomePage />);
    
    // Friends section heading
    const friendsHeading = screen.getByRole('heading', { 
      name: /friends of the fan club/i,
      level: 2 
    });
    expect(friendsHeading).toBeInTheDocument();
  });

  it('should have Events Calendar section', () => {
    render(<HomePage />);
    
    // Calendar section heading
    const calendarHeading = screen.getByRole('heading', { 
      name: /calendar/i,
      level: 2 
    });
    expect(calendarHeading).toBeInTheDocument();
  });

  it('should have FAQ and Milestones section', () => {
    render(<HomePage />);
    
    // FAQ heading
    const faqHeading = screen.getByRole('heading', { 
      name: /faq.*question/i,
      level: 2 
    });
    expect(faqHeading).toBeInTheDocument();
    
    // Milestones heading
    const milestonesHeading = screen.getByRole('heading', { 
      name: /milestones/i,
      level: 2 
    });
    expect(milestonesHeading).toBeInTheDocument();
  });

  it('should maintain section order: Hero -> Weekly -> Join -> Social -> Discussions -> Friends -> Calendar -> FAQ/Milestones', () => {
    const { container } = render(<HomePage />);
    
    // Collect all h1 and h2 headings in order
    const headings = Array.from(container.querySelectorAll('h1, h2')).map(
      (el) => el.textContent?.toLowerCase() || ''
    );
    
    // Define expected order by checking indices
    const heroIndex = headings.findIndex(h => h.includes('welcome to the lou gehrig fan club'));
    const weeklyIndex = headings.findIndex(h => h.includes('weekly photo matchup'));
    const socialIndex = headings.findIndex(h => h === 'social wall');
    const discussionsIndex = headings.findIndex(h => h.includes('recent club discussions'));
    const friendsIndex = headings.findIndex(h => h.includes('friends of the fan club'));
    const calendarIndex = headings.findIndex(h => h === 'calendar');
    const faqIndex = headings.findIndex(h => h.includes('faq'));
    const milestonesIndex = headings.findIndex(h => h === 'milestones');
    
    // Verify all sections are found
    expect(heroIndex).toBeGreaterThanOrEqual(0);
    expect(weeklyIndex).toBeGreaterThanOrEqual(0);
    expect(socialIndex).toBeGreaterThanOrEqual(0);
    expect(discussionsIndex).toBeGreaterThanOrEqual(0);
    expect(friendsIndex).toBeGreaterThanOrEqual(0);
    expect(calendarIndex).toBeGreaterThanOrEqual(0);
    expect(faqIndex).toBeGreaterThanOrEqual(0);
    expect(milestonesIndex).toBeGreaterThanOrEqual(0);
    
    // Verify order (each section should come after the previous)
    expect(heroIndex).toBeLessThan(weeklyIndex);
    expect(weeklyIndex).toBeLessThan(socialIndex);
    expect(socialIndex).toBeLessThan(discussionsIndex);
    expect(discussionsIndex).toBeLessThan(friendsIndex);
    expect(friendsIndex).toBeLessThan(calendarIndex);
    expect(calendarIndex).toBeLessThan(faqIndex);
    // FAQ and Milestones can be in either order since they're in same section
    expect(Math.min(faqIndex, milestonesIndex)).toBeGreaterThan(calendarIndex);
  });
});
