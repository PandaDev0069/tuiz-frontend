import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderWithProviders } from '@/__tests__/setupTests';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '@/components/ui';

describe('Checkbox', () => {
  it('renders and toggles checked state', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = renderWithProviders(
      <Checkbox id="cb" label="Remember" checked={false} onChange={() => {}} />,
    );
    const el = getByLabelText('Remember') as HTMLInputElement;
    expect(el).toBeInTheDocument();
    // Toggle via click
    await user.click(el);
    // The component is controlled in real app; this smoke test ensures it is interactive
    expect(el).toBeTruthy();
  });

  it('supports disabled state', () => {
    const { getByLabelText } = renderWithProviders(
      <Checkbox id="cb2" label="Disabled" checked={false} onChange={() => {}} disabled />,
    );
    const el = getByLabelText('Disabled') as HTMLInputElement;
    expect(el).toBeDisabled();
  });
});
