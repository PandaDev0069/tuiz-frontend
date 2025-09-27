'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import { CheckCircle } from 'lucide-react';
import { AnswerResult, Choice, AnswerStatistic } from '@/types/game';

// Get color classes for each choice - moved outside to prevent recreation
const getChoiceColors = (questionType: string) => {
  switch (questionType) {
    case 'true_false':
      return [
        'bg-gradient-to-br from-green-500 to-green-600 border-green-400', // True/○
        'bg-gradient-to-br from-red-500 to-red-600 border-red-400', // False/×
      ];
    case 'multiple_choice_2':
      return [
        'bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400',
        'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400',
      ];
    case 'multiple_choice_3':
      return [
        'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400',
        'bg-gradient-to-r from-pink-500 to-pink-600 border-pink-400',
        'bg-gradient-to-r from-cyan-500 to-cyan-600 border-cyan-400',
      ];
    case 'multiple_choice_4':
    default:
      return [
        'bg-gradient-to-br from-red-500 to-red-600 border-red-400', // A
        'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400', // B
        'bg-gradient-to-br from-green-500 to-green-600 border-green-400', // C
        'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400', // D
      ];
  }
};

// Animated Bar Component - moved outside to prevent recreation
const AnimatedBar: React.FC<{
  choice: Choice;
  index: number;
  stat: AnswerStatistic | undefined;
  maxPercentage: number;
  colorClass: string;
  shouldAnimate: boolean;
  correctAnswer: Choice;
  questionType: string;
}> = ({
  choice,
  index,
  stat,
  maxPercentage,
  colorClass,
  shouldAnimate,
  correctAnswer,
  questionType,
}) => {
  const percentage = stat?.percentage || 0;
  const count = stat?.count || 0;

  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedHeight, setAnimatedHeight] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) {
      // Reset to initial state when animation hasn't started
      setAnimatedCount(0);
      setAnimatedHeight(0);
      return;
    }

    // Capture values to avoid dependency issues
    const targetCount = count;
    const targetPercentage = percentage;
    const animationIndex = index;

    // Simplified single RAF animation with staggered delay
    const delay = 300 + animationIndex * 150; // Reduced stagger delay

    const timer = setTimeout(() => {
      let startTime: number;
      let animationFrame: number;
      const totalDuration = 2000; // Reduced total duration

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);

        // Use easeOutQuart for snappier animation
        const easeOut = 1 - Math.pow(1 - progress, 4);

        // Update both values in single RAF call
        setAnimatedCount(Math.round(targetCount * easeOut));
        setAnimatedHeight(targetPercentage * easeOut);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, delay);

    return () => clearTimeout(timer);
  }, [shouldAnimate, count, percentage, index]);

  // Calculate bar height - memoized to avoid re-calculation
  const barHeightPercent = React.useMemo(() => {
    if (animatedHeight <= 0) return 0;
    const scaledPercent = maxPercentage > 0 ? (animatedHeight / maxPercentage) * 100 : 0;
    return Math.min(Math.max(scaledPercent, 8), 100);
  }, [animatedHeight, maxPercentage]);

  return (
    <div className="flex flex-col items-center flex-1 h-full">
      {/* Animated Number on top of bar */}
      <div className="text-lg md:text-xl font-bold text-white mb-2 h-8 flex items-center">
        <span className="tabular-nums">{animatedCount}</span>
      </div>

      {/* Bar Container */}
      <div className="w-full max-w-20 md:max-w-24 flex-1 flex flex-col justify-end relative">
        <div
          className={`w-full ${colorClass} rounded-t-lg shadow-lg will-change-transform relative`}
          style={{
            height: `${barHeightPercent}%`,
            minHeight: animatedHeight > 0 ? '8px' : '0px',
            transform: 'translateZ(0)', // Force GPU acceleration
          }}
        >
          {/* Correct Answer Checkmark on Bar */}
          {choice.id === correctAnswer.id && barHeightPercent > 20 && (
            <div className="absolute top-2 right-2 w-5 h-5 md:w-6 md:h-6">
              <CheckCircle className="w-full h-full text-white drop-shadow-lg opacity-90" />
            </div>
          )}
        </div>
      </div>

      {/* Choice letter */}
      <div className="mt-4 h-8 flex items-center justify-center">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 flex items-center justify-center rounded-full">
          <span className="text-lg md:text-xl font-bold text-white drop-shadow-lg">
            {questionType === 'true_false'
              ? choice.text === 'True' || choice.text === '正しい' || choice.text === 'はい'
                ? '○'
                : '×'
              : choice.letter}
          </span>
        </div>
      </div>
    </div>
  );
};

