// ====================================================
// File Name   : PreviewQuizQuestions.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Questions component for quiz preview modal
// - Displays quiz questions with navigation controls
// - Shows question text, images, answers, and explanations
// - Highlights correct answers with green styling
// - Displays question metadata (time, points)
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses Next.js Image component for optimized images
// - Supports navigation between questions
// ====================================================

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

const FIRST_INDEX = 0;
const ASCII_LETTER_A = 65;

const QUESTION_IMAGE_WIDTH = 400;
const QUESTION_IMAGE_HEIGHT = 300;
const ANSWER_IMAGE_WIDTH = 200;
const ANSWER_IMAGE_HEIGHT = 150;
const EXPLANATION_IMAGE_WIDTH = 300;
const EXPLANATION_IMAGE_HEIGHT = 200;

const ICON_SIZE_SMALL = 'w-4 h-4';

const CONTAINER_SPACING_CLASSES = 'space-y-4';
const NAVIGATION_CONTAINER_CLASSES = 'flex items-center justify-between mb-6';
const NAVIGATION_CONTROLS_CLASSES = 'flex items-center gap-3';
const BUTTON_VARIANT_OUTLINE = 'outline';
const BUTTON_SIZE_SM = 'sm';
const NAV_BUTTON_CLASSES =
  'bg-gray-700 text-white border-gray-600 hover:bg-gray-600 disabled:opacity-50';
const PAGE_COUNTER_CONTAINER_CLASSES = 'px-4 py-2 bg-gray-700 rounded-lg';
const PAGE_COUNTER_TEXT_CLASSES = 'font-semibold text-white';

const CARD_BASE_CLASSES = 'p-6 bg-white border border-gray-200 shadow-lg rounded-xl';
const CARD_CONTENT_CLASSES = 'space-y-6';
const QUESTION_IMAGE_CONTAINER_CLASSES = 'w-full max-w-md mx-auto';
const QUESTION_IMAGE_CLASSES = 'w-full h-auto rounded-xl shadow-md';
const QUESTION_TEXT_CONTAINER_CLASSES = 'text-center';
const QUESTION_TITLE_CLASSES = 'text-xl font-bold text-gray-800 mb-4';

const ANSWERS_CONTAINER_CLASSES = 'space-y-3';
const ANSWER_ITEM_BASE_CLASSES = 'p-4 rounded-xl border-2 transition-all duration-200 shadow-md';
const ANSWER_ITEM_CORRECT_CLASSES = 'border-green-300 bg-green-50';
const ANSWER_ITEM_INCORRECT_CLASSES =
  'border-gray-200 bg-white hover:shadow-md hover:border-gray-300';
const ANSWER_CONTENT_CLASSES = 'flex items-center gap-4';
const ANSWER_LETTER_BASE_CLASSES =
  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md';
const ANSWER_LETTER_CORRECT_CLASSES = 'bg-green-600';
const ANSWER_LETTER_INCORRECT_CLASSES = 'bg-gray-600';
const ANSWER_TEXT_CLASSES = 'flex-1 text-gray-800 font-medium';
const CORRECT_BADGE_CLASSES = 'bg-green-600 text-white border-0 shadow-md';
const ANSWER_IMAGE_CONTAINER_CLASSES = 'mt-3 ml-12';
const ANSWER_IMAGE_CLASSES = 'rounded-lg shadow-sm';

const EXPLANATION_CONTAINER_CLASSES = 'mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl';
const EXPLANATION_TITLE_CLASSES = 'font-bold text-blue-700 mb-3 flex items-center gap-2';
const EXPLANATION_ICON_CLASSES = 'text-2xl';
const EXPLANATION_TEXT_CLASSES = 'text-gray-700 leading-relaxed';
const EXPLANATION_IMAGE_CONTAINER_CLASSES = 'mt-4';
const EXPLANATION_IMAGE_CLASSES = 'rounded-lg shadow-sm';

const QUESTION_INFO_CONTAINER_CLASSES =
  'flex items-center gap-6 text-sm pt-4 border-t border-gray-200';
