import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Page from '../app/page';

describe('Page', () => {
  it('renders the main heading', () => {
    render(<Page />);

    const heading = screen.getByRole('heading', { name: /tuiz/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<Page />);

    const description = screen.getByText(/frontend skeleton running/i);
    expect(description).toBeInTheDocument();
  });

  it('renders the room ID input', () => {
    render(<Page />);

    const input = screen.getByPlaceholderText(/room id/i);
    expect(input).toBeInTheDocument();
  });

  it('renders the continue button', () => {
    render(<Page />);

    const button = screen.getByRole('button', { name: /continue/i });
    expect(button).toBeInTheDocument();
  });
});
