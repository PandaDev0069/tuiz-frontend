// ====================================================
// File Name   : game.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-23
// Last Update : 2026-01-01
//
// Description:
// - Game-related TypeScript interfaces and types
// - Defines types for game sessions, questions, answers, and leaderboards
// - Provides type safety for real-time game flow and player interactions
//
// Notes:
// - Game phases track the current state of the game session
// - Leaderboard types support rank change tracking
// - Answer statistics track player response distribution
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------

//----------------------------------------------------
// 2. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: Choice
 * Description:
 * - Represents a single answer choice for a question
 * - Includes unique identifier, display text, and letter label
 */
export interface Choice {
  id: string;
  text: string;
  letter: string;
}

/**
 * Interface: Question
 * Description:
 * - Complete question structure with timing and answer options
 * - Supports multiple choice and true/false question types
 * - Includes optional image and explanation
 */
export interface Question {
  id: string;
  text: string;
  image?: string;
  timeLimit: number;
  show_question_time: number;
  answering_time: number;
  show_explanation_time?: number;
  choices: Choice[];
  correctAnswerId: string;
  explanation?: string;
  type: 'multiple_choice_2' | 'multiple_choice_3' | 'multiple_choice_4' | 'true_false';
}

/**
 * Interface: AnswerStatistic
 * Description:
 * - Statistics for answer choice distribution
 * - Tracks count and percentage of players who selected each choice
 */
export interface AnswerStatistic {
  choiceId: string;
  count: number;
  percentage: number;
}

/**
 * Interface: PlayerAnswer
 * Description:
 * - Individual player's answer submission
 * - Tracks which choice was selected and correctness status
 */
export interface PlayerAnswer {
  playerId: string;
  choiceId: string;
  isCorrect: boolean;
  submittedAt: string;
}

/**
 * Interface: AnswerResult
 * Description:
 * - Complete answer result for a question
 * - Includes question details, correct answer, player's answer, and statistics
 */
export interface AnswerResult {
  question: Question;
  correctAnswer: Choice;
  playerAnswer?: Choice;
  isCorrect: boolean;
  statistics: AnswerStatistic[];
  totalPlayers: number;
  totalAnswered: number;
}

/**
 * Interface: GameSession
 * Description:
 * - Current game session state and metadata
 * - Tracks game phase, question progress, and connected players
 */
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

/**
 * Type: RankChange
 * Description:
 * - Represents direction of rank change in leaderboard
 */
export type RankChange = 'up' | 'down' | 'same';

/**
 * Interface: LeaderboardEntry
 * Description:
 * - Single entry in the game leaderboard
 * - Includes player info, score, rank, and change indicators
 */
export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
  previousRank?: number;
  rankChange: RankChange;
  scoreChange?: number;
}

/**
 * Interface: LeaderboardData
 * Description:
 * - Complete leaderboard data structure
 * - Includes entries, question progress, and timing information
 */
export interface LeaderboardData {
  entries: LeaderboardEntry[];
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  timeLimit: number;
}

/**
 * Interface: ExplanationData
 * Description:
 * - Data structure for question explanation display
 * - Includes question context, explanation content, and optional media
 */
export interface ExplanationData {
  questionNumber: number;
  totalQuestions: number;
  timeLimit: number;
  title: string;
  body: string;
  image?: string;
  subtitle?: string;
}
