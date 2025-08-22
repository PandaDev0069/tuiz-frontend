import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Flex } from '@/components/ui';

describe('Flex Component', () => {
  it('renders flex container with content', () => {
    render(
      <Flex>
        <div>Item 1</div>
        <div>Item 2</div>
      </Flex>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders with different direction values', () => {
    const { rerender } = render(<Flex direction="col">Column</Flex>);
    expect(screen.getByText('Column')).toBeInTheDocument();

    rerender(<Flex direction="row-reverse">Row Reverse</Flex>);
    expect(screen.getByText('Row Reverse')).toBeInTheDocument();
  });

  it('renders with different justify values', () => {
    const { rerender } = render(<Flex justify="center">Center</Flex>);
    expect(screen.getByText('Center')).toBeInTheDocument();

    rerender(<Flex justify="between">Between</Flex>);
    expect(screen.getByText('Between')).toBeInTheDocument();

    rerender(<Flex justify="end">End</Flex>);
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  it('renders with different align values', () => {
    const { rerender } = render(<Flex align="center">Center</Flex>);
    expect(screen.getByText('Center')).toBeInTheDocument();

    rerender(<Flex align="end">End</Flex>);
    expect(screen.getByText('End')).toBeInTheDocument();

    rerender(<Flex align="stretch">Stretch</Flex>);
    expect(screen.getByText('Stretch')).toBeInTheDocument();
  });

  it('renders with different wrap values', () => {
    const { rerender } = render(<Flex wrap="wrap">Wrap</Flex>);
    expect(screen.getByText('Wrap')).toBeInTheDocument();

    rerender(<Flex wrap="wrap-reverse">Wrap Reverse</Flex>);
    expect(screen.getByText('Wrap Reverse')).toBeInTheDocument();
  });

  it('renders with different gap values', () => {
    const { rerender } = render(<Flex gap={4}>Gap 4</Flex>);
    expect(screen.getByText('Gap 4')).toBeInTheDocument();

    rerender(<Flex gap={8}>Gap 8</Flex>);
    expect(screen.getByText('Gap 8')).toBeInTheDocument();
  });

  it('renders without grow and shrink properties', () => {
    render(<Flex>Basic Flex Container</Flex>);
    expect(screen.getByText('Basic Flex Container')).toBeInTheDocument();
  });

  it('accepts additional className', () => {
    const { container } = render(<Flex className="custom-flex">Test</Flex>);
    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement).toHaveClass('custom-flex');
  });

  it('passes through HTML div attributes', () => {
    render(
      <Flex id="flex-container" data-testid="flex">
        Content
      </Flex>,
    );
    const flexElement = screen.getByTestId('flex');
    expect(flexElement).toHaveAttribute('id', 'flex-container');
  });

  it('supports complex prop combinations', () => {
    render(
      <Flex
        direction="col"
        align="center"
        justify="between"
        gap={8}
        wrap="wrap"
        className="complex-flex"
      >
        Complex Flex
      </Flex>,
    );
    expect(screen.getByText('Complex Flex')).toBeInTheDocument();
  });
});
