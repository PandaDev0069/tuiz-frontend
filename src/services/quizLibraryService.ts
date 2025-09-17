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
  clonedQuiz: QuizSet;
  message: string;
  originalQuiz: {
    id: string;
    title: string;
    author: string;
  };
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

    // Handle empty responses (common for DELETE operations)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Return a default success response for non-JSON responses
      return { message: 'Operation completed successfully' } as T;
    }

    // Try to parse JSON, but handle empty responses gracefully
    const text = await response.text();
    if (!text.trim()) {
      return { message: 'Operation completed successfully' } as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      console.warn('Failed to parse JSON response:', text);
      return { message: 'Operation completed successfully' } as T;
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      try {
        const sessionStr = localStorage.getItem('tuiz_session');
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
    const response = await this.makeRequest<{ data: QuizSet[]; pagination: PaginationInfo }>(
      `/quiz-library/my-library${queryString}`,
    );

    // Fetch status counts in parallel
    const statusCounts = await this.getStatusCounts();

    // Map backend response to frontend expected format
    return {
      quizzes: response.data,
      pagination: response.pagination,
      total_by_status: statusCounts,
    };
  }

  // Categories API
  async getCategories(): Promise<{ categories: Array<{ category: string; count: number }> }> {
    return this.makeRequest<{ categories: Array<{ category: string; count: number }> }>(
      '/quiz-library/categories',
    );
  }

  // Status Counts API
  async getStatusCounts(): Promise<{ all: number; published: number; draft: number }> {
    return this.makeRequest<{ all: number; published: number; draft: number }>(
      '/quiz-library/status-counts',
    );
  }

  // Public Browse API
  async getPublicQuizzes(params: PublicBrowseRequest = {}): Promise<PublicBrowseResponse> {
    const queryString = this.buildQueryString(params as Record<string, unknown>);
    const response = await this.makeRequest<{ data: QuizSet[]; pagination: PaginationInfo }>(
      `/quiz-library/public/browse${queryString}`,
    );

    // Fetch categories in parallel
    const categoriesResponse = await this.getCategories();

    // Map backend response to frontend expected format
    return {
      quizzes: response.data,
      pagination: response.pagination,
      categories: categoriesResponse.categories.map((cat) => cat.category),
    };
  }

  // Clone Quiz API
  async cloneQuiz(quizId: string): Promise<CloneQuizResponse> {
    return this.makeRequest<CloneQuizResponse>(`/quiz-library/clone/${quizId}`, {
      method: 'POST',
    });
  }

  // Delete Quiz API (for my library)
  async deleteQuiz(quizId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/quiz/${quizId}`, {
      method: 'DELETE',
    });
  }

  // Get Quiz Details API (for preview)
  async getQuizDetails(quizId: string): Promise<QuizSet> {
    return this.makeRequest<QuizSet>(`/api/quizzes/${quizId}`);
  }

  // Get Quiz Preview API (for detailed preview with questions)
  async getQuizPreview(quizId: string): Promise<QuizPreviewResponse> {
    return this.makeRequest<QuizPreviewResponse>(`/quiz-library/preview/${quizId}`);
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
}

// Create singleton instance
export const quizLibraryService = new QuizLibraryService();

// Export for use in React Query
export default quizLibraryService;
