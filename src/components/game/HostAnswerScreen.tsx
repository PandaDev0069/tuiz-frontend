// ====================================================
// File Name   : HostAnswerScreen.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-23
// Last Update : 2025-10-01
//
// Description:
// - Host screen component for displaying questions and answer choices
// - Supports multiple question types (true/false, multiple choice 2-4 options)
// - Displays question text, image, and answer choices with color-coded layouts
// - Shows timer and question counter
//
// Notes:
// - Uses different layouts based on question type
// - Color schemes match PlayerAnswerScreen for consistency
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import React from 'react';
import Image from 'next/image';

import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import type { Question, Choice } from '@/types/game';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
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

const IMAGE_ALT_TEXT = 'Question';
const OVERLAY_OPACITY = 'bg-black/10';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
export interface HostAnswerScreenProps {
  question: Question;
  currentTime: number;
  questionNumber: number;
  totalQuestions: number;
  totalPlayers?: number;
  answeredCount?: number;
}

interface LayoutProps {
  choices: Choice[];
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Component: HostAnswerScreen
 * Description:
 * - Displays question screen for host with answer choices
 * - Shows question text, optional image, and answer choices
 * - Supports multiple question types with different layouts
 * - Displays timer and question counter
 *
 * Parameters:
 * - question (Question): Question data with text, image, choices, and type
 * - currentTime (number): Current time remaining in seconds
 * - questionNumber (number): Current question number
 * - totalQuestions (number): Total number of questions
 * - totalPlayers (number, optional): Total number of players
 * - answeredCount (number, optional): Number of players who answered
 *
 * Returns:
 * - JSX.Element: Host answer screen component
 */
export const HostAnswerScreen: React.FC<HostAnswerScreenProps> = ({
  question,
  currentTime,
  questionNumber,
  totalQuestions,
}) => {
  const renderAnswerLayout = () => {
    switch (question.type) {
      case QUESTION_TYPE_TRUE_FALSE:
        return <TrueFalseLayout choices={question.choices} />;
      case QUESTION_TYPE_MULTIPLE_CHOICE_2:
        return <TwoOptionLayout choices={question.choices} />;
      case QUESTION_TYPE_MULTIPLE_CHOICE_3:
        return <ThreeOptionLayout choices={question.choices} />;
      case QUESTION_TYPE_MULTIPLE_CHOICE_4:
      default:
        return <FourOptionLayout choices={question.choices} />;
    }
  };

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        <TimeBar
          currentTime={currentTime}
          timeLimit={question.timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        <div className="absolute inset-0">
          <QuizBackground variant="question" />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <div className="text-center max-w-7xl w-full mb-8">
              {question.image && (
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-3xl h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-2xl mx-auto">
                    <Image
                      src={question.image}
                      alt={IMAGE_ALT_TEXT}
                      width={1200}
                      height={600}
                      className="object-contain w-full h-full"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className={`absolute inset-0 ${OVERLAY_OPACITY}`} />
                  </div>
                </div>
              )}

              <h1 className="text-5xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl leading-tight mb-4">
                {question.text}
              </h1>
            </div>

            <div className="w-full">{renderAnswerLayout()}</div>
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
 * Component: TrueFalseLayout
 * Description:
 * - Layout component for true/false questions
 * - Displays two choices side by side with large symbols
 *
 * Parameters:
 * - choices (Choice[]): Array of choice objects
 *
 * Returns:
 * - JSX.Element: True/false layout component
 */
const TrueFalseLayout: React.FC<LayoutProps> = ({ choices }) => (
  <div className="grid grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl mx-auto">
    {choices.map((choice, index) => {
      const isTrue = isTrueChoice(choice.text);
      const symbol = isTrue ? TRUE_SYMBOL : FALSE_SYMBOL;

      return (
        <div
          key={choice.id}
          className={`relative p-6 md:p-8 rounded-3xl border-4 transition-all duration-300 ${COLOR_CLASSES_TRUE_FALSE[index]} shadow-xl backdrop-blur-sm`}
        >
          <div className="text-center">
            <div className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-2xl">
              {symbol}
            </div>
            <div className="text-2xl md:text-3xl font-medium text-white/95">{choice.text}</div>
          </div>
        </div>
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
 *
 * Returns:
 * - JSX.Element: Two-option layout component
 */
const TwoOptionLayout: React.FC<LayoutProps> = ({ choices }) => (
  <div className="space-y-6 md:space-y-8 w-full max-w-5xl mx-auto">
    {choices.map((choice, index) => (
      <div
        key={choice.id}
        className={`relative p-6 md:p-8 rounded-3xl border-4 transition-all duration-300 ${COLOR_CLASSES_TWO_OPTION[index]} shadow-xl backdrop-blur-sm`}
      >
        <div className="flex items-center space-x-6 md:space-x-8">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {choice.letter}
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-medium text-white flex-1 leading-tight">
            {choice.text}
          </div>
        </div>
      </div>
    ))}
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
 *
 * Returns:
 * - JSX.Element: Three-option layout component
 */
const ThreeOptionLayout: React.FC<LayoutProps> = ({ choices }) => (
  <div className="space-y-6 md:space-y-8 w-full max-w-5xl mx-auto">
    {choices.map((choice, index) => (
      <div
        key={choice.id}
        className={`relative p-6 md:p-8 rounded-3xl border-4 transition-all duration-300 ${COLOR_CLASSES_THREE_OPTION[index]} shadow-xl backdrop-blur-sm`}
      >
        <div className="flex items-center space-x-6 md:space-x-8">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {choice.letter}
            </span>
          </div>
          <div className="text-3xl md:text-2xl font-medium text-white flex-1 leading-tight">
            {choice.text}
          </div>
        </div>
      </div>
    ))}
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
 *
 * Returns:
 * - JSX.Element: Four-option layout component
 */
const FourOptionLayout: React.FC<LayoutProps> = ({ choices }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-6xl mx-auto">
    {choices.map((choice, index) => (
      <div
        key={choice.id}
        className={`relative p-6 md:p-8 rounded-3xl border-4 transition-all duration-300 ${COLOR_CLASSES_FOUR_OPTION[index]} shadow-xl backdrop-blur-sm`}
      >
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {choice.letter}
            </span>
          </div>
          <div className="text-3xl md:text-xl font-medium text-white leading-tight">
            {choice.text}
          </div>
        </div>
      </div>
    ))}
  </div>
);

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
