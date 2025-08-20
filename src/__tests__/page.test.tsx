import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Page from '../app/page';

describe('Page', () => {
  it('renders the main heading', () => {
    render(<Page />);

    const heading = screen.getByRole('heading', { name: /tuiz/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<Page />);

    const description = screen.getByText(/welcome to tuiz - your interactive quiz platform/i);
    expect(description).toBeInTheDocument();
  });

  it('renders main content', () => {
    render(<Page />);

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });
});
