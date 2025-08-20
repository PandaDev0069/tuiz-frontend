# Custom Scrollbar System

This project includes a comprehensive custom scrollbar system that provides consistent, beautiful scrollbars across all browsers while maintaining accessibility and performance.

## Features

- **Beautiful Design**: Matches the project's gradient theme (#BFF098 → #6FD6FF)
- **Cross-browser Support**: Works in Webkit (Chrome, Safari, Edge) and Firefox
- **Multiple Variants**: Default, thin, wide, hidden, glow effects, and more
- **React Components**: Easy-to-use components for consistent implementation
- **Utility Classes**: CSS classes for quick styling
- **Custom Hooks**: React hooks for advanced scroll interactions
- **Accessibility**: Maintains keyboard navigation and screen reader compatibility

## Quick Start

### Basic Usage

```tsx
import { ScrollArea } from '@/ui';

function MyComponent() {
  return (
    <ScrollArea variant="default" className="h-96">
      {/* Your scrollable content */}
    </ScrollArea>
  );
}
```

### With Scroll Indicator

```tsx
import { ScrollArea, ScrollIndicator } from '@/ui';

function MyComponent() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <ScrollArea ref={scrollRef} className="h-96">
        {/* Your content */}
      </ScrollArea>
      <ScrollIndicator target={scrollRef} />
    </div>
  );
}
```

## Components

### ScrollArea

The main scroll container component with customizable variants.

**Props:**

- `variant`: 'default' | 'thin' | 'hidden'
- `orientation`: 'vertical' | 'horizontal' | 'both'
- `children`: React.ReactNode

### ScrollIndicator

Visual progress indicator for scroll position.

**Props:**

- `target`: React.RefObject<HTMLElement | null>
- `orientation`: 'vertical' | 'horizontal'
- `className`: string (optional)

## Utility Classes

Add these classes to any scrollable element for instant custom styling:

### Basic Variants

- `.scrollbar-none` - Hide scrollbars completely
- `.scrollbar-thin` - Thin 6px scrollbars
- `.scrollbar-wide` - Wide 16px scrollbars

### Visual Effects

- `.scrollbar-glow` - Glowing scrollbar with shadow effects
- `.scrollbar-auto-hide` - Show scrollbars only on hover
- `.scrollbar-overlay` - Floating scrollbars over content

### Shape Variants

- `.scrollbar-square` - Square corners
- `.scrollbar-rounded` - Rounded corners
- `.scrollbar-pill` - Fully rounded (pill-shaped)

### Color Variants

- `.scrollbar-primary` - Uses primary theme colors
- `.scrollbar-secondary` - Uses secondary theme colors
- `.scrollbar-accent` - Uses accent theme colors

## Advanced Usage

### Custom Styling

You can override scrollbar styles by targeting webkit pseudo-elements:

```css
.my-custom-scrollbar::-webkit-scrollbar {
  width: 10px;
}

.my-custom-scrollbar::-webkit-scrollbar-thumb {
  background: your-custom-gradient;
  border-radius: 5px;
}
```

### React Hooks

```tsx
import { useScroll, useScrollTo } from '@/lib/useScroll';

function AdvancedScrollComponent() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollState = useScroll(scrollRef.current);
  const { scrollTo, scrollToTop } = useScrollTo();

  return (
    <div>
      <p>Scroll Progress: {scrollState.progress.vertical}%</p>
      <button onClick={() => scrollToTop()}>Top</button>
      <div ref={scrollRef} className="h-96 overflow-auto">
        {/* Content */}
      </div>
    </div>
  );
}
```

## Browser Support

- **Chrome/Edge**: Full support with webkit scrollbars
- **Firefox**: Supported via `scrollbar-width` and `scrollbar-color`
- **Safari**: Full support with webkit scrollbars
- **Mobile**: Native scrollbar behavior maintained for touch interactions

## Dark Mode

The scrollbar automatically adapts to dark mode:

```css
.dark ::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}
```

## Performance Considerations

- Scrollbar styles use hardware acceleration where possible
- Hover effects are optimized with CSS transitions
- React components use proper memoization and ref forwarding

## Examples

Check out the ScrollDemo component (`/src/components/ui/scroll-demo.tsx`) for a comprehensive showcase of all features and variants.

## Customization

The scrollbar system is built to match your project's design tokens. Main colors are defined in:

- `src/styles/tokens.css` - Design system colors
- `src/styles/scrollbar.css` - Scrollbar-specific utilities
- `src/styles/globals.css` - Global scrollbar styles

## Accessibility

- Maintains native keyboard navigation (arrow keys, page up/down)
- Screen readers can still access scrollable content
- Focus indicators work properly with custom scrollbars
- Touch scrolling preserved on mobile devices
