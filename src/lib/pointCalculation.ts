/**
 * Point Calculation Utility
 * Implements point calculation logic based on game_point_calculation.md
 *
 * Cases:
 * 1. Player answered correctly
 * 2. Player answered incorrectly
 * 3. Player answered correctly but not in time
 * 4. Player answered incorrectly but in time
 * 5. Player did not answer in time
 */

export interface PointCalculationParams {
  // Question data
  basePoints: number; // Points per question (from question.points)
  answeringTime: number; // Time limit for answering (in seconds, from question.answering_time)

  // Answer data
  isCorrect: boolean;
  timeTaken: number; // Time taken to answer (in seconds)
  answeredInTime: boolean; // Whether answer was submitted within time limit

  // Game settings
  timeBonusEnabled: boolean;
  streakBonusEnabled: boolean;

  // Player streak (current consecutive correct answers)
  currentStreak: number; // Current streak count (0-5 max)
}

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

const MAX_STREAK = 5;
const STREAK_MULTIPLIER_PER_STREAK = 0.1; // 10% per streak, max 50% (1.5x total)

/**
 * Calculate points earned for an answer based on game settings
 *
 * Formula:
 * - Normal mode: basePoints (if correct, 0 if incorrect)
 * - Time bonus mode: basePoints - (timeTaken * (basePoints / answeringTime))
 * - Streak bonus mode: basePoints * (1 + min(streak, MAX_STREAK) * STREAK_MULTIPLIER_PER_STREAK)
 * - Combined mode: (basePoints - timePenalty) * streakMultiplier
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

  // Case 2, 4, 5: Incorrect answer or no answer = 0 points
  if (!isCorrect || !answeredInTime) {
    return {
      points: 0,
      breakdown: {
        basePoints,
        timePenalty: 0,
        timeBonus: 0,
        streakMultiplier: 1,
        finalPoints: 0,
      },
    };
  }

  // Case 1, 3: Correct answer (may or may not be in time)
  // If answered correctly but not in time, still get 0 points
  if (!answeredInTime) {
    return {
      points: 0,
      breakdown: {
        basePoints,
        timePenalty: 0,
        timeBonus: 0,
        streakMultiplier: 1,
        finalPoints: 0,
      },
    };
  }

  // Start with base points
  let points = basePoints;
  let timePenalty = 0;
  const timeBonus = 0; // Not used in current formula, kept for future use
  let streakMultiplier = 1;

  // Apply time bonus/penalty if enabled
  if (timeBonusEnabled) {
    // Time penalty: faster answers get more points
    // Based on documentation example: "100 - (1.5 * answering_time) = 85 points"
    // Where timeTaken = 1.5 seconds, answering_time = 10 seconds, basePoints = 100
    // Formula: basePoints - (timeTaken * answeringTime)
    // However, this doesn't scale well for different basePoints values.
    // We use a proportional approach: basePoints - (timeTaken * (basePoints / answeringTime))
    // This ensures:
    // - If timeTaken = 0, points = basePoints (full points)
    // - If timeTaken = answeringTime, points = 0 (no points)
    // - Scales proportionally for any basePoints value

    const timePenaltyFactor = basePoints / answeringTime;
    const timePenaltyAmount = timeTaken * timePenaltyFactor;
    timePenalty = Math.min(timePenaltyAmount, basePoints); // Cap at basePoints
    points = Math.max(0, basePoints - timePenalty); // Ensure non-negative
  }

  // Apply streak bonus if enabled
  if (streakBonusEnabled) {
    // Streak multiplier based on documentation: "100 + (100 * 0.3) = 130 points" for streak 3
    // This means: basePoints * (1 + streak * 0.1)
    // Max streak is 5, so max multiplier is 1.5 (50% bonus)
    const cappedStreak = Math.min(currentStreak, MAX_STREAK);
    streakMultiplier = 1 + cappedStreak * STREAK_MULTIPLIER_PER_STREAK;
    points = points * streakMultiplier;
  }

  // Round to nearest integer
  const finalPoints = Math.round(points);

  return {
    points: finalPoints,
    breakdown: {
      basePoints,
      timePenalty: Math.round(timePenalty),
      timeBonus: Math.round(timeBonus),
      streakMultiplier: Math.round(streakMultiplier * 100) / 100, // Round to 2 decimals
      finalPoints,
    },
  };
}

/**
 * Calculate points for a correct answer (simplified version)
 * Used when you only need the final points value
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
