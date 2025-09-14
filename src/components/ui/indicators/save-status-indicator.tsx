// src/components/ui/indicators/save-status-indicator.tsx
// Component to display save status during editing

import React from 'react';
import { CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import { SaveStatus } from '@/hooks/useEditSave';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
  className?: string;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  lastSaved,
  className = '',
}) => {
  const getStatusContent = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">保存中...</span>
          </div>
        );

      case 'saved':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              保存済み
              {lastSaved && (
                <span className="text-xs text-gray-500 ml-1">
                  (
                  {lastSaved.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  )
                </span>
              )}
            </span>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">保存エラー</span>
          </div>
        );

      case 'idle':
      default:
        return (
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">未保存</span>
          </div>
        );
    }
  };

  return <div className={`inline-flex items-center ${className}`}>{getStatusContent()}</div>;
};
