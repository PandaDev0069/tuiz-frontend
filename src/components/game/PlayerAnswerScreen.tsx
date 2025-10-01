'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import { Question } from '@/types/game';

interface PlayerAnswerScreenProps {
  question: Question;
  currentTime: number;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelect: (answerId: string) => void;
  onAnswerSubmit: () => void;
  isMobile?: boolean;
  isSubmitted?: boolean;
}

export const PlayerAnswerScreen: React.FC<PlayerAnswerScreenProps> = ({
  question,
  currentTime,
  questionNumber,
  totalQuestions,
  onAnswerSelect,
  onAnswerSubmit,
  isMobile = true,
  isSubmitted = false,
}) => {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const handleAnswerSelect = (answerId: string) => {
    if (isSubmitted || hasAnswered) {
      return; // Prevent changes after submission
    }

    setSelectedAnswerId(answerId);
    setHasAnswered(true);
    onAnswerSelect(answerId);
    onAnswerSubmit();
  };
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
    <div className="grid grid-cols-2 gap-6 md:gap-8 w-full max-w-3xl mx-auto">
      {question.choices.map((choice, index) => {
        const isTrue =
          choice.text === 'True' ||
          choice.text === '正しい' ||
          choice.text === 'はい' ||
          choice.text === '○';

        // Colorful backgrounds for each option
        const colorClasses = [
          'bg-gradient-to-br from-green-500 to-green-600 border-green-400', // True/○
          'bg-gradient-to-br from-red-500 to-red-600 border-red-400', // False/×
        ];

        const isSelected = selectedAnswerId === choice.id;
        const isOtherSelected = selectedAnswerId && selectedAnswerId !== choice.id;

        return (
          <button
            key={choice.id}
            onClick={() => handleAnswerSelect(choice.id)}
            disabled={isSubmitted || hasAnswered}
            className={`relative p-8 md:p-10 rounded-3xl border-4 transition-all duration-300 transform ${colorClasses[index]} hover:scale-105 shadow-xl backdrop-blur-sm ${
              isSubmitted || hasAnswered
                ? isSelected
                  ? 'brightness-110 ring-4 ring-white/50 cursor-not-allowed'
                  : isOtherSelected
                    ? 'opacity-40 cursor-not-allowed'
                    : 'opacity-70 cursor-not-allowed'
                : 'active:scale-95'
            }`}
          >
            {/* Choice Content */}
            <div className="text-center">
              <div className="text-6xl md:text-8xl font-bold text-white mb-4">
                {isTrue ? '○' : '×'}
              </div>
              <div className="text-xl md:text-2xl font-medium text-white/95">{choice.text}</div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const TwoOptionLayout = () => (
    <div className="space-y-6 md:space-y-8 w-full max-w-2xl mx-auto">
      {question.choices.map((choice, index) => {
        // Colorful backgrounds for each option
        const colorClasses = [
          'bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400',
          'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400',
        ];

        const isSelected = selectedAnswerId === choice.id;
        const isOtherSelected = selectedAnswerId && selectedAnswerId !== choice.id;

        return (
          <button
            key={choice.id}
            onClick={() => handleAnswerSelect(choice.id)}
            disabled={isSubmitted || hasAnswered}
            className={`relative w-full p-7 md:p-8 rounded-3xl border-4 transition-all duration-300 transform ${colorClasses[index]} hover:scale-102 shadow-xl backdrop-blur-sm ${
              isSubmitted || hasAnswered
                ? isSelected
                  ? 'brightness-110 ring-4 ring-white/50 cursor-not-allowed'
                  : isOtherSelected
                    ? 'opacity-40 cursor-not-allowed'
                    : 'opacity-70 cursor-not-allowed'
                : 'active:scale-95'
            }`}
          >
            {/* Choice Content */}
            <div className="flex items-center space-x-6 md:space-x-8">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl md:text-3xl font-bold text-white">{choice.letter}</span>
              </div>
              <div className="text-xl md:text-2xl font-medium text-white text-left flex-1">
                {choice.text}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const ThreeOptionLayout = () => (
    <div className="space-y-5 md:space-y-6 w-full max-w-3xl mx-auto">
      {question.choices.map((choice, index) => {
        // Colorful backgrounds for each option
        const colorClasses = [
          'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400',
          'bg-gradient-to-r from-pink-500 to-pink-600 border-pink-400',
          'bg-gradient-to-r from-cyan-500 to-cyan-600 border-cyan-400',
        ];

        const isSelected = selectedAnswerId === choice.id;
        const isOtherSelected = selectedAnswerId && selectedAnswerId !== choice.id;

        return (
          <button
            key={choice.id}
            onClick={() => handleAnswerSelect(choice.id)}
            disabled={isSubmitted || hasAnswered}
            className={`relative w-full p-6 md:p-7 rounded-3xl border-4 transition-all duration-300 transform ${colorClasses[index]} hover:scale-102 shadow-xl backdrop-blur-sm ${
              isSubmitted || hasAnswered
                ? isSelected
                  ? 'brightness-110 ring-4 ring-white/50 cursor-not-allowed'
                  : isOtherSelected
                    ? 'opacity-40 cursor-not-allowed'
                    : 'opacity-70 cursor-not-allowed'
                : 'active:scale-95'
            }`}
          >
            {/* Choice Content */}
            <div className="flex items-center space-x-5 md:space-x-6">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl md:text-3xl font-bold text-white">{choice.letter}</span>
              </div>
              <div className="text-lg md:text-xl font-medium text-white text-left flex-1 leading-tight">
                {choice.text}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const FourOptionLayout = () => (
    <div className="grid grid-cols-2 gap-5 md:gap-6 w-full max-w-5xl mx-auto">
      {question.choices.map((choice, index) => {
        // Colorful backgrounds for each option
        const colorClasses = [
          'bg-gradient-to-br from-red-500 to-red-600 border-red-400', // A
          'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400', // B
          'bg-gradient-to-br from-green-500 to-green-600 border-green-400', // C
          'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400', // D
        ];

        const isSelected = selectedAnswerId === choice.id;
        const isOtherSelected = selectedAnswerId && selectedAnswerId !== choice.id;

        return (
          <button
            key={choice.id}
            onClick={() => handleAnswerSelect(choice.id)}
            disabled={isSubmitted || hasAnswered}
            className={`relative p-6 md:p-8 rounded-3xl border-4 transition-all duration-300 transform ${colorClasses[index]} hover:scale-105 shadow-xl backdrop-blur-sm ${
              isSubmitted || hasAnswered
                ? isSelected
                  ? 'brightness-110 ring-4 ring-white/50 cursor-not-allowed'
                  : isOtherSelected
                    ? 'opacity-40 cursor-not-allowed'
                    : 'opacity-70 cursor-not-allowed'
                : 'active:scale-95'
            }`}
          >
            {/* Choice Content */}
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl md:text-3xl font-bold text-white">{choice.letter}</span>
              </div>
              <div className="text-base md:text-lg font-medium text-white leading-tight">
                {choice.text}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        {/* Timer Bar */}
        <TimeBar
          currentTime={currentTime}
          timeLimit={question.timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        {/* Same background as question screen */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Spacer to push content down */}
          <div className="flex-shrink-0 h-24 md:h-32"></div>

          {/* Question Text and Image */}
          <div className="px-4 py-1">
            <div className="text-center max-w-4xl mx-auto">
              {/* Question Image (if available) */}
              {question.image && (
                <div className="mb-4 flex justify-center">
                  <div
                    className={`relative w-full ${isMobile ? 'max-w-md h-40 md:h-48' : 'max-w-lg h-48 md:h-56'} rounded-lg overflow-hidden shadow-xl`}
                  >
                    <Image
                      src={question.image}
                      alt="Question"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                </div>
              )}

              {/* Question Text */}
              <h2
                className={`${isMobile ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-bold text-white drop-shadow-lg leading-tight mb-5`}
              >
                {question.text}
              </h2>
            </div>
          </div>

          {/* Answer Options */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full">{renderAnswerLayout()}</div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};
