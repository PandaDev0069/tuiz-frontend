import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/__tests__/setupTests';
import { render } from '@testing-library/react';
import { useAnimation } from '@/app/AnimationController';

describe('useAnimation', () => {
  it('throws when used outside AnimationProvider', () => {
    const Bad = () => {
      // should throw
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = useAnimation();
      return null;
    };

    expect(() => render(<Bad />)).toThrow();
  });

  it('initializes with default tuning when no browser APIs are present', () => {
    const Show = () => {
      const ctx = useAnimation();
      return (
        <div
          data-testid="vals"
          data-duration={String(ctx.duration)}
          data-scale={String(ctx.scale)}
          data-easing={ctx.easing}
        >
          {String(ctx.latencyMs)}
        </div>
      );
    };

    const { getByTestId } = renderWithProviders(<Show />);
    const el = getByTestId('vals');
    expect(el.getAttribute('data-duration')).toBe('3000');
    expect(el.getAttribute('data-scale')).toBe('1');
    expect(el.getAttribute('data-easing')).toBe('ease');
    expect(el.textContent).toBe('null');
  });

  it('allows calling refresh and unmounts cleanly', async () => {
    const Show = () => {
      const ctx = useAnimation();
      return (
        <div>
          <button onClick={() => void ctx.refresh()} type="button">
            refresh
          </button>
        </div>
      );
    };

    const { unmount, getByText } = renderWithProviders(<Show />);
    // Call refresh (should be safe and no-op in node test env)
    getByText('refresh').click();
    // Unmount and ensure no errors are thrown
    unmount();
    expect(true).toBeTruthy();
  });
});
