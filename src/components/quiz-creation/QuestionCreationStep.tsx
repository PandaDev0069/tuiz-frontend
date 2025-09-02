'use client';

import React, { useState } from 'react';
import {
  CreateQuestionForm,
  CreateAnswerForm,
  FormErrors,
  QuestionType,
  DifficultyLevel,
} from '@/types/quiz';
import { HelpCircle, Plus, ChevronUp, ChevronDown, Copy, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

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

  // Update local state when questions prop changesj
  React.useEffect(() => {
    if (questions.length > 0) {
      setLocalQuestions(questions);
    }
  }, [questions]);

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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="text-center mb-4 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">問題を作成</h2>
        <p className="text-sm md:text-base text-gray-600">クイズの問題と選択肢を設定してください</p>
      </div>

      {/* Question Adding Panel */}
      <div className="space-y-4">
        {/* Questions List */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {localQuestions.map((question: CreateQuestionForm, index: number) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all duration-200 ${
                selectedQuestionIndex === index
                  ? 'bg-gradient-to-br from-lime-400 to-lime-500 border-lime-600 shadow-md ring-2 ring-lime-400'
                  : 'bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-sm hover:shadow-md'
              }`}
              onClick={() => setSelectedQuestionIndex(index)}
            >
              <CardHeader className="pb-0">
                <CardTitle className="text-sm">問題 {question.order_index}</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-1">
                <div className="text-center py-0">
                  <HelpCircle className="w-5 h-5 text-gray-400 mx-auto mb-0" />
                  <p className="text-gray-500 text-sm">詳細は準備中</p>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Question Button */}
          <Card
            className="border-2 border-dashed border-lime-600 bg-lime-100 hover:bg-lime-50 cursor-pointer transition-colors"
            onClick={handleAddQuestion}
          >
            <CardContent className="flex flex-col items-center justify-center py-2 px-2">
              <Plus className="w-6 h-6 text-lime-600 mb-1" />
              <p className="text-lime-700 font-medium text-sm">新しい問題を追加</p>
            </CardContent>
          </Card>
        </div>

        {/* Question Management Buttons - Separate section */}
        {localQuestions.length > 0 && (
          <div className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 rounded-lg p-2 border">
            <h3 className="text-xs font-medium text-gray-700 mb-2 text-center">
              問題 {localQuestions[selectedQuestionIndex]?.order_index} が選択中
            </h3>
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
          </div>
        )}
      </div>

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
