'use client';

import React from 'react';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import { CheckCircle } from 'lucide-react';
import { AnswerResult } from '@/types/game';

interface HostAnswerRevealScreenProps {
  answerResult: AnswerResult;
}

export const HostAnswerRevealScreen: React.FC<HostAnswerRevealScreenProps> = ({ answerResult }) => {
  const { question, correctAnswer, statistics } = answerResult;

  // Get color classes for each choice
  const getChoiceColors = () => {
    switch (question.type) {
      case 'true_false':
        return [
          'bg-gradient-to-br from-green-500 to-green-600', // True/○
          'bg-gradient-to-br from-red-500 to-red-600', // False/×
        ];
      case 'multiple_choice_2':
        return [
          'bg-gradient-to-r from-purple-500 to-purple-600',
          'bg-gradient-to-r from-orange-500 to-orange-600',
        ];
      case 'multiple_choice_3':
        return [
          'bg-gradient-to-r from-emerald-500 to-emerald-600',
          'bg-gradient-to-r from-pink-500 to-pink-600',
          'bg-gradient-to-r from-cyan-500 to-cyan-600',
        ];
      case 'multiple_choice_4':
      default:
        return [
          'bg-gradient-to-br from-red-500 to-red-600', // A
          'bg-gradient-to-br from-yellow-500 to-yellow-600', // B
          'bg-gradient-to-br from-green-500 to-green-600', // C
          'bg-gradient-to-br from-blue-500 to-blue-600', // D
        ];
    }
  };

  const colorClasses = getChoiceColors();

  // Find max percentage for scaling bars
  const maxPercentage = Math.max(...statistics.map((stat) => stat.percentage));

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        {/* Timer Bar */}
        <TimeBar
          currentTime={0} // No timer for reveal screen
          timeLimit={1}
          questionNumber={1}
          totalQuestions={10}
        />

        {/* Same background as question screen */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col pt-16">
          {/* Question Text */}
          <div className="px-6 py-4 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg leading-tight">
              {question.text}
            </h2>
          </div>

          {/* Bar Chart */}
          <div className="flex-1 flex items-center justify-center px-6 py-8">
            <div className="w-full max-w-6xl">
              <div className="flex items-end justify-center space-x-4 md:space-x-8 h-64 md:h-80">
                {question.choices.map((choice, index) => {
                  const stat = statistics.find((s) => s.choiceId === choice.id);
                  const percentage = stat?.percentage || 0;
                  const count = stat?.count || 0;

                  // Calculate bar height based on percentage (min 10% height for visibility)
                  const barHeight = Math.max(
                    (percentage / maxPercentage) * 100,
                    percentage > 0 ? 15 : 0,
                  );

                  return (
                    <div key={choice.id} className="flex flex-col items-center flex-1">
                      {/* Number on top of bar */}
                      <div className="text-lg md:text-xl font-bold text-white mb-2">{count}</div>

                      {/* Bar */}
                      <div className="w-full max-w-20 md:max-w-24 relative">
                        <div
                          className={`w-full ${colorClasses[index]} transition-all duration-2000 ease-out`}
                          style={{
                            height: `${barHeight}%`,
                            minHeight: percentage > 0 ? '20px' : '0px',
                          }}
                        />
                      </div>

                      {/* Choice letter */}
                      <div className="mt-4 text-xl md:text-2xl font-bold text-white">
                        {question.type === 'true_false'
                          ? choice.text === 'True' ||
                            choice.text === '正しい' ||
                            choice.text === 'はい'
                            ? '○'
                            : '×'
                          : choice.letter}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Options Grid 2x2 */}
          <div className="px-6 pb-8">
            <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
              {question.choices.map((choice, index) => {
                const isCorrect = correctAnswer.id === choice.id;
                const baseColorClass = colorClasses[index];

                // Make correct answer lighter, others darker
                const colorClass = isCorrect
                  ? baseColorClass
                      .replace(/from-(\w+)-500/g, 'from-$1-400')
                      .replace(/to-(\w+)-600/g, 'to-$1-500')
                  : baseColorClass
                      .replace(/from-(\w+)-500/g, 'from-$1-600')
                      .replace(/to-(\w+)-600/g, 'to-$1-700');

                return (
                  <div
                    key={choice.id}
                    className={`relative p-4 md:p-6 rounded-3xl border-4 ${
                      isCorrect ? 'border-white/50' : 'border-white/20'
                    } ${colorClass} shadow-xl backdrop-blur-sm`}
                  >
                    {/* Correct answer checkmark */}
                    {isCorrect && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10">
                        <CheckCircle className="w-full h-full text-white drop-shadow-2xl" />
                      </div>
                    )}

                    {/* Choice Content */}
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 flex items-center justify-center">
                        <span className="text-lg md:text-xl font-bold text-white">
                          {question.type === 'true_false'
                            ? choice.text === 'True' ||
                              choice.text === '正しい' ||
                              choice.text === 'はい'
                              ? '○'
                              : '×'
                            : choice.letter}
                        </span>
                      </div>
                      <div className="text-sm md:text-base font-medium text-white flex-1 leading-tight">
                        {choice.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};
