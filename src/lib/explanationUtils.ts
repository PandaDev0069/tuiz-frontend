// ====================================================
// File Name   : explanationUtils.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-12-30
// Last Update : 2025-12-30

// Description:
// - Utility functions for transforming explanation data
// - Converts between backend API format and frontend component format
// - Handles default values and field mapping

// Notes:
// - Provides default values for missing explanation data
// - Supports both direct backend responses and question object formats
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import type { ExplanationData } from '@/types/game';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEFAULT_EXPLANATION_TIME_SECONDS = 10;
const DEFAULT_EXPLANATION_TITLE = '解説';
const DEFAULT_EXPLANATION_BODY = '解説は近日追加されます。';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: BackendExplanationResponse
 * Description:
 * - Backend API response format for explanation data
 * - Matches the structure returned by explanation endpoints
 */
export interface BackendExplanationResponse {
  title: string | null;
  text: string | null;
  image_url: string | null;
  show_time: number | null;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Function: transformExplanationData
 * Description:
 * - Transforms backend explanation response to frontend ExplanationData format
 * - Applies default values for missing fields
 * - Maps backend field names to frontend field names
 *
 * Parameters:
 * - backendData (BackendExplanationResponse): Explanation data from backend API
 * - questionNumber (number): Current question number (1-indexed)
 * - totalQuestions (number): Total number of questions in the game
 *
 * Returns:
 * - ExplanationData: Transformed explanation data for frontend components
 */
export function transformExplanationData(
  backendData: BackendExplanationResponse,
  questionNumber: number,
  totalQuestions: number,
): ExplanationData {
  return {
    questionNumber,
    totalQuestions,
    timeLimit: backendData.show_time || DEFAULT_EXPLANATION_TIME_SECONDS,
    title: backendData.title || DEFAULT_EXPLANATION_TITLE,
    body: backendData.text || DEFAULT_EXPLANATION_BODY,
    image: backendData.image_url || undefined,
    subtitle: undefined,
  };
}

/**
 * Function: transformQuestionExplanationData
 * Description:
 * - Transforms explanation data from question object format
 * - Maps question explanation fields to backend format, then transforms
 * - Used for current question endpoint responses
 *
 * Parameters:
 * - questionData (object): Question data with explanation fields
 * - questionNumber (number): Current question number (1-indexed)
 * - totalQuestions (number): Total number of questions in the game
 *
 * Returns:
 * - ExplanationData: Transformed explanation data for frontend components
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
