// ====================================================
// File Name   : quizService.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-11
// Last Update : 2025-12-26
//
// Description:
// - Main API service for quiz operations
// - Handles CRUD operations for quizzes, questions, and answers
// - Provides methods for quiz publishing, code management, and validation
// - Manages quiz editing workflow and draft saving
//
// Notes:
// - Uses apiClient for all HTTP operations
// - All methods handle errors via handleApiError utility
// - Supports batch operations for questions and answers
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { apiClient, handleApiError } from './apiClient';
import { API_ENDPOINTS } from '@/types/api';
import type {
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

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const QUERY_PARAM_INCLUDE = 'include';
const QUERY_PARAM_QUESTIONS_ANSWERS = 'questions,answers';
const PATH_SEGMENT_EDIT = 'edit';
const PATH_SEGMENT_DRAFT = 'draft';
const PATH_SEGMENT_PUBLISH = 'publish';
const PATH_SEGMENT_QUESTIONS = 'questions';
const PATH_SEGMENT_BATCH = 'batch';
const REQUEST_BODY_KEY_QUESTIONS = 'questions';
const REQUEST_BODY_KEY_PLAY_SETTINGS = 'play_settings';

const ERROR_MESSAGE_ROUTE_NOT_FOUND = 'Route not found';
const ERROR_MESSAGE_FAILED_TO_SAVE_QUESTION = 'Failed to save question:';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Class: QuizService
 * Description:
 * - Service for managing quiz operations via backend API
 * - Provides methods for CRUD operations on quizzes, questions, and answers
 * - Handles quiz publishing, validation, and code management
 */
class QuizService {
  /**
   * Method: createQuiz
   * Description:
   * - Creates a new quiz set
   *
   * Parameters:
   * - data (CreateQuizRequest): Quiz creation data
   *
   * Returns:
   * - Promise<QuizSet>: Created quiz set
   *
   * Throws:
   * - ApiError: When quiz creation fails
   */
  async createQuiz(data: CreateQuizRequest): Promise<QuizSet> {
    try {
      const response = await apiClient.post<QuizSet>(API_ENDPOINTS.QUIZ, data);
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Method: getQuiz
   * Description:
   * - Retrieves a quiz set by ID
   *
   * Parameters:
   * - id (string): Quiz set ID
   *
   * Returns:
   * - Promise<QuizSet>: Quiz set data
   *
   * Throws:
   * - ApiError: When quiz retrieval fails
   */
  async getQuiz(id: string): Promise<QuizSet> {
    try {
      const response = await apiClient.get<QuizSet>(API_ENDPOINTS.QUIZ_BY_ID(id));
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Method: getQuizComplete
   * Description:
   * - Retrieves a complete quiz with questions and answers
   *
   * Parameters:
   * - id (string): Quiz set ID
   *
   * Returns:
   * - Promise<QuizSetComplete>: Complete quiz data with questions and answers
   *
   * Throws:
   * - ApiError: When quiz retrieval fails
   */
  async getQuizComplete(id: string): Promise<QuizSetComplete> {
    try {
      const response = await apiClient.get<QuizSetComplete>(
        `${API_ENDPOINTS.QUIZ_BY_ID(id)}?${QUERY_PARAM_INCLUDE}=${QUERY_PARAM_QUESTIONS_ANSWERS}`,
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError?.message === ERROR_MESSAGE_ROUTE_NOT_FOUND) {
        handleApiError(apiError, { showToast: false, logToConsole: false });
      } else {
        handleApiError(apiError);
      }
      throw apiError;
    }
  }

  /**
   * Method: getQuizForEdit
   * Description:
   * - Retrieves quiz data for editing (includes all questions and answers)
   *
   * Parameters:
   * - id (string): Quiz set ID
   *
   * Returns:
   * - Promise<QuizSetComplete>: Complete quiz data for editing
   *
   * Throws:
   * - ApiError: When quiz retrieval fails
   */
  async getQuizForEdit(id: string): Promise<QuizSetComplete> {
    try {
      const response = await apiClient.get<QuizSetComplete>(
        `${API_ENDPOINTS.QUIZ_BY_ID(id)}/${PATH_SEGMENT_EDIT}`,
      );
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Method: setQuizToDraft
   * Description:
   * - Sets quiz status to draft for editing
   *
   * Parameters:
   * - id (string): Quiz set ID
   *
   * Returns:
   * - Promise<void>: No return value
   *
   * Throws:
   * - ApiError: When status update fails
   */
  async setQuizToDraft(id: string): Promise<void> {
    try {
      await apiClient.patch(`${API_ENDPOINTS.QUIZ_BY_ID(id)}/${PATH_SEGMENT_DRAFT}`, {});
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Method: saveQuizData
   * Description:
   * - Saves quiz data during editing
   *
   * Parameters:
   * - id (string): Quiz set ID
   * - data (UpdateQuizRequest): Quiz update data
   *
   * Returns:
   * - Promise<QuizSet>: Updated quiz set
   *
   * Throws:
   * - ApiError: When quiz update fails
   */
  async saveQuizData(id: string, data: UpdateQuizRequest): Promise<QuizSet> {
    try {
      const response = await apiClient.put<QuizSet>(API_ENDPOINTS.QUIZ_BY_ID(id), data);
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Method: saveQuestionsData
   * Description:
   * - Saves questions data during editing (batch operation)
   *
   * Parameters:
   * - id (string): Quiz set ID
   * - questions (CreateQuestionRequest[]): Array of questions to save
   *
   * Returns:
   * - Promise<QuestionWithAnswers[]>: Saved questions with answers
   *
   * Throws:
   * - ApiError: When questions save fails
   */
  async saveQuestionsData(
    id: string,
    questions: CreateQuestionRequest[],
  ): Promise<QuestionWithAnswers[]> {
    try {
      const response = await apiClient.post<QuestionWithAnswers[]>(
        `${API_ENDPOINTS.QUIZ_BY_ID(id)}/${PATH_SEGMENT_QUESTIONS}/${PATH_SEGMENT_BATCH}`,
        {
          [REQUEST_BODY_KEY_QUESTIONS]: questions,
        },
      );
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Method: publishEditedQuiz
   * Description:
   * - Publishes an edited quiz
   *
   * Parameters:
   * - id (string): Quiz set ID
   *
   * Returns:
   * - Promise<{ id: string; status: string; updated_at: string }>: Published quiz metadata
   *
   * Throws:
   * - ApiError: When publishing fails
   */
  async publishEditedQuiz(id: string): Promise<{ id: string; status: string; updated_at: string }> {
    try {
      const response = await apiClient.patch<{ id: string; status: string; updated_at: string }>(
        `${API_ENDPOINTS.QUIZ_BY_ID(id)}/${PATH_SEGMENT_PUBLISH}`,
        {},
      );
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Method: startEditQuiz
   * Description:
   * - Starts editing a quiz (sets status to draft)
   *
   * Parameters:
   * - id (string): Quiz set ID
   *
   * Returns:
   * - Promise<{ id: string; status: string; updated_at: string }>: Updated quiz metadata
   *
   * Throws:
   * - ApiError: When status update fails
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
   * Method: updateQuiz
   * Description:
   * - Updates an existing quiz set
   *
   * Parameters:
   * - id (string): Quiz set ID
   * - data (UpdateQuizRequest): Quiz update data
   *
   * Returns:
   * - Promise<QuizSet>: Updated quiz set
   *
   * Throws:
   * - ApiError: When quiz update fails
   */
  async updateQuiz(id: string, data: UpdateQuizRequest): Promise<QuizSet> {
    try {
      const response = await apiClient.put<QuizSet>(API_ENDPOINTS.QUIZ_BY_ID(id), data);
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Method: deleteQuiz
   * Description:
   * - Deletes a quiz set
   *
   * Parameters:
   * - id (string): Quiz set ID
   *
   * Returns:
   * - Promise<void>: No return value
   *
   * Throws:
   * - ApiError: When quiz deletion fails
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
   * Method: listQuizzes
   * Description:
   * - Lists quizzes with filtering and pagination
   *
   * Parameters:
   * - filters (QuizListRequest, optional): Filter and pagination parameters
   *
   * Returns:
   * - Promise<QuizListResponse>: Paginated quiz list response
   *
   * Throws:
   * - ApiError: When quiz list retrieval fails
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

  /**
   * Method: addQuestion
   * Description:
   * - Adds a question to a quiz
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   * - data (CreateQuestionRequest): Question creation data
   *
   * Returns:
   * - Promise<QuestionWithAnswers>: Created question with answers
   *
   * Throws:
   * - ApiError: When question creation fails
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
   * Method: updateQuestion
   * Description:
   * - Updates an existing question
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   * - questionId (string): Question ID
   * - data (UpdateQuestionRequest): Question update data
   *
   * Returns:
   * - Promise<QuestionWithAnswers>: Updated question with answers
   *
   * Throws:
   * - ApiError: When question update fails
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
   * Method: deleteQuestion
   * Description:
   * - Deletes a question from a quiz
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   * - questionId (string): Question ID
   *
   * Returns:
   * - Promise<void>: No return value
   *
   * Throws:
   * - ApiError: When question deletion fails
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
   * Method: getQuestions
   * Description:
   * - Retrieves all questions for a quiz
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   *
   * Returns:
   * - Promise<QuestionWithAnswers[]>: Array of questions with answers
   *
   * Throws:
   * - ApiError: When questions retrieval fails
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
   * Method: reorderQuestions
   * Description:
   * - Reorders questions in a quiz
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   * - questions (ReorderQuestionsRequest['questions']): Reordered question IDs
   *
   * Returns:
   * - Promise<void>: No return value
   *
   * Throws:
   * - ApiError: When reordering fails
   */
  async reorderQuestions(
    quizId: string,
    questions: ReorderQuestionsRequest['questions'],
  ): Promise<void> {
    try {
      await apiClient.put(API_ENDPOINTS.REORDER_QUESTIONS(quizId), {
        [REQUEST_BODY_KEY_QUESTIONS]: questions,
      });
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Method: addAnswer
   * Description:
   * - Adds an answer to a question
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   * - questionId (string): Question ID
   * - data (CreateAnswerRequest): Answer creation data
   *
   * Returns:
   * - Promise<Answer>: Created answer
   *
   * Throws:
   * - ApiError: When answer creation fails
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
   * Method: updateAnswer
   * Description:
   * - Updates an existing answer
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   * - questionId (string): Question ID
   * - answerId (string): Answer ID
   * - data (UpdateAnswerRequest): Answer update data
   *
   * Returns:
   * - Promise<Answer>: Updated answer
   *
   * Throws:
   * - ApiError: When answer update fails
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
   * Method: deleteAnswer
   * Description:
   * - Deletes an answer from a question
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   * - questionId (string): Question ID
   * - answerId (string): Answer ID
   *
   * Returns:
   * - Promise<void>: No return value
   *
   * Throws:
   * - ApiError: When answer deletion fails
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
   * Method: getAnswers
   * Description:
   * - Retrieves all answers for a question
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   * - questionId (string): Question ID
   *
   * Returns:
   * - Promise<Answer[]>: Array of answers
   *
   * Throws:
   * - ApiError: When answers retrieval fails
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

  /**
   * Method: isAuthenticated
   * Description:
   * - Checks if the service is authenticated
   *
   * Returns:
   * - boolean: True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Method: batchSaveQuestions
   * Description:
   * - Batch saves questions (useful for auto-save)
   * - Handles both creating new questions and updating existing ones
   * - Continues processing even if individual questions fail
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   * - questions (Array): Array of questions to save (create or update)
   *
   * Returns:
   * - Promise<QuestionWithAnswers[]>: Array of successfully saved questions
   */
  async batchSaveQuestions(
    quizId: string,
    questions: (CreateQuestionRequest | (UpdateQuestionRequest & { id: string }))[],
  ): Promise<QuestionWithAnswers[]> {
    const results: QuestionWithAnswers[] = [];

    for (const question of questions) {
      try {
        const sanitizedQuestion = this.sanitizeQuestionData(question);

        if ('id' in question && question.id) {
          const updated = await this.updateQuestion(quizId, question.id, sanitizedQuestion);
          results.push(updated);
        } else {
          const created = await this.addQuestion(
            quizId,
            sanitizedQuestion as CreateQuestionRequest,
          );
          results.push(created);
        }
      } catch (error) {
        console.error(ERROR_MESSAGE_FAILED_TO_SAVE_QUESTION, question, error);
      }
    }

    return results;
  }

  /**
   * Method: saveDraft
   * Description:
   * - Saves quiz as draft with questions
   * - Creates or updates quiz and saves associated questions
   *
   * Parameters:
   * - quizData (CreateQuizRequest | UpdateQuizRequest): Quiz data to save
   * - questions (CreateQuestionRequest[], optional): Questions to save
   *
   * Returns:
   * - Promise<{ quiz: QuizSet; questions: QuestionWithAnswers[] }>: Saved quiz and questions
   *
   * Throws:
   * - ApiError: When save operation fails
   */
  async saveDraft(
    quizData: CreateQuizRequest | (UpdateQuizRequest & { id: string }),
    questions: CreateQuestionRequest[] = [],
  ): Promise<{ quiz: QuizSet; questions: QuestionWithAnswers[] }> {
    let quiz: QuizSet;

    if ('id' in quizData && quizData.id) {
      quiz = await this.updateQuiz(quizData.id, quizData);
    } else {
      quiz = await this.createQuiz(quizData as CreateQuizRequest);
    }

    let savedQuestions: QuestionWithAnswers[] = [];
    if (questions.length > 0) {
      savedQuestions = await this.batchSaveQuestions(quiz.id, questions);
    }

    return { quiz, questions: savedQuestions };
  }

  /**
   * Method: generateQuizCode
   * Description:
   * - Generates a unique code for a quiz
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   *
   * Returns:
   * - Promise<GenerateCodeResponse>: Generated code response
   *
   * Throws:
   * - ApiError: When code generation fails
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
   * Method: checkCodeAvailability
   * Description:
   * - Checks if a code is available
   *
   * Parameters:
   * - code (number): Code to check
   *
   * Returns:
   * - Promise<CheckCodeAvailabilityResponse>: Code availability response
   *
   * Throws:
   * - ApiError: When code check fails
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
   * Method: getQuizCode
   * Description:
   * - Retrieves current quiz code
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   *
   * Returns:
   * - Promise<GetQuizCodeResponse>: Quiz code response
   *
   * Throws:
   * - ApiError: When code retrieval fails
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
   * Method: removeQuizCode
   * Description:
   * - Removes quiz code
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   *
   * Returns:
   * - Promise<RemoveCodeResponse>: Remove code response
   *
   * Throws:
   * - ApiError: When code removal fails
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
   * Method: updatePlaySettings
   * Description:
   * - Updates quiz play settings
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   * - playSettings (Partial<QuizPlaySettings>): Play settings to update
   *
   * Returns:
   * - Promise<QuizSet>: Updated quiz set
   *
   * Throws:
   * - ApiError: When settings update fails
   */
  async updatePlaySettings(
    quizId: string,
    playSettings: Partial<QuizPlaySettings>,
  ): Promise<QuizSet> {
    try {
      const response = await apiClient.put<QuizSet>(API_ENDPOINTS.QUIZ_BY_ID(quizId), {
        [REQUEST_BODY_KEY_PLAY_SETTINGS]: playSettings,
      });
      return response;
    } catch (error) {
      handleApiError(error as ApiError);
      throw error;
    }
  }

  /**
   * Method: validateQuiz
   * Description:
   * - Validates quiz before publishing
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   *
   * Returns:
   * - Promise<QuizValidationResponse>: Validation response
   *
   * Throws:
   * - ApiError: When validation fails
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
   * Method: publishQuiz
   * Description:
   * - Publishes a quiz
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   *
   * Returns:
   * - Promise<PublishResponse>: Publish response
   *
   * Throws:
   * - ApiError: When publishing fails
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
   * Method: unpublishQuiz
   * Description:
   * - Unpublishes a quiz
   *
   * Parameters:
   * - quizId (string): Quiz set ID
   *
   * Returns:
   * - Promise<UnpublishResponse>: Unpublish response
   *
   * Throws:
   * - ApiError: When unpublishing fails
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

  //----------------------------------------------------
  // 5. Helper Functions
  //----------------------------------------------------
  /**
   * Method: sanitizeQuestionData
   * Description:
   * - Sanitizes question data to ensure undefined values are converted to null
   * - Handles nested answer data sanitization
   *
   * Parameters:
   * - question: Question data to sanitize
   *
   * Returns:
   * - Sanitized question data with null values instead of undefined
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
}

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
export const quizService = new QuizService();
export type { QuizService };
