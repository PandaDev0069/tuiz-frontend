/**
 * Utility functions for transforming explanation data between backend and frontend formats
 */

import type { ExplanationData } from '@/types/game';

/**
 * Backend explanation response format
 */
export interface BackendExplanationResponse {
  title: string | null;
  text: string | null;
  image_url: string | null;
  show_time: number | null;
}

/**
 * Transform backend explanation response to frontend ExplanationData format
 *
 * @param backendData - The explanation data from backend API
 * @param questionNumber - Current question number (1-indexed)
 * @param totalQuestions - Total number of questions in the game
 * @returns Transformed ExplanationData for frontend components
 */
export function transformExplanationData(
  backendData: BackendExplanationResponse,
  questionNumber: number,
  totalQuestions: number,
): ExplanationData {
  return {
    questionNumber,
    totalQuestions,
    timeLimit: backendData.show_time || 10, // Default to 10 seconds if not specified
    title: backendData.title || '解説', // Default title if not provided
    body: backendData.text || '解説は近日追加されます。', // Default body if not provided
    image: backendData.image_url || undefined,
    subtitle: undefined, // Not provided by backend, can be added if needed
  };
}

/**
 * Transform explanation data from question object (used in current question endpoint)
 *
 * @param questionData - Question data with explanation fields
 * @param questionNumber - Current question number (1-indexed)
 * @param totalQuestions - Total number of questions in the game
 * @returns Transformed ExplanationData for frontend components
 */
export function transformQuestionExplanationData(
  questionData: {
    explanation_title?: string | null;
    explanation_text?: string | null;
    explanation_image_url?: string | null;
    show_explanation_time?: number | null;
  },
  questionNumber: number,
  totalQuestions: number,
): ExplanationData {
  return transformExplanationData(
    {
      title: questionData.explanation_title || null,
      text: questionData.explanation_text || null,
      image_url: questionData.explanation_image_url || null,
      show_time: questionData.show_explanation_time || null,
    },
    questionNumber,
    totalQuestions,
  );
}
