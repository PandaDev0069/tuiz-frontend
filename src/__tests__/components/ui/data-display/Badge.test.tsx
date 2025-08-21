import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '@/ui';

describe('Badge Component', () => {
  it('renders badge with text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>);
    expect(screen.getByText('Default')).toBeInTheDocument();

    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toBeInTheDocument();

    rerender(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toBeInTheDocument();

    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText('Destructive')).toBeInTheDocument();

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toBeInTheDocument();

    rerender(<Badge variant="ghost">Ghost</Badge>);
    expect(screen.getByText('Ghost')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toBeInTheDocument();

    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium')).toBeInTheDocument();

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toBeInTheDocument();
  });

  it('accepts additional className', () => {
    const { container } = render(<Badge className="custom-badge">Test</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('custom-badge');
  });

  it('passes through HTML span attributes', () => {
    render(
      <Badge id="status-badge" title="Status">
        Active
      </Badge>,
    );
    const badge = screen.getByText('Active');
    expect(badge).toHaveAttribute('id', 'status-badge');
    expect(badge).toHaveAttribute('title', 'Status');
  });

  it('supports complex content', () => {
    render(
      <Badge variant="success">
        <span>Icon</span> Badge Text
      </Badge>,
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Badge Text')).toBeInTheDocument();
  });
});
