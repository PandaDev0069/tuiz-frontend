// ====================================================
// File Name   : pointCalculation.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-12-24
// Last Update : 2025-12-24
//
// Description:
// - Point calculation utility for quiz game scoring
// - Implements point calculation logic based on game_point_calculation.md
// - Handles time bonus and streak bonus scoring modes
// - Provides detailed breakdown of point calculations
//
// Notes:
// - Logic must match backend gamePlayerDataService.calculatePoints
// - Supports five answer cases: correct/incorrect, in time/not in time, no answer
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STREAK_BONUS_PER_STREAK = 0.1;
const MAX_STREAK_BONUS = 0.5;
const STREAK_MULTIPLIER_BASE = 1;
const MIN_POINTS = 0;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: PointCalculationParams
 * Description:
 * - Parameters for point calculation
 * - Contains question data, answer data, game settings, and player streak
 */
export interface PointCalculationParams {
  basePoints: number;
  answeringTime: number;
  isCorrect: boolean;
  timeTaken: number;
  answeredInTime: boolean;
  timeBonusEnabled: boolean;
  streakBonusEnabled: boolean;
  currentStreak: number;
}

/**
 * Interface: PointCalculationResult
 * Description:
 * - Result of point calculation with detailed breakdown
 * - Contains final points and calculation components
 */
export interface PointCalculationResult {
  points: number;
  breakdown: {
    basePoints: number;
    timePenalty: number;
    timeBonus: number;
    streakMultiplier: number;
    finalPoints: number;
  };
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Function: calculatePoints
 * Description:
 * - Calculates points earned for an answer based on game settings
 * - Applies time bonus and streak bonus if enabled
 * - Returns 0 points for incorrect answers or answers not submitted in time
 *
 * Parameters:
 * - params (PointCalculationParams): Point calculation parameters
 *
 * Returns:
 * - PointCalculationResult: Calculated points with detailed breakdown
 *
 * Formula:
 * - Base: basePoints (if correct and in time, 0 otherwise)
 * - Time bonus: basePoints - (timeTaken * (basePoints / answeringTime))
 * - Streak bonus: timeAdjusted * (1 + min(0.5, streak * 0.1))
 * - Combined: (basePoints - timePenalty) * streakMultiplier
 */
export function calculatePoints(params: PointCalculationParams): PointCalculationResult {
  const {
    basePoints,
    answeringTime,
    isCorrect,
    timeTaken,
    answeredInTime,
    timeBonusEnabled,
    streakBonusEnabled,
    currentStreak,
  } = params;

  if (!isCorrect || !answeredInTime) {
    return {
      points: MIN_POINTS,
      breakdown: {
        basePoints,
        timePenalty: MIN_POINTS,
        timeBonus: MIN_POINTS,
        streakMultiplier: STREAK_MULTIPLIER_BASE,
        finalPoints: MIN_POINTS,
      },
    };
  }

  let timeAdjusted = basePoints;
  let timePenalty = MIN_POINTS;

  if (timeBonusEnabled) {
    const timePenaltyFactor = basePoints / answeringTime;
    const timePenaltyAmount = timeTaken * timePenaltyFactor;
    timePenalty = Math.min(timePenaltyAmount, basePoints);
    timeAdjusted = Math.max(MIN_POINTS, basePoints - timePenalty);
  }

  const streakMultiplier = streakBonusEnabled
    ? STREAK_MULTIPLIER_BASE + Math.min(MAX_STREAK_BONUS, currentStreak * STREAK_BONUS_PER_STREAK)
    : STREAK_MULTIPLIER_BASE;

  const finalPoints = Math.max(MIN_POINTS, Math.round(timeAdjusted * streakMultiplier));

  return {
    points: finalPoints,
    breakdown: {
      basePoints,
      timePenalty: Math.round(timePenalty),
      timeBonus: MIN_POINTS,
      streakMultiplier: Math.round(streakMultiplier * 100) / 100,
      finalPoints,
    },
  };
}

/**
 * Function: calculatePointsSimple
 * Description:
 * - Simplified point calculation that returns only the final points value
 * - Wrapper around calculatePoints for convenience
 *
 * Parameters:
 * - basePoints (number): Base points for the question
 * - answeringTime (number): Time limit for answering (in seconds)
 * - timeTaken (number): Time taken to answer (in seconds)
 * - isCorrect (boolean): Whether answer is correct
 * - answeredInTime (boolean): Whether answer was submitted within time limit
 * - timeBonusEnabled (boolean): Whether time bonus is enabled
 * - streakBonusEnabled (boolean): Whether streak bonus is enabled
 * - currentStreak (number): Current streak count
 *
 * Returns:
 * - number: Final calculated points
 */
export function calculatePointsSimple(
  basePoints: number,
  answeringTime: number,
  timeTaken: number,
  isCorrect: boolean,
  answeredInTime: boolean,
  timeBonusEnabled: boolean,
  streakBonusEnabled: boolean,
  currentStreak: number,
): number {
  return calculatePoints({
    basePoints,
    answeringTime,
    isCorrect,
    timeTaken,
    answeredInTime,
    timeBonusEnabled,
    streakBonusEnabled,
    currentStreak,
  }).points;
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
