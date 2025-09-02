'use client';

import React, { useState } from 'react';
import {
  CreateQuestionForm,
  CreateAnswerForm,
  FormErrors,
  QuestionType,
  DifficultyLevel,
} from '@/types/quiz';
import {
  HelpCircle,
  Plus,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Upload,
  X,
  BookOpen,
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Label, Textarea } from '@/components/ui';
import Image from 'next/image';

interface QuestionCreationStepProps {
  questions: CreateQuestionForm[];
  onQuestionsChange: (questions: CreateQuestionForm[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  errors?: FormErrors<CreateQuestionForm>[];
}

export const QuestionCreationStep: React.FC<QuestionCreationStepProps> = ({
  questions,
  onQuestionsChange,
  onNext,
  onPrevious,
}) => {
  // Initialize with one blank question if none exist
  const [localQuestions, setLocalQuestions] = useState<CreateQuestionForm[]>(
    questions.length > 0 ? questions : [createBlankQuestion(1)],
  );
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Update local state when questions prop changes
  React.useEffect(() => {
    if (questions.length > 0) {
      setLocalQuestions(questions);
    }
  }, [questions]);

  // Handle screen size detection
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  function createBlankQuestion(orderIndex: number): CreateQuestionForm {
    return {
      question_text: '',
      question_type: QuestionType.MULTIPLE_CHOICE,
      time_limit: 30,
      points: 1,
      difficulty: DifficultyLevel.EASY,
      order_index: orderIndex,
      answers: [
        { answer_text: '', is_correct: true, order_index: 1 },
        { answer_text: '', is_correct: false, order_index: 2 },
      ],
    };
  }

  const handleAddQuestion = () => {
    const newQuestion = createBlankQuestion(localQuestions.length + 1);
    const updatedQuestions = [...localQuestions, newQuestion];
    setLocalQuestions(updatedQuestions);
    setSelectedQuestionIndex(updatedQuestions.length - 1); // Select the new question
    onQuestionsChange(updatedQuestions);
  };

  const handleMoveQuestion = (direction: 'up' | 'down') => {
    const index = selectedQuestionIndex;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localQuestions.length) return;

    const updatedQuestions = [...localQuestions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [
      updatedQuestions[newIndex],
      updatedQuestions[index],
    ];

    // Update order_index for all questions
    updatedQuestions.forEach((q, i) => {
      q.order_index = i + 1;
    });

    setLocalQuestions(updatedQuestions);
    setSelectedQuestionIndex(newIndex); // Update selected index to follow the moved question
    onQuestionsChange(updatedQuestions);
  };

  const handleCopyQuestion = () => {
    const index = selectedQuestionIndex;
    const questionToCopy = { ...localQuestions[index] };
    const newQuestion = {
      ...questionToCopy,
      question_text: `${questionToCopy.question_text} (コピー)`,
      order_index: localQuestions.length + 1,
      answers: questionToCopy.answers.map((answer: CreateAnswerForm, i: number) => ({
        ...answer,
        order_index: i + 1,
      })),
    };

    const updatedQuestions = [...localQuestions, newQuestion];
    setLocalQuestions(updatedQuestions);
    setSelectedQuestionIndex(updatedQuestions.length - 1); // Select the copied question
    onQuestionsChange(updatedQuestions);
  };

  const handleDeleteQuestion = () => {
    const index = selectedQuestionIndex;
    if (localQuestions.length <= 1) return; // Keep at least 1 question

    const updatedQuestions = localQuestions.filter(
      (_: CreateQuestionForm, i: number) => i !== index,
    );

    // Update order_index for remaining questions
    updatedQuestions.forEach((q: CreateQuestionForm, i: number) => {
      q.order_index = i + 1;
    });

    // Adjust selected index if needed
    const newSelectedIndex = index >= updatedQuestions.length ? updatedQuestions.length - 1 : index;
    setSelectedQuestionIndex(newSelectedIndex);

    setLocalQuestions(updatedQuestions);
    onQuestionsChange(updatedQuestions);
  };

  const handleQuestionFieldChange = (
    field: keyof CreateQuestionForm,
    value: string | number | boolean | undefined,
  ) => {
    const updatedQuestions = [...localQuestions];
    updatedQuestions[selectedQuestionIndex] = {
      ...updatedQuestions[selectedQuestionIndex],
      [field]: value,
    };
    setLocalQuestions(updatedQuestions);
    onQuestionsChange(updatedQuestions);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload logic
      // For now, we'll simulate the upload
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUrl = URL.createObjectURL(file);
      handleQuestionFieldChange('image_url', mockUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="text-center mb-4 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">問題を作成</h2>
        <p className="text-sm md:text-base text-gray-600">クイズの問題と選択肢を設定してください</p>
      </div>

      {/* Question Adding Panel */}
      <div className="space-y-4">
        {/* Questions List - Compact Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 sm:gap-2">
          {localQuestions.map((question: CreateQuestionForm, index: number) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all duration-200 ${
                selectedQuestionIndex === index
                  ? 'bg-gradient-to-br from-lime-400 to-lime-500 border-lime-600 shadow-md ring-1 ring-lime-400'
                  : 'bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-sm hover:shadow-md'
              }`}
              onClick={() => setSelectedQuestionIndex(index)}
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
            onClick={handleAddQuestion}
          >
            <CardContent className="flex flex-col items-center justify-center py-2 px-1 sm:px-2">
              <Plus className="w-4 h-4 text-lime-600 mb-0" />
              <p className="text-lime-700 font-medium text-xs text-center">追加</p>
            </CardContent>
          </Card>
        </div>

        {/* Question Management Buttons - Mobile Optimized */}
        {localQuestions.length > 0 && (
          <div className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 rounded-lg p-2 sm:p-3 border">
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 text-center">
              問題 {localQuestions[selectedQuestionIndex]?.order_index} が選択中
            </h3>

            {/* Conditional Layout Based on Screen Size */}
            {isMobile ? (
              /* Mobile Layout - 2x2 Grid */
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveQuestion('up')}
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
                  onClick={() => handleMoveQuestion('down')}
                  disabled={selectedQuestionIndex === localQuestions.length - 1}
                  className="p-2 h-8 border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
                >
                  <ChevronDown className="w-3 h-3 mr-1" />
                  <span className="text-xs">下へ</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyQuestion}
                  className="p-2 h-8 border-2 border-green-500 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  <span className="text-xs">複製</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteQuestion}
                  disabled={localQuestions.length <= 1}
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
                    onClick={() => handleMoveQuestion('up')}
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
                    onClick={() => handleMoveQuestion('down')}
                    disabled={selectedQuestionIndex === localQuestions.length - 1}
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
                  onClick={handleCopyQuestion}
                  className="p-2 h-9 border-2 border-green-500 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  <span className="text-sm">複製</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteQuestion}
                  disabled={localQuestions.length <= 1}
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

      {/* Question Form */}
      {localQuestions.length > 0 && (
        <div className="space-y-4 md:space-y-6">
          <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
            <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                問題 {localQuestions[selectedQuestionIndex]?.order_index} の詳細
              </CardTitle>
              <p className="text-sm md:text-sm text-gray-600">
                選択された問題の詳細を編集してください
              </p>
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
                      value={localQuestions[selectedQuestionIndex]?.question_text || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleQuestionFieldChange('question_text', e.target.value)
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
                      {localQuestions[selectedQuestionIndex]?.image_url ? (
                        <div className="relative h-[120px] overflow-hidden">
                          <Image
                            src={localQuestions[selectedQuestionIndex].image_url}
                            alt="Question image"
                            width={300}
                            height={200}
                            className="w-full h-full object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuestionFieldChange('image_url', undefined)}
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
                          <p className="text-sm md:text-sm text-gray-600 mb-2">
                            画像をアップロード
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 md:pt-6">
        <Button
          variant="gradient2"
          onClick={onPrevious}
          className="px-6 md:px-8 text-sm md:text-base"
        >
          前へ戻る
        </Button>
        <Button variant="gradient2" onClick={onNext} className="px-6 md:px-8 text-sm md:text-base">
          次へ進む
        </Button>
      </div>
    </div>
  );
};
