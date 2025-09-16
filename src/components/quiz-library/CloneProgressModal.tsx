'use client';

import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { Loader2, Copy, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CloneProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloneStatus: 'idle' | 'cloning' | 'success' | 'error';
  originalQuizTitle?: string;
  clonedQuizId?: string;
  error?: string;
  onEditClonedQuiz?: () => void;
  onViewMyLibrary?: () => void;
}

export const CloneProgressModal: React.FC<CloneProgressModalProps> = ({
  isOpen,
  onClose,
  cloneStatus,
  originalQuizTitle,
  error,
  onEditClonedQuiz,
  onViewMyLibrary,
}) => {
  if (!isOpen) return null;

  const getStatusConfig = () => {
    switch (cloneStatus) {
      case 'cloning':
        return {
          icon: <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />,
          title: 'クイズをクローンしています...',
          description: 'しばらくお待ちください',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          title: 'クローン完了！',
          description: `「${originalQuizTitle}」をライブラリに追加しました`,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'error':
        return {
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          title: 'クローンに失敗しました',
          description: error || 'もう一度お試しください',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: <Copy className="w-12 h-12 text-gray-500" />,
          title: 'クイズクローン',
          description: '',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className={cn('w-full max-w-md mx-4 border-2', config.bgColor, config.borderColor)}>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            {config.icon}

            <div className="space-y-2">
              <CardTitle className="text-xl font-bold">{config.title}</CardTitle>
              {config.description && <p className="text-gray-600 text-sm">{config.description}</p>}
            </div>

            {cloneStatus === 'success' && (
              <div className="flex flex-col gap-2 w-full">
                <Button variant="gradient" onClick={onEditClonedQuiz} className="w-full">
                  クローンしたクイズを編集
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onViewMyLibrary} className="flex-1">
                    ライブラリで確認
                  </Button>
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    閉じる
                  </Button>
                </div>
              </div>
            )}

            {cloneStatus === 'error' && (
              <div className="flex gap-2 w-full">
                <Button variant="outline" onClick={onClose} className="w-full">
                  閉じる
                </Button>
              </div>
            )}

            {cloneStatus === 'cloning' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
