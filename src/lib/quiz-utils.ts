/**
 * Utility functions for quiz-related operations
 */

/**
 * Get the color class for a difficulty level
 */
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'hard':
      return 'bg-orange-500';
    case 'expert':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

/**
 * Get the Japanese label for a difficulty level
 */
export const getDifficultyLabel = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return '簡単';
    case 'medium':
      return '普通';
    case 'hard':
      return '難しい';
    case 'expert':
      return 'エキスパート';
    default:
      return difficulty;
  }
};
