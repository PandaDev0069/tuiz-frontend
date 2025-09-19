'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Plus } from 'lucide-react';

interface RightPanelProps {
  className?: string;
}

export const RightPanel: React.FC<RightPanelProps> = ({ className = '' }) => {
  return (
    <Card
      className={`bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg flex flex-col h-full ${className}`}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="w-5 h-5 text-purple-600" />
          追加パネル
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center">
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-sm">将来の機能用のスペース</p>
          <p className="text-xs text-gray-400 mt-1">ここに追加の機能や情報を表示できます</p>
        </div>
      </CardContent>
    </Card>
  );
};
