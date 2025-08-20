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
    expect(
      screen.getByText(/welcome to tuiz - your interactive quiz platform/i),
    ).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /create quiz/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /browse quizzes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /learn more/i })).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<Home />);
    expect(screen.getByPlaceholderText(/search for quizzes/i)).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<Home />);
    expect(screen.getByText(/featured quiz/i)).toBeInTheDocument();
    expect(screen.getByText(/achievements/i)).toBeInTheDocument();
    expect(screen.getByText(/statistics/i)).toBeInTheDocument();
  });
});
