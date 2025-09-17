'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { Text } from '@/components/ui/core/typography';
import { X, Eye, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizSet, QuestionWithAnswers } from '@/types/quiz';
import { PreviewQuizOverview } from './PreviewQuizOverview';
import { PreviewQuizQuestions } from './PreviewQuizQuestions';
import { PreviewQuizSettings } from './PreviewQuizSettings';

interface PreviewQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizSet | null;
  questions: QuestionWithAnswers[];
  isLoading?: boolean;
  error?: string;
  onCloneQuiz?: (quizId: string) => void;
  onStartQuiz?: (quizId: string) => void;
  isCloning?: boolean;
}

export const PreviewQuizModal: React.FC<PreviewQuizModalProps> = ({
  isOpen,
  onClose,
  quiz,
  questions,
  isLoading = false,
  error,
  onCloneQuiz,
  isCloning = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'settings'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden  rounded-3xl">
        <CardHeader className="bg-gradient-to-br from-blue-700 via-blue-800 to-teal-800 text-white border-0 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 m-2 bg-white/20 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-white">クイズプレビュー</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 m-3 bg-gradient-to-br from-red-200 to-pink-300 hover:from-red-300 hover:to-pink-400 text-red-700 hover:text-red-800 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            {(['overview', 'questions', 'settings'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 transition-all duration-200 rounded-xl border-2',
                  activeTab === tab
                    ? 'bg-white text-blue-700 shadow-lg font-semibold border-white'
                    : 'text-white hover:bg-white/20 rounded-xl border-white/30 hover:border-white/50',
                )}
              >
                {tab === 'overview' && '概要'}
                {tab === 'questions' && '問題'}
                {tab === 'settings' && '設定'}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[60vh] p-6 bg-gradient-to-br from-purple-50 via-pink-25 to-orange-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <Text className="ml-3 text-gray-600">読み込み中...</Text>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <Text className="text-red-700 font-medium">{error}</Text>
              </div>
              <Button variant="destructive" onClick={onClose}>
                閉じる
              </Button>
            </div>
          ) : !quiz ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-6xl mb-4">🔍</div>
                <Text className="text-gray-500">クイズが見つかりません</Text>
              </div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && <PreviewQuizOverview quiz={quiz} />}

              {/* Questions Tab */}
              {activeTab === 'questions' && <PreviewQuizQuestions questions={questions} />}

              {/* Settings Tab */}
              {activeTab === 'settings' && <PreviewQuizSettings quiz={quiz} />}
            </>
          )}
        </CardContent>

        {/* Footer Actions */}
        {quiz && !isLoading && !error && (
          <div className="border-t border-gray-200 p-6 bg-gradient-to-br from-blue-700 via-blue-800 to-teal-800 rounded-b-3xl">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                閉じる
              </Button>
              {onCloneQuiz && (
                <Button
                  variant="default"
                  onClick={() => onCloneQuiz(quiz.id)}
                  disabled={isCloning}
                  size="sm"
                  className="bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50"
                >
                  {isCloning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      クローン中...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      クローン
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