const INFO_ITEM_BASE_CLASSES = 'flex items-center gap-2 px-3 py-2 rounded-lg border';
const TIME_INFO_CLASSES = 'bg-orange-50 border-orange-200';
const TIME_ICON_CLASSES = 'text-orange-600';
const TIME_TEXT_CLASSES = 'text-orange-800 font-medium';
const POINTS_INFO_CLASSES = 'bg-purple-50 border-purple-200';
const POINTS_ICON_CLASSES = 'text-purple-600';
const POINTS_TEXT_CLASSES = 'text-purple-800 font-medium';

const EMPTY_STATE_CONTAINER_CLASSES = 'text-center py-8';
const EMPTY_STATE_ICON_CLASSES = 'text-6xl mb-4';
const EMPTY_STATE_TEXT_CLASSES = 'text-gray-500';

interface PreviewQuizQuestionsProps {
  questions: QuestionWithAnswers[];
}

/**
 * Function: getAnswerLetter
 * Description:
 * - Converts answer index to letter (A, B, C, etc.)
 * - Uses ASCII code calculation starting from 'A' (65)
 *
 * Parameters:
 * - index (number): Zero-based index of the answer
 *
 * Returns:
 * - string: Letter corresponding to the index
 *
 * Example:
 * ```ts
 * getAnswerLetter(0); // Returns 'A'
 * getAnswerLetter(1); // Returns 'B'
 * ```
 */
const getAnswerLetter = (index: number): string => {
  return String.fromCharCode(ASCII_LETTER_A + index);
};

/**
 * Function: goToPreviousQuestion
 * Description:
 * - Navigates to previous question
 * - Prevents going below first question
 *
 * Parameters:
 * - currentIndex (number): Current question index
 * - setIndex (function): State setter for question index
 */
const goToPreviousQuestion = (
  currentIndex: number,
  setIndex: React.Dispatch<React.SetStateAction<number>>,
) => {
  setIndex(Math.max(FIRST_INDEX, currentIndex - 1));
};

/**
 * Function: goToNextQuestion
 * Description:
 * - Navigates to next question
 * - Prevents going beyond last question
 *
 * Parameters:
 * - currentIndex (number): Current question index
 * - totalQuestions (number): Total number of questions
 * - setIndex (function): State setter for question index
 */
const goToNextQuestion = (
  currentIndex: number,
  totalQuestions: number,
  setIndex: React.Dispatch<React.SetStateAction<number>>,
) => {
  setIndex(Math.min(totalQuestions - 1, currentIndex + 1));
};

/**
 * Component: PreviewQuizQuestions
 * Description:
 * - Questions preview component for quiz preview modal
 * - Displays questions with navigation controls
 * - Shows question text, images, answers with correct answer highlighting
 * - Displays explanations and question metadata
 * - Supports navigation between questions with prev/next buttons
 *
 * Parameters:
 * - questions (QuestionWithAnswers[]): Array of questions to display
 *
 * Returns:
 * - React.ReactElement: The preview quiz questions component
 *
 * Example:
 * ```tsx
 * <PreviewQuizQuestions questions={questions} />
 * ```
 */
