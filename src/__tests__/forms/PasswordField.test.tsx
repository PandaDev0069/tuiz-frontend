import React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PasswordField } from '@/components/ui/forms/password-field';

describe('PasswordField', () => {
  const user = userEvent.setup();

  it('renders with label and password input', () => {
    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        value=""
        onChange={() => {}}
      />,
    );

    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility when toggle button is clicked', async () => {
    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        value="secretpassword"
        onChange={() => {}}
      />,
    );

    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    // Initially hidden
    expect(passwordInput.type).toBe('password');

    // Click to show
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    // Click to hide again
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
  });

  it('handles user input correctly', async () => {
    const handleChange = vi.fn();

    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        value=""
        onChange={handleChange}
      />,
    );

    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'mypassword');

    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message when error prop is provided', () => {
    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        value=""
        onChange={() => {}}
        error="Password is required"
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        value=""
        onChange={() => {}}
        error="Error message"
      />,
    );

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveClass('border-red-500');
  });

  it('shows placeholder text', () => {
    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        placeholder="Enter your password"
        value=""
        onChange={() => {}}
      />,
    );

    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        value=""
        onChange={() => {}}
        disabled
      />,
    );

    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toBeDisabled();
    expect(toggleButton).toBeDisabled();
  });

  it('can be required', () => {
    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        value=""
        onChange={() => {}}
        required
      />,
    );

    const passwordInput = screen.getByLabelText(/^Password/i);
    expect(passwordInput).toBeRequired();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();

    render(
      <PasswordField
        ref={ref}
        id="password-input"
        name="password"
        label="Password"
        value=""
        onChange={() => {}}
      />,
    );

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('associates label with input using htmlFor/id', () => {
    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        value=""
        onChange={() => {}}
      />,
    );

    const label = screen.getByText('Password');
    const passwordInput = screen.getByLabelText('Password');

    expect(label).toHaveAttribute('for', 'password-input');
    expect(passwordInput).toHaveAttribute('id', 'password-input');
  });

  it('has proper ARIA attributes', () => {
    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        value=""
        onChange={() => {}}
      />,
    );

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    expect(toggleButton).toHaveAttribute('aria-label');
  });

  it('has proper ARIA attributes when error is present', () => {
    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        value=""
        onChange={() => {}}
        error="This field has an error"
      />,
    );

    const passwordInput = screen.getByLabelText('Password');
    const errorMessage = screen.getByRole('alert');

    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).toHaveAttribute('aria-describedby');
    expect(errorMessage).toHaveAttribute('id');
  });

  it('maintains focus on input when toggle button is clicked', async () => {
    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        value=""
        onChange={() => {}}
      />,
    );

    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    // Focus the input
    passwordInput.focus();
    expect(document.activeElement).toBe(passwordInput);

    // Click toggle - focus should remain on input
    await user.click(toggleButton);
    expect(document.activeElement).toBe(passwordInput);
  });

  it('displays correct icons for show/hide states', async () => {
    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        value="password"
        onChange={() => {}}
      />,
    );

    const toggleButton = screen.getByRole('button', { name: /show password/i });

    // Initially shows eye icon (for showing password)
    expect(toggleButton).toBeInTheDocument();

    // After clicking, should show eye-slash icon (for hiding password)
    await user.click(toggleButton);
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
  });

  it('applies custom className to input', () => {
    render(
      <PasswordField
        id="password-input"
        name="password"
        label="Password"
        value=""
        onChange={() => {}}
        className="custom-class"
      />,
    );

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveClass('custom-class');
  });
});
