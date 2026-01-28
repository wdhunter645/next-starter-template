import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SampleComponent from '../SampleComponent';

describe('SampleComponent', () => {
  it('renders with default props', () => {
    render(<SampleComponent />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome');
    expect(screen.getByText('This is a sample component')).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    render(<SampleComponent title="Custom Title" message="Custom message" />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Custom Title');
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('has correct test id', () => {
    render(<SampleComponent />);
    
    expect(screen.getByTestId('sample-component')).toBeInTheDocument();
  });
});
