// Game-related TypeScript interfaces

export interface Choice {
  id: string;
  text: string;
  letter: string;
}

export interface Question {
  id: string;
  text: string;
  image?: string;
  timeLimit: number;
  choices: Choice[];
  correctAnswerId: string;
  explanation?: string;
  type: 'multiple_choice_2' | 'multiple_choice_3' | 'multiple_choice_4' | 'true_false';
}

export interface AnswerStatistic {
  choiceId: string;
  count: number;
  percentage: number;
}

export interface PlayerAnswer {
  playerId: string;
  choiceId: string;
  isCorrect: boolean;
  submittedAt: string;
}

export interface AnswerResult {
  question: Question;
  correctAnswer: Choice;
  playerAnswer?: Choice;
  isCorrect: boolean;
  statistics: AnswerStatistic[];
  totalPlayers: number;
  totalAnswered: number;
}

export interface GameSession {
  id: string;
  hostId: string;
  currentQuestionNumber: number;
  totalQuestions: number;
  phase:
    | 'waiting'
    | 'countdown'
    | 'question'
    | 'answering'
    | 'answer_reveal'
    | 'leaderboard'
    | 'explanation'
    | 'podium'
    | 'ended';
  currentQuestionStartTime?: string;
  players: Array<{
    id: string;
    name: string;
    score: number;
    isConnected: boolean;
  }>;
}

// Leaderboard-specific types
export type RankChange = 'up' | 'down' | 'same';

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
  previousRank?: number;
  rankChange: RankChange;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  timeLimit: number;
}

export interface ExplanationData {
  questionNumber: number;
  totalQuestions: number;
  timeLimit: number;
  title: string;
  body: string;
  image?: string;
  subtitle?: string;
}
