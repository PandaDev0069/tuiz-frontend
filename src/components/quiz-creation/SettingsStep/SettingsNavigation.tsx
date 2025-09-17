'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { Loader2 } from 'lucide-react';

interface SettingsNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  isMobile: boolean;
  isLoading?: boolean;
}

export const SettingsNavigation: React.FC<SettingsNavigationProps> = ({
  onPrevious,
  onNext,
  isLoading = false,
}) => {
  return (
    <div className="flex justify-between pt-4 md:pt-6">
      <Button
        variant="gradient2"
        onClick={onPrevious}
        disabled={isLoading}
        className="px-6 md:px-8 text-sm md:text-base"
      >
        前へ戻る
      </Button>
      <Button
        variant="gradient2"
        onClick={onNext}
        disabled={isLoading}
        className="px-6 md:px-8 text-sm md:text-base flex items-center gap-2"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? '保存中...' : '次へ進む'}
      </Button>
    </div>
  );
};
