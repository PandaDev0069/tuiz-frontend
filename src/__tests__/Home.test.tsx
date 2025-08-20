import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '@/app/page';

describe('Home page', () => {
  it('renders headline', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /TUIZ/i })).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<Home />);
    expect(screen.getByText(/welcome to tuiz/i)).toBeInTheDocument();
  });
});
