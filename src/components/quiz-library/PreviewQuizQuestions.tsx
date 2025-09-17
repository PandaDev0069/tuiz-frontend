'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { Text } from '@/components/ui/core/typography';
import { Badge } from '@/components/ui/data-display/badge';
import { ChevronLeft, ChevronRight, Timer, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuestionWithAnswers } from '@/types/quiz';
import Image from 'next/image';

interface PreviewQuizQuestionsProps {
  questions: QuestionWithAnswers[];
}

export const PreviewQuizQuestions: React.FC<PreviewQuizQuestionsProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">❓</div>
        <Text className="text-gray-500">問題がありません</Text>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-4">
      {/* Question Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 bg-gray-700 rounded-lg">
            <Text className="font-semibold text-white">
              {currentQuestionIndex + 1} / {questions.length}
            </Text>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))
            }
            disabled={currentQuestionIndex === questions.length - 1}
            className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <Card className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
          <div className="space-y-6">
            {/* Question Image */}
            {currentQuestion.image_url && (
              <div className="w-full max-w-md mx-auto">
                <Image
                  src={currentQuestion.image_url}
                  alt="Question image"
                  width={400}
                  height={300}
                  className="w-full h-auto rounded-xl shadow-md"
                />
              </div>
            )}

            {/* Question Text */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Q{currentQuestionIndex + 1}. {currentQuestion.question_text}
              </h3>
            </div>

            {/* Answers */}
            <div className="space-y-3">
              {currentQuestion.answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all duration-200 shadow-md',
                    answer.is_correct
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white hover:shadow-md hover:border-gray-300',
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md',
                        answer.is_correct ? 'bg-green-600' : 'bg-gray-600',
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 text-gray-800 font-medium">{answer.answer_text}</span>
                    {answer.is_correct && (
                      <Badge className="bg-green-600 text-white border-0 shadow-md">正解</Badge>
                    )}
                  </div>
                  {answer.image_url && (
                    <div className="mt-3 ml-12">
                      <Image
                        src={answer.image_url}
                        alt="Answer image"
                        width={200}
                        height={150}
                        className="rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Explanation */}
            {currentQuestion.explanation_text && (
              <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  {currentQuestion.explanation_title || '解説'}
                </h4>
                <Text className="text-gray-700 leading-relaxed">
                  {currentQuestion.explanation_text}
                </Text>
                {currentQuestion.explanation_image_url && (
                  <div className="mt-4">
                    <Image
                      src={currentQuestion.explanation_image_url}
                      alt="Explanation image"
                      width={300}
                      height={200}
                      className="rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Question Info */}
            <div className="flex items-center gap-6 text-sm pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                <Timer className="w-4 h-4 text-orange-600" />
                <span className="text-orange-800 font-medium">
                  解答時間: {currentQuestion.answering_time}秒
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="text-purple-800 font-medium">
                  ポイント: {currentQuestion.points}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
