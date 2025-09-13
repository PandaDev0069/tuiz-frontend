// src/lib/quizService.ts
// Main API service for quiz operations

import { apiClient, handleApiError } from './apiClient';
import { API_ENDPOINTS } from '@/types/api';
import type {
  // Request/Response types
  CreateQuizRequest,
  UpdateQuizRequest,
  QuizListRequest,
  QuizListResponse,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  QuestionResponse,
  QuestionsListResponse,
  ReorderQuestionsRequest,
  CreateAnswerRequest,
  UpdateAnswerRequest,
  AnswerResponse,
  AnswersListResponse,
  QuizValidationResponse,
  PublishResponse,
  UnpublishResponse,
  GenerateCodeResponse,
  CheckCodeAvailabilityResponse,
  GetQuizCodeResponse,
  RemoveCodeResponse,
  ApiError,
} from '@/types/api';
import type {
  QuizSet,
  QuizSetComplete,
  Answer,
  QuestionWithAnswers,
  QuizPlaySettings,
} from '@/types/quiz';

// ============================================================================
// QUIZ SERVICE CLASS
// ============================================================================

class QuizService {
  // ============================================================================
  // QUIZ CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new quiz
   */
  async createQuiz(data: CreateQuizRequest): Promise<QuizSet> {
    try {
      // Backend returns quiz data directly, not wrapped in { quiz: ... }
      const response = await apiClient.post<QuizSet>(API_ENDPOINTS.QUIZ, data);
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Get a quiz by ID
   */
  async getQuiz(id: string): Promise<QuizSet> {
    try {
      // Backend returns quiz data directly, not wrapped in { quiz: ... }
      const response = await apiClient.get<QuizSet>(API_ENDPOINTS.QUIZ_BY_ID(id));
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Get a complete quiz with questions and answers
   */
  async getQuizComplete(id: string): Promise<QuizSetComplete> {
    try {
      // Backend returns quiz data directly, not wrapped in { quiz: ... }
      const response = await apiClient.get<QuizSetComplete>(
        `${API_ENDPOINTS.QUIZ_BY_ID(id)}?include=questions,answers`,
      );
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Start editing a quiz (set status to draft)
   */
  async startEditQuiz(id: string): Promise<{ id: string; status: string; updated_at: string }> {
    try {
      const response = await apiClient.put<{ id: string; status: string; updated_at: string }>(
        API_ENDPOINTS.QUIZ_START_EDIT(id),
        {},
      );
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Update a quiz
   */
  async updateQuiz(id: string, data: UpdateQuizRequest): Promise<QuizSet> {
    try {
      // Backend returns quiz data directly, not wrapped in { quiz: ... }
      const response = await apiClient.put<QuizSet>(API_ENDPOINTS.QUIZ_BY_ID(id), data);
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Delete a quiz
   */
  async deleteQuiz(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.QUIZ_BY_ID(id));
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * List quizzes with filtering and pagination
   */
  async listQuizzes(filters: QuizListRequest = {}): Promise<QuizListResponse> {
    try {
      const queryString = apiClient.createQueryString(filters as Record<string, unknown>);
      const response = await apiClient.get<QuizListResponse>(
        `${API_ENDPOINTS.QUIZ_LIST}${queryString}`,
      );
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  // ============================================================================
  // QUESTION MANAGEMENT
  // ============================================================================

  /**
   * Add a question to a quiz
   */
  async addQuestion(quizId: string, data: CreateQuestionRequest): Promise<QuestionWithAnswers> {
    try {
      const response = await apiClient.post<QuestionResponse>(
        API_ENDPOINTS.QUESTIONS(quizId),
        data,
      );
      return response.question;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Update a question
   */
  async updateQuestion(
    quizId: string,
    questionId: string,
    data: UpdateQuestionRequest,
  ): Promise<QuestionWithAnswers> {
    try {
      const response = await apiClient.put<QuestionResponse>(
        API_ENDPOINTS.QUESTION_BY_ID(quizId, questionId),
        data,
      );
      return response.question;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Delete a question
   */
  async deleteQuestion(quizId: string, questionId: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.QUESTION_BY_ID(quizId, questionId));
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Get all questions for a quiz
   */
  async getQuestions(quizId: string): Promise<QuestionWithAnswers[]> {
    try {
      const response = await apiClient.get<QuestionsListResponse>(API_ENDPOINTS.QUESTIONS(quizId));
      return response.questions;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Reorder questions in a quiz
   */
  async reorderQuestions(
    quizId: string,
    questions: ReorderQuestionsRequest['questions'],
  ): Promise<void> {
    try {
      await apiClient.put(API_ENDPOINTS.REORDER_QUESTIONS(quizId), { questions });
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  // ============================================================================
  // ANSWER MANAGEMENT
  // ============================================================================

  /**
   * Add an answer to a question
   */
  async addAnswer(quizId: string, questionId: string, data: CreateAnswerRequest): Promise<Answer> {
    try {
      const response = await apiClient.post<AnswerResponse>(
        API_ENDPOINTS.ANSWERS(quizId, questionId),
        data,
      );
      return response.answer;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Update an answer
   */
  async updateAnswer(
    quizId: string,
    questionId: string,
    answerId: string,
    data: UpdateAnswerRequest,
  ): Promise<Answer> {
    try {
      const response = await apiClient.put<AnswerResponse>(
        API_ENDPOINTS.ANSWER_BY_ID(quizId, questionId, answerId),
        data,
      );
      return response.answer;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Delete an answer
   */
  async deleteAnswer(quizId: string, questionId: string, answerId: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.ANSWER_BY_ID(quizId, questionId, answerId));
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Get all answers for a question
   */
  async getAnswers(quizId: string, questionId: string): Promise<Answer[]> {
    try {
      const response = await apiClient.get<AnswersListResponse>(
        API_ENDPOINTS.ANSWERS(quizId, questionId),
      );
      return response.answers;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if the service is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Batch save questions (useful for auto-save)
   */
  async batchSaveQuestions(
    quizId: string,
    questions: (CreateQuestionRequest | (UpdateQuestionRequest & { id: string }))[],
  ): Promise<QuestionWithAnswers[]> {
    const results: QuestionWithAnswers[] = [];

    for (const question of questions) {
      try {
        // Sanitize the question data before sending to backend
        const sanitizedQuestion = this.sanitizeQuestionData(question);

        if ('id' in question && question.id) {
          // Update existing question
          const updated = await this.updateQuestion(quizId, question.id, sanitizedQuestion);
          results.push(updated);
        } else {
          // Create new question
          const created = await this.addQuestion(
            quizId,
            sanitizedQuestion as CreateQuestionRequest,
          );
          results.push(created);
        }
      } catch (error) {
        console.error('Failed to save question:', question, error);
        // Continue with other questions instead of failing entirely
      }
    }

    return results;
  }

  /**
   * Sanitize question data to ensure undefined values are converted to null
   */
  private sanitizeQuestionData(
    question: CreateQuestionRequest | (UpdateQuestionRequest & { id: string }),
  ): CreateQuestionRequest | (UpdateQuestionRequest & { id: string }) {
    return {
      ...question,
      image_url: question.image_url ?? null,
      explanation_title: question.explanation_title ?? null,
      explanation_text: question.explanation_text ?? null,
      explanation_image_url: question.explanation_image_url ?? null,
      answers:
        question.answers?.map((answer) => ({
          ...answer,
          image_url: answer.image_url ?? null,
        })) || [],
    };
  }

  /**
   * Synchronize questions for editing - handles create, update, and delete
   */
  async syncQuestionsForEdit(
    quizId: string,
    currentQuestions: (CreateQuestionRequest | (UpdateQuestionRequest & { id: string }))[],
    originalQuestions: QuestionWithAnswers[] = [],
  ): Promise<QuestionWithAnswers[]> {
    console.log('syncQuestionsForEdit called with:', {
      quizId,
      currentQuestionCount: currentQuestions.length,
      originalQuestionCount: originalQuestions.length,
      currentQuestionIds: currentQuestions.map((q) => ('id' in q ? q.id : 'new')),
      originalQuestionIds: originalQuestions.map((q) => q.id),
    });

    const results: QuestionWithAnswers[] = [];
    const originalQuestionIds = new Set(originalQuestions.map((q) => q.id));
    const currentQuestionIds = new Set(
      currentQuestions.filter((q) => 'id' in q && q.id).map((q) => (q as { id: string }).id),
    );

    // 1. Delete questions that were removed
    const questionsToDelete = originalQuestions.filter((q) => !currentQuestionIds.has(q.id));
    console.log(
      'Questions to delete:',
      questionsToDelete.map((q) => q.id),
    );

    for (const question of questionsToDelete) {
      try {
        await this.deleteQuestion(quizId, question.id);
        console.log('Deleted question:', question.id);
      } catch (error) {
        console.error('Failed to delete question:', question.id, error);
      }
    }

    // 2. Process current questions (create or update)
    for (const question of currentQuestions) {
      try {
        // Sanitize the question data before sending to backend
        const sanitizedQuestion = this.sanitizeQuestionData(question);

        if ('id' in question && question.id && originalQuestionIds.has(question.id)) {
          // Update existing question
          console.log('Updating existing question:', question.id);
          const updated = await this.updateQuestion(quizId, question.id, sanitizedQuestion);
          if (updated) {
            results.push(updated);
            console.log('Updated question:', question.id);
          }
        } else {
          // Create new question
          console.log('Creating new question:', question.question_text?.substring(0, 50) + '...');
          const created = await this.addQuestion(
            quizId,
            sanitizedQuestion as CreateQuestionRequest,
          );
          if (created) {
            results.push(created);
            console.log('Created new question:', created.id);
          }
        }
      } catch (error) {
        console.error('Failed to sync question:', question, error);
        // Don't add undefined to results array
      }
    }

    console.log(
      'syncQuestionsForEdit completed. Results:',
      results.filter(Boolean).map((q) => q.id),
    );
    return results.filter(Boolean);
  }

  /**
   * Save quiz as draft with questions
   */
  async saveDraft(
    quizData: CreateQuizRequest | (UpdateQuizRequest & { id: string }),
    questions: CreateQuestionRequest[] = [],
  ): Promise<{ quiz: QuizSet; questions: QuestionWithAnswers[] }> {
    let quiz: QuizSet;

    // Save quiz data
    if ('id' in quizData && quizData.id) {
      quiz = await this.updateQuiz(quizData.id, quizData);
    } else {
      quiz = await this.createQuiz(quizData as CreateQuizRequest);
    }

    // Save questions if provided
    let savedQuestions: QuestionWithAnswers[] = [];
    if (questions.length > 0) {
      savedQuestions = await this.batchSaveQuestions(quiz.id, questions);
    }

    return { quiz, questions: savedQuestions };
  }

  // ============================================================================
  // CUSTOM CODE MANAGEMENT
  // ============================================================================

  /**
   * Generate a unique code for a quiz
   */
  async generateQuizCode(quizId: string): Promise<GenerateCodeResponse> {
    try {
      const response = await apiClient.post<GenerateCodeResponse>(
        API_ENDPOINTS.GENERATE_CODE(quizId),
        {},
      );
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Check if a code is available
   */
  async checkCodeAvailability(code: number): Promise<CheckCodeAvailabilityResponse> {
    try {
      const response = await apiClient.get<CheckCodeAvailabilityResponse>(
        API_ENDPOINTS.CHECK_CODE(code),
      );
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Get current quiz code
   */
  async getQuizCode(quizId: string): Promise<GetQuizCodeResponse> {
    try {
      const response = await apiClient.get<GetQuizCodeResponse>(API_ENDPOINTS.GET_CODE(quizId));
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Remove quiz code
   */
  async removeQuizCode(quizId: string): Promise<RemoveCodeResponse> {
    try {
      const response = await apiClient.delete<RemoveCodeResponse>(
        API_ENDPOINTS.REMOVE_CODE(quizId),
      );
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Update quiz play settings
   */
  async updatePlaySettings(
    quizId: string,
    playSettings: Partial<QuizPlaySettings>,
  ): Promise<QuizSet> {
    try {
      const response = await apiClient.put<QuizSet>(API_ENDPOINTS.QUIZ_BY_ID(quizId), {
        play_settings: playSettings,
      });
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  // ============================================================================
  // PUBLISHING OPERATIONS
  // ============================================================================

  /**
   * Validate quiz before publishing
   */
  async validateQuiz(quizId: string): Promise<QuizValidationResponse> {
    try {
      const response = await apiClient.get<QuizValidationResponse>(
        API_ENDPOINTS.VALIDATE_QUIZ(quizId),
      );
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Publish quiz
   */
  async publishQuiz(quizId: string): Promise<PublishResponse> {
    try {
      const response = await apiClient.post<PublishResponse>(
        API_ENDPOINTS.PUBLISH_QUIZ(quizId),
        {},
      );
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Unpublish quiz
   */
  async unpublishQuiz(quizId: string): Promise<UnpublishResponse> {
    try {
      const response = await apiClient.post<UnpublishResponse>(
        API_ENDPOINTS.UNPUBLISH_QUIZ(quizId),
        {},
      );
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const quizService = new QuizService();
export type { QuizService };
