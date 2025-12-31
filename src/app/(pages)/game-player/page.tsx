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

  // Player-side phase ordering used to prevent "downgrade" transitions from host events.
  // Example: the player locally transitions `question -> answering` based on the per-question timer,
  // while the host may still broadcast `phase=question`. We must ignore that downgrade to avoid flicker.
  const phasePriority: Record<PlayerPhase, number> = useMemo(
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

  // State for explanation data
  const [explanationData, setExplanationData] = useState<{
    title: string | null;
    text: string | null;
    image_url: string | null;
    show_time: number;
  } | null>(null);

  const { gameFlow, timerState, isConnected, refreshFlow } = useGameFlow({
    gameId,
    autoSync: true,
    triggerOnQuestionEndOnTimer: false,
    events: {
      onQuestionStart: (qId, qIndex) => {
        console.log('Player: Question started', qId, qIndex);

        // Track last question start we processed to distinguish:
        // - duplicate "question started" events for the same question (ignore if already in later phases)
        // - a genuinely new question start while we're on leaderboard/explanation (must transition)
        const isNewQuestionStart = qId && qId !== lastQuestionStartIdRef.current;
        lastQuestionStartIdRef.current = qId;

        // Only ignore duplicate question-start events (same qId) if we're already in later phases.
        // Important: for a NEW question, we always allow transition even if we're currently
        // in leaderboard/explanation, otherwise the player gets stuck.
        const currentPhaseValue = currentPhaseRef.current;
        if (
          !isNewQuestionStart &&
          (currentPhaseValue === 'answering' ||
            currentPhaseValue === 'answer_reveal' ||
            currentPhaseValue === 'leaderboard' ||
            currentPhaseValue === 'explanation')
        ) {
          console.log(
            'Player: Question start event received but already in',
            currentPhaseValue,
            'phase - ignoring to prevent flash',
          );
          // Still reset the display/answer state for the new question
          setIsDisplayPhaseDone(false);
          setAnswerDurationMs(null);
          setAnswerRemainingMs(null);
          setQuestionRemainingMs(null); // Reset question timer for new question
          answeringPhaseStartTimeRef.current = null;
          return;
        }

        setIsDisplayPhaseDone(false);
        setAnswerDurationMs(null);
        setAnswerRemainingMs(null);
        setQuestionRemainingMs(null); // Reset question timer for new question
        answeringPhaseStartTimeRef.current = null; // Reset timestamp for new question
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
      onExplanationShow: (questionId, explanation) => {
        console.log('Player: Explanation shown', questionId, explanation);
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
          router.replace(`/game-player?gameId=${gameId}&phase=explanation&playerId=${playerId}`);
        } else {
          // No explanation content, skip explanation phase
          console.log('Player: Explanation event received but no content, skipping explanation');
          // Wait for host to advance to next question or podium
        }
      },
      onExplanationHide: (questionId) => {
        console.log('Player: Explanation hidden', questionId);
        // Explanation phase ended, move to next phase
        // This will be handled by the explanation screen's onTimeExpired
      },
      onGameEnd: () => {
        console.log('Player: Game ended, moving to podium');
        setCurrentPhase('podium');
        router.replace(`/game-player?gameId=${gameId}&phase=podium&playerId=${playerId}`);
      },
      onError: (err) => console.error('Player GameFlow Error:', err),
    },
  });

  // Reset display/answer timers and explanation data whenever a new question becomes current
  useEffect(() => {
    if (!gameFlow?.current_question_id) return;
    setIsDisplayPhaseDone(false);
    setAnswerDurationMs(null);
    setAnswerRemainingMs(null);
    setExplanationData(null); // Reset explanation data for new question
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
    totalQuestions?: number;
  } | null>(null);
  const [isDisplayPhaseDone, setIsDisplayPhaseDone] = useState(false);
  const [answerDurationMs, setAnswerDurationMs] = useState<number | null>(null);
  const [answerRemainingMs, setAnswerRemainingMs] = useState<number | null>(null);
  const answeringPhaseStartTimeRef = useRef<number | null>(null);
  const [questionRemainingMs, setQuestionRemainingMs] = useState<number | null>(null);
  const questionTimerInitializedRef = useRef<string | null>(null);
  const previousPhaseRef = useRef<PlayerPhase | null>(null);

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

  const {
    answerStatus,
    answerResult,
    submitAnswer,
    error: answerError,
  } = useGameAnswer({
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

  const {
    leaderboard,
    loading: leaderboardLoading,
    refreshLeaderboard,
  } = useGameLeaderboard({
    gameId,
    playerId,
    autoRefresh: true,
  });

  // Debug: Log leaderboard data
  useEffect(() => {
    if (currentPhase === 'leaderboard') {
      console.log('Leaderboard data:', {
        leaderboard,
        length: Array.isArray(leaderboard) ? leaderboard.length : 0,
        loading: leaderboardLoading,
        gameId,
      });
    }
  }, [leaderboard, leaderboardLoading, currentPhase, gameId]);

  // Refresh leaderboard when entering leaderboard phase
  useEffect(() => {
    if (currentPhase === 'leaderboard' && gameId && refreshLeaderboard) {
      console.log('[Leaderboard] Refreshing leaderboard on phase entry');
      refreshLeaderboard();
    }
  }, [currentPhase, gameId, refreshLeaderboard]);

  // Redirect from leaderboard if it's the last question (go directly to podium)
  useEffect(() => {
    if (currentPhase === 'leaderboard' && gameFlow) {
      const currentQuestionNum =
        gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
          ? gameFlow.current_question_index + 1
          : questionIndexParam + 1;
      const totalQuestionsCount =
        currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions);
      const isLastQuestion = currentQuestionNum >= totalQuestionsCount;

      if (isLastQuestion) {
        console.log('Player: Last question detected in leaderboard phase, redirecting to podium');
        setCurrentPhase('podium');
        router.replace(`/game-player?gameId=${gameId}&phase=podium&playerId=${playerId}`);
      }
    }
  }, [
    currentPhase,
    gameFlow,
    questionIndexParam,
    currentQuestionData?.totalQuestions,
    questions.length,
    totalQuestions,
    gameId,
    playerId,
    router,
  ]);

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
  const currentPhaseRef = useRef<PlayerPhase>(phaseParam);
  const lastQuestionStartIdRef = useRef<string | null>(null);

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

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

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
          timeLimit: data.question.show_question_time + data.question.answering_time,
          show_question_time: data.question.show_question_time,
          answering_time: data.question.answering_time,
          choices: data.answers
            .sort((a, b) => a.order_index - b.order_index)
            .map((a, i) => ({
              id: a.id,
              text: a.text,
              letter: ['A', 'B', 'C', 'D'][i] || String.fromCharCode(65 + i),
            })),
          correctAnswerId: data.answers.find((a) => a.is_correct)?.id || '',
          explanation: data.question.explanation_text || undefined,
          type: data.question.type as Question['type'],
        };

        setCurrentQuestionData({
          question,
          serverTime: data.server_time,
          isActive: data.is_active,
          points: data.question.points,
          timeLimit: data.question.show_question_time + data.question.answering_time,
          answeringTime: data.question.answering_time,
          totalQuestions: data.total_questions,
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
        if (roomCode) {
          sessionStorage.removeItem(`game_${roomCode}`);
        }

        // Redirect to join page after a short delay
        setTimeout(() => {
          router.push('/join');
        }, 2000);
      }
    },
    [playerId, gameId, router, roomCode],
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
        // Only update stats if we're in answer_reveal phase or answering phase
        // This prevents constant re-renders during other phases
        const currentPhaseValue = currentPhaseRef.current;
        if (currentPhaseValue === 'answer_reveal' || currentPhaseValue === 'answering') {
          setAnswerStats((prev) => {
            // Only update if values actually changed to prevent unnecessary re-renders
            const hasChanged =
              Object.keys(data.counts).some((key) => prev[key] !== data.counts[key]) ||
              Object.keys(prev).some((key) => !(key in data.counts));
            return hasChanged ? data.counts : prev;
          });
        }
      }
    };

    const handleAnswerLocked = (data: {
      roomId: string;
      questionId: string;
      counts?: Record<string, number>;
    }) => {
      if (data.roomId !== gameId) return;
      if (data.counts && data.questionId === gameFlowRef.current?.current_question_id) {
        // Always update stats when answer is locked (transitioning to reveal)
        setAnswerStats(data.counts);
      }
      console.log('Player: Answer locked, moving to reveal');
      setCurrentPhase('answer_reveal');
      router.replace(`/game-player?gameId=${gameId}&phase=answer_reveal&playerId=${playerId}`);
    };

    // Listen for phase transitions from host
    const handlePhaseChange = (data: {
      roomId: string;
      phase: PlayerPhase;
      startedAt?: number;
    }) => {
      if (data.roomId !== gameId) return;

      console.log('Player: Phase changed to', data.phase, 'startedAt:', data.startedAt);

      // Prevent host events from forcing the player "backwards" in the flow.
      // The most common case is `answering -> question` while the host still broadcasts `question`.
      const current = currentPhaseRef.current;
      if (data.phase !== 'waiting') {
        const currentRank = phasePriority[current];
        const nextRank = phasePriority[data.phase];
        if (Number.isFinite(currentRank) && Number.isFinite(nextRank) && nextRank < currentRank) {
          console.log(
            '[Phase] Ignoring host phase downgrade:',
            current,
            '->',
            data.phase,
            '(keeping',
            current,
            ')',
          );
          return;
        }
      }

      // Countdown should only be shown for the first question (index 0)
      // For subsequent questions, skip countdown and wait for question start
      if (data.phase === 'countdown') {
        const currentQuestionIndex = gameFlowRef.current?.current_question_index ?? 0;
        // Only show countdown for first question (index 0)
        if (currentQuestionIndex > 0) {
          console.log(
            'Player: Skipping countdown for question',
            currentQuestionIndex + 1,
            '- waiting for question start',
          );
          // Don't transition to countdown, just wait for question start event
          return;
        }
        // First question - proceed with countdown
        setCountdownStartedAt(data.startedAt);
        // Refresh game flow to get updated current_question_id when transitioning to countdown
        // This ensures we have the correct question data for the next question
        refreshFlow().catch((err) => {
          console.error('Failed to refresh game flow after countdown phase change:', err);
        });
      }

      setCurrentPhase(data.phase);

      // If phase is 'waiting', redirect to join page to rejoin
      if (data.phase === 'waiting') {
        if (roomCode) {
          router.push(`/join?code=${roomCode}`);
        } else if (gameId) {
          router.push(`/join?gameId=${gameId}`);
        }
        return;
      }
      router.replace(`/game-player?gameId=${gameId}&phase=${data.phase}&playerId=${playerId}`);
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
    currentSocket.on('game:answer:locked', handleAnswerLocked);
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
        currentSocket.off('game:answer:locked', handleAnswerLocked);
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
      currentSocket.off('game:answer:locked', handleAnswerLocked);
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
  }, [gameId, playerId, router, joinRoom, leaveRoom, refreshFlow, roomCode, phasePriority]);

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
      const showTimeSeconds = questionData.show_question_time || 10;
      const answeringTimeSeconds = questionData.answering_time || 30;
      return {
        id: questionData.id,
        text: questionData.question_text,
        image: questionData.image_url || undefined,
        timeLimit: durationFromFlowSeconds ?? showTimeSeconds + answeringTimeSeconds,
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
        type: questionData.question_type as Question['type'],
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
      show_question_time: 10,
      answering_time: 30,
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

  // Validate and sanitize time values to prevent NaN
  const showQuestionTime = Number.isFinite(currentQuestion.show_question_time)
    ? currentQuestion.show_question_time
    : 10; // Default fallback
  const answeringTime = Number.isFinite(currentQuestion.answering_time)
    ? currentQuestion.answering_time
    : 30; // Default fallback

  const viewingDurationMs = showQuestionTime * 1000;

  // Calculate elapsed time for question phase based on actual start time
  // Use timerState if available (more accurate), otherwise calculate from gameFlow
  let questionElapsedMs = 0;
  if (timerState?.startTime && currentPhase === 'question') {
    // Use timerState for accurate elapsed time
    questionElapsedMs = Math.max(0, Date.now() - timerState.startTime.getTime());
  } else if (gameFlow?.current_question_start_time) {
    // Fallback to gameFlow start time
    questionElapsedMs = Math.max(
      0,
      Date.now() - new Date(gameFlow.current_question_start_time).getTime(),
    );
  }

  // For question phase: calculate remaining time based only on show_question_time
  // For answering phase: use total remaining time
  const viewingRemainingMs = Math.max(0, viewingDurationMs - questionElapsedMs);

  // Initialize questionRemainingMs when question phase starts (only once per question)
  useEffect(() => {
    const currentQuestionId = gameFlow?.current_question_id;
    const previousPhase = previousPhaseRef.current;

    // Only reset timer when actually leaving question phase (not just when effect runs)
    if (previousPhase === 'question' && currentPhase !== 'question') {
      console.log('[Question Timer] Leaving question phase, resetting timer');
      setQuestionRemainingMs(null);
      questionTimerInitializedRef.current = null;
    }

    // Update previous phase ref
    previousPhaseRef.current = currentPhase;

    if (currentPhase === 'question' && currentQuestionId) {
      // Check if we've already initialized for this question
      if (questionTimerInitializedRef.current === currentQuestionId) {
        // Already initialized - but check if timer was lost due to re-render
        // If questionRemainingMs is null but we've initialized, restore it
        if (questionRemainingMs === null) {
          console.log('[Question Timer] Timer lost, restoring for question', currentQuestionId);
          const currentViewingRemainingMs = Math.max(0, viewingDurationMs - questionElapsedMs);

          if (currentViewingRemainingMs > 0) {
            setQuestionRemainingMs(currentViewingRemainingMs);
          } else {
            // Timer expired, transition to answering
            console.log(
              '[Question Timer] Timer expired during restore, transitioning to answering',
            );
            setIsDisplayPhaseDone(true);
            setAnswerDurationMs((answeringTime || 30) * 1000);
            setAnswerRemainingMs((answeringTime || 30) * 1000);
            answeringPhaseStartTimeRef.current = Date.now();
            setCurrentPhase('answering');
            router.replace(`/game-player?gameId=${gameId}&phase=answering&playerId=${playerId}`);
          }
        }
        return; // Already initialized for this question
      }

      // Mark as initialized for this question
      questionTimerInitializedRef.current = currentQuestionId;

      // Calculate initial time
      const currentViewingRemainingMs = Math.max(0, viewingDurationMs - questionElapsedMs);
      const initialTime =
        currentViewingRemainingMs > 0 ? currentViewingRemainingMs : viewingDurationMs;

      console.log('[Question Timer] Initializing timer', {
        questionId: currentQuestionId,
        viewingRemainingMs: currentViewingRemainingMs,
        viewingDurationMs,
        initialTime,
        questionElapsedMs,
        showQuestionTime,
      });

      if (initialTime > 0) {
        setQuestionRemainingMs(initialTime);
      } else {
        // If initial time is 0 or negative, immediately transition to answering
        console.log('[Question Timer] Initial time is 0 or negative, transitioning to answering');
        setIsDisplayPhaseDone(true);
        setAnswerDurationMs((answeringTime || 30) * 1000);
        setAnswerRemainingMs((answeringTime || 30) * 1000);
        answeringPhaseStartTimeRef.current = Date.now();
        setCurrentPhase('answering');
        router.replace(`/game-player?gameId=${gameId}&phase=answering&playerId=${playerId}`);
      }
    }
    // Note: viewingRemainingMs and questionRemainingMs are calculated inside the effect
    // and don't need to be in dependencies. We use currentQuestionId to track initialization.
  }, [
    currentPhase,
    gameFlow?.current_question_id,
    viewingDurationMs,
    questionElapsedMs,
    showQuestionTime,
    answeringTime,
    gameId,
    playerId,
    router,
    questionRemainingMs, // Add to detect when timer is lost
  ]);

  const totalRemainingMs =
    timerState?.remainingMs ??
    derivedRemainingMsFromFlow ??
    (currentPhase === 'question' ? viewingRemainingMs : answeringTime * 1000);

  const answeringRemainingMsDerived = Math.max(
    0,
    Number.isFinite(totalRemainingMs) ? totalRemainingMs : 0,
  );

  // Use questionRemainingMs state for question phase (for smooth countdown), otherwise use calculated value
  const displayRemainingMs =
    currentPhase === 'question'
      ? questionRemainingMs !== null
        ? questionRemainingMs
        : viewingRemainingMs
      : answeringRemainingMsDerived;

  const startAnsweringPhase = useCallback(() => {
    if (isDisplayPhaseDone) return;
    // Use validated answering time to prevent NaN
    const safeAnsweringTime = Number.isFinite(currentQuestion.answering_time)
      ? currentQuestion.answering_time
      : 30; // Default fallback
    const durationMs = safeAnsweringTime * 1000;
    setIsDisplayPhaseDone(true);
    setAnswerDurationMs(durationMs);
    setAnswerRemainingMs(durationMs);
    answeringPhaseStartTimeRef.current = Date.now(); // Record exact start time for accurate time calculation

    // Transition immediately to answering phase
    setCurrentPhase('answering');
    router.replace(`/game-player?gameId=${gameId}&phase=answering&playerId=${playerId}`);
  }, [currentQuestion.answering_time, gameId, isDisplayPhaseDone, playerId, router]);

  // Move to answering once the question display timer expires
  useEffect(() => {
    if (currentPhase !== 'question') return;
    if (displayRemainingMs <= 0 && !isDisplayPhaseDone) {
      console.log('[Question Timer] Display time expired, transitioning to answering', {
        displayRemainingMs,
        isDisplayPhaseDone,
        questionRemainingMs,
        viewingRemainingMs,
      });
      startAnsweringPhase();
    }
    // displayRemainingMs is computed from questionRemainingMs and viewingRemainingMs,
    // so when those change, displayRemainingMs will change and trigger this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhase, displayRemainingMs, isDisplayPhaseDone, startAnsweringPhase]);

  // Client-side question phase countdown timer (decrements every second)
  useEffect(() => {
    if (currentPhase !== 'question') return;
    if (questionRemainingMs === null || questionRemainingMs <= 0) return;

    // Set up interval to decrement timer every second
    const interval = setInterval(() => {
      setQuestionRemainingMs((prev) => {
        if (prev === null || prev <= 0) return 0;
        const newRemaining = Math.max(0, prev - 1000);
        return newRemaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPhase, questionRemainingMs]);

  // Sync questionRemainingMs with viewingRemainingMs when it changes significantly
  // (e.g., when gameFlow updates from server, but only if difference is large to avoid jitter)
  useEffect(() => {
    if (currentPhase === 'question' && questionRemainingMs !== null && viewingRemainingMs > 0) {
      const difference = Math.abs(questionRemainingMs - viewingRemainingMs);
      // Only sync if difference is more than 2 seconds (to avoid constant micro-adjustments)
      if (difference > 2000) {
        setQuestionRemainingMs(viewingRemainingMs);
      }
    }
    // questionRemainingMs is intentionally in dependencies to sync when it changes
  }, [currentPhase, viewingRemainingMs, questionRemainingMs]);

  // Client-side answering countdown timer (decrements every second)
  // Continue counting even after answer is submitted so player knows when phase ends
  useEffect(() => {
    if (currentPhase !== 'answering') return;
    if (answerDurationMs === null || answerRemainingMs === null) return;
    // Removed check for hasAnswered - timer should continue to show phase end time

    // Set up interval to decrement timer every second
    const interval = setInterval(() => {
      setAnswerRemainingMs((prev) => {
        if (prev === null) return null;
        const newRemaining = Math.max(0, prev - 1000);
        return newRemaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPhase, answerDurationMs, answerRemainingMs]);

  // Calculate current time for display based on phase
  const currentTimeSeconds = useMemo(() => {
    if (currentPhase === 'question') {
      const time = Number.isFinite(displayRemainingMs) ? displayRemainingMs : 0;
      return Math.max(0, Math.round(time / 1000));
    } else if (currentPhase === 'answering') {
      // Use answerRemainingMs for answering phase timer
      const time = Number.isFinite(answerRemainingMs) ? (answerRemainingMs ?? 0) : 0;
      return Math.max(0, Math.round(time / 1000));
    }
    return 0;
  }, [currentPhase, displayRemainingMs, answerRemainingMs]);

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleAnswerSubmit = useCallback(
    async (answerId?: string | null) => {
      // Allow null for auto-submit (when no answer selected)
      const targetAnswerId: string | null =
        answerId !== undefined ? answerId : selectedAnswer || null;
      if (!gameFlow?.current_question_id) return;
      // Note: targetAnswerId can be null for auto-submit, so we don't check for it here

      try {
        // Calculate response time from answering phase start
        // Use answerDurationMs and answerRemainingMs which are set when answering phase starts
        const fallbackAnsweringTime = Number.isFinite(
          currentQuestionForPoints?.answering_time ?? currentQuestion.answering_time,
        )
          ? (currentQuestionForPoints?.answering_time ?? currentQuestion.answering_time ?? 30)
          : 30;
        const durationMs: number =
          answerDurationMs !== null && Number.isFinite(answerDurationMs)
            ? answerDurationMs
            : fallbackAnsweringTime * 1000;
        const remainingMs: number =
          answerRemainingMs !== null && Number.isFinite(answerRemainingMs)
            ? answerRemainingMs
            : durationMs;
        // Calculate time taken using timestamp-based method for accuracy
        // This is more accurate than relying on interval-decremented values
        let responseTimeMs: number;
        if (answerId === null) {
          // Auto-submit: time_taken = full duration
          responseTimeMs = durationMs;
        } else if (answeringPhaseStartTimeRef.current !== null) {
          // Calculate from actual timestamp for precision
          const elapsedMs = Date.now() - answeringPhaseStartTimeRef.current;
          responseTimeMs = Math.max(0, Math.min(durationMs, elapsedMs));
        } else {
          // Fallback to timer-based calculation if timestamp not available
          responseTimeMs = Math.max(0, Math.min(durationMs, durationMs - remainingMs));
        }

        await submitAnswer(targetAnswerId, responseTimeMs);
      } catch (err) {
        console.error('Failed to submit answer:', err);
      }
    },
    [
      selectedAnswer,
      gameFlow?.current_question_id,
      answerDurationMs,
      answerRemainingMs,
      currentQuestionForPoints?.answering_time,
      currentQuestion.answering_time,
      submitAnswer,
    ],
  );

  // Auto-submit timeout (no answer) when answering window expires
  const autoSubmittingRef = useRef(false);
  useEffect(() => {
    if (currentPhase !== 'answering') return;
    if (autoSubmittingRef.current) return;
    if (answerStatus.hasAnswered) return;
    if (answerRemainingMs === null || answerRemainingMs > 0) return;

    // Auto-submit with null answer when timer expires
    // time_taken = full answering_time duration (as per documentation)
    const safeAnsweringTime = Number.isFinite(currentQuestion.answering_time)
      ? currentQuestion.answering_time
      : 30; // Default fallback
    const durationMs = answerDurationMs ?? safeAnsweringTime * 1000;
    autoSubmittingRef.current = true;
    submitAnswer(null, durationMs).catch((err) => {
      // Silently handle "already answered" errors (answer was submitted manually)
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (!errorMsg.includes('already') && !errorMsg.includes('Already')) {
        console.error('Auto-submit on timeout failed:', err);
        autoSubmittingRef.current = false; // Allow retry on error (except already answered)
      }
    });
  }, [
    currentPhase,
    answerStatus.hasAnswered,
    answerRemainingMs,
    answerDurationMs,
    currentQuestion.answering_time,
    submitAnswer,
  ]);

  // Transition to answer_reveal when answering timer expires
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
    console.log('Player: Answering timer expired, transitioning to answer_reveal');
    hasTransitionedToRevealRef.current = true;
    setAnswerRemainingMs(0);
    setCurrentPhase('answer_reveal');
    router.replace(`/game-player?gameId=${gameId}&phase=answer_reveal&playerId=${playerId}`);
  }, [currentPhase, answerRemainingMs, gameId, playerId, router]);

  // Memoize statistics separately to prevent unnecessary recalculations
  const statisticsMemo = useMemo(() => {
    if (!currentQuestion.choices || currentQuestion.choices.length === 0) {
      return [];
    }
    const totalAnswered = Object.values(answerStats).reduce((sum, count) => sum + count, 0);
    return currentQuestion.choices.map((choice) => {
      const count = answerStats[choice.id] || 0;
      return {
        choiceId: choice.id,
        count,
        percentage: totalAnswered > 0 ? (count / totalAnswered) * 100 : 0,
      };
    });
  }, [currentQuestion.choices, answerStats]);

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

    // Determine if answer is correct
    const isCorrect =
      answerResult?.isCorrect ??
      (playerChoice ? playerChoice.id === currentQuestion.correctAnswerId : false);

    const correctAnswerChoice =
      currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId) ||
      currentQuestion.choices[0]; // Fallback to first choice if not found

    const totalAnswered = statisticsMemo.reduce((sum, stat) => sum + stat.count, 0);

    return {
      question: currentQuestion,
      correctAnswer: correctAnswerChoice,
      playerAnswer: playerChoice,
      isCorrect,
      statistics: statisticsMemo,
      totalPlayers: Array.isArray(leaderboard) ? leaderboard.length : 0,
      totalAnswered,
    };
  }, [answerResult, currentQuestion, selectedAnswer, statisticsMemo, leaderboard]);

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
          questionNumber={
            gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
              ? gameFlow.current_question_index + 1
              : questionIndexParam + 1
          }
          totalQuestions={
            currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions)
          }
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
        <>
          <PlayerQuestionScreen
            question={{
              ...currentQuestion,
              timeLimit: currentQuestion.show_question_time || 10, // Ensure we have a valid timeLimit
            }}
            currentTime={Math.max(0, currentTimeSeconds)} // Ensure non-negative
            questionNumber={
              gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
                ? gameFlow.current_question_index + 1
                : questionIndexParam + 1
            }
            totalQuestions={
              currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions)
            }
            isMobile={isMobile}
          />
        </>
      );
    case 'answering':
      return (
        <PlayerAnswerScreen
          question={{
            ...currentQuestion,
            timeLimit: currentQuestion.answering_time,
          }}
          currentTime={currentTimeSeconds}
          questionNumber={
            gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
              ? gameFlow.current_question_index + 1
              : questionIndexParam + 1
          }
          totalQuestions={
            currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions)
          }
          onAnswerSelect={handleAnswerSelect}
          onAnswerSubmit={(answerId) => {
            // Immediately submit when answer is clicked (as per documentation)
            handleAnswerSubmit(answerId);
          }}
          isMobile={isMobile}
          isSubmitted={answerStatus.hasAnswered}
          isProcessing={answerStatus.isProcessing}
          error={answerError}
        />
      );
    case 'answer_reveal':
      return (
        <PlayerAnswerRevealScreen
          answerResult={revealPayload}
          questionNumber={
            gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
              ? gameFlow.current_question_index + 1
              : questionIndexParam + 1
          }
          totalQuestions={
            currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions)
          }
          timeLimit={5}
          onTimeExpired={() => {
            // IMPORTANT:
            // Answer reveal must NOT auto-advance. We wait for the host to press "Next",
            // which will broadcast `game:phase:change` to move everyone forward.
            console.log('Player: Answer reveal time expired, waiting for host to advance');
          }}
        />
      );
    case 'leaderboard': {
      // Check if this is the last question - if so, show loading while redirecting
      const currentQuestionNum =
        gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
          ? gameFlow.current_question_index + 1
          : questionIndexParam + 1;
      const totalQuestionsCount =
        currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions);
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

      // Transform leaderboard data
      const leaderboardEntries = Array.isArray(leaderboard)
        ? leaderboard.map((entry) => ({
            playerId: entry.player_id,
            playerName: entry.player_name,
            score: entry.score,
            rank: entry.rank,
            previousRank: entry.previous_rank ?? entry.rank,
            rankChange: (entry.rank_change || 'same') as 'up' | 'down' | 'same',
            scoreChange: entry.score_change ?? 0,
          }))
        : [];

      // Debug log
      console.log('[Leaderboard Phase]', {
        rawLeaderboard: leaderboard,
        transformedEntries: leaderboardEntries,
        loading: leaderboardLoading,
        gameId,
      });

      return (
        <PlayerLeaderboardScreen
          leaderboardData={{
            entries: leaderboardEntries,
            questionNumber: currentQuestionNum,
            totalQuestions: totalQuestionsCount,
            timeRemaining: Math.max(0, Math.round((timerState?.remainingMs || 5000) / 1000)),
            timeLimit: 5,
          }}
          onTimeExpired={() => {}}
        />
      );
    }
    case 'explanation': {
      const currentQuestionNum =
        gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
          ? gameFlow.current_question_index + 1
          : questionIndexParam + 1;
      const totalQuestionsCount =
        currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions);
      const isLastQuestion = currentQuestionNum >= totalQuestionsCount;

      const handleExplanationTimeExpired = () => {
        if (isLastQuestion) {
          // Last question - go to podium
          console.log('Player: Explanation time expired, moving to podium');
          setCurrentPhase('podium');
          router.replace(`/game-player?gameId=${gameId}&phase=podium&playerId=${playerId}`);
        } else {
          // Not last question - wait for next question (will be triggered by host)
          console.log('Player: Explanation time expired, waiting for next question');
          // The host will trigger the next question, so we just wait
        }
      };

      return (
        <PlayerExplanationScreen
          explanation={{
            questionNumber: currentQuestionNum,
            totalQuestions: totalQuestionsCount,
            timeLimit: explanationData?.show_time || 10,
            title: explanationData?.title || '解説',
            body:
              explanationData?.text || currentQuestion.explanation || '解説は近日追加されます。',
            image: explanationData?.image_url || undefined,
          }}
          onTimeExpired={handleExplanationTimeExpired}
        />
      );
    }
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
