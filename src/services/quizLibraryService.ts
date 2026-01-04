// ====================================================
// File Name   : quizLibraryService.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17

// Description:
// - Service class for quiz library API interactions
// - Handles fetching user's quiz library, public browse, and quiz operations
// - Manages authentication tokens and request formatting
// - Provides methods for quiz cloning, deletion, and status updates

// Notes:
// - Uses singleton pattern for service instance
// - Handles authentication via localStorage session token
// - All methods return typed promises for better type safety
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { QuizSet, QuestionWithAnswers } from '@/types/quiz';
import { cfg } from '@/config/config';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STORAGE_KEY_SESSION = 'tuiz_session';
const SUCCESS_MESSAGE_DEFAULT = 'Operation completed successfully';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface MyLibraryResponse {
  quizzes: QuizSet[];
  pagination: PaginationInfo;
  total_by_status: {
    all: number;
    published: number;
    draft: number;
  };
}

export interface PublicBrowseResponse {
  quizzes: QuizSet[];
  pagination: PaginationInfo;
  categories: string[];
}

export interface QuizPreviewResponse {
  quiz: QuizSet;
  questions: QuestionWithAnswers[];
}

export interface CloneQuizResponse {
  clonedQuiz: QuizSet;
  message: string;
  originalQuiz: {
    id: string;
    title: string;
    author: string;
  };
}

export interface MyLibraryRequest {
  page?: number;
  limit?: number;
  category?: string;
  status?: 'all' | 'published' | 'draft';
  sort?: string;
  search?: string;
}

export interface PublicBrowseRequest {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: string;
  sort?: string;
  search?: string;
}

export interface APIError {
  error: string;
  message?: string;
  requestId?: string;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Class: QuizLibraryService
 * Description:
 * - Service class for managing quiz library API operations
 * - Handles authentication, request formatting, and response parsing
 * - Provides methods for library management, browsing, and quiz operations
 */
class QuizLibraryService {
  private baseURL: string;

  /**
   * Constructor: QuizLibraryService
   * Description:
   * - Initializes the service with API base URL from configuration
   */
  constructor() {
    this.baseURL = cfg.apiBase;
  }

  /**
   * Method: getMyLibrary
   * Description:
   * - Fetches user's quiz library with optional filtering and pagination
   * - Retrieves status counts in parallel for efficient data loading
   * - Maps backend response format to frontend expected format
   *
   * Parameters:
   * - params (MyLibraryRequest): Optional query parameters for filtering and pagination
   *
   * Returns:
   * - Promise<MyLibraryResponse>: User's quiz library with pagination and status counts
   */
  async getMyLibrary(params: MyLibraryRequest = {}): Promise<MyLibraryResponse> {
    const queryString = this.buildQueryString(params as Record<string, unknown>);
    const response = await this.makeRequest<{ data: QuizSet[]; pagination: PaginationInfo }>(
      `/quiz-library/my-library${queryString}`,
    );

    const statusCounts = await this.getStatusCounts();

    return {
      quizzes: response.data,
      pagination: response.pagination,
      total_by_status: statusCounts,
    };
  }

  /**
   * Method: getCategories
   * Description:
   * - Fetches all available quiz categories with their counts
   *
   * Returns:
   * - Promise<{ categories: Array<{ category: string; count: number }> }>: Categories with counts
   */
  async getCategories(): Promise<{ categories: Array<{ category: string; count: number }> }> {
    return this.makeRequest<{ categories: Array<{ category: string; count: number }> }>(
      '/quiz-library/categories',
    );
  }

  /**
   * Method: getStatusCounts
   * Description:
   * - Fetches count of quizzes by status (all, published, draft)
   *
   * Returns:
   * - Promise<{ all: number; published: number; draft: number }>: Status counts
   */
  async getStatusCounts(): Promise<{ all: number; published: number; draft: number }> {
    return this.makeRequest<{ all: number; published: number; draft: number }>(
      '/quiz-library/status-counts',
    );
  }

  /**
   * Method: getPublicQuizzes
   * Description:
   * - Fetches public quizzes with optional filtering and pagination
   * - Retrieves categories in parallel for efficient data loading
   * - Maps backend response format to frontend expected format
   *
   * Parameters:
   * - params (PublicBrowseRequest): Optional query parameters for filtering and pagination
   *
   * Returns:
   * - Promise<PublicBrowseResponse>: Public quizzes with pagination and categories
   */
  async getPublicQuizzes(params: PublicBrowseRequest = {}): Promise<PublicBrowseResponse> {
    const queryString = this.buildQueryString(params as Record<string, unknown>);
    const response = await this.makeRequest<{ data: QuizSet[]; pagination: PaginationInfo }>(
      `/quiz-library/public/browse${queryString}`,
    );

    const categoriesResponse = await this.getCategories();

    return {
      quizzes: response.data,
      pagination: response.pagination,
      categories: categoriesResponse.categories.map((cat) => cat.category),
    };
  }

