// ====================================================
// File Name   : PlayerAnswerScreen.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-23
// Last Update : 2025-12-28
//
// Description:
// - Player screen component for displaying questions and answer choices
// - Supports multiple question types (true/false, multiple choice 2-4 options)
// - Handles answer selection and submission
// - Shows submission status and error states
//
// Notes:
// - Uses different layouts based on question type
// - Supports mobile and desktop responsive layouts
// - Prevents multiple submissions
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';

import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import type { Question, Choice } from '@/types/game';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEFAULT_IS_MOBILE = true;
const DEFAULT_IS_SUBMITTED = false;
const DEFAULT_IS_PROCESSING = false;
const DEFAULT_ERROR = null;

const TIME_WARNING_THRESHOLD = 5;
const TIME_EXPIRED_THRESHOLD = 0;

const IMAGE_ALT_TEXT = 'Question';
const OVERLAY_OPACITY = 'bg-black/10';

const QUESTION_TYPE_TRUE_FALSE = 'true_false';
const QUESTION_TYPE_MULTIPLE_CHOICE_2 = 'multiple_choice_2';
const QUESTION_TYPE_MULTIPLE_CHOICE_3 = 'multiple_choice_3';
const QUESTION_TYPE_MULTIPLE_CHOICE_4 = 'multiple_choice_4';

const TRUE_TEXT_VARIANTS = ['True', '正しい', 'はい', '○'];
const TRUE_SYMBOL = '○';
const FALSE_SYMBOL = '×';

const COLOR_CLASSES_TRUE_FALSE = [
  'bg-gradient-to-br from-green-500 to-green-600 border-green-400',
  'bg-gradient-to-br from-red-500 to-red-600 border-red-400',
] as const;

const COLOR_CLASSES_TWO_OPTION = [
  'bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400',
  'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400',
] as const;

const COLOR_CLASSES_THREE_OPTION = [
  'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400',
  'bg-gradient-to-r from-pink-500 to-pink-600 border-pink-400',
  'bg-gradient-to-r from-cyan-500 to-cyan-600 border-cyan-400',
] as const;

const COLOR_CLASSES_FOUR_OPTION = [
  'bg-gradient-to-br from-red-500 to-red-600 border-red-400',
  'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400',
  'bg-gradient-to-br from-green-500 to-green-600 border-green-400',
  'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400',
] as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
export interface PlayerAnswerScreenProps {
  question: Question;
  currentTime: number;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelect: (answerId: string) => void;
  onAnswerSubmit: (answerId: string) => void;
  isMobile?: boolean;
  isSubmitted?: boolean;
  isProcessing?: boolean;
  error?: string | null;
}

