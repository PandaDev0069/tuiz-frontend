'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { HelpCircle, Plus, ChevronUp, ChevronDown, Copy, Trash2 } from 'lucide-react';
import { CreateQuestionForm } from '@/types/quiz';

interface QuestionListProps {
  questions: CreateQuestionForm[];
  selectedQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  onAddQuestion: () => void;
  onMoveQuestion: (direction: 'up' | 'down') => void;
  onCopyQuestion: () => void;
  onDeleteQuestion: () => void;
  isMobile: boolean;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  selectedQuestionIndex,
  onQuestionSelect,
  onAddQuestion,
  onMoveQuestion,
  onCopyQuestion,
  onDeleteQuestion,
  isMobile,
}) => {
  return (
    <div className="space-y-4">
      {/* Questions List - Compact Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 sm:gap-2">
        {questions.map((question: CreateQuestionForm, index: number) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all duration-200 ${
              selectedQuestionIndex === index
                ? 'bg-gradient-to-br from-lime-400 to-lime-500 border-lime-600 shadow-md ring-1 ring-lime-400'
                : 'bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-sm hover:shadow-md'
            }`}
            onClick={() => onQuestionSelect(index)}
          >
            <CardHeader className="pb-0 px-1 sm:px-2 py-1">
              <CardTitle className="text-sm pl-1">問題 {question.order_index}</CardTitle>
            </CardHeader>
            <CardContent className="px-1 sm:px-2 pb-1 pt-0">
              <div className="text-center">
                {question.question_text ? (
                  <p className="text-gray-700 text-xs font-medium line-clamp-1">
                    {question.question_text}
                  </p>
                ) : (
                  <div className="flex flex-col items-center">
                    <HelpCircle className="w-3 h-3 text-gray-400 mb-0" />
                    <p className="text-gray-500 text-xs">準備中</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Question Button - Compact */}
        <Card
          className="border-2 border-dashed border-lime-600 bg-lime-100 hover:bg-lime-50 cursor-pointer transition-colors"
          onClick={onAddQuestion}
        >
          <CardContent className="flex flex-col items-center justify-center py-2 px-1 sm:px-2">
            <Plus className="w-4 h-4 text-lime-600 mb-0" />
            <p className="text-lime-700 font-medium text-xs text-center">追加</p>
          </CardContent>
        </Card>
      </div>

      {/* Question Management Buttons - Mobile Optimized */}
      {questions.length > 0 && (
        <div className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 rounded-lg p-2 sm:p-3 border">
          <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 text-center">
            問題 {questions[selectedQuestionIndex]?.order_index} が選択中
          </h3>

          {/* Conditional Layout Based on Screen Size */}
          {isMobile ? (
            /* Mobile Layout - 2x2 Grid */
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onMoveQuestion('up')}
                disabled={selectedQuestionIndex === 0}
                className="p-2 h-8 border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
              >
                <ChevronUp className="w-3 h-3 mr-1" />
                <span className="text-xs">上へ</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onMoveQuestion('down')}
                disabled={selectedQuestionIndex === questions.length - 1}
                className="p-2 h-8 border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
              >
                <ChevronDown className="w-3 h-3 mr-1" />
                <span className="text-xs">下へ</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCopyQuestion}
                className="p-2 h-8 border-2 border-green-500 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800"
              >
                <Copy className="w-3 h-3 mr-1" />
                <span className="text-xs">複製</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDeleteQuestion}
                disabled={questions.length <= 1}
                className="p-2 h-8 border-2 border-red-500 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                <span className="text-xs">削除</span>
              </Button>
            </div>
          ) : (
            /* Desktop Layout - Horizontal Row */
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onMoveQuestion('up')}
                  disabled={selectedQuestionIndex === 0}
                  className="p-2 h-9 border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
                >
                  <ChevronUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">上へ</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onMoveQuestion('down')}
                  disabled={selectedQuestionIndex === questions.length - 1}
                  className="p-2 h-9 border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
                >
                  <ChevronDown className="w-4 h-4 mr-1" />
                  <span className="text-sm">下へ</span>
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCopyQuestion}
                className="p-2 h-9 border-2 border-green-500 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800"
              >
                <Copy className="w-4 h-4 mr-1" />
                <span className="text-sm">複製</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDeleteQuestion}
                disabled={questions.length <= 1}
                className="p-2 h-9 border-2 border-red-500 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                <span className="text-sm">削除</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