  /**
   * Method: cloneQuiz
   * Description:
   * - Clones a quiz from public browse to user's library
   *
   * Parameters:
   * - quizId (string): ID of the quiz to clone
   *
   * Returns:
   * - Promise<CloneQuizResponse>: Cloned quiz details with original quiz info
   */
  async cloneQuiz(quizId: string): Promise<CloneQuizResponse> {
    return this.makeRequest<CloneQuizResponse>(`/quiz-library/clone/${quizId}`, {
      method: 'POST',
    });
  }

  /**
   * Method: deleteQuiz
   * Description:
   * - Deletes a quiz from user's library
   *
   * Parameters:
   * - quizId (string): ID of the quiz to delete
   *
   * Returns:
   * - Promise<{ message: string }>: Success message
   */
  async deleteQuiz(quizId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/quiz/${quizId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Method: getQuizDetails
   * Description:
   * - Fetches basic quiz details by ID
   *
   * Parameters:
   * - quizId (string): ID of the quiz to fetch
   *
   * Returns:
   * - Promise<QuizSet>: Quiz details
   */
  async getQuizDetails(quizId: string): Promise<QuizSet> {
    return this.makeRequest<QuizSet>(`/api/quizzes/${quizId}`);
  }

  /**
   * Method: getQuizPreview
   * Description:
   * - Fetches detailed quiz preview with questions and answers
   *
   * Parameters:
   * - quizId (string): ID of the quiz to preview
   *
   * Returns:
   * - Promise<QuizPreviewResponse>: Quiz with questions and answers
   */
  async getQuizPreview(quizId: string): Promise<QuizPreviewResponse> {
    return this.makeRequest<QuizPreviewResponse>(`/quiz-library/preview/${quizId}`);
  }

  /**
   * Method: updateQuizStatus
   * Description:
   * - Updates the status of a quiz (draft, published, archived)
   *
   * Parameters:
   * - quizId (string): ID of the quiz to update
   * - status ('draft' | 'published' | 'archived'): New status value
   *
   * Returns:
   * - Promise<QuizSet>: Updated quiz details
   */
  async updateQuizStatus(
    quizId: string,
    status: 'draft' | 'published' | 'archived',
  ): Promise<QuizSet> {
    return this.makeRequest<QuizSet>(`/api/quizzes/${quizId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  //----------------------------------------------------
  // 5. Helper Functions
  //----------------------------------------------------
  /**
   * Method: makeRequest
   * Description:
   * - Makes authenticated HTTP requests to the API
   * - Handles authentication token injection
   * - Parses JSON responses and handles empty responses gracefully
   * - Throws errors for non-OK responses
   *
   * Parameters:
   * - endpoint (string): API endpoint path
   * - options (RequestInit): Optional fetch request options
   *
   * Returns:
   * - Promise<T>: Typed response data
   *
   * Throws:
   * - Error: When API request fails or response is not OK
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorData: APIError = await response.json().catch(() => ({
        error: 'network_error',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));

      throw new Error(errorData.message || errorData.error || 'API request failed');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { message: SUCCESS_MESSAGE_DEFAULT } as T;
    }

    const text = await response.text();
    if (!text.trim()) {
      return { message: SUCCESS_MESSAGE_DEFAULT } as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return { message: SUCCESS_MESSAGE_DEFAULT } as T;
    }
  }

  /**
   * Method: getAuthToken
   * Description:
   * - Retrieves authentication token from localStorage
   * - Safely handles browser environment and parsing errors
   *
   * Returns:
   * - string | null: Authentication token or null if not available
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      try {
        const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          return session?.access_token || null;
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Method: buildQueryString
   * Description:
   * - Builds URL query string from parameter object
   * - Filters out undefined, null, and empty string values
   *
   * Parameters:
   * - params (Record<string, unknown>): Parameters to convert to query string
   *
   * Returns:
   * - string: Query string with leading '?' or empty string
   */
  private buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
export const quizLibraryService = new QuizLibraryService();

export default quizLibraryService;
