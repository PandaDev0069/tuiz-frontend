import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Input } from '@/components/ui';

describe('Input Component', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText(/enter text/i);
    expect(input).toBeInTheDocument();
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    const input = screen.getByPlaceholderText(/type here/i);
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText(/disabled input/i);
    expect(input).toBeDisabled();
  });

  it('accepts additional className', () => {
    const { container } = render(<Input className="custom-input" />);
    const input = container.firstChild as HTMLElement;
    expect(input).toHaveClass('custom-input');
  });

  it('passes through HTML input attributes', () => {
    render(<Input type="email" id="email-input" required />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('id', 'email-input');
    expect(input).toBeRequired();
  });

  it('handles onChange events', async () => {
    const user = userEvent.setup();
    let value = '';

    render(
      <Input
        onChange={(e) => {
          value = e.target.value;
        }}
      />,
    );
    const input = screen.getByRole('textbox');

    await user.type(input, 'test');
    expect(value).toBe('test');
  });
});
