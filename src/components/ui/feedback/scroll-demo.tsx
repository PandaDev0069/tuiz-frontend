'use client';

import * as React from 'react';
import { ScrollArea, ScrollIndicator } from './scroll-area';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';

export const ScrollDemo: React.FC = () => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [scrollVariant, setScrollVariant] = React.useState<'default' | 'thin' | 'hidden'>(
    'default',
  );
  const [showIndicator, setShowIndicator] = React.useState(false);
  const [utilityClass, setUtilityClass] = React.useState('');

  // Generate demo content
  const generateContent = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Demo Item ${i + 1}`,
      description: `This is a demo item with some content to showcase the custom scrollbar. Item number ${i + 1} contains interesting information about scrolling behavior and visual feedback.`,
      category: ['Feature', 'Demo', 'UI', 'Component'][i % 4],
    }));

  const demoItems = generateContent(50);

  // Simple scroll functions
  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const scrollToMiddle = () => {
    if (scrollRef.current) {
      const target = scrollRef.current.querySelector('.scroll-target');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Custom Scrollbar Demo
            <div className="flex gap-2 flex-wrap">
              <Badge variant={scrollVariant === 'default' ? 'default' : 'outline'}>
                {scrollVariant}
              </Badge>
              {utilityClass && <Badge variant="secondary">{utilityClass}</Badge>}
              {showIndicator && <Badge variant="success">Indicator On</Badge>}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Scrollbar Style Controls */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button
                variant={scrollVariant === 'default' && !utilityClass ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setScrollVariant('default');
                  setUtilityClass('');
                }}
              >
                Default
              </Button>
              <Button
                variant={scrollVariant === 'thin' && !utilityClass ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setScrollVariant('thin');
                  setUtilityClass('');
                }}
              >
                Thin
              </Button>
              <Button
                variant={scrollVariant === 'hidden' && !utilityClass ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setScrollVariant('hidden');
                  setUtilityClass('');
                }}
              >
                Hidden
              </Button>
              <Button
                variant={utilityClass === 'scrollbar-glow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setScrollVariant('default');
                  setUtilityClass('scrollbar-glow');
                }}
              >
                Glow Effect
              </Button>
              <Button
                variant={utilityClass === 'scrollbar-wide' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setScrollVariant('default');
                  setUtilityClass('scrollbar-wide');
                }}
              >
                Wide
              </Button>
              <Button
                variant={utilityClass === 'scrollbar-auto-hide' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setScrollVariant('default');
                  setUtilityClass('scrollbar-auto-hide');
                }}
              >
                Auto-hide
              </Button>
            </div>

            {/* Additional Controls */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={showIndicator ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowIndicator(!showIndicator)}
              >
                Toggle Indicator
              </Button>
              <Button variant="outline" size="sm" onClick={scrollToTop}>
                Scroll to Top
              </Button>
              <Button variant="outline" size="sm" onClick={scrollToMiddle}>
                Scroll to Middle
              </Button>
              <Button variant="outline" size="sm" onClick={scrollToBottom}>
                Scroll to Bottom
              </Button>
            </div>

            {/* Scrollable Content Area */}
            <div className="relative">
              <ScrollArea
                ref={scrollRef}
                variant={scrollVariant}
                className={`h-96 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 ${utilityClass}`}
              >
                <div className="space-y-4">
                  {demoItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`p-4 bg-white/20 rounded-lg border border-white/30 hover:bg-white/30 transition-colors ${
                        index === 25 ? 'scroll-target' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{item.title}</h3>
                        <Badge variant="secondary" size="sm">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {item.description}
                        {index === 25 && ' 🎯 This is the scroll target!'}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Scroll Indicator */}
              {showIndicator && <ScrollIndicator target={scrollRef} />}
            </div>

            {/* Horizontal Scroll Demo */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Horizontal Scroll Example</h3>
              <ScrollArea
                orientation="horizontal"
                variant={scrollVariant}
                className="w-full p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
              >
                <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
                  {Array.from({ length: 20 }, (_, i) => (
                    <Card key={i} className="flex-shrink-0 w-64">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Horizontal Card {i + 1}</h4>
                        <p className="text-sm text-gray-600">
                          This card demonstrates horizontal scrolling with custom scrollbars.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Description */}
      <Card>
        <CardHeader>
          <CardTitle>Scrollbar Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Styling Features:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Custom gradient colors matching theme</li>
                <li>• Smooth hover animations</li>
                <li>• Dark mode support</li>
                <li>• Multiple variants (default, thin, hidden)</li>
                <li>• Cross-browser compatibility</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Interactive Elements:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Scroll progress indicator</li>
                <li>• Hover effects on scrollbar thumb</li>
                <li>• Orientation support (vertical/horizontal)</li>
                <li>• Customizable through CSS classes</li>
                <li>• React component wrapper for consistency</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrollDemo;
