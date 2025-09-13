'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { Loader2 } from 'lucide-react';

interface QuestionNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  canProceed: boolean;
  validationErrors: string[];
  isLoading?: boolean;
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  onPrevious,
  onNext,
  canProceed,
  validationErrors,
  isLoading = false,
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
        disabled={!canProceed || isLoading}
        className={`px-6 md:px-8 text-sm md:text-base ${
          !canProceed || isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={!canProceed ? 'すべての問題を完成させてください' : ''}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            保存中...
          </>
        ) : (
          <>
            次へ進む
            {!canProceed && validationErrors.length > 0 && (
              <span className="ml-2 text-xs">({validationErrors.length}個のエラー)</span>
            )}
          </>
        )}
      </Button>
    </div>
  );
};
