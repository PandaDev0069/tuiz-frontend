'use client';

import React from 'react';
import Image from 'next/image';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import { Question } from '@/types/game';

interface HostAnswerScreenProps {
  question: Question;
  currentTime: number;
  questionNumber: number;
  totalQuestions: number;
  totalPlayers?: number;
  answeredCount?: number;
}

export const HostAnswerScreen: React.FC<HostAnswerScreenProps> = ({
  question,
  currentTime,
  questionNumber,
  totalQuestions,
}) => {
  const renderAnswerLayout = () => {
    switch (question.type) {
      case 'true_false':
        return <TrueFalseLayout />;
      case 'multiple_choice_2':
        return <TwoOptionLayout />;
      case 'multiple_choice_3':
        return <ThreeOptionLayout />;
      case 'multiple_choice_4':
      default:
        return <FourOptionLayout />;
    }
  };

  const TrueFalseLayout = () => (
    <div className="grid grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl mx-auto">
      {question.choices.map((choice, index) => {
        const isTrue =
          choice.text === 'True' ||
          choice.text === '正しい' ||
          choice.text === 'はい' ||
          choice.text === '○';

        // Same colorful backgrounds as PlayerAnswerScreen
        const colorClasses = [
          'bg-gradient-to-br from-green-500 to-green-600 border-green-400', // True/○
          'bg-gradient-to-br from-red-500 to-red-600 border-red-400', // False/×
        ];

        return (
          <div
            key={choice.id}
            className={`relative p-6 md:p-8 rounded-3xl border-4 transition-all duration-300 ${colorClasses[index]} shadow-xl backdrop-blur-sm`}
          >
            {/* Choice Content */}
            <div className="text-center">
              <div className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-2xl">
                {isTrue ? '○' : '×'}
              </div>
              <div className="text-2xl md:text-3xl font-medium text-white/95">{choice.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const TwoOptionLayout = () => (
    <div className="space-y-6 md:space-y-8 w-full max-w-5xl mx-auto">
      {question.choices.map((choice, index) => {
        // Same colorful backgrounds as PlayerAnswerScreen
        const colorClasses = [
          'bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400',
          'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400',
        ];

        return (
          <div
            key={choice.id}
            className={`relative p-6 md:p-8 rounded-3xl border-4 transition-all duration-300 ${colorClasses[index]} shadow-xl backdrop-blur-sm`}
          >
            {/* Choice Content */}
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
        );
      })}
    </div>
  );

  const ThreeOptionLayout = () => (
    <div className="space-y-6 md:space-y-8 w-full max-w-5xl mx-auto">
      {question.choices.map((choice, index) => {
        // Same colorful backgrounds as PlayerAnswerScreen
        const colorClasses = [
          'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400',
          'bg-gradient-to-r from-pink-500 to-pink-600 border-pink-400',
          'bg-gradient-to-r from-cyan-500 to-cyan-600 border-cyan-400',
        ];

        return (
          <div
            key={choice.id}
            className={`relative p-6 md:p-8 rounded-3xl border-4 transition-all duration-300 ${colorClasses[index]} shadow-xl backdrop-blur-sm`}
          >
            {/* Choice Content */}
            <div className="flex items-center space-x-6 md:space-x-8">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {choice.letter}
                </span>
              </div>
              <div className="text-xl md:text-2xl font-medium text-white flex-1 leading-tight">
                {choice.text}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const FourOptionLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-6xl mx-auto">
      {question.choices.map((choice, index) => {
        // Same colorful backgrounds as PlayerAnswerScreen
        const colorClasses = [
          'bg-gradient-to-br from-red-500 to-red-600 border-red-400', // A
          'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400', // B
          'bg-gradient-to-br from-green-500 to-green-600 border-green-400', // C
          'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400', // D
        ];

        return (
          <div
            key={choice.id}
            className={`relative p-6 md:p-8 rounded-3xl border-4 transition-all duration-300 ${colorClasses[index]} shadow-xl backdrop-blur-sm`}
          >
            {/* Choice Content */}
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {choice.letter}
                </span>
              </div>
              <div className="text-lg md:text-xl font-medium text-white leading-tight">
                {choice.text}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        {/* Timer Bar with Question Counter and Timer Display */}
        <TimeBar
          currentTime={currentTime}
          timeLimit={question.timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        {/* Default Background */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" />
        </div>

        {/* Question Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Question Text with Image */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <div className="text-center max-w-7xl w-full mb-8">
              {/* Question Image (if available) */}
              {question.image && (
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-3xl h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-2xl mx-auto">
                    <Image src={question.image} alt="Question" fill className="object-cover" />
                    {/* Subtle overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                </div>
              )}

              {/* Question Text */}
              <h1 className="text-5xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl leading-tight mb-4">
                {question.text}
              </h1>
            </div>

            {/* Answer Choices */}
            <div className="w-full">{renderAnswerLayout()}</div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};
