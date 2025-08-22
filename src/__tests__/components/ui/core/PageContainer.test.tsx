import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderWithProviders } from '@/__tests__/setupTests';
import { PageContainer } from '@/components/ui';

describe('PageContainer', () => {
  it('renders children and applies className', () => {
    const { getByText } = renderWithProviders(
      <PageContainer className="pc-test">
        {' '}
        <div>Child</div>{' '}
      </PageContainer>,
    );
    expect(getByText('Child')).toBeTruthy();
  });
});
