import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Heading, Text } from '@/ui';

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

    it('renders gradient text when gradient prop is true', () => {
      render(<Heading gradient>Gradient Heading</Heading>);
      expect(screen.getByText('Gradient Heading')).toBeInTheDocument();
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

    it('renders with different text elements', () => {
      const { rerender } = render(<Text as="span">Span Text</Text>);
      let text = screen.getByText('Span Text');
      expect(text.tagName).toBe('SPAN');

      rerender(<Text as="div">Div Text</Text>);
      text = screen.getByText('Div Text');
      expect(text.tagName).toBe('DIV');

      rerender(<Text as="small">Small Text</Text>);
      text = screen.getByText('Small Text');
      expect(text.tagName).toBe('SMALL');
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

    it('renders gradient text when gradient prop is true', () => {
      render(<Text gradient>Gradient Text</Text>);
      expect(screen.getByText('Gradient Text')).toBeInTheDocument();
    });

    it('accepts additional className', () => {
      const { container } = render(<Text className="custom-text">Test</Text>);
      const text = container.firstChild as HTMLElement;
      expect(text).toHaveClass('custom-text');
    });

    it('renders with different color variants', () => {
      const { rerender } = render(<Text color="success">Success Text</Text>);
      expect(screen.getByText('Success Text')).toBeInTheDocument();

      rerender(<Text color="warning">Warning Text</Text>);
      expect(screen.getByText('Warning Text')).toBeInTheDocument();

      rerender(<Text color="error">Error Text</Text>);
      expect(screen.getByText('Error Text')).toBeInTheDocument();
    });
  });
});