export const PreviewQuizQuestions: React.FC<PreviewQuizQuestionsProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(FIRST_INDEX);

  if (questions.length === 0) {
    return (
      <div className={EMPTY_STATE_CONTAINER_CLASSES}>
        <div className={EMPTY_STATE_ICON_CLASSES}>❓</div>
        <Text className={EMPTY_STATE_TEXT_CLASSES}>問題がありません</Text>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === FIRST_INDEX;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className={CONTAINER_SPACING_CLASSES}>
      <div className={NAVIGATION_CONTAINER_CLASSES}>
        <div className={NAVIGATION_CONTROLS_CLASSES}>
          <Button
            variant={BUTTON_VARIANT_OUTLINE}
            size={BUTTON_SIZE_SM}
            onClick={() => goToPreviousQuestion(currentQuestionIndex, setCurrentQuestionIndex)}
            disabled={isFirstQuestion}
            className={NAV_BUTTON_CLASSES}
          >
            <ChevronLeft className={ICON_SIZE_SMALL} />
          </Button>
          <div className={PAGE_COUNTER_CONTAINER_CLASSES}>
            <Text className={PAGE_COUNTER_TEXT_CLASSES}>
              {currentQuestionIndex + 1} / {questions.length}
            </Text>
          </div>
          <Button
            variant={BUTTON_VARIANT_OUTLINE}
            size={BUTTON_SIZE_SM}
            onClick={() =>
              goToNextQuestion(currentQuestionIndex, questions.length, setCurrentQuestionIndex)
            }
            disabled={isLastQuestion}
            className={NAV_BUTTON_CLASSES}
          >
            <ChevronRight className={ICON_SIZE_SMALL} />
          </Button>
        </div>
      </div>

      {currentQuestion && (
        <Card className={CARD_BASE_CLASSES}>
          <div className={CARD_CONTENT_CLASSES}>
            {currentQuestion.image_url && (
              <div className={QUESTION_IMAGE_CONTAINER_CLASSES}>
                <Image
                  src={currentQuestion.image_url}
                  alt="Question image"
                  width={QUESTION_IMAGE_WIDTH}
                  height={QUESTION_IMAGE_HEIGHT}
                  className={QUESTION_IMAGE_CLASSES}
                />
              </div>
            )}

            <div className={QUESTION_TEXT_CONTAINER_CLASSES}>
              <h3 className={QUESTION_TITLE_CLASSES}>
                Q{currentQuestionIndex + 1}. {currentQuestion.question_text}
              </h3>
            </div>

            <div className={ANSWERS_CONTAINER_CLASSES}>
              {currentQuestion.answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className={cn(
                    ANSWER_ITEM_BASE_CLASSES,
                    answer.is_correct ? ANSWER_ITEM_CORRECT_CLASSES : ANSWER_ITEM_INCORRECT_CLASSES,
                  )}
                >
                  <div className={ANSWER_CONTENT_CLASSES}>
                    <span
                      className={cn(
                        ANSWER_LETTER_BASE_CLASSES,
                        answer.is_correct
                          ? ANSWER_LETTER_CORRECT_CLASSES
                          : ANSWER_LETTER_INCORRECT_CLASSES,
                      )}
                    >
                      {getAnswerLetter(index)}
                    </span>
                    <span className={ANSWER_TEXT_CLASSES}>{answer.answer_text}</span>
                    {answer.is_correct && <Badge className={CORRECT_BADGE_CLASSES}>正解</Badge>}
                  </div>
                  {answer.image_url && (
                    <div className={ANSWER_IMAGE_CONTAINER_CLASSES}>
                      <Image
                        src={answer.image_url}
                        alt="Answer image"
                        width={ANSWER_IMAGE_WIDTH}
                        height={ANSWER_IMAGE_HEIGHT}
                        className={ANSWER_IMAGE_CLASSES}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {currentQuestion.explanation_text && (
              <div className={EXPLANATION_CONTAINER_CLASSES}>
                <h4 className={EXPLANATION_TITLE_CLASSES}>
                  <span className={EXPLANATION_ICON_CLASSES}>💡</span>
                  {currentQuestion.explanation_title || '解説'}
                </h4>
                <Text className={EXPLANATION_TEXT_CLASSES}>{currentQuestion.explanation_text}</Text>
                {currentQuestion.explanation_image_url && (
                  <div className={EXPLANATION_IMAGE_CONTAINER_CLASSES}>
                    <Image
                      src={currentQuestion.explanation_image_url}
                      alt="Explanation image"
                      width={EXPLANATION_IMAGE_WIDTH}
                      height={EXPLANATION_IMAGE_HEIGHT}
                      className={EXPLANATION_IMAGE_CLASSES}
                    />
                  </div>
                )}
              </div>
            )}

            <div className={QUESTION_INFO_CONTAINER_CLASSES}>
              <div className={cn(INFO_ITEM_BASE_CLASSES, TIME_INFO_CLASSES)}>
                <Timer className={cn(ICON_SIZE_SMALL, TIME_ICON_CLASSES)} />
                <span className={TIME_TEXT_CLASSES}>
                  解答時間: {currentQuestion.answering_time}秒
                </span>
              </div>
              <div className={cn(INFO_ITEM_BASE_CLASSES, POINTS_INFO_CLASSES)}>
                <Award className={cn(ICON_SIZE_SMALL, POINTS_ICON_CLASSES)} />
                <span className={POINTS_TEXT_CLASSES}>ポイント: {currentQuestion.points}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
