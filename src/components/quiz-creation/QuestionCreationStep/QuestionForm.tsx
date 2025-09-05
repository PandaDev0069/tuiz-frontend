'use client';

import React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Label, Textarea } from '@/components/ui';
import { Upload, X, BookOpen, Lightbulb } from 'lucide-react';
import Image from 'next/image';
import { CreateQuestionForm, CreateAnswerForm, QuestionType } from '@/types/quiz';
import { QuestionControlPanel } from './QuestionControlPanel';
import { MultipleChoicePanel } from './MultipleChoicePanel';
import { TrueFalsePanel } from './TrueFalsePanel';

interface QuestionFormProps {
  question: CreateQuestionForm;
  selectedQuestionIndex: number;
  isUploading: boolean;
  isMobile: boolean;
  onQuestionFieldChange: (
    field: keyof CreateQuestionForm,
    value: string | number | boolean | CreateAnswerForm[] | undefined,
  ) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExplanationModalOpen: () => void;
  onAnswerImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  selectedQuestionIndex,
  isUploading,
  isMobile,
  onQuestionFieldChange,
  onImageUpload,
  onExplanationModalOpen,
  onAnswerImageUpload,
}) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
        <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            問題 {question?.order_index} の詳細
          </CardTitle>
          <p className="text-sm md:text-sm text-gray-600">選択された問題の詳細を編集してください</p>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="space-y-4 md:space-y-6">
            {/* Question Text and Image Upload - First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Question Text */}
              <div className="space-y-2">
                <Label
                  htmlFor={`question_text_${selectedQuestionIndex}`}
                  required
                  variant="primary"
                >
                  問題文
                </Label>
                <Textarea
                  id={`question_text_${selectedQuestionIndex}`}
                  name={`question_text_${selectedQuestionIndex}`}
                  placeholder="問題文を入力してください..."
                  value={question?.question_text || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    onQuestionFieldChange('question_text', e.target.value)
                  }
                  variant="primary"
                  className="h-[120px] border-2 border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor={`question_image_${selectedQuestionIndex}`} variant="primary">
                  問題画像（任意）
                </Label>
                <div className="space-y-4">
                  {question?.image_url ? (
                    <div className="relative h-[120px] overflow-hidden">
                      <Image
                        src={question.image_url}
                        alt="Question image"
                        width={300}
                        height={200}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => onQuestionFieldChange('image_url', undefined)}
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border-4 border-dashed border-lime-600 rounded-lg p-4 md:p-6 text-center cursor-pointer h-[120px] flex flex-col items-center justify-center"
                      onClick={() => {
                        if (!isUploading) {
                          document
                            .getElementById(`question_image_${selectedQuestionIndex}`)
                            ?.click();
                        }
                      }}
                    >
                      <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm md:text-sm text-gray-600 mb-2">画像をアップロード</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onImageUpload}
                        className="hidden"
                        id={`question_image_${selectedQuestionIndex}`}
                        name={`question_image_${selectedQuestionIndex}`}
                        disabled={isUploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isUploading) {
                            document
                              .getElementById(`question_image_${selectedQuestionIndex}`)
                              ?.click();
                          }
                        }}
                        disabled={isUploading}
                      >
                        {isUploading ? 'アップロード中...' : 'ファイルを選択'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Explanation Button - Below Image Upload */}
            <div className="flex justify-center mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onExplanationModalOpen}
                className={`border-2 border-purple-500 bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 ${
                  isMobile ? 'w-full py-3' : 'px-6 py-2'
                }`}
              >
                <Lightbulb className={`${isMobile ? 'w-5 h-5 mr-2' : 'w-4 h-4 mr-2'}`} />
                <span className={`${isMobile ? 'text-base' : 'text-sm'}`}>
                  解説を追加 {question?.explanation_title && '(設定済み)'}
                </span>
              </Button>
            </div>

            {/* Question Control Panel - Below Explanation Button */}
            <div className="mt-4">
              <QuestionControlPanel
                question={question}
                onQuestionChange={onQuestionFieldChange}
                isMobile={isMobile}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multiple Choice Panel - Only show for multiple choice questions */}
      {question?.question_type === QuestionType.MULTIPLE_CHOICE && (
        <MultipleChoicePanel
          answers={question.answers || []}
          isMobile={isMobile}
          isUploading={isUploading}
          onAnswersChange={(answers) => onQuestionFieldChange('answers', answers)}
          onImageUpload={onAnswerImageUpload}
        />
      )}

      {/* True/False Panel - Only show for true/false questions */}
      {question?.question_type === QuestionType.TRUE_FALSE && (
        <TrueFalsePanel
          answers={question.answers || []}
          isMobile={isMobile}
          onAnswersChange={(answers) => onQuestionFieldChange('answers', answers)}
        />
      )}
    </div>
  );
};
