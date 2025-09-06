'use client';

import React from 'react';
import { Button } from '@/components/ui';

interface QuestionNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  canProceed: boolean;
  validationErrors: string[];
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  onPrevious,
  onNext,
  canProceed,
  validationErrors,
}) => {
  return (
    <div className="flex justify-between pt-4 md:pt-6">
      <Button
        variant="gradient2"
        onClick={onPrevious}
        className="px-6 md:px-8 text-sm md:text-base"
      >
        前へ戻る
      </Button>
      <Button
        variant="gradient2"
        onClick={onNext}
        disabled={!canProceed}
        className={`px-6 md:px-8 text-sm md:text-base ${
          !canProceed ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={!canProceed ? 'すべての問題を完成させてください' : ''}
      >
        次へ進む
        {!canProceed && validationErrors.length > 0 && (
          <span className="ml-2 text-xs">({validationErrors.length}個のエラー)</span>
        )}
      </Button>
    </div>
  );
};
