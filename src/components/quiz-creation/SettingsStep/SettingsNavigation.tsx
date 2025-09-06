'use client';

import React from 'react';
import { Button } from '@/components/ui';

interface SettingsNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  isMobile: boolean;
}

export const SettingsNavigation: React.FC<SettingsNavigationProps> = ({ onPrevious, onNext }) => {
  return (
    <div className="flex justify-between pt-4 md:pt-6">
      <Button
        variant="gradient2"
        onClick={onPrevious}
        className="px-6 md:px-8 text-sm md:text-base"
      >
        前へ戻る
      </Button>
      <Button variant="gradient2" onClick={onNext} className="px-6 md:px-8 text-sm md:text-base">
        次へ進む
      </Button>
    </div>
  );
};
