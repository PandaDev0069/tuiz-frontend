'use client';

import React from 'react';

interface QuestionHeaderProps {
  isMobile?: boolean;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = () => {
  return (
    <div className="text-center mb-4 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">問題を作成</h2>
      <p className="text-sm md:text-base text-gray-600">クイズの問題と選択肢を設定してください</p>
    </div>
  );
};
