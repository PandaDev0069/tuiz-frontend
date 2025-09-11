// src/lib/apiClient.ts
// HTTP client with authentication and error handling for TUIZ backend

import { cfg } from '@/config/config';
import { useAuthStore } from '@/state/useAuthStore';
import type { ApiError, ErrorHandlingConfig, ErrorCode } from '@/types/api';

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = cfg.apiBase;
  }

  // Get auth token from store
  private getAuthToken(): string | null {
    const { session } = useAuthStore.getState();
    return session?.access_token || null;
  }

  // Check if token is expiring soon (within 5 minutes)
  private isTokenExpiringSoon(): boolean {
    const { session } = useAuthStore.getState();
    if (!session) return false;

    const buffer = 5 * 60 * 1000; // 5 minutes buffer
    return Date.now() + buffer > session.expires_at * 1000;
  }

  // Create request headers
  private createHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle response and errors
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await this.parseError(response);
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  // Parse error from response
  private async parseError(response: Response): Promise<ApiError> {
    let errorData: Partial<ApiError>;

    try {
      errorData = await response.json();
    } catch {
      // If JSON parsing fails, create generic error
      errorData = {
        error: this.getErrorCodeFromStatus(response.status),
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      error: errorData.error || this.getErrorCodeFromStatus(response.status),
      message: errorData.message || response.statusText,
      requestId: errorData.requestId,
      details: errorData.details,
    };
  }

  // Map HTTP status codes to error codes
  private getErrorCodeFromStatus(status: number): ErrorCode {
    switch (status) {
      case 400:
        return 'invalid_payload';
      case 401:
        return 'unauthorized';
      case 403:
        return 'forbidden';
      case 404:
        return 'not_found';
      case 409:
        return 'duplicate_entry';
      case 422:
        return 'validation_failed';
      case 429:
        return 'rate_limit_exceeded';
      case 500:
      default:
        return 'server_error';
    }
  }

  // Generic request method
  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    // Check token expiration and warn
    if (this.isTokenExpiringSoon()) {
      console.warn('Auth token is expiring soon. Consider implementing token refresh.');
    }

    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      method,
      headers: this.createHeaders(options?.headers as Record<string, string>),
      ...options,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw {
          error: 'network_error',
          message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
        } as ApiError;
      }
      throw error;
    }
  }

  // ============================================================================
  // HTTP METHODS
  // ============================================================================

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T>(endpoint: string, data: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async patch<T>(endpoint: string, data: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }

  // Get base URL
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Create query string from params
  createQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    return query ? `?${query}` : '';
  }
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

// User-friendly error messages mapping
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  invalid_payload: 'フォームの内容に問題があります。入力を確認してください。',
  invalid_credentials: '認証に失敗しました。再度ログインしてください。',
  unauthorized: '認証が必要です。ログインしてください。',
  forbidden: 'この操作を実行する権限がありません。',
  not_found: '要求されたリソースが見つかりません。',
  validation_failed: '入力内容に問題があります。必要な項目を確認してください。',
  duplicate_entry: 'この項目は既に存在します。',
  rate_limit_exceeded: 'リクエストが多すぎます。しばらく待ってから再試行してください。',
  server_error: 'サーバーエラーが発生しました。しばらく待ってから再試行してください。',
  network_error: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
  timeout_error: 'リクエストがタイムアウトしました。再試行してください。',
};

// Get user-friendly error message
export function getErrorMessage(error: ApiError): string {
  return (
    ERROR_MESSAGES[error.error as ErrorCode] || error.message || '不明なエラーが発生しました。'
  );
}

// Handle API errors with optional configuration
export function handleApiError(error: ApiError, config: ErrorHandlingConfig = {}): string {
  const message = config.customMessage || getErrorMessage(error);

  if (config.showToast !== false) {
    // Import toast dynamically to avoid circular dependencies
    import('react-hot-toast').then(({ toast }) => {
      toast.error(message);
    });
  }

  // Log error for debugging (exclude in production)
  if (cfg.isDev) {
    console.error('API Error:', {
      error: error.error,
      message: error.message,
      requestId: error.requestId,
      details: error.details,
    });
  }

  return message;
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const apiClient = new ApiClient();
