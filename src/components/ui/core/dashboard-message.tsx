'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardMessageProps {
  className?: string;
}

export const DashboardMessage: React.FC<DashboardMessageProps> = ({ className }) => {
  return (
    <div className={cn('w-full py-6', className)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Message */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-3">
            ようこそ、TUIZ情報王へ！
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            クイズを作成して、学習者と共有しましょう。リアルタイムで楽しい学習体験を提供できます。
          </p>

          {/* Quick Stats */}
          <div className="flex justify-center items-center space-x-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">0</div>
              <div className="text-sm text-gray-500">作成済みクイズ</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-500">下書きクイズ</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-500">総プレイ回数</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
