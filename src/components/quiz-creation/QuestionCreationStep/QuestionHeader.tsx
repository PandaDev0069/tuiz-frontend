// ====================================================
// File Name   : QuestionHeader.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-04
// Last Update : 2025-09-04
//
// Description:
// - Header component for question creation step
// - Displays title and description for the question creation section
// - Implements responsive design for mobile and desktop
//
// Notes:
// - Client-only component (requires 'use client')
// - Simple presentational component
// ====================================================

'use client';

import React from 'react';

interface QuestionHeaderProps {
  isMobile?: boolean;
}

/**
 * Component: QuestionHeader
 * Description:
 * - Renders header section for question creation
 * - Displays title and description text
 * - Implements responsive typography and spacing
 *
 * Parameters:
 * - isMobile (boolean, optional): Whether device is mobile (currently unused)
 *
 * Returns:
 * - React.ReactElement: The question header component
 *
 * Example:
 * ```tsx
 * <QuestionHeader isMobile={false} />
 * ```
 */
export const QuestionHeader: React.FC<QuestionHeaderProps> = () => {
  return (
    <div className="text-center mb-4 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">問題を作成</h2>
      <p className="text-sm md:text-base text-gray-600">クイズの問題と選択肢を設定してください</p>
    </div>
  );
};
