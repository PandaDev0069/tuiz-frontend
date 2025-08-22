import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthCard } from '@/components/ui/data-display/auth-card';

describe('AuthCard', () => {
  it('renders children correctly', () => {
    render(
      <AuthCard>
        <div>Test content</div>
      </AuthCard>,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className alongside base styles', () => {
    const { container } = render(
      <AuthCard className="custom-class">
        <div>Content</div>
      </AuthCard>,
    );

    const authCard = container.firstChild as HTMLElement;
    expect(authCard).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <AuthCard data-testid="auth-card" role="form">
        <div>Content</div>
      </AuthCard>,
    );

    const authCard = screen.getByTestId('auth-card');
    expect(authCard).toHaveAttribute('role', 'form');
  });

  it('has proper default styling classes', () => {
    const { container } = render(
      <AuthCard>
        <div>Content</div>
      </AuthCard>,
    );

    const authCard = container.firstChild as HTMLElement;
    expect(authCard).toHaveClass('bg-white');
    expect(authCard).toHaveClass('border-gray-200');
    expect(authCard).toHaveClass('shadow-lg');
    expect(authCard).toHaveClass('rounded-lg');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <AuthCard ref={ref}>
        <div>Content</div>
      </AuthCard>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders with proper semantic structure', () => {
    render(
      <AuthCard>
        <h2>Login Form</h2>
        <form>
          <input type="email" placeholder="Email" />
        </form>
      </AuthCard>,
    );

    expect(screen.getByRole('heading', { name: /login form/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
