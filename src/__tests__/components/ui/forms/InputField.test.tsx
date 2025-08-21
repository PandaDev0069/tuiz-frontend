import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { InputField } from '@/components/ui/forms/input-field';

describe('InputField', () => {
  const user = userEvent.setup();

  it('renders with label and input', () => {
    render(
      <InputField
        id="test-input"
        name="testInput"
        label="Test Label"
        value=""
        onChange={() => {}}
      />,
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /test label/i })).toBeInTheDocument();
  });

  it('handles user input correctly', async () => {
    const handleChange = vi.fn();

    render(
      <InputField
        id="test-input"
        name="testInput"
        label="Test Label"
        value=""
        onChange={handleChange}
      />,
    );

    const input = screen.getByRole('textbox', { name: /test label/i });
    await user.type(input, 'test value');

    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message when error prop is provided', () => {
    render(
      <InputField
        id="test-input"
        name="testInput"
        label="Test Label"
        value=""
        onChange={() => {}}
        error="This field is required"
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(
      <InputField
        id="test-input"
        name="testInput"
        label="Test Label"
        value=""
        onChange={() => {}}
        error="Error message"
      />,
    );

    const input = screen.getByRole('textbox', { name: /test label/i });
    expect(input).toHaveClass('border-red-500');
  });

  it('shows placeholder text', () => {
    render(
      <InputField
        id="test-input"
        name="testInput"
        label="Test Label"
        placeholder="Enter text here"
        value=""
        onChange={() => {}}
      />,
    );

    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(
      <InputField
        id="test-input"
        name="testInput"
        label="Test Label"
        value=""
        onChange={() => {}}
        disabled
      />,
    );

    const input = screen.getByRole('textbox', { name: /test label/i });
    expect(input).toBeDisabled();
  });

  it('can be required', () => {
    render(
      <InputField
        id="test-input"
        name="testInput"
        label="Test Label"
        value=""
        onChange={() => {}}
        required
      />,
    );

    const input = screen.getByRole('textbox', { name: /test label/i });
    expect(input).toBeRequired();
  });

  it('supports different input types', () => {
    const { rerender } = render(
      <InputField
        id="email-input"
        name="email"
        label="Email"
        type="email"
        value=""
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole('textbox', { name: /email/i })).toHaveAttribute('type', 'email');

    rerender(
      <InputField id="url-input" name="url" label="URL" type="url" value="" onChange={() => {}} />,
    );

    expect(screen.getByRole('textbox', { name: /url/i })).toHaveAttribute('type', 'url');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();

    render(
      <InputField
        ref={ref}
        id="test-input"
        name="testInput"
        label="Test Label"
        value=""
        onChange={() => {}}
      />,
    );

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('associates label with input using htmlFor/id', () => {
    render(
      <InputField
        id="test-input"
        name="testInput"
        label="Test Label"
        value=""
        onChange={() => {}}
      />,
    );

    const label = screen.getByText('Test Label');
    const input = screen.getByRole('textbox', { name: /test label/i });

    expect(label).toHaveAttribute('for', 'test-input');
    expect(input).toHaveAttribute('id', 'test-input');
  });

  it('applies custom className', () => {
    render(
      <InputField
        id="test-input"
        name="testInput"
        label="Test Label"
        value=""
        onChange={() => {}}
        className="custom-class"
      />,
    );

    const input = screen.getByRole('textbox', { name: /test label/i });
    expect(input).toHaveClass('custom-class');
  });

  it('handles focus and blur events', async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    render(
      <InputField
        id="test-input"
        name="testInput"
        label="Test Label"
        value=""
        onChange={() => {}}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />,
    );

    const input = screen.getByRole('textbox', { name: /test label/i });

    await user.click(input);
    expect(handleFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });

  it('has proper ARIA attributes when error is present', () => {
    render(
      <InputField
        id="test-input"
        name="testInput"
        label="Test Label"
        value=""
        onChange={() => {}}
        error="This field has an error"
      />,
    );

    const input = screen.getByRole('textbox', { name: /test label/i });
    const errorMessage = screen.getByRole('alert');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
    expect(errorMessage).toHaveAttribute('id');
  });
});