interface HostAnswerRevealScreenProps {
  answerResult: AnswerResult;
  timeLimit?: number;
  questionNumber?: number;
  totalQuestions?: number;
  onTimeExpired?: () => void; // Callback for when timer expires
}

export const HostAnswerRevealScreen: React.FC<HostAnswerRevealScreenProps> = ({
  answerResult,
  timeLimit = 5,
  questionNumber = 1,
  totalQuestions = 10,
  onTimeExpired,
}) => {
  const { question, correctAnswer, statistics } = answerResult;
  const router = useRouter();

  // Animation state
  const [isAnimationStarted, setIsAnimationStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(timeLimit);

  // Start animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationStarted(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array

  // Internal timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          // Timer expired - trigger navigation
          if (onTimeExpired) {
            onTimeExpired();
          } else {
            // Default navigation to leaderboard screen
            router.push('/host-leaderboard-screen');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeExpired, router]); // Include dependencies for navigation

  const colorClasses = getChoiceColors(question.type);

  // Find max percentage for scaling bars (guard against empty or zero)
  const maxPercentage = Math.max(0, ...statistics.map((stat) => stat.percentage)) || 1;

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        {/* Timer Bar */}
        <TimeBar
          currentTime={currentTime}
          timeLimit={timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        {/* Same background as question screen */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col pt-16">
          {/* Question Text */}
          <div className="px-6 py-4 text-center">
            <h2 className="text-4xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg leading-tight">
              {question.text}
            </h2>
          </div>

          {/* Bar Chart Section */}
          <div className="flex-1 flex items-center justify-center px-6 py-8">
            <div className="w-full max-w-6xl">
              {/* Chart Title/Label */}
              <div className="text-center mb-6">
                <h3 className="text-4xl md:text-4xl lg:text-5xl font-bold text-white/90 mb-2">
                  回答結果
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] mx-auto rounded-full"></div>
              </div>

              {/* Chart Container with Background */}
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl">
                {/* Decorative corner elements */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white/20 rounded-tl-lg"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white/20 rounded-tr-lg"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white/20 rounded-bl-lg"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white/20 rounded-br-lg"></div>

                <div
                  className="flex items-end justify-center space-x-4 md:space-x-8"
                  style={{ height: '330px' }}
                >
                  {question.choices.map((choice, index) => {
                    const stat = statistics.find((s) => s.choiceId === choice.id);

                    return (
                      <AnimatedBar
                        key={choice.id}
                        choice={choice}
                        index={index}
                        stat={stat}
                        maxPercentage={maxPercentage}
                        colorClass={colorClasses[index]}
                        shouldAnimate={isAnimationStarted}
                        correctAnswer={correctAnswer}
                        questionType={question.type}
                      />
                    );
                  })}
                </div>

                {/* Chart bottom decoration */}
                <div className="mt-6 flex justify-center items-center space-x-2">
                  <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] rounded-full"></div>
                  <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                </div>

                {/* Statistics summary */}
                <div className="mt-4 text-center">
                  <p className="text-sm md:text-base text-white/70">
                    総回答数: {statistics.reduce((sum, stat) => sum + stat.count, 0)}人
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Options Grid 2x2 */}
          <div className="px-6 pb-8">
            <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
              {question.choices.map((choice, index) => {
                const isCorrect = correctAnswer.id === choice.id;

                // Use the same colors as HostAnswerScreen with dimming for incorrect answers
                const colorClass = colorClasses[index];
                const borderClass = isCorrect ? 'border-white/60' : 'border-4';

                return (
                  <div
                    key={choice.id}
                    className={`relative p-4 md:p-6 rounded-3xl ${borderClass} ${colorClass} backdrop-blur-sm transition-all duration-300 ${
                      isCorrect
                        ? 'ring-2 ring-white/50 shadow-2xl brightness-110'
                        : 'opacity-40 shadow-lg'
                    }`}
                  >
                    {/* Correct answer checkmark */}
                    {isCorrect && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10">
                        <CheckCircle className="w-full h-full text-white drop-shadow-2xl" />
                      </div>
                    )}

                    {/* Choice Content */}
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 flex items-center justify-center rounded-full">
                        <span className="text-lg md:text-xl font-bold text-white drop-shadow-lg">
                          {question.type === 'true_false'
                            ? choice.text === 'True' ||
                              choice.text === '正しい' ||
                              choice.text === 'はい'
                              ? '○'
                              : '×'
                            : choice.letter}
                        </span>
                      </div>
                      <div className="text-sm md:text-base font-medium text-white/95 flex-1 leading-tight">
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
