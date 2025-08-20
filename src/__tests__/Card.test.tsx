import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '@/ui';

describe('Card Component', () => {
  it('renders with children content', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>,
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Card variant="default">Default Card</Card>);
    expect(screen.getByText('Default Card')).toBeInTheDocument();

    rerender(<Card variant="accent">Accent Card</Card>);
    expect(screen.getByText('Accent Card')).toBeInTheDocument();

    rerender(<Card variant="success">Success Card</Card>);
    expect(screen.getByText('Success Card')).toBeInTheDocument();

    rerender(<Card variant="warning">Warning Card</Card>);
    expect(screen.getByText('Warning Card')).toBeInTheDocument();

    rerender(<Card variant="error">Error Card</Card>);
    expect(screen.getByText('Error Card')).toBeInTheDocument();

    rerender(<Card variant="glass">Glass Card</Card>);
    expect(screen.getByText('Glass Card')).toBeInTheDocument();
  });

  it('accepts additional className', () => {
    const { container } = render(<Card className="custom-card">Test Card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-card');
  });

  it('passes through HTML attributes', () => {
    render(
      <Card id="test-card" data-testid="card-element">
        Test Content
      </Card>,
    );
    const card = screen.getByTestId('card-element');
    expect(card).toHaveAttribute('id', 'test-card');
  });

  it('supports complex nested content', () => {
    render(
      <Card variant="accent">
        <div>
          <h3>Complex Content</h3>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      </Card>,
    );

    expect(screen.getByText('Complex Content')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});
