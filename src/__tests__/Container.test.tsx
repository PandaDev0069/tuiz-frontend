import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Container } from '@/ui';

describe('Container Component', () => {
  it('renders container with content', () => {
    render(<Container>Container content</Container>);
    expect(screen.getByText('Container content')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Container size="sm">Small Container</Container>);
    expect(screen.getByText('Small Container')).toBeInTheDocument();

    rerender(<Container size="md">Medium Container</Container>);
    expect(screen.getByText('Medium Container')).toBeInTheDocument();

    rerender(<Container size="xl">Extra Large Container</Container>);
    expect(screen.getByText('Extra Large Container')).toBeInTheDocument();

    rerender(<Container size="lg">Large Container</Container>);
    expect(screen.getByText('Large Container')).toBeInTheDocument();
  });

  it('renders container with default center alignment', () => {
    render(<Container>Centered Container</Container>);
    expect(screen.getByText('Centered Container')).toBeInTheDocument();
  });

  it('accepts additional className', () => {
    const { container } = render(<Container className="custom-container">Test</Container>);
    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('custom-container');
  });

  it('passes through HTML div attributes', () => {
    render(
      <Container id="main-container" data-testid="container">
        Content
      </Container>,
    );
    const containerElement = screen.getByTestId('container');
    expect(containerElement).toHaveAttribute('id', 'main-container');
  });

  it('supports complex nested content', () => {
    render(
      <Container size="xl">
        <div>
          <h2>Nested Title</h2>
          <p>Nested paragraph</p>
        </div>
      </Container>,
    );

    expect(screen.getByText('Nested Title')).toBeInTheDocument();
    expect(screen.getByText('Nested paragraph')).toBeInTheDocument();
  });
});
