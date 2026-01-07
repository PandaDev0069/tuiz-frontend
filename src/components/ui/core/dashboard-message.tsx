// ====================================================
// File Name   : dashboard-message.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-02
// Last Update : 2025-09-02
//
// Description:
// - Dashboard welcome message component
// - Displays welcome message to users
//
// Notes:
// - Client-only component (requires 'use client')
// ====================================================

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardMessageProps {
  className?: string;
}

/**
 * Component: DashboardMessage
 * Description:
 * - Dashboard welcome message component
 * - Displays welcome message and description
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement: The dashboard message component
 *
 * Example:
 * ```tsx
 * <DashboardMessage />
 * ```
 */
export const DashboardMessage: React.FC<DashboardMessageProps> = ({ className }) => {
  return (
    <div className={cn('w-full py-6', className)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-3">
            ようこそ、TUIZ情報王へ！
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            クイズを作成して、友達と共有しましょう。リアルタイムで楽しい学習体験を提供できます。
          </p>
        </div>
      </div>
    </div>
  );
};
