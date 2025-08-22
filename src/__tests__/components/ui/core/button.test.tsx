import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/ui';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    let clicked = false;

    render(
      <Button
        onClick={() => {
          clicked = true;
        }}
      >
        Click me
      </Button>,
    );

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(clicked).toBe(true);
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled button</Button>);

    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole('button', { name: /default/i })).toBeInTheDocument();

    rerender(<Button variant="gradient">Gradient</Button>);
    expect(screen.getByRole('button', { name: /gradient/i })).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button', { name: /ghost/i })).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button', { name: /outline/i })).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button', { name: /small/i })).toBeInTheDocument();

    rerender(<Button size="default">Default</Button>);
    expect(screen.getByRole('button', { name: /default/i })).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button', { name: /large/i })).toBeInTheDocument();

    rerender(<Button size="tall">Tall</Button>);
    expect(screen.getByRole('button', { name: /tall/i })).toBeInTheDocument();
  });

  it('accepts additional className', () => {
    const { container } = render(<Button className="custom-class">Test</Button>);
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('custom-class');
  });

  it('passes through HTML button attributes', () => {
    render(
      <Button type="submit" id="submit-btn">
        Submit
      </Button>,
    );
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('id', 'submit-btn');
  });
});
