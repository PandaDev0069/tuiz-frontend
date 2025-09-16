import { QuizSet, QuestionWithAnswers } from '@/types/quiz';
import { cfg } from '@/config/config';

// API Response Types
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
  quiz: QuizSet;
  message: string;
}

// Request Types
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

// API Error Type
export interface APIError {
  error: string;
  message?: string;
  requestId?: string;
}

class QuizLibraryService {
  private baseURL: string;

  constructor() {
    this.baseURL = cfg.apiBase;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Get auth token from localStorage (or your auth store)
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

    return response.json();
  }

  private getAuthToken(): string | null {
    // TODO: Replace with actual auth token retrieval from your auth store
    // For now, return null since we're using mock data
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('tuiz_auth_data');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          return parsed.session?.access_token || null;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

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

  // My Library API
  async getMyLibrary(params: MyLibraryRequest = {}): Promise<MyLibraryResponse> {
    const queryString = this.buildQueryString(params as Record<string, unknown>);
    return this.makeRequest<MyLibraryResponse>(`/api/quiz-library/my-library${queryString}`);
  }

  // Public Browse API
  async getPublicQuizzes(params: PublicBrowseRequest = {}): Promise<PublicBrowseResponse> {
    const queryString = this.buildQueryString(params as Record<string, unknown>);
    return this.makeRequest<PublicBrowseResponse>(`/api/quiz-library/public/browse${queryString}`);
  }

  // Clone Quiz API
  async cloneQuiz(quizId: string): Promise<CloneQuizResponse> {
    return this.makeRequest<CloneQuizResponse>(`/api/quiz-library/clone/${quizId}`, {
      method: 'POST',
    });
  }

  // Delete Quiz API (for my library)
  async deleteQuiz(quizId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/api/quizzes/${quizId}`, {
      method: 'DELETE',
    });
  }

  // Get Quiz Details API (for preview)
  async getQuizDetails(quizId: string): Promise<QuizSet> {
    return this.makeRequest<QuizSet>(`/api/quizzes/${quizId}`);
  }

  // Get Quiz Preview API (for detailed preview with questions)
  async getQuizPreview(quizId: string): Promise<QuizPreviewResponse> {
    return this.makeRequest<QuizPreviewResponse>(`/api/quiz-library/preview/${quizId}`);
  }

  // Update Quiz Status API
  async updateQuizStatus(
    quizId: string,
    status: 'draft' | 'published' | 'archived',
  ): Promise<QuizSet> {
    return this.makeRequest<QuizSet>(`/api/quizzes/${quizId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Get Categories API
  async getCategories(): Promise<string[]> {
    const response = await this.makeRequest<{ categories: string[] }>(
      '/api/quiz-library/categories',
    );
    return response.categories;
  }
}

// Create singleton instance
export const quizLibraryService = new QuizLibraryService();

// Export for use in React Query
export default quizLibraryService;
