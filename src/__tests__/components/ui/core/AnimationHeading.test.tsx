import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderWithProviders } from '@/__tests__/setupTests';
import { AnimatedHeading } from '@/components/ui';

describe('AnimationHeading', () => {
  it('renders children and applies className', () => {
    const { getByText } = renderWithProviders(
      <AnimatedHeading className="test-class">Hello World</AnimatedHeading>,
    );
    const el = getByText('Hello World');
    expect(el).toBeTruthy();
    expect(el).toHaveClass('test-class');
  });

  it('supports size and animation variants', () => {
    const { getByText } = renderWithProviders(
      <AnimatedHeading size="md" animation="glow">
        Variant
      </AnimatedHeading>,
    );
    const el = getByText('Variant');
    expect(el).toBeTruthy();
  });
});
