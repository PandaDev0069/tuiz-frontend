// ====================================================
// File Name   : quiz-utils.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Utility functions for quiz-related operations
// - Provides difficulty level color and label mappings
// - Used for displaying difficulty badges and labels in UI
//
// Notes:
// - Color classes are Tailwind CSS background color utilities
// - Labels are in Japanese for user-facing display
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DIFFICULTY_EASY = 'easy';
const DIFFICULTY_MEDIUM = 'medium';
const DIFFICULTY_HARD = 'hard';
const DIFFICULTY_EXPERT = 'expert';

const COLOR_EASY = 'bg-green-500';
const COLOR_MEDIUM = 'bg-yellow-500';
const COLOR_HARD = 'bg-orange-500';
const COLOR_EXPERT = 'bg-red-500';
const COLOR_DEFAULT = 'bg-gray-500';

const LABEL_EASY = '簡単';
const LABEL_MEDIUM = '普通';
const LABEL_HARD = '難しい';
const LABEL_EXPERT = 'エキスパート';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Function: getDifficultyColor
 * Description:
 * - Returns Tailwind CSS background color class for a difficulty level
 * - Maps difficulty strings to corresponding color classes
 *
 * Parameters:
 * - difficulty (string): Difficulty level string (easy, medium, hard, expert)
 *
 * Returns:
 * - string: Tailwind CSS background color class
 */
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case DIFFICULTY_EASY:
      return COLOR_EASY;
    case DIFFICULTY_MEDIUM:
      return COLOR_MEDIUM;
    case DIFFICULTY_HARD:
      return COLOR_HARD;
    case DIFFICULTY_EXPERT:
      return COLOR_EXPERT;
    default:
      return COLOR_DEFAULT;
  }
};

/**
 * Function: getDifficultyLabel
 * Description:
 * - Returns Japanese label for a difficulty level
 * - Maps difficulty strings to user-facing Japanese labels
 *
 * Parameters:
 * - difficulty (string): Difficulty level string (easy, medium, hard, expert)
 *
 * Returns:
 * - string: Japanese label for the difficulty level, or original string if unknown
 */
export const getDifficultyLabel = (difficulty: string): string => {
  switch (difficulty) {
    case DIFFICULTY_EASY:
      return LABEL_EASY;
    case DIFFICULTY_MEDIUM:
      return LABEL_MEDIUM;
    case DIFFICULTY_HARD:
      return LABEL_HARD;
    case DIFFICULTY_EXPERT:
      return LABEL_EXPERT;
    default:
      return difficulty;
  }
};

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
