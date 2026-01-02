'use client';

import React, { useState, useEffect, Suspense, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageContainer, Container, Main } from '@/components/ui';
import { QRCode } from '@/components/ui/QRCode';
import {
  PublicCountdownScreen,
  HostQuestionScreen,
  HostAnswerScreen,
  HostAnswerRevealScreen,
  HostLeaderboardScreen,
  HostExplanationScreen,
  HostPodiumScreen,
} from '@/components/game';
import { useSocket } from '@/components/providers/SocketProvider';
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import type { QuestionWithAnswers } from '@/types/quiz';
import { Question, LeaderboardData } from '@/types/game';

type PublicPhase =
  | 'waiting'
  | 'countdown'
  | 'question'
  | 'answering'
  | 'answer_reveal'
  | 'leaderboard'
  | 'explanation'
  | 'podium'
  | 'ended';

function HostScreenContent() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const gameIdParam = searchParams.get('gameId') || '';
  const { socket, isConnected, joinRoom, leaveRoom } = useSocket();

  const [joinUrl, setJoinUrl] = useState('');
  const [gameId, setGameId] = useState<string | null>(gameIdParam || null);
  const [currentPhase, setCurrentPhase] = useState<PublicPhase>('waiting');
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [currentQuestionData, setCurrentQuestionData] = useState<{
    question: Question;
    serverTime: string | null;
    isActive: boolean;
    answeringTime?: number;
    showQuestionTime?: number;
    showExplanationTime?: number;
    totalQuestions?: number;
  } | null>(null);
  const [countdownStartedAt, setCountdownStartedAt] = useState<number | undefined>(undefined);
  const [isDisplayPhaseDone, setIsDisplayPhaseDone] = useState(false);
  const [answerRemainingMs, setAnswerRemainingMs] = useState<number | null>(null);
  // State for explanation data
  const [explanationData, setExplanationData] = useState<{
    title: string | null;
    text: string | null;
    image_url: string | null;
    show_time: number;
  } | null>(null);
  const hasJoinedRoomRef = useRef(false);
  const currentPhaseRef = useRef<PublicPhase>('waiting');
  const currentQuestionIdRef = useRef<string | null>(null);
  const socketIdRef = useRef<string | null>(null);

  // Public screen phase ordering used to prevent "downgrade" transitions from host/gameflow events.
  // Example: the screen may locally transition `question -> answering` based on timer,
  // while host may still broadcast `phase=question`. Ignore that downgrade to avoid flicker.
  const phasePriority: Record<PublicPhase, number> = useMemo(
    () => ({
      waiting: 0,
      countdown: 1,
      question: 2,
      answering: 3,
      answer_reveal: 4,
      leaderboard: 5,
      explanation: 6,
      podium: 7,
      ended: 8,
    }),
    [],
  );

  useEffect(() => {
    // Use current origin so QR works in dev/prod, and prefill code if present.
    const origin = window.location.origin;
    const url = `${origin}/join${roomCode ? `?code=${encodeURIComponent(roomCode)}` : ''}`;
    setJoinUrl(url);
  }, [roomCode]);

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  // Get gameId from room code if not provided
  useEffect(() => {
    if (gameId || !roomCode) return;

    const getGameIdFromCode = async () => {
      try {
        const storedGameId = sessionStorage.getItem(`game_${roomCode}`);
        if (storedGameId) {
          setGameId(storedGameId);
          return;
        }

        const { data: game, error } = await gameApi.getGameByCode(roomCode);
        if (error || !game) {
          console.error('Failed to get game by code:', error);
          return;
        }
        setGameId(game.id);
        sessionStorage.setItem(`game_${roomCode}`, game.id);
      } catch (err) {
        console.error('Failed to get game ID:', err);
      }
    };

    getGameIdFromCode();
  }, [roomCode, gameId]);

  // Load quiz data once (for fallback)
  useEffect(() => {
    if (!gameId) return;
    const loadQuiz = async () => {
      try {
        const { data: game, error } = await gameApi.getGame(gameId);
        if (error || !game) {
          console.error('Failed to get game:', error);
          return;
        }
        const quizSetId = game?.quiz_id || game?.quiz_set_id;
        if (quizSetId) {
          const quiz = await quizService.getQuizComplete(quizSetId);
          const sorted = [...quiz.questions].sort((a, b) => a.order_index - b.order_index);
          setQuestions(sorted);
        }
      } catch (err) {
        console.error('Failed to load quiz for game', err);
      }
    };
    loadQuiz();
  }, [gameId]);

  // Use game flow for timer and question state - sync with backend
  const { gameFlow, timerState } = useGameFlow({
    gameId: gameId || '',
    isHost: false, // Public screen is not the host
    autoSync: true,
    events: {
      onQuestionStart: (questionId, questionIndex) => {
        console.log('Public Screen: Question started', questionId, questionIndex);

        // Check if this is a genuinely new question (different from current)
        const isNewQuestion = questionId !== currentQuestionIdRef.current;
        if (isNewQuestion) {
          console.log('[HostScreen] New question detected, resetting to question phase');
          currentQuestionIdRef.current = questionId;
          setIsDisplayPhaseDone(false);
          setAnswerRemainingMs(null);
          setCurrentPhase('question');
          return;
        }

        // For the same question, only transition if we're in early phases
        // Don't override post-question phases for the same question
        const currentPhase = currentPhaseRef.current;
        const shouldTransitionToQuestion =
          currentPhase === 'waiting' || currentPhase === 'countdown' || currentPhase === 'ended';
        if (shouldTransitionToQuestion) {
          setIsDisplayPhaseDone(false);
          setCurrentPhase('question');
        } else {
          console.log(
            '[HostScreen] Ignoring question start - already in phase:',
            currentPhase,
            'for same question',
          );
        }
      },
      onQuestionEnd: () => {
        console.log('Public Screen: Question ended');
        // Don't auto-transition - wait for host to reveal answer
      },
      onAnswerReveal: () => {
        console.log('Public Screen: Answer revealed');
        // Only transition to answer_reveal if we're in earlier phases
        // Don't override leaderboard or explanation phases
        const current = currentPhaseRef.current;
        if (
          current === 'question' ||
          current === 'answering' ||
          current === 'waiting' ||
          current === 'countdown'
        ) {
          setCurrentPhase('answer_reveal');
        } else {
          console.log('[HostScreen] Ignoring answer reveal - already in phase:', current);
        }
      },
      onExplanationShow: (questionId, explanation) => {
        console.log('Public Screen: Explanation shown', questionId, explanation);
        // Only transition to explanation if there's actual content
        const hasContent =
          (explanation.text && explanation.text.trim() !== '') ||
          (explanation.title && explanation.title.trim() !== '');

        if (hasContent) {
          setExplanationData({
            title: explanation.title,
            text: explanation.text,
            image_url: explanation.image_url,
            show_time: explanation.show_time || 10,
          });
          setCurrentPhase('explanation');
        } else {
          // No explanation content, skip explanation phase
          console.log(
            'Public Screen: Explanation event received but no content, skipping explanation',
          );
          // Wait for host to advance to next question or podium
        }
      },
      onExplanationHide: (questionId) => {
        console.log('Public Screen: Explanation hidden', questionId);
        // Explanation phase ended, move to next phase
        // This will be handled by the explanation screen's onTimeExpired
      },
      onGameEnd: () => {
        console.log('Public Screen: Game ended');
        setCurrentPhase('podium');
      },
      onError: (err) => console.error('Public Screen GameFlow Error:', err),
    },
  });

  // Keep a ref for the current questionId so socket handlers never go stale.
  useEffect(() => {
    currentQuestionIdRef.current = gameFlow?.current_question_id ?? null;
  }, [gameFlow?.current_question_id]);

  const {
    leaderboard,
    loading: leaderboardLoading,
    refreshLeaderboard,
  } = useGameLeaderboard({
    gameId: gameId || '',
    autoRefresh: true,
  });

  // Fetch current question from API when question changes (with full metadata)
  useEffect(() => {
    if (!gameId || !gameFlow?.current_question_id) {
      setCurrentQuestionData(null);
      return;
    }

    const fetchCurrentQuestion = async () => {
      try {
        const { data, error } = await gameApi.getCurrentQuestion(gameId);
        if (error || !data) {
          console.error('Failed to fetch current question:', error);
          return;
        }

        // Transform API response to Question format
        const answeringTime = data.question.answering_time || 30;
        const showQuestionTime = data.question.show_question_time || 10;
        const timeLimit = showQuestionTime + answeringTime;

        const question: Question = {
          id: data.question.id,
          text: data.question.text,
          image: data.question.image_url || undefined,
          timeLimit: timeLimit,
          show_question_time: showQuestionTime,
          answering_time: answeringTime,
          show_explanation_time: data.question.show_explanation_time,
          choices: data.answers
            .sort((a, b) => a.order_index - b.order_index)
            .map((a, i) => ({
              id: a.id,
              text: a.text,
              letter: ['A', 'B', 'C', 'D'][i] || String.fromCharCode(65 + i),
            })),
          correctAnswerId: data.answers.find((a) => a.is_correct)?.id || '',
          explanation: data.question.explanation_text || undefined,
          type: (data.question.type as Question['type']) || 'multiple_choice_4',
        };

        setCurrentQuestionData({
          question,
          serverTime: data.server_time,
          isActive: data.is_active,
          answeringTime,
          showQuestionTime,
          showExplanationTime: data.question.show_explanation_time,
          totalQuestions: data.total_questions,
        });
      } catch (err) {
        console.error('Error fetching current question:', err);
      }
    };

    fetchCurrentQuestion();

    // Refresh question data periodically to sync with server (every 5 seconds)
    const refreshInterval = setInterval(fetchCurrentQuestion, 5000);
    return () => clearInterval(refreshInterval);
  }, [gameId, gameFlow?.current_question_id]);

  // Listen for WebSocket events to sync with host control panel
  useEffect(() => {
    if (!socket || !isConnected || !gameId) return;

    // If the socket reconnects (new socket.id), ensure we re-join the room.
    const currentSocketId = socket.id || null;
    if (socketIdRef.current !== currentSocketId) {
      if (socketIdRef.current) {
        console.log('[HostScreen] Socket ID changed, resetting room join guard');
        hasJoinedRoomRef.current = false;
      }
      socketIdRef.current = currentSocketId;
    }

    // Join the game room using provider helper (dedup + registration guard)
    const doJoinRoom = () => {
      if (hasJoinedRoomRef.current) {
        console.log('[HostScreen] Already joined room, skipping duplicate join');
        return;
      }
      console.log('[HostScreen] Joining room:', gameId);
      joinRoom(gameId);
      hasJoinedRoomRef.current = true;
    };

    doJoinRoom();

    // Listen for phase changes from host
    const handlePhaseChange = (data: {
      roomId: string;
      phase: PublicPhase;
      startedAt?: number;
    }) => {
      if (data.roomId === gameId) {
        console.log('[HostScreen] Phase change event received:', {
          from: currentPhaseRef.current,
          to: data.phase,
          startedAt: data.startedAt,
        });
        // Prevent phase "downgrades" that cause flicker (e.g. answering -> question)
        const current = currentPhaseRef.current;
        if (data.phase !== 'waiting') {
          // Allow valid transitions even if they appear as downgrades:
          // - explanation -> countdown (starting next question after explanation)
          // - leaderboard -> countdown (starting next question after leaderboard)
          // - IMPORTANT: Always allow transitions TO explanation and leaderboard from any phase
          const isValidTransition =
            (current === 'explanation' && data.phase === 'countdown') ||
            (current === 'leaderboard' && data.phase === 'countdown') ||
            data.phase === 'explanation' ||
            data.phase === 'leaderboard';

          const currentRank = phasePriority[current];
          const nextRank = phasePriority[data.phase];
          if (
            !isValidTransition &&
            Number.isFinite(currentRank) &&
            Number.isFinite(nextRank) &&
            nextRank < currentRank
          ) {
            console.log('[HostScreen] Ignoring phase downgrade:', current, '->', data.phase);
            return;
          }
        }

        console.log('[HostScreen] Applying phase change to:', data.phase);
        setCurrentPhase(data.phase);
        // Store countdown start timestamp for synchronization
        if (data.phase === 'countdown' && data.startedAt) {
          setCountdownStartedAt(data.startedAt);
        }
        // Phase change handled by game flow events
      }
    };

    // Listen for answer stats updates
    const handleStatsUpdate = (data: {
      roomId: string;
      questionId: string;
      counts: Record<string, number>;
    }) => {
      if (data.roomId === gameId && data.questionId === currentQuestionIdRef.current) {
        setAnswerStats(data.counts);
      }
    };

    // Listen for question ended (answer reveal triggered)
    const handleQuestionEnd = (data: { roomId: string; questionId?: string }) => {
      if (data.roomId === gameId) {
        console.log('Public Screen: Question ended, moving to answer reveal');
        setCurrentPhase('answer_reveal');
      }
    };

    // Listen for answer locked (alternative event for answer reveal)
    const handleAnswerLocked = (data: {
      roomId: string;
      questionId: string;
      counts?: Record<string, number>;
    }) => {
      if (data.roomId === gameId) {
        if (data.counts && data.questionId === currentQuestionIdRef.current) {
          setAnswerStats(data.counts);
        }
        console.log('Public Screen: Answer locked, moving to answer reveal');
        setCurrentPhase('answer_reveal');
      }
    };

    // Listen for game started event
    const handleGameStarted = (data: { roomId?: string; gameId?: string; roomCode?: string }) => {
      const targetGameId = data.gameId || data.roomId;
      if (targetGameId === gameId || data.roomCode === roomCode) {
        console.log('Public Screen: Game started');
        setCurrentPhase('countdown');
      }
    };

    // Listen for game pause event
    const handleGamePause = (data: { gameId?: string; timestamp?: string }) => {
      const targetGameId = data.gameId;
      if (targetGameId === gameId) {
        console.log('Public Screen: Game paused');
        // Timer will be paused by useGameFlow hook
      }
    };

    // Listen for game resume event
    const handleGameResume = (data: { gameId?: string; timestamp?: string }) => {
      const targetGameId = data.gameId;
      if (targetGameId === gameId) {
        console.log('Public Screen: Game resumed');
        // Timer will be resumed by useGameFlow hook
      }
    };

    // Listen for game end event
    const handleGameEnd = (data: { gameId?: string; timestamp?: string }) => {
      const targetGameId = data.gameId;
      if (targetGameId === gameId) {
        console.log('Public Screen: Game ended');
        setCurrentPhase('ended');
      }
    };

    socket.on('game:phase:change', handlePhaseChange);
    socket.on('game:answer:stats:update', handleStatsUpdate);
    // Legacy compatibility (some clients/servers emit this name)
    socket.on('game:answer:stats', handleStatsUpdate);
    socket.on('game:question:ended', handleQuestionEnd);
    socket.on('game:answer:locked', handleAnswerLocked);
    socket.on('game:started', handleGameStarted);
    socket.on('game:pause', handleGamePause);
    socket.on('game:resume', handleGameResume);
    socket.on('game:end', handleGameEnd);

    return () => {
      socket.off('game:phase:change', handlePhaseChange);
      socket.off('game:answer:stats:update', handleStatsUpdate);
      socket.off('game:answer:stats', handleStatsUpdate);
      socket.off('game:question:ended', handleQuestionEnd);
      socket.off('game:answer:locked', handleAnswerLocked);
      socket.off('game:started', handleGameStarted);
      socket.off('game:pause', handleGamePause);
      socket.off('game:resume', handleGameResume);
      socket.off('game:end', handleGameEnd);

      // Leave room on unmount
      if (gameId && hasJoinedRoomRef.current) {
        console.log('[HostScreen] Leaving room on unmount');
        leaveRoom(gameId);
        hasJoinedRoomRef.current = false;
      }
    };
    // Deliberately do not depend on gameFlow/question to avoid join/leave churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected, gameId, roomCode]);

  // Reset display phase when question changes
  useEffect(() => {
    if (!gameFlow?.current_question_id) return;
    setIsDisplayPhaseDone(false);
    setAnswerRemainingMs(null);
    // Clear stats between questions so we never display cumulative totals.
    setAnswerStats({});
    // Reset explanation data for new question
    setExplanationData(null);
  }, [gameFlow?.current_question_id]);

  // Sync phase with game flow state - but don't interrupt countdown or post-question phases
  useEffect(() => {
    if (!gameFlow) return;
    // Don't transition if we're in countdown phase - let countdown complete naturally
    if (currentPhase === 'countdown') return;
    // Don't auto-promote from post-question phases (answer_reveal, leaderboard, explanation)
    // These should only change via explicit host actions
    if (
      currentPhase === 'answer_reveal' ||
      currentPhase === 'leaderboard' ||
      currentPhase === 'explanation'
    ) {
      return;
    }
    if (gameFlow.current_question_id && timerState?.isActive) {
      const canPromoteToQuestion =
        currentPhase === 'waiting' || currentPhase === 'ended' || currentPhase === 'podium';
      if (canPromoteToQuestion) {
        setIsDisplayPhaseDone(false);
        setCurrentPhase('question');
      }
    }
  }, [gameFlow, gameFlow?.current_question_id, timerState?.isActive, currentPhase]);

  // Derive per-question timing - prefer API data, fallback to questions array
  const questionTimings = useMemo(() => {
    // Prefer API data if available (most accurate)
    if (
      currentQuestionData?.showQuestionTime !== undefined &&
      currentQuestionData?.answeringTime !== undefined
    ) {
      return {
        showQuestionTime: currentQuestionData.showQuestionTime,
        answeringTime: currentQuestionData.answeringTime,
      };
    }
    // Fallback to questions array
    const idx = gameFlow?.current_question_index ?? 0;
    const q = questions[idx];
    if (q) {
      return {
        showQuestionTime: q.show_question_time || 10,
        answeringTime: q.answering_time || 30,
      };
    }
    return {
      showQuestionTime: 10,
      answeringTime: 30,
    };
  }, [
    currentQuestionData?.showQuestionTime,
    currentQuestionData?.answeringTime,
    questions,
    gameFlow?.current_question_index,
  ]);

  // Timer updates are handled by useGameFlow hook via timerState

  // Use current question from API if available, otherwise fallback to local quiz data
  const currentQuestion: Question = useMemo(() => {
    // Prefer API data (has full metadata and server timestamps)
    if (currentQuestionData?.question) {
      return currentQuestionData.question;
    }

    // Fallback to local quiz data
    const questionIndex = gameFlow?.current_question_index ?? 0;
    const questionData = questions[questionIndex];
    if (questionData) {
      const showTimeSeconds = questionData.show_question_time || 10;
      const answeringTimeSeconds = questionData.answering_time || 30;
      return {
        id: questionData.id,
        text: questionData.question_text,
        image: questionData.image_url || undefined,
        timeLimit: showTimeSeconds + answeringTimeSeconds,
        show_question_time: showTimeSeconds,
        answering_time: answeringTimeSeconds,
        choices: questionData.answers
          .sort((a, b) => a.order_index - b.order_index)
          .map((a, i) => ({
            id: a.id,
            text: a.answer_text,
            letter: ['A', 'B', 'C', 'D'][i] || String.fromCharCode(65 + i),
          })),
        correctAnswerId: questionData.answers.find((a) => a.is_correct)?.id || '',
        explanation: questionData.explanation_text || undefined,
        type: (questionData.question_type as Question['type']) || 'multiple_choice_4',
      };
    }
    return {
      id: 'loading',
      text: '読み込み中...',
      timeLimit: 10,
      show_question_time: 10,
      answering_time: 30,
      choices: [],
      correctAnswerId: '',
      type: 'multiple_choice_4',
    };
  }, [currentQuestionData, questions, gameFlow?.current_question_index]);

  // Calculate display remaining time (exactly like player screen)
  const derivedRemainingMsFromFlow =
    gameFlow?.current_question_start_time && gameFlow?.current_question_end_time
      ? Math.max(0, new Date(gameFlow.current_question_end_time).getTime() - Date.now())
      : null;

  // Validate and sanitize time values to prevent NaN (exactly like player screen)
  const showQuestionTime = Number.isFinite(currentQuestion.show_question_time)
    ? currentQuestion.show_question_time
    : (questionTimings.showQuestionTime ?? 10); // Default fallback
  const answeringTime = Number.isFinite(currentQuestion.answering_time)
    ? currentQuestion.answering_time
    : (questionTimings.answeringTime ?? 30); // Default fallback

  const totalDurationMs = (showQuestionTime + answeringTime) * 1000;

  const totalRemainingMs =
    timerState?.remainingMs ??
    derivedRemainingMsFromFlow ??
    (currentPhase === 'question' ? totalDurationMs : answeringTime * 1000);

  const viewingDurationMs = showQuestionTime * 1000;
  const elapsedMs = Math.max(
    0,
    totalDurationMs - (Number.isFinite(totalRemainingMs) ? totalRemainingMs : 0),
  );

  const viewingRemainingMs = Math.max(0, viewingDurationMs - elapsedMs);
  const answeringRemainingMsDerived = Math.max(
    0,
    Number.isFinite(totalRemainingMs) ? totalRemainingMs : 0,
  );

  const displayRemainingMs =
    currentPhase === 'question' ? viewingRemainingMs : answeringRemainingMsDerived;

  const startAnsweringPhase = useCallback(() => {
    if (isDisplayPhaseDone) return;
    console.log('Public Screen: Display phase complete, moving to answering');
    // Use validated answering time to prevent NaN
    const safeAnsweringTime = Number.isFinite(currentQuestion.answering_time)
      ? currentQuestion.answering_time
      : (questionTimings.answeringTime ?? 30); // Default fallback
    const durationMs = safeAnsweringTime * 1000;
    setIsDisplayPhaseDone(true);
    setAnswerRemainingMs(durationMs);
    setCurrentPhase('answering');
  }, [currentQuestion.answering_time, questionTimings.answeringTime, isDisplayPhaseDone]);

  // Track when we entered question phase to prevent immediate transition
  const questionPhaseEnteredAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (currentPhase === 'question') {
      if (questionPhaseEnteredAtRef.current === null) {
        questionPhaseEnteredAtRef.current = Date.now();
      }
    } else {
      questionPhaseEnteredAtRef.current = null;
    }
  }, [currentPhase]);

  // Move to answering once the question display timer expires (player-style)
  useEffect(() => {
    if (currentPhase !== 'question') return;
    if (displayRemainingMs <= 0 && !isDisplayPhaseDone) {
      // Prevent immediate transition - ensure we've been in question phase for at least 500ms
      // This prevents the case where countdown completes and timer is already expired
      const timeInQuestionPhase = questionPhaseEnteredAtRef.current
        ? Date.now() - questionPhaseEnteredAtRef.current
        : 0;
      if (timeInQuestionPhase < 500) {
        console.log('[HostScreen] Delaying answering transition - just entered question phase');
        return;
      }
      startAnsweringPhase();
    }
  }, [currentPhase, displayRemainingMs, isDisplayPhaseDone, startAnsweringPhase]);

  // Client-side answering countdown (separate from display timer) - exactly like player screen
  useEffect(() => {
    if (currentPhase !== 'answering') return;
    if (answerRemainingMs === null || answerRemainingMs <= 0) return;

    // Set up interval to decrement timer every second
    const interval = setInterval(() => {
      setAnswerRemainingMs((prev) => {
        if (prev === null) return null;
        const newRemaining = Math.max(0, prev - 1000);
        return newRemaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPhase, answerRemainingMs]);

  // Transition to answer_reveal when answering timer expires (like player screen)
  const hasTransitionedToRevealRef = useRef(false);
  useEffect(() => {
    if (currentPhase !== 'answering') {
      // Reset transition flag when leaving answering phase
      hasTransitionedToRevealRef.current = false;
      return;
    }
    if (hasTransitionedToRevealRef.current) return;
    if (answerRemainingMs === null || answerRemainingMs > 0) return;

    // Timer has expired, transition to answer_reveal
    console.log('HostScreen: Answering timer expired, transitioning to answer_reveal');
    hasTransitionedToRevealRef.current = true;
    setAnswerRemainingMs(0);
    setCurrentPhase('answer_reveal');
  }, [currentPhase, answerRemainingMs]);

  // Calculate answering remaining time (exactly like player screen)
  const answeringRemainingMs =
    answerRemainingMs !== null && Number.isFinite(answerRemainingMs)
      ? answerRemainingMs
      : (Number.isFinite(answeringTime) ? answeringTime : 30) * 1000;

  // Current time in seconds (exactly like player screen)
  const currentTimeSeconds = useMemo(() => {
    if (currentPhase === 'question') {
      const time = Number.isFinite(displayRemainingMs) ? displayRemainingMs : 0;
      return Math.max(0, Math.round(time / 1000));
    } else if (currentPhase === 'answering') {
      // Use answerRemainingMs for answering phase timer
      const time = Number.isFinite(answeringRemainingMs) ? answeringRemainingMs : 0;
      return Math.max(0, Math.round(time / 1000));
    }
    return 0;
  }, [currentPhase, displayRemainingMs, answeringRemainingMs]);

  const questionIndex = gameFlow?.current_question_index ?? 0;
  const totalQuestionsCount = useMemo(() => {
    // Prefer API data if available
    if (currentQuestionData?.totalQuestions) {
      return currentQuestionData.totalQuestions;
    }
    // Fallback to questions array length
    return questions.length || 0;
  }, [currentQuestionData?.totalQuestions, questions.length]);

  // Shape leaderboard entries exactly like player side expects.
  const leaderboardEntries = useMemo(() => {
    if (!Array.isArray(leaderboard)) return [];
    return leaderboard
      .map((entry) => ({
        playerId: entry.player_id,
        playerName: entry.player_name,
        score: entry.score,
        rank: entry.rank,
        previousRank: entry.previous_rank ?? entry.rank,
        rankChange: (entry.rank_change || 'same') as 'up' | 'down' | 'same',
        scoreChange: entry.score_change ?? 0,
      }))
      .sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }, [leaderboard]);

  // Refresh leaderboard when entering leaderboard phase (like player screen)
  useEffect(() => {
    if (currentPhase === 'leaderboard' && gameId && refreshLeaderboard) {
      console.log('[HostScreen Leaderboard] Refreshing leaderboard on phase entry');
      refreshLeaderboard();
    }
  }, [currentPhase, gameId, refreshLeaderboard]);

  // Redirect from leaderboard if it's the last question (go directly to podium) - like player screen
  useEffect(() => {
    if (currentPhase === 'leaderboard' && gameFlow) {
      const currentQuestionNum = questionIndex + 1;
      const isLastQuestion = currentQuestionNum >= totalQuestionsCount;

      if (isLastQuestion) {
        console.log(
          'HostScreen: Last question detected in leaderboard phase, redirecting to podium',
        );
        setCurrentPhase('podium');
      }
    }
  }, [currentPhase, gameFlow, questionIndex, totalQuestionsCount]);

  // Fetch explanation data when entering explanation phase (fallback if WebSocket event didn't provide data)
  useEffect(() => {
    if (
      currentPhase === 'explanation' &&
      gameId &&
      gameFlow?.current_question_id &&
      !explanationData
    ) {
      const fetchExplanation = async () => {
        try {
          const questionId = gameFlow.current_question_id;
          if (!questionId) return;

          const { data, error } = await gameApi.getExplanation(gameId, questionId);
          if (error) {
            // Missing explanation is an expected case for many questions.
            // Avoid console.error noise (Next devtools will surface it as a red error).
            console.debug('[Explanation] No explanation available (or fetch failed)', {
              gameId,
              questionId,
              error,
            });
            return;
          } else if (data) {
            const hasContent =
              (data.explanation_text && data.explanation_text.trim() !== '') ||
              (data.explanation_title && data.explanation_title.trim() !== '');

            if (!hasContent) {
              console.debug('[Explanation] Explanation endpoint returned empty content', {
                gameId,
                questionId,
              });
              return;
            }
            setExplanationData({
              title: data.explanation_title,
              text: data.explanation_text,
              image_url: data.explanation_image_url,
              show_time: data.show_explanation_time || 10,
            });
          }
        } catch (err) {
          console.debug('[Explanation] Error fetching explanation (non-blocking)', err);
        }
      };
      fetchExplanation();
    }
  }, [currentPhase, gameId, gameFlow?.current_question_id, explanationData]);

  const leaderboardData: LeaderboardData = useMemo(
    () => ({
      entries: leaderboardEntries,
      questionNumber: questionIndex + 1,
      totalQuestions: totalQuestionsCount,
      timeRemaining: Math.max(0, Math.round((timerState?.remainingMs || 5000) / 1000)),
      timeLimit: 5,
    }),
    [leaderboardEntries, questionIndex, totalQuestionsCount, timerState?.remainingMs],
  );

  // Render different phases based on game state
  switch (currentPhase) {
    case 'countdown':
      return (
        <PublicCountdownScreen
          countdownTime={3}
          questionNumber={questionIndex + 1}
          totalQuestions={totalQuestionsCount}
          startedAt={countdownStartedAt}
          onCountdownComplete={() => {
            // Countdown completed - now transition to question phase
            console.log('[HostScreen] Countdown complete, transitioning to question phase');
            if (gameFlow?.current_question_id) {
              setIsDisplayPhaseDone(false);
              setAnswerRemainingMs(null);
              setCurrentPhase('question');
            }
          }}
        />
      );

    case 'question':
      return (
        <HostQuestionScreen
          question={{
            ...currentQuestion,
            timeLimit: currentQuestion.show_question_time,
          }}
          currentTime={currentTimeSeconds}
          questionNumber={questionIndex + 1}
          totalQuestions={totalQuestionsCount}
          // No controls on public screen - read-only display
        />
      );

    case 'answering':
      return (
        <HostAnswerScreen
          question={{
            ...currentQuestion,
            timeLimit: currentQuestion.answering_time,
          }}
          currentTime={currentTimeSeconds}
          questionNumber={questionIndex + 1}
          totalQuestions={totalQuestionsCount}
          // No controls on public screen - read-only display
        />
      );

    case 'answer_reveal': {
      if (!currentQuestion.choices || currentQuestion.choices.length === 0) {
        return (
          <div className="flex items-center justify-center h-screen">
            <div className="text-red-600 text-xl">問題データが読み込まれていません</div>
          </div>
        );
      }

      // IMPORTANT: Always compute totals only from the CURRENT question's choices.
      // This prevents inflated totals if answerStats contains keys from previous questions.
      const totalAnswered = currentQuestion.choices.reduce(
        (sum, choice) => sum + (answerStats[choice.id] ?? 0),
        0,
      );
      const statistics = currentQuestion.choices.map((choice) => {
        const count = answerStats[choice.id] || 0;
        return {
          choiceId: choice.id,
          count,
          percentage: totalAnswered > 0 ? (count / totalAnswered) * 100 : 0,
        };
      });

      const correctAnswerChoice =
        currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId) ||
        currentQuestion.choices[0]; // Fallback to first choice if not found

      const answerResult = {
        question: currentQuestion,
        correctAnswer: correctAnswerChoice,
        playerAnswer: undefined,
        isCorrect: false,
        statistics,
        totalPlayers: Array.isArray(leaderboard) ? leaderboard.length : leaderboardEntries.length,
        totalAnswered,
      };

      return (
        <HostAnswerRevealScreen
          answerResult={answerResult}
          questionNumber={questionIndex + 1}
          totalQuestions={totalQuestionsCount}
          timeLimit={5}
          onTimeExpired={() => {
            // Answer reveal must NOT auto-advance. We wait for the host to press "Next",
            // which will broadcast `game:phase:change` to move everyone forward.
            console.log('HostScreen: Answer reveal time expired, waiting for host to advance');
          }}
        />
      );
    }

    case 'leaderboard': {
      // Check if this is the last question - if so, show loading while redirecting
      const currentQuestionNum = questionIndex + 1;
      const isLastQuestion = currentQuestionNum >= totalQuestionsCount;

      // Show loading if redirecting (useEffect will handle the redirect)
      if (isLastQuestion) {
        return (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="p-6 text-white text-xl">リダイレクト中...</div>
            </div>
          </div>
        );
      }

      // Debug log for leaderboard phase
      console.log('[HostScreen Leaderboard Phase]', {
        rawLeaderboard: leaderboard,
        transformedEntries: leaderboardEntries,
        loading: leaderboardLoading,
        gameId,
        leaderboardData,
      });

      return (
        <HostLeaderboardScreen
          leaderboardData={leaderboardData}
          onTimeExpired={() => {
            // Leaderboard must NOT auto-advance. We wait for the host to press "Next",
            // which will broadcast `game:phase:change` to move everyone forward.
            console.log('HostScreen: Leaderboard time expired, waiting for host to advance');
          }}
        />
      );
    }

    case 'explanation': {
      const currentQuestionNum = questionIndex + 1;

      const handleExplanationTimeExpired = () => {
        // Explanation timer expired - wait for host to manually advance via phase change event
        // Do not auto-advance - public screen is read-only and waits for host control
        console.log('HostScreen: Explanation time expired, waiting for host to advance');
      };

      return (
        <HostExplanationScreen
          explanation={{
            questionNumber: currentQuestionNum,
            totalQuestions: totalQuestionsCount,
            timeLimit:
              currentQuestionData?.showExplanationTime ??
              explanationData?.show_time ??
              currentQuestion.show_explanation_time ??
              10,
            title: explanationData?.title || '解説',
            body:
              explanationData?.text || currentQuestion.explanation || '解説は近日追加されます。',
            image: explanationData?.image_url || undefined,
          }}
          onTimeExpired={handleExplanationTimeExpired}
        />
      );
    }

    case 'podium': {
      // Ensure leaderboard entries are properly formatted for podium
      const podiumEntries = Array.isArray(leaderboard)
        ? leaderboard
            .map((entry) => ({
              playerId: entry.player_id,
              playerName: entry.player_name,
              score: entry.score,
              rank: entry.rank,
              previousRank: entry.rank,
              rankChange: 'same' as const,
            }))
            .sort((a, b) => (a.rank || 0) - (b.rank || 0))
        : leaderboardEntries;

      console.log('[HostScreen Podium Phase]', {
        rawLeaderboard: leaderboard,
        podiumEntries,
        gameId,
      });

      return (
        <HostPodiumScreen
          entries={podiumEntries}
          onAnimationComplete={() => {
            // After podium animation completes, transition to ended phase
            console.log('HostScreen: Podium animation complete');
            setCurrentPhase('ended');
          }}
        />
      );
    }

    case 'ended':
      // Game end screen - show final message
      return (
        <PageContainer>
          <Main className="flex-1">
            <Container
              size="sm"
              className="flex flex-col items-center justify-center py-4 md:py-2 space-y-4 md:space-y-6"
            >
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  ゲーム終了
                </h1>
                <p className="mt-4 text-xl text-gray-600">ありがとうございました！</p>
              </div>
            </Container>
          </Main>
        </PageContainer>
      );

    case 'waiting':
    default:
      // Show waiting room with room code and QR code
      return (
        <PageContainer>
          <Main className="flex-1">
            <Container
              size="sm"
              className="flex flex-col items-center justify-center py-4 md:py-2 space-y-4 md:space-y-6"
            >
              {/* Public Display Title */}
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                  TUIZ情報王
                </h1>
                <div className="mt-3 relative inline-block">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl blur-sm opacity-50 scale-105"></div>

                  {/* Message container */}
                  <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-3 rounded-xl border border-cyan-200">
                    <p className="text-base md:text-lg font-semibold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
                      参加コードでクイズに参加しよう！
                    </p>
                  </div>
                </div>
              </div>

              {/* Room Code Display - Large for audience */}
              <div className="text-center">
                <div className="relative inline-block">
                  {/* Outer glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-30 scale-110"></div>

                  {/* Main container with 3D effect */}
                  <div className="relative bg-gradient-to-br from-cyan-100 via-blue-50 to-cyan-100 px-16 py-10 rounded-xl border-2 border-cyan-300 shadow-2xl transform hover:scale-105 hover:shadow-cyan-200/50 transition-all duration-300">
                    {/* Inner highlight */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>

                    <div className="relative">
                      <span className="text-8xl md:text-9xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                        {roomCode || '------'}
                      </span>
                    </div>
                  </div>

                  {/* Decorative corner elements */}
                  <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg"></div>
                  <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
                  <div className="absolute top-1/2 -right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md"></div>
                </div>
              </div>

              {/* QR Code for Join Page */}
              <div className="text-center max-w-md">
                <div className="relative inline-block">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl blur-sm opacity-50 scale-105"></div>

                  {/* QR Code container */}
                  <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-8 py-6 rounded-2xl border border-cyan-200">
                    <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent mb-4">
                      QRコードで参加
                    </h3>

                    {/* QR Code */}
                    <div className="relative inline-block mb-4">
                      {/* Outer glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-30 scale-110"></div>

                      {/* Main container with 3D effect */}
                      <div className="relative bg-gradient-to-br from-cyan-100 via-blue-50 to-cyan-100 px-8 py-8 rounded-xl border-2 border-cyan-300 shadow-2xl transform hover:scale-105 hover:shadow-cyan-200/50 transition-all duration-300">
                        {/* Inner highlight */}
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>

                        {/* QR Code */}
                        {joinUrl ? (
                          <QRCode value={joinUrl} size={300} className="rounded-lg" />
                        ) : (
                          <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">QRコード生成中...</p>
                          </div>
                        )}

                        {/* Decorative corner elements */}
                        <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg"></div>
                        <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
                        <div className="absolute top-1/2 -right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </Main>
        </PageContainer>
      );
  }
}

export default function HostScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostScreenContent />
    </Suspense>
  );
}
