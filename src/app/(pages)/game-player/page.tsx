'use client';

import React, { Suspense, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  PlayerCountdownScreen,
  PlayerAnswerScreen,
  PlayerAnswerRevealScreen,
  PlayerLeaderboardScreen,
  PlayerExplanationScreen,
  PlayerPodiumScreen,
  PlayerGameEndScreen,
  PlayerQuestionScreen,
} from '@/components/game';
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameAnswer } from '@/hooks/useGameAnswer';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { useDeviceId } from '@/hooks/useDeviceId';
import { useSocket } from '@/components/providers/SocketProvider';
import { Question, AnswerResult, LeaderboardEntry } from '@/types/game';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import { apiClient } from '@/lib/apiClient';
import type { QuestionWithAnswers } from '@/types/quiz';
import { toast } from 'react-hot-toast';

type PlayerPhase =
  | 'waiting'
  | 'countdown'
  | 'question'
  | 'answering'
  | 'answer_reveal'
  | 'leaderboard'
  | 'explanation'
  | 'podium'
  | 'ended';

function PlayerGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameIdParam = searchParams.get('gameId') || '';
  const roomCode = searchParams.get('code') || '';
  const [gameId, setGameId] = useState<string>(gameIdParam);
  const phaseParam = (searchParams.get('phase') as PlayerPhase) || 'countdown';
  const questionIdParam = searchParams.get('questionId') || 'placeholder-q1';
  const questionIndexParam = Number(searchParams.get('questionIndex') || '0');
  const totalQuestions = Number(searchParams.get('totalQuestions') || '10');
  const playerParam = searchParams.get('playerId') || '';
  const { deviceId } = useDeviceId();
  const playerId = playerParam || deviceId || 'anonymous-player';

  const [currentPhase, setCurrentPhase] = useState<PlayerPhase>(phaseParam);
  const [countdownStartedAt, setCountdownStartedAt] = useState<number | undefined>(undefined);

  // If we're already in countdown phase from URL, try to restore timestamp immediately
  useEffect(() => {
    if (phaseParam === 'countdown' && !countdownStartedAt) {
      const stored = sessionStorage.getItem(`countdown_started_${gameId}`);
      if (stored) {
        const timestamp = parseInt(stored, 10);
        if (!isNaN(timestamp)) {
          setCountdownStartedAt(timestamp);
        }
      }
    }
  }, [phaseParam, gameId, countdownStartedAt]);

  const { gameFlow, timerState, isConnected } = useGameFlow({
    gameId,
    autoSync: true,
    triggerOnQuestionEndOnTimer: false,
    events: {
      onQuestionStart: (qId, qIndex) => {
        console.log('Player: Question started', qId, qIndex);
        setIsDisplayPhaseDone(false);
        setAnswerDurationMs(null);
        setAnswerRemainingMs(null);
        setCurrentPhase('question');
        router.replace(
          `/game-player?gameId=${gameId}&phase=question&questionIndex=${qIndex}&playerId=${playerId}`,
        );
      },
      onQuestionEnd: () => {
        console.log('Player: Question ended, moving to answer reveal');
        setAnswerRemainingMs(0);
        setCurrentPhase('answer_reveal');
        router.replace(`/game-player?gameId=${gameId}&phase=answer_reveal&playerId=${playerId}`);
      },
      onAnswerReveal: () => {
        console.log('Player: Answer revealed');
        setCurrentPhase('answer_reveal');
        router.replace(`/game-player?gameId=${gameId}&phase=answer_reveal&playerId=${playerId}`);
      },
      onGameEnd: () => {
        console.log('Player: Game ended, moving to podium');
        setCurrentPhase('podium');
        router.replace(`/game-player?gameId=${gameId}&phase=podium&playerId=${playerId}`);
      },
      onError: (err) => console.error('Player GameFlow Error:', err),
    },
  });

  // Reset display/answer timers whenever a new question becomes current
  useEffect(() => {
    if (!gameFlow?.current_question_id) return;
    setIsDisplayPhaseDone(false);
    setAnswerDurationMs(null);
    setAnswerRemainingMs(null);
  }, [gameFlow?.current_question_id]);

  // Note: correctAnswerId will be passed after currentQuestion is computed below
  const [correctAnswerIdState, setCorrectAnswerIdState] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [quizPlaySettings, setQuizPlaySettings] = useState<{
    time_bonus: boolean;
    streak_bonus: boolean;
  } | null>(null);
  const [currentQuestionData, setCurrentQuestionData] = useState<{
    question: Question;
    serverTime: string | null;
    isActive: boolean;
    points: number;
    timeLimit: number;
    answeringTime?: number;
  } | null>(null);
  const [isDisplayPhaseDone, setIsDisplayPhaseDone] = useState(false);
  const [answerDurationMs, setAnswerDurationMs] = useState<number | null>(null);
  const [answerRemainingMs, setAnswerRemainingMs] = useState<number | null>(null);

  // Get current question data for point calculation
  // Prefer API data (has authoritative points and time_limit), fallback to local quiz data
  const currentQuestionForPoints = useMemo(() => {
    // Priority 1: Use API question data if available (most authoritative)
    if (currentQuestionData) {
      return {
        points: currentQuestionData.points ?? 100,
        answering_time: currentQuestionData.answeringTime ?? currentQuestionData.timeLimit ?? 30,
      };
    }

    // Priority 2: Use local quiz data as fallback
    if (!gameFlow?.current_question_id || !questions.length) return null;
    const questionIndex = gameFlow.current_question_index ?? 0;
    const questionData = questions[questionIndex];
    if (questionData) {
      return {
        points: questionData.points ?? 100,
        answering_time: questionData.answering_time ?? questionData.show_question_time ?? 30,
      };
    }
    return null;
  }, [
    currentQuestionData,
    gameFlow?.current_question_id,
    gameFlow?.current_question_index,
    questions,
  ]);

  const { answerStatus, answerResult, submitAnswer } = useGameAnswer({
    gameId,
    playerId,
    questionId: gameFlow?.current_question_id || null,
    questionNumber:
      gameFlow && gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
        ? gameFlow.current_question_index + 1
        : undefined,
    correctAnswerId: correctAnswerIdState || undefined,
    autoReveal: false,
    // Point calculation parameters
    questionPoints: currentQuestionForPoints?.points ?? 100,
    answeringTime: currentQuestionForPoints?.answering_time ?? 30,
    timeBonusEnabled: quizPlaySettings?.time_bonus ?? false,
    streakBonusEnabled: quizPlaySettings?.streak_bonus ?? false,
    events: {
      onAnswerSubmitted: (submission) => {
        console.log('Player: Answer submitted', submission);
      },
      onError: (err) => console.error('Player Answer Error:', err),
    },
  });

  const { leaderboard } = useGameLeaderboard({
    gameId,
    playerId,
    autoRefresh: true,
  });

  const { socket, joinRoom, leaveRoom } = useSocket();
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
  const [isMobile, setIsMobile] = useState(true);
  const hasJoinedRoomRef = useRef(false);

  // Refs for stable access
  const gameFlowRef = useRef(gameFlow);
  const socketRef = useRef(socket);
  const isConnectedRef = useRef(isConnected);
  const handlePlayerKickedRef = useRef<typeof handlePlayerKicked | undefined>(undefined);

  // Keep refs in sync
  useEffect(() => {
    gameFlowRef.current = gameFlow;
  }, [gameFlow]);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  // Resolve gameId from room code (fallback) and load quiz data (best-effort)
  useEffect(() => {
    let cancelled = false;

    const resolveGameId = async () => {
      // If already have gameId, keep it
      if (gameId) return gameId;

      // Try sessionStorage
      const stored = roomCode ? sessionStorage.getItem(`game_${roomCode}`) : null;
      if (stored) {
        if (!cancelled) setGameId(stored);
        return stored;
      }
      return null;
    };

    const loadQuiz = async (resolvedGameId: string) => {
      try {
        // Player quiz load is best-effort; only attempt when authenticated to avoid noise
        if (!apiClient.isAuthenticated()) {
          return;
        }
        const { data: game } = await gameApi.getGame(resolvedGameId);
        const quizId = game?.quiz_id || game?.quiz_set_id;
        if (quizId) {
          const quiz = await quizService.getQuizComplete(quizId);
          const sorted = [...quiz.questions].sort((a, b) => a.order_index - b.order_index);
          if (!cancelled) {
            setQuestions(sorted);
            if (quiz.play_settings) {
              setQuizPlaySettings({
                time_bonus: quiz.play_settings.time_bonus ?? false,
                streak_bonus: quiz.play_settings.streak_bonus ?? false,
              });
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Failed to load quiz for game (non-blocking)', err);
        }
      }
    };

    resolveGameId().then((resolvedId) => {
      if (!resolvedId) return;
      loadQuiz(resolvedId);
    });

    return () => {
      cancelled = true;
    };
  }, [gameId, roomCode]);

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
          return;
        }

        // Transform API response to Question format
        const question: Question = {
          id: data.question.id,
          text: data.question.text,
          image: data.question.image_url || undefined,
          timeLimit: data.question.time_limit,
          choices: data.answers
            .sort((a, b) => a.order_index - b.order_index)
            .map((a, i) => ({
              id: a.id,
              text: a.text,
              letter: ['A', 'B', 'C', 'D'][i] || String.fromCharCode(65 + i),
            })),
          correctAnswerId: data.answers.find((a) => a.is_correct)?.id || '',
          explanation: data.question.explanation_text || undefined,
          type: 'multiple_choice_4',
        };

        setCurrentQuestionData({
          question,
          serverTime: data.server_time,
          isActive: data.is_active,
          points: data.question.points,
          timeLimit: data.question.time_limit,
          answeringTime: data.question.answering_time,
        });
      } catch (err) {
        console.warn('Error fetching current question (non-blocking)', err);
      }
    };

    fetchCurrentQuestion();

    // Refresh question data periodically to sync with server (every 5 seconds)
    const refreshInterval = setInterval(fetchCurrentQuestion, 5000);
    return () => clearInterval(refreshInterval);
  }, [gameId, gameFlow?.current_question_id]);

  // Handle player kicked event - redirect to join page
  const handlePlayerKicked = useCallback(
    (data: {
      player_id: string;
      player_name: string;
      game_id: string;
      kicked_by: string;
      timestamp: string;
    }) => {
      // Check if the kicked player is the current player
      if (data.player_id === playerId || data.game_id === gameId) {
        console.log('Player was kicked during game:', data);

        // Show notification
        toast.error('ホストによってBANされました', {
          icon: '🚫',
          duration: 5000,
        });

        // Clear stored game data (try to get from URL or use gameId)
        const roomCode = searchParams.get('code') || '';
        if (roomCode) {
          sessionStorage.removeItem(`game_${roomCode}`);
        }

        // Redirect to join page after a short delay
        setTimeout(() => {
          router.push('/join');
        }, 2000);
      }
    },
    [playerId, gameId, router, searchParams],
  );

  // Keep handlePlayerKicked ref in sync
  useEffect(() => {
    handlePlayerKickedRef.current = handlePlayerKicked;
  }, [handlePlayerKicked]);

  // Restore countdown start timestamp from sessionStorage if available (for late joiners)
  useEffect(() => {
    if (currentPhase === 'countdown' && !countdownStartedAt) {
      const stored = sessionStorage.getItem(`countdown_started_${gameId}`);
      if (stored) {
        const timestamp = parseInt(stored, 10);
        if (!isNaN(timestamp)) {
          setCountdownStartedAt(timestamp);
          // Clean up after use
          sessionStorage.removeItem(`countdown_started_${gameId}`);
        }
      }
    }
  }, [currentPhase, gameId, countdownStartedAt]);

  // Join WebSocket room and listen for events
  // Set up listeners as soon as socket is available, join room when connected
  useEffect(() => {
    if (!gameId) return;

    const currentSocket = socketRef.current;
    if (!currentSocket) {
      // Wait for socket to be available
      const checkSocket = setInterval(() => {
        if (socketRef.current) {
          clearInterval(checkSocket);
          // Re-run effect when socket becomes available
          // This is handled by the socket dependency
        }
      }, 50);
      return () => clearInterval(checkSocket);
    }

    // Set up event listeners FIRST (before room join)
    // This ensures we don't miss events during navigation/page load
    // Socket will queue events if not connected yet

    const handleStatsUpdate = (data: {
      roomId: string;
      questionId: string;
      counts: Record<string, number>;
    }) => {
      if (data.roomId === gameId && data.questionId === gameFlowRef.current?.current_question_id) {
        setAnswerStats(data.counts);
      }
    };

    // Listen for phase transitions from host
    const handlePhaseChange = (data: {
      roomId: string;
      phase: PlayerPhase;
      startedAt?: number;
    }) => {
      if (data.roomId === gameId) {
        console.log('Player: Phase changed to', data.phase, 'startedAt:', data.startedAt);
        setCurrentPhase(data.phase);
        // Store countdown start timestamp for synchronization
        if (data.phase === 'countdown' && data.startedAt) {
          setCountdownStartedAt(data.startedAt);
        }
        router.replace(`/game-player?gameId=${gameId}&phase=${data.phase}&playerId=${playerId}`);
      }
    };

    // Listen for game start (in case player joins after game has started)
    const handleGameStarted = (data: { roomId?: string; gameId?: string; roomCode?: string }) => {
      const targetGameId = data.gameId || data.roomId;
      if (targetGameId === gameId) {
        setCurrentPhase('countdown');
        router.replace(`/game-player?gameId=${gameId}&phase=countdown&playerId=${playerId}`);
      }
    };

    // Listen for game pause event
    const handleGamePause = (data: { gameId?: string; timestamp?: string }) => {
      const targetGameId = data.gameId;
      if (targetGameId === gameId) {
        console.log('Player: Game paused');
        // Timer will be paused by useGameFlow hook
      }
    };

    // Listen for game resume event
    const handleGameResume = (data: { gameId?: string; timestamp?: string }) => {
      const targetGameId = data.gameId;
      if (targetGameId === gameId) {
        console.log('Player: Game resumed');
        // Timer will be resumed by useGameFlow hook
      }
    };

    // Listen for game end event
    const handleGameEnd = (data: { gameId?: string; timestamp?: string }) => {
      const targetGameId = data.gameId;
      if (targetGameId === gameId) {
        console.log('Player: Game ended');
        setCurrentPhase('ended');
        router.replace(`/game-player?gameId=${gameId}&phase=ended&playerId=${playerId}`);
      }
    };

    // Set up listeners immediately (even before room join - socket will queue events)
    // Stats events (support legacy and new naming)
    currentSocket.on('game:answer:stats:update', handleStatsUpdate);
    currentSocket.on('game:answer:stats', handleStatsUpdate);
    currentSocket.on('game:phase:change', handlePhaseChange);
    currentSocket.on('game:player-kicked', (data) => handlePlayerKickedRef.current?.(data));
    currentSocket.on('game:started', handleGameStarted);
    currentSocket.on('game:pause', handleGamePause);
    currentSocket.on('game:resume', handleGameResume);
    currentSocket.on('game:end', handleGameEnd);

    // Join room when connected (listeners are already set up above)
    const joinRoomSafe = () => {
      if (hasJoinedRoomRef.current) {
        console.log('[GamePlayer] Already joined room, skipping duplicate join');
        return;
      }
      if (isConnectedRef.current) {
        console.log('[GamePlayer] Joining room:', gameId);
        joinRoom(gameId);
        hasJoinedRoomRef.current = true;
      }
    };

    // Try to join immediately if already connected
    joinRoomSafe();

    // If not connected yet, wait for connection
    if (!isConnectedRef.current) {
      const onConnect = () => {
        joinRoomSafe();
        currentSocket.off('connect', onConnect);
      };
      currentSocket.on('connect', onConnect);

      // Also check periodically as fallback
      const checkConnection = setInterval(() => {
        if (isConnectedRef.current && !hasJoinedRoomRef.current) {
          joinRoomSafe();
          clearInterval(checkConnection);
          currentSocket.off('connect', onConnect);
        }
      }, 100);

      // Cleanup after 5 seconds
      const cleanupTimeout = setTimeout(() => {
        clearInterval(checkConnection);
        currentSocket.off('connect', onConnect);
      }, 5000);

      return () => {
        clearInterval(checkConnection);
        clearTimeout(cleanupTimeout);
        currentSocket.off('connect', onConnect);
        currentSocket.off('game:answer:stats:update', handleStatsUpdate);
        currentSocket.off('game:answer:stats', handleStatsUpdate);
        currentSocket.off('game:phase:change', handlePhaseChange);
        currentSocket.off('game:player-kicked');
        currentSocket.off('game:started', handleGameStarted);
        currentSocket.off('game:pause', handleGamePause);
        currentSocket.off('game:resume', handleGameResume);
        currentSocket.off('game:end', handleGameEnd);

        // Leave room on unmount
        if (gameId && hasJoinedRoomRef.current) {
          console.log('[GamePlayer] Leaving room on unmount');
          leaveRoom(gameId);
          hasJoinedRoomRef.current = false;
        }
      };
    }

    // Cleanup for when socket is already connected
    return () => {
      currentSocket.off('game:answer:stats:update', handleStatsUpdate);
      currentSocket.off('game:answer:stats', handleStatsUpdate);
      currentSocket.off('game:phase:change', handlePhaseChange);
      currentSocket.off('game:player-kicked');
      currentSocket.off('game:started', handleGameStarted);
      currentSocket.off('game:pause', handleGamePause);
      currentSocket.off('game:resume', handleGameResume);
      currentSocket.off('game:end', handleGameEnd);
      currentSocket.off('connect'); // Clean up any connect listeners

      // Leave room on unmount
      if (gameId && hasJoinedRoomRef.current) {
        console.log('[GamePlayer] Leaving room on unmount');
        leaveRoom(gameId);
        hasJoinedRoomRef.current = false;
      }
    };
  }, [gameId, playerId, router, deviceId, joinRoom, leaveRoom]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use current question from API if available, otherwise fallback to local quiz data
  const currentQuestion: Question = useMemo(() => {
    const durationFromFlowSeconds =
      gameFlow?.current_question_start_time && gameFlow?.current_question_end_time
        ? Math.max(
            1,
            Math.round(
              (new Date(gameFlow.current_question_end_time).getTime() -
                new Date(gameFlow.current_question_start_time).getTime()) /
                1000,
            ),
          )
        : null;

    // Prefer API data (has full metadata and server timestamps)
    if (currentQuestionData?.question) {
      return {
        ...currentQuestionData.question,
        timeLimit: durationFromFlowSeconds ?? currentQuestionData.question.timeLimit,
      };
    }

    // Fallback to local quiz data
    const idx = gameFlow?.current_question_index ?? questionIndexParam;
    const questionData = questions[idx];
    if (questionData) {
      const showTimeSeconds = questionData.show_question_time || 30;
      return {
        id: questionData.id,
        text: questionData.question_text,
        image: questionData.image_url || undefined,
        timeLimit:
          durationFromFlowSeconds ??
          showTimeSeconds ??
          Math.max(5, Math.round((timerState?.remainingMs || 10000) / 1000)),
        choices: questionData.answers
          .sort((a, b) => a.order_index - b.order_index)
          .map((a, i) => ({
            id: a.id,
            text: a.answer_text,
            letter: ['A', 'B', 'C', 'D'][i] || String.fromCharCode(65 + i),
          })),
        correctAnswerId: questionData.answers.find((a) => a.is_correct)?.id || '',
        explanation: questionData.explanation_text || undefined,
        type: 'multiple_choice_4',
      };
    }
    // Loading state
    return {
      id: gameFlow?.current_question_id || questionIdParam,
      text:
        questions.length === 0
          ? 'クイズデータを読み込み中...'
          : `問題 ${(idx ?? 0) + 1} を読み込み中...`,
      image: undefined,
      timeLimit: Math.max(5, Math.round((timerState?.remainingMs || 10000) / 1000)),
      choices: [
        { id: 'loading-1', text: '読み込み中...', letter: 'A' },
        { id: 'loading-2', text: '読み込み中...', letter: 'B' },
        { id: 'loading-3', text: '読み込み中...', letter: 'C' },
        { id: 'loading-4', text: '読み込み中...', letter: 'D' },
      ],
      correctAnswerId: 'loading-1',
      explanation: undefined,
      type: 'multiple_choice_4',
    };
  }, [
    currentQuestionData,
    gameFlow?.current_question_id,
    gameFlow?.current_question_index,
    gameFlow?.current_question_start_time,
    gameFlow?.current_question_end_time,
    questionIdParam,
    questionIndexParam,
    questions,
    timerState?.remainingMs,
  ]);

  // Update correctAnswerId when currentQuestion changes
  useEffect(() => {
    if (currentQuestion?.correctAnswerId) {
      setCorrectAnswerIdState(currentQuestion.correctAnswerId);
    }
  }, [currentQuestion?.correctAnswerId]);

  const derivedRemainingMsFromFlow =
    gameFlow?.current_question_start_time && gameFlow?.current_question_end_time
      ? Math.max(0, new Date(gameFlow.current_question_end_time).getTime() - Date.now())
      : null;

  const displayRemainingMs =
    timerState?.remainingMs ?? derivedRemainingMsFromFlow ?? currentQuestion.timeLimit * 1000;

  const startAnsweringPhase = useCallback(() => {
    if (isDisplayPhaseDone) return;
    const durationMs =
      (currentQuestionForPoints?.answering_time ?? currentQuestion.timeLimit ?? 30) * 1000;
    setIsDisplayPhaseDone(true);
    setAnswerDurationMs(durationMs);
    setAnswerRemainingMs(durationMs);
    setCurrentPhase('answering');
    router.replace(`/game-player?gameId=${gameId}&phase=answering&playerId=${playerId}`);
  }, [
    currentQuestionForPoints?.answering_time,
    currentQuestion.timeLimit,
    gameId,
    isDisplayPhaseDone,
    playerId,
    router,
  ]);

  // Move to answering once the question display timer expires
  useEffect(() => {
    if (currentPhase !== 'question') return;
    if (displayRemainingMs <= 0 && !isDisplayPhaseDone) {
      startAnsweringPhase();
    }
  }, [currentPhase, displayRemainingMs, isDisplayPhaseDone, startAnsweringPhase]);

  // Client-side answering countdown (separate from display timer)
  useEffect(() => {
    if (currentPhase !== 'answering' || answerRemainingMs === null) return;
    const interval = setInterval(() => {
      setAnswerRemainingMs((prev) => {
        if (prev === null) return prev;
        const next = Math.max(0, prev - 1000);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPhase, answerRemainingMs]);

  const answeringRemainingMs =
    answerRemainingMs ??
    (currentQuestionForPoints?.answering_time ?? currentQuestion.timeLimit ?? 30) * 1000;

  const currentTimeSeconds = Math.max(
    0,
    Math.round((currentPhase === 'question' ? displayRemainingMs : answeringRemainingMs) / 1000),
  );

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleAnswerSubmit = useCallback(async () => {
    if (!selectedAnswer || !gameFlow?.current_question_id) return;
    try {
      const durationMs =
        answerDurationMs ??
        (currentQuestionForPoints?.answering_time ?? currentQuestion.timeLimit ?? 30) * 1000;
      const remainingMs = answerRemainingMs ?? durationMs;
      const responseTimeMs = durationMs - remainingMs;
      await submitAnswer(selectedAnswer, responseTimeMs);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  }, [
    selectedAnswer,
    gameFlow?.current_question_id,
    answerDurationMs,
    answerRemainingMs,
    currentQuestionForPoints?.answering_time,
    currentQuestion.timeLimit,
    submitAnswer,
  ]);

  // Auto-submit timeout (no answer) when answering window expires
  const autoSubmittingRef = useRef(false);
  useEffect(() => {
    if (currentPhase !== 'answering') return;
    if (autoSubmittingRef.current) return;
    if (answerStatus.hasAnswered) return;
    if (answeringRemainingMs > 0) return;
    const durationMs =
      answerDurationMs ??
      (currentQuestionForPoints?.answering_time ?? currentQuestion.timeLimit ?? 30) * 1000;
    autoSubmittingRef.current = true;
    submitAnswer(null, durationMs).catch((err) => {
      console.error('Auto-submit on timeout failed:', err);
    });
  }, [
    currentPhase,
    answerStatus.hasAnswered,
    answeringRemainingMs,
    answerDurationMs,
    currentQuestionForPoints?.answering_time,
    currentQuestion.timeLimit,
    submitAnswer,
  ]);

  // Use answerResult from hook if available, otherwise construct from local state
  const revealPayload: AnswerResult = useMemo(() => {
    // Safety check for empty choices
    if (!currentQuestion.choices || currentQuestion.choices.length === 0) {
      return {
        question: currentQuestion,
        correctAnswer: { id: '', text: '読み込み中...', letter: 'A' },
        playerAnswer: undefined,
        isCorrect: false,
        statistics: [],
        totalPlayers: 0,
        totalAnswered: 0,
      };
    }

    // answerResult from hook contains partial data (questionId, selectedOption, isCorrect, etc.)
    // We need to construct the full AnswerResult with question and statistics
    const playerChoice = answerResult?.selectedOption
      ? currentQuestion.choices.find((c) => c.id === answerResult.selectedOption)
      : selectedAnswer
        ? currentQuestion.choices.find((c) => c.id === selectedAnswer)
        : undefined;

    const totalAnswered = Object.values(answerStats).reduce((sum, count) => sum + count, 0);
    const statistics = currentQuestion.choices.map((choice) => {
      const count = answerStats[choice.id] || 0;
      return {
        choiceId: choice.id,
        count,
        percentage: totalAnswered > 0 ? (count / totalAnswered) * 100 : 0,
      };
    });

    // Determine if answer is correct
    const isCorrect =
      answerResult?.isCorrect ??
      (playerChoice ? playerChoice.id === currentQuestion.correctAnswerId : false);

    const correctAnswerChoice =
      currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId) ||
      currentQuestion.choices[0]; // Fallback to first choice if not found

    return {
      question: currentQuestion,
      correctAnswer: correctAnswerChoice,
      playerAnswer: playerChoice,
      isCorrect,
      statistics,
      totalPlayers: Array.isArray(leaderboard) ? leaderboard.length : 0,
      totalAnswered,
    };
  }, [answerResult, currentQuestion, selectedAnswer, answerStats, leaderboard]);

  // Update phase when URL changes
  useEffect(() => {
    setCurrentPhase(phaseParam);
  }, [phaseParam]);

  // Clear selected answer when question changes
  useEffect(() => {
    if (gameFlow?.current_question_id && gameFlow.current_question_id !== questionIdParam) {
      setSelectedAnswer(undefined);
    }
  }, [gameFlow?.current_question_id, questionIdParam]);

  // Phase rendering
  if (!gameId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-6 text-red-600 text-xl">gameId が指定されていません。</div>
      </div>
    );
  }

  if (!gameFlow) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <div className="p-6 text-white text-xl mb-4">ゲーム状態を読み込み中...</div>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <div className="p-6 text-yellow-400 text-xl mb-4">接続を確立中...</div>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  switch (currentPhase) {
    case 'countdown':
      return (
        <PlayerCountdownScreen
          countdownTime={3}
          questionNumber={(gameFlow.current_question_index ?? questionIndexParam) + 1}
          totalQuestions={questions.length || totalQuestions}
          isMobile={isMobile}
          startedAt={countdownStartedAt}
          onCountdownComplete={() => {
            // Countdown complete - phase will transition to question via WebSocket event
            console.log('Countdown complete, waiting for question start');
          }}
        />
      );
    case 'question':
      return (
        <PlayerQuestionScreen
          question={currentQuestion}
          currentTime={currentTimeSeconds}
          questionNumber={(gameFlow.current_question_index ?? questionIndexParam) + 1}
          totalQuestions={questions.length || totalQuestions}
          isMobile={isMobile}
        />
      );
    case 'answering':
      return (
        <PlayerAnswerScreen
          question={currentQuestion}
          currentTime={currentTimeSeconds}
          questionNumber={(gameFlow.current_question_index ?? questionIndexParam) + 1}
          totalQuestions={questions.length || totalQuestions}
          onAnswerSelect={handleAnswerSelect}
          onAnswerSubmit={handleAnswerSubmit}
          isMobile={isMobile}
          isSubmitted={answerStatus.hasAnswered}
        />
      );
    case 'answer_reveal':
      return <PlayerAnswerRevealScreen answerResult={revealPayload} />;
    case 'leaderboard':
      return (
        <PlayerLeaderboardScreen
          leaderboardData={{
            entries: Array.isArray(leaderboard)
              ? leaderboard.map((entry) => ({
                  playerId: entry.player_id,
                  playerName: entry.player_name,
                  score: entry.score,
                  rank: entry.rank,
                  previousRank: entry.rank,
                  rankChange: 'same' as const,
                }))
              : [],
            questionNumber: (gameFlow.current_question_index ?? questionIndexParam) + 1,
            totalQuestions: questions.length || totalQuestions,
            timeRemaining: Math.max(0, Math.round((timerState?.remainingMs || 5000) / 1000)),
            timeLimit: 5,
          }}
          onTimeExpired={() => {}}
        />
      );
    case 'explanation':
      return (
        <PlayerExplanationScreen
          explanation={{
            questionNumber: (gameFlow.current_question_index ?? questionIndexParam) + 1,
            totalQuestions: questions.length || totalQuestions,
            timeLimit: 5,
            title: '解説',
            body: currentQuestion.explanation || '解説は近日追加されます。',
          }}
        />
      );
    case 'podium':
      return (
        <PlayerPodiumScreen
          entries={
            Array.isArray(leaderboard)
              ? leaderboard.map((entry) => ({
                  playerId: entry.player_id,
                  playerName: entry.player_name,
                  score: entry.score,
                  rank: entry.rank,
                  previousRank: entry.rank,
                  rankChange: 'same' as const,
                }))
              : []
          }
        />
      );
    case 'ended': {
      const playerEntry = Array.isArray(leaderboard)
        ? leaderboard.find((entry) => entry.player_id === playerId)
        : undefined;

      const leaderboardEntries: LeaderboardEntry[] = Array.isArray(leaderboard)
        ? leaderboard.map((entry) => ({
            playerId: entry.player_id,
            playerName: entry.player_name,
            score: entry.score,
            rank: entry.rank,
            previousRank: entry.rank,
            rankChange: 'same' as const,
          }))
        : [];

      return (
        <PlayerGameEndScreen
          playerEntry={
            playerEntry
              ? {
                  playerId: playerEntry.player_id,
                  playerName: playerEntry.player_name,
                  score: playerEntry.score,
                  rank: playerEntry.rank,
                  previousRank: playerEntry.rank,
                  rankChange: 'same',
                }
              : undefined
          }
          entries={leaderboardEntries}
          onReturnHome={() => router.push('/')}
          onJoinNewGame={() => router.push('/')}
        />
      );
    }
    default:
      return <div className="p-6">次のステップを待機しています...</div>;
  }
}

export default function GamePlayerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerGameContent />
    </Suspense>
  );
}
