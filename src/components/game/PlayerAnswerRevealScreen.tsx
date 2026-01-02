'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import { CheckCircle } from 'lucide-react';
import { AnswerResult, Choice, AnswerStatistic } from '@/types/game';

// Animated Bar Component - moved outside to prevent recreation on every render
const AnimatedBar: React.FC<{
  choice: Choice;
  index: number;
  stat: AnswerStatistic | undefined;
  maxPercentage: number;
  colorClass: string;
  shouldAnimate: boolean;
  correctAnswer: Choice;
  questionId: string; // Add questionId to track question changes
  questionType: string;
}> = ({
  choice,
  index,
  stat,
  maxPercentage,
  colorClass,
  shouldAnimate,
  correctAnswer,
  questionId,
  questionType,
}) => {
  const percentage = stat?.percentage || 0;
  const count = stat?.count || 0;

  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedHeight, setAnimatedHeight] = useState(0);
  const hasAnimatedRef = useRef(false);
  const lastCountRef = useRef(count);
  const lastPercentageRef = useRef(percentage);
  const lastQuestionIdRef = useRef(questionId);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset animation state only when question actually changes
    if (lastQuestionIdRef.current !== questionId) {
      hasAnimatedRef.current = false;
      setAnimatedCount(0);
      setAnimatedHeight(0);
      lastQuestionIdRef.current = questionId;
      lastCountRef.current = count;
      lastPercentageRef.current = percentage;
    }

    if (!shouldAnimate) {
      // Reset to initial state when animation hasn't started
      if (!hasAnimatedRef.current) {
        setAnimatedCount(0);
        setAnimatedHeight(0);
      }
      return;
    }

    // If values haven't changed and animation already completed, don't restart
    if (
      hasAnimatedRef.current &&
      lastCountRef.current === count &&
      lastPercentageRef.current === percentage &&
      lastQuestionIdRef.current === questionId
    ) {
      return;
    }

    // Update refs with current values
    lastCountRef.current = count;
    lastPercentageRef.current = percentage;

    // Simplified single RAF animation with staggered delay
    const delay = 300 + index * 150; // Reduced stagger delay

    timeoutRef.current = setTimeout(() => {
      let startTime: number;
      const totalDuration = 2000; // Reduced total duration

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);

        // Use easeOutQuart for snappier animation
        const easeOut = 1 - Math.pow(1 - progress, 4);

        // Update both values in single RAF call
        setAnimatedCount(Math.round(count * easeOut));
        setAnimatedHeight(percentage * easeOut);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Mark animation as completed
          hasAnimatedRef.current = true;
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [shouldAnimate, count, percentage, index, questionId]);

  // Calculate bar height - memoized to avoid re-calculation
  const barHeightPercent = React.useMemo(() => {
    if (animatedHeight <= 0) return 0;
    const scaledPercent = maxPercentage > 0 ? (animatedHeight / maxPercentage) * 100 : 0;
    return Math.min(Math.max(scaledPercent, 8), 100);
  }, [animatedHeight, maxPercentage]);

  return (
    <div className="flex flex-col items-center flex-1 h-full">
      {/* Animated Number on top of bar - mobile optimized */}
      <div className="text-sm md:text-lg lg:text-xl font-bold text-white mb-1 md:mb-2 h-6 md:h-8 flex items-center">
        <span className="tabular-nums">{animatedCount}</span>
      </div>

      {/* Bar Container - slimmer bars */}
      <div className="w-full max-w-12 md:max-w-14 lg:max-w-12 xl:max-w-14 flex-1 flex flex-col justify-end relative">
        <div
          className={`w-full ${colorClass} rounded-t-lg shadow-lg will-change-transform relative`}
          style={{
            height: `${barHeightPercent}%`,
            minHeight: animatedHeight > 0 ? '6px' : '0px',
            transform: 'translateZ(0)', // Force GPU acceleration
          }}
        >
          {/* Correct Answer Checkmark on Bar - mobile optimized */}
          {choice.id === correctAnswer.id && barHeightPercent > 20 && (
            <div className="absolute top-1 right-1 md:top-2 md:right-2 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6">
              <CheckCircle className="w-full h-full text-white drop-shadow-lg opacity-90" />
            </div>
          )}
        </div>
      </div>

      {/* Choice letter - mobile optimized */}
      <div className="mt-2 md:mt-4 h-6 md:h-8 flex items-center justify-center">
        <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white/20 flex items-center justify-center rounded-full">
          <span className="text-sm md:text-lg lg:text-xl font-bold text-white drop-shadow-lg">
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

interface PlayerAnswerRevealScreenProps {
  answerResult: AnswerResult;
  timeLimit?: number;
  questionNumber?: number;
  totalQuestions?: number;
  onTimeExpired?: () => void;
}

export const PlayerAnswerRevealScreen: React.FC<PlayerAnswerRevealScreenProps> = ({
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
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const timeoutTriggered = useRef(false);
  const questionIdRef = useRef(question.id);

  // Reset animation when question actually changes
  useEffect(() => {
    if (questionIdRef.current !== question.id) {
      questionIdRef.current = question.id;
      setIsAnimationStarted(false);
      timeoutTriggered.current = false;
      setCurrentTime(timeLimit);
      setIsTimeExpired(false);
    }
  }, [question.id, timeLimit]);

  // Start animation after component mounts or question changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationStarted(true);
    }, 200); // Reduced initial delay

    return () => clearTimeout(timer);
  }, [question.id]); // Only restart animation when question changes

  // Reset timer when timeLimit changes
  useEffect(() => {
    setCurrentTime(timeLimit);
    setIsTimeExpired(false);
    timeoutTriggered.current = false;
  }, [timeLimit]);

  // Internal timer countdown
  useEffect(() => {
    if (!timeLimit || timeLimit <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          if (!timeoutTriggered.current) {
            timeoutTriggered.current = true;
            setIsTimeExpired(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit]);

  // Handle timeout navigation in separate effect
  useEffect(() => {
    if (isTimeExpired) {
      // Use setTimeout to ensure navigation happens after current render cycle
      const timeoutId = setTimeout(() => {
        if (onTimeExpired) {
          onTimeExpired();
        } else {
          // Default navigation to leaderboard screen
          router.push('/player-leaderboard-screen');
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [isTimeExpired, onTimeExpired, router]);

  // Get color classes for each choice - matching HostAnswerScreen exactly
  const getChoiceColors = () => {
    switch (question.type) {
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

  const colorClasses = getChoiceColors();

  // Find max percentage for scaling bars (guard against empty or zero)
  const maxPercentage = Math.max(0, ...statistics.map((stat) => stat.percentage)) || 1;

  // Check if it's mobile (you can adjust this breakpoint as needed)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

        {isMobile ? (
          /* Mobile Layout - Optimized for smaller screens */
          <div className="relative z-10 h-full flex flex-col pt-40">
            {/* Question Text - mobile optimized */}
            <div className="px-4 py-2 text-center">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg leading-tight">
                {question.text}
              </h2>
            </div>

            {/* Bar Chart Section - mobile optimized */}
            <div className="flex-1 flex items-center justify-center px-3 py-2">
              <div className="w-full max-w-5xl">
                {/* Chart Title/Label - mobile optimized */}
                <div className="text-center mb-2">
                  <h3 className="text-2xl font-bold text-white/90 mb-0">回答結果</h3>
                </div>

                {/* Chart Container with Background - mobile optimized */}
                <div className="relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 shadow-xl">
                  {/* Decorative corner elements - mobile optimized */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-white/20 rounded-tl-lg"></div>
                  <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-white/20 rounded-tr-lg"></div>
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-white/20 rounded-bl-lg"></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-white/20 rounded-br-lg"></div>

                  <div
                    className="flex items-end justify-center space-x-2"
                    style={{ height: '200px' }}
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
                          questionId={question.id}
                          questionType={question.type}
                        />
                      );
                    })}
                  </div>

                  {/* Chart bottom decoration - mobile optimized */}
                  <div className="mt-2 flex justify-center items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                  </div>

                  {/* Statistics summary - mobile optimized */}
                  <div className="mt-2 text-center">
                    <p className="text-xs text-white/70">
                      総回答数: {statistics.reduce((sum, stat) => sum + stat.count, 0)}人
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Options Grid 2x2 - mobile optimized */}
            <div className="px-2 pb-6">
              <div className="grid grid-cols-2 gap-2 max-w-3xl mx-auto">
                {question.choices.map((choice, index) => {
                  const isCorrect = correctAnswer.id === choice.id;
                  const colorClass = colorClasses[index];
                  const borderClass = isCorrect ? 'border-white/60' : 'border-2';

                  return (
                    <div
                      key={choice.id}
                      className={`relative p-3 rounded-2xl ${borderClass} ${colorClass} backdrop-blur-sm transition-all duration-300 ${
                        isCorrect
                          ? 'ring-1 ring-white/50 shadow-xl brightness-110'
                          : 'opacity-40 shadow-md'
                      }`}
                    >
                      {/* Correct answer checkmark - mobile optimized */}
                      {isCorrect && (
                        <div className="absolute -top-1 -right-1 w-6 h-6">
                          <CheckCircle className="w-full h-full text-white drop-shadow-2xl" />
                        </div>
                      )}

                      {/* Choice Content - mobile optimized */}
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white/20 flex items-center justify-center rounded-full">
                          <span className="text-sm font-bold text-white drop-shadow-lg">
                            {question.type === 'true_false'
                              ? choice.text === 'True' ||
                                choice.text === '正しい' ||
                                choice.text === 'はい'
                                ? '○'
                                : '×'
                              : choice.letter}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-white/95 flex-1 leading-tight">
                          {choice.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* PC Layout - Optimized and Compact */
          <div className="relative z-10 h-full flex flex-col pt-16">
            {/* Question Text */}
            <div className="px-6 py-3 text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-white drop-shadow-lg leading-tight">
                {question.text}
              </h2>
            </div>

            {/* Bar Chart Section */}
            <div className="flex-1 flex items-center justify-center px-6 py-4">
              <div className="w-full max-w-4xl">
                {/* Chart Title/Label */}
                <div className="text-center mb-4">
                  <h3 className="text-3xl lg:text-4xl font-bold text-white/90 mb-1">回答結果</h3>
                  <div className="w-20 h-0.5 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] mx-auto rounded-full"></div>
                </div>

                {/* Chart Container with Background */}
                <div className="relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 lg:p-6 shadow-xl">
                  {/* Decorative corner elements */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-white/20 rounded-tl-lg"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-white/20 rounded-tr-lg"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-white/20 rounded-bl-lg"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-white/20 rounded-br-lg"></div>

                  <div
                    className="flex items-end justify-center space-x-6"
                    style={{ height: '280px' }}
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
                          questionId={question.id}
                          questionType={question.type}
                        />
                      );
                    })}
                  </div>

                  {/* Chart bottom decoration */}
                  <div className="mt-4 flex justify-center items-center space-x-2">
                    <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] rounded-full"></div>
                    <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                  </div>

                  {/* Statistics summary */}
                  <div className="mt-3 text-center">
                    <p className="text-sm text-white/70">
                      総回答数: {statistics.reduce((sum, stat) => sum + stat.count, 0)}人
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Options Grid 2x2 */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-3 lg:gap-4 max-w-3xl mx-auto">
                {question.choices.map((choice, index) => {
                  const isCorrect = correctAnswer.id === choice.id;
                  const colorClass = colorClasses[index];
                  const borderClass = isCorrect ? 'border-white/60' : 'border-2';

                  return (
                    <div
                      key={choice.id}
                      className={`relative p-3 lg:p-4 rounded-2xl ${borderClass} ${colorClass} backdrop-blur-sm transition-all duration-300 ${
                        isCorrect
                          ? 'ring-2 ring-white/50 shadow-xl brightness-110'
                          : 'opacity-40 shadow-lg'
                      }`}
                    >
                      {/* Correct answer checkmark */}
                      {isCorrect && (
                        <div className="absolute -top-1 -right-1 w-7 h-7 lg:w-8 lg:h-8">
                          <CheckCircle className="w-full h-full text-white drop-shadow-2xl" />
                        </div>
                      )}

                      {/* Choice Content */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 lg:w-11 lg:h-11 bg-white/20 flex items-center justify-center rounded-full">
                          <span className="text-base lg:text-lg font-bold text-white drop-shadow-lg">
                            {question.type === 'true_false'
                              ? choice.text === 'True' ||
                                choice.text === '正しい' ||
                                choice.text === 'はい'
                                ? '○'
                                : '×'
                              : choice.letter}
                          </span>
                        </div>
                        <div className="text-sm lg:text-base font-medium text-white/95 flex-1 leading-tight">
                          {choice.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Main>
    </PageContainer>
  );
};