interface LayoutProps {
  choices: Choice[];
  selectedAnswerId: string | null;
  isSubmitted: boolean;
  isProcessing: boolean;
  onAnswerSelect: (answerId: string) => void;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Component: PlayerAnswerScreen
 * Description:
 * - Displays question screen for players with answer choices
 * - Shows question text, optional image, and answer options
 * - Handles answer selection and submission
 * - Displays submission status and error messages
 * - Supports multiple question types with different layouts
 *
 * Parameters:
 * - question (Question): Question data with text, image, choices, and type
 * - currentTime (number): Current time remaining in seconds
 * - questionNumber (number): Current question number
 * - totalQuestions (number): Total number of questions
 * - onAnswerSelect (function): Callback when answer is selected
 * - onAnswerSubmit (function): Callback when answer is submitted
 * - isMobile (boolean, optional): Whether device is mobile (default: true)
 * - isSubmitted (boolean, optional): Whether answer has been submitted (default: false)
 * - isProcessing (boolean, optional): Whether submission is in progress (default: false)
 * - error (string | null, optional): Error message to display (default: null)
 *
 * Returns:
 * - JSX.Element: Player answer screen component
 */
export const PlayerAnswerScreen: React.FC<PlayerAnswerScreenProps> = ({
  question,
  currentTime,
  questionNumber,
  totalQuestions,
  onAnswerSelect,
  onAnswerSubmit,
  isMobile = DEFAULT_IS_MOBILE,
  isSubmitted = DEFAULT_IS_SUBMITTED,
  isProcessing = DEFAULT_IS_PROCESSING,
  error = DEFAULT_ERROR,
}) => {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const handleAnswerSelect = useCallback(
    (answerId: string) => {
      if (isSubmitted || isProcessing) {
        return;
      }

      setSelectedAnswerId(answerId);
      onAnswerSelect(answerId);
      onAnswerSubmit(answerId);
    },
    [isSubmitted, isProcessing, onAnswerSelect, onAnswerSubmit],
  );

  React.useEffect(() => {
    if (!isSubmitted && !isProcessing) {
      setSelectedAnswerId(null);
    }
  }, [question.id, isSubmitted, isProcessing]);

  const hasAnswered = !!selectedAnswerId;

  const renderAnswerLayout = useMemo(() => {
    const layoutProps: LayoutProps = {
      choices: question.choices,
      selectedAnswerId,
      isSubmitted,
      isProcessing,
      onAnswerSelect: handleAnswerSelect,
    };

    switch (question.type) {
      case QUESTION_TYPE_TRUE_FALSE:
        return <TrueFalseLayout {...layoutProps} />;
      case QUESTION_TYPE_MULTIPLE_CHOICE_2:
        return <TwoOptionLayout {...layoutProps} />;
      case QUESTION_TYPE_MULTIPLE_CHOICE_3:
        return <ThreeOptionLayout {...layoutProps} />;
      case QUESTION_TYPE_MULTIPLE_CHOICE_4:
      default:
        return <FourOptionLayout {...layoutProps} />;
    }
  }, [
    question.type,
    question.choices,
    selectedAnswerId,
    isSubmitted,
    isProcessing,
    handleAnswerSelect,
  ]);

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        <TimeBar
          currentTime={currentTime}
          timeLimit={question.timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          isWarning={currentTime <= TIME_WARNING_THRESHOLD && currentTime > TIME_EXPIRED_THRESHOLD}
          isExpired={currentTime <= TIME_EXPIRED_THRESHOLD}
        />

        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-shrink-0 h-24 md:h-32"></div>

          <div className="px-4 py-1">
            <div className="text-center max-w-4xl mx-auto">
              {question.image && (
                <div className="mb-4 flex justify-center">
                  <div
                    className={`relative w-full ${isMobile ? 'max-w-md h-40 md:h-48' : 'max-w-lg h-48 md:h-56'} rounded-lg overflow-hidden shadow-xl`}
                  >
                    <Image
                      src={question.image}
                      alt={IMAGE_ALT_TEXT}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className={`absolute inset-0 ${OVERLAY_OPACITY}`} />
                  </div>
                </div>
              )}

              <h2
                className={`${isMobile ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-bold text-white drop-shadow-lg leading-tight mb-5`}
              >
                {question.text}
              </h2>

              {(isSubmitted || hasAnswered) && (
                <div className="mt-2 mb-4 animate-pulse flex items-center justify-center space-x-2">
                  <div
                    className={`px-6 py-2 rounded-full font-bold text-lg shadow-lg ${
                      error
                        ? 'bg-red-500/80 text-white'
                        : isProcessing
                          ? 'bg-blue-500/80 text-white'
                          : 'bg-green-500/80 text-white border-2 border-white/30'
                    }`}
                  >
                    <div className="flex items-center">
                      {error ? (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>送信エラー: 再試行してください</span>
                        </>
                      ) : isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          <span>送信中...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>回答済み</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full">{renderAnswerLayout}</div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: isTrueChoice
 * Description:
 * - Determines if a choice represents "true" based on text content
 * - Checks against multiple language variants
 *
 * Parameters:
 * - choiceText (string): Text content of the choice
 *
 * Returns:
 * - boolean: True if choice represents "true", false otherwise
 */
function isTrueChoice(choiceText: string): boolean {
  return TRUE_TEXT_VARIANTS.includes(choiceText);
}

/**
 * Function: getButtonClasses
 * Description:
 * - Returns Tailwind CSS classes for answer button based on state
 * - Handles selected, other selected, and disabled states
 *
 * Parameters:
 * - isSelected (boolean): Whether this choice is selected
 * - isOtherSelected (boolean): Whether another choice is selected
 * - isSubmitted (boolean): Whether answer has been submitted
 * - isProcessing (boolean): Whether submission is in progress
 * - colorClass (string): Base color class for the button
 *
 * Returns:
 * - string: Complete Tailwind CSS classes for the button
 */
function getButtonClasses(
  isSelected: boolean,
  isOtherSelected: boolean,
  isSubmitted: boolean,
  isProcessing: boolean,
  colorClass: string,
): string {
  const baseClasses = `relative rounded-3xl border-4 transition-all duration-200 ${colorClass} shadow-xl backdrop-blur-sm`;

  if (isSubmitted || isProcessing) {
    if (isSelected) {
      return `${baseClasses} brightness-110 ring-4 ring-white/50 cursor-not-allowed`;
    }
    if (isOtherSelected) {
      return `${baseClasses} opacity-40 cursor-not-allowed`;
    }
    return `${baseClasses} opacity-70 cursor-not-allowed`;
  }

  return `${baseClasses} hover:brightness-110 active:scale-98`;
}

/**
 * Component: TrueFalseLayout
 * Description:
 * - Layout component for true/false questions
 * - Displays two choices side by side with large symbols
 *
 * Parameters:
 * - choices (Choice[]): Array of choice objects
 * - selectedAnswerId (string | null): Currently selected answer ID
 * - isSubmitted (boolean): Whether answer has been submitted
 * - isProcessing (boolean): Whether submission is in progress
 * - onAnswerSelect (function): Callback when answer is selected
 *
 * Returns:
 * - JSX.Element: True/false layout component
 */
const TrueFalseLayout: React.FC<LayoutProps> = ({
  choices,
  selectedAnswerId,
  isSubmitted,
  isProcessing,
  onAnswerSelect,
}) => (
  <div className="grid grid-cols-2 gap-6 md:gap-8 w-full max-w-3xl mx-auto">
    {choices.map((choice) => {
      const isTrue = isTrueChoice(choice.text);
      const symbol = isTrue ? TRUE_SYMBOL : FALSE_SYMBOL;
      const colorClass = isTrue ? COLOR_CLASSES_TRUE_FALSE[0] : COLOR_CLASSES_TRUE_FALSE[1];
      const isSelected = selectedAnswerId === choice.id;
      const isOtherSelected = selectedAnswerId !== null && selectedAnswerId !== choice.id;

      return (
        <button
          key={choice.id}
          onClick={() => onAnswerSelect(choice.id)}
          disabled={isSubmitted || isProcessing}
          className={getButtonClasses(
            isSelected,
            isOtherSelected,
            isSubmitted,
            isProcessing,
            colorClass,
          )}
        >
          <div className="text-center">
            <div className="text-6xl md:text-8xl font-bold text-white mb-4">{symbol}</div>
            <div className="text-xl md:text-2xl font-medium text-white/95">{choice.text}</div>
          </div>
        </button>
      );
    })}
  </div>
);

/**
 * Component: TwoOptionLayout
 * Description:
 * - Layout component for two-option multiple choice questions
 * - Displays choices in vertical stack with letter indicators
 *
 * Parameters:
 * - choices (Choice[]): Array of choice objects
 * - selectedAnswerId (string | null): Currently selected answer ID
 * - isSubmitted (boolean): Whether answer has been submitted
 * - isProcessing (boolean): Whether submission is in progress
 * - onAnswerSelect (function): Callback when answer is selected
 *
 * Returns:
 * - JSX.Element: Two-option layout component
 */
const TwoOptionLayout: React.FC<LayoutProps> = ({
  choices,
  selectedAnswerId,
  isSubmitted,
  isProcessing,
  onAnswerSelect,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl mx-auto">
    {choices.map((choice, index) => {
      const isSelected = selectedAnswerId === choice.id;
      const isOtherSelected = selectedAnswerId !== null && selectedAnswerId !== choice.id;

      return (
        <button
          key={choice.id}
          onClick={() => onAnswerSelect(choice.id)}
          disabled={isSubmitted || isProcessing}
          className={`w-full p-7 md:p-10 ${getButtonClasses(isSelected, isOtherSelected, isSubmitted, isProcessing, COLOR_CLASSES_TWO_OPTION[index])}`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl md:text-4xl font-bold text-white">{choice.letter}</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-white text-center leading-tight">
              {choice.text}
            </div>
          </div>
        </button>
      );
    })}
  </div>
);

/**
 * Component: ThreeOptionLayout
 * Description:
 * - Layout component for three-option multiple choice questions
 * - Displays choices in vertical stack with letter indicators
 *
 * Parameters:
 * - choices (Choice[]): Array of choice objects
 * - selectedAnswerId (string | null): Currently selected answer ID
 * - isSubmitted (boolean): Whether answer has been submitted
 * - isProcessing (boolean): Whether submission is in progress
 * - onAnswerSelect (function): Callback when answer is selected
 *
 * Returns:
 * - JSX.Element: Three-option layout component
 */
const ThreeOptionLayout: React.FC<LayoutProps> = ({
  choices,
  selectedAnswerId,
  isSubmitted,
  isProcessing,
  onAnswerSelect,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 w-full max-w-5xl mx-auto">
    {choices.map((choice, index) => {
      const isSelected = selectedAnswerId === choice.id;
      const isOtherSelected = selectedAnswerId !== null && selectedAnswerId !== choice.id;

      return (
        <button
          key={choice.id}
          onClick={() => onAnswerSelect(choice.id)}
          disabled={isSubmitted || isProcessing}
          className={`w-full p-6 md:p-8 ${getButtonClasses(isSelected, isOtherSelected, isSubmitted, isProcessing, COLOR_CLASSES_THREE_OPTION[index])}`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl md:text-3xl font-bold text-white">{choice.letter}</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-white text-center leading-tight">
              {choice.text}
            </div>
          </div>
        </button>
      );
    })}
  </div>
);

/**
 * Component: FourOptionLayout
 * Description:
 * - Layout component for four-option multiple choice questions
 * - Displays choices in 2x2 grid with letter indicators
 *
 * Parameters:
 * - choices (Choice[]): Array of choice objects
 * - selectedAnswerId (string | null): Currently selected answer ID
 * - isSubmitted (boolean): Whether answer has been submitted
 * - isProcessing (boolean): Whether submission is in progress
 * - onAnswerSelect (function): Callback when answer is selected
 *
 * Returns:
 * - JSX.Element: Four-option layout component
 */
const FourOptionLayout: React.FC<LayoutProps> = ({
  choices,
  selectedAnswerId,
  isSubmitted,
  isProcessing,
  onAnswerSelect,
}) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl mx-auto">
    {choices.map((choice, index) => {
      const isSelected = selectedAnswerId === choice.id;
      const isOtherSelected = selectedAnswerId !== null && selectedAnswerId !== choice.id;

      return (
        <button
          key={choice.id}
          onClick={() => onAnswerSelect(choice.id)}
          disabled={isSubmitted || isProcessing}
          className={`p-6 md:p-8 ${getButtonClasses(isSelected, isOtherSelected, isSubmitted, isProcessing, COLOR_CLASSES_FOUR_OPTION[index])}`}
        >
          <div className="text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl md:text-3xl font-bold text-white">{choice.letter}</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-white leading-tight">
              {choice.text}
            </div>
          </div>
        </button>
      );
    })}
  </div>
);

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
