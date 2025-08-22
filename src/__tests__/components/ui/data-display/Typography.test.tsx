import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Heading, Text } from '@/components/ui';

describe('Typography Components', () => {
  describe('Heading Component', () => {
    it('renders heading with default props', () => {
      render(<Heading>Test Heading</Heading>);
      const heading = screen.getByRole('heading', { name: /test heading/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2'); // default as="h2"
    });

    it('renders with different heading levels', () => {
      const { rerender } = render(<Heading as="h1">H1 Heading</Heading>);
      let heading = screen.getByRole('heading', { name: /h1 heading/i });
      expect(heading.tagName).toBe('H1');

      rerender(<Heading as="h3">H3 Heading</Heading>);
      heading = screen.getByRole('heading', { name: /h3 heading/i });
      expect(heading.tagName).toBe('H3');
    });

    it('accepts different size props', () => {
      const { rerender } = render(<Heading size="3xl">Large Heading</Heading>);
      expect(screen.getByText('Large Heading')).toBeInTheDocument();

      rerender(<Heading size="sm">Small Heading</Heading>);
      expect(screen.getByText('Small Heading')).toBeInTheDocument();
    });

    it('renders with custom className for gradient effect', () => {
      render(<Heading className="gradient-text">Gradient Heading</Heading>);
      const heading = screen.getByText('Gradient Heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('gradient-text');
    });

    it('accepts additional className', () => {
      const { container } = render(<Heading className="custom-heading">Test</Heading>);
      const heading = container.firstChild as HTMLElement;
      expect(heading).toHaveClass('custom-heading');
    });
  });

  describe('Text Component', () => {
    it('renders text with default props', () => {
      render(<Text>Test Text</Text>);
      const text = screen.getByText('Test Text');
      expect(text).toBeInTheDocument();
      expect(text.tagName).toBe('P'); // default as="p"
    });

    it('renders as paragraph element', () => {
      render(<Text>Text Content</Text>);
      const text = screen.getByText('Text Content');
      expect(text).toBeInTheDocument();
      expect(text.tagName).toBe('P');
    });

    it('accepts different size and weight props', () => {
      const { rerender } = render(
        <Text size="lg" weight="medium">
          Styled Text
        </Text>,
      );
      expect(screen.getByText('Styled Text')).toBeInTheDocument();

      rerender(
        <Text size="sm" weight="bold">
          Small Bold Text
        </Text>,
      );
      expect(screen.getByText('Small Bold Text')).toBeInTheDocument();
    });

    it('renders with custom className for gradient effect', () => {
      render(<Text className="gradient-text">Gradient Text</Text>);
      const text = screen.getByText('Gradient Text');
      expect(text).toBeInTheDocument();
      expect(text).toHaveClass('gradient-text');
    });

    it('accepts additional className', () => {
      const { container } = render(<Text className="custom-text">Test</Text>);
      const text = container.firstChild as HTMLElement;
      expect(text).toHaveClass('custom-text');
    });

    it('renders with different variant colors', () => {
      const { rerender } = render(<Text variant="muted">Muted Text</Text>);
      expect(screen.getByText('Muted Text')).toBeInTheDocument();

      rerender(<Text variant="accent">Accent Text</Text>);
      expect(screen.getByText('Accent Text')).toBeInTheDocument();

      rerender(<Text variant="default">Default Text</Text>);
      expect(screen.getByText('Default Text')).toBeInTheDocument();
    });
  });
});
