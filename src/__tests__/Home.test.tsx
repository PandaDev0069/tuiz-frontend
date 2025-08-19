import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '@/app/page';

describe('Home page', () => {
  it('renders headline', () => {
    render(<Home />);
    expect(screen.getByText(/TUIZ/i)).toBeInTheDocument();
  });
});
